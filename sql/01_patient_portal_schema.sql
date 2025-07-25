-- =====================================================
-- Prism Health Lab - Patient Portal Database Schema
-- =====================================================
-- 
-- Complete database schema for the Prism Health Lab patient portal
-- supporting Swell e-commerce integration, HIPAA compliance, 
-- comprehensive audit logging, and performance optimization.
--
-- Database: PostgreSQL (Supabase)
-- Version: 1.0
-- Author: Claude (Anthropic)
-- Date: July 2025
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE USER & AUTHENTICATION TABLES
-- =====================================================

-- Extended user profiles beyond Supabase auth
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    swell_customer_id TEXT, -- Link to Swell customer
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Address information
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Emergency contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    
    -- Medical information (HIPAA-protected)
    medical_history JSONB DEFAULT '{}',
    allergies TEXT[],
    current_medications TEXT[],
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    primary_physician_name TEXT,
    primary_physician_phone TEXT,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare staff with admin permissions
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    employee_id TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Role and permissions
    role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'phlebotomist', 'nurse', 'doctor', 'support')),
    permissions TEXT[] DEFAULT '{}',
    department TEXT,
    supervisor_id UUID REFERENCES staff(id),
    
    -- Location assignments
    location_ids UUID[],
    primary_location_id UUID,
    
    -- Employment details
    hire_date DATE,
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated')),
    license_number TEXT,
    license_expiry DATE,
    certifications JSONB DEFAULT '{}',
    
    -- Audit fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences for notifications and UI
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Notification preferences
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    notification_push BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'disabled')),
    
    -- UI preferences
    theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'America/New_York',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    time_format TEXT DEFAULT '12h',
    
    -- Privacy preferences
    share_data_for_research BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    third_party_integrations BOOLEAN DEFAULT FALSE,
    
    -- Accessibility
    high_contrast_mode BOOLEAN DEFAULT FALSE,
    large_fonts BOOLEAN DEFAULT FALSE,
    screen_reader_optimized BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Two-factor authentication management
CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- TOTP settings
    totp_secret TEXT,
    totp_enabled BOOLEAN DEFAULT FALSE,
    totp_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Backup codes
    backup_codes TEXT[], -- Encrypted backup codes
    backup_codes_used TEXT[] DEFAULT '{}',
    backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Recovery options
    recovery_email TEXT,
    recovery_phone TEXT,
    
    -- Security settings
    require_2fa_for_sensitive_actions BOOLEAN DEFAULT TRUE,
    max_sessions INTEGER DEFAULT 3,
    session_timeout_minutes INTEGER DEFAULT 60,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track 2FA attempts for security monitoring
CREATE TABLE two_factor_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Attempt details
    attempt_type TEXT NOT NULL CHECK (attempt_type IN ('totp', 'backup_code', 'recovery')),
    success BOOLEAN NOT NULL,
    code_used TEXT, -- For audit purposes (hashed)
    failure_reason TEXT,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCT & TEST MANAGEMENT TABLES
-- =====================================================

