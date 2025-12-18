import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import RecurringTransactions from './pages/RecurringTransactions';
import AIChatbot from './pages/AIChatbot';
import ProtectedRoute from './components/common/ProtectedRoute';

/**
 * App Component
 *
 * Purpose: Root component with routing configuration
 * Structure:
 * - DarkModeProvider: Wraps entire app to provide dark mode context
 * - AuthProvider: Wraps entire app to provide auth context
 * - BrowserRouter: Enables client-side routing
 * - Routes: Defines all application routes
 *
 * Provider Order:
 * DarkModeProvider → AuthProvider → BrowserRouter
 * - DarkModeProvider outermost: theme affects everything (including auth pages)
 * - AuthProvider next: auth state needed for routing logic
 * - BrowserRouter innermost: routing depends on auth state
 *
 * Routes:
 * - / : Redirects to /login
 * - /login : Login page (public)
 * - /signup : Signup page (public)
 * - /dashboard : Dashboard (protected, requires auth)
 */

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/income"
            element={
              <ProtectedRoute>
                <Income />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <ProtectedRoute>
                <RecurringTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AIChatbot />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
