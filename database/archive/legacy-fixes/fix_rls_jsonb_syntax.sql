-- ================================================================
-- FIX JSONB SYNTAX ERRORS IN RLS POLICIES
-- ================================================================
-- This script fixes JSONB array syntax errors in RLS policies
-- Use JSONB operators (?, ?&, ?|) instead of ANY() for JSONB arrays
-- ================================================================

-- First, drop all problematic policies that use incorrect JSONB syntax
DROP POLICY IF EXISTS "Staff can view patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Staff can view accessible locations" ON public.locations;
DROP POLICY IF EXISTS "Staff can view all tests" ON public.diagnostic_tests;
DROP POLICY IF EXISTS "Admins can manage test catalog" ON public.test_categories;
DROP POLICY IF EXISTS "Admins can manage diagnostic tests" ON public.diagnostic_tests;
DROP POLICY IF EXISTS "Staff can view test pricing" ON public.test_pricing;
DROP POLICY IF EXISTS "Admins can manage test pricing" ON public.test_pricing;
DROP POLICY IF EXISTS "Staff can view orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can view order history" ON public.order_status_history;
DROP POLICY IF EXISTS "Staff can add order history" ON public.order_status_history;
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can view appointment slots" ON public.appointment_slots;
DROP POLICY IF EXISTS "Staff can manage appointment slots" ON public.appointment_slots;
DROP POLICY IF EXISTS "Staff can view test results" ON public.test_results;
DROP POLICY IF EXISTS "Authorized staff can manage test results" ON public.test_results;
DROP POLICY IF EXISTS "Staff can view result files" ON public.result_files;
DROP POLICY IF EXISTS "Authorized staff can manage result files" ON public.result_files;

-- Drop functions that use incorrect JSONB syntax
DROP FUNCTION IF EXISTS has_permission(TEXT);
DROP FUNCTION IF EXISTS can_access_location(UUID);
DROP FUNCTION IF EXISTS can_access_patient_data(UUID);

-- ================================================================
-- CREATE CORRECTED FUNCTIONS WITH PROPER JSONB SYNTAX
-- ================================================================

