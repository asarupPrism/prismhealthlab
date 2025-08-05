# 🚀 Prism Health Lab Database Deployment Guide

Complete step-by-step guide for deploying the Prism Health Lab database infrastructure.

## 📋 Pre-Deployment Checklist

### ✅ Requirements
- [ ] Supabase project created and accessible
- [ ] Database credentials and connection details
- [ ] `psql` CLI tool installed (or Supabase CLI)
- [ ] Network access to Supabase instance
- [ ] Backup of existing data (if applicable)

### ✅ Environment Setup
- [ ] Confirm target environment (development/staging/production)
- [ ] Verify Supabase project settings
- [ ] Test database connectivity
- [ ] Review security and access requirements

## 🎯 Deployment Options

### Option A: One-Click Deployment (Recommended)

**Best for**: Production deployments, complete setup

```bash
# Connect to your Supabase database
psql -h db.your-project-ref.supabase.co -U postgres -d postgres

# Run the master migration script
\i admin_migration.sql

# Verify deployment
SELECT 'Deployment completed successfully!' as status;
```

### Option B: Step-by-Step Deployment

**Best for**: Development, troubleshooting, custom configurations

```bash
# Step 1: Deploy core schema
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f admin/01_admin_schema.sql

# Step 2: Enable security policies
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f admin/02_admin_rls_policies.sql

# Step 3: Load production data
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f admin/03_admin_seed_data.sql
```

### Option C: Supabase CLI Migration

**Best for**: Version-controlled deployments

```bash
# Reset database to clean state (CAUTION: This destroys data)
supabase db reset

# Apply migrations (copy files to supabase/migrations/ first)
supabase db push
```

## 🔧 Detailed Deployment Steps

### 1. Pre-Deployment Backup

```sql
-- Create backup of existing critical data
CREATE TABLE backup_profiles_$(date +%Y%m%d) AS SELECT * FROM public.profiles;
CREATE TABLE backup_orders_$(date +%Y%m%d) AS SELECT * FROM public.orders;
CREATE TABLE backup_appointments_$(date +%Y%m%d) AS SELECT * FROM public.appointments;
```

### 2. Schema Deployment

```sql
-- Deploy admin schema (creates all tables, indexes, constraints)
\i admin/01_admin_schema.sql

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 3. Security Policy Deployment

```sql
-- Deploy RLS policies (HIPAA compliance)
\i admin/02_admin_rls_policies.sql

-- Verify RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### 4. Seed Data Deployment

```sql
-- Deploy production configuration
\i admin/03_admin_seed_data.sql

-- Verify data loaded
SELECT 
    (SELECT COUNT(*) FROM staff_roles) as roles,
    (SELECT COUNT(*) FROM staff_departments) as departments,
    (SELECT COUNT(*) FROM locations) as locations,
    (SELECT COUNT(*) FROM test_categories) as categories,
    (SELECT COUNT(*) FROM diagnostic_tests) as tests;
```

## 🔍 Post-Deployment Validation

### Critical Validation Checks

```sql
-- 1. Verify essential tables exist
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
    FOREACH table_name IN ARRAY essential_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All essential tables validated ✅';
    END IF;
END $$;

-- 2. Verify RLS policies active
SELECT 
    COUNT(*) as rls_enabled_tables
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relkind = 'r'
AND c.relrowsecurity = true;

-- 3. Verify indexes created
SELECT 
    schemaname, 
    tablename, 
    indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 4. Test RLS functions
SELECT 
    public.get_current_staff() as current_staff,
    public.is_admin() as is_admin,
    public.can_view_phi() as can_view_phi;
```

### Data Validation

```sql
-- Verify seed data loaded correctly
SELECT 'Seed Data Validation' as check_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM staff_roles) >= 5 THEN '✅ Staff roles loaded'
        ELSE '❌ Staff roles missing'
    END as staff_roles,
    CASE 
        WHEN (SELECT COUNT(*) FROM locations) >= 2 THEN '✅ Locations loaded'
        ELSE '❌ Locations missing'
    END as locations,
    CASE 
        WHEN (SELECT COUNT(*) FROM test_categories) >= 5 THEN '✅ Test categories loaded'
        ELSE '❌ Test categories missing'
    END as test_categories,
    CASE 
        WHEN (SELECT COUNT(*) FROM system_settings) >= 8 THEN '✅ System settings loaded'
        ELSE '❌ System settings missing'
    END as system_settings;
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Permission Denied Errors
```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

#### 2. RLS Policy Conflicts
```sql
-- Disable RLS temporarily if needed (CAUTION: Only for debugging)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### 3. Function/Trigger Errors
```sql
-- Check for missing extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

#### 4. Seed Data Conflicts
```sql
-- Clear conflicting data (CAUTION: Data loss)
TRUNCATE TABLE table_name CASCADE;

-- Or use ON CONFLICT clauses in seed data
INSERT INTO table_name (...) VALUES (...) ON CONFLICT (key) DO NOTHING;
```

### Recovery Procedures

#### Rollback Deployment
```sql
-- 1. Drop all created tables (CAUTION: Data loss)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. Restore from backup
INSERT INTO public.profiles SELECT * FROM backup_profiles_20250725;
-- Repeat for other tables...

-- 3. Re-grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
```

#### Partial Recovery
```sql
-- Restore specific table from backup
DELETE FROM public.table_name;
INSERT INTO public.table_name SELECT * FROM backup_table_name_20250725;
```

## 📊 Performance Monitoring

### Post-Deployment Performance Checks

```sql
-- Monitor query performance
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔐 Security Verification

### HIPAA Compliance Checklist

```sql
-- 1. Verify audit logging active
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%audit%' OR trigger_name LIKE '%log%';

-- 2. Test access controls
-- (Run as different user types to verify RLS)
SELECT * FROM profiles LIMIT 1; -- Should respect RLS
SELECT * FROM test_results LIMIT 1; -- Should respect RLS

-- 3. Verify data encryption
SELECT setting FROM pg_settings WHERE name = 'ssl';

-- 4. Check password policies
SELECT * FROM pg_authid WHERE rolname NOT LIKE 'pg_%';
```

## 📞 Support & Next Steps

### Immediate Post-Deployment
1. ✅ Create first admin user in Supabase Auth
2. ✅ Test admin dashboard login
3. ✅ Verify patient portal functionality
4. ✅ Schedule regular backups
5. ✅ Set up monitoring and alerts

### Contact Information
- **Database Issues**: Database Administrator
- **HIPAA Compliance**: Compliance Officer
- **Application Issues**: Development Team
- **Emergency Support**: On-call Engineer

---

**🎉 Congratulations!** Your Prism Health Lab database is now deployed and ready for production use.

**Next Steps**: 
1. Deploy the frontend application
2. Configure Swell.is integration
3. Set up monitoring and alerting
4. Schedule regular security audits