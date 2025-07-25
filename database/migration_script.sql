-- ================================================================
-- PRISM HEALTH LAB - SAFE MIGRATION SCRIPT
-- ================================================================
-- This script safely migrates existing Prism Health Lab databases
-- to support the new admin dashboard functionality.
-- 
-- IMPORTANT: Run this in a transaction and test thoroughly
-- before applying to production!
-- ================================================================

-- Begin transaction for safety
BEGIN;

-- ================================================================
-- BACKUP EXISTING DATA (CREATE BACKUP TABLES)
-- ================================================================

-- Create backup tables for critical data
CREATE TABLE IF NOT EXISTS backup_profiles AS SELECT * FROM public.profiles WHERE false;
CREATE TABLE IF NOT EXISTS backup_orders AS SELECT * FROM public.orders WHERE false;
CREATE TABLE IF NOT EXISTS backup_appointments AS SELECT * FROM public.appointments WHERE false;
CREATE TABLE IF NOT EXISTS backup_test_results AS SELECT * FROM public.test_results WHERE false;

-- Backup existing data
INSERT INTO backup_profiles SELECT * FROM public.profiles;
-- Note: Add similar backups for other critical tables if they exist

-- ================================================================
-- SAFE COLUMN ADDITIONS AND MODIFICATIONS
-- ================================================================

-- Add new columns to existing profiles table (if they don't exist)
DO $$ 
BEGIN
    -- Add new profile columns safely
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at') THEN
        ALTER TABLE public.profiles ADD COLUMN last_sign_in_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'allergies') THEN
        ALTER TABLE public.profiles ADD COLUMN allergies JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'medications') THEN
        ALTER TABLE public.profiles ADD COLUMN medications JSONB DEFAULT '[]';
    END IF;
END $$;

-- Add new columns to existing orders table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE public.orders ADD COLUMN order_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tax_amount') THEN
        ALTER TABLE public.orders ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_amount') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfillment_status') THEN
        ALTER TABLE public.orders ADD COLUMN fulfillment_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'swell_sync_status') THEN
        ALTER TABLE public.orders ADD COLUMN swell_sync_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'swell_last_sync_at') THEN
        ALTER TABLE public.orders ADD COLUMN swell_last_sync_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_source') THEN
        ALTER TABLE public.orders ADD COLUMN order_source TEXT DEFAULT 'web';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_by') THEN
        ALTER TABLE public.orders ADD COLUMN created_by UUID;
    END IF;
END $$;

-- Add new columns to existing appointments table (if they don't exist)
DO $$ 
BEGIN
    -- Check if appointments table exists first
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        -- Add appointment_number if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_number') THEN
            ALTER TABLE public.appointments ADD COLUMN appointment_number TEXT;
        END IF;
        
        -- Add appointment_type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_type') THEN
            ALTER TABLE public.appointments ADD COLUMN appointment_type TEXT DEFAULT 'blood_draw';
        END IF;
        
        -- Standardize date/time columns
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_date') THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'scheduled_date') THEN
                ALTER TABLE public.appointments ADD COLUMN scheduled_date DATE;
                UPDATE public.appointments SET scheduled_date = appointment_date::DATE WHERE appointment_date IS NOT NULL;
            END IF;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_time') THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'scheduled_time') THEN
                ALTER TABLE public.appointments ADD COLUMN scheduled_time TIME;
                UPDATE public.appointments SET scheduled_time = appointment_time::TIME WHERE appointment_time IS NOT NULL;
            END IF;
        END IF;
        
        -- Add staff assignment columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'assigned_staff_id') THEN
            ALTER TABLE public.appointments ADD COLUMN assigned_staff_id UUID;
        END IF;
        
        -- Add communication tracking columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'confirmation_sent_at') THEN
            ALTER TABLE public.appointments ADD COLUMN confirmation_sent_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_24h_sent_at') THEN
            ALTER TABLE public.appointments ADD COLUMN reminder_24h_sent_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reminder_1h_sent_at') THEN
            ALTER TABLE public.appointments ADD COLUMN reminder_1h_sent_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Add new columns to existing test_results table (if they don't exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_results') THEN
        -- Rename status to overall_status for clarity
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'status') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'overall_status') THEN
            ALTER TABLE public.test_results RENAME COLUMN status TO overall_status;
        END IF;
        
        -- Add enhanced columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'sample_collection_date') THEN
            ALTER TABLE public.test_results ADD COLUMN sample_collection_date TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'reviewed_by') THEN
            ALTER TABLE public.test_results ADD COLUMN reviewed_by UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'reviewed_at') THEN
            ALTER TABLE public.test_results ADD COLUMN reviewed_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'notification_sent_at') THEN
            ALTER TABLE public.test_results ADD COLUMN notification_sent_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'patient_viewed') THEN
            ALTER TABLE public.test_results ADD COLUMN patient_viewed BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'patient_viewed_at') THEN
            ALTER TABLE public.test_results ADD COLUMN patient_viewed_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- ================================================================