-- Function to check if user has specific permission (CORRECTED JSONB SYNTAX)
CREATE OR REPLACE FUNCTION has_permission_safe(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND (
            s.permissions ? permission_name OR
            s.can_access_admin = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access location (CORRECTED JSONB SYNTAX)
CREATE OR REPLACE FUNCTION can_access_location_safe(location_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND (
            s.location_access ? location_id::text OR
            s.can_access_admin = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access patient data (SAFE VERSION)
CREATE OR REPLACE FUNCTION can_access_patient_data_safe(patient_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Users can always access their own data
    IF patient_user_id = auth.uid() THEN
        RETURN true;
    END IF;
    
    -- Check if user is staff with appropriate permissions
    RETURN EXISTS (
        SELECT 1 
        FROM public.staff s
        WHERE s.user_id = auth.uid() 
        AND s.is_active = true 
        AND (
            s.permissions ? 'view_patient_data' OR
            s.can_access_admin = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- RECREATE POLICIES WITH CORRECTED SYNTAX
-- ================================================================

-- Profiles policies with safe functions
CREATE POLICY "Staff can view patient profiles corrected" ON public.profiles
    FOR SELECT USING (
        user_id = auth.uid() OR
        can_access_patient_data_safe(user_id) OR
        has_permission_safe('view_users')
    );

-- User preferences policies
CREATE POLICY "Users can manage their own preferences corrected" ON public.user_preferences
    FOR ALL USING (
        user_id = auth.uid() OR
        can_access_patient_data_safe(user_id)
    );

-- Location policies
CREATE POLICY "Staff can view accessible locations corrected" ON public.locations
    FOR SELECT USING (
        is_active = true OR
        can_access_location_safe(id) OR
        has_permission_safe('view_locations')
    );

-- Test catalog policies
CREATE POLICY "Staff can view all tests corrected" ON public.diagnostic_tests
    FOR SELECT USING (
        is_active = true OR
        EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "Admins can manage test catalog corrected" ON public.test_categories
    FOR ALL USING (
        has_permission_safe('manage_tests') OR
        is_admin_bypass_rls()
    );

CREATE POLICY "Admins can manage diagnostic tests corrected" ON public.diagnostic_tests
    FOR ALL USING (
        has_permission_safe('manage_tests') OR
        is_admin_bypass_rls()
    );

-- Test pricing policies
CREATE POLICY "Staff can view test pricing corrected" ON public.test_pricing
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "Admins can manage test pricing corrected" ON public.test_pricing
    FOR ALL USING (
        has_permission_safe('manage_pricing') OR
        is_admin_bypass_rls()
    );

-- Order policies
CREATE POLICY "Staff can view orders corrected" ON public.orders
    FOR SELECT USING (
        user_id = auth.uid() OR
        can_access_patient_data_safe(user_id) OR
        has_permission_safe('view_orders')
    );

CREATE POLICY "Staff can update orders corrected" ON public.orders
    FOR UPDATE USING (
        has_permission_safe('process_orders') OR
        is_admin_bypass_rls()
    );

-- Order history policies
CREATE POLICY "Staff can view order history corrected" ON public.order_status_history
    FOR SELECT USING (
        has_permission_safe('view_orders') OR
        is_admin_bypass_rls()
    );

CREATE POLICY "Staff can add order history corrected" ON public.order_status_history
    FOR INSERT WITH CHECK (
        has_permission_safe('process_orders') OR
        is_admin_bypass_rls()
    );

-- Appointment policies
CREATE POLICY "Staff can view appointments corrected" ON public.appointments
    FOR SELECT USING (
        user_id = auth.uid() OR
        can_access_patient_data_safe(user_id) OR
        has_permission_safe('view_appointments')
    );

CREATE POLICY "Staff can manage appointments corrected" ON public.appointments
    FOR ALL USING (
        has_permission_safe('edit_appointments') OR
        is_admin_bypass_rls()
    );

-- Appointment slots policies
CREATE POLICY "Staff can view appointment slots corrected" ON public.appointment_slots
    FOR SELECT USING (
        can_access_location_safe(location_id) OR
        has_permission_safe('view_appointments')
    );

CREATE POLICY "Staff can manage appointment slots corrected" ON public.appointment_slots
    FOR ALL USING (
        has_permission_safe('manage_schedule') OR
        is_admin_bypass_rls()
    );

-- Test results policies (STRICT PHI PROTECTION)
CREATE POLICY "Staff can view test results corrected" ON public.test_results
    FOR SELECT USING (
        user_id = auth.uid() OR
        has_permission_safe('view_results') OR
        is_admin_bypass_rls()
    );

CREATE POLICY "Authorized staff can manage test results corrected" ON public.test_results
    FOR ALL USING (
        has_permission_safe('upload_results') OR
        has_permission_safe('approve_results') OR
        is_admin_bypass_rls()
    );

-- Result files policies
CREATE POLICY "Staff can view result files corrected" ON public.result_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_results tr
            WHERE tr.id = result_id AND tr.user_id = auth.uid()
        ) OR
        has_permission_safe('view_results') OR
        is_admin_bypass_rls()
    );

CREATE POLICY "Authorized staff can manage result files corrected" ON public.result_files
    FOR ALL USING (
        has_permission_safe('upload_results') OR
        is_admin_bypass_rls()
    );

-- ================================================================
-- GRANT PERMISSIONS FOR NEW FUNCTIONS
-- ================================================================

GRANT EXECUTE ON FUNCTION has_permission_safe(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_location_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_patient_data_safe(UUID) TO authenticated;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON FUNCTION has_permission_safe(TEXT) IS 'Safe permission check using proper JSONB ? operator';
COMMENT ON FUNCTION can_access_location_safe(UUID) IS 'Safe location access check using proper JSONB ? operator';
COMMENT ON FUNCTION can_access_patient_data_safe(UUID) IS 'Safe patient data access check using proper JSONB ? operator';

-- ================================================================
-- END OF JSONB SYNTAX FIX
-- ================================================================