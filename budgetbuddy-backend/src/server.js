const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const chatbotRoutes = require('./routes/chatbot');
const exportRoutes = require('./routes/exportRoutes');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import cron scheduler
const { initializeScheduler } = require('./jobs/recurringScheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BudgetBuddy API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BudgetBuddy API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      expenses: '/api/expenses',
      income: '/api/income',
      dashboard: '/api/dashboard',
      budget: '/api/budget',
      analytics: '/api/analytics',
      recurring: '/api/recurring',
      chatbot: '/api/chatbot'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', exportRoutes); // Export routes (uses multiple paths)

// Error handling middleware (must be AFTER all routes)
app.use(notFoundHandler);  // Handle 404 errors
app.use(errorHandler);     // Handle all other errors

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);

  // Initialize recurring transactions cron scheduler
  initializeScheduler();
});
