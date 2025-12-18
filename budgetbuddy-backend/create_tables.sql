-- BudgetBuddy Database Schema for PostgreSQL
-- Run this SQL in Supabase SQL Editor

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Expense table
CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- Create Income table
CREATE TABLE IF NOT EXISTS "Income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- Create BudgetLimit table
CREATE TABLE IF NOT EXISTS "BudgetLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "limitAmount" DOUBLE PRECISION NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLimit_pkey" PRIMARY KEY ("id")
);

-- Create RecurringExpense table
CREATE TABLE IF NOT EXISTS "RecurringExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpense_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "BudgetLimit_userId_category_month_key" ON "BudgetLimit"("userId", "category", "month");

-- Create performance indexes
CREATE INDEX IF NOT EXISTS "Expense_userId_date_idx" ON "Expense"("userId", "date");
CREATE INDEX IF NOT EXISTS "Income_userId_date_idx" ON "Income"("userId", "date");
CREATE INDEX IF NOT EXISTS "RecurringExpense_userId_nextDate_isActive_idx" ON "RecurringExpense"("userId", "nextDate", "isActive");

-- Add foreign key constraints
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "RecurringExpense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetLimit" ADD CONSTRAINT "BudgetLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
