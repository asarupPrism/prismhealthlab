-- =====================================================
-- Patient Portal Database Schema - SAFE DEPLOYMENT
-- =====================================================
-- 
-- This version uses CREATE TABLE IF NOT EXISTS to avoid
-- conflicts with existing Supabase tables
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- USER PROFILES AND AUTHENTICATION
-- =====================================================

-- Enhanced user profiles (may already exist from Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Personal Information
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Address Information
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Medical Information
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'America/New_York',
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    
    -- Metadata
    profile_completed BOOLEAN DEFAULT FALSE,
    last_profile_update TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If profiles table already exists, let's add missing columns
DO $$ 
BEGIN
    -- Add columns that might be missing from existing profiles table
    BEGIN
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, continue
            NULL;
    END;
END $$;

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    result_notifications BOOLEAN DEFAULT TRUE,
    appointment_reminders BOOLEAN DEFAULT TRUE,
    marketing_communications BOOLEAN DEFAULT FALSE,
    
    -- Display Preferences
    preferred_units TEXT DEFAULT 'imperial' CHECK (preferred_units IN ('metric', 'imperial')),
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    
    -- Privacy Settings
    data_sharing_research BOOLEAN DEFAULT FALSE,
    data_sharing_marketing BOOLEAN DEFAULT FALSE,
    profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('private', 'limited', 'public')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- TESTS AND PRODUCTS
-- =====================================================

-- Test categories
CREATE TABLE IF NOT EXISTS test_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    parent_category_id UUID REFERENCES test_categories(id),
    icon_name TEXT,
    color_code TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_meta JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnostic tests
CREATE TABLE IF NOT EXISTS diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    
    -- Swell.is Integration
    swell_product_id TEXT UNIQUE, -- Links to Swell.is product
    
    -- Categorization
    category_id UUID REFERENCES test_categories(id),
    tags TEXT[] DEFAULT '{}',
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    
    -- Clinical Information
    specimen_type TEXT NOT NULL DEFAULT 'blood',
    collection_method TEXT DEFAULT 'venipuncture',
    fasting_required BOOLEAN DEFAULT FALSE,
    fasting_hours INTEGER,
    clinical_significance TEXT,
    preparation_instructions TEXT,
    
    -- Laboratory Information
    lab_provider TEXT,
    turnaround_time_days INTEGER DEFAULT 3,
    cpt_codes TEXT[] DEFAULT '{}',
    loinc_codes TEXT[] DEFAULT '{}',
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    requires_physician_order BOOLEAN DEFAULT FALSE,
    age_restrictions JSONB DEFAULT '{}',
    
    -- SEO and Marketing
    featured BOOLEAN DEFAULT FALSE,
    popularity_score INTEGER DEFAULT 0,
    seo_meta JSONB DEFAULT '{}',
    
    -- Metadata
    version INTEGER DEFAULT 1,
    last_reviewed_date DATE,
    next_review_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If diagnostic_tests table already exists, add missing columns
DO $$ 
BEGIN
    -- Add columns that might be missing from existing diagnostic_tests table
    BEGIN
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS slug TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS short_description TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS swell_product_id TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS category_id UUID;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS discounted_price DECIMAL(10,2);
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS specimen_type TEXT DEFAULT 'blood';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS collection_method TEXT DEFAULT 'venipuncture';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS fasting_required BOOLEAN DEFAULT FALSE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS fasting_hours INTEGER;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS clinical_significance TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS preparation_instructions TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS lab_provider TEXT;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS turnaround_time_days INTEGER DEFAULT 3;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS cpt_codes TEXT[] DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS loinc_codes TEXT[] DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS requires_physician_order BOOLEAN DEFAULT FALSE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS age_restrictions JSONB DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS seo_meta JSONB DEFAULT '{}';
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS last_reviewed_date DATE;
        ALTER TABLE diagnostic_tests ADD COLUMN IF NOT EXISTS next_review_date DATE;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, continue
            NULL;
    END;
END $$;

-- Test pricing with dynamic pricing support
CREATE TABLE IF NOT EXISTS test_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
    
    -- Pricing Structure
    price_type TEXT NOT NULL CHECK (price_type IN ('base', 'volume_discount', 'membership', 'promotional', 'insurance')),
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    
    -- Conditions
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    membership_tier TEXT,
    promo_code TEXT,
    
    -- Geographic and Temporal
    geographic_restrictions TEXT[],
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test availability by location
CREATE TABLE IF NOT EXISTS test_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
    location_id UUID, -- References locations table (created below)
    
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

-- =====================================================
-- ORDERS AND PURCHASES (SWELL.IS INTEGRATION)
-- =====================================================

-- Orders from Swell.is
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Swell.is Integration
    swell_order_id TEXT UNIQUE NOT NULL,
    swell_order_data JSONB NOT NULL DEFAULT '{}',
    
    -- Order Information
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded')),
    
    -- Financial Information
    subtotal_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Billing Information
    billing_info JSONB DEFAULT '{}',
    shipping_info JSONB DEFAULT '{}',
    
    -- Order Processing
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Dates
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order line items (individual tests in an order)
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

-- =====================================================
-- APPOINTMENTS AND SCHEDULING
-- =====================================================

-- Testing locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    location_type TEXT DEFAULT 'lab' CHECK (location_type IN ('lab', 'clinic', 'hospital', 'mobile')),
    
    -- Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    
    -- Contact Information
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Operating Information
    operating_hours JSONB DEFAULT '{}',
    time_zone TEXT DEFAULT 'America/New_York',
    
    -- Capabilities
    services_offered TEXT[] DEFAULT '{}',
    equipment_available TEXT[] DEFAULT '{}',
    lab_certifications TEXT[] DEFAULT '{}',
    
    -- Geographic
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    accepts_walk_ins BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff at locations
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    
    -- Professional Information
    title TEXT,
    role TEXT NOT NULL CHECK (role IN ('phlebotomist', 'nurse', 'lab_tech', 'physician', 'admin', 'manager')),
    certifications TEXT[] DEFAULT '{}',
    license_number TEXT,
    license_expiry_date DATE,
    
    -- Scheduling
    is_active BOOLEAN DEFAULT TRUE,
    available_hours JSONB DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    
    -- Metadata
    hire_date DATE,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available appointment slots
CREATE TABLE IF NOT EXISTS appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) NOT NULL,
    staff_id UUID REFERENCES staff(id),
    
    -- Slot Information
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_appointments INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    
    -- Slot Type
    slot_type TEXT DEFAULT 'standard' CHECK (slot_type IN ('standard', 'express', 'premium', 'walk_in')),
    appointment_types TEXT[] DEFAULT '{"blood_draw"}',
    
    -- Metadata
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(location_id, staff_id, slot_date, start_time)
);

