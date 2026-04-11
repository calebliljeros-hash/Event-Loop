import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { SIGNUP } from '../graphql/mutations';
import Auth from '../utils/auth';

export default function Signup() {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  const [signup, { loading, error }] = useMutation(SIGNUP);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (formState.password !== formState.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formState.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      const { data } = await signup({
        variables: {
          username: formState.username,
          email: formState.email,
          password: formState.password,
        },
      });
      Auth.login(data.signup.token);
    } catch {
      // error is captured by useMutation's error state
    }
  };

  const displayError = validationError || error?.message;

  return (
    <section className="py-16">
      <div className="max-w-md mx-auto bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create an Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              placeholder="cooluser42"
              required
              value={formState.username}
              onChange={(e) => setFormState({ ...formState, username: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formState.password}
              onChange={(e) => setFormState({ ...formState, password: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formState.confirmPassword}
              onChange={(e) => setFormState({ ...formState, confirmPassword: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {displayError && (
            <div className="bg-red-400/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
