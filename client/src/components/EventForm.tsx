import { useState, type FormEvent } from 'react';
import { geocodeAddress } from '../utils/geocode';
import { parseDate } from '../utils/date';
import { CATEGORIES } from '../utils/categories';

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  coordinates: [number, number];
  address: string;
  venue: string;
  category: string;
  capacity: number | null;
  isPublic: boolean;
}

interface EventFormProps {
  initialData?: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    address: string;
    venue?: string | null;
    category: string;
    capacity?: number | null;
    isPublic: boolean;
    location?: { coordinates: [number, number] };
  };
  onSubmit: (data: EventFormData) => void;
  loading: boolean;
}

function toDatetimeLocal(isoString: string): string {
  const date = parseDate(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EventForm({ initialData, onSubmit, loading }: EventFormProps) {
  const [formState, setFormState] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate ? toDatetimeLocal(initialData.startDate) : '',
    endDate: initialData?.endDate ? toDatetimeLocal(initialData.endDate) : '',
    address: initialData?.address || '',
    venue: initialData?.venue || '',
    category: initialData?.category || '',
    capacity: initialData?.capacity?.toString() || '',
    isPublic: initialData?.isPublic ?? true,
  });
  const [geocodeError, setGeocodeError] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormState({ ...formState, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormState({ ...formState, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeocodeError('');

    if (new Date(formState.endDate) <= new Date(formState.startDate)) {
      setGeocodeError('End date must be after start date');
      return;
    }

    setGeocoding(true);

    // If address hasn't changed and we have existing coordinates, reuse them
    let coordinates: [number, number] | null = null;
    if (initialData?.address === formState.address && initialData?.location?.coordinates) {
      coordinates = initialData.location.coordinates;
    } else {
      const result = await geocodeAddress(formState.address);
      if (!result) {
        setGeocodeError('Could not find that address. Try being more specific (e.g., "Orlando, FL").');
        setGeocoding(false);
        return;
      }
      coordinates = [result.lng, result.lat]; // [longitude, latitude] for GeoJSON
    }

    setGeocoding(false);

    onSubmit({
      title: formState.title,
      description: formState.description,
      startDate: new Date(formState.startDate).toISOString(),
      endDate: new Date(formState.endDate).toISOString(),
      coordinates,
      address: formState.address,
      venue: formState.venue,
      category: formState.category,
      capacity: formState.capacity ? parseInt(formState.capacity) : null,
      isPublic: formState.isPublic,
    });
  };

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input
          type="text"
          name="title"
          required
          maxLength={100}
          placeholder="Event title"
          value={formState.title}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          name="description"
          required
          maxLength={2000}
          rows={4}
          placeholder="What's this event about?"
          value={formState.description}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Start Date & Time</label>
          <input
            type="datetime-local"
            name="startDate"
            required
            value={formState.startDate}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">End Date & Time</label>
          <input
            type="datetime-local"
            name="endDate"
            required
            value={formState.endDate}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
          <input
            type="text"
            name="address"
            required
            placeholder="City, State or full address"
            value={formState.address}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Venue (optional)</label>
          <input
            type="text"
            name="venue"
            placeholder="Venue name"
            value={formState.venue}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select
            name="category"
            required
            value={formState.category}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Capacity (optional)</label>
          <input
            type="number"
            name="capacity"
            min="1"
            placeholder="Leave empty for unlimited"
            value={formState.capacity}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublic"
          id="isPublic"
          checked={formState.isPublic}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-300">
          Public event (visible to everyone)
        </label>
      </div>

      {geocodeError && (
        <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2">
          {geocodeError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || geocoding}
        className="w-full bg-indigo-500 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {geocoding ? 'Finding location...' : loading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
      </button>
    </form>
  );
}
