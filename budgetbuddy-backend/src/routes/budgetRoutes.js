const express = require('express');
const {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus
} = require('../controllers/budgetController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Budget Routes
 *
 * Base path: /api/budget
 * All routes require authentication (auth middleware)
 *
 * RESTful API Design:
 * - POST /budget → Create new budget limit
 * - GET /budget → Get all budget limits (with filters)
 * - GET /budget/status → Get budget status with spending analysis
 * - GET /budget/:id → Get single budget limit
 * - PUT /budget/:id → Update budget limit
 * - DELETE /budget/:id → Delete budget limit
 *
 * Pattern: Follows expense/income routes structure for consistency
 *
 * Route Order Matters! (CRITICAL)
 * - /budget/status MUST come BEFORE /budget/:id
 * - Why? Express matches routes top to bottom
 * - If /:id comes first, "status" is treated as an ID parameter
 * - Example:
 *   GET /budget/status
 *   → If /:id is first: matches /:id with id="status" ❌
 *   → If /status is first: matches /status correctly ✅
 *
 * Middleware Flow:
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
 * - Errors: 400 Bad Request, 401 Unauthorized, 404 Not Found,
 *           409 Conflict (duplicate budget), 500 Internal Server Error
 */

// CREATE: Set new budget limit
// POST /api/budget
// Headers: Authorization: Bearer <token>
// Body: { category, limitAmount, month }
// Response: 201 Created with budget object
//
// Validates:
// - category, limitAmount, month are required
// - limitAmount must be > 0
// - No duplicate budget for same category + month
//
// Example Request:
// POST /api/budget
// {
//   "category": "Food",
//   "limitAmount": 500,
//   "month": "2025-01-01"
// }
//
// Example Response: 201
// {
//   "message": "Budget limit created successfully",
//   "budget": {
//     "id": "uuid-123",
//     "userId": "user-uuid",
//     "category": "Food",
//     "limitAmount": 500,
//     "month": "2025-01-01T00:00:00.000Z",
//     "createdAt": "2025-12-09T...",
//     "updatedAt": "2025-12-09T..."
//   }
// }
router.post('/', auth, createBudget);

// READ ALL: Get all budget limits with optional filters
// GET /api/budget
// Query Params (all optional):
//   - month: Filter by month (e.g., ?month=2025-01-01)
//   - category: Filter by category (e.g., ?category=Food)
// Response: 200 OK with array of budgets
//
// Examples:
// - GET /api/budget → All user's budgets
// - GET /api/budget?month=2025-01-01 → Budgets for January 2025
// - GET /api/budget?category=Food → Food budgets across all months
// - GET /api/budget?month=2025-01-01&category=Food → Food budget for January
//
// Response Format:
// {
//   "budgets": [
//     {
//       "id": "uuid-123",
//       "category": "Food",
//       "limitAmount": 500,
//       "month": "2025-01-01T00:00:00.000Z",
//       ...
//     }
//   ],
//   "count": 1
// }
router.get('/', auth, getAllBudgets);

// BUDGET STATUS: Get spending vs budget analysis with alerts
// GET /api/budget/status
// Query Params (optional):
//   - month: Month to analyze (defaults to current month)
// Response: 200 OK with budget status object
//
// NOTE: This route MUST come before /:id route!
//
// What It Does:
// 1. Fetches all budget limits for the month
// 2. Calculates actual spending per category from expenses
// 3. Compares spent vs limit
// 4. Calculates percentage used
// 5. Determines alert status (safe/warning/danger)
// 6. Returns comprehensive status with summary
//
// Use Cases:
// - Dashboard budget progress bars
// - Budget alerts/warnings
// - Monthly spending overview
// - Category-wise budget tracking
//
// Response Format:
// {
//   "month": "2025-01-01T00:00:00.000Z",
//   "budgets": [
//     {
//       "budgetId": "uuid-123",
//       "category": "Food",
//       "limit": 500,
//       "spent": 450,
//       "remaining": 50,
//       "percentageUsed": 90,
//       "status": "warning",        // safe/warning/danger
//       "isOverBudget": false,
//       "transactionCount": 25
//     }
//   ],
//   "summary": {
//     "totalBudget": 500,
//     "totalSpent": 450,
//     "categoriesOverBudget": 0,
//     "categoriesWithWarning": 1,
//     "categoriesSafe": 0
//   }
// }
//
// Status Levels:
// - safe: < 80% of budget (green, good)
// - warning: 80-100% of budget (yellow, caution)
// - danger: > 100% of budget (red, over budget)
router.get('/status', auth, getBudgetStatus);

// READ ONE: Get single budget limit by ID
// GET /api/budget/:id
// Params: id (UUID from URL)
// Response: 200 OK with budget object, or 404 Not Found
//
// Security: Verifies budget belongs to authenticated user
// - Cannot access other users' budgets
// - Returns 404 if not found OR doesn't belong to user
//
// Example:
// GET /api/budget/abc-123-def
// Response: 200
// {
//   "budget": {
//     "id": "abc-123-def",
//     "category": "Food",
//     "limitAmount": 500,
//     "month": "2025-01-01T00:00:00.000Z",
//     ...
//   }
// }
router.get('/:id', auth, getBudgetById);

// UPDATE: Modify existing budget limit
// PUT /api/budget/:id
// Params: id (UUID)
// Body: { category?, limitAmount?, month? } (all optional - partial update)
// Response: 200 OK with updated budget
//
// Validates:
// - limitAmount must be > 0 if provided
// - No conflict with existing budgets if changing category or month
//
// Conflict Detection:
// - Checks if new category + month combination already has a budget
// - Returns 409 Conflict if duplicate detected
//
// Partial Update:
// - Only provided fields are updated
// - Other fields remain unchanged
//
// Example:
// PUT /api/budget/abc-123
// { "limitAmount": 600 }
// → Updates only limitAmount, category and month unchanged
//
// Example Response: 200
// {
//   "message": "Budget limit updated successfully",
//   "budget": { ... }
// }
//
// Example Conflict: 409
// {
//   "error": "Budget limit for Food already exists for this month",
//   "suggestion": "Delete the existing budget first or choose a different category/month"
// }
router.put('/:id', auth, updateBudget);

// DELETE: Remove budget limit
// DELETE /api/budget/:id
// Params: id (UUID)
// Response: 200 OK with success message and deleted budget
//
// Returns deleted budget for:
// - User confirmation (show what was deleted)
// - Undo functionality (can recreate)
// - Audit trail
//
// Security: Verifies budget belongs to user before deleting
//
// Example:
// DELETE /api/budget/abc-123
// Response: 200
// {
//   "message": "Budget limit deleted successfully",
//   "deletedBudget": {
//     "id": "abc-123",
//     "category": "Food",
//     "limitAmount": 500,
//     ...
//   }
// }
router.delete('/:id', auth, deleteBudget);

// Export router to be mounted in server.js
// Will be mounted at /api/budget
module.exports = router;
