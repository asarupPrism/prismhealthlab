-- ================================================================
-- TEMPORARY RLS DISABLE FOR STAFF TABLES
-- ================================================================
-- This script temporarily disables RLS on staff-related tables
-- to allow admin login to work while we fix the circular dependencies
-- 
-- IMPORTANT: This is a temporary measure for debugging
-- RLS will be re-enabled with proper policies once fixed
-- ================================================================

-- Disable RLS on staff-related tables
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_departments DISABLE ROW LEVEL SECURITY;

-- Also disable on profiles to ensure user data can be accessed
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Test query to verify staff table is accessible
-- Run this to check if your admin user exists in the staff table
SELECT 
    s.id,
    s.user_id,
    s.can_access_admin,
    s.is_active,
    sr.name as role_name,
    sr.is_admin_role,
    p.email
FROM public.staff s
LEFT JOIN public.staff_roles sr ON s.role_id = sr.id
LEFT JOIN public.profiles p ON s.user_id = p.user_id
WHERE s.is_active = true
AND s.can_access_admin = true;

-- Check if your specific user has admin access
-- Replace 'your-email@example.com' with your actual email
SELECT 
    s.id,
    s.user_id,
    s.can_access_admin,
    s.is_active,
    sr.name as role_name,
    sr.is_admin_role,
    p.email
FROM public.staff s
LEFT JOIN public.staff_roles sr ON s.role_id = sr.id
LEFT JOIN public.profiles p ON s.user_id = p.user_id
WHERE p.email = 'your-email@example.com';

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE public.staff IS 'RLS temporarily disabled for debugging admin login issues';
COMMENT ON TABLE public.staff_roles IS 'RLS temporarily disabled for debugging admin login issues';
COMMENT ON TABLE public.staff_departments IS 'RLS temporarily disabled for debugging admin login issues';
COMMENT ON TABLE public.profiles IS 'RLS temporarily disabled for debugging admin login issues';

-- ================================================================
-- END OF TEMPORARY RLS DISABLE
-- ================================================================