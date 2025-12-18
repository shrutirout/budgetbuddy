const express = require('express');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  categorizeExpenseEndpoint
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Expense Routes
 *
 * Base path: /api/expenses
 * All routes require authentication (auth middleware)
 *
 * RESTful API Design:
 * - POST /expenses → Create new expense
 * - GET /expenses → Get all expenses (with filters)
 * - GET /expenses/stats → Get statistics
 * - GET /expenses/:id → Get single expense
 * - PUT /expenses/:id → Update expense
 * - DELETE /expenses/:id → Delete expense
 *
 * Route Order Matters!
 * - /expenses/stats BEFORE /expenses/:id
 * - Otherwise "stats" is treated as an ID
 */

// CREATE: Add new expense
// POST /api/expenses
// Body: { amount, description, category, date }
// Response: 201 Created with expense object
router.post('/', auth, createExpense);

// READ ALL: Get all expenses with optional filters
// GET /api/expenses?category=Food&startDate=2025-01-01&limit=10
// Response: 200 OK with array of expenses and pagination info
router.get('/', auth, getAllExpenses);

// STATISTICS: Get expense statistics
// GET /api/expenses/stats?startDate=2025-01-01&endDate=2025-01-31
// Response: 200 OK with stats object (total, count, byCategory)
// NOTE: This route MUST come before /:id route
router.get('/stats', auth, getExpenseStats);

// CATEGORIZE: AI-powered categorization
// POST /api/expenses/categorize
// Body: { description: "Uber ride to airport" }
// Response: { category: "Transport", description: "..." }
// NOTE: This route MUST come before /:id route
router.post('/categorize', auth, categorizeExpenseEndpoint);

// READ ONE: Get single expense by ID
// GET /api/expenses/abc123-def456-...
// Response: 200 OK with expense object, or 404 Not Found
router.get('/:id', auth, getExpenseById);

// UPDATE: Modify existing expense
// PUT /api/expenses/abc123-def456-...
// Body: { amount?, description?, category?, date? }
// Response: 200 OK with updated expense
router.put('/:id', auth, updateExpense);

// DELETE: Remove expense
// DELETE /api/expenses/abc123-def456-...
// Response: 200 OK with success message
router.delete('/:id', auth, deleteExpense);

module.exports = router;
