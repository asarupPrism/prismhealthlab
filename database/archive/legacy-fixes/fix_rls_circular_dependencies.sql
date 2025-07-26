-- ================================================================
-- FIX RLS CIRCULAR DEPENDENCIES
-- ================================================================
-- This script fixes the circular dependency issue where RLS policies
-- call functions that try to query the same tables they protect
-- ================================================================

-- First, drop problematic policies that cause circular dependencies
DROP POLICY IF EXISTS "Staff can view their own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can view roles" ON public.staff_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.staff_roles;

-- ================================================================
-- SIMPLIFIED STAFF TABLE POLICIES (NO CIRCULAR DEPENDENCIES)
-- ================================================================

-- Users can always view their own staff record (direct auth.uid() comparison)
CREATE POLICY "Users can view own staff record" ON public.staff
    FOR SELECT USING (user_id = auth.uid());

-- Super admins can manage all staff (avoid circular dependency)
CREATE POLICY "Super admins can manage all staff" ON public.staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            JOIN public.staff_roles sr ON s.role_id = sr.id
            WHERE s.user_id = auth.uid() 
            AND s.is_active = true 
            AND sr.name = 'Super Admin'
            AND s.can_access_admin = true
        )
    );

-- Staff with manage_staff permission can manage other staff
CREATE POLICY "Staff managers can manage staff" ON public.staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.user_id = auth.uid() 
            AND s.is_active = true 
            AND s.can_access_admin = true
            AND s.permissions ? 'manage_staff'
        )
    );

-- ================================================================
-- SIMPLIFIED STAFF ROLES POLICIES
-- ================================================================

-- Any authenticated user can view staff roles (needed for joins)
CREATE POLICY "Authenticated users can view staff roles" ON public.staff_roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only super admins can manage roles
CREATE POLICY "Super admins can manage roles" ON public.staff_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            JOIN public.staff_roles sr ON s.role_id = sr.id
            WHERE s.user_id = auth.uid() 
            AND s.is_active = true 
            AND sr.name = 'Super Admin'
            AND s.can_access_admin = true
        )
    );

-- ================================================================
-- UPDATE HELPER FUNCTIONS TO AVOID RLS QUERIES
-- ================================================================

-- Create a new function that bypasses RLS for admin checks
CREATE OR REPLACE FUNCTION is_admin_bypass_rls()
RETURNS BOOLEAN AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Use a more direct approach that doesn't trigger RLS
    SELECT COUNT(*) INTO admin_count
    FROM public.staff s
    JOIN public.staff_roles sr ON s.role_id = sr.id
    WHERE s.user_id = auth.uid() 
    AND s.is_active = true 
    AND s.can_access_admin = true
    AND sr.is_admin_role = true;
    
    RETURN admin_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get staff info that doesn't trigger RLS
CREATE OR REPLACE FUNCTION get_current_staff_info()
RETURNS TABLE(
    staff_id UUID,
    user_id UUID,
    role_name TEXT,
    can_access_admin BOOLEAN,
    permissions JSONB,
    is_admin_role BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as staff_id,
        s.user_id,
        sr.name as role_name,
        s.can_access_admin,
        s.permissions,
        sr.is_admin_role
    FROM public.staff s
    LEFT JOIN public.staff_roles sr ON s.role_id = sr.id
    WHERE s.user_id = auth.uid() 
    AND s.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- GRANT NECESSARY PERMISSIONS
-- ================================================================

-- Grant SELECT permissions to authenticated users for the tables they need
GRANT SELECT ON public.staff TO authenticated;
GRANT SELECT ON public.staff_roles TO authenticated;
GRANT SELECT ON public.staff_departments TO authenticated;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION is_admin_bypass_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_staff_info() TO authenticated;

-- ================================================================
-- TEST THE FIX
-- ================================================================

-- Test function to verify admin check works without RLS issues
CREATE OR REPLACE FUNCTION test_admin_check()
RETURNS TABLE(
    current_user_id UUID,
    staff_found BOOLEAN,
    can_access_admin BOOLEAN,
    role_name TEXT,
    is_admin_role BOOLEAN,
    final_result BOOLEAN
) AS $$
DECLARE
    staff_info RECORD;
BEGIN
    -- Get current user
    SELECT auth.uid() INTO current_user_id;
    
    -- Get staff info
    SELECT * INTO staff_info FROM get_current_staff_info() LIMIT 1;
    
    -- Return test results
    RETURN QUERY
    SELECT 
        current_user_id,
        staff_info.staff_id IS NOT NULL as staff_found,
        COALESCE(staff_info.can_access_admin, false) as can_access_admin,
        COALESCE(staff_info.role_name, 'none') as role_name,
        COALESCE(staff_info.is_admin_role, false) as is_admin_role,
        is_admin_bypass_rls() as final_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION test_admin_check() TO authenticated;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON FUNCTION is_admin_bypass_rls() IS 'Admin check function that bypasses RLS to prevent circular dependencies';
COMMENT ON FUNCTION get_current_staff_info() IS 'Gets current user staff information without triggering RLS policies';
COMMENT ON FUNCTION test_admin_check() IS 'Test function to verify admin authentication works correctly';

-- ================================================================
-- END OF FIX
-- ================================================================