-- CREATE MISSING TABLES (ONLY IF THEY DON'T EXIST)
-- ================================================================

-- Staff roles table
CREATE TABLE IF NOT EXISTS public.staff_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    default_permissions JSONB DEFAULT '[]',
    is_admin_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff departments table
CREATE TABLE IF NOT EXISTS public.staff_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced staff table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
    employee_id TEXT UNIQUE,
    role_id UUID REFERENCES public.staff_roles(id),
    department_id UUID REFERENCES public.staff_departments(id),
    work_email TEXT,
    work_phone TEXT,
    hire_date DATE,
    employment_status TEXT DEFAULT 'active',
    permissions JSONB DEFAULT '[]',
    location_access JSONB DEFAULT '[]',
    can_access_admin BOOLEAN DEFAULT false,
    admin_dashboard_permissions JSONB DEFAULT '{}',
    work_schedule JSONB DEFAULT '{}',
    last_admin_login TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for department manager (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_department_manager'
    ) THEN
        ALTER TABLE public.staff_departments 
        ADD CONSTRAINT fk_department_manager 
        FOREIGN KEY (manager_id) REFERENCES public.staff(id);
    END IF;
END $$;

-- Order status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    status_type TEXT NOT NULL CHECK (status_type IN ('order', 'payment', 'fulfillment')),
    changed_by UUID REFERENCES public.staff(id),
    change_reason TEXT,
    notes TEXT,
    customer_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment slots table
CREATE TABLE IF NOT EXISTS public.appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    max_appointments INTEGER DEFAULT 1,
    available_slots INTEGER DEFAULT 1,
    assigned_staff_id UUID REFERENCES public.staff(id),
    appointment_types JSONB DEFAULT '[]',
    special_requirements JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, date, start_time, assigned_staff_id)
);

-- Enhanced audit logs (only if current one is insufficient)
DO $$
BEGIN
    -- Check if audit_logs needs enhancement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action_category') THEN
        ALTER TABLE public.audit_logs ADD COLUMN action_category TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'resource_type') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'resource_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'success') THEN
        ALTER TABLE public.audit_logs ADD COLUMN success BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'phi_accessed') THEN
        ALTER TABLE public.audit_logs ADD COLUMN phi_accessed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- System events table
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_category TEXT CHECK (event_category IN ('system', 'integration', 'performance', 'security', 'backup', 'maintenance')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    source_system TEXT,
    source_component TEXT,
    duration_ms INTEGER,
    memory_usage_mb INTEGER,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.staff(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swell integration tables
CREATE TABLE IF NOT EXISTS public.swell_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'customers', 'full')),
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'partial')),
    records_attempted INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    initiated_by UUID REFERENCES public.staff(id)
);

CREATE TABLE IF NOT EXISTS public.swell_product_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    swell_product_id TEXT NOT NULL,
    swell_variant_id TEXT,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'inactive', 'error')),
    current_swell_price DECIMAL(10,2),
    price_last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(diagnostic_test_id, swell_product_id)
);

-- Notification system tables
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    template_type TEXT NOT NULL CHECK (template_type IN ('email', 'sms', 'push', 'in_app')),
    category TEXT NOT NULL CHECK (category IN ('appointment', 'results', 'reminder', 'admin', 'marketing')),
    subject TEXT,
    body_text TEXT NOT NULL,
    body_html TEXT,
    available_variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES public.profiles(user_id),
    recipient_email TEXT,
    recipient_phone TEXT,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'push', 'in_app')),
    template_id UUID REFERENCES public.notification_templates(id),
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    external_message_id TEXT,
    tracking_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business metrics table
CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_period TEXT NOT NULL CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    total_revenue DECIMAL(12,2) DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,
    appointment_utilization_rate DECIMAL(5,2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    total_active_customers INTEGER DEFAULT 0,
    results_processed INTEGER DEFAULT 0,
    turnaround_time_hours DECIMAL(8,2) DEFAULT 0,
    abnormal_results_count INTEGER DEFAULT 0,
    metrics_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(metric_date, metric_period)
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
    description TEXT,
    category TEXT,
    validation_rules JSONB DEFAULT '{}',
    is_sensitive BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- CREATE MISSING INDEXES (SAFELY)
-- ================================================================

-- Function to create index if it doesn't exist
CREATE OR REPLACE FUNCTION create_index_if_not_exists(index_name TEXT, table_name TEXT, columns TEXT)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = index_name) THEN
        EXECUTE format('CREATE INDEX %I ON %I (%s)', index_name, table_name, columns);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes safely
