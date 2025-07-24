// Script to populate Swell store with diagnostic panel products (fixed version)
// Run with: node scripts/populate-swell-products-fixed.js

require('dotenv').config({ path: '.env.local' });
const { swell } = require('swell-node');

// Category ID mapping (from check-categories.js output)
const categoryMap = {
  performance: '68817bf6cf8ba40012825c40',
  wellness: '68817bf6cf8ba40012825c46', 
  hormones: '68817bf6cf8ba40012825c4f',
  comprehensive: '68817bf7cf8ba40012825c53'
};

// Diagnostic panel data to populate with correct category references
const diagnosticPanels = [
  {
    name: 'Muscle & Performance',
    slug: 'muscle-performance',
    price: 149,
    description: 'Optimize muscle growth, hormone balance, recovery tracking, and nutritional status for fitness enthusiasts and athletes.',
    active: true,
    purchasable: true,
    type: 'standard',
    category_index: { [categoryMap.performance]: { sort: 1 } },
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
    category_index: { [categoryMap.wellness]: { sort: 1 } },
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
    category_index: { [categoryMap.wellness]: { sort: 2 } },
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
    category_index: { [categoryMap.hormones]: { sort: 1 } },
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
    category_index: { [categoryMap.hormones]: { sort: 2 } },
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
    category_index: { [categoryMap.hormones]: { sort: 3 } },
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
    name: 'Comprehensive Health Assessment',
    slug: 'comprehensive-health',
    price: 119,
    description: 'Complete health assessment with multiple biomarkers covering cardiovascular, metabolic, nutritional, and hormonal health.',
    active: true,
    purchasable: true,
    type: 'standard',
    category_index: { [categoryMap.comprehensive]: { sort: 1 } },
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

async function populateProducts() {
  try {
    console.log('🚀 Starting diagnostic panel creation...');

    // Initialize Swell backend client
    await swell.init(
      process.env.NEXT_PUBLIC_SWELL_STORE_ID,
      process.env.SWELL_SECRET_KEY
    );

    console.log('\n🧪 Creating diagnostic panels...');
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const panel of diagnosticPanels) {
      try {
        const result = await swell.post('/products', panel);
        console.log(`✅ Created panel: ${panel.name} - $${panel.price}`);
        successCount++;
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('slug')) {
          console.log(`⚠️  Panel already exists: ${panel.name}`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating panel ${panel.name}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n🎉 Panel creation completed!');
    console.log('\n📋 Summary:');
    console.log(`- Panels Created: ${successCount}`);
    console.log(`- Panels Skipped: ${skippedCount}`);
    console.log(`- Errors: ${errorCount}`);
    console.log(`- Total Panels: ${diagnosticPanels.length}`);
    console.log(`- Price Range: $${Math.min(...diagnosticPanels.map(p => p.price))} - $${Math.max(...diagnosticPanels.map(p => p.price))}`);

    if (successCount > 0) {
      console.log('\n🎯 Next Steps:');
      console.log('1. Run: npm run dev (to start development server)');
      console.log('2. Visit: http://localhost:3000/products');
      console.log('3. Test the shopping cart and checkout flow');
    }

  } catch (error) {
    console.error('❌ Failed to populate products:', error);
    process.exit(1);
  }
}

// Run the population script
if (require.main === module) {
  populateProducts().catch(console.error);
}

module.exports = { populateProducts, diagnosticPanels };