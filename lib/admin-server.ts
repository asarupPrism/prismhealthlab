// Server-side admin utilities for Prism Health Lab
// For use in server components and API routes only

import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminProfile } from './admin-types'

// Server-side admin utilities
export class AdminAuthServer {
  private supabase: ReturnType<typeof createAdminClient>

  constructor() {
    this.supabase = createAdminClient()
  }

  // Check if current user is admin (server-side)
  async isAdmin(userId: string): Promise<boolean> {
    try {
      console.log('=== SERVER ADMIN CHECK START ===')
      
      if (!userId) {
        console.log('No user ID provided for server admin check')
        return false
      }

      console.log('Server: Checking admin for user:', userId)
      // Ultra-simplified query - just check if staff record exists
      console.log('Server Step 1: Querying staff table...')
      const { data: staffData, error: staffError } = await this.supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('Server staff query completed!')
      console.log('Server staff query result:', { staffData, staffError })

      if (staffError) {
        console.error('Server staff query failed:', {
          message: staffError.message,
          code: staffError.code,
          details: staffError.details,
          hint: staffError.hint
        })
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
      console.error('Server error in admin check:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      console.log('=== SERVER ADMIN CHECK END (ERROR) ===')
      return false
    }
  }

  // Get admin profile (server-side)
  async getAdminProfile(userId: string): Promise<AdminProfile | null> {
    try {
      if (!userId) return null

      const { data: profile } = await this.supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .single()

      return profile
    } catch (error) {
      console.error('Error fetching admin profile:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      return null
    }
  }

  // Check specific permission (server-side)
  async hasPermission(permission: string, userId: string): Promise<boolean> {
    try {
      const profile = await this.getAdminProfile(userId)
      if (!profile) return false

      return profile.permissions.includes(permission) || 
             profile.role === 'superadmin'
    } catch (error) {
      console.error('Error checking permission:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      return false
    }
  }
}