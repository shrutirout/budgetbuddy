import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import api from '../api/axios';

// Income management page with CRUD operations and filtering.

const Income = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    source: '',
    startDate: '',
    endDate: ''
  });

  const sources = ['Salary', 'Freelance', 'Investment', 'Gift', 'Bonus', 'Other'];

  useEffect(() => {
    fetchIncome();
  }, [filters]);

  // Fetches income entries with optional filters (source, date range).
  const fetchIncome = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.source) params.append('source', filters.source);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/income?${params.toString()}`);
      setIncome(response.data.income);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch income');
      console.error('Error fetching income:', err);
    } finally {
      setLoading(false);
    }
  };

  // Creates new income entry and refreshes the list.
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/income', formData);
      setIncome([response.data.income, ...income]);
      closeModal();
      fetchIncome();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create income');
      console.error('Error creating income:', err);
    }
  };

  // Updates existing income entry in the list.
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.put(`/income/${editingIncome.id}`, formData);
      setIncome(income.map(inc =>
        inc.id === editingIncome.id ? response.data.income : inc
      ));
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update income');
      console.error('Error updating income:', err);
    }
  };

  // Deletes income entry after confirmation.
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }

    try {
      await api.delete(`/income/${id}`);
      setIncome(income.filter(inc => inc.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete income');
      console.error('Error deleting income:', err);
    }
  };

  // Opens modal for creating new income entry.
  const openCreateModal = () => {
    setEditingIncome(null);
    setFormData({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // Opens modal for editing with pre-filled data.
  const openEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount,
      source: income.source || '',
      date: new Date(income.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // Closes modal and resets state.
  const closeModal = () => {
    setShowModal(false);
    setEditingIncome(null);
    setError('');
  };

  // Handles form input changes.
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
      source: '',
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

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

  const downloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/income/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log('✅ Excel downloaded successfully');
    } catch (err) {
      setError('Failed to download Excel');
      console.error('Excel download error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Income</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your earnings</p>
            </div>
            <div className="flex space-x-3">
              {/* Download Button */}
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
              {/* Dark Mode Toggle */}
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
                onClick={openCreateModal}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                + Add Income
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}

        {/* Filters and Stats */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Total */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-3xl font-semibold text-success">{formatCurrency(totalIncome)}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Source Filter */}
              <select
                name="source"
                value={filters.source}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-success"
              >
                <option value="">All Sources</option>
                {sources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>

              {/* Date Range */}
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-success"
                placeholder="Start Date"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-success"
                placeholder="End Date"
              />

              {/* Clear Filters */}
              {(filters.source || filters.startDate || filters.endDate) && (
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

        {/* Income List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading income...</p>
          </div>
        ) : income.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No income entries found</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-success text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              Add your first income
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {income.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                        {entry.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(entry)}
                        className="text-primary hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-danger hover:text-red-600 dark:hover:text-red-400"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </h2>

            <form onSubmit={editingIncome ? handleUpdate : handleCreate}>
              {/* Amount */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="0.00"
                />
              </div>

              {/* Source */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source (Optional)
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  list="sources"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-success"
                  placeholder="e.g., Salary, Freelance"
                />
                <datalist id="sources">
                  {sources.map(src => (
                    <option key={src} value={src} />
                  ))}
                </datalist>
              </div>

              {/* Date */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-success"
                />
              </div>

              {/* Buttons */}
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
                  className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition font-medium"
                >
                  {editingIncome ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
