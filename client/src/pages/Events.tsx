import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { QUERY_EVENTS } from '../graphql/queries';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';

const PAGE_SIZE = 12;

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [category, setCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [offset, setOffset] = useState(0);

  const { data, loading, fetchMore } = useQuery(QUERY_EVENTS, {
    variables: {
      category: category || undefined,
      search: activeSearch || undefined,
      limit: PAGE_SIZE,
      offset: 0,
    },
  });

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setOffset(0);
    const params: Record<string, string> = {};
    if (newCategory) params.category = newCategory;
    if (activeSearch) params.search = activeSearch;
    setSearchParams(params);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setOffset(0);
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (searchInput.trim()) params.search = searchInput.trim();
    setSearchParams(params);
  };

  const handleLoadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          events: [...prev.events, ...fetchMoreResult.events],
        };
      },
    });
  };

  const events = data?.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Browse Events</h1>

      {/* Search bar */}
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

      {/* Category filter */}
      <div className="mb-8">
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </div>

      {/* Results */}
      {loading && offset === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">Loading events...</p>
        </div>
      ) : events.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Load More — show if we got a full page of results */}
          {events.length >= offset + PAGE_SIZE && (
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
            {activeSearch || category
              ? 'No events match your filters. Try broadening your search.'
              : 'No upcoming events yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
