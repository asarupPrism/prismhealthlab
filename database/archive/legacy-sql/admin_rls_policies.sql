-- ================================================================
-- PRISM HEALTH LAB - ROW LEVEL SECURITY POLICIES
-- ================================================================
-- HIPAA-compliant Row Level Security policies for admin dashboard
-- Ensures proper access control and data protection
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swell_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swell_product_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- HELPER FUNCTIONS FOR RLS
-- ================================================================

-- Function to get current user's staff record
CREATE OR REPLACE FUNCTION get_current_staff()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT s.id 
        FROM public.staff s 
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        JOIN public.staff_roles r ON s.role_id = r.id
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND s.can_access_admin = true
        AND r.is_admin_role = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND (
            permission_name = ANY(s.permissions) OR
            s.can_access_admin = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access location
CREATE OR REPLACE FUNCTION can_access_location(location_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND (
            location_id::text = ANY(s.location_access::text[]) OR
            s.can_access_admin = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access patient data
CREATE OR REPLACE FUNCTION can_access_patient_data(patient_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Users can always access their own data
    IF patient_user_id = auth.uid() THEN
        RETURN true;
    END IF;
    
    -- Staff with appropriate permissions can access patient data
    RETURN has_permission('view_patient_data') OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PROFILES TABLE POLICIES
-- ================================================================

-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Staff can view patient profiles based on permissions
CREATE POLICY "Staff can view patient profiles" ON public.profiles
    FOR SELECT USING (
        can_access_patient_data(user_id) OR
        has_permission('view_users')
    );

-- Admins can manage all profiles
CREATE POLICY "Admins can manage profiles" ON public.profiles
    FOR ALL USING (is_admin());

-- ================================================================
-- USER PREFERENCES POLICIES
-- ================================================================

-- Users can manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (
        user_id = auth.uid() OR
        can_access_patient_data(user_id)
    );

-- ================================================================
-- STAFF MANAGEMENT POLICIES
-- ================================================================

-- Staff departments - read access for staff, full access for admins
CREATE POLICY "Staff can view departments" ON public.staff_departments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "Admins can manage departments" ON public.staff_departments
    FOR ALL USING (is_admin());

-- Staff roles - similar access pattern
CREATE POLICY "Staff can view roles" ON public.staff_roles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "Admins can manage roles" ON public.staff_roles
    FOR ALL USING (is_admin());

-- Staff table - users can view their own record, admins can manage all
CREATE POLICY "Staff can view their own record" ON public.staff
    FOR SELECT USING (
        user_id = auth.uid() OR
        has_permission('manage_staff') OR
        is_admin()
    );

CREATE POLICY "Admins can manage staff" ON public.staff
    FOR ALL USING (
        has_permission('manage_staff') OR
        is_admin()
    );

-- ================================================================
-- LOCATION POLICIES
-- ================================================================

-- Public read access to active locations
CREATE POLICY "Public can view active locations" ON public.locations
    FOR SELECT USING (is_active = true);

-- Staff can view all locations they have access to
CREATE POLICY "Staff can view accessible locations" ON public.locations
    FOR SELECT USING (
        can_access_location(id) OR
        has_permission('view_locations')
    );

-- Admins can manage all locations
CREATE POLICY "Admins can manage locations" ON public.locations
    FOR ALL USING (is_admin());

-- ================================================================
-- TEST CATALOG POLICIES
-- ================================================================

-- Public read access to active test categories and tests
CREATE POLICY "Public can view active test categories" ON public.test_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active diagnostic tests" ON public.diagnostic_tests
    FOR SELECT USING (is_active = true);

-- Staff can view all tests for admin purposes
CREATE POLICY "Staff can view all tests" ON public.diagnostic_tests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND is_active = true)
    );

-- Admins can manage test catalog
CREATE POLICY "Admins can manage test catalog" ON public.test_categories
    FOR ALL USING (has_permission('manage_tests') OR is_admin());

CREATE POLICY "Admins can manage diagnostic tests" ON public.diagnostic_tests
    FOR ALL USING (has_permission('manage_tests') OR is_admin());

CREATE POLICY "Staff can view test pricing" ON public.test_pricing
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "Admins can manage test pricing" ON public.test_pricing
    FOR ALL USING (has_permission('manage_pricing') OR is_admin());

-- ================================================================
-- ORDER MANAGEMENT POLICIES
-- ================================================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        user_id = auth.uid() OR
        can_access_patient_data(user_id) OR
        has_permission('view_orders')
    );

-- Staff can view orders based on permissions
CREATE POLICY "Staff can view orders" ON public.orders
    FOR SELECT USING (
        has_permission('view_orders') OR
        is_admin()
    );

-- Staff can update orders based on permissions
CREATE POLICY "Staff can update orders" ON public.orders
    FOR UPDATE USING (
        has_permission('process_orders') OR
        is_admin()
    );

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON public.orders
    FOR ALL USING (is_admin());

-- Order status history - similar pattern
CREATE POLICY "Staff can view order history" ON public.order_status_history
    FOR SELECT USING (
        has_permission('view_orders') OR
        is_admin()
    );

CREATE POLICY "Staff can add order history" ON public.order_status_history
    FOR INSERT WITH CHECK (
        has_permission('process_orders') OR
        is_admin()
    );

-- ================================================================
-- APPOINTMENT POLICIES
-- ================================================================

-- Users can view their own appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (
        user_id = auth.uid() OR
        can_access_patient_data(user_id) OR
        has_permission('view_appointments')
    );

-- Staff can view appointments they're assigned to or have permission
CREATE POLICY "Staff can view appointments" ON public.appointments
    FOR SELECT USING (
        assigned_staff_id = get_current_staff() OR
        has_permission('view_appointments') OR
        is_admin()
    );

-- Staff can manage appointments based on permissions
CREATE POLICY "Staff can manage appointments" ON public.appointments
    FOR ALL USING (
        has_permission('edit_appointments') OR
        assigned_staff_id = get_current_staff() OR
        is_admin()
    );

-- Appointment slots - staff can view and manage
CREATE POLICY "Staff can view appointment slots" ON public.appointment_slots
    FOR SELECT USING (
        can_access_location(location_id) OR
        assigned_staff_id = get_current_staff() OR
        has_permission('view_appointments')
    );

CREATE POLICY "Staff can manage appointment slots" ON public.appointment_slots
    FOR ALL USING (
        has_permission('manage_schedule') OR
        assigned_staff_id = get_current_staff() OR
        is_admin()
    );

-- ================================================================
-- TEST RESULTS POLICIES (STRICT PHI PROTECTION)
-- ================================================================

-- Users can view their own test results
CREATE POLICY "Users can view their own test results" ON public.test_results
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Staff can view test results with proper permissions and logging
CREATE POLICY "Staff can view test results" ON public.test_results
    FOR SELECT USING (
        has_permission('view_results') OR
        reviewed_by = get_current_staff() OR
        is_admin()
    );

-- Only authorized staff can modify test results
CREATE POLICY "Authorized staff can manage test results" ON public.test_results
    FOR ALL USING (
        has_permission('upload_results') OR
        has_permission('approve_results') OR
        is_admin()
    );

-- Result files - similar restrictions
CREATE POLICY "Users can view their own result files" ON public.result_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_results tr
            WHERE tr.id = result_id AND tr.user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view result files" ON public.result_files
    FOR SELECT USING (
        has_permission('view_results') OR
        is_admin()
    );

CREATE POLICY "Authorized staff can manage result files" ON public.result_files
    FOR ALL USING (
        has_permission('upload_results') OR
        is_admin()
    );

-- ================================================================
-- AUDIT AND COMPLIANCE POLICIES
-- ================================================================

-- Audit logs - strict access control
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        has_permission('audit_logs') OR
        is_admin()
    );

