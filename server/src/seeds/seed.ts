import db from '../config/connection.js';
import { User, Event, Rsvp } from '../models/index.js';
import { users, events, rsvps } from './seedData.js';

db.once('open', async () => {
  try {
    // Clean existing data
    await Rsvp.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});

    // IMPORTANT: Use User.create() NOT User.insertMany()
    // create() triggers the pre-save hook that hashes passwords
    // insertMany() bypasses middleware — passwords would be stored as plaintext
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users`);

    // Map user references into events (round-robin assignment)
    const eventsWithOrganizers = events.map((event, index) => ({
      ...event,
      organizer: createdUsers[index % createdUsers.length]._id,
    }));

    const createdEvents = await Event.insertMany(eventsWithOrganizers);
    console.log(`Seeded ${createdEvents.length} events`);

    // Map user/event references into RSVPs
    // Offset user index by 1 so users don't RSVP to their own events
    const rsvpsWithRefs = rsvps.map((rsvp, index) => ({
      ...rsvp,
      user: createdUsers[(index + 1) % createdUsers.length]._id,
      event: createdEvents[index % createdEvents.length]._id,
    }));

    const createdRsvps = await Rsvp.insertMany(rsvpsWithRefs);
    console.log(`Seeded ${createdRsvps.length} rsvps`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
});