-- Diagnostic test categories
CREATE TABLE test_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    
    -- Hierarchy support
    parent_category_id UUID REFERENCES test_categories(id),
    sort_order INTEGER DEFAULT 0,
    
    -- Display settings
    featured BOOLEAN DEFAULT FALSE,
    color_scheme TEXT, -- For UI theming
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual diagnostic tests
CREATE TABLE diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swell_product_id TEXT UNIQUE, -- Link to Swell product
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES test_categories(id) NOT NULL,
    
    -- Test specifications
    key_tests TEXT[] DEFAULT '{}', -- List of specific tests included
    biomarkers TEXT[] DEFAULT '{}', -- Biomarkers measured
    sample_type TEXT NOT NULL CHECK (sample_type IN ('blood', 'urine', 'saliva', 'stool', 'other')),
    sample_volume_ml DECIMAL(5,2),
    fasting_required BOOLEAN DEFAULT FALSE,
    fasting_hours INTEGER,
    
    -- Timing and logistics
    turnaround_time TEXT NOT NULL, -- e.g., "1-2 business days"
    turnaround_hours INTEGER, -- For automated scheduling
    collection_method TEXT CHECK (collection_method IN ('venipuncture', 'fingerstick', 'at_home_kit')),
    
    -- Clinical information
    normal_ranges JSONB DEFAULT '{}', -- Reference ranges by demographic
    reference_info JSONB DEFAULT '{}', -- Clinical interpretation guides
    clinical_significance TEXT,
    preparation_instructions TEXT,
    
    -- Pricing and availability
    base_price DECIMAL(10,2),
    insurance_covered BOOLEAN DEFAULT FALSE,
    age_restrictions TEXT, -- e.g., "18+" or "21-65"
    gender_restrictions TEXT[],
    
    -- Lab information
    lab_provider TEXT,
    lab_code TEXT,
    cpt_codes TEXT[],
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    requires_doctor_review BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic pricing rules for tests
CREATE TABLE test_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
    
    -- Pricing tier
    tier_name TEXT NOT NULL, -- e.g., 'standard', 'premium', 'bulk'
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    
    -- Conditions for pricing
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    valid_from DATE,
    valid_until DATE,
    
    -- Geographic and demographic targeting
    applicable_states TEXT[],
    applicable_age_range TEXT, -- e.g., "18-65"
    insurance_tiers TEXT[],
    
    -- Bundle pricing
    bundle_id UUID, -- Reference to a test bundle
    bundle_discount_percent DECIMAL(5,2),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testing locations and facilities
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_type TEXT CHECK (location_type IN ('lab', 'collection_site', 'mobile_unit', 'partner_clinic')),
    
    -- Address
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    
    -- Contact information
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Geographic data
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Operating details
    operating_hours JSONB DEFAULT '{}', -- Hours by day of week
    services TEXT[] DEFAULT '{}', -- Services offered
    capacity_per_hour INTEGER DEFAULT 4,
    
    -- Equipment and capabilities
    equipment_list TEXT[],
    test_types_supported TEXT[],
    special_requirements TEXT[],
    
    -- Accessibility
    wheelchair_accessible BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT TRUE,
    public_transit_accessible BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    temporarily_closed BOOLEAN DEFAULT FALSE,
    closure_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER & COMMERCE TABLES
-- =====================================================

-- Main orders table with Swell integration
CREATE TABLE orders (
    id TEXT PRIMARY KEY, -- Use Swell order ID as primary key
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    swell_order_id TEXT UNIQUE NOT NULL, -- Explicit Swell reference
    
    -- Customer information
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    
    -- Financial details
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Order status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'confirmed', 'collecting', 'collected', 
        'testing', 'completed', 'cancelled', 'refunded'
    )),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
    )),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN (
        'unfulfilled', 'partial', 'fulfilled', 'cancelled'
    )),
    
    -- Addresses
    billing_info JSONB,
    shipping_info JSONB,
    
    -- Swell integration
    swell_order_data JSONB, -- Complete Swell order object
    swell_customer_id TEXT,
    
    -- Order metadata
    metadata JSONB DEFAULT '{}',
    internal_notes TEXT,
    
    -- Important dates
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_date TIMESTAMP WITH TIME ZONE,
    collection_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual test items within orders
CREATE TABLE order_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
    
    -- Product details
    test_name TEXT NOT NULL,
    test_description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Swell product information
    swell_product_id TEXT,
    swell_variant_id TEXT,
    swell_line_item_data JSONB,
    
    -- Test-specific metadata
    metadata JSONB DEFAULT '{}',
    special_instructions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment scheduling system
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Appointment details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT DEFAULT 'blood_draw' CHECK (appointment_type IN (
        'blood_draw', 'consultation', 'result_review', 'follow_up'
    )),
    
    -- Status tracking
    status TEXT DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'checked_in', 'in_progress', 
        'completed', 'no_show', 'cancelled', 'rescheduled'
    )),
    
    -- Staff assignment
    assigned_staff_id UUID REFERENCES staff(id),
    backup_staff_id UUID REFERENCES staff(id),
    
    -- Communications
    confirmation_sent BOOLEAN DEFAULT FALSE,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Clinical notes
    pre_appointment_notes TEXT,
    post_appointment_notes TEXT,
    collection_notes TEXT,
    
    -- Special requirements
    special_instructions TEXT,
    accessibility_needs TEXT,
    language_preference TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Rescheduling history
    original_appointment_id UUID REFERENCES appointments(id),
    reschedule_reason TEXT,
    cancelled_by TEXT, -- 'patient' or 'staff'
    cancellation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available appointment time slots
CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) NOT NULL,
    staff_id UUID REFERENCES staff(id),
    
    -- Time slot details
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Capacity
    max_appointments INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    
    -- Slot type and restrictions
    slot_type TEXT DEFAULT 'standard' CHECK (slot_type IN ('standard', 'priority', 'emergency', 'blocked')),
    appointment_types_allowed TEXT[] DEFAULT '{"blood_draw"}',
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    unavailable_reason TEXT,
    
    -- Recurring slot configuration
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
    recurrence_end_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESULTS & HEALTH DATA TABLES