-- System can insert audit logs (no user restrictions)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- System events - admin access only
CREATE POLICY "Admins can view system events" ON public.system_events
    FOR SELECT USING (
        has_permission('system_config') OR
        is_admin()
    );

CREATE POLICY "System can manage system events" ON public.system_events
    FOR ALL USING (
        has_permission('system_config') OR
        is_admin()
    );

-- Data access logs - audit access only
CREATE POLICY "Admins can view data access logs" ON public.data_access_logs
    FOR SELECT USING (
        has_permission('audit_logs') OR
        is_admin()
    );

CREATE POLICY "System can insert data access logs" ON public.data_access_logs
    FOR INSERT WITH CHECK (true);

-- ================================================================
-- SWELL INTEGRATION POLICIES
-- ================================================================

-- Swell sync logs - admin access
CREATE POLICY "Admins can view swell sync logs" ON public.swell_sync_log
    FOR SELECT USING (
        has_permission('manage_inventory') OR
        is_admin()
    );

CREATE POLICY "System can manage swell sync logs" ON public.swell_sync_log
    FOR ALL USING (
        has_permission('manage_inventory') OR
        is_admin()
    );

-- Product mapping - admin access
CREATE POLICY "Admins can manage product mapping" ON public.swell_product_mapping
    FOR ALL USING (
        has_permission('manage_inventory') OR
        is_admin()
    );

-- Inventory alerts - staff can view, admins can manage
CREATE POLICY "Staff can view inventory alerts" ON public.inventory_alerts
    FOR SELECT USING (
        has_permission('manage_inventory') OR
        is_admin()
    );

CREATE POLICY "Admins can manage inventory alerts" ON public.inventory_alerts
    FOR ALL USING (
        has_permission('manage_inventory') OR
        is_admin()
    );

-- ================================================================
-- NOTIFICATION POLICIES
-- ================================================================

