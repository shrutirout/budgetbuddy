# 💰 BudgetBuddy

A full-stack personal finance management application powered by AI. Track expenses, manage budgets, analyze spending patterns, and get personalized financial advice.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Features Documentation](#features-documentation)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**BudgetBuddy** is a modern personal finance management system that helps users take control of their money. Built with React and Node.js, it features AI-powered expense categorization, intelligent budget monitoring, comprehensive analytics, and a financial advisor chatbot powered by Google Gemini AI.

### Why BudgetBuddy?

- **🤖 AI-Powered**: Automatic expense categorization using Google Gemini
- **📊 Smart Analytics**: Visual insights into spending patterns and trends
- **💡 Intelligent Advice**: Context-aware financial advisor chatbot
- **⚡ Real-time Monitoring**: Budget alerts and spending notifications
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🌙 Dark Mode**: Easy on the eyes with system-aware theme switching
- **🔒 Secure**: JWT authentication with password hashing

---

## ✨ Key Features

### 1. 💳 Expense Management
- **CRUD Operations**: Create, read, update, and delete expense entries
- **AI Categorization**: Automatic categorization of expenses using Google Gemini AI
  - 7 predefined categories: Food, Transport, Entertainment, Shopping, Bills, Healthcare, Other
  - Smart suggestions based on expense descriptions
  - In-memory caching for performance (1000 item FIFO cache)
- **Advanced Filtering**: Filter by category, date range, and custom criteria
- **Excel Export**: Download expense reports in formatted Excel files
- **Date Handling**: UTC-based timezone handling to prevent date shifts

### 2. 💰 Income Tracking
- **Source-based Entries**: Track income from multiple sources (Salary, Freelance, Investment, etc.)
- **Date Range Filtering**: View income for specific time periods
- **Statistics**: Aggregate income data by source and time period
- **Excel Export**: Generate professional income reports with green-themed styling

### 3. 📊 Budget Management
- **Category Budgets**: Set monthly spending limits per category
- **Smart Alerts**: Three-level alert system
  - ✅ **Safe**: Below 80% of budget (green)
  - ⚠️ **Warning**: 80-100% of budget (yellow)
  - 🚨 **Danger**: Over 100% of budget (red)
- **Real-time Monitoring**: Track spending against budgets in real-time
- **Month-based Tracking**: View and compare budgets across different months
- **Conflict Prevention**: Prevents duplicate budgets for the same category/month

### 4. 📈 Financial Analytics
Comprehensive visualization dashboard with Chart.js:

- **Expense Trends**: Line charts showing spending patterns over time
  - Daily trends for current month
  - Monthly trends for 3/6/12 month periods
- **Category Breakdown**: Doughnut charts with percentage breakdowns
- **Income vs Expenses**: Comparative bar charts for financial health
- **Budget Performance**: Actual spending vs budget limits
- **Savings Trends**: Cumulative savings over time with area charts
- **Multi-Category Trends**: Track multiple category spending patterns simultaneously

### 5. 🤖 AI Financial Advisor
Intelligent chatbot powered by Google Gemini:

- **Context-Aware Responses**: Uses complete financial history for personalized advice
- **Conversation History**: Persistent chat history with pagination
- **Quick Actions**: Pre-defined prompts for common queries
  - "How much am I spending on food?"
  - "Am I on track with my budget?"
  - "Where should I cut costs?"
  - "Analyze my spending patterns"
- **Financial Context**: Includes income, expenses, budgets, and spending patterns
- **Smart Recommendations**: AI-generated insights based on your financial data

### 6. 🔄 Recurring Transactions
Template-based system for automated transactions:

- **Flexible Frequencies**: Daily, Weekly, Monthly, Yearly
- **Edge Case Handling**:
  - Leap year support
  - Month-end date handling (e.g., Jan 31 → Feb 28/29)
- **Automatic Generation**: Cron-based processing for due transactions
- **Active/Inactive Status**: Enable or disable recurring templates
- **End Date Support**: Auto-deactivation when recurring period ends

### 7. 📄 Export & Reporting
Professional report generation:

- **Excel Export**: Multi-sheet workbooks with formatting
  - Summary sheet with totals and statistics
  - Detailed expenses sheet with color-coded categories
  - Income breakdown with source analysis
  - Budget performance tracking
- **CSV Export**: Simple CSV files for data portability
- **Date Filtering**: Export specific time periods
- **Auto-formatting**: Professional styling with headers, colors, and formulas

### 8. 🎨 User Experience
- **Dark Mode**: System-aware theme switching with localStorage persistence
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Loading States**: Smooth loading indicators for async operations
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client and server-side validation
- **Optimistic Updates**: Instant UI feedback for user actions

### 9. 🔐 Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for password storage
- **Protected Routes**: Authentication middleware on all sensitive endpoints
- **CORS Configuration**: Cross-origin resource sharing control
- **Token Expiry**: Automatic session management

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash Lite)
- **Report Generation**: ExcelJS, json2csv
- **Scheduling**: node-cron
- **Middleware**: CORS, express.json()

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: Tailwind CSS
- **State Management**: Context API (Auth, DarkMode)
- **Form Handling**: Controlled components with validation