-- =====================================================

-- Test results storage
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id TEXT REFERENCES orders(id) NOT NULL,
    test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    
    -- Lab identification
    lab_report_number TEXT UNIQUE,
    lab_batch_id TEXT,
    lab_technician TEXT,
    
    -- Sample information
    collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
    received_date TIMESTAMP WITH TIME ZONE,
    processing_start_date TIMESTAMP WITH TIME ZONE,
    
    -- Results
    result_date TIMESTAMP WITH TIME ZONE,
    results_data JSONB NOT NULL, -- Structured test results
    raw_lab_data JSONB, -- Original lab system output
    
    -- Interpretation
    interpretation TEXT,
    clinical_significance TEXT,
    abnormal_flags TEXT[],
    critical_values TEXT[],
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'reviewed', 'cancelled', 'failed'
    )),
    quality_control_status TEXT DEFAULT 'passed' CHECK (quality_control_status IN (
        'passed', 'failed', 'pending_review', 'retest_required'
    )),
    
    -- Clinical review
    is_abnormal BOOLEAN DEFAULT FALSE,
    requires_followup BOOLEAN DEFAULT FALSE,
    provider_notes TEXT,
    reviewed_by_provider BOOLEAN DEFAULT FALSE,
    reviewed_by_staff_id UUID REFERENCES staff(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Patient notification
    patient_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    notification_method TEXT,
    patient_viewed BOOLEAN DEFAULT FALSE,
    patient_viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Data integrity
    checksum TEXT, -- For data integrity verification
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Associated files for test results
CREATE TABLE result_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
    
    -- File information
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT,
    
    -- File classification
    file_category TEXT CHECK (file_category IN (
        'lab_report', 'chart', 'image', 'supplementary', 'raw_data'
    )),
    is_primary BOOLEAN DEFAULT FALSE,
    is_patient_viewable BOOLEAN DEFAULT TRUE,
    
    -- Security
    access_level TEXT DEFAULT 'patient' CHECK (access_level IN ('patient', 'provider', 'admin')),
    encryption_key_id TEXT,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    replaced_by_file_id UUID REFERENCES result_files(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Structured biomarker data for trend analysis
CREATE TABLE biomarker_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
    
    -- Biomarker identification
    biomarker_name TEXT NOT NULL,
    biomarker_code TEXT, -- Standard codes like LOINC
    biomarker_category TEXT,
    
    -- Measurement
    value DECIMAL(15,6),
    unit TEXT NOT NULL,
    reference_range_min DECIMAL(15,6),
    reference_range_max DECIMAL(15,6),
    
    -- Status indicators
    is_abnormal BOOLEAN DEFAULT FALSE,
    abnormal_flag TEXT, -- 'HIGH', 'LOW', 'CRITICAL'
    percentile DECIMAL(5,2), -- Patient's percentile for age/gender
    
    -- Trend data
    previous_value DECIMAL(15,6),
    trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable', 'first_measurement')),
    percent_change DECIMAL(10,4),
    
    -- Metadata
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    measurement_method TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health trends and analytics
CREATE TABLE health_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Trend identification
    biomarker_name TEXT NOT NULL,
    trend_type TEXT CHECK (trend_type IN ('improvement', 'deterioration', 'stable', 'fluctuating')),
    trend_period TEXT, -- e.g., '3_months', '1_year'
    
    -- Statistical data
    data_points INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_value DECIMAL(15,6),
    end_value DECIMAL(15,6),
    
    -- Trend analysis
    slope DECIMAL(15,6), -- Rate of change
    r_squared DECIMAL(5,4), -- Correlation coefficient
    statistical_significance BOOLEAN DEFAULT FALSE,
    
    -- Clinical interpretation
    clinical_significance TEXT,
    recommendation TEXT,
    
    -- Metadata
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    algorithm_version TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION & NOTIFICATIONS TABLES
-- =====================================================

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Subscription details
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    
    -- Device information
    user_agent TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    os TEXT,
    
    -- Subscription metadata
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failure_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notification delivery log
CREATE TABLE push_notifications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
    
    -- Message details
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT,
    badge TEXT,
    tag TEXT,
    
    -- Delivery information
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN (
        'sent', 'delivered', 'failed', 'expired', 'clicked'
    )),
    failure_reason TEXT,
    
    -- Click tracking
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Message metadata
    message_type TEXT CHECK (message_type IN (
        'result_available', 'appointment_reminder', 'appointment_confirmation',
        'system_update', 'promotional', 'emergency'
    )),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates for automated communications
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT UNIQUE NOT NULL,
    template_type TEXT CHECK (template_type IN (
        'appointment_confirmation', 'appointment_reminder', 'result_notification',
        'welcome', 'password_reset', 'account_verification', 'lab_report'
    )),
    
    -- Template content
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    
    -- Template variables
    variables JSONB DEFAULT '{}', -- Available template variables
    
    -- Styling
    template_styles JSONB DEFAULT '{}',
    brand_colors JSONB DEFAULT '{}',
    
    -- Version control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_by UUID REFERENCES staff(id),
    last_modified_by UUID REFERENCES staff(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email delivery tracking
CREATE TABLE email_delivery_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id),
    
    -- Email details
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Delivery status
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN (
        'sent', 'delivered', 'bounced', 'complaint', 'opened', 'clicked'
    )),
    
    -- Provider information (Resend, etc.)
    provider_message_id TEXT,
    provider_response JSONB,
    
    -- Engagement tracking
    opened BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MONITORING & PERFORMANCE TABLES
