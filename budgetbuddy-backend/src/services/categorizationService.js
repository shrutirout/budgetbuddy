// Automatically categorizes expense descriptions using Google Gemini AI.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Other'
];

// In-memory cache for categorization with size limit to prevent unlimited growth.
const categorizationCache = new Map();
const CACHE_SIZE_LIMIT = 1000;

// Categorizes an expense description using AI with caching and validation.
const categorizeExpense = async (description) => {
  if (!description || typeof description !== 'string' || !description.trim()) {
    console.log('❌ Invalid description, defaulting to "Other"');
    return 'Other';
  }

  const normalizedDesc = description.trim().toLowerCase();

  if (categorizationCache.has(normalizedDesc)) {
    console.log(`📦 Cache HIT for: "${description}"`);
    return categorizationCache.get(normalizedDesc);
  }

  console.log(`🔍 Cache MISS for: "${description}" - calling AI...`);

  try {
    const client = getAIClient();
    if (!client) {
      console.error('⚠️ AI client not available, defaulting to "Other"');
      return 'Other';
    }

    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10,
        topP: 0.95,
        topK: 1,
      }
    });

    const prompt = buildCategorizationPrompt(description);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiCategory = response.text().trim();

    console.log(`🤖 AI suggested: "${aiCategory}" for "${description}"`);

    const validatedCategory = CATEGORIES.includes(aiCategory) ? aiCategory : 'Other';

    if (aiCategory !== validatedCategory) {
      console.warn(`⚠️ AI returned invalid category "${aiCategory}", using "Other"`);
    }

    updateCache(normalizedDesc, validatedCategory);

    console.log(`✅ Categorized "${description}" → ${validatedCategory}`);
    return validatedCategory;

  } catch (error) {
    console.error('❌ Categorization error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      description: description
    });
    return 'Other';
  }
};

// Constructs the AI prompt for expense categorization with examples and rules.
const buildCategorizationPrompt = (description) => {
  return `You are an expense categorization AI. Your ONLY job is to categorize expenses accurately.

AVAILABLE CATEGORIES (you MUST choose ONE):
1. Food - Restaurants, groceries, food delivery, Swiggy, Zomato, coffee, cafes, bakeries, supermarkets, vegetables, meat
2. Transport - Uber, Ola, Rapido, taxi, cab, bus, metro, train, flight, petrol, diesel, fuel, parking, bike, car
3. Entertainment - Movies, Netflix, Hotstar, Prime Video, Spotify, YouTube Premium, games, concerts, sports, gym, hobbies
4. Shopping - Clothes, shoes, electronics, furniture, Amazon, Flipkart, Myntra, appliances, gadgets, accessories, home decor
5. Bills - Rent, electricity, water, gas, internet, WiFi, phone, mobile recharge, insurance, EMI, loan, credit card payment
6. Healthcare - Medicine, pharmacy, Apollo, doctor, hospital, clinic, dentist, medical tests, health checkup, insurance
7. Other - ONLY use this if expense truly doesn't fit any above category (gifts, donations, miscellaneous)

CRITICAL RULES:
❌ DO NOT return "Other" unless you absolutely cannot categorize it
✓ THINK about the description carefully before categorizing
✓ Return ONLY the category name - NOTHING ELSE
✓ NO explanations, NO punctuation, NO extra text
✓ Match the exact spelling: "Food" not "food", "Transport" not "Transportation"

EXAMPLES TO LEARN FROM:
"bought groceries" → Food
"Swiggy order" → Food
"coffee at Starbucks" → Food
"Uber ride" → Transport
"petrol for car" → Transport
"metro card top up" → Transport
"Netflix subscription" → Entertainment
"gym membership" → Entertainment
"bought shirt" → Shopping
"Amazon order" → Shopping
"electricity bill payment" → Bills
"mobile recharge" → Bills
"medicines" → Healthcare
"doctor visit" → Healthcare
"birthday gift" → Other
"charity donation" → Other

NOW CATEGORIZE (think carefully before answering):
Expense Description: "${description}"

Your answer (category name only):`;
};

// Singleton AI client instance.
let aiClient = null;

const getAIClient = () => {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return aiClient;
};

// Updates cache with FIFO eviction when limit reached.
const updateCache = (key, category) => {
  if (categorizationCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = categorizationCache.keys().next().value;
    categorizationCache.delete(firstKey);
    console.log(`🗑️ Cache full, evicted: "${firstKey}"`);
  }

  categorizationCache.set(key, category);
};

// Returns cache statistics for monitoring.
const getCacheStats = () => {
  const stats = {
    size: categorizationCache.size,
    limit: CACHE_SIZE_LIMIT,
    utilizationPercentage: (categorizationCache.size / CACHE_SIZE_LIMIT * 100).toFixed(2),
    categories: {}
  };

  for (const category of categorizationCache.values()) {
    stats.categories[category] = (stats.categories[category] || 0) + 1;
  }

  return stats;
};

// Clears the entire cache.
const clearCache = () => {
  const previousSize = categorizationCache.size;
  categorizationCache.clear();
  console.log(`🗑️ Cache cleared (removed ${previousSize} entries)`);
};

// Categorizes multiple expenses with rate limiting.
const bulkCategorize = async (descriptions) => {
  const results = {
    success: 0,
    failed: 0,
    categories: {},
    details: []
  };

  for (const desc of descriptions) {
    try {
      const category = await categorizeExpense(desc);

      results.success++;
      results.categories[category] = (results.categories[category] || 0) + 1;
      results.details.push({ description: desc, category });

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      results.failed++;
      results.details.push({ description: desc, error: error.message });
    }
  }

  return results;
};

module.exports = {
  categorizeExpense,
  bulkCategorize,
  getCacheStats,
  clearCache,
  CATEGORIES
};
