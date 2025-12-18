import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import api from '../api/axios';

/**
 * Dashboard page with financial overview and recent transactions.
 */

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let expensesUrl = '/expenses';
      let incomeUrl = '/income';

      if (selectedMonth !== 'all-time') {
        const [year, month] = selectedMonth.split('-').map(Number);
        const startDateISO = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDateISO = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        expensesUrl = `/expenses?startDate=${startDateISO}&endDate=${endDateISO}`;
        incomeUrl = `/income?startDate=${startDateISO}&endDate=${endDateISO}`;
      }

      const [expensesRes, incomeRes, budgetRes] = await Promise.all([
        api.get(expensesUrl),
        api.get(incomeUrl),
        api.get('/budget/status')
      ]);

      const expenses = expensesRes.data.expenses || [];
      const income = incomeRes.data.income || [];
      const budgets = budgetRes.data.budgets || [];

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const balance = totalIncome - totalExpenses;

      setStats({
        totalIncome,
        totalExpenses,
        balance,
        monthlyIncome: totalIncome,
        monthlyExpenses: totalExpenses
      });

      const expenseTransactions = expenses.map(expense => ({
        ...expense,
        type: 'expense'
      }));

      const incomeTransactions = income.map(inc => ({
        ...inc,
        description: inc.source || 'Income',
        category: 'Income',
        type: 'income'
      }));

      const allTransactions = [...expenseTransactions, ...incomeTransactions];

      const sortedTransactions = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

      setRecentTransactions(sortedTransactions);
      setBudgetStatus(budgets);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0
      });
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (monthString) => {
    if (monthString === 'all-time') {
      return 'All Time';
    }
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name || user?.email}</p>
            </div>

            {/* Month Selector, Dark Mode Toggle, and Logout */}
            <div className="flex items-center gap-4">
              {/* Month Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="month-selector" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Viewing:
                </label>
                <div className="flex items-center gap-2">
                  {selectedMonth === 'all-time' ? (
                    <select
                      id="month-selector"
                      value={selectedMonth}
                      onChange={(e) => {
                        if (e.target.value === 'select-month') {
                          setSelectedMonth(getCurrentMonth());
                        } else {
                          setSelectedMonth(e.target.value);
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 dark:bg-gray-700 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
                    >
                      <option value="all-time">Across Time</option>
                      <option value="select-month">Select Month</option>
                    </select>
                  ) : (
                    <>
                      <select
                        id="month-selector"
                        value="select-month"
                        onChange={(e) => {
                          if (e.target.value === 'all-time') {
                            setSelectedMonth('all-time');
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 dark:bg-gray-700 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
                      >
                        <option value="all-time">Across Time</option>
                        <option value="select-month">Select Month</option>
                      </select>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        max={getCurrentMonth()} // Can't select future months
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 dark:bg-gray-700 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                aria-label="Toggle dark mode"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  // Sun icon for light mode
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  // Moon icon for dark mode
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Income</p>
              <div className="w-10 h-10 bg-success/10 dark:bg-success/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalIncome)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatMonth(selectedMonth)}</p>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expenses</p>
              <div className="w-10 h-10 bg-danger/10 dark:bg-danger/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalExpenses)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatMonth(selectedMonth)}</p>
          </div>

          {/* Balance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</p>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stats.balance >= 0 ? 'bg-primary/10 dark:bg-primary/20' : 'bg-warning/10 dark:bg-warning/20'
              }`}>
                <svg className={`w-5 h-5 ${stats.balance >= 0 ? 'text-primary' : 'text-warning'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-semibold ${stats.balance >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-warning'}`}>
              {formatCurrency(stats.balance)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatMonth(selectedMonth)}</p>
          </div>
        </div>

        {/* Two Column Layout: Transactions (Left) + Budget Alerts & Quick Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
                <button
                  onClick={() => navigate('/expenses')}
                  className="text-sm text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  View all
                </button>
              </div>
            </div>

            <div className="p-6">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                  <button
                    onClick={() => navigate('/expenses')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    Add your first transaction
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-success/10 dark:bg-success/20' : 'bg-danger/10 dark:bg-danger/20'
                        }`}>
                          {transaction.type === 'income' ? (
                            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-danger'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Budget Alerts & AI Chatbot */}
          <div className="space-y-6">
            {/* Budget Alerts - Compact Box */}
            {budgetStatus.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Budget Alerts</h2>
                    <button
                      onClick={() => navigate('/budget')}
                      className="text-xs text-primary hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center"
                    >
                      View All
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800" style={{maxHeight: '210px'}}>
                  {budgetStatus.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No budgets set</p>
                  ) : (
                    budgetStatus.map((budget) => {
                      let progressColor = 'bg-green-500';
                      if (budget.status === 'warning') progressColor = 'bg-yellow-500';
                      if (budget.status === 'danger') progressColor = 'bg-red-500';

                      return (
                        <div key={budget.budgetId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{budget.category}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className={`text-sm font-semibold ${
                                budget.status === 'safe' ? 'text-green-600 dark:text-green-500' :
                                budget.status === 'warning' ? 'text-yellow-600 dark:text-yellow-500' :
                                'text-red-600 dark:text-red-500'
                              }`}>
                                {budget.percentageUsed}%
                              </p>
                            </div>
                          </div>

                          {/* Compact Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${progressColor} transition-all duration-300`}
                              style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* AI Financial Advisor Quick Access */}
            <div
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-blue-600 dark:to-blue-700 border border-gray-200 dark:border-transparent rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] -mt-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Financial Advisor</h3>
              </div>
              <p className="text-gray-600 dark:text-white/90 text-sm mb-4">
                Get personalized insights about your spending, budgets, and savings. Ask me anything!
              </p>
              <div className="flex items-center text-blue-600 dark:text-white font-medium text-sm">
                <span>Start chatting</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
