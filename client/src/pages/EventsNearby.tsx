import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { QUERY_EVENTS_NEAR } from '../graphql/queries';
import { geocodeAddress } from '../utils/geocode';
import { getSavedLocation, getShortName } from '../utils/location';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';

const RADIUS_OPTIONS = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

export default function EventsNearby() {
  const [saved] = useState(() => getSavedLocation());
  const [location, setLocation] = useState(() => {
    const loc = getSavedLocation();
    return loc ? getShortName(loc.displayName) : '';
  });
  const [radius, setRadius] = useState(50);
  const [category, setCategory] = useState('');
  const [geocodeError, setGeocodeError] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const autoSearched = useRef(false);

  const [searchEvents, { data, loading, called }] = useLazyQuery(QUERY_EVENTS_NEAR);

  // Auto-search on mount if we have a saved location
  useEffect(() => {
    if (saved && !autoSearched.current) {
      autoSearched.current = true;
      searchEvents({
        variables: {
          latitude: saved.lat,
          longitude: saved.lng,
          radiusKm: radius,
          category: category || undefined,
          limit: 20,
        },
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setGeocodeError('');

    if (!location.trim()) return;

    setGeocoding(true);
    const result = await geocodeAddress(location);
    setGeocoding(false);

    if (!result) {
      setGeocodeError('Could not find that location. Try a city name or zip code.');
      return;
    }

    searchEvents({
      variables: {
        latitude: result.lat,
        longitude: result.lng,
        radiusKm: radius,
        category: category || undefined,
        limit: 20,
      },
    });
  };

  const events = data?.eventsNear || [];
  const isSearching = geocoding || loading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Events Nearby</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="City, zip code, or address..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-400 transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Category filter */}
        <CategoryFilter selected={category} onChange={setCategory} />

        {geocodeError && (
          <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2">
            {geocodeError}
          </div>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">Finding events near you...</p>
        </div>
      ) : events.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : called ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found in this area. Try a larger radius or different location.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter a location above to find events near you.</p>
        </div>
      )}
    </div>
  );
}
