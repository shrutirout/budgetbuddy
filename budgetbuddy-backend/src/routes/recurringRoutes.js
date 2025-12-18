const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getRecurringIncomes,
  createRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,
  processRecurringTransactions
} = require('../controllers/recurringController');

/**
 * Recurring Transactions Routes
 *
 * All routes require authentication
 * Base path: /api/recurring
 */

// ============================================================================
// RECURRING EXPENSES
// ============================================================================

/**
 * @route   GET /api/recurring/expenses
 * @desc    Get all recurring expenses for logged-in user
 * @access  Private
 */
router.get('/expenses', auth, getRecurringExpenses);

/**
 * @route   POST /api/recurring/expenses
 * @desc    Create a new recurring expense
 * @access  Private
 * @body    { amount, description, category, frequency, startDate, endDate? }
 */
router.post('/expenses', auth, createRecurringExpense);

/**
 * @route   PATCH /api/recurring/expenses/:id
 * @desc    Update a recurring expense
 * @access  Private (owner only)
 * @body    { amount?, description?, category?, frequency?, endDate?, isActive? }
 */
router.patch('/expenses/:id', auth, updateRecurringExpense);

/**
 * @route   DELETE /api/recurring/expenses/:id
 * @desc    Delete a recurring expense template
 * @access  Private (owner only)
 * @note    Generated expenses remain for historical records
 */
router.delete('/expenses/:id', auth, deleteRecurringExpense);

// ============================================================================
// RECURRING INCOMES
// ============================================================================

/**
 * @route   GET /api/recurring/incomes
 * @desc    Get all recurring incomes for logged-in user
 * @access  Private
 */
router.get('/incomes', auth, getRecurringIncomes);

/**
 * @route   POST /api/recurring/incomes
 * @desc    Create a new recurring income
 * @access  Private
 * @body    { amount, source, frequency, startDate, endDate? }
 */
router.post('/incomes', auth, createRecurringIncome);

/**
 * @route   PATCH /api/recurring/incomes/:id
 * @desc    Update a recurring income
 * @access  Private (owner only)
 * @body    { amount?, source?, frequency?, endDate?, isActive? }
 */
router.patch('/incomes/:id', auth, updateRecurringIncome);

/**
 * @route   DELETE /api/recurring/incomes/:id
 * @desc    Delete a recurring income template
 * @access  Private (owner only)
 * @note    Generated incomes remain for historical records
 */
router.delete('/incomes/:id', auth, deleteRecurringIncome);

// ============================================================================
// CRON JOB ENDPOINT
// ============================================================================

/**
 * @route   POST /api/recurring/process
 * @desc    Process all due recurring transactions (called by cron job)
 * @access  Private (should be restricted to server/admin only in production)
 * @returns { expensesCreated, incomesCreated, totalProcessed }
 *
 * SECURITY NOTE:
 * In production, this endpoint should be:
 * 1. Protected by API key or server secret
 * 2. Only accessible from localhost or internal network
 * 3. Rate limited
 * 4. Logged for audit
 *
 * Example production security:
 * ```javascript
 * router.post('/process',
 *   requireApiKey,  // Custom middleware checking X-API-KEY header
 *   processRecurringTransactions
 * );
 * ```
 */
router.post('/process', processRecurringTransactions);

module.exports = router;
