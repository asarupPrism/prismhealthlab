-- =============================================================================
-- PRISM HEALTH LAB DATABASE DEPLOYMENT
-- =============================================================================
-- Run this script in your Supabase SQL editor to create all necessary tables
-- Order is important - run these in sequence:

-- OPTION A: Database Sync Migration (for existing databases)
\i migrations/supabase/20250730_database_sync_migration.sql

-- OPTION B: Fresh Database Setup (run these in order for new databases)
-- Step 1: Base profiles table (MUST run first)
-- \i migrations/supabase/20250725_base_profiles_table.sql

-- Step 2: Enhanced patient portal schema (requires profiles table to exist)
-- \i migrations/supabase/20250725_enhanced_patient_portal_schema.sql

-- Step 3: Additional features (run after base tables are created)
\i migrations/supabase/20250725_hipaa_audit_system.sql
\i migrations/supabase/20250725_pwa_push_notifications.sql
\i migrations/supabase/20250725_cache_monitoring_tables.sql
\i migrations/supabase/20250725_performance_alerts_table.sql

-- Verification queries
SELECT 'Database deployment complete!' as status;
SELECT 'Checking tables...' as step;

-- Check if all core tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'orders', 'appointments', 'test_results', 'locations')
ORDER BY tablename;

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;