### Development Tools
- **Package Manager**: npm
- **Environment Configuration**: dotenv
- **Code Quality**: ESLint
- **Version Control**: Git

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Dashboard  │  │  Expenses   │  │   Budget    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Reports   │  │   Chatbot   │  │   Income    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │ Axios (JWT Headers)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Express.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Authentication Middleware               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │ Expenses │  │ Budgets  │  │Analytics │   │
│  │Controller│  │Controller│  │Controller│  │Controller│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Income   │  │ Chatbot  │  │Recurring │  │  Export  │   │
│  │Controller│  │Controller│  │Controller│  │Controller│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Users  │  │Expenses │  │ Income  │  │ Budgets │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │Recurring│  │Recurring│  │  Chat   │                     │
│  │Expenses │  │ Income  │  │Messages │                     │
│  └─────────┘  └─────────┘  └─────────┘                     │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────────────┐
│  Google Gemini API   │ ──→ AI Categorization & Financial Advice
└──────────────────────┘
```

### Data Flow

1. **Authentication Flow**:
   - User signs up/logs in → Backend validates → JWT token generated → Token stored in localStorage → Axios interceptor adds token to all requests

2. **Expense Creation Flow**:
   - User enters expense → AI categorization (optional) → Backend validation → Database storage → UI update

3. **Budget Alert Flow**:
   - Expense created → Backend calculates spending → Compares with budget limit → Returns alert level → Frontend displays color-coded status

4. **Analytics Flow**:
   - User selects date range → Multiple parallel API calls → PostgreSQL aggregations → Chart.js visualization

5. **Chatbot Flow**:
   - User sends message → Backend fetches financial context → Gemini API call with context → Response stored in DB → UI displays chat

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Git
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/budgetbuddy.git
cd budgetbuddy
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd budgetbuddy-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Configure your `.env` file**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/budgetbuddy"
JWT_SECRET="your-super-secret-jwt-key-here"
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=5000
NODE_ENV=development
```

```bash
# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed

# Start backend server
npm start
```

The backend server will start on `http://localhost:5000`

#### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd budgetbuddy-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env
nano .env
```

**Configure your frontend `.env` file**:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

#### 4. Database Setup

Create PostgreSQL database:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE budgetbuddy;

-- Verify database
\l
```

Update `DATABASE_URL` in backend `.env` with your database credentials.

### Quick Start Commands

```bash
# Backend
cd budgetbuddy-backend
npm install
npx prisma migrate dev
npm start

# Frontend (in new terminal)
cd budgetbuddy-frontend
npm install
npm run dev
```

### Accessing the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account using the Sign Up page
3. Log in with your credentials
4. Start tracking your finances!

---

## 📚 Features Documentation

### Expense Management

