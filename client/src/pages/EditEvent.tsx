import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { QUERY_EVENT } from '../graphql/queries';
import { UPDATE_EVENT } from '../graphql/mutations';
import EventForm, { type EventFormData } from '../components/EventForm';
import Auth from '../utils/auth';

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = Auth.getProfile();

  const { data, loading: queryLoading } = useQuery(QUERY_EVENT, {
    variables: { id },
    skip: !id,
  });

  const [updateEvent, { loading: mutationLoading, error }] = useMutation(UPDATE_EVENT);

  if (queryLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-3">Loading event...</p>
      </div>
    );
  }

  const event = data?.event;

  // Redirect if event not found or user isn't the organizer
  if (!event || (profile && profile._id !== event.organizer._id)) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (formData: EventFormData) => {
    await updateEvent({
      variables: { id: event._id, input: formData },
    });
    navigate(`/events/${event._id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Edit Event</h1>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2 mb-6">
          {error.message}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          loading={mutationLoading}
        />
      </div>
    </div>
  );
}
