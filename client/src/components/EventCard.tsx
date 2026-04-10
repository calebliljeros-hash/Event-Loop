import { Link } from 'react-router-dom';

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

const BADGE_COLORS: Record<string, string> = {
  Social: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Conference: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Music: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Sports: 'bg-green-500/20 text-green-300 border-green-500/30',
  Workshop: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Networking: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Food & Drink': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Arts: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export function getCategoryBadge(category: string) {
  return BADGE_COLORS[category] || BADGE_COLORS.Other;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
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
      className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all block"
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
