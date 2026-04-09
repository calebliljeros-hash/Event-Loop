import { gql } from '@apollo/client';

export const SIGNUP = gql`
  mutation Signup($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      _id
      title
      startDate
      endDate
      address
      category
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      _id
      title
      startDate
      endDate
      address
      category
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      _id
    }
  }
`;

export const RSVP_TO_EVENT = gql`
  mutation RsvpToEvent($eventId: ID!, $status: String!) {
    rsvpToEvent(eventId: $eventId, status: $status) {
      _id
      status
    }
  }
`;

export const CANCEL_RSVP = gql`
  mutation CancelRsvp($eventId: ID!) {
    cancelRsvp(eventId: $eventId) {
      _id
    }
  }
`;
