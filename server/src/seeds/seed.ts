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

    // Find caleb's user (last in the array)
    const calebUser = createdUsers.find((u) => u.username === 'caleb');

    // Map user references into events (round-robin assignment)
    // Caleb's events (last 4) are explicitly assigned to caleb
    const calebEventCount = 4;
    const sharedEvents = events.slice(0, -calebEventCount);
    const calebEvents = events.slice(-calebEventCount);

    const eventsWithOrganizers = [
      ...sharedEvents.map((event, index) => ({
        ...event,
        organizer: createdUsers[index % createdUsers.length]._id,
      })),
      ...calebEvents.map((event) => ({
        ...event,
        organizer: calebUser!._id,
      })),
    ];

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
