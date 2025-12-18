import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Sidebar from '../components/common/Sidebar';
import api from '../api/axios';

/**
 * ============================================================================
 * RECURRING TRANSACTIONS PAGE - COMPREHENSIVE DOCUMENTATION
 * ============================================================================
 *
 * PURPOSE:
 * This page allows users to manage recurring transactions (expenses and incomes)
 * that are automatically generated on a schedule (daily, weekly, monthly, yearly).
 *
 * WHAT ARE RECURRING TRANSACTIONS?
 * Templates that define transactions to be created automatically at regular intervals.
 * Examples: Monthly rent, weekly groceries, annual subscriptions, daily commute.
 *
 * FEATURES:
 * - Tab-based interface: Switch between Recurring Expenses and Recurring Incomes
 * - CREATE: Add new recurring templates via modal
 * - READ: List all templates with status badges (Active/Paused)
 * - UPDATE: Edit templates, pause/resume automation
 * - DELETE: Remove templates (preserves past generated transactions)
 * - Visual indicators: Next due date, frequency badge, active status
 *
 * STATE MANAGEMENT:
 * - activeTab: 'expenses' or 'incomes' (controls which list is displayed)
 * - recurringExpenses: Array of recurring expense templates
 * - recurringIncomes: Array of recurring income templates
 * - loading: Loading state for API calls
 * - error: Error message display
 * - showModal: Toggle create/edit modal
 * - editingItem: Template being edited (null for create mode)
 * - formData: Form input values
 *
 * COMPONENT ARCHITECTURE:
 * RecurringTransactions (this file)
 * ├── Tab Navigation (Expenses/Incomes)
 * ├── Add Button (opens modal)
 * ├── List of Cards (recurring templates)
 * │   ├── Card Header (description, amount, frequency badge)
 * │   ├── Card Body (next due date, status)
 * │   └── Card Actions (edit, pause/resume, delete buttons)
 * └── Modal (create/edit form)
 *     ├── Form Fields (amount, description, category, frequency, dates)
 *     └── Submit/Cancel buttons
 *
 * USER WORKFLOW:
 * 1. User selects tab (Expenses or Incomes)
 * 2. User clicks "Add Recurring Expense/Income"
 * 3. Modal opens with form fields
 * 4. User fills: amount, description, category/source, frequency, start date, optional end date
 * 5. On submit: Template created, next due date calculated
 * 6. Template appears in list with "Active" badge
 * 7. Cron job runs daily at midnight, generates transactions when nextDate <= today
 * 8. User can pause (stops generation), resume, edit, or delete templates
 *
 * TECHNICAL DETAILS:
 * - API Endpoints: /api/recurring/expenses and /api/recurring/incomes
 * - CRUD Operations: GET (list), POST (create), PATCH (update), DELETE (delete)
 * - Date Handling: Uses native JavaScript Date with YYYY-MM-DD format
 * - Frequency Options: daily, weekly, monthly, yearly
 * - Status Toggle: isActive field controls whether template generates transactions
 *
 * STYLING:
 * - Tailwind CSS for responsive design
 * - Color-coded status badges: Green (Active), Gray (Paused)
 * - Color-coded frequency badges: Blue (Daily), Purple (Weekly), Pink (Monthly), Orange (Yearly)
 * - Hover effects and smooth transitions
 * - Mobile-responsive grid layout
 *
 * INTERVIEW TALKING POINTS:
 * Q: How does this differ from regular expenses/income pages?
 * A: Regular pages show actual transactions. This page shows TEMPLATES that
 *    define what transactions to create automatically. One template generates
 *    many transactions over time.
 *
 * Q: What happens when user deletes a recurring template?
 * A: Template deleted, future transactions stop. Past generated transactions
 *    are preserved for financial history (recurringId set to NULL).
 *
 * Q: How does pause/resume work?
 * A: Toggles isActive field. Paused templates (isActive=false) are excluded
 *    from cron job query, so no transactions generated until resumed.
 *
 * Q: Why separate expenses and incomes?
 * A: Different data models (expenses have 'category', incomes have 'source').
 *    Cleaner UI with tabs, easier to manage, matches backend schema design.
 */

