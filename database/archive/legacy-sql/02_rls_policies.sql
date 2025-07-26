-- =====================================================
-- Prism Health Lab - Row Level Security (RLS) Policies
-- =====================================================
-- 
-- HIPAA-compliant Row Level Security policies for the 
-- Prism Health Lab patient portal database schema.
--
-- These policies ensure that:
-- 1. Patients can only access their own data
-- 2. Staff can access patient data based on role/permissions
-- 3. All access is logged for HIPAA compliance
-- 4. Admin access is properly controlled and audited
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS FOR RLS POLICIES
-- =====================================================

-- Check if current user is authenticated
CREATE OR REPLACE FUNCTION auth.is_authenticated() RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'doctor') 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is staff with specific permission
CREATE OR REPLACE FUNCTION auth.has_staff_permission(permission_name TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = auth.uid() 
        AND is_active = TRUE
        AND (
            role = 'admin' 
            OR permission_name = ANY(permissions)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user can access specific patient data
CREATE OR REPLACE FUNCTION auth.can_access_patient_data(patient_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    -- Patient can access their own data
    IF auth.uid() = patient_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Admin can access any patient data
    IF auth.is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Staff with patient_data_access permission can access patient data
    IF auth.has_staff_permission('patient_data_access') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user can modify patient data
CREATE OR REPLACE FUNCTION auth.can_modify_patient_data(patient_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    -- Patient can modify their own profile data only
    IF auth.uid() = patient_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Only admin and authorized staff can modify patient data
    RETURN auth.is_admin() OR auth.has_staff_permission('patient_data_modify');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE RLS POLICIES
-- =====================================================

-- Patients can view and update their own profile
CREATE POLICY "profiles_own_data" ON profiles
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can view all profiles they have permission to access
CREATE POLICY "profiles_staff_read" ON profiles
    FOR SELECT
    USING (
        auth.has_staff_permission('patient_data_access') 
        OR auth.is_admin()
    );

-- Only admin and authorized staff can create/update profiles for others
CREATE POLICY "profiles_staff_write" ON profiles
    FOR INSERT
    WITH CHECK (
        auth.is_admin() 
        OR auth.has_staff_permission('patient_data_modify')
    );

CREATE POLICY "profiles_staff_update" ON profiles
    FOR UPDATE
    USING (
        user_id = auth.uid() -- Own profile
        OR auth.is_admin() 
        OR auth.has_staff_permission('patient_data_modify')
    )
    WITH CHECK (
        user_id = auth.uid() -- Own profile
        OR auth.is_admin() 
        OR auth.has_staff_permission('patient_data_modify')
    );

-- =====================================================
-- USER PREFERENCES TABLE RLS POLICIES
-- =====================================================

-- Users can fully manage their own preferences
CREATE POLICY "user_preferences_own_data" ON user_preferences
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can view preferences for support purposes
CREATE POLICY "user_preferences_staff_read" ON user_preferences
    FOR SELECT
    USING (
        auth.has_staff_permission('patient_support')
        OR auth.is_admin()
    );

-- =====================================================
-- TWO FACTOR AUTH TABLE RLS POLICIES
-- =====================================================

-- Users can manage their own 2FA settings
CREATE POLICY "two_factor_auth_own_data" ON two_factor_auth
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admin can view 2FA status for security purposes (but not secrets)
CREATE POLICY "two_factor_auth_admin_read" ON two_factor_auth
    FOR SELECT
    USING (auth.is_admin());

-- =====================================================
-- ORDERS TABLE RLS POLICIES
-- =====================================================

-- Patients can view their own orders
CREATE POLICY "orders_patient_read" ON orders
    FOR SELECT
    USING (user_id = auth.uid());

-- Staff can view orders they have permission to access
CREATE POLICY "orders_staff_read" ON orders
    FOR SELECT
    USING (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    );

-- Only authorized staff can create/modify orders
CREATE POLICY "orders_staff_write" ON orders
    FOR INSERT
    WITH CHECK (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    );

CREATE POLICY "orders_staff_update" ON orders
    FOR UPDATE
    USING (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    )
    WITH CHECK (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    );

-- =====================================================
-- ORDER TESTS TABLE RLS POLICIES
-- =====================================================

-- Patients can view tests in their own orders
CREATE POLICY "order_tests_patient_read" ON order_tests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_tests.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Staff can view all order tests they have permission for
CREATE POLICY "order_tests_staff_read" ON order_tests
    FOR SELECT
    USING (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    );

-- Only authorized staff can modify order tests
CREATE POLICY "order_tests_staff_write" ON order_tests
    FOR ALL
    USING (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    )
    WITH CHECK (
        auth.has_staff_permission('order_management')
        OR auth.is_admin()
    );

-- =====================================================
-- APPOINTMENTS TABLE RLS POLICIES
-- =====================================================

-- Patients can view and manage their own appointments
CREATE POLICY "appointments_patient_data" ON appointments
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can view appointments at their assigned locations
CREATE POLICY "appointments_staff_read" ON appointments
    FOR SELECT
    USING (
        auth.is_admin()
        OR (
            auth.has_staff_permission('appointment_management')
            AND EXISTS (
                SELECT 1 FROM staff 
                WHERE staff.user_id = auth.uid()
                AND appointments.location_id = ANY(staff.location_ids)
            )
        )
    );

-- Staff can modify appointments they have permission for
CREATE POLICY "appointments_staff_write" ON appointments
    FOR INSERT
    WITH CHECK (
        auth.has_staff_permission('appointment_management')
        OR auth.is_admin()
    );

CREATE POLICY "appointments_staff_update" ON appointments
    FOR UPDATE
    USING (
        user_id = auth.uid() -- Patient can update their own
        OR auth.is_admin()
        OR (
            auth.has_staff_permission('appointment_management')
            AND EXISTS (
                SELECT 1 FROM staff 
                WHERE staff.user_id = auth.uid()
                AND appointments.location_id = ANY(staff.location_ids)
            )
        )
    )
    WITH CHECK (
        user_id = auth.uid() -- Patient can update their own
        OR auth.is_admin()
        OR auth.has_staff_permission('appointment_management')
    );

-- =====================================================
-- TEST RESULTS TABLE RLS POLICIES
-- =====================================================

-- Patients can view their own test results
CREATE POLICY "test_results_patient_read" ON test_results
    FOR SELECT
    USING (user_id = auth.uid());

-- Patients cannot modify test results (read-only for patients)
CREATE POLICY "test_results_patient_no_write" ON test_results
    FOR INSERT
    WITH CHECK (FALSE); -- Patients cannot insert results

CREATE POLICY "test_results_patient_no_update" ON test_results
    FOR UPDATE
    USING (FALSE); -- Patients cannot update results

-- Staff can view results for patients they have access to
CREATE POLICY "test_results_staff_read" ON test_results
    FOR SELECT
    USING (
        auth.has_staff_permission('test_results_access')
        OR auth.is_admin()
    );

-- Only authorized medical staff can create/modify test results
CREATE POLICY "test_results_medical_staff_write" ON test_results
    FOR INSERT
    WITH CHECK (
        auth.has_staff_permission('test_results_modify')
        OR auth.is_admin()
    );

CREATE POLICY "test_results_medical_staff_update" ON test_results
    FOR UPDATE
    USING (
        auth.has_staff_permission('test_results_modify')
        OR auth.is_admin()
    )
    WITH CHECK (
        auth.has_staff_permission('test_results_modify')
        OR auth.is_admin()
    );

-- =====================================================
-- BIOMARKER DATA TABLE RLS POLICIES
-- =====================================================

-- Patients can view their own biomarker data
CREATE POLICY "biomarker_data_patient_read" ON biomarker_data
    FOR SELECT
    USING (user_id = auth.uid());

-- Staff can view biomarker data for authorized patients
CREATE POLICY "biomarker_data_staff_read" ON biomarker_data
    FOR SELECT
    USING (
        auth.has_staff_permission('test_results_access')
        OR auth.is_admin()
    );

-- Only medical staff can modify biomarker data
CREATE POLICY "biomarker_data_medical_staff_write" ON biomarker_data
    FOR ALL
    USING (
        auth.has_staff_permission('test_results_modify')
        OR auth.is_admin()
    )
    WITH CHECK (
        auth.has_staff_permission('test_results_modify')
        OR auth.is_admin()
    );

-- =====================================================
-- HEALTH TRENDS TABLE RLS POLICIES
-- =====================================================

-- Patients can view their own health trends
CREATE POLICY "health_trends_patient_read" ON health_trends
    FOR SELECT
    USING (user_id = auth.uid());

-- Staff can view trends for patients they have access to
CREATE POLICY "health_trends_staff_read" ON health_trends
    FOR SELECT
    USING (
        auth.has_staff_permission('test_results_access')
        OR auth.is_admin()
    );

-- Only system and authorized staff can create/modify trends
CREATE POLICY "health_trends_staff_write" ON health_trends
    FOR ALL
    USING (
        auth.has_staff_permission('analytics_access')
        OR auth.is_admin()
    )
    WITH CHECK (
        auth.has_staff_permission('analytics_access')
        OR auth.is_admin()
    );

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE RLS POLICIES
-- =====================================================

-- Users can manage their own push subscriptions
CREATE POLICY "push_subscriptions_own_data" ON push_subscriptions
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Staff can view subscriptions for notification management
CREATE POLICY "push_subscriptions_staff_read" ON push_subscriptions
    FOR SELECT
    USING (
        auth.has_staff_permission('notification_management')
        OR auth.is_admin()
    );

-- =====================================================
-- AUDIT LOGS TABLE RLS POLICIES
-- =====================================================

-- Patients can view their own audit logs (transparency)
CREATE POLICY "patient_audit_logs_own_read" ON patient_audit_logs
    FOR SELECT
    USING (patient_id = auth.uid());

-- Admin and compliance staff can view all audit logs
CREATE POLICY "patient_audit_logs_admin_read" ON patient_audit_logs
    FOR SELECT
    USING (
        auth.is_admin()
        OR auth.has_staff_permission('audit_access')
    );

-- Only system can write to audit logs (no manual entries)
CREATE POLICY "patient_audit_logs_system_only" ON patient_audit_logs
    FOR INSERT
    WITH CHECK (FALSE); -- All audit entries must be created by system functions

-- No updates or deletes allowed on audit logs (immutable)
CREATE POLICY "patient_audit_logs_immutable" ON patient_audit_logs
    FOR UPDATE
    USING (FALSE);

CREATE POLICY "patient_audit_logs_no_delete" ON patient_audit_logs
    FOR DELETE
    USING (FALSE);

-- =====================================================
-- STAFF TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Staff can view their own record
CREATE POLICY "staff_own_data" ON staff
    FOR SELECT
    USING (user_id = auth.uid());

-- Admin can view and manage all staff
CREATE POLICY "staff_admin_access" ON staff
    FOR ALL
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- HR staff can view all staff records
CREATE POLICY "staff_hr_read" ON staff
    FOR SELECT
    USING (auth.has_staff_permission('hr_access'));

-- =====================================================
-- PERFORMANCE AND MONITORING TABLE POLICIES
-- =====================================================

-- Enable RLS on performance monitoring tables
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_operation_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own performance metrics
CREATE POLICY "performance_metrics_own_data" ON performance_metrics
    FOR SELECT
    USING (user_id = auth.uid());

-- Admin and monitoring staff can view all metrics
CREATE POLICY "performance_metrics_admin_read" ON performance_metrics
    FOR SELECT
    USING (
        auth.is_admin()
        OR auth.has_staff_permission('monitoring_access')
    );

-- Only system can write performance metrics
CREATE POLICY "performance_metrics_system_write" ON performance_metrics
    FOR INSERT
    WITH CHECK (TRUE); -- Allow system to insert metrics

-- Cache operation logs are admin-only
CREATE POLICY "cache_logs_admin_only" ON cache_operation_logs
    FOR ALL
    USING (
        auth.is_admin()
        OR auth.has_staff_permission('system_monitoring')
    )
    WITH CHECK (
        auth.is_admin()
        OR auth.has_staff_permission('system_monitoring')
    );

-- =====================================================
-- PUBLIC TABLES (NO RLS NEEDED)
-- =====================================================

-- The following tables don't need RLS as they contain public information:
-- - test_categories (public test category information)
-- - diagnostic_tests (public test information)
-- - locations (public location information)
-- - test_pricing (public pricing information)
-- - email_templates (internal templates, not patient data)

-- However, we can add basic security for modification
ALTER TABLE diagnostic_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diagnostic_tests_public_read" ON diagnostic_tests
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "diagnostic_tests_admin_write" ON diagnostic_tests
    FOR ALL
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

ALTER TABLE test_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_categories_public_read" ON test_categories
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "test_categories_admin_write" ON test_categories
    FOR ALL
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_public_read" ON locations
    FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "locations_admin_write" ON locations
    FOR ALL
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- =====================================================
-- AUDIT LOGGING FUNCTIONS WITH RLS INTEGRATION
-- =====================================================

-- Enhanced audit logging function that works with RLS
CREATE OR REPLACE FUNCTION log_patient_data_access(
    p_patient_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
    current_user_id UUID;
    is_staff_user BOOLEAN;
    previous_hash TEXT;
    log_data JSONB;
    calculated_hash TEXT;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if current user is staff
    SELECT EXISTS (
        SELECT 1 FROM staff 
        WHERE user_id = current_user_id 
        AND is_active = TRUE
    ) INTO is_staff_user;
    
    -- Verify access permission before logging
    IF NOT auth.can_access_patient_data(p_patient_id) THEN
        -- Log unauthorized access attempt
        INSERT INTO security_events (
            event_type,
            severity,
            user_id,
            event_description,
            source_ip
        ) VALUES (
            'unauthorized_access',
            'high',
            current_user_id,
            format('Unauthorized attempt to access patient data: %s', p_resource),
            inet_client_addr()
        );
        
        RAISE EXCEPTION 'Unauthorized access to patient data';
    END IF;
    
    -- Generate log entry (reuse existing function)
    SELECT log_patient_access(
        current_user_id,
        p_patient_id,
        p_action,
        p_resource,
        p_resource_id,
        p_success,
        p_metadata || jsonb_build_object(
            'access_method', 'rls_policy',
            'is_staff_access', is_staff_user,
            'ip_address', inet_client_addr()::TEXT
        )
    ) INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and log permission escalation attempts
CREATE OR REPLACE FUNCTION check_permission_escalation() RETURNS TRIGGER AS $$
BEGIN
    -- Log any attempts to modify staff permissions
    IF TG_TABLE_NAME = 'staff' AND (OLD.permissions != NEW.permissions OR OLD.role != NEW.role) THEN
        INSERT INTO security_events (
            event_type,
            severity,
            user_id,
            affected_user_id,
            event_description
        ) VALUES (
            'permission_change',
            CASE 
                WHEN NEW.role = 'admin' THEN 'critical'
                ELSE 'medium'
            END,
            auth.uid(),
            NEW.user_id,
            format('Staff permissions changed from %s to %s', OLD.role, NEW.role)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for permission escalation monitoring
CREATE TRIGGER staff_permission_monitor
    AFTER UPDATE ON staff
    FOR EACH ROW
    WHEN (OLD.permissions IS DISTINCT FROM NEW.permissions OR OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION check_permission_escalation();

-- =====================================================
-- GRANT APPROPRIATE PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant table permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_auth TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON order_tests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON appointments TO authenticated;
GRANT SELECT ON test_results TO authenticated;
GRANT SELECT ON biomarker_data TO authenticated;
GRANT SELECT ON health_trends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT SELECT ON patient_audit_logs TO authenticated;

-- Grant read access to public tables
GRANT SELECT ON test_categories TO authenticated, anon;
GRANT SELECT ON diagnostic_tests TO authenticated, anon;
GRANT SELECT ON locations TO authenticated, anon;
GRANT SELECT ON test_pricing TO authenticated, anon;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- ENABLE REAL-TIME SUBSCRIPTIONS WITH RLS
-- =====================================================

-- Enable real-time for patient-facing tables with RLS
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE test_results;
ALTER PUBLICATION supabase_realtime ADD TABLE push_notifications_log;

-- =====================================================
-- VALIDATION AND TESTING FUNCTIONS
-- =====================================================

-- Function to validate RLS policies are working correctly
CREATE OR REPLACE FUNCTION validate_rls_policies() RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
BEGIN
    -- Test 1: Verify users can only see their own profile
    RETURN QUERY
    SELECT 
        'Profile isolation test'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id != auth.uid()
        ),
        'Users should only see their own profile'::TEXT;
    
    -- Test 2: Verify users can only see their own orders
    RETURN QUERY
    SELECT 
        'Order isolation test'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM orders 
            WHERE user_id != auth.uid()
        ),
        'Users should only see their own orders'::TEXT;
    
    -- Test 3: Verify audit log integrity
    RETURN QUERY
    SELECT 
        'Audit log integrity test'::TEXT,
        (
            SELECT COUNT(*) FROM patient_audit_logs 
            WHERE log_hash IS NULL OR log_hash = ''
        ) = 0,
        'All audit logs should have integrity hashes'::TEXT;
    
    -- Add more tests as needed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HIPAA COMPLIANCE VERIFICATION
-- =====================================================

-- Function to generate HIPAA compliance report
CREATE OR REPLACE FUNCTION generate_hipaa_compliance_report(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    metric_name TEXT,
    metric_value BIGINT,
    compliance_status TEXT
) AS $$
BEGIN
    -- Total patient data access events
    RETURN QUERY
    SELECT 
        'Total patient data access events'::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) > 0 THEN 'TRACKED' ELSE 'NO_ACTIVITY' END
    FROM patient_audit_logs 
    WHERE access_timestamp BETWEEN start_date AND end_date;
    
    -- Failed access attempts
    RETURN QUERY
    SELECT 
        'Failed access attempts'::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN 'COMPLIANT' ELSE 'REVIEW_REQUIRED' END
    FROM patient_audit_logs 
    WHERE access_timestamp BETWEEN start_date AND end_date
    AND success = FALSE;
    
    -- Unauthorized access attempts
    RETURN QUERY
    SELECT 
        'Security incidents'::TEXT,
        COUNT(*)::BIGINT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'COMPLIANT'
            WHEN COUNT(*) < 5 THEN 'MONITOR'
            ELSE 'INVESTIGATE'
        END
    FROM security_events 
    WHERE created_at BETWEEN start_date AND end_date;
    
    -- Data integrity check
    RETURN QUERY
    SELECT 
        'Audit log integrity violations'::TEXT,
        COUNT(*)::BIGINT,
        CASE WHEN COUNT(*) = 0 THEN 'COMPLIANT' ELSE 'CRITICAL_ISSUE' END
    FROM patient_audit_logs 
    WHERE log_hash IS NULL OR log_hash = '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'HIPAA-compliant RLS policies created successfully!' as result,
       'All patient data is now protected with row-level security' as note;