-- Patient appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_id UUID REFERENCES orders(id),
    location_id UUID REFERENCES locations(id) NOT NULL,
    staff_id UUID REFERENCES staff(id),
    slot_id UUID REFERENCES appointment_slots(id),
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    estimated_duration INTEGER DEFAULT 30,
    appointment_type TEXT DEFAULT 'blood_draw',
    
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    
    -- Patient Information
    patient_notes TEXT,
    special_requirements TEXT,
    
    -- Confirmation and Communication
    confirmation_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    confirmation_method TEXT,
    
    -- Check-in Process
    checked_in_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Rescheduling
    original_appointment_id UUID REFERENCES appointments(id),
    reschedule_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESULTS AND HEALTH DATA
-- =====================================================

-- Test results
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    order_id UUID REFERENCES orders(id) NOT NULL,
    test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    
    -- Result Information
    result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending', 'in_progress', 'completed', 'cancelled', 'error')),
    result_date TIMESTAMP WITH TIME ZONE,
    
    -- Clinical Data
    raw_result_data JSONB NOT NULL DEFAULT '{}',
    processed_result_data JSONB DEFAULT '{}',
    biomarker_data JSONB DEFAULT '{}',
    reference_ranges JSONB DEFAULT '{}',
    
    -- Interpretation
    overall_status TEXT CHECK (overall_status IN ('normal', 'abnormal', 'critical', 'inconclusive')),
    abnormal_flags TEXT[] DEFAULT '{}',
    critical_values TEXT[] DEFAULT '{}',
    
    -- Quality Control
    specimen_quality TEXT DEFAULT 'acceptable',
    lab_comments TEXT,
    technical_notes TEXT,
    
    -- Review Process
    reviewed_by UUID REFERENCES staff(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- File Attachments
    pdf_report_url TEXT,
    raw_data_files TEXT[] DEFAULT '{}',
    
    -- Patient Communication
    patient_notified BOOLEAN DEFAULT FALSE,
    patient_notified_at TIMESTAMP WITH TIME ZONE,
    notification_method TEXT,
    
    -- Metadata
    lab_provider TEXT NOT NULL,
    lab_reference_number TEXT,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(order_id, test_id)
);