const RecurringTransactions = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // =============================================
  // STATE: Tab Navigation
  // =============================================
  /**
   * activeTab: Controls which list is displayed
   * - 'expenses': Show recurring expenses
   * - 'incomes': Show recurring incomes
   */
  const [activeTab, setActiveTab] = useState('expenses');

  // =============================================
  // STATE: Data Lists
  // =============================================
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringIncomes, setRecurringIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =============================================
  // STATE: Modal & Form
  // =============================================
  /**
   * showModal: Boolean to show/hide create/edit modal
   * editingItem: Object being edited (null = create mode, object = edit mode)
   * formData: Form input values
   */
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',  // For expenses
    source: '',  // For incomes
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],  // Today in YYYY-MM-DD
    endDate: '',  // Optional
    isActive: true
  });

  // =============================================
  // STATE: AI Categorization
  // =============================================
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  // =============================================
  // STATE: Delete Confirmation
  // =============================================
  const [deleteConfirm, setDeleteConfirm] = useState(null);  // ID of item to delete

  // =============================================
  // CONSTANTS: Categories & Frequencies
  // =============================================
  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Personal Care', 'Housing', 'Miscellaneous'];
  const frequencies = [
    { value: 'daily', label: 'Daily', color: 'bg-blue-100 text-blue-800' },
    { value: 'weekly', label: 'Weekly', color: 'bg-purple-100 text-purple-800' },
    { value: 'monthly', label: 'Monthly', color: 'bg-pink-100 text-pink-800' },
    { value: 'yearly', label: 'Yearly', color: 'bg-orange-100 text-orange-800' }
  ];

  // =============================================
  // EFFECT: Fetch data on mount and tab change
  // =============================================
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // =============================================
  // EFFECT: AI Categorization with debounce
  // =============================================
  /**
   * Triggers AI categorization 500ms after user stops typing
   * Only for new recurring expenses (not editing, and only expenses tab)
   */
  useEffect(() => {
    // Only categorize if:
    // 1. Description has at least 3 characters
    // 2. Not editing an existing item
    // 3. Modal is open
    // 4. Active tab is expenses (not incomes)
    if (
      formData.description.length >= 3 &&
      !editingItem &&
      showModal &&
      activeTab === 'expenses'
    ) {
      setIsCategorizing(true);
      setSuggestedCategory(null);

      // Debounce: Wait 500ms after user stops typing
      const timer = setTimeout(async () => {
        await autoCategorizeDescription();
      }, 500);

      // Cleanup: Cancel timer if description changes before 500ms
      return () => clearTimeout(timer);
    } else {
      setSuggestedCategory(null);
      setIsCategorizing(false);
    }
  }, [formData.description, editingItem, showModal, activeTab]);

  // =============================================
  // API FUNCTION: Fetch recurring transactions
  // =============================================
  /**
   * Fetches both recurring expenses and incomes
   * Called on component mount and when tab changes
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [expensesRes, incomesRes] = await Promise.all([
        api.get('/recurring/expenses'),
        api.get('/recurring/incomes')
      ]);

      setRecurringExpenses(expensesRes.data.data || []);
      setRecurringIncomes(incomesRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recurring transactions');
      console.error('Error fetching recurring transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // API FUNCTION: AI Categorization
  // =============================================
  /**
   * Calls AI endpoint to auto-categorize expense description
   * Uses existing /api/expenses/categorize endpoint
   *
   * Flow:
   * 1. Send description to AI endpoint
   * 2. Receive suggested category
   * 3. Auto-populate category field
   * 4. Silent fail if API error (user can still manually select)
   *
   * INTERVIEW TALKING POINT:
   * - Why debounce? → Reduce API calls, wait for user to finish typing
   * - Why 500ms? → Balance between responsiveness and API efficiency
   * - Silent failure → User can still manually select if AI fails
   */
  const autoCategorizeDescription = async () => {
    try {
      console.log('🔄 Sending categorization request for:', formData.description);

      const response = await api.post('/expenses/categorize', {
        description: formData.description
      });

      console.log('📥 Received response:', response.data);

      const category = response.data.category;
      setSuggestedCategory(category);

      // Auto-populate category field with AI suggestion
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
      // Silent fail - user can still manually select category
    } finally {
      setIsCategorizing(false);
    }
  };

  // =============================================
  // API FUNCTION: Create or Update
  // =============================================
  /**
   * Handles both create and update operations
   * - If editingItem exists: PATCH request to update
   * - If editingItem is null: POST request to create
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = activeTab === 'expenses' ? '/recurring/expenses' : '/recurring/incomes';
      const payload = {
        amount: parseFloat(formData.amount),
        description: activeTab === 'expenses' ? formData.description : undefined,
        source: activeTab === 'incomes' ? formData.source : undefined,
        category: activeTab === 'expenses' ? formData.category : undefined,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        isActive: formData.isActive
      };

      if (editingItem) {
        // UPDATE operation
        await api.patch(`${endpoint}/${editingItem.id}`, payload);
      } else {
        // CREATE operation
        await api.post(endpoint, payload);
      }

      // Reset form and close modal
      setShowModal(false);
      setEditingItem(null);
      resetForm();

      // Refresh data
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save recurring transaction');
      console.error('Error saving recurring transaction:', err);
    }
  };

  // =============================================
  // API FUNCTION: Delete
  // =============================================
  /**
   * Deletes a recurring template
   * Shows confirmation dialog first
   */
  const handleDelete = async (id) => {
    try {
      setError('');
      const endpoint = activeTab === 'expenses' ? '/recurring/expenses' : '/recurring/incomes';
      await api.delete(`${endpoint}/${id}`);

      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete recurring transaction');
      console.error('Error deleting recurring transaction:', err);
    }
  };

  // =============================================
  // API FUNCTION: Toggle Active Status (Pause/Resume)
  // =============================================
  /**
   * Toggles isActive field to pause or resume transaction generation
   * - Paused (isActive=false): Cron skips this template
   * - Active (isActive=true): Cron generates transactions when due
   */
  const handleToggleActive = async (item) => {
    try {
      setError('');
      const endpoint = activeTab === 'expenses' ? '/recurring/expenses' : '/recurring/incomes';
      await api.patch(`${endpoint}/${item.id}`, {
        isActive: !item.isActive
      });

      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
      console.error('Error toggling active status:', err);
    }
  };

  // =============================================
  // UI FUNCTION: Open modal for editing
  // =============================================
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      amount: item.amount,
      description: item.description || '',
      category: item.category || 'Food',
      source: item.source || '',
      frequency: item.frequency,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      isActive: item.isActive
    });
    setShowModal(true);
  };

  // =============================================
  // UI FUNCTION: Open modal for creating
  // =============================================
  const openCreateModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  // =============================================
  // UI FUNCTION: Reset form to default values
  // =============================================
  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: 'Food',
      source: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true
    });
  };

  // =============================================
  // UI FUNCTION: Close modal
  // =============================================
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  // =============================================
  // UI HELPER: Format date for display
  // =============================================
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // =============================================
  // UI HELPER: Get frequency badge color
  // =============================================
  const getFrequencyColor = (frequency) => {
    const freq = frequencies.find(f => f.value === frequency);
    return freq ? freq.color : 'bg-gray-100 text-gray-800';
  };

  // =============================================
  // RENDER: Current list based on active tab
  // =============================================
  const currentList = activeTab === 'expenses' ? recurringExpenses : recurringIncomes;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Recurring Transactions
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Automate your regular expenses and income
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
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tab Navigation Card */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Recurring Expenses
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                  {recurringExpenses.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('incomes')}
                className={`${
                  activeTab === 'incomes'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Recurring Incomes
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                  {recurringIncomes.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Summary Stats inside the card */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active {activeTab === 'expenses' ? 'Expenses' : 'Incomes'}
                </p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {currentList.filter(item => item.isActive).length}
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-sm"
              >
                + Add Recurring {activeTab === 'expenses' ? 'Expense' : 'Income'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading recurring transactions...</p>
          </div>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No recurring {activeTab} yet
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Add your first recurring {activeTab === 'expenses' ? 'expense' : 'income'}
            </button>
          </div>
        ) : (
          /* Grid of Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {item.description || item.source}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      ₹{item.amount.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(item.frequency)}`}>
                    {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="space-y-2 mb-4">
                  {activeTab === 'expenses' && item.category && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Category:</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {item.category}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">Next Due:</span>
                    <span>{formatDate(item.nextDate)}</span>
                  </div>
                  {item.endDate && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Ends:</span>
                      <span>{formatDate(item.endDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <span className="font-medium mr-2 text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {item.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`flex-1 ${
                      item.isActive
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  >
                    {item.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingItem ? 'Edit' : 'Add'} Recurring {activeTab === 'expenses' ? 'Expense' : 'Income'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1200"
                />
              </div>

              {/* Description or Source */}
              {activeTab === 'expenses' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gym Membership"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Monthly Salary"
                  />
                </div>
              )}

              {/* Category (only for expenses) */}
              {activeTab === 'expenses' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                    {!editingItem && isCategorizing && (
                      <span className="ml-2 text-xs text-blue-500">
                        🤖 AI categorizing...
                      </span>
                    )}
                    {!editingItem && suggestedCategory && !isCategorizing && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        ✨ AI suggested: {suggestedCategory}
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for no end date</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Active (transactions will be generated automatically)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Recurring {activeTab === 'expenses' ? 'Expense' : 'Income'}?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will stop future automatic transactions. Past transactions will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;
