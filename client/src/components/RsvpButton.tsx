// RsvpButton — handles all RSVP states in one component:
// - Not logged in → "Log in to RSVP" link
// - No RSVP → Attend / Maybe buttons
// - Already RSVP'd → Status badge + Cancel button
// - Event full → Disabled "Event Full" button
// Uses refetchQueries to keep the event detail page in sync after mutations
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { RSVP_TO_EVENT, CANCEL_RSVP } from '../graphql/mutations';
import { QUERY_EVENT } from '../graphql/queries';
import Auth from '../utils/auth';

interface RsvpButtonProps {
  eventId: string;
  myRsvp: { _id: string; status: string } | null;
  isFull: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  attending: 'Attending',
  maybe: 'Maybe',
  declined: 'Declined',
};

const STATUS_COLORS: Record<string, string> = {
  attending: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  maybe: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  declined: 'bg-red-400/20 text-red-300 border-red-400/30',
};

export default function RsvpButton({ eventId, myRsvp, isFull }: RsvpButtonProps) {
  const [error, setError] = useState('');
  const [rsvpToEvent, { loading: rsvpLoading }] = useMutation(RSVP_TO_EVENT, {
    refetchQueries: [{ query: QUERY_EVENT, variables: { id: eventId } }],
  });
  const [cancelRsvp, { loading: cancelLoading }] = useMutation(CANCEL_RSVP, {
    refetchQueries: [{ query: QUERY_EVENT, variables: { id: eventId } }],
  });

  const loading = rsvpLoading || cancelLoading;

  if (!Auth.loggedIn()) {
    return (
      <Link
        to="/login"
        className="inline-block bg-indigo-500 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-400 transition-colors font-medium"
      >
        Log in to RSVP
      </Link>
    );
  }

  const handleRsvp = async (status: string) => {
    setError('');
    try {
      await rsvpToEvent({ variables: { eventId, status } });
    } catch (err: any) {
      setError(err.message || 'Failed to RSVP');
    }
  };

  const handleCancel = async () => {
    setError('');
    try {
      await cancelRsvp({ variables: { eventId } });
    } catch (err: any) {
      setError(err.message || 'Failed to cancel RSVP');
    }
  };

  // Already RSVP'd — show status + cancel
  if (myRsvp) {
    const statusLabel = STATUS_LABELS[myRsvp.status] || myRsvp.status;
    const statusColor = STATUS_COLORS[myRsvp.status] || STATUS_COLORS.declined;

    return (
      <div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${statusColor}`}>
            {statusLabel}
          </span>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Canceling...' : 'Cancel RSVP'}
          </button>
        </div>
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2 mt-3">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Event is full
  if (isFull) {
    return (
      <button
        disabled
        className="bg-gray-700 text-gray-500 px-6 py-2.5 rounded-lg cursor-not-allowed font-medium"
      >
        Event Full
      </button>
    );
  }

  // No RSVP yet — show attend + maybe
  return (
    <div>
      <div className="flex gap-3">
        <button
          onClick={() => handleRsvp('attending')}
          disabled={loading}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Attend'}
        </button>
        <button
          onClick={() => handleRsvp('maybe')}
          disabled={loading}
          className="bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50"
        >
          Maybe
        </button>
      </div>
      {error && (
        <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2 mt-3">
          {error}
        </div>
      )}
    </div>
  );
}
