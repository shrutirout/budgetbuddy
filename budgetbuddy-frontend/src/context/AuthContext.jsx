import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

/**
 * AuthContext - Global authentication state management
 *
 * Purpose: Share user authentication state across the entire app
 * Benefits:
 * - Avoid prop drilling (passing user data through multiple components)
 * - Centralized auth logic (login, logout, signup)
 * - Persist auth state in localStorage
 * - Auto-restore session on page reload
 */

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component
 * Wraps the app to provide authentication state to all children
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Loading state for initial auth check

  /**
   * Initialize auth state from localStorage on mount
   * Check if user has a valid token and restore session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching user profile
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          // Token invalid or expired, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);  // Done loading
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Resolves with user data, rejects with error
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);

      return { success: true, user };
    } catch (error) {
      throw error;  // Let the component handle the error
    }
  };

  /**
   * Signup function
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name (optional)
   * @returns {Promise} - Resolves with user data, rejects with error
   */
  const signup = async (email, password, name) => {
    try {
      const response = await api.post('/auth/signup', { email, password, name });
      const { user, token } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);

      return { success: true, user };
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout function
   * Clears authentication state and localStorage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Context value provided to all children
   */
  const value = {
    user,           // Current logged-in user (null if not logged in)
    loading,        // True while checking initial auth state
    login,          // Login function
    signup,         // Signup function
    logout,         // Logout function
    isAuthenticated: !!user,  // Boolean: is user logged in?
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
