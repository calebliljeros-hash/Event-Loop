// Home page — the landing page with hero search, category grid, and event previews
// Location-aware: when the user sets a location (via text input or browser geolocation),
// it saves to localStorage and switches from generic "Upcoming Events" to "Events Near [City]"
// using a two-query strategy: useQuery for generic, useLazyQuery for nearby
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { QUERY_EVENTS, QUERY_EVENTS_NEAR } from '../graphql/queries';
import { geocodeAddress, reverseGeocode } from '../utils/geocode';
import { getSavedLocation, saveLocation, clearLocation, getShortName, type SavedLocation } from '../utils/location';
import EventCard from '../components/EventCard';

const CATEGORY_ITEMS = [
  { name: 'Social', emoji: '\u{1F389}' },
  { name: 'Conference', emoji: '\u{1F393}' },
  { name: 'Music', emoji: '\u{1F3B5}' },
  { name: 'Sports', emoji: '\u26BD' },
  { name: 'Workshop', emoji: '\u{1F6E0}' },
  { name: 'Networking', emoji: '\u{1F91D}' },
  { name: 'Food & Drink', emoji: '\u{1F374}' },
  { name: 'Arts', emoji: '\u{1F3A8}' },
  { name: 'Other', emoji: '\u2728' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Location state
  const [savedLoc, setSavedLoc] = useState<SavedLocation | null>(() => getSavedLocation());
  const [locationInput, setLocationInput] = useState('');
  const [showLocationBar, setShowLocationBar] = useState(!getSavedLocation());
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Generic events query (when no location)
  const { data: defaultData, loading: defaultLoading, error: defaultError } = useQuery(QUERY_EVENTS, {
    variables: { limit: 6 },
    skip: !!savedLoc,
  });

  // Nearby events query (when location is set)
  const [fetchNear, { data: nearData, loading: nearLoading, error: nearError }] = useLazyQuery(QUERY_EVENTS_NEAR);

  // Fire nearby query when location changes
  useEffect(() => {
    if (savedLoc) {
      fetchNear({
        variables: {
          latitude: savedLoc.lat,
          longitude: savedLoc.lng,
          radiusKm: 50,
          limit: 6,
        },
      });
    }
  }, [savedLoc, fetchNear]);

  // Unified rendering variables
  const events = savedLoc ? (nearData?.eventsNear || []) : (defaultData?.events || []);
  const eventsLoading = savedLoc ? nearLoading : defaultLoading;
  const eventsError = savedLoc ? nearError : defaultError;

  // Search handler (hero section)
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // Location text input handler
  const handleLocationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setGeoError('');
    setGeocoding(true);
    const result = await geocodeAddress(locationInput);
    setGeocoding(false);

    if (!result) {
      setGeoError('Could not find that location. Try a city name or zip code.');
      return;
    }

    const loc: SavedLocation = { lat: result.lat, lng: result.lng, displayName: result.displayName };
    saveLocation(loc);
    setSavedLoc(loc);
    setShowLocationBar(false);
    setLocationInput('');
  };

  // Browser geolocation handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeocoding(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const displayName = await reverseGeocode(latitude, longitude);
        const loc: SavedLocation = { lat: latitude, lng: longitude, displayName };
        saveLocation(loc);
        setSavedLoc(loc);
        setShowLocationBar(false);
        setGeocoding(false);
      },
      (err) => {
        setGeocoding(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. You can type a city name instead.');
        } else {
          setGeoError('Could not get your location. Try typing a city name.');
        }
      },
      { timeout: 10000 }
    );
  };

  // Clear saved location
  const handleClearLocation = () => {
    clearLocation();
    setSavedLoc(null);
    setShowLocationBar(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Next Event</h1>
          <p className="text-xl text-indigo-200 mb-8">
            Discover events near you, RSVP, and connect with your community
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:ring-2 focus:ring-white focus:bg-white/15 outline-none backdrop-blur-sm"
            />
            <button
              type="submit"
              className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {CATEGORY_ITEMS.map((cat) => (
            <Link
              key={cat.name}
              to={`/events?category=${encodeURIComponent(cat.name)}`}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center hover:border-gray-700 transition-all"
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-sm font-medium text-gray-300">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Location Banner */}
      {showLocationBar && !savedLoc && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Map pin icon + label */}
              <div className="flex items-center gap-2 shrink-0">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300 text-sm font-medium">See events near you</span>
              </div>

              {/* Input + buttons */}
              <form onSubmit={handleLocationSubmit} className="flex flex-1 gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="City, zip code, or address..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={geocoding}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-400 transition-colors text-sm font-medium disabled:opacity-50 shrink-0"
                >
                  {geocoding ? '...' : 'Go'}
                </button>
              </form>

              {/* Use my location + dismiss */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={geocoding}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  Use my location
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationBar(false)}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                  aria-label="Dismiss location banner"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {geoError && (
              <p className="text-red-400 text-sm mt-2">{geoError}</p>
            )}
          </div>
        </section>
      )}

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              {savedLoc ? `Events Near ${getShortName(savedLoc.displayName)}` : 'Upcoming Events'}
            </h2>
            {savedLoc && (
              <button
                onClick={handleClearLocation}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                title="Change or remove location"
              >
                (change)
              </button>
            )}
          </div>
          <Link
            to={savedLoc ? '/events?nearby=1' : '/events'}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {eventsError ? (
          <div className="text-center py-12">
            <p className="text-red-300">Something went wrong loading events.</p>
          </div>
        ) : eventsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3">Loading events...</p>
          </div>
        ) : events.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {savedLoc ? (
                <>
                  No events found near {getShortName(savedLoc.displayName)}.{' '}
                  <Link to="/events" className="text-indigo-400 hover:text-indigo-300">
                    Browse all events
                  </Link>
                </>
              ) : (
                'No upcoming events yet. Be the first to create one!'
              )}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
