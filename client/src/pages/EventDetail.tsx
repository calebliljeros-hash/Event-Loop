// Event detail page — shows full event info with conditional rendering:
// - Organizer sees Edit/Delete buttons
// - Other users see RSVP buttons (Attend/Maybe/Cancel)
// - Private events return null for non-organizers (handled by server resolver)
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parseDate } from '../utils/date';
import { useQuery, useMutation } from '@apollo/client/react';
import { QUERY_EVENT, QUERY_MY_EVENTS, QUERY_EVENTS } from '../graphql/queries';
import { DELETE_EVENT } from '../graphql/mutations';
import { getCategoryBadge } from '../utils/categories';
import RsvpButton from '../components/RsvpButton';
import Auth from '../utils/auth';

function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    const dateStr = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr}, ${startTime} - ${endTime}`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = Auth.getProfile();

  const { data, loading, error } = useQuery(QUERY_EVENT, {
    variables: { id },
    skip: !id,
  });

  const [deleteEvent, { loading: deleting }] = useMutation(DELETE_EVENT, {
    refetchQueries: [{ query: QUERY_MY_EVENTS }, { query: QUERY_EVENTS }],
    onCompleted: () => navigate('/dashboard'),
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-3">Loading event...</p>
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-gray-500 mb-4">This event may have been removed or doesn't exist.</p>
        <Link to="/events" className="text-indigo-400 hover:underline">
          Browse events &rarr;
        </Link>
      </div>
    );
  }

  const event = data.event;
  const isOrganizer = profile && profile._id === event.organizer._id;
  const badgeClasses = getCategoryBadge(event.category);
  const capacityText = event.capacity
    ? `${event.attendeeCount} / ${event.capacity} attending`
    : `${event.attendeeCount} attending`;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      deleteEvent({ variables: { id: event._id } });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeClasses}`}>
            {event.category}
          </span>
          <span className="text-sm text-gray-500">
            Organized by{' '}
            <span className="font-medium text-gray-300">{event.organizer.username}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-6 text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.venue ? `${event.venue}, ${event.address}` : event.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{capacityText}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-8 leading-relaxed whitespace-pre-line">{event.description}</p>

        {/* Actions */}
        <div className="mb-8">
          {isOrganizer ? (
            <div className="flex gap-3">
              <Link
                to={`/edit-event/${event._id}`}
                className="border border-gray-700 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Edit Event
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-400 text-white px-6 py-2.5 rounded-lg hover:bg-red-500 transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          ) : (
            <RsvpButton
              eventId={event._id}
              myRsvp={event.myRsvp}
              isFull={event.isFull}
            />
          )}
        </div>

        {/* Attendees */}
        {event.attendees?.length > 0 && (
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Attendees ({event.attendees.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((rsvp: any) => (
                <span
                  key={rsvp._id}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                >
                  {rsvp.user.username}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
