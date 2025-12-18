import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import api from '../api/axios';

/**
 * Expenses page with CRUD operations and AI categorization.
 */

const Expenses = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: ''
  });
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  useEffect(() => {
    if (formData.description.length >= 3 && !editingExpense && showModal) {
      setIsCategorizing(true);
      setSuggestedCategory(null);

      const timer = setTimeout(async () => {
        await autoCategorizeDescription();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSuggestedCategory(null);
      setIsCategorizing(false);
    }
  }, [formData.description, editingExpense, showModal]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.expenses);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoCategorizeDescription = async () => {
    try {
      console.log('🔄 Sending categorization request for:', formData.description);

      const response = await api.post('/expenses/categorize', {
        description: formData.description
      });

      console.log('📥 Received response:', response.data);

      const category = response.data.category;
      setSuggestedCategory(category);

      setFormData(prev => ({
        ...prev,
        category: category
      }));

      console.log(`✨ AI suggested category: ${category}`);
    } catch (err) {
      console.error('❌ AI categorization failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/expenses', formData);
      setExpenses([response.data.expense, ...expenses]);
      closeModal();
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create expense');
      console.error('Error creating expense:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.put(`/expenses/${editingExpense.id}`, formData);
      setExpenses(expenses.map(exp =>
        exp.id === editingExpense.id ? response.data.expense : exp
      ));
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update expense');
      console.error('Error updating expense:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSuggestedCategory(null);
    setIsCategorizing(false);
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setError('');
    setSuggestedCategory(null);
    setIsCategorizing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();

    const localDate = new Date(year, month, day);

    return localDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const downloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      console.log('📥 Downloading Excel with params:', params.toString());

      const response = await api.get(`/expenses/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      console.log('✅ Excel response received:', response);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log('✅ Excel downloaded successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to download Excel';
      setError(errorMsg);
      console.error('❌ Excel download error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Expenses</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your spending</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center"
                title="Download as Excel"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
              >
                Dashboard
              </button>
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
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                + Add Expense
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalExpenses)}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Start Date"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="End Date"
              />

              {(filters.category || filters.startDate || filters.endDate) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No expenses found</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="text-primary hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-danger hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>

            <form onSubmit={editingExpense ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="What did you spend on?"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                  {!editingExpense && isCategorizing && (
                    <span className="ml-2 text-xs text-blue-500">
                      🤖 AI categorizing...
                    </span>
                  )}
                  {!editingExpense && suggestedCategory && !isCategorizing && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      ✨ AI suggested: {suggestedCategory}
                    </span>
                  )}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>
                    {isCategorizing ? 'AI is categorizing...' : 'Select or let AI categorize'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  {editingExpense ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
