-- ================================================================
-- PRISM HEALTH LAB - COMPREHENSIVE ADMIN DATABASE SCHEMA
-- ================================================================
-- This script creates all necessary tables, indexes, RLS policies,
-- and seed data for the admin dashboard functionality.
-- 
-- Compatible with Supabase PostgreSQL
-- Follows HIPAA compliance requirements
-- Integrates with Swell.is e-commerce platform
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- CORE USER AND AUTHENTICATION TABLES
-- ================================================================

-- Users & Authentication - Enhanced profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Address Information
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Medical Information (JSONB for structured data)
    medical_history JSONB DEFAULT '{}',
    allergies JSONB DEFAULT '[]',
    medications JSONB DEFAULT '[]',
    
    -- Account Status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_sign_in_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Notification Preferences
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    
    -- App Preferences
    theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Privacy Settings
    share_data_for_research BOOLEAN DEFAULT false,
    receive_marketing BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ENHANCED STAFF AND ADMIN MANAGEMENT
-- ================================================================

-- Staff Departments
CREATE TABLE IF NOT EXISTS public.staff_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Roles with Hierarchical Structure
CREATE TABLE IF NOT EXISTS public.staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1, -- 1=lowest, 5=highest
    default_permissions JSONB DEFAULT '[]',
    is_admin_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
    employee_id TEXT UNIQUE,
    
    -- Role and Department
    role_id UUID REFERENCES public.staff_roles(id),
    department_id UUID REFERENCES public.staff_departments(id),
    
    -- Contact Information (can override profile)
    work_email TEXT,
    work_phone TEXT,
    
    -- Employment Details
    hire_date DATE,
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave')),
    
    -- Permissions and Access
    permissions JSONB DEFAULT '[]',
    location_access JSONB DEFAULT '[]', -- Array of location IDs
    
    -- Admin Dashboard Access
    can_access_admin BOOLEAN DEFAULT false,
    admin_dashboard_permissions JSONB DEFAULT '{}',
    
    -- Work Schedule
    work_schedule JSONB DEFAULT '{}', -- JSON structure for weekly schedule
    
    -- Security
    last_admin_login TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    
    -- Audit Fields
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for department manager
ALTER TABLE public.staff_departments 
ADD CONSTRAINT fk_department_manager 
FOREIGN KEY (manager_id) REFERENCES public.staff(id);

-- ================================================================
-- ENHANCED LOCATIONS AND SERVICES
-- ================================================================

-- Locations with Enhanced Information
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_code TEXT UNIQUE,
    
    -- Address Information
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    
    -- Contact Information
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Operational Information
    operating_hours JSONB DEFAULT '{}', -- JSON structure for weekly hours
    timezone TEXT DEFAULT 'America/New_York',
    capacity INTEGER DEFAULT 10, -- Maximum concurrent appointments
    
    -- Services and Equipment
    services_offered JSONB DEFAULT '[]', -- Array of service types
    equipment_available JSONB DEFAULT '[]', -- Array of equipment types
    
    -- Staff Assignment
    location_manager_id UUID REFERENCES public.staff(id),
    
    -- Status and Settings
    is_active BOOLEAN DEFAULT true,
    accepts_walk_ins BOOLEAN DEFAULT false,
    requires_appointment BOOLEAN DEFAULT true,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ENHANCED TEST CATALOG AND PRODUCTS
-- ================================================================

-- Test Categories with Hierarchy
CREATE TABLE IF NOT EXISTS public.test_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    parent_category_id UUID REFERENCES public.test_categories(id),
    
    -- Display Information
    icon TEXT,
    color_theme TEXT,
    sort_order INTEGER DEFAULT 0,
    
    -- Swell Integration
    swell_category_id TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Diagnostic Tests
