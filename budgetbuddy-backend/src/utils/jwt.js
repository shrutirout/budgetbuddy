const jwt = require('jsonwebtoken');

/**
 * JWT Utility Functions
 *
 * Purpose: Centralized JWT token generation and verification
 * Used for: User authentication, protecting API routes
 */

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's unique identifier
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
  // Sign token with userId payload, secret from env, and 7-day expiration
  return jwt.sign(
    { userId },                        // Payload: only include userId (no sensitive data)
    process.env.JWT_SECRET,            // Secret key from environment variable
    { expiresIn: '7d' }                // Token expires in 7 days
  );
};

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object} - Decoded payload { userId }
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;  // Returns { userId, iat, exp }
  } catch (error) {
    // Token invalid, expired, or malformed
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
