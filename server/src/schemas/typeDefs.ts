const typeDefs = `#graphql
  type User {
    _id: ID!
    username: String!
    email: String!
    eventCount: Int!
    rsvpCount: Int!
    createdAt: String!
  }

  type Auth {
    token: String!
    user: User!
  }

  type Location {
    type: String!
    coordinates: [Float!]!
  }

  type Event {
    _id: ID!
    title: String!
    description: String!
    startDate: String!
    endDate: String!
    location: Location!
    address: String!
    venue: String
    category: String!
    capacity: Int
    isPublic: Boolean!
    organizer: User!
    attendeeCount: Int!
    isFull: Boolean!
    attendees: [RSVP!]!
    myRsvp: RSVP
    distance: Float
    createdAt: String!
  }

  type RSVP {
    _id: ID!
    event: Event!
    user: User!
    status: String!
    respondedAt: String!
  }

  input EventInput {
    title: String!
    description: String!
    startDate: String!
    endDate: String!
    coordinates: [Float!]!
    address: String!
    venue: String
    category: String!
    capacity: Int
    isPublic: Boolean
  }

  input UpdateEventInput {
    title: String
    description: String
    startDate: String
    endDate: String
    coordinates: [Float!]
    address: String
    venue: String
    category: String
    capacity: Int
    isPublic: Boolean
  }

  type Query {
    me: User
    events(category: String, search: String, limit: Int, offset: Int): [Event!]!
    event(id: ID!): Event
    eventsNear(
      latitude: Float!
      longitude: Float!
      radiusKm: Float
      category: String
      limit: Int
    ): [Event!]!
    myEvents: [Event!]!
    myRsvps: [RSVP!]!
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): Auth!
    login(email: String!, password: String!): Auth!
    createEvent(input: EventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Event!
    rsvpToEvent(eventId: ID!, status: String!): RSVP!
    cancelRsvp(eventId: ID!): RSVP!
  }
`;

export default typeDefs;
