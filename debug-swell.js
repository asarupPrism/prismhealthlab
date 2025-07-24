// Simple Node.js script to test Swell API directly
const https = require('https');

const storeId = 'prismhealthlab';
const publicKey = 'pk_b8RNnWKaP3iZHbhu4pUSHQTI3WwtzXpJ';

// Test basic API call
const testSwellAPI = () => {
  const auth = Buffer.from(`${storeId}:${publicKey}`).toString('base64');
  
  const options = {
    hostname: `${storeId}.swell.store`,
    port: 443,
    path: '/api/products',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

// Test with different hostname format
const testSwellAPI2 = () => {
  const auth = Buffer.from(`${storeId}:${publicKey}`).toString('base64');
  
  const options = {
    hostname: 'api.swell.store',
    port: 443,
    path: `/stores/${storeId}/products`,
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status (api.swell.store): ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response (api.swell.store):', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request (api.swell.store): ${e.message}`);
  });

  req.end();
};

console.log('Testing Swell API connection...');
console.log('Store ID:', storeId);
console.log('Public Key:', publicKey);

console.log('\n--- Testing prismhealthlab.swell.store ---');
testSwellAPI();

console.log('\n--- Testing api.swell.store ---');
testSwellAPI2();