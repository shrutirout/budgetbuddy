/**
 * Export Routes - Downloadable Reports
 *
 * PURPOSE:
 * Provide endpoints for exporting financial data in various formats
 *
 * ENDPOINTS:
 * - GET /api/expenses/export/csv - Export expenses as CSV
 * - GET /api/expenses/export/excel - Export expenses as Excel
 * - GET /api/income/export/csv - Export income as CSV
 * - GET /api/income/export/excel - Export income as Excel
 * - GET /api/reports/export/comprehensive - Multi-sheet financial report
 *
 * AUTHENTICATION:
 * All routes require authentication
 * Users can only export their own data
 *
 * INTERVIEW TALKING POINTS:
 * 1. Why GET instead of POST? → Downloads are idempotent, no data mutation
 * 2. Why separate routes? → Different data types, different formats
 * 3. Rate limiting? → Consider limits to prevent abuse
 * 4. Caching? → Can cache exports for short time (5 minutes)
 */

const express = require('express');
const router = express.Router();
const {
  exportExpensesExcel,
  exportIncomeExcel,
  exportComprehensiveReportEndpoint
} = require('../controllers/exportController');
const auth = require('../middleware/auth');

/**
 * Export Expenses as Excel (XLSX)
 *
 * GET /api/expenses/export/excel
 *
 * Query Parameters (all optional):
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 * - category: Filter by category
 *
 * Response:
 * - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * - File download: expenses_YYYY-MM-DD.xlsx
 *
 * EXCEL FEATURES:
 * - Formatted headers (bold, blue background)
 * - Currency formatting (₹#,##0.00)
 * - Date formatting (DD/MM/YYYY)
 * - Alternating row colors
 * - Total row with SUM formula
 * - Borders around cells
 *
 * USE CASES:
 * - Professional reports
 * - Tax preparation
 * - Budget analysis
 * - Financial presentations
 */
router.get('/expenses/export/excel', auth, exportExpensesExcel);


/**
 * Export Income as Excel (XLSX)
 *
 * GET /api/income/export/excel
 *
 * Query Parameters (all optional):
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 *
 * Response:
 * - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * - File download: income_YYYY-MM-DD.xlsx
 *
 * EXCEL FEATURES:
 * - Green-themed headers (income = positive)
 * - Currency and date formatting
 * - Total row with SUM formula
 * - Professional styling
 */
router.get('/income/export/excel', auth, exportIncomeExcel);

/**
 * Export Comprehensive Financial Report
 *
 * GET /api/reports/export/comprehensive
 *
 * Query Parameters (all optional):
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 *
 * Response:
 * - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * - File download: financial_report_YYYY-MM-DD.xlsx
 *
 * MULTI-SHEET REPORT INCLUDES:
 * - Sheet 1: Summary
 *   - Total Income
 *   - Total Expenses
 *   - Net Balance
 *   - Savings
 *   - Period covered
 *
 * - Sheet 2: Expenses
 *   - All expense records
 *   - Formatted table
 *   - Total row
 *
 * - Sheet 3: Income
 *   - All income records
 *   - Formatted table
 *   - Total row
 *
 * - Sheet 4: Budgets
 *   - Budget limits per category
 *   - Current spending
 *   - Remaining amount
 *   - Status (safe/warning/danger)
 *
 * USE CASES:
 * - Monthly financial review
 * - Quarterly reports
 * - Year-end statements
 * - Tax preparation
 * - Sharing with financial advisor
 * - Personal financial planning
 *
 * FUTURE ENHANCEMENTS:
 * - Sheet 5: Charts (pie chart: spending by category)
 * - Sheet 6: Trends (line chart: monthly comparison)
 * - Sheet 7: Pivot table (category × month)
 * - Password protection option
 * - Custom date range in sheet name
 */
router.get('/reports/export/comprehensive', auth, exportComprehensiveReportEndpoint);

module.exports = router;
