const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedLocations() {
  try {
    console.log('Seeding locations...')
    
    // Insert default location
    const { data, error } = await supabase
      .from('locations')
      .upsert([
        {
          id: 'schaumburg',
          name: 'Prism Health Lab',
          address: '1321 Tower Road, Schaumburg IL 60173',
          phone: '(847) 555-0123',
          operating_hours: {
            monday: { open: '08:00', close: '17:00', closed: false },
            tuesday: { open: '08:00', close: '17:00', closed: false },
            wednesday: { open: '08:00', close: '17:00', closed: false },
            thursday: { open: '08:00', close: '17:00', closed: false },
            friday: { open: '08:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '15:00', closed: false },
            sunday: { open: '10:00', close: '14:00', closed: false }
          },
          services: ['blood_draw', 'urine_collection', 'rapid_testing'],
          is_active: true
        }
      ], { 
        onConflict: 'id' 
      })
      .select()

    if (error) {
      throw error
    }

    console.log('✅ Locations seeded successfully:', data)
    
    // Verify by fetching
    const { data: locations, error: fetchError } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
    
    if (fetchError) {
      throw fetchError
    }
    
    console.log('📍 Active locations in database:', locations)
    
  } catch (error) {
    console.error('❌ Error seeding locations:', error)
    process.exit(1)
  }
}

seedLocations()