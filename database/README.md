# Prism Health Lab - Database Documentation

This directory contains all database-related files for the Prism Health Lab patient portal system.

## 📁 Directory Structure

```
database/
├── admin/                          # Consolidated admin setup (RECOMMENDED)
│   ├── 01_admin_schema.sql        # Core admin database schema
│   ├── 02_admin_rls_policies.sql  # HIPAA-compliant security policies  
│   └── 03_admin_seed_data.sql     # Production-ready seed data
├── migrations/
│   └── supabase/                  # Supabase-specific migrations
│       ├── 20250725_base_profiles_table.sql          # MUST RUN FIRST
│       ├── 20250725_enhanced_patient_portal_schema.sql
│       ├── 20250725_cache_monitoring_tables.sql
│       ├── 20250725_hipaa_audit_system.sql
│       ├── 20250725_performance_alerts_table.sql
│       └── 20250725_pwa_push_notifications.sql
├── deploy.sql                     # Automated deployment script
├── archive/                       # Legacy and obsolete files
│   ├── legacy-sql/               # Original development SQL files
│   └── legacy-fixes/             # Temporary fix files (obsolete)
├── admin_migration.sql           # Master deployment script
└── README.md                     # This documentation
```

## 🚀 Quick Deployment

### Option 1: Immediate Fix for Patient Signup Error

If you're getting "Error creating profile: {}" during patient signup:

1. **Quick Fix** (copy to Supabase SQL Editor):
   ```sql
   -- Copy contents from: QUICK_FIX_patient_signup.sql
   ```

2. **Complete Database Sync** (recommended for production):
   ```sql
   -- Copy contents from: migrations/supabase/20250730_database_sync_migration.sql
   ```

### Option 2: Complete Admin Dashboard Setup (Recommended)

For a complete admin dashboard setup, run the consolidated files in order:

```bash
# Deploy to Supabase
psql -h your-supabase-host -U postgres -d postgres -f admin_migration.sql
```

Or deploy individual files:

```bash
psql -h your-supabase-host -U postgres -d postgres -f admin/01_admin_schema.sql
psql -h your-supabase-host -U postgres -d postgres -f admin/02_admin_rls_policies.sql  
psql -h your-supabase-host -U postgres -d postgres -f admin/03_admin_seed_data.sql
```

### Option 3: Supabase Migration Files

If using Supabase CLI migrations:

```bash
supabase db reset  # Reset to clean state
# Migration files will be applied automatically
```

## 📋 Deployment Order

**CRITICAL**: Always deploy in this exact order to avoid dependency errors:

### For Patient Signup Fix:
1. **Base Profiles Table** (`20250725_base_profiles_table.sql`) - Creates core profiles table FIRST
2. **Enhanced Portal Schema** (`20250725_enhanced_patient_portal_schema.sql`) - Adds 2FA and advanced features

### For Complete Admin Setup:
1. **Schema** (`01_admin_schema.sql`) - Creates tables, indexes, and constraints
2. **RLS Policies** (`02_admin_rls_policies.sql`) - Enables HIPAA-compliant security
3. **Seed Data** (`03_admin_seed_data.sql`) - Loads production-ready configuration

## 🔒 Security Features

### HIPAA Compliance
- ✅ Row Level Security (RLS) on all PHI tables
- ✅ Comprehensive audit logging for data access
- ✅ Role-based access control with least privilege
- ✅ Automatic data access logging for compliance

### Access Control Levels
- **Super Administrator**: Full system access
- **System Administrator**: Full admin access (excluding system config)
- **Lab Manager**: Laboratory operations management
- **Medical Director**: Clinical oversight and result review
- **Lab Technician**: Result processing and sample management
- **Phlebotomist**: Sample collection and appointment management
- **Customer Service**: Patient support and scheduling

## 🏥 Medical Features

### Test Management
- Comprehensive test categories and diagnostic tests
- Integration with Swell.is e-commerce platform
- Clinical significance and interpretation guides
- LOINC code integration for interoperability

### Patient Portal
- Secure result delivery and access
- Appointment scheduling and management
- Medical history and preference management
- HIPAA-compliant communication

### Location Management
- Multi-location support with operational hours
- Capacity management and appointment coordination
- Service offerings and accessibility features

## 📊 System Configuration

### Essential Settings
- Communication preferences and contact information
- Appointment timing and cancellation policies
- Result delivery and notification settings
- HIPAA compliance and audit retention

### Notification System
- Email templates for results and appointments
- SMS reminders and critical alerts
- Customizable notification templates
- Multi-channel communication support

## 🔧 Maintenance

### Regular Tasks
- Monitor audit logs for compliance
- Update notification templates as needed
- Review and update test offerings
- Maintain location and staff information

### Backup Strategy
- Automatic backups before migrations
- HIPAA-compliant data retention policies
- Audit log preservation (7 years)
- Point-in-time recovery capability

## 📈 Performance

### Optimizations
- Comprehensive indexing on all query patterns
- Efficient RLS policies with minimal overhead
- Optimized JSON operations for metadata
- Connection pooling for scalability

### Monitoring
- Performance alerts for slow queries
- Cache monitoring and invalidation
- Resource usage tracking
- Audit log performance metrics

## 🚨 Troubleshooting

### Common Issues

**1. Patient Signup Error: "Error creating profile: {}"**

This usually means RLS policies or permissions are misconfigured. Fix by running:

```sql
-- QUICK FIX - Copy entire contents from: QUICK_FIX_patient_signup.sql
-- This will verify and fix RLS policies, permissions, and indexes

-- Or COMPREHENSIVE FIX - Copy entire contents from:
-- migrations/supabase/20250730_database_sync_migration.sql

-- Verify table exists and has proper structure:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check RLS policies:
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';
```

**2. RLS Permission Denied**
```sql
-- Check if user has proper staff record
SELECT * FROM public.staff WHERE user_id = auth.uid();

-- Verify role permissions
SELECT sr.name, sr.default_permissions 
FROM public.staff s 
JOIN public.staff_roles sr ON s.role_id = sr.id 
WHERE s.user_id = auth.uid();
```

**2. Missing Test Data**
```sql
-- Verify test categories and tests are loaded
SELECT COUNT(*) FROM public.test_categories WHERE is_active = true;
SELECT COUNT(*) FROM public.diagnostic_tests WHERE is_active = true;
```

**3. Audit Log Issues**
```sql
-- Check audit log function
SELECT public.log_phi_access();

-- Verify triggers are active
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%access%';
```

### Support Contacts

- **Database Issues**: Contact IT Department
- **HIPAA Compliance**: Contact Compliance Officer  
- **Clinical Questions**: Contact Medical Director
- **System Configuration**: Contact System Administrator

## 📝 Change Log

### Version 2.0 (July 2025)
- ✅ Consolidated 25 files into 8 essential files
- ✅ Eliminated ~60% duplicate code
- ✅ Improved HIPAA compliance and audit logging
- ✅ Enhanced performance with optimized indexes
- ✅ Clear separation of production vs development files

### Previous Versions
- See `/archive/legacy-sql/README.md` for historical changes

---

**⚠️ IMPORTANT**: All files in `/archive/` are obsolete and should NOT be used for deployment. Use only the active files in `/admin/` and `/migrations/` directories.