-- Notification templates - admin access
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
    FOR ALL USING (
        has_permission('system_config') OR
        is_admin()
    );

-- Notification queue - system and admin access
CREATE POLICY "System can manage notification queue" ON public.notification_queue
    FOR ALL USING (
        has_permission('system_config') OR
        is_admin()
    );

-- ================================================================
-- REPORTING AND ANALYTICS POLICIES
-- ================================================================

-- Business metrics - admin and manager access
CREATE POLICY "Managers can view business metrics" ON public.business_metrics
    FOR SELECT USING (
        has_permission('view_analytics') OR
        is_admin()
    );

CREATE POLICY "Admins can manage business metrics" ON public.business_metrics
    FOR ALL USING (
        has_permission('view_analytics') OR
        is_admin()
    );

-- ================================================================
-- SYSTEM CONFIGURATION POLICIES
-- ================================================================

-- System settings - admin access only
CREATE POLICY "Admins can view system settings" ON public.system_settings
    FOR SELECT USING (
        has_permission('system_config') OR
        is_admin()
    );

CREATE POLICY "Admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        has_permission('system_config') OR
        is_admin()
    );

-- ================================================================
-- AUDIT TRIGGER FUNCTIONS
-- ================================================================

-- Function to log data access for PHI compliance
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log SELECT operations on sensitive tables
    IF TG_OP = 'SELECT' AND TG_TABLE_NAME IN ('test_results', 'result_files', 'profiles') THEN
        INSERT INTO public.data_access_logs (
            user_id,
            staff_id,
            resource_type,
            resource_id,
            access_type,
            ip_address
        ) VALUES (
            auth.uid(),
            get_current_staff(),
            TG_TABLE_NAME,
            COALESCE(NEW.id::text, OLD.id::text),
            'view',
            inet_client_addr()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log all administrative actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        staff_id,
        action,
        action_category,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        phi_accessed
    ) VALUES (
        auth.uid(),
        get_current_staff(),
        TG_OP,
        'data_modification',
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr(),
        TG_TABLE_NAME IN ('test_results', 'result_files', 'profiles', 'appointments')
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- CREATE AUDIT TRIGGERS
-- ================================================================

-- Audit triggers for sensitive tables
CREATE TRIGGER audit_test_results
    AFTER INSERT OR UPDATE OR DELETE ON public.test_results
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_result_files
    AFTER INSERT OR UPDATE OR DELETE ON public.result_files
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_staff
    AFTER INSERT OR UPDATE OR DELETE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- ================================================================
-- SECURITY FUNCTIONS FOR APPLICATION USE
-- ================================================================

-- Function to safely check user permissions from application
CREATE OR REPLACE FUNCTION check_user_permission(permission_name TEXT)
RETURNS TABLE(has_permission BOOLEAN, user_role TEXT, department TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (permission_name = ANY(s.permissions) OR s.can_access_admin = true) as has_permission,
        sr.name as user_role,
        sd.name as department
    FROM public.staff s
    LEFT JOIN public.staff_roles sr ON s.role_id = sr.id
    LEFT JOIN public.staff_departments sd ON s.department_id = sd.id
    WHERE s.user_id = auth.uid() AND s.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's admin context
CREATE OR REPLACE FUNCTION get_admin_context()
RETURNS TABLE(
    staff_id UUID,
    role_name TEXT,
    department_name TEXT,
    permissions JSONB,
    can_access_admin BOOLEAN,
    location_access JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as staff_id,
        sr.name as role_name,
        sd.name as department_name,
        s.permissions,
        s.can_access_admin,
        s.location_access
    FROM public.staff s
    LEFT JOIN public.staff_roles sr ON s.role_id = sr.id
    LEFT JOIN public.staff_departments sd ON s.department_id = sd.id
    WHERE s.user_id = auth.uid() AND s.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON FUNCTION get_current_staff() IS 'Returns the staff ID for the current authenticated user';
COMMENT ON FUNCTION is_admin() IS 'Checks if the current user has admin privileges';
COMMENT ON FUNCTION has_permission(TEXT) IS 'Checks if the current user has a specific permission';
COMMENT ON FUNCTION can_access_location(UUID) IS 'Checks if the current user can access a specific location';
COMMENT ON FUNCTION can_access_patient_data(UUID) IS 'Checks if the current user can access specific patient data';
COMMENT ON FUNCTION log_data_access() IS 'Trigger function to log PHI data access for HIPAA compliance';
COMMENT ON FUNCTION log_admin_action() IS 'Trigger function to log all administrative actions';
COMMENT ON FUNCTION check_user_permission(TEXT) IS 'Application-safe function to check user permissions';
COMMENT ON FUNCTION get_admin_context() IS 'Returns complete admin context for the current user';

-- ================================================================
-- END OF RLS POLICIES
-- ================================================================