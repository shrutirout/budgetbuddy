const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Provides aggregated financial data for visualization dashboards

// Returns monthly or daily expense totals for line chart
const getExpenseTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    let expenses;

    if (months === 1) {
      // Current month - show daily trends
      expenses = await prisma.$queryRaw`
        SELECT
          TO_CHAR(date, 'YYYY-MM-DD') as day,
          SUM(amount)::float as total
        FROM "Expense"
        WHERE "userId" = ${userId}
          AND date >= DATE_TRUNC('month', CURRENT_DATE)
          AND date <= CURRENT_DATE
        GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
        ORDER BY day ASC
      `;

      const labels = expenses.map(e => {
        const date = new Date(e.day + 'T00:00:00Z');
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        const localDate = new Date(year, month, day);
        return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      const values = expenses.map(e => parseFloat(e.total));

      res.json({
        success: true,
        data: {
          labels,
          values
        }
      });
    } else {
      // Multiple months - show monthly trends
      expenses = await prisma.$queryRaw`
        SELECT
          TO_CHAR(date, 'YYYY-MM') as month,
          SUM(amount)::float as total
        FROM "Expense"
        WHERE "userId" = ${userId}
          AND date >= CURRENT_DATE - CAST(${months} || ' months' AS INTERVAL)
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month ASC
      `;

      const labels = expenses.map(e => e.month);
      const values = expenses.map(e => parseFloat(e.total));

      res.json({
        success: true,
        data: {
          labels,
          values
        }
      });
    }
  } catch (error) {
    console.error('Error fetching expense trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense trends'
    });
  }
};

// Returns category totals for current month
const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, monthNum] = month.split('-');

    const categories = await prisma.$queryRaw`
      SELECT
        category,
        SUM(amount)::float as total
      FROM "Expense"
      WHERE "userId" = ${userId}
        AND EXTRACT(YEAR FROM date) = ${parseInt(year)}
        AND EXTRACT(MONTH FROM date) = ${parseInt(monthNum)}
      GROUP BY category
      ORDER BY total DESC
    `;

    const totalExpenses = categories.reduce((sum, cat) => sum + parseFloat(cat.total), 0);

    const labels = categories.map(c => c.category);
    const values = categories.map(c => parseFloat(c.total));
    const percentages = categories.map(c =>
      ((parseFloat(c.total) / totalExpenses) * 100).toFixed(1)
    );

    res.json({
      success: true,
      data: {
        labels,
        values,
        percentages,
        total: totalExpenses
      }
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category breakdown'
    });
  }
};

// Returns monthly income and expense comparison
const getIncomeVsExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const income = await prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::float as total
      FROM "Income"
      WHERE "userId" = ${userId}
        AND date >= CURRENT_DATE - CAST(${months} || ' months' AS INTERVAL)
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const expenses = await prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::float as total
      FROM "Expense"
      WHERE "userId" = ${userId}
        AND date >= CURRENT_DATE - CAST(${months} || ' months' AS INTERVAL)
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Generate all months in the range to ensure complete data
    const allMonthsInRange = [];
    const currentDate = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      allMonthsInRange.push(monthStr);
    }

    const dataMonths = new Set([
      ...income.map(i => i.month),
      ...expenses.map(e => e.month)
    ]);

    const allMonths = new Set([...allMonthsInRange, ...Array.from(dataMonths)]);
    const sortedMonths = Array.from(allMonths).sort();

    const incomeMap = Object.fromEntries(income.map(i => [i.month, parseFloat(i.total)]));
    const expenseMap = Object.fromEntries(expenses.map(e => [e.month, parseFloat(e.total)]));

    const incomeValues = sortedMonths.map(month => incomeMap[month] || 0);
    const expenseValues = sortedMonths.map(month => expenseMap[month] || 0);
    const savings = sortedMonths.map(month =>
      (incomeMap[month] || 0) - (expenseMap[month] || 0)
    );

    console.log(`Income vs Expenses: ${sortedMonths.length} months, Income data: ${income.length} months, Expense data: ${expenses.length} months`);

    res.json({
      success: true,
      data: {
        labels: sortedMonths,
        income: incomeValues,
        expenses: expenseValues,
        savings
      }
    });
  } catch (error) {
    console.error('Error fetching income vs expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income vs expenses'
    });
  }
};

