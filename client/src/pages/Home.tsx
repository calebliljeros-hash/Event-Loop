import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { QUERY_EVENTS } from '../graphql/queries';
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
  const { data, loading, error } = useQuery(QUERY_EVENTS, {
    variables: { limit: 6 },
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    }
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

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
          <Link
            to="/events"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-300">Something went wrong loading events.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3">Loading events...</p>
          </div>
        ) : data?.events?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.events.map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming events yet. Be the first to create one!</p>
          </div>
        )}
      </section>
    </>
  );
}
