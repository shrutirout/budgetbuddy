// Generates CSV and Excel reports for expenses, income, and analytics.

const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

// Exports expenses to CSV format.
const exportExpensesToCSV = (expenses) => {
  const fields = [
    {
      label: 'Date',
      value: (row) => {
        const date = new Date(row.date);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
      }
    },
    {
      label: 'Description',
      value: 'description'
    },
    {
      label: 'Category',
      value: 'category'
    },
    {
      label: 'Amount (₹)',
      value: (row) => row.amount.toFixed(2)
    },
    {
      label: 'Month',
      value: (row) => {
        const date = new Date(row.date);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
      }
    },
    {
      label: 'Created At',
      value: (row) => {
        const date = new Date(row.createdAt);
        return date.toLocaleString('en-IN', { timeZone: 'UTC' });
      }
    }
  ];

  try {
    const parser = new Parser({
      fields,
      quote: '"',
      delimiter: ',',
      header: true,
      withBOM: true
    });

    const csv = parser.parse(expenses);

    console.log(`✅ Exported ${expenses.length} expenses to CSV`);
    return csv;

  } catch (error) {
    console.error('CSV export error:', error);
    throw new Error('Failed to generate CSV export');
  }
};

// Exports expenses to Excel format with formatting.
const exportExpensesToExcel = async (expenses) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');

    worksheet.properties.defaultRowHeight = 20;
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Month', key: 'month', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 25 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 12
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    headerRow.height = 25;

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const year = expenseDate.getUTCFullYear();
      const month = expenseDate.getUTCMonth();
      const day = expenseDate.getUTCDate();

      const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthStr = `${monthNames[month]} ${year}`;

      const row = worksheet.addRow({
        date: dateStr,
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        month: monthStr,
        createdAt: new Date(expense.createdAt).toLocaleString('en-IN')
      });

      if (row.number % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }
    });

    worksheet.getColumn('amount').numFmt = '₹#,##0.00';
    worksheet.getColumn('amount').alignment = { horizontal: 'right' };

    const totalRow = worksheet.addRow({
      date: '',
      description: 'TOTAL',
      category: '',
      amount: { formula: `SUM(D2:D${worksheet.rowCount})` },
      month: '',
      createdAt: ''
    });

    totalRow.font = { bold: true, size: 12 };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };
    totalRow.getCell('amount').alignment = { horizontal: 'right' };

    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    console.log(`✅ Exported ${expenses.length} expenses to Excel`);
    return buffer;

  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to generate Excel export');
  }
};

// Exports income records to CSV format.
const exportIncomeToCSV = (incomes) => {
  const fields = [
    {
      label: 'Date',
      value: (row) => {
        const date = new Date(row.date);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
      }
    },
    {
      label: 'Source',
      value: 'source'
    },
    {
      label: 'Amount (₹)',
      value: (row) => row.amount.toFixed(2)
    },
    {
      label: 'Month',
      value: (row) => {
        const date = new Date(row.date);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
      }
    },
    {
      label: 'Created At',
      value: (row) => {
        const date = new Date(row.createdAt);
        return date.toLocaleString('en-IN', { timeZone: 'UTC' });
      }
    }
  ];

  try {
    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(incomes);

    console.log(`✅ Exported ${incomes.length} income records to CSV`);
    return csv;

  } catch (error) {
    console.error('Income CSV export error:', error);
    throw new Error('Failed to generate income CSV export');
  }
};

// Exports income records to Excel format with formatting.
const exportIncomeToExcel = async (incomes) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Income');

    worksheet.properties.defaultRowHeight = 20;
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Source', key: 'source', width: 30 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Month', key: 'month', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 25 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data
    incomes.forEach(income => {
      const incomeDate = new Date(income.date);
      const year = incomeDate.getUTCFullYear();
      const month = incomeDate.getUTCMonth();
      const day = incomeDate.getUTCDate();

      const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthStr = `${monthNames[month]} ${year}`;

      const row = worksheet.addRow({
        date: dateStr,
        source: income.source || 'N/A',
        amount: income.amount,
        month: monthStr,
        createdAt: new Date(income.createdAt).toLocaleString('en-IN')
      });

      if (row.number % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }
    });

    worksheet.getColumn('amount').numFmt = '₹#,##0.00';
    worksheet.getColumn('amount').alignment = { horizontal: 'right' };

    const totalRow = worksheet.addRow({
      date: '',
      source: 'TOTAL',
      amount: { formula: `SUM(C2:C${worksheet.rowCount})` },
      month: '',
      createdAt: ''
    });

    totalRow.font = { bold: true, size: 12 };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };

    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    console.log(`✅ Exported ${incomes.length} income records to Excel`);
    return buffer;

  } catch (error) {
    console.error('Income Excel export error:', error);
    throw new Error('Failed to generate income Excel export');
  }
};