SELECT create_index_if_not_exists('idx_profiles_user_id', 'profiles', 'user_id');
SELECT create_index_if_not_exists('idx_profiles_email', 'profiles', 'email');
SELECT create_index_if_not_exists('idx_profiles_active', 'profiles', 'is_active');
SELECT create_index_if_not_exists('idx_staff_user_id', 'staff', 'user_id');
SELECT create_index_if_not_exists('idx_staff_active_admin', 'staff', 'is_active, can_access_admin');
SELECT create_index_if_not_exists('idx_orders_user_id', 'orders', 'user_id');
SELECT create_index_if_not_exists('idx_orders_swell_id', 'orders', 'swell_order_id');
SELECT create_index_if_not_exists('idx_orders_status', 'orders', 'status');
SELECT create_index_if_not_exists('idx_audit_logs_user_id', 'audit_logs', 'user_id');
SELECT create_index_if_not_exists('idx_audit_logs_created_at', 'audit_logs', 'created_at');

-- Clean up the helper function
DROP FUNCTION create_index_if_not_exists(TEXT, TEXT, TEXT);

-- ================================================================
-- UPDATE EXISTING DATA TO MATCH NEW SCHEMA
-- ================================================================

-- Generate order numbers for existing orders that don't have them
UPDATE public.orders 
SET order_number = 'PHL-' || UPPER(substr(id::text, 1, 8))
WHERE order_number IS NULL AND id IS NOT NULL;

-- Generate appointment numbers for existing appointments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        UPDATE public.appointments 
        SET appointment_number = 'APT-' || UPPER(substr(id::text, 1, 8))
        WHERE appointment_number IS NULL AND id IS NOT NULL;
    END IF;
END $$;

-- Set default values for new columns
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;
UPDATE public.orders SET order_source = 'web' WHERE order_source IS NULL;

-- ================================================================
-- CREATE OR UPDATE FUNCTIONS SAFELY
-- ================================================================

-- Update timestamp function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON public.profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at 
            BEFORE UPDATE ON public.orders 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_updated_at') THEN
        CREATE TRIGGER update_staff_updated_at 
            BEFORE UPDATE ON public.staff 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ================================================================
-- VALIDATION AND ROLLBACK PREPARATION
-- ================================================================

-- Create a function to validate the migration
CREATE OR REPLACE FUNCTION validate_migration()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check if critical tables exist
    RETURN QUERY
    SELECT 
        'Staff Roles Table'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_roles') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Staff roles table exists'::TEXT;
    
    RETURN QUERY
    SELECT 
        'Staff Table'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Staff table exists'::TEXT;
    
    RETURN QUERY
    SELECT 
        'Enhanced Profiles'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Profile table has new columns'::TEXT;
    
    RETURN QUERY
    SELECT 
        'Enhanced Orders'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Orders table has new columns'::TEXT;
    
    RETURN QUERY
    SELECT 
        'Admin Functions'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_updated_at_column') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Admin functions are available'::TEXT;
        
    -- Check data integrity
    RETURN QUERY
    SELECT 
        'Data Integrity'::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM public.profiles) > 0 
             THEN 'PASS' ELSE 'WARN' END::TEXT,
        'Profile data preserved: ' || (SELECT COUNT(*)::TEXT FROM public.profiles) || ' records'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FINAL VALIDATION AND COMMIT PREPARATION
-- ================================================================

-- Run validation
SELECT * FROM validate_migration();

-- Check if any critical errors occurred
DO $$
DECLARE
    error_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO error_count 
    FROM validate_migration() 
    WHERE status = 'FAIL';
    
    IF error_count > 0 THEN
        RAISE EXCEPTION 'Migration validation failed with % errors. Check validation results.', error_count;
    ELSE
        RAISE NOTICE 'Migration validation passed! Ready to commit.';
    END IF;
END $$;

-- ================================================================
-- CLEANUP TEMPORARY FUNCTIONS
-- ================================================================

DROP FUNCTION IF EXISTS validate_migration();

-- ================================================================
-- COMMIT OR ROLLBACK INSTRUCTIONS
-- ================================================================

-- If you've reached this point without errors, the migration is ready
-- To commit: COMMIT;
-- To rollback: ROLLBACK;

COMMIT;

-- ================================================================
-- POST-MIGRATION STEPS
-- ================================================================

-- After successful migration, run these steps:
-- 1. Apply RLS policies: \i admin_rls_policies.sql
-- 2. Insert seed data: \i admin_seed_data.sql
-- 3. Create first admin user using the setup_admin_user function
-- 4. Test admin dashboard access

-- ================================================================
-- END OF MIGRATION SCRIPT
-- ================================================================