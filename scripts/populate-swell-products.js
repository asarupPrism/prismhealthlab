// Script to populate Swell store with diagnostic panel products
// Run with: node scripts/populate-swell-products.js

require('dotenv').config({ path: '.env.local' });
const { swell } = require('swell-node');

// Initialize Swell backend client
swell.init(
  process.env.NEXT_PUBLIC_SWELL_STORE_ID || 'your-store-id',
  process.env.SWELL_SECRET_KEY || 'your-secret-key'
);

// Diagnostic panel data to populate
const diagnosticPanels = [
  {
    name: 'Muscle & Performance',
    slug: 'muscle-performance',
    price: 149,
    description: 'Optimize muscle growth, hormone balance, recovery tracking, and nutritional status for fitness enthusiasts and athletes.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['performance'],
    attributes: {
      keyTests: [
        'Testosterone (Total + Free)',
        'DHEA Sulfate Level', 
        'Estradiol',
        'Creatine Kinase (CPK Total)',
        'Vitamin D 25-OH',
        'Comprehensive Metabolic Panel',
        'Lipid Panel'
      ],
      turnaroundTime: '2-3 days',
      fasting: true,
      sampleType: 'Blood',
      biomarkers: 7,
      bestFor: 'Athletes & Fitness Enthusiasts',
      color: 'emerald',
      icon: '▲'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Performance+Panel'
        }
      }
    ]
  },
  {
    name: 'Longevity & Wellness',
    slug: 'longevity-wellness',
    price: 99,
    description: 'Early detection of chronic disease markers, metabolic optimization, inflammation monitoring, and immune status assessment for proactive health management.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['wellness'],
    attributes: {
      keyTests: [
        'Hemoglobin A1C',
        'Comprehensive Metabolic Panel',
        'Lipid Panel',
        'C-Reactive Protein (hs-CRP)',
        'Ferritin / Iron / TIBC',
        'Vitamin B12 / Folate Panel',
        'Vitamin D 25-OH',
        'TSH'
      ],
      turnaroundTime: '2-3 days',
      fasting: true,
      sampleType: 'Blood',
      biomarkers: 8,
      bestFor: 'Health-Conscious Individuals, Preventive Care',
      color: 'cyan',
      icon: '◆'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/06b6d4/ffffff?text=Wellness+Panel'
        }
      }
    ]
  },
  {
    name: 'Routine Self-Care & Deficiency',
    slug: 'routine-selfcare',
    price: 59,
    description: 'General baseline health check-up focused on identifying nutritional and metabolic deficiencies early for routine wellness monitoring.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['wellness'],
    attributes: {
      keyTests: [
        'Comprehensive Metabolic Panel',
        'Lipid Panel',
        'Vitamin D 25-OH',
        'Vitamin B12',
        'Folate',
        'Iron / TIBC',
        'Ferritin',
        'TSH'
      ],
      turnaroundTime: '2-3 days',
      fasting: true,
      sampleType: 'Blood',
      biomarkers: 8,
      bestFor: 'General Population, Budget-Conscious',
      color: 'blue',
      icon: '■'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Routine+Panel'
        }
      }
    ]
  },
  {
    name: 'General Hormone Panel',
    slug: 'general-hormone',
    price: 89,
    description: 'Basic hormone assessment covering key reproductive and stress hormones for general hormone health monitoring.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['hormones'],
    attributes: {
      keyTests: [
        'Testosterone (Total)',
        'Estradiol',
        'Progesterone',
        'Cortisol',
        'DHEA Sulfate',
        'TSH',
        'Free T4',
        'Free T3'
      ],
      turnaroundTime: '2-3 days',
      fasting: false,
      sampleType: 'Blood',
      biomarkers: 8,
      bestFor: 'Adults experiencing hormone-related symptoms',
      color: 'amber',
      icon: '●'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Hormone+Panel'
        }
      }
    ]
  },
  {
    name: 'Male Hormone Panel',
    slug: 'male-hormone',
    price: 99,
    description: 'Comprehensive male hormone optimization panel focusing on testosterone, related hormones, and male health markers.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['hormones'],
    attributes: {
      keyTests: [
        'Testosterone (Total + Free)',
        'SHBG',
        'Estradiol',
        'DHT',
        'PSA',
        'LH',
        'FSH',
        'Prolactin',
        'DHEA Sulfate'
      ],
      turnaroundTime: '2-3 days',
      fasting: false,
      sampleType: 'Blood',
      biomarkers: 9,
      bestFor: 'Men seeking hormone optimization',
      color: 'amber',
      icon: '●'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Male+Hormones'
        }
      }
    ]
  },
  {
    name: 'Female Hormone Panel',
    slug: 'female-hormone',
    price: 99,
    description: 'Comprehensive female hormone panel covering reproductive hormones, cycle tracking, and female-specific health markers.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['hormones'],
    attributes: {
      keyTests: [
        'Estradiol',
        'Progesterone',
        'Testosterone (Total + Free)',
        'SHBG',
        'LH',
        'FSH',
        'Prolactin',
        'DHEA Sulfate',
        'Anti-Müllerian Hormone (AMH)'
      ],
      turnaroundTime: '2-3 days',
      fasting: false,
      sampleType: 'Blood',
      biomarkers: 9,
      bestFor: 'Women seeking hormone optimization',
      color: 'amber',
      icon: '●'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Female+Hormones'
        }
      }
    ]
  },
  {
    name: 'Comprehensive Health',
    slug: 'comprehensive-health',
    price: 119,
    description: 'Complete health assessment with multiple biomarkers covering cardiovascular, metabolic, nutritional, and hormonal health.',
    active: true,
    purchasable: true,
    type: 'standard',
    categories: ['comprehensive'],
    attributes: {
      keyTests: [
        'Complete Blood Count (CBC)',
        'Comprehensive Metabolic Panel',
        'Lipid Panel Extended',
        'Hemoglobin A1C',
        'C-Reactive Protein (hs-CRP)',
        'Thyroid Panel (TSH, Free T4, Free T3)',
        'Vitamin D 25-OH',
        'Vitamin B12 / Folate',
        'Iron Studies',
        'Liver Function Tests',
        'Kidney Function Tests',
        'Inflammation Markers',
        'Testosterone (Total)',
        'Estradiol',
        'Cortisol'
      ],
      turnaroundTime: '2-3 days',
      fasting: true,
      sampleType: 'Blood',
      biomarkers: 15,
      bestFor: 'Complete health assessment and monitoring',
      color: 'rose',
      icon: '■'
    },
    images: [
      {
        file: {
          url: 'https://via.placeholder.com/400x300/f43f5e/ffffff?text=Comprehensive+Panel'
        }
      }
    ]
  }
];

