import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import api from '../services/api';

// Budget limits management with CRUD operations and filtering.

function Budget() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: '',
    month: new Date().toISOString().slice(0, 7)
  });
  const [filters, setFilters] = useState({
    month: '',
    category: ''
  });

  useEffect(() => {
    fetchBudgets();
  }, [filters]);

  // Fetches budgets with optional filters (month, category).
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.month) {
        const monthWithDay = filters.month + '-01';
        params.append('month', monthWithDay);
      }
      if (filters.category) params.append('category', filters.category);

      const response = await api.get(`/budget?${params.toString()}`);
      setBudgets(response.data.budgets || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err.response?.data?.error || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  // Creates a new budget limit.
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      if (!formData.category || !formData.limitAmount || !formData.month) {
        setError('All fields are required');
        return;
      }

      if (parseFloat(formData.limitAmount) <= 0) {
        setError('Limit amount must be greater than 0');
        return;
      }

      const monthDate = formData.month + '-01';

      await api.post('/budget', {
        category: formData.category,
        limitAmount: parseFloat(formData.limitAmount),
        month: monthDate
      });

      setShowModal(false);
      resetForm();
      fetchBudgets();
    } catch (err) {
      console.error('Error creating budget:', err);

      if (err.response?.status === 409) {
        setError(err.response.data.error + '. ' + (err.response.data.suggestion || ''));
      } else {
        setError(err.response?.data?.error || 'Failed to create budget');
      }
    }
  };

  // Updates an existing budget limit.
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!formData.category || !formData.limitAmount || !formData.month) {
        setError('All fields are required');
        return;
      }

      if (parseFloat(formData.limitAmount) <= 0) {
        setError('Limit amount must be greater than 0');
        return;
      }

      const monthDate = formData.month + '-01';

      await api.put(`/budget/${editingBudget.id}`, {
        category: formData.category,
        limitAmount: parseFloat(formData.limitAmount),
        month: monthDate
      });

      setShowModal(false);
      resetForm();
      setEditingBudget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Error updating budget:', err);

      if (err.response?.status === 409) {
        setError(err.response.data.error + '. ' + (err.response.data.suggestion || ''));
      } else {
        setError(err.response?.data?.error || 'Failed to update budget');
      }
    }
  };

  // Deletes a budget limit with confirmation.
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this budget limit?');
    if (!confirmed) return;

    try {
      await api.delete(`/budget/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError(err.response?.data?.error || 'Failed to delete budget');
    }
  };

  // Opens modal for creating new budget.
  const openCreateModal = () => {
    resetForm();
    setEditingBudget(null);
    setError(null);
    setShowModal(true);
  };

  // Opens modal for editing existing budget.
  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limitAmount: budget.limitAmount.toString(),
      month: budget.month.substring(0, 7)
    });
    setError(null);
    setShowModal(true);
  };

  // Closes modal and resets state.
  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setEditingBudget(null);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      limitAmount: '',
      month: new Date().toISOString().slice(0, 7)
    });
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

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    
    {/* Header */}
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Budget Limits</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set and manage your spending limits</p>
          </div>
          <div className="flex space-x-3">
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
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              + Set Budget Limit
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters and Summary Card */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Summary Stats (optional - you can add total budgets, etc.) */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget Limits</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {budgets.length} {budgets.length === 1 ? 'Limit' : 'Limits'}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="month"
              name="month"
              placeholder="Filter by month"
              value={filters.month}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
            {(filters.month || filters.category) && (
              <button
                onClick={() => setFilters({ month: '', category: '' })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No budget limits set yet</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Set your first budget limit
          </button>
        </div>
      ) : (
        /* Budgets Table */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Limit Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {budgets.map(budget => (
                <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatMonth(budget.month)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                      {budget.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(budget.limitAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(budget.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="text-primary hover:text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
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

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingBudget ? 'Edit Budget Limit' : 'Set Budget Limit'}</h2>
                <button onClick={closeModal} className="close-btn">&times;</button>
              </div>

              <form onSubmit={editingBudget ? handleUpdate : handleCreate}>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Food, Transport, Entertainment"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="limitAmount">Limit Amount ($) *</label>
                  <input
                    type="number"
                    id="limitAmount"
                    name="limitAmount"
                    value={formData.limitAmount}
                    onChange={handleInputChange}
                    placeholder="500"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="month">Month *</label>
                  <input
                    type="month"
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}

export default Budget;
