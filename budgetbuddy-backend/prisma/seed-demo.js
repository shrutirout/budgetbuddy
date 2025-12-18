const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Demo Data Seed Script for BudgetBuddy
 *
 * Purpose: Create a realistic demo account for recruiters/users to explore
 *
 * Demo User Profile:
 * - Name: Priya Sharma
 * - Age: 24
 * - Occupation: Software Developer in Bangalore
 * - Salary: ₹80,000/month (take-home after TDS)
 * - Period: August 2025 - December 2025 (5 months)
 *
 * Categories of Expenses:
 * - Housing: Rent, Electricity, Maintenance
 * - Food: Groceries, Restaurant, Food Delivery, Cafe
 * - Transportation: Metro, Auto, Uber/Ola, Fuel
 * - Shopping: Clothes, Accessories, Electronics, Books
 * - Entertainment: Movies, Subscriptions, Events
 * - Personal Care: Salon, Gym, Medical
 * - Daily Essentials: Blinkit/Instamart orders
 * - Travel: Trips home, Weekend getaways
 * - Miscellaneous: Gifts, Donations, etc.
 */

async function main() {
  console.log('🌱 Starting demo data seeding...\n');

  // Clear existing demo data if any
  const existingDemo = await prisma.user.findUnique({
    where: { email: 'demo@budgetbuddy.com' }
  });

  if (existingDemo) {
    console.log('🗑️  Deleting existing demo data...');
    await prisma.expense.deleteMany({ where: { userId: existingDemo.id } });
    await prisma.income.deleteMany({ where: { userId: existingDemo.id } });
    await prisma.budgetLimit.deleteMany({ where: { userId: existingDemo.id } });
    await prisma.recurringExpense.deleteMany({ where: { userId: existingDemo.id } });
    await prisma.recurringIncome.deleteMany({ where: { userId: existingDemo.id } });
    await prisma.user.delete({ where: { id: existingDemo.id } });
    console.log('✅ Existing demo data deleted\n');
  }

  // Create demo user
  console.log('👤 Creating demo user: Priya Sharma');
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'demo@budgetbuddy.com',
      password: hashedPassword
    }
  });
  console.log(`✅ Demo user created with ID: ${demoUser.id}\n`);

  // ============================================================================
  // INCOME DATA (Monthly Salary)
  // ============================================================================
  console.log('💰 Creating income transactions...');

  const incomeData = [
    { month: 8, date: 1, amount: 80000, source: 'Salary - Tech Corp India' },
    { month: 9, date: 1, amount: 80000, source: 'Salary - Tech Corp India' },
    { month: 10, date: 1, amount: 80000, source: 'Salary - Tech Corp India' },
    { month: 11, date: 1, amount: 80000, source: 'Salary - Tech Corp India' },
    { month: 12, date: 1, amount: 80000, source: 'Salary - Tech Corp India' },
    // Freelance/side income occasionally
    { month: 9, date: 15, amount: 8000, source: 'Freelance Project - Website Design' },
    { month: 11, date: 20, amount: 5000, source: 'Freelance - Logo Design' },
  ];

  for (const income of incomeData) {
    await prisma.income.create({
      data: {
        userId: demoUser.id,
        amount: income.amount,
        source: income.source,
        date: new Date(2025, income.month - 1, income.date)
      }
    });
  }
  console.log(`✅ Created ${incomeData.length} income transactions\n`);

  // ============================================================================
  // EXPENSE DATA (Realistic Indian expenses for a young professional)
  // ============================================================================
  console.log('💸 Creating expense transactions...\n');

  const expenses = [
    // ========== AUGUST 2024 ==========
    // Housing
    { month: 8, date: 1, amount: 15000, category: 'Housing', description: 'PG Rent - August' },
    { month: 8, date: 5, amount: 1200, category: 'Housing', description: 'Electricity Bill' },
    { month: 8, date: 10, amount: 300, category: 'Housing', description: 'Room Cleaning Service' },

    // Food - Groceries
    { month: 8, date: 3, amount: 1200, category: 'Food', description: 'Monthly Groceries - BigBasket' },
    { month: 8, date: 10, amount: 450, category: 'Food', description: 'Fruits & Vegetables - Local Vendor' },
    { month: 8, date: 17, amount: 380, category: 'Food', description: 'Milk & Eggs - Grocery Store' },
    { month: 8, date: 24, amount: 520, category: 'Food', description: 'Snacks & Beverages - D-Mart' },

    // Food Delivery
    { month: 8, date: 4, amount: 340, category: 'Food', description: 'Dinner - Swiggy (Biryani)' },
    { month: 8, date: 8, amount: 280, category: 'Food', description: 'Lunch - Zomato (North Indian)' },
    { month: 8, date: 12, amount: 420, category: 'Food', description: 'Weekend Brunch - Swiggy (Continental)' },
    { month: 8, date: 15, amount: 250, category: 'Food', description: 'Late Night Snack - Zomato' },
    { month: 8, date: 19, amount: 380, category: 'Food', description: 'Dinner - Swiggy (Chinese)' },
    { month: 8, date: 23, amount: 310, category: 'Food', description: 'Sunday Lunch - Zomato (Pizza)' },
    { month: 8, date: 27, amount: 290, category: 'Food', description: 'Dinner - Swiggy (South Indian)' },

    // Restaurants & Cafes
    { month: 8, date: 9, amount: 850, category: 'Food', description: 'Team Dinner - Absolute Barbecue' },
    { month: 8, date: 16, amount: 420, category: 'Food', description: 'Coffee & Snacks - Starbucks' },
    { month: 8, date: 22, amount: 1200, category: 'Food', description: 'Weekend Outing - Toit Brewpub' },
    { month: 8, date: 30, amount: 680, category: 'Food', description: 'Dinner with Friends - Truffles' },

    // Transportation
    { month: 8, date: 2, amount: 800, category: 'Transportation', description: 'Namma Metro Card Recharge' },
    { month: 8, date: 6, amount: 180, category: 'Transportation', description: 'Auto to Office' },
    { month: 8, date: 11, amount: 240, category: 'Transportation', description: 'Uber - Late Night Return' },
    { month: 8, date: 14, amount: 150, category: 'Transportation', description: 'Rapido Bike - Quick Errand' },
    { month: 8, date: 18, amount: 220, category: 'Transportation', description: 'Ola - Weekend Shopping' },
    { month: 8, date: 25, amount: 300, category: 'Transportation', description: 'Uber - Friend\'s Place' },
    { month: 8, date: 28, amount: 190, category: 'Transportation', description: 'Auto - Market' },

    // Shopping
    { month: 8, date: 13, amount: 2800, category: 'Shopping', description: 'Formal Shirt & Trousers - Westside' },
    { month: 8, date: 20, amount: 1500, category: 'Shopping', description: 'Casual Wear - H&M' },
    { month: 8, date: 26, amount: 850, category: 'Shopping', description: 'Shoes - Bata' },

    // Personal Care
    { month: 8, date: 7, amount: 1200, category: 'Personal Care', description: 'Gym Membership - August' },
    { month: 8, date: 21, amount: 900, category: 'Personal Care', description: 'Salon - Haircut & Facial' },
    { month: 8, date: 29, amount: 450, category: 'Personal Care', description: 'Medicines - Apollo Pharmacy' },

    // Entertainment
    { month: 8, date: 17, amount: 400, category: 'Entertainment', description: 'Movie - PVR (Stree 2)' },
    { month: 8, date: 5, amount: 199, category: 'Entertainment', description: 'Netflix Subscription' },
    { month: 8, date: 5, amount: 149, category: 'Entertainment', description: 'Spotify Premium' },

    // Daily Essentials (Blinkit/Instamart)
    { month: 8, date: 8, amount: 180, category: 'Food', description: 'Bread, Butter & Jam - Blinkit' },
    { month: 8, date: 14, amount: 220, category: 'Food', description: 'Late Night Cravings - Instamart' },
    { month: 8, date: 19, amount: 350, category: 'Personal Care', description: 'Toiletries - Blinkit' },
    { month: 8, date: 26, amount: 280, category: 'Food', description: 'Midnight Snacks - Zepto' },

    // Miscellaneous
    { month: 8, date: 15, amount: 1500, category: 'Miscellaneous', description: 'Raksha Bandhan - Gift for Brother' },
    { month: 8, date: 31, amount: 500, category: 'Miscellaneous', description: 'Phone Recharge - Airtel' },

    // ========== SEPTEMBER 2024 ==========
    // Housing
    { month: 9, date: 1, amount: 15000, category: 'Housing', description: 'PG Rent - September' },
    { month: 9, date: 4, amount: 1350, category: 'Housing', description: 'Electricity Bill' },
    { month: 9, date: 15, amount: 500, category: 'Housing', description: 'Gas Cylinder Refill' },

    // Food - Groceries
    { month: 9, date: 2, amount: 1400, category: 'Food', description: 'Monthly Groceries - BigBasket' },
    { month: 9, date: 8, amount: 480, category: 'Food', description: 'Fresh Vegetables - Local Market' },
    { month: 9, date: 15, amount: 320, category: 'Food', description: 'Dairy Products - Milk & More' },
    { month: 9, date: 22, amount: 550, category: 'Food', description: 'Pantry Restock - D-Mart' },
    { month: 9, date: 28, amount: 420, category: 'Food', description: 'Fruits - Fruit Vendor' },

    // Food Delivery
    { month: 9, date: 5, amount: 360, category: 'Food', description: 'Dinner - Swiggy (Biryani)' },
    { month: 9, date: 9, amount: 290, category: 'Food', description: 'Lunch - Zomato (Thali)' },
    { month: 9, date: 13, amount: 450, category: 'Food', description: 'Ganesh Chaturthi Feast - Swiggy' },
    { month: 9, date: 18, amount: 320, category: 'Food', description: 'Dinner - Zomato (Chinese)' },
    { month: 9, date: 24, amount: 410, category: 'Food', description: 'Weekend Treat - Swiggy (Sushi)' },
    { month: 9, date: 29, amount: 280, category: 'Food', description: 'Comfort Food - Zomato' },

    // Restaurants & Cafes
    { month: 9, date: 7, amount: 1800, category: 'Food', description: 'Birthday Celebration - Barbeque Nation' },
    { month: 9, date: 14, amount: 520, category: 'Food', description: 'Weekend Brunch - Social' },
    { month: 9, date: 21, amount: 1400, category: 'Food', description: 'Colleague Farewell - Brewsky' },
    { month: 9, date: 27, amount: 750, category: 'Food', description: 'Date Night - Ebony Restaurant' },

    // Transportation
    { month: 9, date: 3, amount: 800, category: 'Transportation', description: 'Metro Card Top-up' },
    { month: 9, date: 10, amount: 420, category: 'Transportation', description: 'Uber - Airport Drop for Friend' },
    { month: 9, date: 16, amount: 180, category: 'Transportation', description: 'Auto Rickshaw' },
    { month: 9, date: 23, amount: 260, category: 'Transportation', description: 'Ola - Weekend Trip' },
    { month: 9, date: 30, amount: 200, category: 'Transportation', description: 'Rapido - Quick Commute' },

    // Shopping
    { month: 9, date: 6, amount: 3500, category: 'Shopping', description: 'Ethnic Wear - FabIndia (Festive Season)' },
    { month: 9, date: 12, amount: 2200, category: 'Shopping', description: 'Laptop Accessories - Croma' },
    { month: 9, date: 19, amount: 1200, category: 'Shopping', description: 'Perfume & Cosmetics - Shoppers Stop' },
    { month: 9, date: 25, amount: 800, category: 'Shopping', description: 'Books - Blossoms Book House' },

    // Personal Care
    { month: 9, date: 7, amount: 1200, category: 'Personal Care', description: 'Gym Membership - September' },
    { month: 9, date: 17, amount: 1100, category: 'Personal Care', description: 'Salon - Hair Spa & Manicure' },
    { month: 9, date: 26, amount: 350, category: 'Personal Care', description: 'First Aid - Pharmacy' },

    // Entertainment
    { month: 9, date: 14, amount: 500, category: 'Entertainment', description: 'Concert - Indie Music Fest' },
    { month: 9, date: 20, amount: 350, category: 'Entertainment', description: 'Movie - IMAX (The Greatest Of All Time)' },
    { month: 9, date: 5, amount: 199, category: 'Entertainment', description: 'Netflix Subscription' },
    { month: 9, date: 5, amount: 149, category: 'Entertainment', description: 'Spotify Premium' },

    // Daily Essentials
    { month: 9, date: 11, amount: 240, category: 'Food', description: 'Emergency Groceries - Blinkit' },
    { month: 9, date: 18, amount: 380, category: 'Personal Care', description: 'Skincare Products - Instamart' },
    { month: 9, date: 24, amount: 190, category: 'Food', description: 'Breakfast Items - Zepto' },

    // Miscellaneous
    { month: 9, date: 13, amount: 2000, category: 'Miscellaneous', description: 'Ganesh Chaturthi - Donation & Prasad' },
    { month: 9, date: 30, amount: 500, category: 'Miscellaneous', description: 'Mobile Recharge' },

    // ========== OCTOBER 2024 ==========
    // Housing
    { month: 10, date: 1, amount: 15000, category: 'Housing', description: 'PG Rent - October' },
    { month: 10, date: 6, amount: 1180, category: 'Housing', description: 'Electricity Bill' },
    { month: 10, date: 20, amount: 400, category: 'Housing', description: 'Room Deep Cleaning' },

    // Food - Groceries
    { month: 10, date: 3, amount: 1350, category: 'Food', description: 'Monthly Groceries - BigBasket' },
    { month: 10, date: 9, amount: 460, category: 'Food', description: 'Vegetables - Local Vendor' },
    { month: 10, date: 16, amount: 340, category: 'Food', description: 'Dairy & Eggs' },
    { month: 10, date: 23, amount: 580, category: 'Food', description: 'Festive Groceries - D-Mart' },
    { month: 10, date: 29, amount: 390, category: 'Food', description: 'Weekly Vegetables' },

    // Food Delivery
    { month: 10, date: 4, amount: 380, category: 'Food', description: 'Dinner - Swiggy' },
    { month: 10, date: 10, amount: 310, category: 'Food', description: 'Lunch - Zomato' },
    { month: 10, date: 15, amount: 450, category: 'Food', description: 'Weekend Feast - Swiggy' },
    { month: 10, date: 21, amount: 340, category: 'Food', description: 'Diwali Sweets - Swiggy Gourmet' },
    { month: 10, date: 26, amount: 390, category: 'Food', description: 'Dinner - Zomato' },

    // Restaurants & Cafes
    { month: 10, date: 6, amount: 900, category: 'Food', description: 'Brunch - Cafe Thulp' },
    { month: 10, date: 12, amount: 2500, category: 'Food', description: 'Dussehra Celebration - Empire Restaurant' },
    { month: 10, date: 19, amount: 1600, category: 'Food', description: 'Friend\'s Birthday - Hard Rock Cafe' },
    { month: 10, date: 27, amount: 1100, category: 'Food', description: 'Diwali Dinner - Karavalli' },

    // Transportation
    { month: 10, date: 5, amount: 800, category: 'Transportation', description: 'Metro Card Recharge' },
    { month: 10, date: 11, amount: 350, category: 'Transportation', description: 'Uber - Long Distance' },
    { month: 10, date: 18, amount: 220, category: 'Transportation', description: 'Ola - Shopping Trip' },
    { month: 10, date: 25, amount: 180, category: 'Transportation', description: 'Auto - Local Commute' },

    // Shopping (Festive Season - Dussehra & Diwali)
    { month: 10, date: 8, amount: 5500, category: 'Shopping', description: 'Diwali Shopping - New Clothes (Myntra)' },
    { month: 10, date: 14, amount: 3200, category: 'Shopping', description: 'Gifts for Family - Amazon' },
    { month: 10, date: 22, amount: 2800, category: 'Shopping', description: 'Electronics - iPad Accessories' },
    { month: 10, date: 28, amount: 1800, category: 'Shopping', description: 'Jewelry - Tanishq' },

    // Personal Care
    { month: 10, date: 7, amount: 1200, category: 'Personal Care', description: 'Gym Membership - October' },
    { month: 10, date: 13, amount: 1500, category: 'Personal Care', description: 'Festive Makeover - Salon' },
    { month: 10, date: 24, amount: 400, category: 'Personal Care', description: 'Skincare Products' },

    // Entertainment
    { month: 10, date: 11, amount: 450, category: 'Entertainment', description: 'Movie - PVR (Venom)' },
    { month: 10, date: 31, amount: 800, category: 'Entertainment', description: 'Diwali Party Entry - Club' },
    { month: 10, date: 5, amount: 199, category: 'Entertainment', description: 'Netflix Subscription' },
    { month: 10, date: 5, amount: 149, category: 'Entertainment', description: 'Spotify Premium' },

    // Travel - Diwali Trip Home
    { month: 10, date: 29, amount: 4500, category: 'Travel', description: 'Flight Tickets - Bangalore to Delhi (Diwali)' },
    { month: 10, date: 29, amount: 800, category: 'Travel', description: 'Airport Cab' },

    // Daily Essentials
    { month: 10, date: 7, amount: 280, category: 'Food', description: 'Quick Groceries - Blinkit' },
    { month: 10, date: 17, amount: 420, category: 'Personal Care', description: 'Festive Prep - Instamart' },
    { month: 10, date: 26, amount: 230, category: 'Food', description: 'Late Night Essentials - Zepto' },

    // Miscellaneous
    { month: 10, date: 12, amount: 3000, category: 'Miscellaneous', description: 'Diwali - Gifts & Donations' },
    { month: 10, date: 31, amount: 1000, category: 'Miscellaneous', description: 'Diwali Firecrackers' },
    { month: 10, date: 30, amount: 500, category: 'Miscellaneous', description: 'Phone Recharge' },

    // ========== NOVEMBER 2024 ==========
    // Housing
    { month: 11, date: 1, amount: 15000, category: 'Housing', description: 'PG Rent - November' },
    { month: 11, date: 5, amount: 1280, category: 'Housing', description: 'Electricity Bill' },

    // Food - Groceries
    { month: 11, date: 4, amount: 1250, category: 'Food', description: 'Monthly Groceries - BigBasket' },
    { month: 11, date: 11, amount: 420, category: 'Food', description: 'Vegetables & Fruits' },
    { month: 11, date: 18, amount: 350, category: 'Food', description: 'Dairy Products' },
    { month: 11, date: 25, amount: 510, category: 'Food', description: 'Weekly Restock - More Megastore' },

    // Food Delivery
    { month: 11, date: 6, amount: 340, category: 'Food', description: 'Dinner - Swiggy' },
    { month: 11, date: 12, amount: 290, category: 'Food', description: 'Lunch - Zomato' },
    { month: 11, date: 17, amount: 410, category: 'Food', description: 'Weekend Indulgence - Swiggy' },
    { month: 11, date: 23, amount: 350, category: 'Food', description: 'Dinner - Zomato' },
    { month: 11, date: 28, amount: 380, category: 'Food', description: 'Late Night - Swiggy' },

    // Restaurants & Cafes
    { month: 11, date: 9, amount: 850, category: 'Food', description: 'Weekend Lunch - Chianti' },
    { month: 11, date: 16, amount: 1200, category: 'Food', description: 'Team Outing - Toit' },
    { month: 11, date: 24, amount: 950, category: 'Food', description: 'Brunch - The Fatty Bao' },
    { month: 11, date: 30, amount: 680, category: 'Food', description: 'Dinner - Meghana Foods' },

    // Transportation
    { month: 11, date: 2, amount: 800, category: 'Transportation', description: 'Metro Card Top-up' },
    { month: 11, date: 10, amount: 280, category: 'Transportation', description: 'Uber - Weekend Trip' },
    { month: 11, date: 19, amount: 200, category: 'Transportation', description: 'Auto - Market' },
    { month: 11, date: 26, amount: 320, category: 'Transportation', description: 'Ola - Friend\'s Place' },

    // Shopping
    { month: 11, date: 8, amount: 2400, category: 'Shopping', description: 'Winter Wear - Decathlon' },
    { month: 11, date: 15, amount: 1800, category: 'Shopping', description: 'Shoes - Nike Store' },
    { month: 11, date: 22, amount: 1200, category: 'Shopping', description: 'Accessories - Lifestyle' },
    { month: 11, date: 29, amount: 3500, category: 'Shopping', description: 'Black Friday Sale - Amazon (Gadgets)' },

    // Personal Care
    { month: 11, date: 7, amount: 1200, category: 'Personal Care', description: 'Gym Membership - November' },
    { month: 11, date: 14, amount: 950, category: 'Personal Care', description: 'Salon - Hair Treatment' },
    { month: 11, date: 27, amount: 380, category: 'Personal Care', description: 'Medicines - Pharmacy' },

    // Entertainment
    { month: 11, date: 10, amount: 400, category: 'Entertainment', description: 'Movie - PVR (Bhool Bhulaiyaa 3)' },
    { month: 11, date: 23, amount: 600, category: 'Entertainment', description: 'Stand-up Comedy Show' },
    { month: 11, date: 5, amount: 199, category: 'Entertainment', description: 'Netflix Subscription' },
    { month: 11, date: 5, amount: 149, category: 'Entertainment', description: 'Spotify Premium' },

    // Daily Essentials
    { month: 11, date: 13, amount: 260, category: 'Food', description: 'Emergency Items - Blinkit' },
    { month: 11, date: 20, amount: 340, category: 'Personal Care', description: 'Personal Care - Instamart' },
    { month: 11, date: 27, amount: 210, category: 'Food', description: 'Snacks - Zepto' },

    // Miscellaneous
    { month: 11, date: 21, amount: 1200, category: 'Miscellaneous', description: 'Friend\'s Wedding Gift' },
    { month: 11, date: 30, amount: 500, category: 'Miscellaneous', description: 'Mobile Recharge' },

    // ========== DECEMBER 2024 ==========
    // Housing
    { month: 12, date: 1, amount: 15000, category: 'Housing', description: 'PG Rent - December' },
    { month: 12, date: 6, amount: 1400, category: 'Housing', description: 'Electricity Bill (Winter - Heater)' },
    { month: 12, date: 15, amount: 500, category: 'Housing', description: 'Gas Refill' },

    // Food - Groceries
    { month: 12, date: 2, amount: 1450, category: 'Food', description: 'Monthly Groceries - BigBasket' },
    { month: 12, date: 8, amount: 480, category: 'Food', description: 'Vegetables - Organic Store' },
    { month: 12, date: 14, amount: 380, category: 'Food', description: 'Dairy & Bakery' },
    { month: 12, date: 21, amount: 620, category: 'Food', description: 'Christmas Special - Spencer\'s' },

    // Food Delivery
    { month: 12, date: 5, amount: 370, category: 'Food', description: 'Dinner - Swiggy' },
    { month: 12, date: 11, amount: 310, category: 'Food', description: 'Lunch - Zomato' },
    { month: 12, date: 16, amount: 440, category: 'Food', description: 'Weekend Treat - Swiggy' },
    { month: 12, date: 22, amount: 380, category: 'Food', description: 'Christmas Eve - Zomato' },
    { month: 12, date: 27, amount: 420, category: 'Food', description: 'Year-end Celebration - Swiggy' },

    // Restaurants & Cafes
    { month: 12, date: 7, amount: 1400, category: 'Food', description: 'Christmas Party - Flechazo' },
    { month: 12, date: 14, amount: 980, category: 'Food', description: 'Weekend Brunch - Third Wave Coffee' },
    { month: 12, date: 24, amount: 2200, category: 'Food', description: 'Christmas Dinner - The 13th Floor' },
    { month: 12, date: 31, amount: 3500, category: 'Food', description: 'New Year\'s Eve - Skyye Lounge' },

    // Transportation
    { month: 12, date: 3, amount: 800, category: 'Transportation', description: 'Metro Card Recharge' },
    { month: 12, date: 13, amount: 420, category: 'Transportation', description: 'Uber - Christmas Shopping' },
    { month: 12, date: 20, amount: 280, category: 'Transportation', description: 'Ola - Mall Trip' },
    { month: 12, date: 28, amount: 350, category: 'Transportation', description: 'Rapido - Multiple Stops' },
    { month: 12, date: 31, amount: 600, category: 'Transportation', description: 'Uber - New Year Party' },

    // Shopping (Year-end Sales & Christmas)
    { month: 12, date: 10, amount: 4200, category: 'Shopping', description: 'Year-end Sale - Zara (Winter Collection)' },
    { month: 12, date: 18, amount: 3800, category: 'Shopping', description: 'Christmas Gifts - Amazon' },
    { month: 12, date: 23, amount: 2500, category: 'Shopping', description: 'Party Outfit - AND' },
    { month: 12, date: 26, amount: 1800, category: 'Shopping', description: 'Boxing Day Sale - Flipkart' },

    // Personal Care
    { month: 12, date: 7, amount: 1200, category: 'Personal Care', description: 'Gym Membership - December' },
    { month: 12, date: 19, amount: 1800, category: 'Personal Care', description: 'Pre-New Year Salon - Full Package' },
    { month: 12, date: 29, amount: 420, category: 'Personal Care', description: 'Skincare - Nykaa' },

    // Entertainment
    { month: 12, date: 12, amount: 450, category: 'Entertainment', description: 'Movie - PVR (Pushpa 2)' },
    { month: 12, date: 25, amount: 800, category: 'Entertainment', description: 'Christmas Concert' },
    { month: 12, date: 31, amount: 1500, category: 'Entertainment', description: 'New Year Party Entry' },
    { month: 12, date: 5, amount: 199, category: 'Entertainment', description: 'Netflix Subscription' },
    { month: 12, date: 5, amount: 149, category: 'Entertainment', description: 'Spotify Premium' },
    { month: 12, date: 20, amount: 299, category: 'Entertainment', description: 'Amazon Prime - Annual Renewal' },

    // Travel - Year-end Trip
    { month: 12, date: 27, amount: 8500, category: 'Travel', description: 'Goa Trip - Flight & Hotel Booking' },
    { month: 12, date: 28, amount: 3200, category: 'Travel', description: 'Goa - Activities & Sightseeing' },
    { month: 12, date: 29, amount: 2500, category: 'Travel', description: 'Goa - Beach Party & Dinner' },

    // Daily Essentials
    { month: 12, date: 9, amount: 290, category: 'Food', description: 'Quick Groceries - Blinkit' },
    { month: 12, date: 17, amount: 380, category: 'Personal Care', description: 'Winter Care Products - Instamart' },
    { month: 12, date: 26, amount: 240, category: 'Food', description: 'Post-Christmas Essentials - Zepto' },

    // Miscellaneous
    { month: 12, date: 15, amount: 2000, category: 'Miscellaneous', description: 'Charity Donation - Year End' },
    { month: 12, date: 25, amount: 1500, category: 'Miscellaneous', description: 'Christmas Gifts for PG Staff' },
    { month: 12, date: 30, amount: 800, category: 'Miscellaneous', description: 'Phone Recharge - New Year Special Pack' },
  ];

  console.log(`📝 Creating ${expenses.length} expense transactions...`);
  let count = 0;

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        userId: demoUser.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: new Date(2025, expense.month - 1, expense.date)
      }
    });
    count++;
    if (count % 50 === 0) {
      console.log(`  ✓ Created ${count}/${expenses.length} expenses...`);
    }
  }
  console.log(`✅ Created all ${expenses.length} expense transactions\n`);

  // ============================================================================
  // BUDGET LIMITS (Show budget feature working)
  // ============================================================================
  console.log('🎯 Creating budget limits...');

  const budgets = [
    // August 2025
    { month: new Date(2025, 7, 1), category: 'Housing', limit: 17000 },
    { month: new Date(2025, 7, 1), category: 'Food', limit: 12000 },
    { month: new Date(2025, 7, 1), category: 'Transportation', limit: 3000 },
    { month: new Date(2025, 7, 1), category: 'Shopping', limit: 5000 },
    { month: new Date(2025, 7, 1), category: 'Entertainment', limit: 2000 },
    { month: new Date(2025, 7, 1), category: 'Personal Care', limit: 3000 },

    // September 2025
    { month: new Date(2025, 8, 1), category: 'Housing', limit: 17000 },
    { month: new Date(2025, 8, 1), category: 'Food', limit: 15000 },
    { month: new Date(2025, 8, 1), category: 'Transportation', limit: 3000 },
    { month: new Date(2025, 8, 1), category: 'Shopping', limit: 8000 },
    { month: new Date(2025, 8, 1), category: 'Entertainment', limit: 2500 },
    { month: new Date(2025, 8, 1), category: 'Personal Care', limit: 3000 },

    // October 2025 (Festive season - higher budgets)
    { month: new Date(2025, 9, 1), category: 'Housing', limit: 17000 },
    { month: new Date(2025, 9, 1), category: 'Food', limit: 18000 },
    { month: new Date(2025, 9, 1), category: 'Transportation', limit: 4000 },
    { month: new Date(2025, 9, 1), category: 'Shopping', limit: 15000 },
    { month: new Date(2025, 9, 1), category: 'Entertainment', limit: 3000 },
    { month: new Date(2025, 9, 1), category: 'Personal Care', limit: 3500 },
    { month: new Date(2025, 9, 1), category: 'Travel', limit: 6000 },

    // November 2025
    { month: new Date(2025, 10, 1), category: 'Housing', limit: 17000 },
    { month: new Date(2025, 10, 1), category: 'Food', limit: 12000 },
    { month: new Date(2025, 10, 1), category: 'Transportation', limit: 3000 },
    { month: new Date(2025, 10, 1), category: 'Shopping', limit: 10000 },
    { month: new Date(2025, 10, 1), category: 'Entertainment', limit: 2500 },
    { month: new Date(2025, 10, 1), category: 'Personal Care', limit: 3000 },

    // December 2025 (Year-end - travel & celebrations)
    { month: new Date(2025, 11, 1), category: 'Housing', limit: 17000 },
    { month: new Date(2025, 11, 1), category: 'Food', limit: 15000 },
    { month: new Date(2025, 11, 1), category: 'Transportation', limit: 4000 },
    { month: new Date(2025, 11, 1), category: 'Shopping', limit: 12000 },
    { month: new Date(2025, 11, 1), category: 'Entertainment', limit: 4000 },
    { month: new Date(2025, 11, 1), category: 'Personal Care', limit: 3500 },
    { month: new Date(2025, 11, 1), category: 'Travel', limit: 15000 },
  ];

  for (const budget of budgets) {
    await prisma.budgetLimit.create({
      data: {
        userId: demoUser.id,
        category: budget.category,
        limitAmount: budget.limit,
        month: budget.month
      }
    });
  }
  console.log(`✅ Created ${budgets.length} budget limits\n`);

  // ============================================================================
  // RECURRING TRANSACTIONS (Automated Transaction Templates)
  // ============================================================================
  console.log('🔄 Creating recurring transaction templates...\n');

  /**
   * WHY RECURRING TRANSACTIONS IN DEMO DATA?
   *
   * Purpose: Demonstrate the automated recurring transactions feature
   *
   * Real-World Context:
   * - Monthly salary: Most predictable income source
   * - Monthly rent: Fixed housing expense
   * - Gym membership: Regular fitness subscription
   * - Streaming services: Netflix, Spotify, etc.
   * - Weekly grocery shopping: Regular food expenses
   *
   * Technical Demonstration:
   * - Shows different frequencies (daily, weekly, monthly)
   * - Demonstrates both recurring expenses and incomes
   * - nextDate calculation logic in action
   * - Active vs inactive templates
   * - Future automation capability
   *
   * Interview Talking Points:
   * Q: Why include recurring transactions in demo?
   * A: Real users have predictable expenses/income. This feature:
   *    1. Reduces manual data entry (set once, auto-generates forever)
   *    2. Ensures users never forget regular payments
   *    3. Helps with budget planning (know upcoming expenses)
   *    4. Demonstrates understanding of real-world finance patterns
   */

  // Recurring Income Templates
  console.log('  💰 Creating recurring income templates...');
  const recurringIncomes = [
    {
      amount: 80000,
      source: 'Monthly Salary - Tech Corp India',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 1),  // August 1, 2025
      nextDate: new Date(2026, 0, 1),   // January 1, 2026 (next salary after Dec)
      isActive: true,
      description: 'Primary income source - processed on 1st of every month'
    },
    {
      amount: 5000,
      source: 'Freelance Retainer - Side Project',
      frequency: 'monthly',
      startDate: new Date(2025, 10, 1), // November 1, 2025
      nextDate: new Date(2026, 0, 1),   // January 1, 2026
      isActive: true,
      description: 'Recurring freelance work - started in November'
    }
  ];

  for (const income of recurringIncomes) {
    await prisma.recurringIncome.create({
      data: {
        userId: demoUser.id,
        amount: income.amount,
        source: income.source,
        frequency: income.frequency,
        startDate: income.startDate,
        nextDate: income.nextDate,
        isActive: income.isActive
      }
    });
  }
  console.log(`  ✅ Created ${recurringIncomes.length} recurring income templates\n`);

  // Recurring Expense Templates
  console.log('  💸 Creating recurring expense templates...');
  const recurringExpenses = [
    // MONTHLY RECURRING EXPENSES
    {
      amount: 15000,
      description: 'PG Rent - Monthly',
      category: 'Housing',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 1),  // August 1, 2025
      nextDate: new Date(2026, 0, 1),   // January 1, 2026
      isActive: true,
      note: 'Fixed monthly expense - highest priority'
    },
    {
      amount: 1200,
      description: 'Cult.fit Gym Membership',
      category: 'Personal Care',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 15), // August 15, 2025
      nextDate: new Date(2026, 0, 15),  // January 15, 2026
      isActive: true,
      note: 'Health & wellness subscription'
    },
    {
      amount: 199,
      description: 'Netflix Subscription - Premium',
      category: 'Entertainment',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 5),  // August 5, 2025
      nextDate: new Date(2026, 0, 5),   // January 5, 2026
      isActive: true,
      note: 'Entertainment streaming service'
    },
    {
      amount: 149,
      description: 'Spotify Premium Subscription',
      category: 'Entertainment',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 5),  // August 5, 2025
      nextDate: new Date(2026, 0, 5),   // January 5, 2026
      isActive: true,
      note: 'Music streaming service'
    },
    {
      amount: 1000,
      description: 'Electricity Bill (Average)',
      category: 'Housing',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 5),  // August 5, 2025
      nextDate: new Date(2026, 0, 5),   // January 5, 2026
      isActive: true,
      note: 'Utility bill - amount may vary slightly'
    },
    {
      amount: 500,
      description: 'PG Maintenance Charges',
      category: 'Housing',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 10), // August 10, 2025
      nextDate: new Date(2026, 0, 10),  // January 10, 2026
      isActive: true,
      note: 'Fixed maintenance fee'
    },
    {
      amount: 600,
      description: 'Phone Recharge - Airtel Postpaid',
      category: 'Miscellaneous',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 30), // August 30, 2025
      nextDate: new Date(2026, 0, 30),  // January 30, 2026
      isActive: true,
      note: 'Mobile bill payment'
    },

    // WEEKLY RECURRING EXPENSES
    {
      amount: 1500,
      description: 'Weekly Groceries - BigBasket',
      category: 'Food',
      frequency: 'weekly',
      startDate: new Date(2025, 7, 3),  // August 3, 2025 (Sunday)
      nextDate: new Date(2026, 0, 4),   // January 4, 2026 (Next Sunday after Dec)
      isActive: true,
      note: 'Regular grocery shopping every Sunday'
    },
    {
      amount: 300,
      description: 'Weekly Room Cleaning Service',
      category: 'Housing',
      frequency: 'weekly',
      startDate: new Date(2025, 7, 4),  // August 4, 2025 (Monday)
      nextDate: new Date(2026, 0, 5),   // January 5, 2026 (Next Monday)
      isActive: true,
      note: 'PG room cleaning every Monday'
    },

    // YEARLY RECURRING EXPENSES
    {
      amount: 299,
      description: 'Amazon Prime - Annual Subscription',
      category: 'Entertainment',
      frequency: 'yearly',
      startDate: new Date(2025, 11, 20), // December 20, 2025
      nextDate: new Date(2026, 11, 20),  // December 20, 2026
      isActive: true,
      note: 'Annual renewal - includes Prime Video, Music, Shopping benefits'
    },
    {
      amount: 1500,
      description: 'Annual Health Checkup',
      category: 'Personal Care',
      frequency: 'yearly',
      startDate: new Date(2025, 9, 15),  // October 15, 2025
      nextDate: new Date(2026, 9, 15),   // October 15, 2026
      isActive: true,
      note: 'Yearly preventive health screening'
    },

    // INACTIVE TEMPLATE (Paused)
    {
      amount: 500,
      description: 'Audible Subscription (PAUSED)',
      category: 'Entertainment',
      frequency: 'monthly',
      startDate: new Date(2025, 7, 1),  // August 1, 2025
      nextDate: new Date(2025, 10, 1),  // November 1, 2025 (paused in Nov)
      isActive: false,
      note: 'Example of paused subscription - demonstrates isActive=false'
    }
  ];

  for (const expense of recurringExpenses) {
    await prisma.recurringExpense.create({
      data: {
        userId: demoUser.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        frequency: expense.frequency,
        startDate: expense.startDate,
        nextDate: expense.nextDate,
        isActive: expense.isActive
      }
    });
  }
  console.log(`  ✅ Created ${recurringExpenses.length} recurring expense templates\n`);

  console.log('✅ All recurring transaction templates created successfully!\n');

  /**
   * RECURRING TRANSACTIONS - INTERVIEW TALKING POINTS
   *
   * Q: Why are nextDate values set to January 2026?
   * A: Because the demo data covers August-December 2025. Setting nextDate to
   *    January 2026 means these templates are "ready" to generate transactions
   *    for the next month. In production, the cron job would process these on
   *    January 1, 2026 at midnight.
   *
   * Q: Why include an inactive template?
   * A: To demonstrate the pause/resume functionality. Real users might pause
   *    subscriptions temporarily (traveling, budget constraints, etc.) without
   *    deleting the template. The isActive=false flag preserves the template
   *    for easy reactivation.
   *
   * Q: How do these relate to the existing expense/income transactions?
   * A: The existing transactions (August-December 2025) were manually seeded.
   *    These recurring templates would GENERATE similar transactions automatically
   *    going forward. In a real scenario, you'd either:
   *    1. Create recurring template first, let cron generate transactions, OR
   *    2. Manually create past transactions, set up recurring for future
   *
   * Q: Why different frequencies (daily, weekly, monthly, yearly)?
   * A: To demonstrate the flexibility of the system and test edge cases:
   *    - Daily: Rare but useful for daily allowances, medications
   *    - Weekly: Common for groceries, cleaning services
   *    - Monthly: Most common (rent, subscriptions, salary)
   *    - Yearly: Insurance, annual subscriptions, health checkups
   *
   * Q: What happens when cron runs on January 1, 2026?
   * A: The processRecurringTransactions function will:
   *    1. Find all active templates where nextDate <= January 1, 2026
   *    2. Create expense/income transactions for each
   *    3. Update nextDate to February 1, 2026 (monthly) or next occurrence
   *    4. Link generated transactions to recurring template via recurringId
   *
   * Q: How do you prevent duplicate generation?
   * A: Multiple safeguards:
   *    1. nextDate checkpoint: Only process where nextDate <= today
   *    2. Immediate update: nextDate updated in same transaction as creation
   *    3. Database transaction: Both operations atomic (all or nothing)
   *    4. Cron schedule: Runs once per day, not multiple times
   *
   * Q: What about month-end edge cases (Jan 31 -> Feb 28)?
   * A: The calculateNextDate function handles this:
   *    - If adding a month changes the day, it sets to last day of intended month
   *    - Example: Jan 31 + 1 month = Feb 28 (not Mar 3)
   *    - Leap year aware for Feb 29 dates
   */

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('📊 SEEDING SUMMARY');
  console.log('==================');
  console.log(`👤 Demo User: Priya Sharma (demo@budgetbuddy.com)`);
  console.log(`🔑 Password: demo123`);
  console.log(`💰 Income Transactions: ${incomeData.length}`);
  console.log(`💸 Expense Transactions: ${expenses.length}`);
  console.log(`🎯 Budget Limits: ${budgets.length}`);
  console.log(`🔄 Recurring Incomes: ${recurringIncomes.length}`);
  console.log(`🔄 Recurring Expenses: ${recurringExpenses.length}`);
  console.log(`📅 Data Period: August 2025 - December 2025\n`);

  console.log('✨ Demo data seeded successfully!');
  console.log('🚀 Recruiters can now login with:');
  console.log('   Email: demo@budgetbuddy.com');
  console.log('   Password: demo123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
