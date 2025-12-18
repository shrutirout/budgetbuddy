import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 *
 * Purpose: Protect routes that require authentication
 * Usage: Wrap any component that should only be accessible to logged-in users
 *
 * How it works:
 * 1. Check if user is authenticated (via AuthContext)
 * 2. If authenticated: render the children components
 * 3. If not authenticated: redirect to login page
 * 4. While checking auth status: show loading state
 *
 * Example usage:
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   }
 * />
 */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-bg">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
