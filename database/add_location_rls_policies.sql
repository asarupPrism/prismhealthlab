-- ================================================================
-- LOCATION MANAGEMENT RLS POLICIES
-- ================================================================
-- Add Row Level Security policies for location management
-- ================================================================

-- Enable RLS on locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- LOCATIONS TABLE POLICIES
-- ================================================================

-- Admin staff can view all locations
CREATE POLICY "Admins can view all locations" ON public.locations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
    AND staff.can_access_admin = true
    AND staff.is_active = true
  )
);

-- Admin staff can insert new locations
CREATE POLICY "Admins can insert locations" ON public.locations
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
    AND staff.can_access_admin = true
    AND staff.is_active = true
  )
);

-- Admin staff can update locations
CREATE POLICY "Admins can update locations" ON public.locations
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
    AND staff.can_access_admin = true
    AND staff.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
    AND staff.can_access_admin = true
    AND staff.is_active = true
  )
);

-- Admin staff can soft delete locations (mark inactive)
CREATE POLICY "Admins can soft delete locations" ON public.locations
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
    AND staff.can_access_admin = true
    AND staff.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
    AND staff.can_access_admin = true
    AND staff.is_active = true
  )
);

-- ================================================================
-- PUBLIC ACCESS FOR APPOINTMENT BOOKING
-- ================================================================

-- Allow authenticated users to view active locations for appointment booking
CREATE POLICY "Users can view active locations for booking" ON public.locations
FOR SELECT TO authenticated
USING (is_active = true);

-- Allow anonymous users to view active locations for guest checkout
CREATE POLICY "Anonymous users can view active locations" ON public.locations
FOR SELECT TO anon
USING (is_active = true);

-- ================================================================
-- SERVICE ROLE POLICIES (BYPASS RLS)
-- ================================================================

-- Service role can access all locations (used by admin actions)
CREATE POLICY "Service role has full access" ON public.locations
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- ================================================================
-- NOTES
-- ================================================================
-- 1. Admin staff with can_access_admin = true can manage all locations
-- 2. Regular authenticated users can only view active locations
-- 3. Anonymous users can view active locations for guest booking
-- 4. Service role bypasses all restrictions for server actions
-- 5. No hard deletes - only soft deletes by marking is_active = false
-- ================================================================