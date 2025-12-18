const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getExpenseTrends,
  getCategoryBreakdown,
  getIncomeVsExpenses,
  getBudgetPerformance,
  getSavingsTrend,
  getCategoryTrends
} = require('../controllers/analyticsController');

/**
 * Analytics Routes
 *
 * All routes require authentication
 * All endpoints return aggregated data for visualizations
 */

// GET /api/analytics/expense-trends - Monthly expense totals
router.get('/expense-trends', auth, getExpenseTrends);

// GET /api/analytics/category-breakdown - Current month category split
router.get('/category-breakdown', auth, getCategoryBreakdown);

// GET /api/analytics/income-vs-expenses - Monthly income/expense comparison
router.get('/income-vs-expenses', auth, getIncomeVsExpenses);

// GET /api/analytics/budget-performance - Budget vs actual for current month
router.get('/budget-performance', auth, getBudgetPerformance);

// GET /api/analytics/savings-trend - Cumulative savings over time
router.get('/savings-trend', auth, getSavingsTrend);

// GET /api/analytics/category-trends - Category spending over multiple months
router.get('/category-trends', auth, getCategoryTrends);

module.exports = router;
