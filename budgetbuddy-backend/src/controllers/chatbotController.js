// Handles chat requests and prepares user financial data for AI responses.

const { getChatResponse, quickActions } = require('../services/chatbotService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Processes chat messages, persists conversation, and returns AI responses.
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: 'Message is too long. Please keep it under 500 characters.'
      });
    }

    const userMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message.trim(),
        timestamp: new Date()
      }
    });

    console.log(`💬 Saved user message: ${userMessage.id}`);

    const financialData = await fetchUserFinancialData(userId);

    console.log('\n💰 Financial Data Summary for User:', userId);
    console.log('├─ Total Income: ₹' + financialData.totalIncome);
    console.log('├─ Total Expenses: ₹' + financialData.totalExpenses);
    console.log('├─ Transactions: ' + financialData.transactionCount);
    console.log('├─ Categories: ' + (financialData.categoryBreakdown?.length || 0));
    console.log('└─ Month: ' + financialData.monthLabel + '\n');

    const reply = await getChatResponse(userId, message, financialData);

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      }
    });

    console.log(`🤖 Saved AI response: ${assistantMessage.id}`);

    res.json({
      reply,
      timestamp: assistantMessage.timestamp,
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};

// Aggregates user's complete financial data for AI context.
const fetchUserFinancialData = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const prevMonth = new Date(now);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const previousMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const [income, expenses, budgets] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId: userId
        },
        select: {
          amount: true,
          source: true,
          date: true
        },
        orderBy: {
          date: 'desc'
        }
      }),

      prisma.expense.findMany({
        where: {
          userId: userId
        },
        select: {
          amount: true,
          category: true,
          description: true,
          date: true
        },
        orderBy: {
          date: 'desc'
        }
      }),

      prisma.budgetLimit.findMany({
        where: {
          userId: userId
        },
        select: {
          category: true,
          limitAmount: true,
          month: true
        },
        orderBy: {
          month: 'desc'
        }
      })
    ]);

    const totalIncome = income.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const remainingMoney = totalIncome - totalExpenses;
    const savings = remainingMoney > 0 ? remainingMoney : 0;

    const categoryTotals = expenses.reduce((acc, exp) => {
      const category = exp.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(exp.amount);
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const dailyTotals = expenses.reduce((acc, exp) => {
      const date = exp.date.toISOString().split('T')[0]; // YYYY-MM-DD
      acc[date] = (acc[date] || 0) + Number(exp.amount);
      return acc;
    }, {});

    const dailySpending = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);

    const budgetsWithStatus = budgets.map(budget => {
      const budgetDate = new Date(budget.month);
      const budgetYear = budgetDate.getFullYear();
      const budgetMonth = budgetDate.getMonth() + 1;

      const spent = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          const expYear = expDate.getFullYear();
          const expMonth = expDate.getMonth() + 1;

          return exp.category === budget.category &&
                 expYear === budgetYear &&
                 expMonth === budgetMonth;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      const percentageUsed = budget.limitAmount > 0
        ? ((spent / Number(budget.limitAmount)) * 100).toFixed(1)
        : 0;

      let status = 'safe';
      if (percentageUsed >= 100) status = 'danger';
      else if (percentageUsed >= 80) status = 'warning';

      const monthStr = `${budgetYear}-${String(budgetMonth).padStart(2, '0')}`;

      return {
        category: budget.category,
        month: monthStr,
        limitAmount: Number(budget.limitAmount),
        currentSpent: spent,
        percentageUsed: Number(percentageUsed),
        remaining: Number(budget.limitAmount) - spent,
        status
      };
    }).sort((a, b) => b.percentageUsed - a.percentageUsed);

    return {
      totalIncome,
      totalExpenses,
      remainingMoney,
      savings,
      categoryBreakdown,
      dailySpending,
      budgets: budgetsWithStatus,
      monthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      transactionCount: expenses.length,
      incomeCount: income.length
    };

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      remainingMoney: 0,
      savings: 0,
      categoryBreakdown: [],
      dailySpending: [],
      budgets: [],
      monthLabel: 'Current Month',
      transactionCount: 0,
      incomeCount: 0
    };
  }
};

// Retrieves chat history with cursor-based pagination.
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before;

    const where = { userId };
    if (before) {
      where.timestamp = { lt: new Date(before) };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        timestamp: true
      }
    });

    const total = await prisma.chatMessage.count({ where: { userId } });

    const hasMore = messages.length === limit;

    console.log(`📜 Retrieved ${messages.length} messages for user ${userId}`);

    res.json({
      messages: messages.reverse(),
      total,
      hasMore
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history'
    });
  }
};

// Clears all chat messages for the authenticated user.
const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.chatMessage.deleteMany({
      where: { userId }
    });

    console.log(`🗑️ Cleared ${result.count} messages for user ${userId}`);

    res.json({
      message: 'Chat history cleared successfully',
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      error: 'Failed to clear chat history'
    });
  }
};

// Returns pre-defined quick action prompts for the chatbot.
const getQuickActions = async (req, res) => {
  try {
    res.json({
      quickActions
    });
  } catch (error) {
    console.error('Quick actions error:', error);
    res.status(500).json({
      error: 'Failed to fetch quick actions'
    });
  }
};

module.exports = {
  chat,
  getChatHistory,
  clearChatHistory,
  getQuickActions
};
