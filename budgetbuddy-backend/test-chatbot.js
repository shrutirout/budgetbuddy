// Quick test script to diagnose chatbot issues
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

console.log('Testing Anthropic API...\n');

// Check API key
const apiKey = process.env.ANTHROPIC_API_KEY;
console.log('1. API Key check:');
console.log('   - Present:', apiKey ? 'YES' : 'NO');
console.log('   - Length:', apiKey ? apiKey.length : 0);
console.log('   - Starts with:', apiKey ? apiKey.substring(0, 15) + '...' : 'N/A');
console.log();

// Test Anthropic client
console.log('2. Creating Anthropic client...');
try {
  const client = new Anthropic({ apiKey: apiKey });
  console.log('   ✓ Client created successfully');
  console.log();

  // Test API call
  console.log('3. Testing API call...');
  client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: 'Say "Hello, I am working!" in one sentence.'
      }
    ]
  })
  .then(response => {
    console.log('   ✓ API call successful!');
    console.log('   Response:', response.content[0].text);
    console.log('\n✅ All tests passed! Chatbot should work.');
    process.exit(0);
  })
  .catch(error => {
    console.log('   ✗ API call failed!');
    console.log('   Error:', error.message);
    if (error.status) console.log('   Status:', error.status);
    console.log('\n❌ API test failed. Check your API key.');
    process.exit(1);
  });

} catch (error) {
  console.log('   ✗ Failed to create client');
  console.log('   Error:', error.message);
  console.log('\n❌ Client creation failed.');
  process.exit(1);
}
