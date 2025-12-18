/**
 * Chatbot Routes
 *
 * API Endpoints:
 * - POST /api/chatbot - Send message to AI chatbot
 * - GET /api/chatbot/quick-actions - Get suggested prompts
 *
 * Authentication: Required for all endpoints
 * Rate Limiting: Recommended (not implemented yet)
 */

const express = require('express');
const router = express.Router();
const { chat, getChatHistory, clearChatHistory, getQuickActions } = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

/**
 * POST /api/chatbot
 *
 * Send message to AI financial advisor
 *
 * Request Body:
 * {
 *   "message": "How much am I spending on food?"
 * }
 *
 * Response:
 * {
 *   "reply": "Based on your data, you're spending ₹15,000 on Food & Dining...",
 *   "timestamp": "2024-12-15T10:30:00.000Z"
 * }
 *
 * Authentication: Required (JWT token in Authorization header)
 * Rate Limit: Consider adding (e.g., 20 messages per hour per user)
 *
 * Why rate limiting?
 * - API calls cost money
 * - Prevent abuse
 * - Ensure fair usage
 */
router.post('/', auth, chat);

/**
 * GET /api/chatbot/history
 *
 * Retrieve chat conversation history
 *
 * Query Parameters:
 * - limit (optional): Number of messages (default: 50)
 * - before (optional): Timestamp for cursor pagination
 */
router.get('/history', auth, getChatHistory);

/**
 * DELETE /api/chatbot/history
 *
 * Clear all chat history for authenticated user
 */
router.delete('/history', auth, clearChatHistory);

/**
 * GET /api/chatbot/quick-actions
 *
 * Get suggested quick action prompts
 *
 * Response:
 * {
 *   "quickActions": [
 *     "How much am I spending on food?",
 *     "Am I on track with my budget?",
 *     ...
 *   ]
 * }
 *
 * Authentication: Required
 * Cache: Frontend can cache this response
 */
router.get('/quick-actions', auth, getQuickActions);

module.exports = router;
