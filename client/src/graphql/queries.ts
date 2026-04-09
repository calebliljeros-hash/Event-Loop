import { gql } from '@apollo/client';

export const QUERY_ME = gql`
  query Me {
    me {
      _id
      username
      email
      eventCount
      rsvpCount
    }
  }
`;

export const QUERY_EVENTS = gql`
  query Events($category: String, $search: String, $limit: Int, $offset: Int) {
    events(category: $category, search: $search, limit: $limit, offset: $offset) {
      _id
      title
      description
      startDate
      endDate
      address
      venue
      category
      capacity
      attendeeCount
      isFull
      organizer {
        _id
        username
      }
    }
  }
`;

export const QUERY_EVENT = gql`
  query Event($id: ID!) {
    event(id: $id) {
      _id
      title
      description
      startDate
      endDate
      location {
        coordinates
      }
      address
      venue
      category
      capacity
      isPublic
      attendeeCount
      isFull
      organizer {
        _id
        username
      }
      attendees {
        _id
        user {
          _id
          username
        }
        status
      }
      myRsvp {
        _id
        status
      }
    }
  }
`;

export const QUERY_EVENTS_NEAR = gql`
  query EventsNear($latitude: Float!, $longitude: Float!, $radiusKm: Float, $category: String, $limit: Int) {
    eventsNear(latitude: $latitude, longitude: $longitude, radiusKm: $radiusKm, category: $category, limit: $limit) {
      _id
      title
      description
      startDate
      endDate
      address
      venue
      category
      capacity
      attendeeCount
      isFull
      distance
      organizer {
        _id
        username
      }
    }
  }
`;

export const QUERY_MY_EVENTS = gql`
  query MyEvents {
    myEvents {
      _id
      title
      startDate
      endDate
      address
      category
      attendeeCount
      capacity
    }
  }
`;

export const QUERY_MY_RSVPS = gql`
  query MyRsvps {
    myRsvps {
      _id
      status
      respondedAt
      event {
        _id
        title
        startDate
        endDate
        address
        category
      }
    }
  }
`;
