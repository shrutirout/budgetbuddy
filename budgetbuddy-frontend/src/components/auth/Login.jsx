import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Login Component
 *
 * Purpose: User login form with email/password authentication
 * Features:
 * - Form validation
 * - Error handling
 * - Loading state during API call
 * - Redirect to dashboard on success
 * - Link to signup page
 */

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  // Input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError('');
  };

  /**
   * Handling form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      // Display error message from API
      setError(err || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

   // Handle demo account login
  // Auto-fills demo credentials and logs in
  
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await login('demo@budgetbuddy.com', 'demo123');
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">BudgetBuddy</h1>
          <p className="text-gray-500 text-sm">To Help Manage Your Finances Better</p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Sign In</h2>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger text-center">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Demo Account Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Try Demo Account</span>
          </button>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Demo Account:</strong> Explore with 5 months of realistic data
            </p>
          </div>

          {/* Signup link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