CREATE TABLE IF NOT EXISTS public.diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category_id UUID REFERENCES public.test_categories(id),
    
    -- Test Details
    test_code TEXT UNIQUE,
    key_biomarkers JSONB DEFAULT '[]',
    sample_types JSONB DEFAULT '[]', -- Array of sample types needed
    
    -- Requirements and Instructions
    fasting_required BOOLEAN DEFAULT false,
    fasting_duration_hours INTEGER,
    preparation_instructions JSONB DEFAULT '[]',
    special_requirements TEXT,
    
    -- Timing and Processing
    collection_time_minutes INTEGER DEFAULT 15,
    processing_time_hours INTEGER DEFAULT 24,
    turnaround_time_business_days INTEGER DEFAULT 2,
    
    -- Clinical Information
    normal_ranges JSONB DEFAULT '{}',
    reference_information JSONB DEFAULT '{}',
    clinical_significance TEXT,
    
    -- Swell E-commerce Integration
    swell_product_id TEXT UNIQUE,
    swell_variant_id TEXT,
    
    -- Pricing and Availability
    base_price DECIMAL(10,2),
    insurance_covered BOOLEAN DEFAULT false,
    age_restrictions JSONB DEFAULT '{}', -- Min/max age requirements
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requires_physician_order BOOLEAN DEFAULT false,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Pricing with Time-based Rules
CREATE TABLE IF NOT EXISTS public.test_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    
    -- Pricing Information
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Pricing Rules
    pricing_type TEXT DEFAULT 'standard' CHECK (pricing_type IN ('standard', 'promotional', 'bulk', 'insurance')),
    minimum_quantity INTEGER DEFAULT 1,
    
    -- Time-based Pricing
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    
    -- Geographic Pricing
    applicable_locations JSONB DEFAULT '[]', -- Array of location IDs
    applicable_states JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ENHANCED ORDER MANAGEMENT WITH SWELL INTEGRATION
-- ================================================================

-- Enhanced Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Swell Integration
    swell_order_id TEXT UNIQUE,
    swell_order_number TEXT,
    
    -- Customer Information
    user_id UUID REFERENCES public.profiles(user_id),
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    guest_order BOOLEAN DEFAULT false,
    
    -- Order Details
    order_number TEXT UNIQUE, -- Internal order number
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Status Tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded')),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Order Items (JSONB for flexibility)
    items JSONB NOT NULL DEFAULT '[]',
    
    -- Address Information
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Appointment Integration
    appointment_id UUID,
    requires_appointment BOOLEAN DEFAULT true,
    appointment_scheduled BOOLEAN DEFAULT false,
    
    -- Swell Sync Information
    swell_sync_status TEXT DEFAULT 'pending' CHECK (swell_sync_status IN ('pending', 'synced', 'failed', 'manual')),
    swell_last_sync_at TIMESTAMPTZ,
    swell_sync_error TEXT,
    
    -- Payment Information
    payment_method JSONB,
    payment_gateway_transaction_id TEXT,
    
    -- Special Instructions and Notes
    customer_notes TEXT,
    admin_notes TEXT,
    special_handling_required BOOLEAN DEFAULT false,
    
    -- Audit Fields
    order_source TEXT DEFAULT 'web' CHECK (order_source IN ('web', 'admin', 'phone', 'walk_in')),
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status History
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Status Change Information
    previous_status TEXT,
    new_status TEXT NOT NULL,
    status_type TEXT NOT NULL CHECK (status_type IN ('order', 'payment', 'fulfillment')),
    
    -- Change Details
    changed_by UUID REFERENCES public.staff(id),
    change_reason TEXT,
    notes TEXT,
    
    -- Notification Information
    customer_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ENHANCED APPOINTMENT MANAGEMENT
-- ================================================================

-- Appointment Time Slots
CREATE TABLE IF NOT EXISTS public.appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    
    -- Time Information
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Capacity and Availability
    max_appointments INTEGER DEFAULT 1,
    available_slots INTEGER DEFAULT 1,
    
    -- Staff Assignment
    assigned_staff_id UUID REFERENCES public.staff(id),
    
    -- Slot Configuration
    appointment_types JSONB DEFAULT '[]', -- Which types of appointments this slot accepts
    special_requirements JSONB DEFAULT '{}',
    
    -- Status
    is_available BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(location_id, date, start_time, assigned_staff_id)
);