**Creating an Expense:**
1. Navigate to Expenses page
2. Click "+ Add Expense"
3. Enter amount and description
4. AI will automatically suggest a category (or select manually)
5. Choose date and click "Create"

**AI Categorization:**
- Triggered automatically when you type 3+ characters in description
- Debounced by 500ms to avoid excessive API calls
- Cached results for repeated descriptions
- 7 categories: Food, Transport, Entertainment, Shopping, Bills, Healthcare, Other

**Filtering:**
- By Category: Dropdown filter
- By Date Range: Start and end date inputs
- Results update automatically on filter change

**Excel Export:**
- Applies current filters to export
- Professional formatting with colors and borders
- Includes totals and statistics
- File naming: `expenses_YYYY-MM-DD.xlsx`

### Budget Management

**Setting Budget Limits:**
1. Navigate to Budget page
2. Click "+ Set Budget Limit"
3. Select category and month
4. Enter limit amount
5. System prevents duplicate category/month combinations

**Understanding Alerts:**
- **Green (Safe)**: Spending < 80% of budget
- **Yellow (Warning)**: Spending 80-100% of budget
- **Red (Danger)**: Spending > 100% of budget

**Budget Status Dashboard:**
- Real-time spending calculation
- Progress bars with color indicators
- Remaining budget display
- Month-based filtering

### Analytics & Reports

**Available Charts:**

1. **Expense Trends**
   - Line chart showing spending over time
   - Daily view for current month
   - Monthly view for 3/6/12 months

2. **Category Breakdown**
   - Doughnut chart with percentages
   - Color-coded categories
   - Hover for detailed amounts

3. **Income vs Expenses**
   - Bar chart comparison
   - Monthly breakdown
   - Surplus/deficit visualization

4. **Budget Performance**
   - Actual spending vs limits
   - Category-wise comparison
   - Over/under budget indicators

5. **Savings Trends**
   - Area chart showing cumulative savings
   - Income minus expenses over time

6. **Category Trends**
   - Multi-line chart
   - Track multiple categories simultaneously
   - Legacy category mapping (Transportation→Transport, etc.)

**Time Range Selection:**
- Current Month (0): Daily breakdown
- 3 Months: Monthly trends
- 6 Months: Half-year overview
- 12 Months: Annual analysis

### AI Financial Advisor

**Starting a Conversation:**
1. Navigate to AI Chatbot page
2. Type your question or select a Quick Action
3. AI analyzes your complete financial data
4. Receive personalized advice

**Quick Actions:**
- "How much am I spending on food?"
- "Am I on track with my budget?"
- "Where should I cut costs?"
- "When will I run out of money?"
- "Analyze my spending patterns"
- "Give me savings tips"

**Context Provided to AI:**
- Total income and expenses
- Budget status and alerts
- Category-wise spending breakdown
- Daily spending rate
- Recent transaction patterns

**Chat Features:**
- Persistent conversation history
- Auto-scroll to latest message
- Clear history option
- Paginated history loading (last 50 messages)

### Recurring Transactions

**Creating Recurring Expense/Income:**
1. Navigate to Recurring page
2. Select Expenses or Income tab
3. Click "+ Add Recurring"
4. Enter details:
   - Amount and description/source
   - Category (for expenses)
   - Frequency: Daily, Weekly, Monthly, Yearly
   - Start date
   - End date (optional)
5. System automatically generates transactions based on schedule

**Frequency Examples:**
- **Daily**: Generates transaction every day
- **Weekly**: Every 7 days from start date
- **Monthly**: Same day each month (handles month-end)
- **Yearly**: Same date each year (handles leap years)

**Edge Cases Handled:**
- Jan 31 recurring monthly → Feb 28/29, Mar 31, etc.
- Leap year dates (Feb 29)
- Month-end date adjustments

**Processing:**
- Automatic cron job (configurable)
- Manual trigger via API endpoint
- Updates next occurrence after generation
- Auto-deactivates on end date

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Authentication (`/auth`)

**POST /auth/signup**
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

