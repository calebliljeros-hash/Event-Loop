import { useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../utils/auth';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = Auth.loggedIn();

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="text-xl font-bold text-white">EventLoop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/events" className="text-gray-400 hover:text-white transition-colors">
              Browse Events
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/create-event" className="text-gray-400 hover:text-white transition-colors">
                  Create Event
                </Link>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={() => Auth.logout()}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-400 transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-400 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/events" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white py-2">
              Browse Events
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/create-event" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white py-2">
                  Create Event
                </Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white py-2">
                  Dashboard
                </Link>
                <button
                  onClick={() => Auth.logout()}
                  className="block w-full text-left text-gray-400 hover:text-white py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white py-2">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block text-gray-400 hover:text-white py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
