-- =====================================================
-- Existing Schema Enhancement Script
-- =====================================================
-- 
-- This script enhances your existing Supabase schema with
-- missing columns and tables needed for the patient portal
-- Based on your current schema analysis
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- ENHANCE EXISTING TABLES WITH MISSING COLUMNS
-- =====================================================

-- Enhance profiles table (add missing healthcare columns)
DO $$ 
BEGIN
    -- Add missing columns to existing profiles table
    BEGIN
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL; -- Column already exists, continue
    END;
END $$;

-- Enhance diagnostic_tests table (add missing columns)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS slug TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS specimen_type TEXT DEFAULT 'blood';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS collection_method TEXT DEFAULT 'venipuncture';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS loinc_codes TEXT[] DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS seo_meta JSONB DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS last_reviewed_date DATE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS next_review_date DATE;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL;
    END;
END $$;

-- Enhance locations table (add missing columns if they don't exist)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE locations ADD COLUMN IF NOT EXISTS slug TEXT;
        ALTER TABLE locations ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
        ALTER TABLE locations ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
        ALTER TABLE locations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
    EXCEPTION
        WHEN duplicate_column THEN
            NULL;
    END;
END $$;

-- Enhance appointments table (add missing columns)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30;
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_notes TEXT;
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS original_appointment_id UUID REFERENCES appointments(id);
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL;
    END;
END $$;

-- Enhance orders table (add missing columns)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_tests JSONB DEFAULT '[]';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS appointments_data JSONB DEFAULT '[]';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_codes TEXT[] DEFAULT '{}';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL;
    END;
END $$;

-- =====================================================
-- CREATE MISSING TABLES (that don't exist in your schema)
-- =====================================================

-- Order line items (missing from your schema)
CREATE TABLE IF NOT EXISTS order_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
    
    -- Swell.is Integration
    swell_product_id TEXT NOT NULL,
    swell_variant_id TEXT,
    
    -- Item Details
    test_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Test-Specific Information
    specimen_requirements TEXT,
    special_instructions TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test availability by location (missing)
CREATE TABLE IF NOT EXISTS test_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Availability Status
    is_available BOOLEAN DEFAULT TRUE,
    stock_level INTEGER,
    estimated_turnaround_days INTEGER,
    
    -- Scheduling
    requires_appointment BOOLEAN DEFAULT TRUE,
    advance_booking_days INTEGER DEFAULT 1,
    max_booking_days INTEGER DEFAULT 90,
    
    -- Special Requirements
    special_handling_required BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(test_id, location_id)
);

-- Health trends and analytics (missing)
CREATE TABLE IF NOT EXISTS health_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) NOT NULL,
    
    -- Trend Information
    biomarker_name TEXT NOT NULL,
    trend_period TEXT NOT NULL CHECK (trend_period IN ('3m', '6m', '1y', '2y', 'all_time')),
    
    -- Trend Data
    trend_direction TEXT CHECK (trend_direction IN ('improving', 'stable', 'declining', 'variable')),
    trend_strength DECIMAL(3,2), -- -1.0 to 1.0
    trend_significance TEXT CHECK (trend_significance IN ('not_significant', 'clinically_relevant', 'concerning', 'critical')),
    
    -- Statistical Data
    data_points INTEGER NOT NULL,
    first_value DECIMAL(15,6),
    last_value DECIMAL(15,6),
    min_value DECIMAL(15,6),
    max_value DECIMAL(15,6),
    avg_value DECIMAL(15,6),
    std_deviation DECIMAL(15,6),
    
    -- Time Range
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    
    -- Analysis
    trend_analysis JSONB DEFAULT '{}',
    recommendations TEXT[],
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_calculation_due TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, biomarker_name, trend_period)
);

