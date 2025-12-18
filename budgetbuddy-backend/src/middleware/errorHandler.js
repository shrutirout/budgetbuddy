/**
 * Global Error Handler Middleware
 *
 * Purpose: Centralized error handling for all routes
 * Position: Must be added AFTER all routes in server.js
 *
 * Benefits:
 * - Consistent error response format across all endpoints
 * - Prevents server crashes from unhandled errors
 * - Logs errors for debugging
 * - Hides internal error details from client in production
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, use proper logging service)
  console.error('Error:', err);

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  // Error response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    // In development, send stack trace for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler
 *
 * Purpose: Handle requests to undefined routes
 * Position: Add AFTER all defined routes but BEFORE errorHandler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
