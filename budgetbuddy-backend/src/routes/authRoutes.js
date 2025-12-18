const express = require('express');
const { signup, login, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Authentication Routes
 *
 * Base path: /api/auth
 *
 * Public routes (no authentication required):
 * - POST /signup - Create new account
 * - POST /login - Login to existing account
 *
 * Protected routes (authentication required):
 * - GET /me - Get current user profile
 */

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (requires auth middleware)
router.get('/me', auth, getCurrentUser);

module.exports = router;
