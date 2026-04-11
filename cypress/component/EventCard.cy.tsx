import EventCard from '../../client/src/components/EventCard';
import { BrowserRouter } from 'react-router-dom';
import '../../client/src/index.css';

const mockEvent = {
  _id: '1',
  title: 'Test Music Festival',
  startDate: '2026-05-15T14:00:00.000Z',
  endDate: '2026-05-15T22:00:00.000Z',
  address: 'Orlando, FL',
  category: 'Music',
  attendeeCount: 5,
  capacity: 100,
  isFull: false,
  organizer: { _id: '1', username: 'testuser' },
};

const fullEvent = {
  ...mockEvent,
  _id: '2',
  title: 'Sold Out Concert',
  isFull: true,
};

const nearbyEvent = {
  ...mockEvent,
  _id: '3',
  title: 'Nearby Event',
  distance: 3200, // 3.2 km in meters
};

describe('EventCard', () => {
  it('renders event title', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );
    cy.contains('Test Music Festival').should('be.visible');
  });

  it('renders category badge', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );
    cy.contains('Music').should('be.visible');
  });

  it('renders address', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );
    cy.contains('Orlando, FL').should('be.visible');
  });

  it('renders attendee count with capacity', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );
    cy.contains('5 / 100').should('be.visible');
  });

  it('links to event detail page', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );
    cy.get('a').should('have.attr', 'href', '/events/1');
  });

  it('shows FULL badge when event is at capacity', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={fullEvent} />
      </BrowserRouter>
    );
    cy.contains('FULL').should('be.visible');
  });

  it('shows distance when available', () => {
    cy.mount(
      <BrowserRouter>
        <EventCard event={nearbyEvent} />
      </BrowserRouter>
    );
    cy.contains('3.2 km away').should('be.visible');
  });
});
