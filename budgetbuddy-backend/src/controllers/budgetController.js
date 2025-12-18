const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handles CRUD operations for budget limits
const createBudget = async (req, res) => {
  try {
    const { category, limitAmount, month } = req.body;
    const userId = req.user.id;

    if (!category || !limitAmount || !month) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['category', 'limitAmount', 'month']
      });
    }

    if (limitAmount <= 0) {
      return res.status(400).json({
        error: 'Limit amount must be greater than 0'
      });
    }

    const monthDate = new Date(month + 'T00:00:00.000Z');

    // Check if budget already exists for this category and month
    const existingBudget = await prisma.budgetLimit.findFirst({
      where: {
        userId,
        category,
        month: monthDate
      }
    });

    if (existingBudget) {
      return res.status(409).json({
        error: `Budget limit for ${category} already exists for this month`,
        suggestion: 'Update the existing budget instead',
        existingBudget
      });
    }

    const budget = await prisma.budgetLimit.create({
      data: {
        userId,
        category,
        limitAmount: parseFloat(limitAmount),
        month: monthDate
      }
    });

    res.status(201).json({
      message: 'Budget limit created successfully',
      budget
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget limit' });
  }
};

// Retrieves budget limits with optional filters
const getAllBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, category } = req.query;

    const where = {
      userId,
      ...(category && { category }),
    };

    // Handle month filter with timezone-aware range matching
    if (month) {
      const monthDate = new Date(month);
      const year = monthDate.getUTCFullYear();
      const monthNum = monthDate.getUTCMonth();

      const rangeStart = new Date(Date.UTC(year, monthNum, 0, 12, 0, 0, 0));
      const rangeEnd = new Date(Date.UTC(year, monthNum + 1, 0, 12, 0, 0, 0));

      where.month = {
        gte: rangeStart,
        lt: rangeEnd
      };
    }

    const budgets = await prisma.budgetLimit.findMany({
      where,
      orderBy: [
        { month: 'desc' },
        { category: 'asc' }
      ]
    });

    res.json({
      budgets,
      count: budgets.length
    });

  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budget limits' });
  }
};

// Retrieves single budget limit by ID
const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const budget = await prisma.budgetLimit.findFirst({
      where: { id, userId }
    });

    if (!budget) {
      return res.status(404).json({
        error: 'Budget limit not found or you do not have permission to view it'
      });
    }

    res.json({ budget });

  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget limit' });
  }
};

// Updates existing budget limit
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, limitAmount, month } = req.body;

    const existingBudget = await prisma.budgetLimit.findFirst({
      where: { id, userId }
    });

    if (!existingBudget) {
      return res.status(404).json({
        error: 'Budget limit not found or you do not have permission to update it'
      });
    }

    if (limitAmount !== undefined && limitAmount <= 0) {
      return res.status(400).json({
        error: 'Limit amount must be greater than 0'
      });
    }

    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (limitAmount !== undefined) updateData.limitAmount = parseFloat(limitAmount);
    if (month !== undefined) updateData.month = new Date(month + 'T00:00:00.000Z');

    // Check for conflicts if changing category or month
    if (category !== undefined || month !== undefined) {
      const newCategory = category || existingBudget.category;
      const newMonth = month ? new Date(month + 'T00:00:00.000Z') : existingBudget.month;

      const conflictingBudget = await prisma.budgetLimit.findFirst({
        where: {
          userId,
          category: newCategory,
          month: newMonth,
          id: { not: id }
        }
      });

      if (conflictingBudget) {
        return res.status(409).json({
          error: `Budget limit for ${newCategory} already exists for this month`,
          suggestion: 'Delete the existing budget first or choose a different category/month'
        });
      }
    }

    const budget = await prisma.budgetLimit.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Budget limit updated successfully',
      budget
    });

  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget limit' });
  }
};

// Deletes budget limit
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingBudget = await prisma.budgetLimit.findFirst({
      where: { id, userId }
    });

    if (!existingBudget) {
      return res.status(404).json({
        error: 'Budget limit not found or you do not have permission to delete it'
      });
    }

    await prisma.budgetLimit.delete({
      where: { id }
    });

    res.json({
      message: 'Budget limit deleted successfully',
      deletedBudget: existingBudget
    });

  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget limit' });
  }
};

// Calculates spending vs budget with alert levels
const getBudgetStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    const targetMonth = month ? new Date(month) : new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    const budgets = await prisma.budgetLimit.findMany({
      where: {
        userId,
        month: startOfMonth
      }
    });

    if (budgets.length === 0) {
      return res.json({
        month: startOfMonth,
        budgets: [],
        summary: {
          totalBudget: 0,
          totalSpent: 0,
          categoriesOverBudget: 0
        },
        message: 'No budget limits set for this month'
      });
    }

    // Calculate spending for each category
    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await prisma.expense.aggregate({
          where: {
            userId,
            category: budget.category,
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: { amount: true },
          _count: { id: true }
        });

        const spent = expenses._sum.amount || 0;
        const remaining = budget.limitAmount - spent;
        const percentageUsed = (spent / budget.limitAmount) * 100;

        let status;
        if (percentageUsed < 80) {
          status = 'safe';
        } else if (percentageUsed < 100) {
          status = 'warning';
        } else {
          status = 'danger';
        }

        return {
          budgetId: budget.id,
          category: budget.category,
          limit: budget.limitAmount,
          spent: spent,
          remaining: remaining,
          percentageUsed: Math.round(percentageUsed),
          status: status,
          isOverBudget: spent > budget.limitAmount,
          transactionCount: expenses._count.id
        };
      })
    );

    const summary = {
      totalBudget: budgets.reduce((sum, b) => sum + b.limitAmount, 0),
      totalSpent: budgetStatus.reduce((sum, b) => sum + b.spent, 0),
      categoriesOverBudget: budgetStatus.filter(b => b.isOverBudget).length,
      categoriesWithWarning: budgetStatus.filter(b => b.status === 'warning').length,
      categoriesSafe: budgetStatus.filter(b => b.status === 'safe').length
    };

    res.json({
      month: startOfMonth,
      budgets: budgetStatus,
      summary
    });

  } catch (error) {
    console.error('Error fetching budget status:', error);
    res.status(500).json({ error: 'Failed to fetch budget status' });
  }
};

module.exports = {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus
};
