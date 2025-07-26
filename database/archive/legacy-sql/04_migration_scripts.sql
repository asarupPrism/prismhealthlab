-- =====================================================
-- Prism Health Lab - Migration Scripts
-- =====================================================
-- 
-- Phased migration scripts for deploying the patient portal
-- database schema with proper dependency management and
-- rollback capabilities.
--
-- Migration Strategy:
-- 1. Create tables in dependency order
-- 2. Add indexes and constraints
-- 3. Enable RLS and create policies
-- 4. Insert seed data (development only)
-- 5. Verify integrity and functionality
-- =====================================================

-- =====================================================
-- MIGRATION METADATA TABLE
-- =====================================================

-- Track migration history
CREATE TABLE IF NOT EXISTS migration_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_name TEXT NOT NULL UNIQUE,
    migration_version TEXT NOT NULL,
    description TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_by TEXT DEFAULT CURRENT_USER,
    execution_time_ms BIGINT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    rollback_sql TEXT,
    checksum TEXT
);

-- Function to log migration execution
CREATE OR REPLACE FUNCTION log_migration(
    p_name TEXT,
    p_version TEXT,
    p_description TEXT,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL,
    p_rollback_sql TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    migration_id UUID;
    execution_time_ms BIGINT;
BEGIN
    migration_id := uuid_generate_v4();
    execution_time_ms := EXTRACT(EPOCH FROM (NOW() - p_start_time)) * 1000;
    
    INSERT INTO migration_history (
        id, migration_name, migration_version, description,
        execution_time_ms, success, error_message, rollback_sql
    ) VALUES (
        migration_id, p_name, p_version, p_description,
        execution_time_ms, p_success, p_error_message, p_rollback_sql
    );
    
    RETURN migration_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION PHASE 1: CORE TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_1_core_tables' AND success = true) THEN
        RAISE NOTICE 'Migration phase_1_core_tables already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 1: Core Tables Migration';
    
    -- Create core user tables first (no dependencies)
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        swell_customer_id TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        date_of_birth DATE,
        gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        address_line_1 TEXT,
        address_line_2 TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'US',
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        emergency_contact_relationship TEXT,
        medical_history JSONB DEFAULT '{}',
        allergies TEXT[],
        current_medications TEXT[],
        insurance_provider TEXT,
        insurance_policy_number TEXT,
        primary_physician_name TEXT,
        primary_physician_phone TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        profile_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        notification_email BOOLEAN DEFAULT TRUE,
        notification_sms BOOLEAN DEFAULT FALSE,
        notification_push BOOLEAN DEFAULT TRUE,
        notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'disabled')),
        theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'system')),
        language TEXT DEFAULT 'en',
        timezone TEXT DEFAULT 'America/New_York',
        date_format TEXT DEFAULT 'MM/DD/YYYY',
        time_format TEXT DEFAULT '12h',
        share_data_for_research BOOLEAN DEFAULT FALSE,
        marketing_emails BOOLEAN DEFAULT FALSE,
        third_party_integrations BOOLEAN DEFAULT FALSE,
        high_contrast_mode BOOLEAN DEFAULT FALSE,
        large_fonts BOOLEAN DEFAULT FALSE,
        screen_reader_optimized BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS two_factor_auth (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        totp_secret TEXT,
        totp_enabled BOOLEAN DEFAULT FALSE,
        totp_verified_at TIMESTAMP WITH TIME ZONE,
        backup_codes TEXT[],
        backup_codes_used TEXT[] DEFAULT '{}',
        backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
        recovery_email TEXT,
        recovery_phone TEXT,
        require_2fa_for_sensitive_actions BOOLEAN DEFAULT TRUE,
        max_sessions INTEGER DEFAULT 3,
        session_timeout_minutes INTEGER DEFAULT 60,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        location_type TEXT CHECK (location_type IN ('lab', 'collection_site', 'mobile_unit', 'partner_clinic')),
        address_line_1 TEXT NOT NULL,
        address_line_2 TEXT,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        country TEXT DEFAULT 'US',
        phone TEXT,
        email TEXT,
        website TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        timezone TEXT DEFAULT 'America/New_York',
        operating_hours JSONB DEFAULT '{}',
        services TEXT[] DEFAULT '{}',
        capacity_per_hour INTEGER DEFAULT 4,
        equipment_list TEXT[],
        test_types_supported TEXT[],
        special_requirements TEXT[],
        wheelchair_accessible BOOLEAN DEFAULT FALSE,
        parking_available BOOLEAN DEFAULT TRUE,
        public_transit_accessible BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        temporarily_closed BOOLEAN DEFAULT FALSE,
        closure_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_1_core_tables',
        '1.0.0',
        'Create core user and location tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 1: Core Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        migration_success := FALSE;
        
        -- Log failed migration
        PERFORM log_migration(
            'phase_1_core_tables',
            '1.0.0',
            'Create core user and location tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 1 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 2: STAFF AND SECURITY TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_2_staff_security' AND success = true) THEN
        RAISE NOTICE 'Migration phase_2_staff_security already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 2: Staff and Security Tables Migration';
    
    CREATE TABLE IF NOT EXISTS staff (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        employee_id TEXT UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'phlebotomist', 'nurse', 'doctor', 'support')),
        permissions TEXT[] DEFAULT '{}',
        department TEXT,
        supervisor_id UUID REFERENCES staff(id),
        location_ids UUID[],
        primary_location_id UUID,
        hire_date DATE,
        employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated')),
        license_number TEXT,
        license_expiry DATE,
        certifications JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS two_factor_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        attempt_type TEXT NOT NULL CHECK (attempt_type IN ('totp', 'backup_code', 'recovery')),
        success BOOLEAN NOT NULL,
        code_used TEXT,
        failure_reason TEXT,
        ip_address INET,
        user_agent TEXT,
        device_fingerprint TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_2_staff_security',
        '1.0.0',
        'Create staff and security tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 2: Staff and Security Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_2_staff_security',
            '1.0.0',
            'Create staff and security tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 2 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 3: TEST CATALOG TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_3_test_catalog' AND success = true) THEN
        RAISE NOTICE 'Migration phase_3_test_catalog already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 3: Test Catalog Tables Migration';
    
    CREATE TABLE IF NOT EXISTS test_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        parent_category_id UUID REFERENCES test_categories(id),
        sort_order INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        color_scheme TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS diagnostic_tests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        swell_product_id TEXT UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        category_id UUID REFERENCES test_categories(id) NOT NULL,
        key_tests TEXT[] DEFAULT '{}',
        biomarkers TEXT[] DEFAULT '{}',
        sample_type TEXT NOT NULL CHECK (sample_type IN ('blood', 'urine', 'saliva', 'stool', 'other')),
        sample_volume_ml DECIMAL(5,2),
        fasting_required BOOLEAN DEFAULT FALSE,
        fasting_hours INTEGER,
        turnaround_time TEXT NOT NULL,
        turnaround_hours INTEGER,
        collection_method TEXT CHECK (collection_method IN ('venipuncture', 'fingerstick', 'at_home_kit')),
        normal_ranges JSONB DEFAULT '{}',
        reference_info JSONB DEFAULT '{}',
        clinical_significance TEXT,
        preparation_instructions TEXT,
        base_price DECIMAL(10,2),
        insurance_covered BOOLEAN DEFAULT FALSE,
        age_restrictions TEXT,
        gender_restrictions TEXT[],
        lab_provider TEXT,
        lab_code TEXT,
        cpt_codes TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        requires_doctor_review BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS test_pricing (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
        tier_name TEXT NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2),
        min_quantity INTEGER DEFAULT 1,
        max_quantity INTEGER,
        valid_from DATE,
        valid_until DATE,
        applicable_states TEXT[],
        applicable_age_range TEXT,
        insurance_tiers TEXT[],
        bundle_id UUID,
        bundle_discount_percent DECIMAL(5,2),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_3_test_catalog',
        '1.0.0',
        'Create test catalog and pricing tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 3: Test Catalog Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_3_test_catalog',
            '1.0.0',
            'Create test catalog and pricing tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 3 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 4: ORDER AND COMMERCE TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_4_orders_commerce' AND success = true) THEN
        RAISE NOTICE 'Migration phase_4_orders_commerce already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 4: Orders and Commerce Tables Migration';
    
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        swell_order_id TEXT UNIQUE NOT NULL,
        customer_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        currency TEXT DEFAULT 'USD',
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
        billing_info JSONB,
        shipping_info JSONB,
        swell_order_data JSONB,
        swell_customer_id TEXT,
        metadata JSONB DEFAULT '{}',
        internal_notes TEXT,
        order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        payment_date TIMESTAMP WITH TIME ZONE,
        collection_date TIMESTAMP WITH TIME ZONE,
        completion_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS order_tests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id TEXT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
        test_name TEXT NOT NULL,
        test_description TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        swell_product_id TEXT,
        swell_variant_id TEXT,
        swell_line_item_data JSONB,
        metadata JSONB DEFAULT '{}',
        special_instructions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
        location_id UUID REFERENCES locations(id) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        appointment_type TEXT DEFAULT 'blood_draw' CHECK (appointment_type IN (
            'blood_draw', 'consultation', 'result_review', 'follow_up'
        )),
        status TEXT DEFAULT 'scheduled' CHECK (status IN (
            'scheduled', 'confirmed', 'checked_in', 'in_progress', 
            'completed', 'no_show', 'cancelled', 'rescheduled'
        )),
        assigned_staff_id UUID REFERENCES staff(id),
        backup_staff_id UUID REFERENCES staff(id),
        confirmation_sent BOOLEAN DEFAULT FALSE,
        confirmation_sent_at TIMESTAMP WITH TIME ZONE,
        reminder_sent BOOLEAN DEFAULT FALSE,
        reminder_sent_at TIMESTAMP WITH TIME ZONE,
        pre_appointment_notes TEXT,
        post_appointment_notes TEXT,
        collection_notes TEXT,
        special_instructions TEXT,
        accessibility_needs TEXT,
        language_preference TEXT,
        metadata JSONB DEFAULT '{}',
        original_appointment_id UUID REFERENCES appointments(id),
        reschedule_reason TEXT,
        cancelled_by TEXT,
        cancellation_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS appointment_slots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        location_id UUID REFERENCES locations(id) NOT NULL,
        staff_id UUID REFERENCES staff(id),
        slot_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration_minutes INTEGER NOT NULL,
        max_appointments INTEGER DEFAULT 1,
        current_bookings INTEGER DEFAULT 0,
        slot_type TEXT DEFAULT 'standard' CHECK (slot_type IN ('standard', 'priority', 'emergency', 'blocked')),
        appointment_types_allowed TEXT[] DEFAULT '{"blood_draw"}',
        is_available BOOLEAN DEFAULT TRUE,
        unavailable_reason TEXT,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_pattern TEXT,
        recurrence_end_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_4_orders_commerce',
        '1.0.0',
        'Create orders, appointments, and commerce tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 4: Orders and Commerce Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_4_orders_commerce',
            '1.0.0',
            'Create orders, appointments, and commerce tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 4 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 5: RESULTS AND HEALTH DATA TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_5_results_health' AND success = true) THEN
        RAISE NOTICE 'Migration phase_5_results_health already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 5: Results and Health Data Tables Migration';
    
    CREATE TABLE IF NOT EXISTS test_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        order_id TEXT REFERENCES orders(id) NOT NULL,
        test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
        appointment_id UUID REFERENCES appointments(id),
        lab_report_number TEXT UNIQUE,
        lab_batch_id TEXT,
        lab_technician TEXT,
        collection_date TIMESTAMP WITH TIME ZONE NOT NULL,
        received_date TIMESTAMP WITH TIME ZONE,
        processing_start_date TIMESTAMP WITH TIME ZONE,
        result_date TIMESTAMP WITH TIME ZONE,
        results_data JSONB NOT NULL,
        raw_lab_data JSONB,
        interpretation TEXT,
        clinical_significance TEXT,
        abnormal_flags TEXT[],
        critical_values TEXT[],
        status TEXT DEFAULT 'pending' CHECK (status IN (
            'pending', 'processing', 'completed', 'reviewed', 'cancelled', 'failed'
        )),
        quality_control_status TEXT DEFAULT 'passed' CHECK (quality_control_status IN (
            'passed', 'failed', 'pending_review', 'retest_required'
        )),
        is_abnormal BOOLEAN DEFAULT FALSE,
        requires_followup BOOLEAN DEFAULT FALSE,
        provider_notes TEXT,
        reviewed_by_provider BOOLEAN DEFAULT FALSE,
        reviewed_by_staff_id UUID REFERENCES staff(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        patient_notified BOOLEAN DEFAULT FALSE,
        notification_sent_at TIMESTAMP WITH TIME ZONE,
        notification_method TEXT,
        patient_viewed BOOLEAN DEFAULT FALSE,
        patient_viewed_at TIMESTAMP WITH TIME ZONE,
        checksum TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS result_files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        result_id UUID REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type TEXT,
        file_category TEXT CHECK (file_category IN (
            'lab_report', 'chart', 'image', 'supplementary', 'raw_data'
        )),
        is_primary BOOLEAN DEFAULT FALSE,
        is_patient_viewable BOOLEAN DEFAULT TRUE,
        access_level TEXT DEFAULT 'patient' CHECK (access_level IN ('patient', 'provider', 'admin')),
        encryption_key_id TEXT,
        version INTEGER DEFAULT 1,
        replaced_by_file_id UUID REFERENCES result_files(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS biomarker_data (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        result_id UUID REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
        biomarker_name TEXT NOT NULL,
        biomarker_code TEXT,
        biomarker_category TEXT,
        value DECIMAL(15,6),
        unit TEXT NOT NULL,
        reference_range_min DECIMAL(15,6),
        reference_range_max DECIMAL(15,6),
        is_abnormal BOOLEAN DEFAULT FALSE,
        abnormal_flag TEXT,
        percentile DECIMAL(5,2),
        previous_value DECIMAL(15,6),
        trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable', 'first_measurement')),
        percent_change DECIMAL(10,4),
        measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
        measurement_method TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS health_trends (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        biomarker_name TEXT NOT NULL,
        trend_type TEXT CHECK (trend_type IN ('improvement', 'deterioration', 'stable', 'fluctuating')),
        trend_period TEXT,
        data_points INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        start_value DECIMAL(15,6),
        end_value DECIMAL(15,6),
        slope DECIMAL(15,6),
        r_squared DECIMAL(5,4),
        statistical_significance BOOLEAN DEFAULT FALSE,
        clinical_significance TEXT,
        recommendation TEXT,
        calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        algorithm_version TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_5_results_health',
        '1.0.0',
        'Create test results and health data tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 5: Results and Health Data Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_5_results_health',
            '1.0.0',
            'Create test results and health data tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 5 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 6: COMMUNICATION AND MONITORING TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_6_communication_monitoring' AND success = true) THEN
        RAISE NOTICE 'Migration phase_6_communication_monitoring already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 6: Communication and Monitoring Tables Migration';
    
    -- Communication tables
    CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent TEXT,
        device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
        browser TEXT,
        os TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        failure_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS push_notifications_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        icon TEXT,
        badge TEXT,
        tag TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN (
            'sent', 'delivered', 'failed', 'expired', 'clicked'
        )),
        failure_reason TEXT,
        clicked BOOLEAN DEFAULT FALSE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        message_type TEXT CHECK (message_type IN (
            'result_available', 'appointment_reminder', 'appointment_confirmation',
            'system_update', 'promotional', 'emergency'
        )),
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS email_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        template_name TEXT UNIQUE NOT NULL,
        template_type TEXT CHECK (template_type IN (
            'appointment_confirmation', 'appointment_reminder', 'result_notification',
            'welcome', 'password_reset', 'account_verification', 'lab_report'
        )),
        subject TEXT NOT NULL,
        html_content TEXT NOT NULL,
        text_content TEXT NOT NULL,
        variables JSONB DEFAULT '{}',
        template_styles JSONB DEFAULT '{}',
        brand_colors JSONB DEFAULT '{}',
        version INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_by UUID REFERENCES staff(id),
        last_modified_by UUID REFERENCES staff(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS email_delivery_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        template_id UUID REFERENCES email_templates(id),
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN (
            'sent', 'delivered', 'bounced', 'complaint', 'opened', 'clicked'
        )),
        provider_message_id TEXT,
        provider_response JSONB,
        opened BOOLEAN DEFAULT FALSE,
        opened_at TIMESTAMP WITH TIME ZONE,
        clicked BOOLEAN DEFAULT FALSE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Monitoring tables
    CREATE TABLE IF NOT EXISTS performance_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        session_id TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        metric_type TEXT CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'timing')),
        metric_value DECIMAL(15,6) NOT NULL,
        metric_unit TEXT NOT NULL,
        page_url TEXT,
        user_agent TEXT,
        device_type TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        duration_ms INTEGER,
        tags JSONB DEFAULT '{}',
        additional_data JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS performance_alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        alert_name TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        threshold_value DECIMAL(15,6) NOT NULL,
        comparison_operator TEXT CHECK (comparison_operator IN ('>', '<', '>=', '<=', '=')),
        severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        description TEXT,
        resolution_steps TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        current_value DECIMAL(15,6),
        last_triggered_at TIMESTAMP WITH TIME ZONE,
        trigger_count INTEGER DEFAULT 0,
        notify_admin BOOLEAN DEFAULT TRUE,
        notify_email TEXT[],
        cooldown_minutes INTEGER DEFAULT 15,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS cache_operation_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        operation_type TEXT CHECK (operation_type IN ('get', 'set', 'delete', 'invalidate', 'expire')),
        cache_key TEXT NOT NULL,
        cache_type TEXT NOT NULL,
        execution_time_ms INTEGER,
        cache_hit BOOLEAN,
        data_size_bytes INTEGER,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        triggered_by TEXT,
        request_id TEXT,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS cache_error_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        cache_key TEXT,
        operation_type TEXT,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        redis_host TEXT,
        redis_port INTEGER,
        connection_status TEXT,
        resolved BOOLEAN DEFAULT FALSE,
        resolution_notes TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by UUID REFERENCES staff(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS cache_invalidation_queue (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cache_type TEXT NOT NULL,
        cache_key_pattern TEXT NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        processed BOOLEAN DEFAULT FALSE,
        processed_at TIMESTAMP WITH TIME ZONE,
        processing_attempts INTEGER DEFAULT 0,
        triggered_by TEXT NOT NULL,
        trigger_source TEXT,
        metadata JSONB DEFAULT '{}',
        priority INTEGER DEFAULT 5,
        scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_6_communication_monitoring',
        '1.0.0',
        'Create communication and monitoring tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 6: Communication and Monitoring Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_6_communication_monitoring',
            '1.0.0',
            'Create communication and monitoring tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 6 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 7: AUDIT AND COMPLIANCE TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_7_audit_compliance' AND success = true) THEN
        RAISE NOTICE 'Migration phase_7_audit_compliance already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 7: Audit and Compliance Tables Migration';
    
    CREATE TABLE IF NOT EXISTS patient_audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
        staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
        patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        resource_id TEXT,
        access_method TEXT CHECK (access_method IN ('web_portal', 'api', 'admin_panel', 'mobile_app')),
        ip_address INET,
        user_agent TEXT,
        session_id TEXT,
        access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        duration_seconds INTEGER,
        success BOOLEAN NOT NULL,
        failure_reason TEXT,
        data_accessed JSONB,
        query_parameters JSONB,
        response_code INTEGER,
        business_justification TEXT,
        metadata JSONB DEFAULT '{}',
        log_hash TEXT NOT NULL,
        previous_log_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
        staff_id UUID REFERENCES staff(id) ON DELETE SET NULL NOT NULL,
        action_type TEXT NOT NULL,
        action_description TEXT NOT NULL,
        affected_resource TEXT NOT NULL,
        affected_resource_id TEXT,
        affected_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        admin_panel_section TEXT,
        permission_used TEXT,
        authorization_level TEXT,
        approval_required BOOLEAN DEFAULT FALSE,
        approved_by UUID REFERENCES staff(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        hipaa_relevant BOOLEAN DEFAULT FALSE,
        sox_relevant BOOLEAN DEFAULT FALSE,
        gdpr_relevant BOOLEAN DEFAULT FALSE,
        log_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS security_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type TEXT NOT NULL CHECK (event_type IN (
            'login_failure', 'suspicious_activity', 'data_breach', 'unauthorized_access',
            'system_intrusion', 'malware_detection', 'policy_violation', 'account_compromise'
        )),
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
        affected_resources TEXT[],
        event_description TEXT NOT NULL,
        detection_method TEXT,
        source_ip INET,
        user_agent TEXT,
        investigated BOOLEAN DEFAULT FALSE,
        investigated_by UUID REFERENCES staff(id),
        investigation_notes TEXT,
        investigation_completed_at TIMESTAMP WITH TIME ZONE,
        resolved BOOLEAN DEFAULT FALSE,
        resolution_action TEXT,
        resolved_by UUID REFERENCES staff(id),
        resolved_at TIMESTAMP WITH TIME ZONE,
        authorities_notified BOOLEAN DEFAULT FALSE,
        customers_notified BOOLEAN DEFAULT FALSE,
        notification_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_7_audit_compliance',
        '1.0.0',
        'Create audit and compliance tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 7: Audit and Compliance Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_7_audit_compliance',
            '1.0.0',
            'Create audit and compliance tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 7 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 8: INTEGRATION AND EXTERNAL TABLES
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_8_integration_external' AND success = true) THEN
        RAISE NOTICE 'Migration phase_8_integration_external already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 8: Integration and External Tables Migration';
    
    CREATE TABLE IF NOT EXISTS swell_sync_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sync_type TEXT CHECK (sync_type IN ('orders', 'products', 'customers', 'inventory')),
        sync_direction TEXT CHECK (sync_direction IN ('swell_to_local', 'local_to_swell', 'bidirectional')),
        batch_id TEXT,
        total_records INTEGER,
        successful_syncs INTEGER,
        failed_syncs INTEGER,
        sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        sync_completed_at TIMESTAMP WITH TIME ZONE,
        duration_seconds INTEGER,
        success BOOLEAN NOT NULL,
        error_summary TEXT,
        error_details JSONB,
        triggered_by TEXT,
        swell_api_version TEXT,
        records_created INTEGER DEFAULT 0,
        records_updated INTEGER DEFAULT 0,
        records_deleted INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        webhook_source TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_id TEXT,
        raw_payload JSONB NOT NULL,
        processed_payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        processing_attempts INTEGER DEFAULT 0,
        max_retry_attempts INTEGER DEFAULT 3,
        processing_success BOOLEAN,
        processing_error TEXT,
        processing_started_at TIMESTAMP WITH TIME ZONE,
        processing_completed_at TIMESTAMP WITH TIME ZONE,
        signature_verified BOOLEAN DEFAULT FALSE,
        signature_header TEXT,
        user_agent TEXT,
        source_ip INET,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_8_integration_external',
        '1.0.0',
        'Create integration and external tables',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 8: Integration and External Tables completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_8_integration_external',
            '1.0.0',
            'Create integration and external tables',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 8 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 9: INDEXES AND CONSTRAINTS
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_9_indexes_constraints' AND success = true) THEN
        RAISE NOTICE 'Migration phase_9_indexes_constraints already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 9: Creating Indexes and Constraints';
    
    -- Core user indexes
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_swell_customer_id ON profiles(swell_customer_id);
    CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
    CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    
    -- Order and commerce indexes
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_swell_order_id ON orders(swell_order_id);
    CREATE INDEX IF NOT EXISTS idx_order_tests_order_id ON order_tests(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_tests_test_id ON order_tests(test_id);
    
    -- Appointment indexes
    CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);
    
    -- Test results indexes
    CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_order_id ON test_results(order_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
    CREATE INDEX IF NOT EXISTS idx_test_results_result_date ON test_results(result_date);
    CREATE INDEX IF NOT EXISTS idx_biomarker_data_user_id ON biomarker_data(user_id);
    CREATE INDEX IF NOT EXISTS idx_biomarker_data_biomarker_name ON biomarker_data(biomarker_name);
    CREATE INDEX IF NOT EXISTS idx_biomarker_data_measurement_date ON biomarker_data(measurement_date);
    
    -- Performance monitoring indexes
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
    
    -- Cache operation indexes
    CREATE INDEX IF NOT EXISTS idx_cache_operation_logs_cache_key ON cache_operation_logs(cache_key);
    CREATE INDEX IF NOT EXISTS idx_cache_operation_logs_created_at ON cache_operation_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_cache_invalidation_queue_processed ON cache_invalidation_queue(processed);
    CREATE INDEX IF NOT EXISTS idx_cache_invalidation_queue_scheduled_for ON cache_invalidation_queue(scheduled_for);
    
    -- Audit logging indexes (for compliance reporting)
    CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_patient_id ON patient_audit_logs(patient_id);
    CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_access_timestamp ON patient_audit_logs(access_timestamp);
    CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_action ON patient_audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_9_indexes_constraints',
        '1.0.0',
        'Create database indexes and constraints',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 9: Indexes and Constraints completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_9_indexes_constraints',
            '1.0.0',
            'Create database indexes and constraints',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 9 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 10: STORED PROCEDURES AND FUNCTIONS
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_10_procedures_functions' AND success = true) THEN
        RAISE NOTICE 'Migration phase_10_procedures_functions already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 10: Creating Stored Procedures and Functions';
    
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
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_10_procedures_functions',
        '1.0.0',
        'Create stored procedures and functions',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 10: Stored Procedures and Functions completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_10_procedures_functions',
            '1.0.0',
            'Create stored procedures and functions',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 10 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION PHASE 11: TRIGGERS AND AUTOMATION
-- =====================================================

DO $$
DECLARE
    start_time TIMESTAMP WITH TIME ZONE := NOW();
    migration_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Check if already executed
    IF EXISTS (SELECT 1 FROM migration_history WHERE migration_name = 'phase_11_triggers_automation' AND success = true) THEN
        RAISE NOTICE 'Migration phase_11_triggers_automation already executed successfully';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Starting Phase 11: Creating Triggers and Automation';
    
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
    DROP TRIGGER IF EXISTS orders_cache_invalidation ON orders;
    CREATE TRIGGER orders_cache_invalidation
        AFTER INSERT OR UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION trigger_cache_invalidation();
    
    DROP TRIGGER IF EXISTS results_cache_invalidation ON test_results;
    CREATE TRIGGER results_cache_invalidation  
        AFTER INSERT OR UPDATE ON test_results
        FOR EACH ROW EXECUTE FUNCTION trigger_cache_invalidation();
    
    DROP TRIGGER IF EXISTS appointments_cache_invalidation ON appointments;
    CREATE TRIGGER appointments_cache_invalidation
        AFTER INSERT OR UPDATE ON appointments
        FOR EACH ROW EXECUTE FUNCTION trigger_cache_invalidation();
    
    -- Log successful migration
    PERFORM log_migration(
        'phase_11_triggers_automation',
        '1.0.0',
        'Create triggers and automation',
        start_time,
        TRUE
    );
    
    RAISE NOTICE 'Phase 11: Triggers and Automation completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        error_msg := SQLERRM;
        
        PERFORM log_migration(
            'phase_11_triggers_automation',
            '1.0.0',
            'Create triggers and automation',
            start_time,
            FALSE,
            error_msg
        );
        
        RAISE EXCEPTION 'Phase 11 migration failed: %', error_msg;
END $$;

-- =====================================================
-- MIGRATION VERIFICATION AND COMPLETION
-- =====================================================

DO $$
DECLARE
    total_migrations INTEGER;
    successful_migrations INTEGER;
    failed_migrations INTEGER;
BEGIN
    -- Count migration results
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE success = true),
        COUNT(*) FILTER (WHERE success = false)
    INTO total_migrations, successful_migrations, failed_migrations
    FROM migration_history
    WHERE migration_name LIKE 'phase_%';
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  Total Phases: %', total_migrations;
    RAISE NOTICE '  Successful: %', successful_migrations;
    RAISE NOTICE '  Failed: %', failed_migrations;
    
    IF failed_migrations > 0 THEN
        RAISE EXCEPTION 'Migration completed with % failures. Check migration_history table for details.', failed_migrations;
    ELSE
        RAISE NOTICE 'All migration phases completed successfully!';
    END IF;
END $$;

-- =====================================================
-- MIGRATION STATUS QUERY
-- =====================================================

-- Query to check migration status
SELECT 
    migration_name,
    migration_version,
    description,
    executed_at,
    execution_time_ms,
    success,
    CASE 
        WHEN error_message IS NOT NULL THEN 'FAILED: ' || error_message
        WHEN success THEN 'SUCCESS'
        ELSE 'UNKNOWN'
    END as status
FROM migration_history 
WHERE migration_name LIKE 'phase_%'
ORDER BY executed_at;

-- Final completion message
SELECT 
    'Patient Portal Database Migration Completed!' as result,
    NOW() as completed_at,
    CURRENT_USER as executed_by;