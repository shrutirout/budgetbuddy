import axios from 'axios';

/**
 * Axios Instance Configuration
 *
 * Purpose: Centralized API client with base URL and interceptors
 * - Base URL points to backend API
 * - Request interceptor adds JWT token to all requests
 * - Response interceptor handles 401 errors (expired tokens)
 */

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to Authorization header for every request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token expiration (401 errors)
 * Redirects to login if token is invalid/expired
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
