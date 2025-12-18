const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handles CRUD operations for income entries
const createIncome = async (req, res) => {
  try {
    const { amount, source, date } = req.body;
    const userId = req.user.id;

    if (!amount || !date) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'date'],
        optional: ['source']
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    const income = await prisma.income.create({
      data: {
        userId,
        amount: parseFloat(amount),
        source: source || null,
        date: new Date(date)
      }
    });

    res.status(201).json({
      message: 'Income created successfully',
      income
    });

  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Failed to create income' });
  }
};

// Retrieves income entries with optional filters
const getAllIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { source, startDate, endDate, limit, offset } = req.query;

    const where = {
      userId,
      ...(source && { source }),
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

    const income = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) })
    });

    const total = await prisma.income.count({ where });

    res.json({
      income,
      pagination: {
        total,
        limit: limit ? parseInt(limit) : total,
        offset: offset ? parseInt(offset) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
};

// Retrieves single income entry by ID
const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const income = await prisma.income.findFirst({
      where: { id, userId }
    });

    if (!income) {
      return res.status(404).json({
        error: 'Income not found or you do not have permission to view it'
      });
    }

    res.json({ income });

  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
};

// Updates existing income entry
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, source, date } = req.body;

    const existingIncome = await prisma.income.findFirst({
      where: { id, userId }
    });

    if (!existingIncome) {
      return res.status(404).json({
        error: 'Income not found or you do not have permission to update it'
      });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (source !== undefined) updateData.source = source;
    if (date !== undefined) updateData.date = new Date(date);

    const income = await prisma.income.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Income updated successfully',
      income
    });

  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
};

// Deletes income entry
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingIncome = await prisma.income.findFirst({
      where: { id, userId }
    });

    if (!existingIncome) {
      return res.status(404).json({
        error: 'Income not found or you do not have permission to delete it'
      });
    }

    await prisma.income.delete({
      where: { id }
    });

    res.json({
      message: 'Income deleted successfully',
      deletedIncome: existingIncome
    });

  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
};

// Calculates income statistics for a given period
const getIncomeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const end = endDate
      ? new Date(endDate)
      : new Date();

    const where = {
      userId,
      date: {
        gte: start,
        lte: end
      }
    };

    const aggregation = await prisma.income.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true }
    });

    const bySource = await prisma.income.groupBy({
      by: ['source'],
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
      bySource: bySource.map(src => ({
        source: src.source || 'Unknown',
        total: src._sum.amount,
        count: src._count.id
      }))
    });

  } catch (error) {
    console.error('Error fetching income stats:', error);
    res.status(500).json({ error: 'Failed to fetch income statistics' });
  }
};

module.exports = {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getIncomeStats
};
