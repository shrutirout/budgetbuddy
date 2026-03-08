# BudgetBuddy

A full-stack personal finance management app built with React and Node.js. It helps you track expenses and income, set monthly budgets, visualize spending patterns, and get AI-powered financial advice through a conversational chatbot.

---

## Overview

BudgetBuddy is designed to make personal finance tracking practical and intelligent. You can log transactions, categorize them automatically using Gemini AI, set budget limits per category, and see how your spending compares to those limits in real time. The app also handles recurring transactions on a schedule, generates Excel reports, and lets you ask a financial chatbot questions about your own data.

It is a complete full-stack application with a REST API backend, a PostgreSQL database managed through Prisma, and a React frontend with Chart.js visualizations.

---

## Tech Stack

**Frontend:** React 18, React Router v6, Chart.js, Tailwind CSS, Axios

**Backend:** Node.js, Express.js, PostgreSQL, Prisma ORM

**AI:** Google Gemini 2.5 Flash Lite for expense categorization and the financial chatbot

**Auth:** JWT-based authentication with bcrypt password hashing

**Other:** node-cron for recurring transaction scheduling, ExcelJS for report generation

---

## Features

### Expense and Income Tracking

Log expenses and income entries with amount, date, description, and category. When you type a description, Gemini AI automatically suggests a category from seven predefined options: Food, Transport, Entertainment, Shopping, Bills, Healthcare, and Other. Suggestions are cached in memory to avoid redundant API calls.

You can filter transactions by category and date range. Each list view supports pagination, and you can export filtered results as a formatted Excel file.

### Budget Management

Set monthly spending limits per expense category. The app calculates your actual spending for the month and compares it against your limit, returning one of three alert levels: safe (under 80%), warning (80 to 100%), and over budget (above 100%). The budget status page shows a real-time breakdown across all categories with progress indicators. The system prevents duplicate budgets for the same category and month combination.

### Analytics Dashboard

A comprehensive Chart.js dashboard with multiple views:

- Expense trends as a line chart, showing daily breakdowns for the current month or monthly trends across 3, 6, or 12 months
- Category breakdown as a doughnut chart with percentage splits
- Income vs expenses as a bar chart for a side-by-side monthly comparison
- Budget performance showing actual spending against set limits per category
- Savings trends as a cumulative area chart over time
- Multi-category trend lines for tracking several categories at once

### AI Financial Chatbot

A Gemini-powered chatbot that answers questions based on your actual financial data. Before generating a response, the backend compiles your income, expenses, budget status, category-wise spending, and recent transaction patterns into a context payload sent to the API. This means answers are personalized to your data rather than generic.

The chat history is stored in the database and paginated. Pre-built quick actions cover common queries like spending breakdowns, budget status checks, and savings suggestions.

### Recurring Transactions

Create templates for recurring expenses or income on daily, weekly, monthly, or yearly schedules. A node-cron job processes due transactions automatically and updates the next occurrence date. Edge cases are handled: a monthly recurring transaction set for January 31 will correctly land on February 28 or 29, and leap year dates are accounted for. Templates can be paused or given an end date after which they auto-deactivate.

### Export and Reporting

Download expense or income reports as Excel files with formatting, color-coded categories, totals, and statistics. A comprehensive export generates a multi-sheet workbook covering expenses, income, budgets, and a summary sheet. All exports respect the current filters applied in the UI.

### Security

JWT tokens are issued on login and required on all protected endpoints via an Authorization header. Passwords are hashed with bcrypt. Token expiry is enforced server-side, and CORS is configured to restrict origins.

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- PostgreSQL v12 or higher
- A Google Gemini API key (available at makersuite.google.com)

### Backend Setup

```bash
cd budgetbuddy-backend
npm install
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, PORT
npx prisma migrate dev
npm start
```

Server runs on `http://localhost:5000` by default.

### Frontend Setup

Open a new terminal:

```bash
cd budgetbuddy-frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on `http://localhost:5173`. Create an account on the signup page to get started.

---

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/budgetbuddy
JWT_SECRET=your-secret-key-minimum-32-chars
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

---

## Database

Seven models managed through Prisma ORM: User, Expense, Income, BudgetLimit, RecurringExpense, RecurringIncome, and ChatMessage. All transaction tables reference the User table via a foreign key. Unique constraints prevent duplicate budgets for the same category and month. Indexes are set on frequently queried columns like user ID combined with date for expenses and income, and user ID combined with timestamp for chat messages.

---

## API Overview

Base URL: `http://localhost:5000/api`

All routes except `/auth/signup` and `/auth/login` require a JWT token passed as `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Register a new user |
| POST | /auth/login | Login and receive JWT token |
| GET | /expenses | List expenses with optional filters |
| POST | /expenses | Create a new expense |
| POST | /expenses/categorize | Get AI category suggestion for a description |
| GET | /expenses/stats | Aggregate stats by category and date range |
| GET | /income | List income entries |
| POST | /income | Create an income entry |
| GET | /budget/status | Budget vs actual spending for a given month |
| POST | /budget | Create a budget limit |
| GET | /analytics/expense-trends | Expense trend data for charting |
| GET | /analytics/category-breakdown | Category-wise spending breakdown |
| POST | /chatbot | Send a message to the AI advisor |
| GET | /chatbot/history | Retrieve paginated chat history |
| GET | /exports/expenses/excel | Download filtered expense report |
| GET | /reports/export/comprehensive | Download full multi-sheet workbook |

---

## Project Structure

```
budgetbuddy/
  budgetbuddy-backend/
    src/
      controllers/     request handlers for each resource
      routes/          API route definitions
      services/        business logic, AI integration, export generation
      middleware/       auth and error handling
      jobs/            cron scheduler for recurring transactions
    prisma/
      schema.prisma    database schema and models
      migrations/      versioned migration files

  budgetbuddy-frontend/
    src/
      pages/           full page components (Dashboard, Expenses, Budget, etc.)
      components/      reusable UI components
      contexts/        Auth and DarkMode context providers
      api/             Axios instance with JWT interceptor
```

---

## License

MIT
