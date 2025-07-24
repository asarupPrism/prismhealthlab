require('dotenv').config({ path: '.env.local' });
const { swell } = require('swell-node');

async function checkCategories() {
  // Initialize Swell backend client
  await swell.init(
    process.env.NEXT_PUBLIC_SWELL_STORE_ID,
    process.env.SWELL_SECRET_KEY
  );

  try {
    const categories = await swell.get('/categories');
    console.log('📁 Categories in store:');
    console.log(JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error('Error fetching categories:', error.message);
  }
}

checkCategories();