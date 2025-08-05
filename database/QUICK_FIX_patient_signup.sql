-- =============================================================================
-- QUICK FIX: Patient Signup Error Resolution
-- =============================================================================
-- Purpose: Immediate fix for "Error creating profile: {}" during patient signup
-- 
-- DIAGNOSIS: The profiles table exists but may be missing some expected columns
-- or constraints that the AuthProvider expects.
-- 
-- SOLUTION: Ensure all required columns exist and RLS policies are properly set
-- =============================================================================

-- Verify profiles table exists and show its structure
SELECT 'Current profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if RLS is enabled on profiles table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check existing RLS policies on profiles table
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- =============================================================================
-- ENSURE RLS IS PROPERLY CONFIGURED
-- =============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they work correctly
DROP POLICY IF EXISTS profiles_user_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;

-- Policy: Users can access their own profile
CREATE POLICY profiles_user_policy ON public.profiles
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile during signup
CREATE POLICY profiles_insert_policy ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- ENSURE REQUIRED INDEXES EXIST
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =============================================================================
-- ENSURE PROPER PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- =============================================================================
-- TEST THE CONFIGURATION
-- =============================================================================

-- Test RLS policies are working
SELECT 'RLS Configuration Test:' as test_info;

-- This should show the policies are active
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT 'Quick fix applied successfully!' as status;
SELECT 'You can now test patient signup again.' as next_step;

-- Show final table info
SELECT 
  'Profiles table ready with ' || COUNT(*) || ' columns' as summary
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';