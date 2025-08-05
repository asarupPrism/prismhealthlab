-- ================================================================
-- PRISM HEALTH LAB - ADMIN DASHBOARD MIGRATION SCRIPT
-- ================================================================
-- Master deployment script for Prism Health Lab admin functionality
-- 
-- This script safely deploys all admin components in the correct order
-- Compatible with Supabase PostgreSQL
-- Follows HIPAA compliance requirements
-- ================================================================

-- Start transaction for atomic deployment
BEGIN;

-- ================================================================
-- DEPLOYMENT INFORMATION
-- ================================================================

SELECT 
    'Starting Prism Health Lab Admin Migration' as status,
    'This will deploy admin dashboard functionality' as description,
    NOW() as start_time;

-- ================================================================
-- PRE-DEPLOYMENT CHECKS
-- ================================================================

-- Check if we're on Supabase (auth schema should exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE EXCEPTION 'This migration requires Supabase (auth schema not found)';
    END IF;
    
    RAISE NOTICE 'Supabase environment detected - proceeding with migration';
END $$;

-- Check for existing data that might conflict
DO $$
DECLARE
    profile_count INTEGER;
    staff_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles';
    
    SELECT COUNT(*) INTO staff_count FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'staff';
    
    IF profile_count > 0 OR staff_count > 0 THEN
        RAISE NOTICE 'Existing tables detected - migration will enhance existing schema';
    ELSE
        RAISE NOTICE 'Clean deployment - creating new schema';
    END IF;
END $$;

-- ================================================================
-- BACKUP EXISTING DATA (IF ANY)
-- ================================================================

-- Create backup tables for critical data if they exist
DO $$
BEGIN
    -- Backup profiles if table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS backup_profiles_' || to_char(NOW(), 'YYYYMMDD_HH24MI') || ' AS SELECT * FROM public.profiles';
        RAISE NOTICE 'Backed up existing profiles table';
    END IF;

    -- Backup staff if table exists and has data  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff' AND table_schema = 'public') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS backup_staff_' || to_char(NOW(), 'YYYYMMDD_HH24MI') || ' AS SELECT * FROM public.staff';
        RAISE NOTICE 'Backed up existing staff table';
    END IF;
END $$;

-- ================================================================
-- PHASE 1: DEPLOY ADMIN SCHEMA
-- ================================================================

SELECT 'PHASE 1: Deploying admin database schema...' as phase;

-- Deploy consolidated admin schema
\i admin/01_admin_schema.sql

-- ================================================================
-- PHASE 2: DEPLOY RLS POLICIES  
-- ================================================================

SELECT 'PHASE 2: Deploying HIPAA-compliant RLS policies...' as phase;

-- Deploy consolidated RLS policies
\i admin/02_admin_rls_policies.sql

-- ================================================================
-- PHASE 3: DEPLOY SEED DATA
-- ================================================================

SELECT 'PHASE 3: Deploying production seed data...' as phase;

-- Deploy consolidated seed data
\i admin/03_admin_seed_data.sql

-- ================================================================
-- POST-DEPLOYMENT VALIDATION
-- ================================================================

SELECT 'PHASE 4: Validating deployment...' as phase;

-- Validate all essential tables exist
DO $$
DECLARE
    missing_tables TEXT[] := '{}';
    essential_tables TEXT[] := ARRAY[
        'profiles', 'staff', 'staff_roles', 'staff_departments',
        'test_categories', 'diagnostic_tests', 'locations',
        'orders', 'appointments', 'test_results',
        'system_settings', 'notification_templates'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY essential_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Migration incomplete - missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE 'All essential tables validated successfully';
END $$;

-- Validate RLS is enabled on critical tables
DO $$
DECLARE
    unprotected_tables TEXT[] := '{}';
    protected_tables TEXT[] := ARRAY[
        'profiles', 'test_results', 'appointments', 'orders'
    ];
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOREACH table_name IN ARRAY protected_tables
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name AND relnamespace = 'public'::regnamespace;
        
        IF NOT rls_enabled THEN
            unprotected_tables := array_append(unprotected_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(unprotected_tables, 1) > 0 THEN
        RAISE EXCEPTION 'RLS not enabled on critical tables: %', array_to_string(unprotected_tables, ', ');
    END IF;
    
    RAISE NOTICE 'RLS validation passed - all critical tables protected';
END $$;

-- ================================================================
-- DEPLOYMENT SUMMARY
-- ================================================================

SELECT 
    'Prism Health Lab Admin Migration Completed Successfully!' as result,
    'All components deployed and validated' as status,
    (SELECT COUNT(*) FROM public.staff_roles) as staff_roles,
    (SELECT COUNT(*) FROM public.staff_departments) as departments,
    (SELECT COUNT(*) FROM public.locations) as locations,
    (SELECT COUNT(*) FROM public.test_categories) as test_categories,
    (SELECT COUNT(*) FROM public.diagnostic_tests) as diagnostic_tests,
    (SELECT COUNT(*) FROM public.system_settings) as system_settings,
    (SELECT COUNT(*) FROM public.notification_templates) as notification_templates,
    'Ready for admin dashboard deployment' as next_steps,
    NOW() as completed_at;

-- Commit the transaction
COMMIT;

-- ================================================================
-- POST-DEPLOYMENT NOTES
-- ================================================================

SELECT 'DEPLOYMENT COMPLETE' as status,
       'Admin dashboard database is ready' as message,
       'Create your first admin user through Supabase Auth' as next_action;