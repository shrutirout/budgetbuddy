const bcrypt = require('bcryptjs');

/**
 * Bcrypt Utility Functions
 *
 * Purpose: Password hashing and verification
 * Security: One-way hashing with salt (cannot be decrypted)
 */

/**
 * Hash a plain text password
 * @param {string} password - Plain text password from user
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  // Generate salt with 10 rounds (2^10 = 1024 iterations)
  // Higher rounds = more secure but slower
  // 10 rounds = ~100ms (good balance)
  const saltRounds = 10;

  // Hash password with salt
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

/**
 * Compare plain text password with hashed password
 * @param {string} password - Plain text password from login attempt
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  // bcrypt.compare() internally:
  // 1. Extracts salt from hashedPassword
  // 2. Hashes the plain password with same salt
  // 3. Compares the two hashes
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

module.exports = {
  hashPassword,
  comparePassword,
};
