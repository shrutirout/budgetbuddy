const { PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// Manages recurring expenses and income transactions with automatic generation.

// Returns all recurring expenses for the authenticated user.
const getRecurringExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const recurring = await prisma.recurringExpense.findMany({
      where: { userId },
      include: {
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { nextDate: 'asc' }
    });

    res.json({
      success: true,
      data: recurring
    });
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recurring expenses'
    });
  }
};

// Creates a new recurring expense template.
const createRecurringExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description, category, frequency, startDate, endDate } = req.body;

    if (!amount || !description || !category || !frequency || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, description, category, frequency, startDate'
      });
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const recurring = await prisma.recurringExpense.create({
      data: {
        userId,
        amount: parseFloat(amount),
        description,
        category,
        frequency,
        startDate: start,
        nextDate: start,
        endDate: end,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Recurring expense created successfully',
      data: recurring
    });
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recurring expense'
    });
  }
};

// Updates an existing recurring expense.
const updateRecurringExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const existing = await prisma.recurringExpense.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Recurring expense not found'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recurring expense'
      });
    }

    if (updates.frequency) {
      const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
      if (!validFrequencies.includes(updates.frequency)) {
        return res.status(400).json({
          success: false,
          message: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
        });
      }
    }

    // Validate amount if provided
    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    delete updates.userId;
    delete updates.startDate;
    delete updates.createdAt;

    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: updates
    });

    res.json({
      success: true,
      message: 'Recurring expense updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recurring expense'
    });
  }
};

// Deletes a recurring expense template.
const deleteRecurringExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.recurringExpense.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Recurring expense not found'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recurring expense'
      });
    }

    await prisma.recurringExpense.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Recurring expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recurring expense'
    });
  }
};

// Returns all recurring incomes for the authenticated user.
const getRecurringIncomes = async (req, res) => {
  try {
    const userId = req.user.id;

    const recurring = await prisma.recurringIncome.findMany({
      where: { userId },
      include: {
        _count: {
          select: { incomes: true }
        }
      },
      orderBy: { nextDate: 'asc' }
    });

    res.json({
      success: true,
      data: recurring
    });
  } catch (error) {
    console.error('Error fetching recurring incomes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recurring incomes'
    });
  }
};

// Creates a new recurring income template.
const createRecurringIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, source, frequency, startDate, endDate } = req.body;

    if (!amount || !source || !frequency || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, source, frequency, startDate'
      });
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const recurring = await prisma.recurringIncome.create({
      data: {
        userId,
        amount: parseFloat(amount),
        source,
        frequency,
        startDate: start,
        nextDate: start,
        endDate: end,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Recurring income created successfully',
      data: recurring
    });
  } catch (error) {
    console.error('Error creating recurring income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recurring income'
    });
  }
};

// Updates an existing recurring income.
const updateRecurringIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const existing = await prisma.recurringIncome.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Recurring income not found'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recurring income'
      });
    }

    if (updates.frequency) {
      const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
      if (!validFrequencies.includes(updates.frequency)) {
        return res.status(400).json({
          success: false,
          message: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
        });
      }
    }

    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    delete updates.userId;
    delete updates.startDate;
    delete updates.createdAt;

    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    const updated = await prisma.recurringIncome.update({
      where: { id },
      data: updates
    });

    res.json({
      success: true,
      message: 'Recurring income updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating recurring income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recurring income'
    });
  }
};

// Deletes a recurring income template.
const deleteRecurringIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.recurringIncome.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Recurring income not found'
      });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recurring income'
      });
    }

    await prisma.recurringIncome.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Recurring income deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recurring income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete recurring income'
    });
  }
};

// Calculates the next occurrence date based on frequency, handling edge cases.
function calculateNextDate(currentDate, frequency) {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      const originalDay = next.getDate();
      next.setMonth(next.getMonth() + 1);

      if (next.getDate() !== originalDay) {
        next.setDate(0);
      }
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);

      if (next.getMonth() === 2 && next.getDate() === 29) {
        const year = next.getFullYear();
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (!isLeap) {
          next.setDate(28);
        }
      }
      break;
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }

  return next;
}

// Processes recurring transactions and generates new expense/income records for due dates.
const processRecurringTransactions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expensesCreated = 0;
    let incomesCreated = 0;

    const dueExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextDate: {
          lte: today
        }
      }
    });

    for (const recurring of dueExpenses) {
      if (recurring.endDate && recurring.endDate < today) {
        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: { isActive: false }
        });
        continue;
      }

      await prisma.expense.create({
        data: {
          userId: recurring.userId,
          amount: recurring.amount,
          description: recurring.description,
          category: recurring.category,
          date: recurring.nextDate,
          isRecurring: true,
          recurringId: recurring.id
        }
      });
      expensesCreated++;

      const nextDate = calculateNextDate(recurring.nextDate, recurring.frequency);

      const shouldDeactivate = recurring.endDate && nextDate > recurring.endDate;

      await prisma.recurringExpense.update({
        where: { id: recurring.id },
        data: {
          nextDate: nextDate,
          isActive: !shouldDeactivate
        }
      });
    }

    const dueIncomes = await prisma.recurringIncome.findMany({
      where: {
        isActive: true,
        nextDate: {
          lte: today
        }
      }
    });

    for (const recurring of dueIncomes) {
      if (recurring.endDate && recurring.endDate < today) {
        await prisma.recurringIncome.update({
          where: { id: recurring.id },
          data: { isActive: false }
        });
        continue;
      }

      await prisma.income.create({
        data: {
          userId: recurring.userId,
          amount: recurring.amount,
          source: recurring.source,
          date: recurring.nextDate,
          isRecurring: true,
          recurringId: recurring.id
        }
      });
      incomesCreated++;

      const nextDate = calculateNextDate(recurring.nextDate, recurring.frequency);
      const shouldDeactivate = recurring.endDate && nextDate > recurring.endDate;

      await prisma.recurringIncome.update({
        where: { id: recurring.id },
        data: {
          nextDate: nextDate,
          isActive: !shouldDeactivate
        }
      });
    }

    res.json({
      success: true,
      message: 'Recurring transactions processed successfully',
      data: {
        expensesCreated,
        incomesCreated,
        totalProcessed: dueExpenses.length + dueIncomes.length
      }
    });
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process recurring transactions',
      error: error.message
    });
  }
};

module.exports = {
  // Recurring Expenses
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,

  // Recurring Incomes
  getRecurringIncomes,
  createRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,

  // Processing
  processRecurringTransactions,
  calculateNextDate
};
