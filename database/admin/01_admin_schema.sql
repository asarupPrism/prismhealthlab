-- ================================================================
-- PRISM HEALTH LAB - ADMIN DATABASE SCHEMA
-- ================================================================
-- Consolidated admin schema for the Prism Health Lab admin dashboard
-- 
-- Compatible with Supabase PostgreSQL
-- Follows HIPAA compliance requirements
-- Integrates with Swell.is e-commerce platform
-- 
-- Deploy Order: Run this file first before RLS policies and seed data
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================================================
-- ADMIN STAFF MANAGEMENT TABLES
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
    level INTEGER NOT NULL DEFAULT 1, -- Higher number = higher privilege
    default_permissions JSONB DEFAULT '[]',
    is_admin_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Members (links to auth.users)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    role_id UUID REFERENCES public.staff_roles(id) NOT NULL,
    department_id UUID REFERENCES public.staff_departments(id) NOT NULL,
    
    -- Contact Information
    work_email TEXT UNIQUE NOT NULL,
    work_phone TEXT,
    manager_id UUID REFERENCES public.staff(id),
    
    -- Employment Details
    hire_date DATE NOT NULL,
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated')),
    
    -- Admin Permissions
    can_access_admin BOOLEAN DEFAULT false,
    can_view_phi BOOLEAN DEFAULT false, -- Protected Health Information
    permissions JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ENHANCED TEST AND CATEGORY MANAGEMENT
-- ================================================================

-- Test Categories with Enhanced Metadata
CREATE TABLE IF NOT EXISTS public.test_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT, -- Icon identifier for UI
    color_theme TEXT DEFAULT '#06b6d4', -- Medical theme color
    
    -- Hierarchy and Organization
    parent_category_id UUID REFERENCES public.test_categories(id),
    sort_order INTEGER DEFAULT 0,
    
    -- Marketing and Display
    is_featured BOOLEAN DEFAULT false,
    featured_description TEXT,
    seo_meta JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Diagnostic Tests
CREATE TABLE IF NOT EXISTS public.diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.test_categories(id) NOT NULL,
    
    -- Test Identification
    test_code TEXT UNIQUE NOT NULL,
    loinc_codes TEXT[] DEFAULT '{}',
    swell_product_id TEXT UNIQUE, -- Link to Swell e-commerce
    
    -- Pricing and Commercial
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    cost_to_lab DECIMAL(10,2),
    
    -- Test Requirements
    fasting_required BOOLEAN DEFAULT false,
    fasting_duration_hours INTEGER DEFAULT 0,
    specimen_type TEXT DEFAULT 'blood',
    collection_method TEXT DEFAULT 'venipuncture',
    specimen_volume_ml DECIMAL(5,2),
    
    -- Processing Information
    turnaround_time_business_days INTEGER DEFAULT 1,
    lab_processing_time_hours INTEGER DEFAULT 24,
    reference_lab TEXT,
    
    -- Clinical Information
    clinical_significance TEXT,
    patient_preparation_instructions TEXT,
    interpretation_guide TEXT,
    
    -- Marketing and SEO
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    popularity_score INTEGER DEFAULT 0,
    seo_meta JSONB DEFAULT '{}',
    
    -- Quality and Compliance
    version INTEGER DEFAULT 1,
    last_reviewed_date DATE,
    next_review_date DATE,
    regulatory_approvals JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- LOCATION AND OPERATIONAL MANAGEMENT
-- ================================================================

-- Testing Locations
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_code TEXT UNIQUE NOT NULL,
    
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
    
    -- Operational Details
    operating_hours JSONB DEFAULT '{}', -- Day -> hours mapping
    timezone TEXT DEFAULT 'America/New_York',
    capacity INTEGER DEFAULT 20, -- Max appointments per day
    
    -- Features and Services
    services_offered TEXT[] DEFAULT '{}',
    parking_available BOOLEAN DEFAULT true,
    wheelchair_accessible BOOLEAN DEFAULT true,
    accepts_walk_ins BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ORDER AND APPOINTMENT MANAGEMENT
-- ================================================================

