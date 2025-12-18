import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Financial analytics dashboard with interactive visualizations.

const Reports = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [expenseTrends, setExpenseTrends] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState(null);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState(null);
  const [budgetPerformance, setBudgetPerformance] = useState(null);
  const [savingsTrend, setSavingsTrend] = useState(null);
  const [categoryTrends, setCategoryTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(6);

  useEffect(() => {
    fetchAllAnalytics();
  }, [dateRange]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthsParam = dateRange === 0 ? 1 : dateRange;

      const [trends, breakdown, comparison, budget, savings, catTrends] = await Promise.all([
        api.get(`/analytics/expense-trends?months=${monthsParam}`),
        api.get(`/analytics/category-breakdown?month=${currentMonth}`),
        api.get(`/analytics/income-vs-expenses?months=${monthsParam}`),
        api.get(`/analytics/budget-performance?month=${currentMonth}`),
        api.get(`/analytics/savings-trend?months=${monthsParam}`),
        api.get(`/analytics/category-trends?months=${monthsParam}`)
      ]);

      setExpenseTrends(trends.data.data);
      setCategoryBreakdown(breakdown.data.data);
      setIncomeVsExpenses(comparison.data.data);
      setBudgetPerformance(budget.data.data);
      setSavingsTrend(savings.data.data);
      setCategoryTrends(catTrends.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getExpenseTrendsChart = () => {
    if (!expenseTrends || !expenseTrends.labels || expenseTrends.labels.length === 0) {
      return null;
    }

    const dataLabel = dateRange === 0 ? 'Daily Expenses' : 'Monthly Expenses';

    return {
      labels: expenseTrends.labels,
      datasets: [
        {
          label: dataLabel,
          data: expenseTrends.values,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  };

  const getCategoryBreakdownChart = () => {
    if (!categoryBreakdown || !categoryBreakdown.labels || categoryBreakdown.labels.length === 0) {
      return null;
    }

    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#6B7280', // Gray
      '#14B8A6'  // Teal
    ];

    return {
      labels: categoryBreakdown.labels,
      datasets: [
        {
          data: categoryBreakdown.values,
          backgroundColor: colors.slice(0, categoryBreakdown.labels.length),
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    };
  };

  const getIncomeVsExpensesChart = () => {
    if (!incomeVsExpenses || !incomeVsExpenses.labels || incomeVsExpenses.labels.length === 0) {
      return null;
    }

    return {
      labels: incomeVsExpenses.labels,
      datasets: [
        {
          label: 'Income',
          data: incomeVsExpenses.income,
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: incomeVsExpenses.expenses,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2
        }
      ]
    };
  };

  /**
   * Chart 4: Budget Performance (Horizontal Bar Chart)
   */
  const getBudgetPerformanceChart = () => {
    if (!budgetPerformance || !budgetPerformance.categories || budgetPerformance.categories.length === 0) {
      console.log('No budget performance data:', budgetPerformance);
      return null;
    }

    console.log('Budget performance data:', budgetPerformance);

    // Dynamic colors based on status (with fallback if statuses not available)
    const actualColors = (budgetPerformance.statuses || []).map(status => {
      if (status === 'danger') return 'rgba(239, 68, 68, 0.8)';
      if (status === 'warning') return 'rgba(245, 158, 11, 0.8)';
      return 'rgba(34, 197, 94, 0.8)';
    });

    // If no statuses array, use default green
    const defaultColors = budgetPerformance.categories.map(() => 'rgba(34, 197, 94, 0.8)');

    return {
      labels: budgetPerformance.categories || [],
      datasets: [
        {
          label: 'Budget Limit',
          data: budgetPerformance.budgets || [],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Actual Spending',
          data: budgetPerformance.actuals || [],
          backgroundColor: actualColors.length > 0 ? actualColors : defaultColors,
          borderWidth: 1
        }
      ]
    };
  };

  const getSavingsTrendChart = () => {
    if (!savingsTrend || !savingsTrend.labels || savingsTrend.labels.length === 0) {
      return null;
    }

    return {
      labels: savingsTrend.labels,
      datasets: [
        {
          label: 'Cumulative Savings',
          data: savingsTrend.cumulative,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  };

  const getCategoryTrendsChart = () => {
    if (!categoryTrends || !categoryTrends.labels || !categoryTrends.categories) {
      return null;
    }

    const colorPalette = [
      '#EF4444', // Bright Red
      '#3B82F6', // Bright Blue
      '#10B981', // Emerald Green
      '#F59E0B', // Amber Orange
      '#8B5CF6', // Purple
      '#EC4899', // Hot Pink
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#6366F1', // Indigo
      '#84CC16', // Lime Green
      '#06B6D4', // Cyan
      '#F43F5E', // Rose
      '#8B5A00', // Brown
      '#0EA5E9', // Sky Blue
      '#A855F7'  // Fuchsia
    ];

    const categoryColors = {
      'Food': '#10B981',
      'Transport': '#3B82F6',
      'Entertainment': '#8B5CF6',
      'Shopping': '#EF4444',
      'Bills': '#F59E0B',
      'Healthcare': '#EC4899',
      'Other': '#6B7280'
    };

    const categoryMapping = {
      'Transportation': 'Transport',
      'Housing': 'Bills',
      'Travel': 'Entertainment',
      'Personal Care': 'Healthcare',
      'Miscellaneous': 'Other'
    };

    const consolidatedCategories = {};
    Object.entries(categoryTrends.categories).forEach(([category, values]) => {
      const officialCategory = categoryMapping[category] || category;
      if (!consolidatedCategories[officialCategory]) {
        consolidatedCategories[officialCategory] = [...values];
      } else {
        consolidatedCategories[officialCategory] = consolidatedCategories[officialCategory].map((val, idx) => val + (values[idx] || 0));
      }
    });

    // Create datasets only for official categories
    const datasets = Object.keys(categoryColors).map(category => {
      if (!consolidatedCategories[category]) return null;

      const color = categoryColors[category];
      return {
        label: category,
        data: consolidatedCategories[category],
        borderColor: color,
        backgroundColor: `${color}20`,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      };
    }).filter(Boolean); // Remove null entries

    return {
      labels: categoryTrends.labels,
      datasets
    };
  };

  /**
   * Common chart options
   */
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 12, family: 'Inter, sans-serif' },
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            return `${label}: ₹${value.toLocaleString('en-IN')}`;
          }
        }
      }
    }
  };

  const lineChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  const barChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  const horizontalBarOptions = {
    ...commonOptions,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`
        }
      }
    }
  };

  const doughnutOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'right'
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = categoryBreakdown?.percentages?.[context.dataIndex] || 0;
            return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
        <style>{`
          .reports-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="reports-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <button onClick={fetchAllAnalytics} className="btn-retry">
            Try Again
          </button>
        </div>
        <style>{`
          .reports-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          .btn-retry {
            margin-top: 20px;
            padding: 10px 24px;
            background-color: #3B82F6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .btn-retry:hover {
            background-color: #2563EB;
          }
        `}</style>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    
    {/* Header */}
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visual insights into your financial data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              Dashboard
            </button>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              aria-label="Toggle dark mode"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Time Period Filter Card */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time Period</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {dateRange === 0 ? 'Current Month' : `Last ${dateRange} Month${dateRange > 1 ? 's' : ''}`}
            </p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={0}>Current Month</option>
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              📈 Expense Trends
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dateRange === 0 ? 'Daily spending in current month' : 'Monthly spending over time'}
            </p>
          </div>
          <div className="h-[300px]">
            {getExpenseTrendsChart() ? (
              <Line data={getExpenseTrendsChart()} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm italic">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Income vs Expenses Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              💰 Income vs Expenses
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly comparison
            </p>
          </div>
          <div className="h-[300px]">
            {getIncomeVsExpensesChart() ? (
              <Bar data={getIncomeVsExpensesChart()} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm italic">
                No income/expense data available
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              🎯 Category Breakdown
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current month spending distribution
            </p>
          </div>
          <div className="h-[300px]">
            {getCategoryBreakdownChart() ? (
              <Doughnut data={getCategoryBreakdownChart()} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm italic">
                No category data for current month
              </div>
            )}
          </div>
        </div>

        {/* Budget Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              🎯 Budget Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Budget vs actual spending (current month)
            </p>
          </div>
          <div className="h-[300px]">
            {getBudgetPerformanceChart() ? (
              <Bar data={getBudgetPerformanceChart()} options={horizontalBarOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm italic">
                No budget data for current month
              </div>
            )}
          </div>
        </div>

        {/* Savings Trend Chart (Full Width) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              💸 Savings Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cumulative savings accumulation
            </p>
          </div>
          <div className="h-[300px]">
            {getSavingsTrendChart() ? (
              <Line data={getSavingsTrendChart()} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm italic">
                No savings data available
              </div>
            )}
          </div>
        </div>

        {/* Category Trends Chart (Full Width) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              📊 Category Spending Trends
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dateRange === 0 ? 'Daily category spending in current month (All 7 categories)' : 'Monthly category spending over time (All 7 categories)'}
            </p>
          </div>
          <div className="h-[450px]">
            {getCategoryTrendsChart() ? (
              <Line data={getCategoryTrendsChart()} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm italic">
                No category trend data available
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default Reports;