// Exports a comprehensive multi-sheet Excel report with expenses, income, and budgets.
const exportComprehensiveReport = async (data) => {
  const { expenses, incomes, budgets, analytics } = data;

  try {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'BudgetBuddy';
    workbook.created = new Date();
    workbook.modified = new Date();

    const summarySheet = workbook.addWorksheet('Summary');

    const titleRow = summarySheet.addRow(['BudgetBuddy Financial Report']);
    titleRow.font = { bold: true, size: 16, color: { argb: 'FF4472C4' } };
    titleRow.height = 30;

    summarySheet.addRow(['Generated:', new Date().toLocaleString('en-IN')]);
    summarySheet.addRow([]);

    const summaryData = [
      ['Total Income:', analytics.totalIncome || 0],
      ['Total Expenses:', analytics.totalExpenses || 0],
      ['Net Balance:', analytics.remainingMoney || 0],
      ['Savings:', analytics.savings || 0]
    ];

    summaryData.forEach(([label, value]) => {
      const row = summarySheet.addRow([label, value]);
      row.font = { bold: true };
      row.getCell(2).numFmt = '₹#,##0.00';

      if (label === 'Total Income:' || label === 'Savings:') {
        row.getCell(2).font = { color: { argb: 'FF4CAF50' }, bold: true };
      } else if (label === 'Total Expenses:') {
        row.getCell(2).font = { color: { argb: 'FFEF4444' }, bold: true };
      }
    });

    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 20;

    const expenseSheet = workbook.addWorksheet('Expenses');
    expenseSheet.properties.defaultRowHeight = 20;
    expenseSheet.views = [{ state: 'frozen', ySplit: 1 }];

    expenseSheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Month', key: 'month', width: 20 }
    ];

    const expenseHeaderRow = expenseSheet.getRow(1);
    expenseHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    expenseHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    expenseHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    expenseHeaderRow.height = 25;

    if (expenses && expenses.length > 0) {
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const year = expenseDate.getUTCFullYear();
        const month = expenseDate.getUTCMonth();
        const day = expenseDate.getUTCDate();

        const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthStr = `${monthNames[month]} ${year}`;

        const row = expenseSheet.addRow({
          date: dateStr,
          description: expense.description || '',
          category: expense.category || '',
          amount: expense.amount || 0,
          month: monthStr
        });

        if (row.number % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      });
    }

    expenseSheet.getColumn('amount').numFmt = '₹#,##0.00';
    expenseSheet.getColumn('amount').alignment = { horizontal: 'right' };

    if (expenses && expenses.length > 0) {
      const totalRow = expenseSheet.addRow({
        date: '',
        description: 'TOTAL',
        category: '',
        amount: { formula: `SUM(D2:D${expenseSheet.rowCount})` },
        month: ''
      });

      totalRow.font = { bold: true, size: 12 };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFEB3B' }
      };
    }

    const incomeSheet = workbook.addWorksheet('Income');
    incomeSheet.properties.defaultRowHeight = 20;
    incomeSheet.views = [{ state: 'frozen', ySplit: 1 }];

    incomeSheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Source', key: 'source', width: 30 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Month', key: 'month', width: 20 }
    ];

    const incomeHeaderRow = incomeSheet.getRow(1);
    incomeHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    incomeHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
    incomeHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    incomeHeaderRow.height = 25;

    if (incomes && incomes.length > 0) {
      incomes.forEach(income => {
        const incomeDate = new Date(income.date);
        const year = incomeDate.getUTCFullYear();
        const month = incomeDate.getUTCMonth();
        const day = incomeDate.getUTCDate();

        const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthStr = `${monthNames[month]} ${year}`;

        const row = incomeSheet.addRow({
          date: dateStr,
          source: income.source || 'N/A',
          amount: income.amount || 0,
          month: monthStr
        });

        if (row.number % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      });
    }

    incomeSheet.getColumn('amount').numFmt = '₹#,##0.00';
    incomeSheet.getColumn('amount').alignment = { horizontal: 'right' };

    if (incomes && incomes.length > 0) {
      const totalRow = incomeSheet.addRow({
        date: '',
        source: 'TOTAL',
        amount: { formula: `SUM(C2:C${incomeSheet.rowCount})` },
        month: ''
      });

      totalRow.font = { bold: true, size: 12 };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFEB3B' }
      };
    }

    const budgetSheet = workbook.addWorksheet('Budgets');
    budgetSheet.properties.defaultRowHeight = 20;
    budgetSheet.views = [{ state: 'frozen', ySplit: 1 }];

    budgetSheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Budget Limit (₹)', key: 'limit', width: 18 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const budgetHeaderRow = budgetSheet.getRow(1);
    budgetHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    budgetHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF9800' }
    };
    budgetHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    budgetHeaderRow.height = 25;

    if (budgets && budgets.length > 0) {
      budgets.forEach(budget => {
        const budgetDate = new Date(budget.month);
        const monthStr = budgetDate.toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC'
        });

        const row = budgetSheet.addRow({
          category: budget.category,
          month: monthStr,
          limit: budget.limitAmount,
          status: 'Active'
        });

        if (row.number % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
          };
        }
      });
    }

    budgetSheet.getColumn('limit').numFmt = '₹#,##0.00';
    budgetSheet.getColumn('limit').alignment = { horizontal: 'right' };

    const buffer = await workbook.xlsx.writeBuffer();

    console.log('✅ Exported comprehensive financial report');
    return buffer;

  } catch (error) {
    console.error('Comprehensive report export error:', error);
    throw new Error('Failed to generate comprehensive report');
  }
};

module.exports = {
  exportExpensesToExcel,
  exportIncomeToExcel,
  exportComprehensiveReport
};
