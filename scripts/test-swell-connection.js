// Test script to verify Swell connection
require('dotenv').config({ path: '.env.local' });
const swell = require('swell-js');

// Test client-side connection
async function testClientConnection() {
  console.log('🔍 Testing Swell client-side connection...');
  
  try {
    swell.init(
      process.env.NEXT_PUBLIC_SWELL_STORE_ID,
      process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY,
      {
        url: process.env.NEXT_PUBLIC_SWELL_URL,
      }
    );

    // Test basic API call
    const result = await swell.get('/settings');
    console.log('✅ Client connection successful!');
    console.log('Store name:', result.store?.name || 'Prism Health Lab');
    console.log('Store URL:', result.store?.url || process.env.NEXT_PUBLIC_SWELL_URL);
    
    return true;
  } catch (error) {
    console.error('❌ Client connection failed:', error.message);
    return false;
  }
}

// Test server-side connection (requires secret key)
async function testServerConnection() {
  console.log('\n🔍 Testing Swell server-side connection...');
  
  if (!process.env.SWELL_SECRET_KEY || process.env.SWELL_SECRET_KEY === 'sk_your_secret_key_here') {
    console.log('⚠️  Secret key not configured. Please add your secret key to .env.local');
    console.log('   Get it from: Swell Dashboard → API access → Secret keys');
    return false;
  }

  try {
    const { swell } = require('swell-node');
    
    // Initialize the server client
    await swell.init(
      process.env.NEXT_PUBLIC_SWELL_STORE_ID,
      process.env.SWELL_SECRET_KEY
    );

    // Test server API call
    const products = await swell.get('/products', { limit: 1 });
    console.log('✅ Server connection successful!');
    console.log('Products found:', products.count || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Swell.is integration for Prism Health Lab\n');
  
  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log('Store ID:', process.env.NEXT_PUBLIC_SWELL_STORE_ID);
  console.log('Public Key:', process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY ? '✓ Set' : '❌ Missing');
  console.log('Secret Key:', process.env.SWELL_SECRET_KEY && process.env.SWELL_SECRET_KEY !== 'sk_your_secret_key_here' ? '✓ Set' : '❌ Missing/Default');
  console.log('Store URL:', process.env.NEXT_PUBLIC_SWELL_URL);
  console.log('');

  const clientOk = await testClientConnection();
  const serverOk = await testServerConnection();

  console.log('\n📊 Test Results:');
  console.log('Client-side (frontend):', clientOk ? '✅ Ready' : '❌ Failed');
  console.log('Server-side (backend):', serverOk ? '✅ Ready' : '❌ Failed');

  if (clientOk && serverOk) {
    console.log('\n🎉 All tests passed! Your Swell integration is ready.');
    console.log('Next steps:');
    console.log('1. Run: npm run populate-swell (to add diagnostic panels)');
    console.log('2. Run: npm run dev (to start development server)');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your configuration.');
  }
}

runTests().catch(console.error);