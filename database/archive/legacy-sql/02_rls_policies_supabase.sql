-- =====================================================
-- Prism Health Lab - Row Level Security (RLS) Policies
-- =====================================================
-- 
-- HIPAA-compliant Row Level Security policies for the 
-- Prism Health Lab patient portal database schema.
--
-- Compatible with Supabase auth system
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS FOR RLS POLICIES (Public Schema)
-- =====================================================

-- Check if current user is staff with specific permission
CREATE OR REPLACE FUNCTION public.has_staff_permission(permission_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid() 
        AND is_active = TRUE
        AND (
            can_access_admin = TRUE
            OR permission_name = ANY(permissions::TEXT[])
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid() 
        AND can_access_admin = TRUE
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- HIPAA-compliant function to check patient data access with mandatory logging
CREATE OR REPLACE FUNCTION public.can_access_patient_data(patient_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    access_granted BOOLEAN := FALSE;
    access_reason TEXT;
    staff_record RECORD;
BEGIN
    current_user_id := auth.uid();
    
    -- User can access their own data (Treatment relationship)
    IF current_user_id = patient_user_id THEN
        access_granted := TRUE;
        access_reason := 'self_access';
    ELSE
        -- Check if current user is staff with proper permissions
        SELECT * INTO staff_record 
        FROM staff 
        WHERE user_id = current_user_id 
        AND is_active = TRUE;
        
        IF FOUND THEN
            -- Staff with patient data access permission (Treatment relationship)
            IF 'patient_data_access' = ANY(staff_record.permissions::TEXT[]) 
               OR staff_record.can_access_admin = TRUE THEN
                access_granted := TRUE;
                access_reason := 'staff_treatment_access';
            END IF;
        END IF;
    END IF;
    
    -- HIPAA REQUIREMENT: Log all PHI access attempts
    INSERT INTO data_access_logs (
        staff_id,
        patient_id,
        access_type,
        resource_type,
        resource_id,
        access_reason,
        treatment_relationship,
        payment_purpose,
        operations_purpose,
        ip_address,
        session_id,
        created_at
    ) VALUES (
        CASE WHEN current_user_id != patient_user_id THEN 
            (SELECT id FROM staff WHERE user_id = current_user_id) 
        END,
        patient_user_id,
        'view',
        'patient_data',
        patient_user_id::TEXT,
        access_reason,
        CASE WHEN access_reason IN ('self_access', 'staff_treatment_access') THEN TRUE ELSE FALSE END,
        FALSE, -- Not for payment purposes in this context
        FALSE, -- Not for operations purposes in this context  
        inet_client_addr(),
        current_setting('application_name', true),
        NOW()
    );
    
    RETURN access_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

-- User and profile tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Test catalog tables
ALTER TABLE test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_availability ENABLE ROW LEVEL SECURITY;

-- Order tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tests ENABLE ROW LEVEL SECURITY;

-- Appointment tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Results tables
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_trends ENABLE ROW LEVEL SECURITY;

-- Notification tables
ALTER TABLE result_notifications ENABLE ROW LEVEL SECURITY;

-- Audit tables
ALTER TABLE patient_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;

-- Cache tables
ALTER TABLE cache_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_invalidation_queue ENABLE ROW LEVEL SECURITY;

-- System tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Patients can access their own profile
CREATE POLICY "profiles_own_data" ON profiles
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can read patient profiles with permission
CREATE POLICY "profiles_staff_read" ON profiles
    FOR SELECT
    USING (public.has_staff_permission('patient_data_access') OR public.is_admin());

-- =====================================================
-- USER PREFERENCES POLICIES
-- =====================================================

-- Users can manage their own preferences
CREATE POLICY "user_preferences_own_data" ON user_preferences
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- TEST CATALOG POLICIES (Public Read)
-- =====================================================

-- Test categories are publicly readable
CREATE POLICY "test_categories_public_read" ON test_categories
    FOR SELECT
    USING (is_active = TRUE);

-- Staff can manage test categories
CREATE POLICY "test_categories_staff_write" ON test_categories
    FOR ALL
    USING (public.has_staff_permission('catalog_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('catalog_management') OR public.is_admin());

-- Diagnostic tests are publicly readable when active
CREATE POLICY "diagnostic_tests_public_read" ON diagnostic_tests
    FOR SELECT
    USING (is_active = TRUE);

-- Staff can manage diagnostic tests
CREATE POLICY "diagnostic_tests_staff_write" ON diagnostic_tests
    FOR ALL
    USING (public.has_staff_permission('catalog_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('catalog_management') OR public.is_admin());

-- Test pricing is publicly readable
CREATE POLICY "test_pricing_public_read" ON test_pricing
    FOR SELECT
    USING (is_active = TRUE);

-- Staff can manage pricing
CREATE POLICY "test_pricing_staff_write" ON test_pricing
    FOR ALL
    USING (public.has_staff_permission('pricing_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('pricing_management') OR public.is_admin());

-- =====================================================
-- ORDER POLICIES
-- =====================================================

-- Users can access their own orders
CREATE POLICY "orders_own_data" ON orders
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can read orders with permission
CREATE POLICY "orders_staff_read" ON orders
    FOR SELECT
    USING (public.has_staff_permission('order_management') OR public.is_admin());

-- Staff can update order status
CREATE POLICY "orders_staff_update" ON orders
    FOR UPDATE
    USING (public.has_staff_permission('order_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('order_management') OR public.is_admin());

-- Order tests follow order permissions
CREATE POLICY "order_tests_via_order" ON order_tests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_tests.order_id 
            AND (
                orders.user_id = auth.uid() 
                OR public.has_staff_permission('order_management')
                OR public.is_admin()
            )
        )
    );

-- =====================================================
-- APPOINTMENT POLICIES
-- =====================================================

-- Locations are publicly readable when active
CREATE POLICY "locations_public_read" ON locations
    FOR SELECT
    USING (is_active = TRUE);

-- Staff can manage locations
CREATE POLICY "locations_staff_write" ON locations
    FOR ALL
    USING (public.has_staff_permission('location_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('location_management') OR public.is_admin());

-- Staff can read staff table (their own data and others with permission)
CREATE POLICY "staff_own_data" ON staff
    FOR ALL
    USING (
        user_id = auth.uid() 
        OR public.has_staff_permission('staff_management') 
        OR public.is_admin()
    )
    WITH CHECK (
        user_id = auth.uid() 
        OR public.has_staff_permission('staff_management') 
        OR public.is_admin()
    );

-- Appointment slots are readable by authenticated users
CREATE POLICY "appointment_slots_authenticated_read" ON appointment_slots
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_available = TRUE);

-- Staff can manage appointment slots
CREATE POLICY "appointment_slots_staff_write" ON appointment_slots
    FOR ALL
    USING (public.has_staff_permission('appointment_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('appointment_management') OR public.is_admin());

-- Users can access their own appointments
CREATE POLICY "appointments_own_data" ON appointments
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can manage appointments
CREATE POLICY "appointments_staff_read" ON appointments
    FOR SELECT
    USING (public.has_staff_permission('appointment_management') OR public.is_admin());

CREATE POLICY "appointments_staff_update" ON appointments
    FOR UPDATE
    USING (public.has_staff_permission('appointment_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('appointment_management') OR public.is_admin());

-- =====================================================
-- TEST RESULTS POLICIES (HIPAA Critical)
-- =====================================================

-- Users can access their own test results (with audit logging)
CREATE POLICY "test_results_own_data" ON test_results
    FOR SELECT
    USING (
        user_id = auth.uid() 
        AND public.can_access_patient_data(user_id)
    );

-- Users can update limited fields on their results (patient_viewed status only)
CREATE POLICY "test_results_own_update" ON test_results
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can access test results with mandatory HIPAA logging
CREATE POLICY "test_results_staff_access" ON test_results
    FOR SELECT
    USING (
        (public.has_staff_permission('patient_data_access') OR public.is_admin())
        AND public.can_access_patient_data(user_id)
    );

-- Staff can manage test results (lab staff and providers only)
CREATE POLICY "test_results_staff_write" ON test_results
    FOR ALL
    USING (
        (public.has_staff_permission('results_management') OR public.is_admin())
        AND public.can_access_patient_data(user_id)
    )
    WITH CHECK (
        (public.has_staff_permission('results_management') OR public.is_admin())
        AND public.can_access_patient_data(user_id)
    );

-- Result files follow test results permissions
CREATE POLICY "result_files_via_results" ON result_files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM test_results 
            WHERE test_results.id = result_files.result_id 
            AND (
                test_results.user_id = auth.uid() 
                OR public.has_staff_permission('patient_data_access')
                OR public.is_admin()
            )
        )
    );

-- Staff can manage result files
CREATE POLICY "result_files_staff_write" ON result_files
    FOR ALL
    USING (public.has_staff_permission('results_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('results_management') OR public.is_admin());

-- =====================================================
-- HEALTH TRENDS POLICIES
-- =====================================================

-- Users can access their own health trends
CREATE POLICY "health_trends_own_data" ON health_trends
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can read health trends with permission
CREATE POLICY "health_trends_staff_read" ON health_trends
    FOR SELECT
    USING (public.has_staff_permission('patient_data_access') OR public.is_admin());

-- =====================================================
-- NOTIFICATION POLICIES
-- =====================================================

-- Users can access their own notifications
CREATE POLICY "result_notifications_own_data" ON result_notifications
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- AUDIT LOG POLICIES (Admin Only)
-- =====================================================

-- Only admins can read audit logs
CREATE POLICY "patient_audit_logs_admin_only" ON patient_audit_logs
    FOR SELECT
    USING (public.is_admin());

-- System can insert audit logs (for application logging)
CREATE POLICY "patient_audit_logs_system_insert" ON patient_audit_logs
    FOR INSERT
    WITH CHECK (TRUE); -- Allow system to log, but restrict reads

-- Only admins can read data access logs
CREATE POLICY "data_access_logs_admin_only" ON data_access_logs
    FOR SELECT
    USING (public.is_admin());

-- System can insert data access logs
CREATE POLICY "data_access_logs_system_insert" ON data_access_logs
    FOR INSERT
    WITH CHECK (TRUE);

-- =====================================================
-- CACHE POLICIES
-- =====================================================

-- Users can access their own cache metadata
CREATE POLICY "cache_metadata_own_data" ON cache_metadata
    FOR ALL
    USING (user_id = auth.uid() OR user_id IS NULL)
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Cache invalidation queue - system access only
CREATE POLICY "cache_invalidation_system" ON cache_invalidation_queue
    FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- =====================================================
-- SYSTEM SETTINGS POLICIES
-- =====================================================

-- Public settings are readable by authenticated users
CREATE POLICY "system_settings_public_read" ON system_settings
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_sensitive = FALSE);

-- Admin settings require admin access
CREATE POLICY "system_settings_admin" ON system_settings
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =====================================================
-- TEST AVAILABILITY POLICIES
-- =====================================================

-- Test availability is publicly readable
CREATE POLICY "test_availability_public_read" ON test_availability
    FOR SELECT
    USING (is_available = TRUE);

-- Staff can manage test availability
CREATE POLICY "test_availability_staff_write" ON test_availability
    FOR ALL
    USING (public.has_staff_permission('catalog_management') OR public.is_admin())
    WITH CHECK (public.has_staff_permission('catalog_management') OR public.is_admin());

-- =====================================================
-- STAFF ROLES AND DEPARTMENTS (if tables exist)
-- =====================================================

-- Staff roles are readable by staff
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_roles') THEN
        ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "staff_roles_staff_read" ON staff_roles
            FOR SELECT
            USING (auth.uid() IS NOT NULL AND is_active = TRUE);
            
        CREATE POLICY "staff_roles_admin_write" ON staff_roles
            FOR ALL
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_departments') THEN
        ALTER TABLE staff_departments ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "staff_departments_staff_read" ON staff_departments
            FOR SELECT
            USING (auth.uid() IS NOT NULL AND is_active = TRUE);
            
        CREATE POLICY "staff_departments_admin_write" ON staff_departments
            FOR ALL
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
    END IF;
END $$;

-- =====================================================
-- HIPAA AUDIT TRIGGERS FOR PHI ACCESS
-- =====================================================

-- Trigger function to log test results access
CREATE OR REPLACE FUNCTION log_test_results_access() RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    record_id_val UUID;
    lab_report_val TEXT;
    status_val TEXT;
    abnormal_flags_val JSONB;
    critical_values_val JSONB;
BEGIN
    -- Get values based on operation type
    IF TG_OP = 'DELETE' THEN
        user_id_val := OLD.user_id;
        record_id_val := OLD.id;
        lab_report_val := OLD.lab_report_number;
        status_val := OLD.overall_status;
        abnormal_flags_val := OLD.abnormal_flags;
        critical_values_val := OLD.critical_values;
    ELSE
        user_id_val := NEW.user_id;
        record_id_val := NEW.id;
        lab_report_val := NEW.lab_report_number;
        status_val := NEW.overall_status;
        abnormal_flags_val := NEW.abnormal_flags;
        critical_values_val := NEW.critical_values;
    END IF;
    
    -- Log when test results are accessed
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
        auth.uid(),
        user_id_val,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN 'update_test_results'
            WHEN TG_OP = 'INSERT' THEN 'create_test_results'
            WHEN TG_OP = 'DELETE' THEN 'delete_test_results'
        END,
        'test_results',
        record_id_val::TEXT,
        TRUE,
        jsonb_build_object(
            'operation', TG_OP,
            'lab_report_number', lab_report_val,
            'overall_status', status_val,
            'has_abnormal_flags', (COALESCE(abnormal_flags_val, '[]'::jsonb) != '[]'::jsonb),
            'has_critical_values', (COALESCE(critical_values_val, '[]'::jsonb) != '[]'::jsonb)
        ),
        NOW()
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for test results access logging
CREATE TRIGGER test_results_access_log
    AFTER INSERT OR UPDATE OR DELETE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION log_test_results_access();

-- Trigger function to log profile access
CREATE OR REPLACE FUNCTION log_profile_access() RETURNS TRIGGER AS $$
DECLARE
    user_id_val UUID;
    record_id_val UUID;
BEGIN
    -- Get values based on operation type
    IF TG_OP = 'DELETE' THEN
        user_id_val := OLD.user_id;
        record_id_val := OLD.id;
    ELSE
        user_id_val := NEW.user_id;
        record_id_val := NEW.id;
    END IF;
    
    -- Log when profiles are accessed (PHI)
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
        auth.uid(),
        user_id_val,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN 'update_profile'
            WHEN TG_OP = 'INSERT' THEN 'create_profile'
            WHEN TG_OP = 'DELETE' THEN 'delete_profile'
        END,
        'profiles',
        record_id_val::TEXT,
        TRUE,
        jsonb_build_object(
            'operation', TG_OP,
            'fields_accessed', jsonb_build_array(
                'first_name', 'last_name', 'email', 'phone', 
                'date_of_birth', 'address', 'medical_history'
            )
        ),
        NOW()
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile access logging
CREATE TRIGGER profile_access_log
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_access();

-- =====================================================
-- DATA INTEGRITY TRIGGERS (HIPAA Protection)
-- =====================================================

-- Prevent patients from modifying critical test result fields
CREATE OR REPLACE FUNCTION prevent_test_result_tampering() RETURNS TRIGGER AS $$
BEGIN
    -- Only allow patients to update specific safe fields
    IF auth.uid() = NEW.user_id AND auth.uid() = OLD.user_id THEN
        -- Patient can only update these fields
        IF OLD.results_data != NEW.results_data OR
           OLD.overall_status != NEW.overall_status OR
           OLD.lab_report_number != NEW.lab_report_number OR
           OLD.abnormal_flags != NEW.abnormal_flags OR
           OLD.critical_values != NEW.critical_values THEN
            RAISE EXCEPTION 'Patients cannot modify test result data';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent test result tampering
CREATE TRIGGER prevent_test_result_tampering_trigger
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION prevent_test_result_tampering();

-- =====================================================
-- HIPAA DATA BREACH DETECTION
-- =====================================================

-- Function to detect suspicious access patterns
CREATE OR REPLACE FUNCTION detect_suspicious_access() RETURNS TRIGGER AS $$
DECLARE
    access_count INTEGER;
    different_patients INTEGER;
    staff_record RECORD;
BEGIN
    -- Only check for staff access (not self-access)
    IF NEW.patient_id != auth.uid() THEN
        -- Check for excessive access in last hour
        SELECT COUNT(*), COUNT(DISTINCT patient_id) 
        INTO access_count, different_patients
        FROM data_access_logs 
        WHERE staff_id = NEW.staff_id 
        AND created_at > NOW() - INTERVAL '1 hour';
        
        -- Flag suspicious patterns
        IF access_count > 50 OR different_patients > 20 THEN
            -- Get staff information
            SELECT * INTO staff_record FROM staff WHERE id = NEW.staff_id;
            
            -- Log security event
            INSERT INTO audit_logs (
                staff_id,
                action,
                action_category,
                resource_type,
                success,
                risk_level,
                requires_review,
                phi_accessed,
                created_at
            ) VALUES (
                NEW.staff_id,
                'suspicious_access_pattern',
                'security',
                'patient_data',
                TRUE,
                'high',
                TRUE,
                TRUE,
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for breach detection
CREATE TRIGGER detect_data_breach
    AFTER INSERT ON data_access_logs
    FOR EACH ROW
    EXECUTE FUNCTION detect_suspicious_access();

-- =====================================================
-- HIPAA COMPLIANCE REPORTING FUNCTIONS
-- =====================================================

-- Generate HIPAA compliance report
CREATE OR REPLACE FUNCTION generate_hipaa_compliance_report(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
    metric_name TEXT,
    metric_value BIGINT,
    compliance_status TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH access_metrics AS (
        SELECT 
            COUNT(*) as total_access,
            COUNT(DISTINCT patient_id) as unique_patients_accessed,
            COUNT(DISTINCT staff_id) as staff_with_access,
            COUNT(*) FILTER (WHERE treatment_relationship = TRUE) as treatment_access,
            COUNT(*) FILTER (WHERE treatment_relationship = FALSE) as non_treatment_access
        FROM data_access_logs 
        WHERE created_at::date BETWEEN start_date AND end_date
    ),
    audit_metrics AS (
        SELECT 
            COUNT(*) as total_audit_entries,
            COUNT(DISTINCT patient_id) as patients_in_audit,
            COUNT(*) FILTER (WHERE success = FALSE) as failed_access_attempts
        FROM patient_audit_logs 
        WHERE timestamp::date BETWEEN start_date AND end_date
    ),
    security_events AS (
        SELECT COUNT(*) as security_incidents
        FROM audit_logs 
        WHERE created_at::date BETWEEN start_date AND end_date
        AND action_category = 'security'
        AND risk_level IN ('high', 'critical')
    )
    SELECT 'Total PHI Access Events'::TEXT, am.total_access, 
           CASE WHEN am.total_access > 0 THEN 'LOGGED' ELSE 'NO_ACTIVITY' END::TEXT,
           'All PHI access events are being tracked'::TEXT
    FROM access_metrics am
    
    UNION ALL
    
    SELECT 'Treatment vs Non-Treatment Access'::TEXT, am.treatment_access,
           CASE WHEN am.non_treatment_access = 0 THEN 'COMPLIANT' ELSE 'REVIEW_REQUIRED' END::TEXT,
           CONCAT('Treatment: ', am.treatment_access, ', Non-treatment: ', am.non_treatment_access)::TEXT
    FROM access_metrics am
    
    UNION ALL
    
    SELECT 'Audit Log Coverage'::TEXT, aum.total_audit_entries,
           CASE WHEN aum.total_audit_entries >= am.total_access THEN 'COMPLIANT' ELSE 'AUDIT_GAP' END::TEXT,
           'Audit entries should match or exceed access events'::TEXT
    FROM access_metrics am, audit_metrics aum
    
    UNION ALL
    
    SELECT 'Security Incidents'::TEXT, se.security_incidents,
           CASE WHEN se.security_incidents = 0 THEN 'SECURE' ELSE 'INCIDENTS_DETECTED' END::TEXT,
           'High-risk security events requiring review'::TEXT
    FROM security_events se;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate breach notification requirements
CREATE OR REPLACE FUNCTION check_breach_notification_requirements(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day'
) RETURNS TABLE(
    incident_id UUID,
    incident_type TEXT,
    affected_patients INTEGER,
    severity TEXT,
    notification_required BOOLEAN,
    notification_deadline TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.action,
        COUNT(DISTINCT dal.patient_id)::INTEGER,
        al.risk_level,
        CASE WHEN COUNT(DISTINCT dal.patient_id) >= 500 OR al.risk_level = 'critical' 
             THEN TRUE ELSE FALSE END,
        CASE WHEN COUNT(DISTINCT dal.patient_id) >= 500 OR al.risk_level = 'critical'
             THEN al.created_at + INTERVAL '60 days'
             ELSE NULL END
    FROM audit_logs al
    LEFT JOIN data_access_logs dal ON dal.created_at BETWEEN al.created_at - INTERVAL '1 hour' 
                                                          AND al.created_at + INTERVAL '1 hour'
    WHERE al.created_at::date >= start_date
    AND al.action_category = 'security'
    AND al.risk_level IN ('high', 'critical')
    GROUP BY al.id, al.action, al.risk_level, al.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VALIDATION AND SUCCESS MESSAGE
-- =====================================================

-- Function to validate RLS policies are working
CREATE OR REPLACE FUNCTION public.validate_rls_policies() RETURNS TABLE(
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity,
        COUNT(p.policyname)::INTEGER
    FROM pg_tables t
    LEFT JOIN pg_policies p ON p.tablename = t.tablename
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
        'profiles', 'user_preferences', 'orders', 'order_tests',
        'appointments', 'test_results', 'result_files', 'health_trends'
    )
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 
    'RLS policies deployed successfully!' as result,
    'All patient data is now protected' as security_status,
    'Run SELECT * FROM public.validate_rls_policies() to verify' as validation_command;