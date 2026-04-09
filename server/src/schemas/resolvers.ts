import { GraphQLError } from 'graphql';
import { User, Event, Rsvp } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

interface Context {
  user: { _id: string; username: string; email: string } | null;
}

const resolvers = {
  // ─── FIELD RESOLVERS ───────────────────────────────────────
  // These resolve computed fields on types

  User: {
    eventCount: async (parent: any) => {
      return Event.countDocuments({ organizer: parent._id });
    },
    rsvpCount: async (parent: any) => {
      return Rsvp.countDocuments({ user: parent._id });
    },
  },

  Event: {
    organizer: async (parent: any) => {
      return User.findById(parent.organizer);
    },
    attendeeCount: async (parent: any) => {
      return Rsvp.countDocuments({ event: parent._id, status: 'attending' });
    },
    isFull: async (parent: any) => {
      if (!parent.capacity) return false;
      const count = await Rsvp.countDocuments({ event: parent._id, status: 'attending' });
      return count >= parent.capacity;
    },
    attendees: async (parent: any) => {
      return Rsvp.find({ event: parent._id, status: 'attending' }).populate('user');
    },
    myRsvp: async (parent: any, _args: any, context: Context) => {
      if (!context.user) return null;
      return Rsvp.findOne({ event: parent._id, user: context.user._id });
    },
  },

  RSVP: {
    event: async (parent: any) => {
      return Event.findById(parent.event);
    },
    user: async (parent: any) => {
      return User.findById(parent.user);
    },
  },

  // ─── QUERIES ───────────────────────────────────────────────

  Query: {
    // Get current logged-in user
    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) throw new AuthenticationError();
      return User.findById(context.user._id);
    },

    // Browse events with optional filters
    events: async (_parent: any, args: { category?: string; search?: string; limit?: number; offset?: number }) => {
      const query: any = { isPublic: true };

      if (args.category) {
        query.category = args.category;
      }

      // Text search on title and description
      if (args.search) {
        query.$text = { $search: args.search };
      }

      return Event.find(query)
        .sort({ startDate: 1 })
        .skip(args.offset || 0)
        .limit(args.limit || 20);
    },

    // Get single event by ID
    event: async (_parent: any, args: { id: string }) => {
      return Event.findById(args.id);
    },

    // Geospatial: find events near coordinates
    eventsNear: async (_parent: any, args: {
      latitude: number;
      longitude: number;
      radiusKm?: number;
      category?: string;
      limit?: number;
    }) => {
      const radiusMeters = (args.radiusKm || 50) * 1000;
      const matchConditions: any = { isPublic: true };

      if (args.category) {
        matchConditions.category = args.category;
      }

      // $geoNear MUST be the first stage in the pipeline
      return Event.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [args.longitude, args.latitude], // [lng, lat]
            },
            distanceField: 'distance',
            maxDistance: radiusMeters,
            spherical: true,
            query: matchConditions,
          },
        },
        { $limit: args.limit || 20 },
        { $sort: { distance: 1 } },
      ]);
    },

    // Events created by current user
    myEvents: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) throw new AuthenticationError();
      return Event.find({ organizer: context.user._id }).sort({ startDate: -1 });
    },

    // RSVPs by current user
    myRsvps: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) throw new AuthenticationError();
      return Rsvp.find({ user: context.user._id }).populate('event');
    },
  },

  // ─── MUTATIONS ─────────────────────────────────────────────

  Mutation: {
    // Create new user account
    signup: async (_parent: any, args: { username: string; email: string; password: string }) => {
      const user = await User.create(args);
      const token = signToken({ _id: user._id.toString(), username: user.username, email: user.email });
      return { token, user };
    },

    // Log in existing user
    login: async (_parent: any, args: { email: string; password: string }) => {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }
      const correctPw = await user.isCorrectPassword(args.password);
      if (!correctPw) {
        throw new AuthenticationError('Invalid email or password');
      }
      const token = signToken({ _id: user._id.toString(), username: user.username, email: user.email });
      return { token, user };
    },

    // Create event (auth required)
    createEvent: async (_parent: any, args: { input: any }, context: Context) => {
      if (!context.user) throw new AuthenticationError();

      const { coordinates, ...eventData } = args.input;
      const event = await Event.create({
        ...eventData,
        location: {
          type: 'Point',
          coordinates, // [longitude, latitude] from client
        },
        organizer: context.user._id,
      });

      return event;
    },

    // Update event (auth + ownership required)
    updateEvent: async (_parent: any, args: { id: string; input: any }, context: Context) => {
      if (!context.user) throw new AuthenticationError();

      const event = await Event.findById(args.id);
      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }
      if (event.organizer.toString() !== context.user._id) {
        throw new GraphQLError('Not authorized to edit this event', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const { coordinates, ...updateData } = args.input;
      if (coordinates) {
        (updateData as any).location = { type: 'Point', coordinates };
      }

      return Event.findByIdAndUpdate(args.id, updateData, { new: true, runValidators: true });
    },

    // Delete event (auth + ownership required)
    deleteEvent: async (_parent: any, args: { id: string }, context: Context) => {
      if (!context.user) throw new AuthenticationError();

      const event = await Event.findById(args.id);
      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }
      if (event.organizer.toString() !== context.user._id) {
        throw new GraphQLError('Not authorized to delete this event', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Delete event and all associated RSVPs
      await Rsvp.deleteMany({ event: args.id });
      return Event.findByIdAndDelete(args.id);
    },

    // RSVP to an event (auth required, upsert pattern)
    rsvpToEvent: async (_parent: any, args: { eventId: string; status: string }, context: Context) => {
      if (!context.user) throw new AuthenticationError();

      const event = await Event.findById(args.eventId);
      if (!event) {
        throw new GraphQLError('Event not found', { extensions: { code: 'NOT_FOUND' } });
      }

      // Check capacity if RSVPing as attending
      if (args.status === 'attending' && event.capacity) {
        const currentCount = await Rsvp.countDocuments({
          event: args.eventId,
          status: 'attending',
          user: { $ne: context.user._id }, // exclude self (may be updating existing)
        });
        if (currentCount >= event.capacity) {
          throw new GraphQLError('Event is at full capacity', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      // Upsert: create or update in one atomic operation
      return Rsvp.findOneAndUpdate(
        { event: args.eventId, user: context.user._id },
        { status: args.status, respondedAt: new Date() },
        { upsert: true, new: true, runValidators: true }
      );
    },

    // Cancel RSVP (auth required)
    cancelRsvp: async (_parent: any, args: { eventId: string }, context: Context) => {
      if (!context.user) throw new AuthenticationError();

      const rsvp = await Rsvp.findOneAndDelete({
        event: args.eventId,
        user: context.user._id,
      });

      if (!rsvp) {
        throw new GraphQLError('RSVP not found', { extensions: { code: 'NOT_FOUND' } });
      }

      return rsvp;
    },
  },
};

export default resolvers;
