const { PrismaClient } = require('@prisma/client');
const { categorizeExpense } = require('../services/categorizationService');
const prisma = new PrismaClient();

// Handles CRUD operations for expenses with AI-powered categorization
const createExpense = async (req, res) => {
  try {
    const { amount, description, category, date, isRecurring, recurringId } = req.body;
    const userId = req.user.id;

    if (!amount || !description || !date) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'description', 'date']
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Use AI categorization if category not provided
    let finalCategory = category;
    let aiCategorized = false;

    if (!category || category.trim() === '') {
      console.log(`🤖 Auto-categorizing expense: "${description}"`);
      finalCategory = await categorizeExpense(description);
      aiCategorized = true;
      console.log(`✅ AI categorized "${description}" → ${finalCategory}`);
    } else {
      console.log(`👤 User provided category: ${category} for "${description}"`);
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        description,
        category: finalCategory,
        date: new Date(date),
        isRecurring: isRecurring || false,
        recurringId: recurringId || null
      }
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
      aiCategorized
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// Retrieves expenses with optional filters
const getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, startDate, endDate, limit, offset } = req.query;

    const where = {
      userId,
      ...(category && { category }),
    };

    // Handle date range filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          return res.status(400).json({ error: 'Invalid startDate format' });
        }
        const year = startDateObj.getUTCFullYear();
        const month = startDateObj.getUTCMonth();
        const day = startDateObj.getUTCDate();
        where.date.gte = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          return res.status(400).json({ error: 'Invalid endDate format' });
        }
        const year = endDateObj.getUTCFullYear();
        const month = endDateObj.getUTCMonth();
        const day = endDateObj.getUTCDate();
        where.date.lte = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) })
    });

    const total = await prisma.expense.count({ where });

    res.json({
      expenses,
      pagination: {
        total,
        limit: limit ? parseInt(limit) : total,
        offset: offset ? parseInt(offset) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Retrieves single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await prisma.expense.findFirst({
      where: { id, userId }
    });

    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found or you do not have permission to view it'
      });
    }

    res.json({ expense });

  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

// Updates existing expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, description, category, date } = req.body;

    const existingExpense = await prisma.expense.findFirst({
      where: { id, userId }
    });

    if (!existingExpense) {
      return res.status(404).json({
        error: 'Expense not found or you do not have permission to update it'
      });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = new Date(date);

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Expense updated successfully',
      expense
    });

  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Deletes expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingExpense = await prisma.expense.findFirst({
      where: { id, userId }
    });

    if (!existingExpense) {
      return res.status(404).json({
        error: 'Expense not found or you do not have permission to delete it'
      });
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.json({
      message: 'Expense deleted successfully',
      deletedExpense: existingExpense
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Calculates expense statistics for a given period
const getExpenseStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const where = {
      userId,
      date: {
        gte: start,
        lte: end
      }
    };

    const aggregation = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true }
    });

    const byCategory = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: { id: true }
    });

    res.json({
      period: {
        start,
        end
      },
      total: aggregation._sum.amount || 0,
      count: aggregation._count.id || 0,
      byCategory: byCategory.map(cat => ({
        category: cat.category,
        total: cat._sum.amount,
        count: cat._count.id
      }))
    });

  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({ error: 'Failed to fetch expense statistics' });
  }
};

// Categorizes a description using AI without creating an expense
const categorizeExpenseEndpoint = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        error: 'Description is required and must be a string'
      });
    }

    if (description.trim().length === 0) {
      return res.status(400).json({
        error: 'Description cannot be empty'
      });
    }

    console.log(`📋 Categorizing: "${description}"`);
    const category = await categorizeExpense(description);

    res.json({
      description,
      category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Categorization endpoint error:', error);
    res.status(500).json({
      error: 'Failed to categorize expense',
      message: 'AI service temporarily unavailable. Please select category manually.'
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  categorizeExpenseEndpoint
};
