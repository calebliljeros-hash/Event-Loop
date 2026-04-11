// EventCard — reusable card component used across Home, Events, and nearby results
// Displays category badge, title, date range, address, attendee count, and optional distance
// Handles three visual states: normal, full (FULL badge), and nearby (distance in km)
import { Link } from 'react-router-dom';
import { parseDate } from '../utils/date';
import { getCategoryBadge } from '../utils/categories';

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    address: string;
    category: string;
    attendeeCount: number;
    capacity?: number | null;
    isFull: boolean;
    distance?: number | null;
    organizer: {
      _id: string;
      username: string;
    };
  };
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', opts);

  // Same day — just show one date
  if (startStr === endStr) return startStr;

  // Same year — omit year from start
  if (start.getFullYear() === end.getFullYear()) {
    const shortStart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${shortStart} - ${endStr}`;
  }

  return `${startStr} - ${endStr}`;
}

export default function EventCard({ event }: EventCardProps) {
  const badgeClasses = getCategoryBadge(event.category);
  const capacityText = event.capacity
    ? `${event.attendeeCount} / ${event.capacity}`
    : `${event.attendeeCount} attending`;

  return (
    <Link
      to={`/events/${event._id}`}
      className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 hover:bg-gray-900/80 transition-all block focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeClasses}`}>
          {event.category}
        </span>
        {event.isFull ? (
          <span className="text-sm text-red-400 font-medium">FULL</span>
        ) : (
          <span className="text-sm text-gray-500">{capacityText}</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{formatDateRange(event.startDate, event.endDate)}</p>
      <p className="text-sm text-gray-400">{event.address}</p>
      {event.distance != null && (
        <p className="text-sm text-indigo-400 mt-2">{(event.distance / 1000).toFixed(1)} km away</p>
      )}
    </Link>
  );
}