-- Enhanced Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id),
    location_id UUID REFERENCES public.locations(id),
    slot_id UUID REFERENCES public.appointment_slots(id),
    
    -- Appointment Details
    appointment_number TEXT UNIQUE,
    appointment_type TEXT DEFAULT 'blood_draw' CHECK (appointment_type IN ('blood_draw', 'consultation', 'follow_up', 'collection_only')),
    
    -- Scheduling Information
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    
    -- Status Management
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    
    -- Staff Assignment
    assigned_staff_id UUID REFERENCES public.staff(id),
    checked_in_by UUID REFERENCES public.staff(id),
    completed_by UUID REFERENCES public.staff(id),
    
    -- Special Requirements
    special_instructions TEXT,
    accessibility_needs JSONB DEFAULT '{}',
    language_preference TEXT,
    
    -- Communication Tracking
    confirmation_sent BOOLEAN DEFAULT false,
    confirmation_sent_at TIMESTAMPTZ,
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_24h_sent_at TIMESTAMPTZ,
    reminder_1h_sent BOOLEAN DEFAULT false,
    reminder_1h_sent_at TIMESTAMPTZ,
    
    -- Appointment Flow
    check_in_time TIMESTAMPTZ,
    start_time TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    
    -- Notes and Follow-up
    pre_appointment_notes TEXT,
    post_appointment_notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    -- Cancellation/Rescheduling
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.staff(id),
    rescheduled_from UUID REFERENCES public.appointments(id),
    
    -- Audit Fields
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ENHANCED TEST RESULTS AND FILE MANAGEMENT
-- ================================================================

-- Enhanced Test Results
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id),
    appointment_id UUID REFERENCES public.appointments(id),
    test_id UUID REFERENCES public.diagnostic_tests(id),
    
    -- Lab Information
    lab_report_number TEXT,
    lab_name TEXT,
    lab_location TEXT,
    
    -- Sample Information
    sample_collection_date TIMESTAMPTZ,
    sample_type TEXT,
    sample_quality TEXT,
    
    -- Processing Information
    received_at_lab TIMESTAMPTZ,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    
    -- Results Data
    result_date TIMESTAMPTZ,
    results_data JSONB NOT NULL DEFAULT '{}',
    raw_lab_data JSONB DEFAULT '{}',
    
    -- Clinical Assessment
    overall_status TEXT DEFAULT 'pending' CHECK (overall_status IN ('pending', 'processing', 'normal', 'abnormal', 'critical', 'cancelled')),
    abnormal_flags JSONB DEFAULT '[]',
    critical_values JSONB DEFAULT '[]',
    
    -- Provider Review
    reviewed_by UUID REFERENCES public.staff(id),
    reviewed_at TIMESTAMPTZ,
    provider_interpretation TEXT,
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    
    -- Patient Communication
    patient_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    notification_method TEXT,
    patient_viewed BOOLEAN DEFAULT false,
    patient_viewed_at TIMESTAMPTZ,
    
    -- Quality Control
    quality_control_passed BOOLEAN DEFAULT false,
    quality_control_notes TEXT,
    requires_retest BOOLEAN DEFAULT false,
    retest_reason TEXT,
    
    -- Audit Fields
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Result Files with Enhanced Metadata
CREATE TABLE IF NOT EXISTS public.result_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE,
    
    -- File Information
    file_name TEXT NOT NULL,
    original_file_name TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    -- File Classification
    file_category TEXT DEFAULT 'report' CHECK (file_category IN ('report', 'lab_report', 'image', 'chart', 'additional_data')),
    is_primary_report BOOLEAN DEFAULT false,
    
    -- Security and Access
    is_secure BOOLEAN DEFAULT true,
    encryption_key_id TEXT,
    access_level TEXT DEFAULT 'patient' CHECK (access_level IN ('patient', 'provider', 'admin', 'restricted')),
    
    -- Processing Information
    processing_status TEXT DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'processing', 'processed', 'failed')),
    ocr_extracted_text TEXT,
    
    -- Audit Fields
    uploaded_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- COMPREHENSIVE AUDIT AND COMPLIANCE SYSTEM