// Categories to create
const categories = [
  {
    name: 'Performance & Recovery',
    slug: 'performance',
    description: 'Athletic performance optimization and recovery tracking',
    active: true
  },
  {
    name: 'Wellness & Longevity',
    slug: 'wellness',
    description: 'Comprehensive wellness and preventive health monitoring',
    active: true
  },
  {
    name: 'Hormone Health',
    slug: 'hormones', 
    description: 'Hormone balance and optimization for men and women',
    active: true
  },
  {
    name: 'Comprehensive Health',
    slug: 'comprehensive',
    description: 'Complete health assessment with multiple biomarkers',
    active: true
  }
];

async function populateStore() {
  try {
    console.log('🚀 Starting Swell store population...');

    // Create categories first
    console.log('\n📁 Creating categories...');
    for (const category of categories) {
      try {
        const result = await swell.post('/categories', category);
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Category already exists: ${category.name}`);
        } else {
          console.error(`❌ Error creating category ${category.name}:`, error.message);
        }
      }
    }

    // Create products
    console.log('\n🧪 Creating diagnostic panels...');
    for (const panel of diagnosticPanels) {
      try {
        const result = await swell.post('/products', panel);
        console.log(`✅ Created panel: ${panel.name} - $${panel.price}`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  Panel already exists: ${panel.name}`);
        } else {
          console.error(`❌ Error creating panel ${panel.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Store population completed!');
    console.log('\n📋 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Diagnostic Panels: ${diagnosticPanels.length}`);
    console.log(`- Price Range: $${Math.min(...diagnosticPanels.map(p => p.price))} - $${Math.max(...diagnosticPanels.map(p => p.price))}`);

  } catch (error) {
    console.error('❌ Failed to populate store:', error);
    process.exit(1);
  }
}

// Run the population script
if (require.main === module) {
  populateStore().catch(console.error);
}

module.exports = { populateStore, diagnosticPanels, categories };