**POST /auth/login**
```json
Request:
{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

**GET /auth/me** (Protected)
```json
Response:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

#### Expenses (`/expenses`)

**GET /expenses** (Protected)
```
Query Parameters:
- category: string (optional)
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)
- page: number (default: 1)
- limit: number (default: 10)

Response:
{
  "expenses": [
    {
      "id": "uuid",
      "amount": 50.00,
      "description": "Lunch at restaurant",
      "category": "Food",
      "date": "2025-01-15",
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

**POST /expenses** (Protected)
```json
Request:
{
  "amount": 50.00,
  "description": "Lunch at restaurant",
  "category": "Food",  // Optional - AI will categorize if not provided
  "date": "2025-01-15"
}

Response:
{
  "expense": {
    "id": "uuid",
    "amount": 50.00,
    "description": "Lunch at restaurant",
    "category": "Food",
    "date": "2025-01-15",
    "createdAt": "2025-01-15T12:00:00Z"
  }
}
```

**POST /expenses/categorize** (Protected)
```json
Request:
{
  "description": "Lunch at restaurant"
}

Response:
{
  "category": "Food",
  "cached": false
}
```

**PUT /expenses/:id** (Protected)
```json
Request:
{
  "amount": 55.00,
  "description": "Updated lunch description",
  "category": "Food",
  "date": "2025-01-15"
}
```

**DELETE /expenses/:id** (Protected)
```json
Response:
{
  "message": "Expense deleted successfully"
}
```

**GET /expenses/stats** (Protected)
```json
Query Parameters:
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)

Response:
{
  "total": 1250.00,
  "count": 45,
  "average": 27.78,
  "byCategory": {
    "Food": 450.00,
    "Transport": 300.00,
    "Entertainment": 200.00
  }
}
```

#### Income (`/income`)

Similar structure to expenses with source instead of category:

**POST /income** (Protected)
```json
Request:
{
  "amount": 5000.00,
  "source": "Salary",
  "date": "2025-01-01"
}
```

#### Budgets (`/budget`)

**POST /budget** (Protected)
```json
Request:
{
  "category": "Food",
  "limitAmount": 500.00,
  "month": "2025-01-01"  // First day of month
}

Response:
{
  "budget": {
    "id": "uuid",
    "category": "Food",
    "limitAmount": 500.00,
    "month": "2025-01-01T00:00:00Z"
  }
}
```

**GET /budget/status** (Protected)
```json
Query Parameters:
- month: YYYY-MM-DD (optional, defaults to current month)

Response:
{
  "budgets": [
    {
      "id": "uuid",
      "category": "Food",
      "limitAmount": 500.00,
      "spent": 350.00,
      "remaining": 150.00,
      "percentage": 70.00,
      "status": "safe"  // safe | warning | danger
    }
  ]
}
```

#### Analytics (`/analytics`)

**GET /analytics/expense-trends** (Protected)
```
Query: months=6

Response:
{
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "values": [450, 520, 480, 510, 490, 530]
  }
}
```

**GET /analytics/category-breakdown** (Protected)
```
Query: month=2025-01

Response:
{
  "data": {
    "labels": ["Food", "Transport", "Entertainment"],
    "values": [450, 300, 200],
    "percentages": [47.37, 31.58, 21.05]
  }
}
```

#### Chatbot (`/chatbot`)

**POST /chatbot** (Protected)
```json
Request:
{
  "message": "How much am I spending on food?"
}

Response:
{
  "reply": "Based on your data, you've spent $450 on food this month...",
  "timestamp": "2025-01-15T14:30:00Z"
}
```

**GET /chatbot/history** (Protected)
```
Query: limit=50

Response:
{
  "messages": [
    {
      "role": "user",
      "content": "How much am I spending?",
      "timestamp": "2025-01-15T14:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Your total spending this month is $950.",
      "timestamp": "2025-01-15T14:30:05Z"
    }
  ],
  "hasMore": false
}
```

#### Export (`/exports`)

**GET /exports/expenses/excel** (Protected)
```
Query Parameters:
- category: string (optional)
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)