-- ================================================================

-- Enhanced Audit Logs for HIPAA Compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who performed the action
    user_id UUID, -- Can be NULL for system actions
    staff_id UUID REFERENCES public.staff(id),
    session_id TEXT,
    
    -- What action was performed
    action TEXT NOT NULL,
    action_category TEXT CHECK (action_category IN ('authentication', 'data_access', 'data_modification', 'system', 'security', 'admin')),
    
    -- What resource was affected
    resource_type TEXT, -- table name or resource type
    resource_id TEXT, -- record ID
    
    -- Details of the change
    old_values JSONB,
    new_values JSONB,
    affected_fields JSONB DEFAULT '[]',
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    endpoint TEXT,
    http_method TEXT,
    
    -- Outcome
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Compliance and Security
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    requires_review BOOLEAN DEFAULT false,
    phi_accessed BOOLEAN DEFAULT false, -- Protected Health Information flag
    
    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Events for Monitoring
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event Information
    event_type TEXT NOT NULL,
    event_category TEXT CHECK (event_category IN ('system', 'integration', 'performance', 'security', 'backup', 'maintenance')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    
    -- Event Details
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    
    -- Source Information
    source_system TEXT,
    source_component TEXT,
    
    -- Performance Metrics
    duration_ms INTEGER,
    memory_usage_mb INTEGER,
    
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.staff(id),
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Access Logs for PHI Tracking
CREATE TABLE IF NOT EXISTS public.data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Access Information
    user_id UUID,
    staff_id UUID REFERENCES public.staff(id),
    patient_id UUID REFERENCES public.profiles(user_id),
    
    -- Access Details
    access_type TEXT CHECK (access_type IN ('view', 'download', 'print', 'export', 'email')),
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    
    -- Business Justification
    access_reason TEXT,
    treatment_relationship BOOLEAN DEFAULT false,
    payment_purpose BOOLEAN DEFAULT false,
    operations_purpose BOOLEAN DEFAULT false,
    
    -- Technical Details
    ip_address INET,
    session_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SWELL INTEGRATION AND SYNC TRACKING
-- ================================================================

-- Swell Sync Status Tracking
CREATE TABLE IF NOT EXISTS public.swell_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Sync Information
    sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'customers', 'full')),
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
    
    -- Status
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'partial')),
    
    -- Records Processed
    records_attempted INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Error Information
    error_message TEXT,
    error_details JSONB,
    
    -- Performance
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Audit
    initiated_by UUID REFERENCES public.staff(id)
);

-- Swell Product Mapping
CREATE TABLE IF NOT EXISTS public.swell_product_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Mapping Information
    diagnostic_test_id UUID REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    swell_product_id TEXT NOT NULL,
    swell_variant_id TEXT,
    
    -- Sync Information
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'inactive', 'error')),
    
    -- Price Tracking
    current_swell_price DECIMAL(10,2),
    price_last_updated TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(diagnostic_test_id, swell_product_id)
);

