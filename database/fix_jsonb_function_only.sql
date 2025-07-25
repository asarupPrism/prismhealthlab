-- ================================================================
-- FIX JSONB SYNTAX IN EXISTING FUNCTIONS
-- ================================================================
-- This script fixes JSONB array syntax errors by replacing function content
-- instead of dropping them (which would break dependent policies)
-- ================================================================

-- Fix the has_permission function to use proper JSONB syntax
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
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

-- Fix the can_access_location function to use proper JSONB syntax
CREATE OR REPLACE FUNCTION can_access_location(location_id UUID)
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

-- Fix the can_access_patient_data function
CREATE OR REPLACE FUNCTION can_access_patient_data(patient_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Users can always access their own data
    IF patient_user_id = auth.uid() THEN
        RETURN true;
    END IF;
    
    -- Staff with appropriate permissions can access patient data
    -- Use proper JSONB syntax and avoid circular dependency
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

-- Update the check_user_permission function for proper JSONB syntax
CREATE OR REPLACE FUNCTION check_user_permission(permission_name TEXT)
RETURNS TABLE(has_permission BOOLEAN, user_role TEXT, department TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (s.permissions ? permission_name OR s.can_access_admin = true) as has_permission,
        sr.name as user_role,
        sd.name as department
    FROM public.staff s
    LEFT JOIN public.staff_roles sr ON s.role_id = sr.id
    LEFT JOIN public.staff_departments sd ON s.department_id = sd.id
    WHERE s.user_id = auth.uid() AND s.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON FUNCTION has_permission(TEXT) IS 'Checks if current user has specific permission - FIXED JSONB syntax';
COMMENT ON FUNCTION can_access_location(UUID) IS 'Checks if current user can access specific location - FIXED JSONB syntax';
COMMENT ON FUNCTION can_access_patient_data(UUID) IS 'Checks if current user can access specific patient data - FIXED JSONB syntax';
COMMENT ON FUNCTION check_user_permission(TEXT) IS 'Application-safe function to check user permissions - FIXED JSONB syntax';

-- ================================================================
-- END OF JSONB FUNCTION FIX
-- ================================================================