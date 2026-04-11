// Dashboard — user's personal hub with two tabs:
// "My Events" shows events they organized (with edit/delete actions)
// "My RSVPs" shows events they've RSVP'd to (with status badges)
// Both queries fire on mount so tab switching is instant (data is pre-cached)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { QUERY_MY_EVENTS, QUERY_MY_RSVPS } from '../graphql/queries';
import { DELETE_EVENT } from '../graphql/mutations';
import { getCategoryBadge } from '../utils/categories';
import { parseDate } from '../utils/date';

type Tab = 'events' | 'rsvps';

function formatShortDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('events');

  const { data: eventsData, loading: eventsLoading } = useQuery(QUERY_MY_EVENTS);
  const { data: rsvpsData, loading: rsvpsLoading } = useQuery(QUERY_MY_RSVPS);
  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: [{ query: QUERY_MY_EVENTS }],
  });

  const handleDelete = async (eventId: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deleteEvent({ variables: { id: eventId } });
    }
  };

  const myEvents = eventsData?.myEvents || [];
  const myRsvps = rsvpsData?.myRsvps || [];

  const statusColors: Record<string, string> = {
    attending: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
    maybe: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    declined: 'bg-red-400/20 text-red-300 border-red-400/30',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Link
          to="/create-event"
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-400 transition-colors text-sm"
        >
          + Create Event
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 max-w-xs border border-gray-800">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-gray-800 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          My Events
        </button>
        <button
          onClick={() => setActiveTab('rsvps')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            activeTab === 'rsvps'
              ? 'bg-gray-800 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          My RSVPs
        </button>
      </div>

      {/* My Events Tab */}
      {activeTab === 'events' && (
        <>
          {eventsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3">Loading your events...</p>
            </div>
          ) : myEvents.length ? (
            <div className="space-y-3">
              {myEvents.map((event: any) => {
                const badgeClasses = getCategoryBadge(event.category);
                const capacityText = event.capacity
                  ? `${event.attendeeCount} / ${event.capacity}`
                  : `${event.attendeeCount} attending`;

                return (
                  <div
                    key={event._id}
                    className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses}`}>
                          {event.category}
                        </span>
                        <Link to={`/events/${event._id}`} className="font-semibold text-white hover:text-indigo-400 transition-colors">
                          {event.title}
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatShortDate(event.startDate)} &middot; {event.address} &middot; {capacityText}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/edit-event/${event._id}`}
                        className="border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-800 text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id, event.title)}
                        className="bg-red-400 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
              <Link
                to="/create-event"
                className="text-indigo-400 hover:underline"
              >
                Create your first event &rarr;
              </Link>
            </div>
          )}
        </>
      )}

      {/* My RSVPs Tab */}
      {activeTab === 'rsvps' && (
        <>
          {rsvpsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-3">Loading your RSVPs...</p>
            </div>
          ) : myRsvps.length ? (
            <div className="space-y-3">
              {myRsvps.map((rsvp: any) => {
                const badgeClasses = getCategoryBadge(rsvp.event.category);
                const statusClass = statusColors[rsvp.status] || statusColors.declined;

                return (
                  <div
                    key={rsvp._id}
                    className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses}`}>
                          {rsvp.event.category}
                        </span>
                        <Link to={`/events/${rsvp.event._id}`} className="font-semibold text-white hover:text-indigo-400 transition-colors">
                          {rsvp.event.title}
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatShortDate(rsvp.event.startDate)} &middot; {rsvp.event.address}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border shrink-0 w-fit ${statusClass}`}>
                      {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't RSVP'd to any events yet.</p>
              <Link
                to="/events"
                className="text-indigo-400 hover:underline"
              >
                Browse events &rarr;
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