-- Result files and documents
CREATE TABLE IF NOT EXISTS result_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- File Information
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    file_path TEXT NOT NULL,
    file_url TEXT,
    
    -- File Categories
    file_category TEXT DEFAULT 'report' CHECK (file_category IN ('report', 'raw_data', 'chart', 'interpretation', 'supplemental')),
    mime_type TEXT,
    
    -- Security
    encrypted BOOLEAN DEFAULT TRUE,
    access_level TEXT DEFAULT 'patient' CHECK (access_level IN ('patient', 'provider', 'lab', 'admin')),
    
    -- Metadata
    upload_source TEXT,
    checksum TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health trends and analytics
CREATE TABLE IF NOT EXISTS health_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
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

-- =====================================================
-- NOTIFICATIONS AND COMMUNICATIONS
-- =====================================================

-- Push notification tracking
CREATE TABLE IF NOT EXISTS result_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
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

-- =====================================================
-- AUDIT LOGGING AND COMPLIANCE
-- =====================================================

-- Patient audit logs (HIPAA compliance)
CREATE TABLE IF NOT EXISTS patient_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Information
    user_id UUID REFERENCES auth.users(id),
    patient_id UUID REFERENCES auth.users(id), -- Patient whose data was accessed
    
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

-- Admin audit logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Admin User
    admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
    admin_email TEXT NOT NULL,
    
    -- Action Details
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    
    -- Result
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Immutable timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Data access logs for compliance
CREATE TABLE IF NOT EXISTS data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Access Details
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    accessed_user_id UUID REFERENCES auth.users(id), -- Whose data was accessed
    data_type TEXT NOT NULL,
    access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'delete', 'export')),
    
    -- Request Information
    endpoint TEXT,
    method TEXT,
    query_parameters JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Response
    status_code INTEGER,
    records_accessed INTEGER,
    
    -- Compliance
    legal_basis TEXT,
    purpose TEXT,
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- CACHING AND PERFORMANCE
-- =====================================================

-- Redis cache metadata
CREATE TABLE IF NOT EXISTS cache_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE,
    cache_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
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

-- Cache invalidation queue
CREATE TABLE IF NOT EXISTS cache_invalidation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL,
    cache_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
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
-- SYSTEM CONFIGURATION
-- =====================================================

-- System settings and configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    
    -- Categorization
    category TEXT NOT NULL,
    subcategory TEXT,
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    requires_admin BOOLEAN DEFAULT TRUE,
    
    -- Validation
    validation_schema JSONB,
    
    -- Metadata
    description TEXT,
    last_modified_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User and profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Test and product indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_swell_product_id ON diagnostic_tests(swell_product_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_category_id ON diagnostic_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_is_active ON diagnostic_tests(is_active);
-- Create index on featured column if it exists
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
CREATE INDEX IF NOT EXISTS idx_test_categories_parent_id ON test_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_test_pricing_test_id ON test_pricing(test_id);
CREATE INDEX IF NOT EXISTS idx_test_availability_test_id ON test_availability(test_id);
CREATE INDEX IF NOT EXISTS idx_test_availability_location_id ON test_availability(location_id);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_swell_order_id ON orders(swell_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_tests_order_id ON order_tests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tests_test_id ON order_tests(test_id);

-- Location and appointment indexes
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_location_type ON locations(location_type);
CREATE INDEX IF NOT EXISTS idx_staff_location_id ON staff(location_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_location_id ON appointment_slots(location_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_date ON appointment_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_available ON appointment_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Results indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_order_id ON test_results(order_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(result_status);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(result_date);
CREATE INDEX IF NOT EXISTS idx_result_files_result_id ON result_files(result_id);
CREATE INDEX IF NOT EXISTS idx_result_files_user_id ON result_files(user_id);
CREATE INDEX IF NOT EXISTS idx_health_trends_user_id ON health_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_health_trends_biomarker ON health_trends(biomarker_name);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_result_notifications_user_id ON result_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_result_notifications_status ON result_notifications(status);
CREATE INDEX IF NOT EXISTS idx_result_notifications_created_at ON result_notifications(created_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_user_id ON patient_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_patient_id ON patient_audit_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_timestamp ON patient_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_action ON patient_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp ON admin_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_id ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_timestamp ON data_access_logs(timestamp);

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_cache_metadata_cache_key ON cache_metadata(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_user_id ON cache_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_expires_at ON cache_metadata(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_processed ON cache_invalidation_queue(processed);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_user_id ON cache_invalidation_queue(user_id);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Patient Portal Schema deployed successfully!' as result,
    'All tables created with IF NOT EXISTS to avoid conflicts' as note,
    'Check for any existing data in profiles table' as next_step;