-- Push notification tracking (missing)
CREATE TABLE IF NOT EXISTS result_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) NOT NULL,
    result_id UUID REFERENCES test_results(id),
    
    -- Notification Details
    notification_type TEXT NOT NULL CHECK (notification_type IN ('result_ready', 'abnormal_result', 'critical_result', 'reminder', 'appointment')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('push', 'email', 'sms', 'in_app')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient audit logs (using different name to avoid conflict with existing audit_logs)
CREATE TABLE IF NOT EXISTS patient_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Information
    user_id UUID REFERENCES profiles(user_id),
    patient_id UUID REFERENCES profiles(user_id), -- Patient whose data was accessed
    
    -- Action Details
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Result
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp (immutable)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Cache metadata (missing)
CREATE TABLE IF NOT EXISTS cache_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE,
    cache_type TEXT NOT NULL,
    user_id UUID REFERENCES profiles(user_id),
    
    -- Cache Information
    data_size_bytes INTEGER,
    ttl_seconds INTEGER,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Cache invalidation queue (missing)
CREATE TABLE IF NOT EXISTS cache_invalidation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL,
    cache_type TEXT NOT NULL,
    user_id UUID REFERENCES profiles(user_id),
    
    -- Invalidation Details
    invalidation_reason TEXT,
    invalidated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Batch Processing
    batch_id UUID,
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- CREATE MISSING INDEXES (only if columns exist)
-- =====================================================

-- Enhanced profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Enhanced diagnostic_tests indexes  
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_swell_product_id ON diagnostic_tests(swell_product_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_category_id ON diagnostic_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_is_active ON diagnostic_tests(is_active);

-- Create featured index only if column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'diagnostic_tests' 
        AND column_name = 'featured' 
        AND table_schema = 'public'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_featured ON diagnostic_tests(featured);
    END IF;
END $$;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_swell_order_id ON orders(swell_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- New table indexes
CREATE INDEX IF NOT EXISTS idx_order_tests_order_id ON order_tests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tests_test_id ON order_tests(test_id);
CREATE INDEX IF NOT EXISTS idx_test_availability_test_id ON test_availability(test_id);
CREATE INDEX IF NOT EXISTS idx_test_availability_location_id ON test_availability(location_id);

-- Appointments indexes (using your existing column names)
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Results indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_order_id ON test_results(order_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_overall_status ON test_results(overall_status);
CREATE INDEX IF NOT EXISTS idx_test_results_result_date ON test_results(result_date);

-- New tables indexes
CREATE INDEX IF NOT EXISTS idx_health_trends_user_id ON health_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_health_trends_biomarker ON health_trends(biomarker_name);
CREATE INDEX IF NOT EXISTS idx_result_notifications_user_id ON result_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_result_notifications_status ON result_notifications(status);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_user_id ON patient_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_timestamp ON patient_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_cache_key ON cache_metadata(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_processed ON cache_invalidation_queue(processed);

-- =====================================================
-- CREATE STORED FUNCTIONS FOR PATIENT PORTAL
-- =====================================================

-- Patient access logging function
CREATE OR REPLACE FUNCTION log_patient_access(
    p_user_id UUID,
    p_patient_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO patient_audit_logs (
        user_id,
        patient_id,
        action,
        resource,
        resource_id,
        success,
        metadata,
        timestamp
    ) VALUES (
        p_user_id,
        p_patient_id,
        p_action,
        p_resource,
        p_resource_id,
        p_success,
        p_metadata,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cache invalidation queue function
CREATE OR REPLACE FUNCTION queue_cache_invalidation(
    p_cache_key TEXT,
    p_cache_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    queue_id UUID;
BEGIN
    INSERT INTO cache_invalidation_queue (
        cache_key,
        cache_type,
        user_id,
        invalidation_reason,
        invalidated_at,
        processed
    ) VALUES (
        p_cache_key,
        p_cache_type,
        p_user_id,
        p_reason,
        NOW(),
        FALSE
    ) RETURNING id INTO queue_id;
    
    RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE TRIGGERS FOR ENHANCED TABLES
-- =====================================================

-- Update trigger for profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_profiles_updated_at'
    ) THEN
        CREATE TRIGGER trigger_profiles_updated_at
            BEFORE UPDATE ON profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_profiles_updated_at();
    END IF;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Existing schema enhanced successfully!' as result,
    'Added missing columns to existing tables' as enhancement_1,
    'Created missing tables for patient portal' as enhancement_2,
    'Added proper indexes and functions' as enhancement_3,
    'Ready for patient portal APIs' as next_step;