// Returns budget vs actual spending for current month
const getBudgetPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, monthNum] = month.split('-');

    const monthDate = new Date(month + '-01');
    const targetYear = monthDate.getUTCFullYear();
    const targetMonth = monthDate.getUTCMonth();

    // Create date range for filtering budgets with timezone-aware matching
    const rangeStart = new Date(Date.UTC(targetYear, targetMonth, 0, 12, 0, 0, 0));
    const rangeEnd = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 12, 0, 0, 0));

    const budgetData = await prisma.$queryRaw`
      SELECT
        bl.category,
        bl."limitAmount"::float as budget,
        COALESCE(SUM(e.amount), 0)::float as actual
      FROM "BudgetLimit" bl
      LEFT JOIN "Expense" e ON
        e.category = bl.category AND
        e."userId" = bl."userId" AND
        EXTRACT(YEAR FROM e.date) = ${parseInt(year)} AND
        EXTRACT(MONTH FROM e.date) = ${parseInt(monthNum)}
      WHERE bl."userId" = ${userId}
        AND bl.month >= ${rangeStart}
        AND bl.month < ${rangeEnd}
      GROUP BY bl.category, bl."limitAmount"
      ORDER BY actual DESC
    `;

    const categories = budgetData.map(b => b.category);
    const budgets = budgetData.map(b => parseFloat(b.budget));
    const actuals = budgetData.map(b => parseFloat(b.actual));
    const percentages = budgetData.map(b => {
      const pct = (parseFloat(b.actual) / parseFloat(b.budget)) * 100;
      return parseFloat(pct.toFixed(1));
    });
    const statuses = percentages.map(pct => {
      if (pct >= 100) return 'danger';
      if (pct >= 80) return 'warning';
      return 'safe';
    });

    res.json({
      success: true,
      data: {
        categories,
        budgets,
        actuals,
        percentages,
        statuses
      }
    });
  } catch (error) {
    console.error('Error fetching budget performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget performance'
    });
  }
};

// Returns cumulative savings over time
const getSavingsTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const income = await prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::float as total
      FROM "Income"
      WHERE "userId" = ${userId}
        AND date >= CURRENT_DATE - CAST(${months} || ' months' AS INTERVAL)
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const expenses = await prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::float as total
      FROM "Expense"
      WHERE "userId" = ${userId}
        AND date >= CURRENT_DATE - CAST(${months} || ' months' AS INTERVAL)
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const allMonths = new Set([
      ...income.map(i => i.month),
      ...expenses.map(e => e.month)
    ]);

    const sortedMonths = Array.from(allMonths).sort();

    const incomeMap = Object.fromEntries(income.map(i => [i.month, parseFloat(i.total)]));
    const expenseMap = Object.fromEntries(expenses.map(e => [e.month, parseFloat(e.total)]));

    let cumulative = 0;
    const monthly = [];
    const cumulativeValues = [];

    sortedMonths.forEach(month => {
      const monthIncome = incomeMap[month] || 0;
      const monthExpense = expenseMap[month] || 0;
      const monthlySavings = monthIncome - monthExpense;

      monthly.push(monthlySavings);
      cumulative += monthlySavings;
      cumulativeValues.push(cumulative);
    });

    res.json({
      success: true,
      data: {
        labels: sortedMonths,
        cumulative: cumulativeValues,
        monthly
      }
    });
  } catch (error) {
    console.error('Error fetching savings trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch savings trend'
    });
  }
};

// Returns spending per category over time
const getCategoryTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    // Get all categories from user's expenses
    const userCategories = await prisma.expense.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category']
    });
    const allCategories = userCategories.map(c => c.category).sort();

    let data;
    let labels;

    if (months === 1) {
      // Current month - show daily trends
      data = await prisma.$queryRaw`
        SELECT
          TO_CHAR(date, 'YYYY-MM-DD') as period,
          category,
          SUM(amount)::float as total
        FROM "Expense"
        WHERE "userId" = ${userId}
          AND date >= DATE_TRUNC('month', CURRENT_DATE)
          AND date <= CURRENT_DATE
        GROUP BY TO_CHAR(date, 'YYYY-MM-DD'), category
        ORDER BY period ASC
      `;

      const daysSet = new Set(data.map(d => d.period));
      const sortedDays = Array.from(daysSet).sort();

      labels = sortedDays.map(day => {
        const date = new Date(day + 'T00:00:00Z');
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const dayNum = date.getUTCDate();
        const localDate = new Date(year, month, dayNum);
        return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      const categories = {};
      allCategories.forEach(category => {
        categories[category] = sortedDays.map(period => {
          const record = data.find(d => d.period === period && d.category === category);
          return record ? parseFloat(record.total) : 0;
        });
      });

      res.json({
        success: true,
        data: {
          labels,
          categories
        }
      });
    } else {
      // Multiple months - show monthly trends
      data = await prisma.$queryRaw`
        SELECT
          TO_CHAR(date, 'YYYY-MM') as period,
          category,
          SUM(amount)::float as total
        FROM "Expense"
        WHERE "userId" = ${userId}
          AND date >= CURRENT_DATE - CAST(${months} || ' months' AS INTERVAL)
        GROUP BY TO_CHAR(date, 'YYYY-MM'), category
        ORDER BY period ASC
      `;

      const monthsSet = new Set(data.map(d => d.period));
      const sortedMonths = Array.from(monthsSet).sort();

      labels = sortedMonths;

      const categories = {};
      allCategories.forEach(category => {
        categories[category] = sortedMonths.map(period => {
          const record = data.find(d => d.period === period && d.category === category);
          return record ? parseFloat(record.total) : 0;
        });
      });

      res.json({
        success: true,
        data: {
          labels,
          categories
        }
      });
    }
  } catch (error) {
    console.error('Error fetching category trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category trends'
    });
  }
};

module.exports = {
  getExpenseTrends,
  getCategoryBreakdown,
  getIncomeVsExpenses,
  getBudgetPerformance,
  getSavingsTrend,
  getCategoryTrends
};
