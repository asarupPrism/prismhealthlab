#!/usr/bin/env node

/**
 * Admin Tables Setup Script
 * 
 * This script sets up the admin tables (staff_roles, staff_departments, staff)
 * and populates them with initial seed data.
 * 
 * Usage: npm run setup-admin
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupAdminTables() {
  console.log('🚀 Starting admin tables setup...')
  console.log('📍 Supabase URL:', SUPABASE_URL)
  
  try {
    // Read the deployment SQL script
    const scriptPath = path.join(__dirname, '..', 'database', 'admin', 'deploy_admin_tables.sql')
    console.log('📄 Reading SQL script from:', scriptPath)
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`SQL script not found at: ${scriptPath}`)
    }

    const sqlScript = fs.readFileSync(scriptPath, 'utf8')
    console.log('✅ SQL script loaded successfully')

    // Try to execute using RPC function (if available)
    console.log('🔧 Attempting to execute SQL script...')
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript })
      
      if (error) {
        console.log('⚠️  RPC method failed, trying alternative approach...')
        await executeIndividualSections()
      } else {
        console.log('✅ SQL script executed successfully via RPC')
      }
    } catch (rpcError) {
      console.log('⚠️  RPC method not available, trying alternative approach...')
      await executeIndividualSections()
    }

    // Verify the setup
    console.log('🔍 Verifying setup...')
    
    const { data: roles, error: rolesError } = await supabase
      .from('staff_roles')
      .select('id, name')
    
    const { data: departments, error: deptError } = await supabase
      .from('staff_departments')
      .select('id, name')

    if (rolesError) {
      console.error('❌ Error checking roles:', rolesError.message)
    } else {
      console.log(`✅ Staff roles created: ${roles?.length || 0}`)
      if (roles && roles.length > 0) {
        roles.forEach(role => console.log(`   - ${role.name}`))
      }
    }

    if (deptError) {
      console.error('❌ Error checking departments:', deptError.message)
    } else {
      console.log(`✅ Staff departments created: ${departments?.length || 0}`)
      if (departments && departments.length > 0) {
        departments.forEach(dept => console.log(`   - ${dept.name}`))
      }
    }

    console.log('\n🎉 Admin tables setup completed successfully!')
    console.log('📝 You can now create staff accounts through the admin interface.')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

async function executeIndividualSections() {
  console.log('🔧 Executing sections with direct data insertion...')

  console.log('📊 Creating staff departments...')
  const { error: deptError } = await supabase.from('staff_departments').upsert([
    { name: 'Administration', description: 'Executive and administrative management', is_active: true },
    { name: 'Laboratory Operations', description: 'Core laboratory testing and processing', is_active: true },
    { name: 'Clinical Affairs', description: 'Medical oversight and clinical operations', is_active: true },
    { name: 'Patient Services', description: 'Customer service and patient support', is_active: true },
    { name: 'Quality Assurance', description: 'Quality control and regulatory compliance', is_active: true },
    { name: 'Information Technology', description: 'IT support and system administration', is_active: true }
  ], { onConflict: 'name' })

  if (deptError) {
    console.error('❌ Error creating departments:', deptError)
    throw new Error(`Failed to create departments: ${deptError.message}`)
  }

  console.log('👥 Creating staff roles...')
  const { error: rolesError } = await supabase.from('staff_roles').upsert([
    { 
      name: 'Super Administrator', 
      description: 'Full system access with all permissions', 
      level: 5, 
      default_permissions: ['*'], 
      is_admin_role: true, 
      is_active: true 
    },
    { 
      name: 'System Administrator', 
      description: 'Full admin access excluding system configuration', 
      level: 4, 
      default_permissions: ['user_management', 'appointment_management', 'result_management', 'order_management', 'location_management', 'test_management', 'staff_management', 'analytics_access', 'audit_access'], 
      is_admin_role: true, 
      is_active: true 
    },
    { 
      name: 'Lab Manager', 
      description: 'Laboratory operations and staff management', 
      level: 3, 
      default_permissions: ['result_management', 'appointment_management', 'test_management', 'staff_supervision', 'quality_control'], 
      is_admin_role: true, 
      is_active: true 
    },
    { 
      name: 'Medical Director', 
      description: 'Clinical oversight and result review', 
      level: 4, 
      default_permissions: ['result_management', 'clinical_oversight', 'patient_data_access', 'result_approval'], 
      is_admin_role: true, 
      is_active: true 
    },
    { 
      name: 'Lab Technician', 
      description: 'Laboratory testing and result processing', 
      level: 2, 
      default_permissions: ['result_processing', 'sample_processing', 'equipment_operation'], 
      is_admin_role: false, 
      is_active: true 
    },
    { 
      name: 'Phlebotomist', 
      description: 'Blood draw and sample collection', 
      level: 1, 
      default_permissions: ['sample_collection', 'appointment_management', 'patient_interaction'], 
      is_admin_role: false, 
      is_active: true 
    },
    { 
      name: 'Customer Service Representative', 
      description: 'Patient support and appointment scheduling', 
      level: 1, 
      default_permissions: ['appointment_management', 'customer_support', 'basic_order_info'], 
      is_admin_role: false, 
      is_active: true 
    }
  ], { onConflict: 'name' })

  if (rolesError) {
    console.error('❌ Error creating roles:', rolesError)
    throw new Error(`Failed to create roles: ${rolesError.message}`)
  }

  console.log('✅ Individual sections executed successfully')
}

// Run the setup
setupAdminTables().catch(console.error)