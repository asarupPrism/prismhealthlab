// Server-side admin utilities for Prism Health Lab
// For use in server components and API routes only

import { createClient } from '@/lib/supabase/server'
import type { AdminProfile } from './admin-types'

// Server-side admin utilities
export class AdminAuthServer {
  private supabase: Awaited<ReturnType<typeof createClient>>

  constructor(supabaseClient: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabaseClient
  }

  // Check if current user is admin (server-side)
  async isAdmin(userId?: string): Promise<boolean> {
    try {
      console.log('=== SERVER ADMIN CHECK START ===')
      
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError) {
        console.error('Server auth error getting user:', userError)
        return false
      }

      const targetUserId = userId || user?.id
      if (!targetUserId) {
        console.log('No user ID found for server admin check')
        return false
      }

      console.log('Server: Checking admin for user:', targetUserId)
      console.log('Server auth user object:', user)

      // Ultra-simplified query - just check if staff record exists
      console.log('Server Step 1: Querying staff table...')
      const { data: staffData, error: staffError } = await this.supabase
        .from('staff')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle()

      console.log('Server staff query completed!')
      console.log('Server staff query result:', { staffData, staffError })

      if (staffError) {
        console.error('Server staff query failed:', staffError)
        return false
      }

      if (!staffData) {
        console.log('Server: No staff record found - user is not admin')
        return false
      }

      console.log('Server: Staff record found:', staffData)

      // Check basic admin flags
      const hasAdminAccess = staffData.can_access_admin === true
      const isActive = staffData.is_active === true
      
      console.log('Server admin access check:', {
        hasAdminAccess,
        isActive,
        canProceed: hasAdminAccess && isActive
      })

      if (!hasAdminAccess || !isActive) {
        console.log('Server: Staff exists but lacks admin access or is inactive')
        return false
      }

      // If we get here, user has basic admin access
      console.log('✅ Server: User has admin access!')
      console.log('=== SERVER ADMIN CHECK END ===')
      
      return true
    } catch (error) {
      console.error('Server error in admin check:', error)
      console.log('=== SERVER ADMIN CHECK END (ERROR) ===')
      return false
    }
  }

  // Get admin profile (server-side)
  async getAdminProfile(userId?: string): Promise<AdminProfile | null> {
    try {
      const targetUserId = userId || (await this.supabase.auth.getUser()).data.user?.id
      if (!targetUserId) return null

      const { data: profile } = await this.supabase
        .from('staff')
        .select('*')
        .eq('user_id', targetUserId)
        .single()

      return profile
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      return null
    }
  }

  // Check specific permission (server-side)
  async hasPermission(permission: string, userId?: string): Promise<boolean> {
    try {
      const profile = await this.getAdminProfile(userId)
      if (!profile) return false

      return profile.permissions.includes(permission) || 
             profile.role === 'superadmin'
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }
}