-- =====================================================
-- Database Schema Check Script
-- =====================================================
-- 
-- Run this first to see what tables already exist
-- in your Supabase database before running the main schema
-- =====================================================

-- Check for existing tables
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check for existing functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check for existing extensions
SELECT 
    extname,
    extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_stat_statements');

-- Check authentication setup
SELECT 
    schema_name
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Check profiles table structure if it exists
SELECT 
    'profiles table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Summary of what exists
SELECT 
    'SUMMARY - Tables that already exist:' as summary_info,
    COUNT(*) as existing_table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if key tables exist that might conflict
SELECT 
    'Key table status:' as table_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
        THEN 'profiles: EXISTS - use safe deployment'
        ELSE 'profiles: NOT EXISTS - can use regular deployment'
    END as profiles_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') 
        THEN 'orders: EXISTS'
        ELSE 'orders: NOT EXISTS'
    END as orders_status;