Response: Excel file download (application/vnd.openxmlformats)
Filename: expenses_YYYY-MM-DD.xlsx
```

**GET /reports/export/comprehensive** (Protected)
```
Response: Multi-sheet Excel workbook
Sheets: Summary, Expenses, Income, Budgets
```

### Error Responses

```json
{
  "error": "Error message here",
  "details": "Additional error details"
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict (duplicate budget)
- 500: Internal Server Error

---

## 💾 Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│     User     │
├──────────────┤
│ id (PK)      │
│ name         │
│ email        │◄─────────┐
│ password     │          │
│ createdAt    │          │
│ updatedAt    │          │
└──────────────┘          │
                          │
                          │ userId (FK)
┌──────────────┐          │
│   Expense    │──────────┤
├──────────────┤          │
│ id (PK)      │          │
│ userId (FK)  │──────────┤
│ amount       │          │
│ description  │          │
│ category     │          │
│ date         │          │
│ isRecurring  │          │
│ createdAt    │          │
└──────────────┘          │
                          │
┌──────────────┐          │
│    Income    │──────────┤
├──────────────┤          │
│ id (PK)      │          │
│ userId (FK)  │──────────┤
│ amount       │          │
│ source       │          │
│ date         │          │
│ isRecurring  │          │
│ createdAt    │          │
└──────────────┘          │
                          │
┌──────────────┐          │
│ BudgetLimit  │──────────┤
├──────────────┤          │
│ id (PK)      │          │
│ userId (FK)  │──────────┤
│ category     │          │
│ limitAmount  │          │
│ month        │          │
│ createdAt    │          │
└──────────────┘          │
                          │
┌─────────────────┐       │
│RecurringExpense │───────┤
├─────────────────┤       │
│ id (PK)         │       │
│ userId (FK)     │───────┤
│ amount          │       │
│ description     │       │
│ category        │       │
│ frequency       │       │
│ startDate       │       │
│ endDate         │       │
│ nextOccurrence  │       │
│ isActive        │       │
└─────────────────┘       │
                          │
┌─────────────────┐       │
│ RecurringIncome │───────┤
├─────────────────┤       │
│ id (PK)         │       │
│ userId (FK)     │───────┤
│ amount          │       │
│ source          │       │
│ frequency       │       │
│ startDate       │       │
│ endDate         │       │
│ nextOccurrence  │       │
│ isActive        │       │
└─────────────────┘       │
                          │
┌──────────────┐          │
│ ChatMessage  │──────────┘
├──────────────┤
│ id (PK)      │
│ userId (FK)  │
│ role         │
│ content      │
│ timestamp    │
└──────────────┘
```

### Table Descriptions

**User**
- Primary user account table
- Email is unique
- Password is hashed with bcrypt

**Expense**
- Individual expense entries
- Category from predefined list or AI-suggested
- Date stored in UTC
- isRecurring flag for generated recurring expenses

**Income**
- Individual income entries
- Source is user-defined (Salary, Freelance, etc.)
- Date stored in UTC

**BudgetLimit**
- Monthly budget limits per category
- Unique constraint on (userId, category, month)
- Month stored as first day of month in UTC

**RecurringExpense/RecurringIncome**
- Templates for automatic transaction generation
- Frequency: DAILY, WEEKLY, MONTHLY, YEARLY
- nextOccurrence updated after each generation
- isActive flag for enabling/disabling

**ChatMessage**
- Chatbot conversation history
- Role: "user" or "assistant"
- Content stores message text
- Timestamp for chronological ordering

### Indexes

```sql
-- User table
CREATE UNIQUE INDEX idx_user_email ON User(email);

-- Expense table
CREATE INDEX idx_expense_user_date ON Expense(userId, date DESC);
CREATE INDEX idx_expense_category ON Expense(category);

-- Income table
CREATE INDEX idx_income_user_date ON Income(userId, date DESC);

-- BudgetLimit table
CREATE UNIQUE INDEX idx_budget_unique ON BudgetLimit(userId, category, month);

-- ChatMessage table
CREATE INDEX idx_chat_user_timestamp ON ChatMessage(userId, timestamp DESC);
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/budgetbuddy"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key-from-google-ai-studio"

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: CORS Origins
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### Environment Variable Details

**DATABASE_URL**: PostgreSQL connection string
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- Example: `postgresql://postgres:password@localhost:5432/budgetbuddy`

**JWT_SECRET**: Secret key for JWT token signing
- Use a strong, random string (32+ characters)
- Keep this secret and never commit to version control
- Generate with: `openssl rand -base64 32`

**GEMINI_API_KEY**: Google Gemini API key for AI features
- Get from: https://makersuite.google.com/app/apikey
- Required for expense categorization and chatbot
- Free tier includes generous limits

**PORT**: Backend server port (default: 5000)

**NODE_ENV**: Environment mode
- `development`: Development mode with detailed errors
- `production`: Production mode with optimized settings

**VITE_API_URL**: Frontend API endpoint
- Must match backend URL
- Include `/api` path prefix
- No trailing slash

---

## 📁 Project Structure

```
budgetbuddy/
├── budgetbuddy-backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── expenseController.js
│   │   │   ├── incomeController.js
│   │   │   ├── budgetController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── chatbotController.js
│   │   │   ├── exportController.js
│   │   │   └── recurringController.js
│   │   ├── routes/               # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── incomeRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── chatbot.js
│   │   │   ├── exportRoutes.js
│   │   │   └── recurringRoutes.js
│   │   ├── services/             # Business logic
│   │   │   ├── categorizationService.js
│   │   │   ├── chatbotService.js
│   │   │   └── exportService.js
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── jobs/                 # Cron jobs
│   │   │   └── recurringScheduler.js
│   │   └── server.js             # Express app entry
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # DB migrations
│   ├── .env                      # Environment variables
│   ├── .env.example             # Environment template
│   └── package.json
│
├── budgetbuddy-frontend/
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── AIChatbot.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── components/           # Reusable components
│   │   │   ├── common/
│   │   │   │   └── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── DarkModeContext.jsx
│   │   ├── api/                  # API configuration
│   │   │   └── axios.js
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Static assets
│   ├── .env                      # Environment variables
│   ├── .env.example             # Environment template
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   └── package.json
│
├── .gitignore
├── README.md                     # This file
└── PROJECT_STRUCTURE.md         # Detailed file documentation
```

### Key Directories

**Backend Controllers**: Handle HTTP requests, validate input, call services
**Backend Services**: Business logic, AI integration, report generation
**Backend Routes**: Define API endpoints and middleware
**Frontend Pages**: Full page components with routing
**Frontend Components**: Reusable UI components
**Frontend Contexts**: Global state management (Auth, Theme)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the Repository**
```bash
git clone https://github.com/yourusername/budgetbuddy.git
cd budgetbuddy
git checkout -b feature/your-feature-name
```

2. **Make Your Changes**
- Follow existing code style
- Add comments for complex logic
- Write meaningful commit messages

3. **Test Your Changes**
```bash
# Backend tests
cd budgetbuddy-backend
npm test

# Frontend tests
cd budgetbuddy-frontend
npm test
```

4. **Submit Pull Request**
- Push to your fork
- Create pull request with clear description
- Reference any related issues

### Code Style Guidelines

**Backend:**
- Use async/await for asynchronous operations
- Handle errors with try-catch blocks
- Validate input at controller level
- Keep functions focused and single-purpose
- Use descriptive variable names

**Frontend:**
- Use functional components with hooks
- Keep components under 300 lines
- Extract reusable logic to custom hooks
- Use Tailwind CSS for styling
- Follow React best practices

### Commit Message Format

```
feat: Add expense filtering by multiple categories
fix: Resolve timezone issue in date picker
docs: Update API documentation for budgets
style: Format code with prettier
refactor: Extract common validation logic
test: Add unit tests for categorization service
```

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage
- 🌐 Internationalization

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 BudgetBuddy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

### Issues & Bug Reports
- GitHub Issues: [github.com/yourusername/budgetbuddy/issues](https://github.com/yourusername/budgetbuddy/issues)
- Include detailed description, steps to reproduce, and screenshots if applicable

### Questions & Discussions
- GitHub Discussions: [github.com/yourusername/budgetbuddy/discussions](https://github.com/yourusername/budgetbuddy/discussions)
- Ask questions, share ideas, and help others

### Documentation
- Full API Documentation: See [API Documentation](#api-documentation) section
- Project Structure: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- Architecture Details: See [Architecture](#architecture) section

---

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent expense categorization and financial advice
- **Prisma** for elegant database ORM
- **Chart.js** for beautiful data visualizations
- **Tailwind CSS** for rapid UI development
- **Vite** for lightning-fast build tool
- **React Community** for excellent libraries and tools

---

## 🗺️ Roadmap

### Planned Features

**Version 2.0**
- [ ] Multi-currency support
- [ ] Bank account integration (Plaid API)
- [ ] Mobile app (React Native)
- [ ] Receipt scanning with OCR
- [ ] Bill reminders and notifications
- [ ] Shared budgets for families
- [ ] Investment tracking
- [ ] Tax report generation
- [ ] Goal setting and tracking
- [ ] Email reports (weekly/monthly)

**Version 2.1**
- [ ] Smart notifications
- [ ] Predictive analytics
- [ ] Debt payoff calculator
- [ ] Budget templates
- [ ] Custom categories
- [ ] Data import/export (CSV, QIF)
- [ ] Two-factor authentication
- [ ] Social features (optional sharing)

---

## 📊 Project Stats

- **Lines of Code**: ~15,000+
- **Backend Endpoints**: 40+
- **Database Models**: 7
- **Frontend Pages**: 8
- **React Components**: 15+
- **AI Integration**: Google Gemini 2.5 Flash Lite
- **Test Coverage**: Expanding

---

## 🎓 Learning Resources

Built this project to learn? Here are key concepts covered:

### Backend Concepts
- RESTful API design
- JWT authentication
- Database design (PostgreSQL + Prisma)
- Middleware patterns
- Error handling
- Cron jobs
- File generation (Excel/CSV)
- AI/ML API integration

### Frontend Concepts
- React 18 features (hooks, context)
- React Router for SPA navigation
- Axios for HTTP requests
- Chart.js for data visualization
- Tailwind CSS for styling
- Form handling and validation
- State management
- Dark mode implementation

### Full Stack Integration
- CORS configuration
- Token-based authentication flow
- File upload/download
- Real-time data updates
- Optimistic UI updates
- Error boundary handling

---

## 💡 Tips for Success

1. **Start Small**: Begin with basic expense tracking before exploring advanced features
2. **Use AI Wisely**: Let AI categorize expenses, but review and correct if needed
3. **Set Realistic Budgets**: Start conservative and adjust based on actual spending
4. **Review Regularly**: Check analytics weekly to stay informed
5. **Export Data**: Regularly backup your data using export features
6. **Ask the Chatbot**: Use AI advisor for personalized insights
7. **Plan Ahead**: Use recurring transactions for predictable expenses/income

---

## 🏁 Final Notes

BudgetBuddy is designed to make personal finance management simple, intelligent, and accessible. Whether you're tracking daily expenses, planning budgets, or seeking financial insights, this application provides the tools you need to take control of your finances.

**Key Takeaways:**
- ✅ Complete full-stack application
- ✅ Production-ready code quality
- ✅ AI-powered features
- ✅ Comprehensive documentation
- ✅ Scalable architecture
- ✅ Modern tech stack
- ✅ Mobile-responsive design

**Ready to get started?** Follow the [Getting Started](#getting-started) guide and begin your journey to better financial management!

---

**Made with ❤️ by BudgetBuddy Team**

*Last Updated: December 2025*