-- Enhanced Orders Table (synced with Swell)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swell_order_id TEXT UNIQUE, -- From Swell.is
    swell_order_number TEXT UNIQUE, -- From Swell.is
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Customer Information
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    billing_address JSONB DEFAULT '{}',
    
    -- Order Financial Details
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Order Processing
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Test Information
    items JSONB NOT NULL DEFAULT '[]', -- Array of test items
    special_instructions TEXT,
    
    -- Appointment Coordination
    requires_appointment BOOLEAN DEFAULT true,
    appointment_scheduled BOOLEAN DEFAULT false,
    preferred_location_id UUID REFERENCES public.locations(id),
    
    -- Audit Trail
    order_source TEXT DEFAULT 'website',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment Scheduling
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) NOT NULL,
    
    -- Appointment Details
    appointment_number TEXT UNIQUE NOT NULL,
    appointment_type TEXT DEFAULT 'blood_draw' CHECK (appointment_type IN ('blood_draw', 'consultation', 'follow_up')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 30,
    
    -- Status and Processing
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    
    -- Staff Assignment
    assigned_staff_id UUID REFERENCES public.staff(id),
    checked_in_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Communication
    confirmation_sent BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    
    -- Special Requirements
    special_instructions TEXT,
    accessibility_requirements TEXT,
    
    -- Audit
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- RESULTS AND HEALTH DATA MANAGEMENT
-- ================================================================

-- Test Results Storage
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    test_id UUID REFERENCES public.diagnostic_tests(id) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    
    -- Lab Information
    lab_report_number TEXT UNIQUE NOT NULL,
    lab_accession_number TEXT,
    performing_lab TEXT,
    
    -- Sample Information
    sample_collection_date TIMESTAMPTZ,
    sample_received_date TIMESTAMPTZ,
    
    -- Results Data
    result_date TIMESTAMPTZ NOT NULL,
    results_data JSONB NOT NULL, -- Structured test results
    reference_ranges JSONB DEFAULT '{}',
    abnormal_flags TEXT[] DEFAULT '{}',
    
    -- Clinical Review
    overall_status TEXT DEFAULT 'normal' CHECK (overall_status IN ('normal', 'abnormal', 'critical', 'pending_review')),
    clinical_notes TEXT,
    
    -- Quality Control
    quality_control_passed BOOLEAN DEFAULT true,
    quality_control_notes TEXT,
    
    -- Patient Communication
    patient_notified BOOLEAN DEFAULT false,
    patient_notified_at TIMESTAMPTZ,
    
    -- Medical Review
    reviewed_by UUID REFERENCES public.staff(id),
    reviewed_at TIMESTAMPTZ,
    requires_follow_up BOOLEAN DEFAULT false,
    follow_up_instructions TEXT,
    
    -- Document Management
    pdf_report_url TEXT,
    raw_data_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- SYSTEM CONFIGURATION AND MONITORING
-- ================================================================

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    description TEXT,
    category TEXT DEFAULT 'general',
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('email', 'sms', 'push', 'in_app')),
    category TEXT NOT NULL,
    
    -- Template Content
    subject TEXT, -- For email templates
    body_text TEXT NOT NULL,
    body_html TEXT, -- For email templates
    
    -- Template Variables
    required_variables TEXT[] DEFAULT '{}',
    optional_variables TEXT[] DEFAULT '{}',
    
    -- Personalization
    supports_personalization BOOLEAN DEFAULT true,
    default_language TEXT DEFAULT 'en',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- User and Staff Indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_department ON public.staff(role_id, department_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(is_active);

-- Test and Category Indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_category ON public.diagnostic_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_active ON public.diagnostic_tests(is_active);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_swell_id ON public.diagnostic_tests(swell_product_id);
CREATE INDEX IF NOT EXISTS idx_test_categories_slug ON public.test_categories(slug);
CREATE INDEX IF NOT EXISTS idx_test_categories_active ON public.test_categories(is_active);

-- Order and Appointment Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_swell_id ON public.orders(swell_order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_location_date ON public.appointments(location_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Results Indexes
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_order_id ON public.test_results(order_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON public.test_results(overall_status);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON public.test_results(result_date);

-- System Indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(template_type);

-- ================================================================
-- SCHEMA DEPLOYMENT SUCCESS
-- ================================================================

SELECT 
    'Admin schema deployed successfully!' as result,
    'All tables, indexes, and constraints created' as status,
    NOW() as deployed_at;