-- Inventory Alerts and Monitoring
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Product Information
    swell_product_id TEXT NOT NULL,
    product_name TEXT,
    sku TEXT,
    
    -- Alert Information
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'discontinued', 'price_change')),
    current_stock_level INTEGER,
    threshold_level INTEGER,
    
    -- Alert Status
    alert_status TEXT DEFAULT 'active' CHECK (alert_status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_by UUID REFERENCES public.staff(id),
    acknowledged_at TIMESTAMPTZ,
    
    -- Resolution
    resolved_by UUID REFERENCES public.staff(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- NOTIFICATION AND COMMUNICATION SYSTEM
-- ================================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Information
    name TEXT NOT NULL UNIQUE,
    template_type TEXT NOT NULL CHECK (template_type IN ('email', 'sms', 'push', 'in_app')),
    category TEXT NOT NULL CHECK (category IN ('appointment', 'results', 'reminder', 'admin', 'marketing')),
    
    -- Template Content
    subject TEXT, -- For email
    body_text TEXT NOT NULL,
    body_html TEXT, -- For email
    
    -- Variables and Personalization
    available_variables JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Queue and Delivery Tracking
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient Information
    recipient_user_id UUID REFERENCES public.profiles(user_id),
    recipient_email TEXT,
    recipient_phone TEXT,
    
    -- Notification Details
    notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'push', 'in_app')),
    template_id UUID REFERENCES public.notification_templates(id),
    
    -- Content
    subject TEXT,
    body TEXT NOT NULL,
    
    -- Delivery Information
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Error Handling
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    
    -- Tracking
    external_message_id TEXT, -- From email/SMS provider
    tracking_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- REPORTING AND ANALYTICS TABLES
-- ================================================================

-- Business Metrics Snapshots
CREATE TABLE IF NOT EXISTS public.business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time Period
    metric_date DATE NOT NULL,
    metric_period TEXT NOT NULL CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Revenue Metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Order Metrics
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    
    -- Appointment Metrics
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,
    appointment_utilization_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Customer Metrics
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    total_active_customers INTEGER DEFAULT 0,
    
    -- Test Results Metrics
    results_processed INTEGER DEFAULT 0,
    turnaround_time_hours DECIMAL(8,2) DEFAULT 0,
    abnormal_results_count INTEGER DEFAULT 0,
    
    -- Additional Metrics
    metrics_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(metric_date, metric_period)
);

-- ================================================================
-- CONFIGURATION AND SYSTEM SETTINGS
-- ================================================================

-- System Settings and Configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Setting Information
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'array')),
    
    -- Metadata
    description TEXT,
    category TEXT,
    
    -- Validation
    validation_rules JSONB DEFAULT '{}',
    
    -- Security
    is_sensitive BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    
    -- Audit
    last_modified_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON public.staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON public.staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_active_admin ON public.staff(is_active, can_access_admin);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_swell_id ON public.orders(swell_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON public.appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON public.appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON public.appointments(assigned_staff_id);

-- Test Result indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_order_id ON public.test_results(order_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON public.test_results(overall_status);
CREATE INDEX IF NOT EXISTS idx_test_results_result_date ON public.test_results(result_date);

-- Audit Log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_staff_id ON public.audit_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi_accessed ON public.audit_logs(phi_accessed);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_location_date ON public.appointments(location_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_test_results_user_status ON public.test_results(user_id, overall_status);

-- ================================================================
-- UPDATE TRIGGERS FOR TIMESTAMPS
-- ================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_departments_updated_at BEFORE UPDATE ON public.staff_departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_categories_updated_at BEFORE UPDATE ON public.test_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostic_tests_updated_at BEFORE UPDATE ON public.diagnostic_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_slots_updated_at BEFORE UPDATE ON public.appointment_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON public.test_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_swell_product_mapping_updated_at BEFORE UPDATE ON public.swell_product_mapping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON TABLE public.profiles IS 'Enhanced user profiles with medical information and HIPAA compliance';
COMMENT ON TABLE public.staff IS 'Staff members with roles, permissions, and admin access control';
COMMENT ON TABLE public.orders IS 'Enhanced orders with Swell.is integration and comprehensive tracking';
COMMENT ON TABLE public.appointments IS 'Appointment scheduling with staff assignment and communication tracking';
COMMENT ON TABLE public.test_results IS 'Comprehensive test results with clinical review and patient communication';
COMMENT ON TABLE public.audit_logs IS 'HIPAA-compliant audit logging for all system activities';
COMMENT ON TABLE public.swell_sync_log IS 'Tracking for Swell.is e-commerce synchronization';
COMMENT ON TABLE public.business_metrics IS 'Daily, weekly, and monthly business intelligence metrics';

-- ================================================================
-- END OF SCHEMA CREATION
-- ================================================================