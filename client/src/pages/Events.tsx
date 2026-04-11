// Unified Events page — combines "Browse All" and "Near Me" into one page
// with a toggle switch. Browse mode uses text search + pagination (QUERY_EVENTS),
// Nearby mode uses geospatial search with radius (QUERY_EVENTS_NEAR).
// Category filtering works in both modes. URL params drive initial state.
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { QUERY_EVENTS, QUERY_EVENTS_NEAR } from '../graphql/queries';
import { geocodeAddress } from '../utils/geocode';
import { getSavedLocation, getShortName, type SavedLocation } from '../utils/location';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';

const PAGE_SIZE = 12;
const RADIUS_OPTIONS = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Shared state
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const [category, setCategory] = useState(initialCategory);

  // Mode state
  const [savedLoc] = useState<SavedLocation | null>(() => getSavedLocation());
  const [nearbyMode, setNearbyMode] = useState(
    () => searchParams.get('nearby') === '1'
  );

  // Browse mode state
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [offset, setOffset] = useState(0);

  // Nearby mode state
  const [locationInput, setLocationInput] = useState(() => {
    const loc = getSavedLocation();
    return loc ? getShortName(loc.displayName) : '';
  });
  const [radius, setRadius] = useState(50);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const coordsRef = useRef<{ lat: number; lng: number } | null>(
    savedLoc ? { lat: savedLoc.lat, lng: savedLoc.lng } : null
  );
  const autoSearched = useRef(false);

  // ─── Queries ───────────────────────────────────────────
  const { data: browseData, loading: browseLoading, error: browseError, fetchMore } = useQuery(QUERY_EVENTS, {
    variables: {
      category: category || undefined,
      search: activeSearch || undefined,
      limit: PAGE_SIZE,
      offset: 0,
    },
    skip: nearbyMode,
  });

  const [searchNearby, { data: nearData, loading: nearLoading, error: nearError, called: nearCalled }] = useLazyQuery(QUERY_EVENTS_NEAR);

  // Auto-search on mount if nearby mode with saved location
  useEffect(() => {
    if (nearbyMode && savedLoc && !autoSearched.current) {
      autoSearched.current = true;
      searchNearby({
        variables: {
          latitude: savedLoc.lat,
          longitude: savedLoc.lng,
          radiusKm: radius,
          category: category || undefined,
          limit: 20,
        },
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Unified rendering variables
  const events = nearbyMode ? (nearData?.eventsNear || []) : (browseData?.events || []);
  const loading = nearbyMode ? nearLoading : browseLoading;
  const error = nearbyMode ? nearError : browseError;

  // ─── Mode switching ────────────────────────────────────
  const switchToBrowse = () => {
    setNearbyMode(false);
    setOffset(0);
    setGeocodeError('');
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (activeSearch) params.search = activeSearch;
    setSearchParams(params);
  };

  const switchToNearby = () => {
    setNearbyMode(true);
    setActiveSearch('');
    setSearchInput('');
    const params: Record<string, string> = {};
    if (category) params.category = category;
    params.nearby = '1';
    setSearchParams(params);

    // Auto-fire if we have coordinates
    if (coordsRef.current) {
      searchNearby({
        variables: {
          latitude: coordsRef.current.lat,
          longitude: coordsRef.current.lng,
          radiusKm: radius,
          category: category || undefined,
          limit: 20,
        },
      });
    }
  };

  // ─── Handlers ──────────────────────────────────────────

  // Category change (works in both modes)
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);

    if (nearbyMode) {
      // Re-fire nearby query with new category if we have coordinates
      if (coordsRef.current) {
        searchNearby({
          variables: {
            latitude: coordsRef.current.lat,
            longitude: coordsRef.current.lng,
            radiusKm: radius,
            category: newCategory || undefined,
            limit: 20,
          },
        });
      }
      // Update URL params for nearby mode
      const params: Record<string, string> = { nearby: '1' };
      if (newCategory) params.category = newCategory;
      setSearchParams(params);
    } else {
      setOffset(0);
      const params: Record<string, string> = {};
      if (newCategory) params.category = newCategory;
      if (activeSearch) params.search = activeSearch;
      setSearchParams(params);
    }
  };

  // Browse mode: text search
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setOffset(0);
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (searchInput.trim()) params.search = searchInput.trim();
    setSearchParams(params);
  };

  // Browse mode: load more
  const handleLoadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
      updateQuery: (prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev;
        return { events: [...prev.events, ...fetchMoreResult.events] };
      },
    });
  };

  // Nearby mode: location search
  const handleLocationSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    setGeocodeError('');
    setGeocoding(true);
    const result = await geocodeAddress(locationInput);
    setGeocoding(false);

    if (!result) {
      setGeocodeError('Could not find that location. Try a city name or zip code.');
      return;
    }

    coordsRef.current = { lat: result.lat, lng: result.lng };
    searchNearby({
      variables: {
        latitude: result.lat,
        longitude: result.lng,
        radiusKm: radius,
        category: category || undefined,
        limit: 20,
      },
    });
  };

  // Nearby mode: radius change re-fires query
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (coordsRef.current) {
      searchNearby({
        variables: {
          latitude: coordsRef.current.lat,
          longitude: coordsRef.current.lng,
          radiusKm: newRadius,
          category: category || undefined,
          limit: 20,
        },
      });
    }
  };

  const isSearching = geocoding || loading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Events</h1>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={switchToBrowse}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !nearbyMode
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
          }`}
        >
          Browse All
        </button>
        <button
          onClick={switchToNearby}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            nearbyMode
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
          }`}
        >
          {savedLoc ? `Near ${getShortName(savedLoc.displayName)}` : 'Near Me'}
        </button>
      </div>

      {/* Mode-specific controls */}
      {nearbyMode ? (
        // Nearby controls
        <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="City, zip code, or address..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <select
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
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
            {geocoding ? 'Finding...' : 'Search'}
          </button>
        </form>
      ) : (
        // Browse controls
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search events..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-400 transition-colors"
          >
            Search
          </button>
        </form>
      )}

      {/* Geocode error (nearby mode only) */}
      {geocodeError && (
        <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2 mb-6">
          {geocodeError}
        </div>
      )}

      {/* Category filter (shared) */}
      <div className="mb-8">
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </div>

      {/* Results */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-300">Something went wrong loading events.</p>
        </div>
      ) : isSearching ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">
            {nearbyMode ? 'Finding events near you...' : 'Loading events...'}
          </p>
        </div>
      ) : events.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Load More (browse mode only) */}
          {!nearbyMode && !loading && events.length >= offset + PAGE_SIZE && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="border border-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {nearbyMode
              ? nearCalled
                ? 'No events found in this area. Try a larger radius or different location.'
                : 'Enter a location above to find events near you.'
              : activeSearch || category
                ? 'No events match your filters. Try broadening your search.'
                : 'No upcoming events yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
