import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { CREATE_EVENT } from '../graphql/mutations';
import EventForm, { type EventFormData } from '../components/EventForm';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [createEvent, { loading, error }] = useMutation(CREATE_EVENT);

  const handleSubmit = async (data: EventFormData) => {
    const { data: result } = await createEvent({
      variables: { input: data },
    });
    if (result?.createEvent?._id) {
      navigate(`/events/${result.createEvent._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Create Event</h1>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2 mb-6">
          {error.message}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <EventForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
