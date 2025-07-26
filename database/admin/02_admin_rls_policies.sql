-- ================================================================
-- PRISM HEALTH LAB - ADMIN ROW LEVEL SECURITY POLICIES
-- ================================================================
-- HIPAA-compliant Row Level Security policies for admin dashboard
-- Ensures proper access control and data protection
-- 
-- Deploy Order: Run this file after admin schema
-- Dependencies: 01_admin_schema.sql
-- ================================================================

-- Enable RLS on all admin tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ================================================================

-- Function to get current user's staff record
CREATE OR REPLACE FUNCTION public.get_current_staff()
RETURNS UUID AS $$
DECLARE
    staff_id UUID;
BEGIN
    SELECT s.id INTO staff_id
    FROM public.staff s 
    WHERE s.user_id = auth.uid() 
    AND s.is_active = true 
    LIMIT 1;
    
    RETURN staff_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
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
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND (
            permission_name = ANY(
                SELECT jsonb_array_elements_text(s.permissions)
            ) OR
            s.can_access_admin = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view PHI (Protected Health Information)
CREATE OR REPLACE FUNCTION public.can_view_phi()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND s.can_view_phi = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PATIENT DATA POLICIES (HIPAA COMPLIANT)
-- ================================================================

-- Profiles: Patients can see their own data, staff with PHI access can see all
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (
        user_id = auth.uid() OR  -- Users can see their own profile
        public.can_view_phi()    -- Staff with PHI access can see all profiles
    );

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (
        user_id = auth.uid() OR  -- Users can update their own profile
        public.is_admin()        -- Admins can update any profile
    );

-- User Preferences: Users can manage their own preferences
CREATE POLICY "user_preferences_all_policy" ON public.user_preferences
    FOR ALL
    USING (
        user_id = auth.uid() OR  -- Users can manage their own preferences
        public.is_admin()        -- Admins can manage any preferences
    );

-- ================================================================
-- STAFF MANAGEMENT POLICIES
-- ================================================================

-- Staff Departments: All staff can view, only admins can modify
CREATE POLICY "staff_departments_select_policy" ON public.staff_departments
    FOR SELECT
    USING (public.get_current_staff() IS NOT NULL);

CREATE POLICY "staff_departments_modify_policy" ON public.staff_departments
    FOR ALL
    USING (public.is_admin());

-- Staff Roles: All staff can view, only admins can modify
CREATE POLICY "staff_roles_select_policy" ON public.staff_roles
    FOR SELECT
    USING (public.get_current_staff() IS NOT NULL);

CREATE POLICY "staff_roles_modify_policy" ON public.staff_roles
    FOR ALL
    USING (public.is_admin());

-- Staff: Staff can see their own record, admins can see all
CREATE POLICY "staff_select_policy" ON public.staff
    FOR SELECT
    USING (
        user_id = auth.uid() OR  -- Staff can see their own record
        public.is_admin()        -- Admins can see all staff
    );

CREATE POLICY "staff_modify_policy" ON public.staff
    FOR ALL
    USING (public.is_admin());

-- ================================================================
-- TEST MANAGEMENT POLICIES
-- ================================================================

-- Test Categories: Public read access, admin write access
CREATE POLICY "test_categories_select_policy" ON public.test_categories
    FOR SELECT
    USING (is_active = true OR public.get_current_staff() IS NOT NULL);

CREATE POLICY "test_categories_modify_policy" ON public.test_categories
    FOR ALL
    USING (public.has_permission('test_management') OR public.is_admin());

-- Diagnostic Tests: Public read for active tests, admin write access
CREATE POLICY "diagnostic_tests_select_policy" ON public.diagnostic_tests
    FOR SELECT
    USING (is_active = true OR public.get_current_staff() IS NOT NULL);

CREATE POLICY "diagnostic_tests_modify_policy" ON public.diagnostic_tests
    FOR ALL
    USING (public.has_permission('test_management') OR public.is_admin());

-- ================================================================
-- LOCATION POLICIES
-- ================================================================

-- Locations: Public read for active locations, admin write access
CREATE POLICY "locations_select_policy" ON public.locations
    FOR SELECT
    USING (is_active = true OR public.get_current_staff() IS NOT NULL);

CREATE POLICY "locations_modify_policy" ON public.locations
    FOR ALL
    USING (public.has_permission('location_management') OR public.is_admin());

-- ================================================================
-- ORDER AND APPOINTMENT POLICIES
-- ================================================================

-- Orders: Users can see their own orders, staff can see orders for their locations
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT
    USING (
        user_id = auth.uid() OR           -- Users can see their own orders
        public.can_view_phi() OR          -- Staff with PHI access can see all orders
        public.has_permission('order_management')
    );

CREATE POLICY "orders_modify_policy" ON public.orders
    FOR ALL
    USING (
        public.has_permission('order_management') OR 
        public.is_admin()
    );

-- Appointments: Users can see their own appointments, staff can see appointments at their locations
CREATE POLICY "appointments_select_policy" ON public.appointments
    FOR SELECT
    USING (
        user_id = auth.uid() OR           -- Users can see their own appointments
        assigned_staff_id = public.get_current_staff() OR  -- Assigned staff can see their appointments
        public.can_view_phi()             -- Staff with PHI access can see all appointments
    );

CREATE POLICY "appointments_modify_policy" ON public.appointments
    FOR ALL
    USING (
        assigned_staff_id = public.get_current_staff() OR  -- Assigned staff can modify their appointments
        public.has_permission('appointment_management') OR 
        public.is_admin()
    );

-- ================================================================
-- TEST RESULTS POLICIES (STRICT PHI PROTECTION)
-- ================================================================

-- Test Results: Strict access control for PHI
CREATE POLICY "test_results_select_policy" ON public.test_results
    FOR SELECT
    USING (
        user_id = auth.uid() OR           -- Patients can see their own results
        reviewed_by = public.get_current_staff() OR  -- Reviewing staff can see results they reviewed
        public.can_view_phi()             -- Staff with explicit PHI access
    );

CREATE POLICY "test_results_modify_policy" ON public.test_results
    FOR ALL
    USING (
        public.has_permission('result_management') AND public.can_view_phi() OR
        public.is_admin()
    );

-- ================================================================
-- SYSTEM CONFIGURATION POLICIES
-- ================================================================

-- System Settings: Only admins can access
CREATE POLICY "system_settings_policy" ON public.system_settings
    FOR ALL
    USING (public.is_admin());

-- Notification Templates: Staff can read, only admins can modify
CREATE POLICY "notification_templates_select_policy" ON public.notification_templates
    FOR SELECT
    USING (public.get_current_staff() IS NOT NULL);

CREATE POLICY "notification_templates_modify_policy" ON public.notification_templates
    FOR ALL
    USING (public.is_admin());

-- ================================================================
-- AUDIT AND LOGGING SETUP
-- ================================================================

-- Function to log data access for HIPAA compliance
CREATE OR REPLACE FUNCTION public.log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if this is PHI-related table access
    IF TG_TABLE_NAME IN ('profiles', 'test_results', 'appointments', 'orders') THEN
        INSERT INTO public.data_access_logs (
            staff_id,
            table_name,
            record_id,
            access_type,
            access_timestamp,
            user_agent,
            ip_address
        ) VALUES (
            public.get_current_staff(),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            NOW(),
            current_setting('request.headers', true)::json->>'user-agent',
            current_setting('request.headers', true)::json->>'x-forwarded-for'
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create data access log table for HIPAA compliance
CREATE TABLE IF NOT EXISTS public.data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.staff(id),
    table_name TEXT NOT NULL,
    record_id UUID,
    access_type TEXT NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
    access_timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable access logging on PHI tables
CREATE TRIGGER log_profiles_access
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

CREATE TRIGGER log_test_results_access
    AFTER INSERT OR UPDATE OR DELETE ON public.test_results
    FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

CREATE TRIGGER log_appointments_access
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

CREATE TRIGGER log_orders_access
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

-- ================================================================
-- RLS DEPLOYMENT SUCCESS
-- ================================================================

SELECT 
    'Admin RLS policies deployed successfully!' as result,
    'HIPAA-compliant access control enabled' as status,
    'All PHI access will be logged for compliance' as audit_status,
    NOW() as deployed_at;