const { PrismaClient } = require('@prisma/client');
const {
  exportExpensesToCSV,
  exportExpensesToExcel,
  exportIncomeToCSV,
  exportIncomeToExcel,
  exportComprehensiveReport
} = require('../services/exportService');

const prisma = new PrismaClient();

// Handles export/download functionality for financial data

// Exports expenses to CSV format
const exportExpensesCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        const year = startDateObj.getUTCFullYear();
        const month = startDateObj.getUTCMonth();
        const day = startDateObj.getUTCDate();
        where.date.gte = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        const year = endDateObj.getUTCFullYear();
        const month = endDateObj.getUTCMonth();
        const day = endDateObj.getUTCDate();
        where.date.lte = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      }
    }

    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        amount: true,
        description: true,
        category: true,
        date: true,
        createdAt: true
      }
    });

    console.log(`📥 Exporting ${expenses.length} expenses to CSV for user ${userId}`);

    const csv = exportExpensesToCSV(expenses);
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(csv);

    console.log(`✅ Successfully exported expenses to ${filename}`);

  } catch (error) {
    console.error('Export expenses CSV error:', error);
    res.status(500).json({
      error: 'Failed to export expenses',
      message: 'An error occurred while generating the CSV file'
    });
  }
};

// Exports expenses to Excel format
const exportExpensesExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        const year = startDateObj.getUTCFullYear();
        const month = startDateObj.getUTCMonth();
        const day = startDateObj.getUTCDate();
        where.date.gte = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        const year = endDateObj.getUTCFullYear();
        const month = endDateObj.getUTCMonth();
        const day = endDateObj.getUTCDate();
        where.date.lte = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      }
    }

    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        amount: true,
        description: true,
        category: true,
        date: true,
        createdAt: true
      }
    });

    console.log(`📊 Exporting ${expenses.length} expenses to Excel for user ${userId}`);

    const buffer = await exportExpensesToExcel(expenses);
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(buffer);

    console.log(`✅ Successfully exported expenses to ${filename}`);

  } catch (error) {
    console.error('Export expenses Excel error:', error);
    res.status(500).json({
      error: 'Failed to export expenses',
      message: 'An error occurred while generating the Excel file'
    });
  }
};

// Exports income to CSV format
const exportIncomeCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        const year = startDateObj.getUTCFullYear();
        const month = startDateObj.getUTCMonth();
        const day = startDateObj.getUTCDate();
        where.date.gte = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        const year = endDateObj.getUTCFullYear();
        const month = endDateObj.getUTCMonth();
        const day = endDateObj.getUTCDate();
        where.date.lte = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      }
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        amount: true,
        source: true,
        date: true,
        createdAt: true
      }
    });

    console.log(`📥 Exporting ${incomes.length} income records to CSV for user ${userId}`);

    const csv = exportIncomeToCSV(incomes);
    const filename = `income_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(csv);

    console.log(`✅ Successfully exported income to ${filename}`);

  } catch (error) {
    console.error('Export income CSV error:', error);
    res.status(500).json({
      error: 'Failed to export income',
      message: 'An error occurred while generating the CSV file'
    });
  }
};

// Exports income to Excel format
const exportIncomeExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        const year = startDateObj.getUTCFullYear();
        const month = startDateObj.getUTCMonth();
        const day = startDateObj.getUTCDate();
        where.date.gte = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        const year = endDateObj.getUTCFullYear();
        const month = endDateObj.getUTCMonth();
        const day = endDateObj.getUTCDate();
        where.date.lte = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      }
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        amount: true,
        source: true,
        date: true,
        createdAt: true
      }
    });

    console.log(`📊 Exporting ${incomes.length} income records to Excel for user ${userId}`);

    const buffer = await exportIncomeToExcel(incomes);
    const filename = `income_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(buffer);

    console.log(`✅ Successfully exported income to ${filename}`);

  } catch (error) {
    console.error('Export income Excel error:', error);
    res.status(500).json({
      error: 'Failed to export income',
      message: 'An error occurred while generating the Excel file'
    });
  }
};

// Generates comprehensive financial report with multiple sheets
const exportComprehensiveReportEndpoint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        const year = startDateObj.getUTCFullYear();
        const month = startDateObj.getUTCMonth();
        const day = startDateObj.getUTCDate();
        dateFilter.date.gte = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        const year = endDateObj.getUTCFullYear();
        const month = endDateObj.getUTCMonth();
        const day = endDateObj.getUTCDate();
        dateFilter.date.lte = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      }
    }

    console.log(`📑 Generating comprehensive report for user ${userId}`);

    // Fetch all required data in parallel
    const [expenses, incomes, budgets] = await Promise.all([
      prisma.expense.findMany({
        where: { userId, ...dateFilter },
        orderBy: { date: 'desc' },
        select: {
          amount: true,
          description: true,
          category: true,
          date: true,
          createdAt: true
        }
      }),

      prisma.income.findMany({
        where: { userId, ...dateFilter },
        orderBy: { date: 'desc' },
        select: {
          amount: true,
          source: true,
          date: true,
          createdAt: true
        }
      }),

      prisma.budgetLimit.findMany({
        where: { userId },
        orderBy: { month: 'desc' },
        select: {
          category: true,
          limitAmount: true,
          month: true
        }
      })
    ]);

    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const remainingMoney = totalIncome - totalExpenses;
    const savings = remainingMoney > 0 ? remainingMoney : 0;

    const reportData = {
      expenses,
      incomes,
      budgets,
      analytics: {
        totalIncome,
        totalExpenses,
        remainingMoney,
        savings
      }
    };

    console.log(`📊 Report data: ${expenses.length} expenses, ${incomes.length} income, ${budgets.length} budgets`);

    const buffer = await exportComprehensiveReport(reportData);

    let filename = 'financial_report';
    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      filename = `financial_report_${start}_to_${end}`;
    } else {
      filename = `financial_report_${new Date().toISOString().split('T')[0]}`;
    }
    filename += '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(buffer);

    console.log(`✅ Successfully exported comprehensive report: ${filename}`);

  } catch (error) {
    console.error('Export comprehensive report error:', error);
    res.status(500).json({
      error: 'Failed to export report',
      message: 'An error occurred while generating the financial report'
    });
  }
};

module.exports = {
  exportExpensesExcel,
  exportIncomeExcel,
  exportComprehensiveReportEndpoint
};
