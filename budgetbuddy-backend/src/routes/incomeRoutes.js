const express = require('express');
const {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeStats
} = require('../controllers/incomeController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Income Routes
 *
 * Base path: /api/income
 * All routes require authentication (auth middleware)
 *
 * RESTful API Design:
 * - POST /income → Create new income entry
 * - GET /income → Get all income entries (with filters)
 * - GET /income/stats → Get income statistics
 * - GET /income/:id → Get single income entry
 * - PUT /income/:id → Update income entry
 * - DELETE /income/:id → Delete income entry
 *
 * Pattern: Mirrors expenseRoutes.js for consistency
 * - Same route structure
 * - Same authentication requirement
 * - Same RESTful conventions
 * - Same HTTP methods and status codes
 *
 * Route Order Matters! (CRITICAL)
 * - /income/stats MUST come BEFORE /income/:id
 * - Why? Express matches routes in order from top to bottom
 * - If /:id comes first, "stats" is treated as an ID parameter
 * - Example flow:
 *   GET /income/stats
 *   → If /:id is first: matches /:id with id="stats" ❌
 *   → If /stats is first: matches /stats correctly ✅
 *
 * Middleware Order:
 * - auth middleware runs first for all routes
 * - Verifies JWT token and sets req.user
 * - Then controller function runs
 * - Controller accesses req.user.id safely
 *
 * HTTP Methods and Status Codes:
 * - POST (Create): Returns 201 Created
 * - GET (Read): Returns 200 OK
 * - PUT (Update): Returns 200 OK
 * - DELETE (Delete): Returns 200 OK
 * - Errors: 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
 */

// CREATE: Add new income entry
// POST /api/income
// Headers: Authorization: Bearer <token>
// Body: { amount, source?, date }
// Response: 201 Created with income object
//
// Flow:
// 1. Client sends POST request with income data
// 2. auth middleware verifies JWT token
// 3. auth middleware sets req.user = { id: userId }
// 4. createIncome controller reads req.user.id
// 5. Controller creates income in database
// 6. Controller returns 201 with created income
router.post('/', auth, createIncome);

// READ ALL: Get all income entries with optional filters
// GET /api/income
// Query Params (all optional):
//   - source: Filter by income source (e.g., ?source=Salary)
//   - startDate: Date range start (e.g., ?startDate=2025-01-01)
//   - endDate: Date range end (e.g., ?endDate=2025-12-31)
//   - limit: Max results to return (e.g., ?limit=10)
//   - offset: Pagination offset (e.g., ?offset=20)
// Response: 200 OK with array of income entries and pagination info
//
// Examples:
// - GET /api/income → All user's income
// - GET /api/income?source=Salary → Only salary income
// - GET /api/income?startDate=2025-01-01&endDate=2025-01-31 → January income
// - GET /api/income?limit=5&offset=10 → Results 11-15
router.get('/', auth, getAllIncome);

// STATISTICS: Get income statistics
// GET /api/income/stats
// Query Params (optional):
//   - startDate: Period start (defaults to current month start)
//   - endDate: Period end (defaults to now)
// Response: 200 OK with stats object { period, total, count, bySource }
//
// NOTE: This route MUST come before /:id route
// Why? To prevent "stats" being interpreted as an ID
//
// Use Cases:
// - Dashboard total income display
// - Monthly income reports
// - Income source breakdown charts
// - Year-over-year comparison
router.get('/stats', auth, getIncomeStats);

// READ ONE: Get single income entry by ID
// GET /api/income/:id
// Params: id (UUID from URL, e.g., /api/income/abc-123-def)
// Response: 200 OK with income object, or 404 Not Found
//
// Security: Controller verifies income belongs to authenticated user
// - Cannot access other users' income entries
// - Returns 404 if not found OR doesn't belong to user
router.get('/:id', auth, getIncomeById);

// UPDATE: Modify existing income entry
// PUT /api/income/:id
// Params: id (UUID)
// Body: { amount?, source?, date? } (all optional - partial update)
// Response: 200 OK with updated income object
//
// Partial Update Support:
// - Only include fields you want to update
// - Other fields remain unchanged
// - Example: { amount: 1500 } only updates amount
//
// Security: Controller verifies income belongs to user before updating
router.put('/:id', auth, updateIncome);

// DELETE: Remove income entry
// DELETE /api/income/:id
// Params: id (UUID)
// Response: 200 OK with success message and deleted income object
//
// Returns deleted income for:
// - Confirmation display in frontend
// - Audit trail
// - Potential "undo" functionality
//
// Security: Controller verifies income belongs to user before deleting
router.delete('/:id', auth, deleteIncome);

// Export router to be mounted in server.js
// Will be mounted at /api/income
module.exports = router;