-- =====================================================

-- System performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    
    -- Metric identification
    metric_name TEXT NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'timing')),
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit TEXT NOT NULL,
    
    -- Context
    page_url TEXT,
    user_agent TEXT,
    device_type TEXT,
    
    -- Timing data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,
    
    -- Metadata
    tags JSONB DEFAULT '{}',
    additional_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance alerts and thresholds
CREATE TABLE performance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Alert configuration
    alert_name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    threshold_value DECIMAL(15,6) NOT NULL,
    comparison_operator TEXT CHECK (comparison_operator IN ('>', '<', '>=', '<=', '=')),
    
    -- Alert details
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    resolution_steps TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    current_value DECIMAL(15,6),
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    
    -- Notification settings
    notify_admin BOOLEAN DEFAULT TRUE,
    notify_email TEXT[],
    cooldown_minutes INTEGER DEFAULT 15,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redis cache operation logging
CREATE TABLE cache_operation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Operation details
    operation_type TEXT CHECK (operation_type IN ('get', 'set', 'delete', 'invalidate', 'expire')),
    cache_key TEXT NOT NULL,
    cache_type TEXT NOT NULL, -- e.g., 'purchase_history', 'analytics'
    
    -- Performance
    execution_time_ms INTEGER,
    cache_hit BOOLEAN,
    data_size_bytes INTEGER,
    
    -- Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    triggered_by TEXT, -- 'api_request', 'webhook', 'scheduled_job'
    request_id TEXT,
    
    -- Results
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache error tracking
CREATE TABLE cache_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Error details
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    
    -- Context
    cache_key TEXT,
    operation_type TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Environment
    redis_host TEXT,
    redis_port INTEGER,
    connection_status TEXT,
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES staff(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache invalidation queue for real-time updates
CREATE TABLE cache_invalidation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Invalidation details
    cache_type TEXT NOT NULL,
    cache_key_pattern TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Processing status
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_attempts INTEGER DEFAULT 0,
    
    -- Trigger information
    triggered_by TEXT NOT NULL, -- 'webhook', 'api_call', 'admin_action'
    trigger_source TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Priority and scheduling
    priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT & COMPLIANCE TABLES (HIPAA)
-- =====================================================

-- Patient data access audit logging
CREATE TABLE patient_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- WHO: User identification
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- WHAT: Action performed
    action TEXT NOT NULL,
    resource TEXT NOT NULL, -- table or resource type accessed
    resource_id TEXT, -- specific record ID
    
    -- HOW: Access details
    access_method TEXT CHECK (access_method IN ('web_portal', 'api', 'admin_panel', 'mobile_app')),
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- WHEN: Timing
    access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER,
    
    -- RESULT: Outcome
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    
    -- DATA: What was accessed
    data_accessed JSONB, -- Sanitized summary of data accessed
    query_parameters JSONB,
    response_code INTEGER,
    
    -- CONTEXT: Additional details
    business_justification TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- INTEGRITY: Tamper detection
    log_hash TEXT NOT NULL, -- Hash of log entry for integrity
    previous_log_hash TEXT, -- Chain of custody
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Administrative action audit logging
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Administrator identification
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL NOT NULL,
    
    -- Action details
    action_type TEXT NOT NULL,
    action_description TEXT NOT NULL,
    affected_resource TEXT NOT NULL,
    affected_resource_id TEXT,
    affected_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    admin_panel_section TEXT,
    
    -- Authorization
    permission_used TEXT,
    authorization_level TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES staff(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    hipaa_relevant BOOLEAN DEFAULT FALSE,
    sox_relevant BOOLEAN DEFAULT FALSE,
    gdpr_relevant BOOLEAN DEFAULT FALSE,
    
    -- Integrity
    log_hash TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events and incidents
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event classification
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_failure', 'suspicious_activity', 'data_breach', 'unauthorized_access',
        'system_intrusion', 'malware_detection', 'policy_violation', 'account_compromise'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Affected entities
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    affected_resources TEXT[],
    
    -- Event details
    event_description TEXT NOT NULL,
    detection_method TEXT,
    source_ip INET,
    user_agent TEXT,
    
    -- Investigation
    investigated BOOLEAN DEFAULT FALSE,
    investigated_by UUID REFERENCES staff(id),
    investigation_notes TEXT,
    investigation_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolution_action TEXT,
    resolved_by UUID REFERENCES staff(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Notification
    authorities_notified BOOLEAN DEFAULT FALSE,
    customers_notified BOOLEAN DEFAULT FALSE,
    notification_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INTEGRATION & EXTERNAL DATA TABLES
-- =====================================================

-- Swell synchronization tracking
CREATE TABLE swell_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Sync details
    sync_type TEXT CHECK (sync_type IN ('orders', 'products', 'customers', 'inventory')),
    sync_direction TEXT CHECK (sync_direction IN ('swell_to_local', 'local_to_swell', 'bidirectional')),
    
    -- Batch information
    batch_id TEXT,
    total_records INTEGER,
    successful_syncs INTEGER,
    failed_syncs INTEGER,
    
    -- Timing
    sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Results
    success BOOLEAN NOT NULL,
    error_summary TEXT,
    error_details JSONB,
    
    -- Metadata
    triggered_by TEXT, -- 'scheduled', 'webhook', 'manual'
    swell_api_version TEXT,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External webhook events processing
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source identification
    webhook_source TEXT NOT NULL, -- 'swell', 'stripe', 'twilio', etc.
    event_type TEXT NOT NULL,
    event_id TEXT, -- External event ID
    
    -- Payload
    raw_payload JSONB NOT NULL,
    processed_payload JSONB,
    
    -- Processing status
    processed BOOLEAN DEFAULT FALSE,
    processing_attempts INTEGER DEFAULT 0,
    max_retry_attempts INTEGER DEFAULT 3,
    
    -- Results
    processing_success BOOLEAN,
    processing_error TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification
    signature_verified BOOLEAN DEFAULT FALSE,
    signature_header TEXT,
    
    -- Metadata
    user_agent TEXT,
    source_ip INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Core user indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_swell_customer_id ON profiles(swell_customer_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Order and commerce indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_swell_order_id ON orders(swell_order_id);
CREATE INDEX idx_order_tests_order_id ON order_tests(order_id);
CREATE INDEX idx_order_tests_test_id ON order_tests(test_id);

-- Appointment indexes
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_location_id ON appointments(location_id);

-- Test results indexes
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_order_id ON test_results(order_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_result_date ON test_results(result_date);
CREATE INDEX idx_biomarker_data_user_id ON biomarker_data(user_id);
CREATE INDEX idx_biomarker_data_biomarker_name ON biomarker_data(biomarker_name);
CREATE INDEX idx_biomarker_data_measurement_date ON biomarker_data(measurement_date);

-- Performance monitoring indexes
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_metric_name ON performance_metrics(metric_name);

-- Cache operation indexes
CREATE INDEX idx_cache_operation_logs_cache_key ON cache_operation_logs(cache_key);
CREATE INDEX idx_cache_operation_logs_created_at ON cache_operation_logs(created_at);
CREATE INDEX idx_cache_invalidation_queue_processed ON cache_invalidation_queue(processed);
CREATE INDEX idx_cache_invalidation_queue_scheduled_for ON cache_invalidation_queue(scheduled_for);

-- Audit logging indexes (for compliance reporting)
CREATE INDEX idx_patient_audit_logs_patient_id ON patient_audit_logs(patient_id);
CREATE INDEX idx_patient_audit_logs_access_timestamp ON patient_audit_logs(access_timestamp);
CREATE INDEX idx_patient_audit_logs_action ON patient_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);

-- =====================================================
-- CREATE STORED PROCEDURES FOR AUDIT LOGGING
-- =====================================================

-- Function to generate tamper-evident log hash
CREATE OR REPLACE FUNCTION generate_log_hash(
    log_data JSONB,
    previous_hash TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        digest(
            CONCAT(
                COALESCE(previous_hash, ''),
                log_data::TEXT,
                EXTRACT(EPOCH FROM NOW())::TEXT
            ), 
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to log patient data access with integrity checking
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
    previous_hash TEXT;
    log_data JSONB;
    calculated_hash TEXT;
BEGIN
    -- Generate new log ID
    log_id := uuid_generate_v4();
    
    -- Get the most recent log hash for chain of custody
    SELECT log_hash INTO previous_hash
    FROM patient_audit_logs
    WHERE patient_id = p_patient_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Prepare log data for hashing
    log_data := jsonb_build_object(
        'user_id', p_user_id,
        'patient_id', p_patient_id,
        'action', p_action,
        'resource', p_resource,
        'resource_id', p_resource_id,
        'success', p_success,
        'timestamp', NOW()
    );
    
    -- Generate tamper-evident hash
    calculated_hash := generate_log_hash(log_data, previous_hash);
    
    -- Insert audit log
    INSERT INTO patient_audit_logs (
        id,
        user_id,
        patient_id,
        action,
        resource,
        resource_id,
        success,
        metadata,
        log_hash,
        previous_log_hash,
        access_timestamp
    ) VALUES (
        log_id,
        p_user_id,
        p_patient_id,
        p_action,
        p_resource,
        p_resource_id,
        p_success,
        p_metadata,
        calculated_hash,
        previous_hash,
        NOW()
    );
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate user cache patterns
CREATE OR REPLACE FUNCTION queue_cache_invalidation(
    p_cache_type TEXT,
    p_user_id UUID,
    p_triggered_by TEXT DEFAULT 'system'
) RETURNS UUID AS $$
DECLARE
    queue_id UUID;
BEGIN
    queue_id := uuid_generate_v4();
    
    INSERT INTO cache_invalidation_queue (
        id,
        cache_type,
        cache_key_pattern,
        user_id,
        triggered_by,
        priority,
        scheduled_for
    ) VALUES (
        queue_id,
        p_cache_type,
        CONCAT(p_cache_type, ':', p_user_id::TEXT, ':*'),
        p_user_id,
        p_triggered_by,
        CASE 
            WHEN p_cache_type IN ('purchase_history', 'test_results') THEN 1
            WHEN p_cache_type = 'analytics' THEN 2
            ELSE 5
        END,
        NOW()
    );
    
    RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on patient-facing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (detailed policies will be in next file)
-- Note: Specific RLS policies will be created in a separate file due to complexity

-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- =====================================================

-- Trigger function for automatic cache invalidation on data changes
CREATE OR REPLACE FUNCTION trigger_cache_invalidation() RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate purchase history cache when orders change
    IF TG_TABLE_NAME = 'orders' THEN
        PERFORM queue_cache_invalidation('purchase_history', NEW.user_id, 'data_change');
        PERFORM queue_cache_invalidation('analytics', NEW.user_id, 'data_change');
    END IF;
    
    -- Invalidate test results cache when results change
    IF TG_TABLE_NAME = 'test_results' THEN
        PERFORM queue_cache_invalidation('test_results', NEW.user_id, 'data_change');
        PERFORM queue_cache_invalidation('analytics', NEW.user_id, 'data_change');
    END IF;
    
    -- Invalidate appointment cache when appointments change
    IF TG_TABLE_NAME = 'appointments' THEN
        PERFORM queue_cache_invalidation('appointments', NEW.user_id, 'data_change');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for cache invalidation
CREATE TRIGGER orders_cache_invalidation
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_cache_invalidation();

CREATE TRIGGER results_cache_invalidation  
    AFTER INSERT OR UPDATE ON test_results
    FOR EACH ROW EXECUTE FUNCTION trigger_cache_invalidation();

CREATE TRIGGER appointments_cache_invalidation
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION trigger_cache_invalidation();

-- =====================================================
-- END OF SCHEMA CREATION
-- =====================================================

-- Grant appropriate permissions (will be detailed in RLS policies file)
-- INSERT INTO public.profiles (user_id, email) VALUES (auth.uid(), auth.email());

-- Schema creation completed successfully
SELECT 'Prism Health Lab patient portal schema created successfully!' as result;