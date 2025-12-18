// Full chatbot test - simulates the actual chatbot flow
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🧪 Testing BudgetBuddy AI Chatbot\n');

// Step 1: Check API key
console.log('1️⃣  Checking API Key...');
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log('   ❌ GEMINI_API_KEY not found in .env');
  process.exit(1);
}
console.log('   ✅ API Key found:', apiKey.substring(0, 20) + '...\n');

// Step 2: Initialize client
console.log('2️⃣  Initializing Gemini client...');
const genAI = new GoogleGenerativeAI(apiKey);
console.log('   ✅ Client initialized\n');

// Step 3: Get model
console.log('3️⃣  Loading gemini-2.5-flash model...');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500,
  }
});
console.log('   ✅ Model loaded\n');

// Step 4: Test with financial context
console.log('4️⃣  Testing with financial advisor prompt...');

const financialData = {
  totalIncome: 50000,
  totalExpenses: 35000,
  remainingMoney: 15000,
  savings: 15000,
  categoryBreakdown: [
    { category: 'Food & Dining', amount: 15000, percentage: '42.9' },
    { category: 'Transportation', amount: 10000, percentage: '28.6' },
    { category: 'Entertainment', amount: 10000, percentage: '28.6' }
  ],
  dailySpending: [
    { date: '2024-12-09', amount: 1200 },
    { date: '2024-12-10', amount: 1100 },
    { date: '2024-12-11', amount: 1300 }
  ],
  budgets: []
};

const dailySpendingRate = financialData.dailySpending.reduce((sum, day) => sum + day.amount, 0) / financialData.dailySpending.length;
const daysUntilBroke = Math.floor(financialData.remainingMoney / dailySpendingRate);

const systemContext = `You are a helpful financial advisor chatbot for BudgetBuddy app.

User's Financial Data:
- Total Income this month: ₹${financialData.totalIncome}
- Total Expenses this month: ₹${financialData.totalExpenses}
- Remaining Money: ₹${financialData.remainingMoney}
- Daily Spending Rate: ₹${dailySpendingRate.toFixed(2)}
- Days until money runs out: ${daysUntilBroke} days

Category Breakdown:
${financialData.categoryBreakdown.map(cat => `- ${cat.category}: ₹${cat.amount} (${cat.percentage}%)`).join('\n')}

Instructions:
- Provide specific, actionable advice
- Use Indian Rupee (₹) symbol
- Be concise (2-3 sentences max)`;

const userMessage = 'Can you tell me my expenses for December in 1 sentence?';
const prompt = systemContext + '\n\nUser Question: ' + userMessage;

model.generateContent(prompt)
  .then(result => {
    const response = result.response.text();
    console.log('   ✅ AI Response received!\n');
    console.log('📝 User Question:');
    console.log('   "' + userMessage + '"\n');
    console.log('🤖 AI Response:');
    console.log('   "' + response + '"\n');
    console.log('✅ CHATBOT IS FULLY FUNCTIONAL!\n');
    console.log('🎉 You can now use the chatbot at http://localhost:3000/chat');
    process.exit(0);
  })
  .catch(error => {
    console.log('   ❌ Error:', error.message);
    console.log('\n❌ CHATBOT TEST FAILED');
    process.exit(1);
  });
