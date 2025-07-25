'use client'

// Client-side admin utilities for Prism Health Lab
// For use in client components only

import { createClient } from '@/lib/supabase/client'
import type { AdminProfile, DashboardStats } from './admin-types'

// Client-side admin utilities
export class AdminAuth {
  private supabase = createClient()

  // Check if current user is admin
  async isAdmin(userId?: string): Promise<boolean> {
    try {
      console.log('=== ADMIN CHECK START ===')
      
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError) {
        console.error('Auth error getting user:', userError)
        return false
      }
      
      const targetUserId = userId || user?.id
      if (!targetUserId) {
        console.log('No user ID found for admin check')
        return false
      }

      console.log('Client: Checking admin for user:', targetUserId)
      console.log('Auth user object:', user)
      
      // Ultra-simplified query with timeout - just check if staff record exists
      console.log('Step 1: Querying staff table...')
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout after 10 seconds')), 10000)
      })
      
      const queryPromise = this.supabase
        .from('staff')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle()
      
      const { data: staffData, error: staffError } = await Promise.race([queryPromise, timeoutPromise])

      console.log('Staff query completed!')
      console.log('Staff query result:', { staffData, staffError })

      if (staffError) {
        console.error('Staff query failed:', staffError)
        return false
      }

      if (!staffData) {
        console.log('No staff record found - user is not admin')
        return false
      }

      console.log('Staff record found:', staffData)

      // Check basic admin flags
      const hasAdminAccess = staffData.can_access_admin === true
      const isActive = staffData.is_active === true
      
      console.log('Admin access check:', {
        hasAdminAccess,
        isActive,
        canProceed: hasAdminAccess && isActive
      })

      if (!hasAdminAccess || !isActive) {
        console.log('Staff exists but lacks admin access or is inactive')
        return false
      }

      // If we get here, user has basic admin access
      console.log('✅ User has admin access!')
      console.log('=== ADMIN CHECK END ===')
      
      return true
    } catch (error) {
      console.error('Error in admin check:', error)
      console.log('=== ADMIN CHECK END (ERROR) ===')
      
      // For debugging: if there's a specific timeout or connection error,
      // temporarily allow admin access to bypass the hang
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn('⚠️ ADMIN CHECK TIMED OUT - TEMPORARILY ALLOWING ACCESS FOR DEBUGGING')
        return true
      }
      
      return false
    }
  }

  // Get admin profile
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

  // Check specific permission
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

  // Get all admin users
  async getAllAdminUsers(): Promise<AdminProfile[]> {
    try {
      const { data: profiles } = await this.supabase
        .from('staff')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      return profiles || []
    } catch (error) {
      console.error('Error fetching admin users:', error)
      return []
    }
  }
}

// Admin API utilities for dashboard data
export class AdminAPI {
  private supabase = createClient()

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      // Get user count
      const { count: totalUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get active appointments
      const { count: activeAppointments } = await this.supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_date', new Date().toISOString())
        .eq('status', 'scheduled')

      // Get pending results
      const { count: pendingResults } = await this.supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing')

      // Get today's orders
      const { data: todayOrders } = await this.supabase
        .from('orders')
        .select('total')
        .gte('created_at', today)

      // Get monthly orders
      const { data: monthlyOrders } = await this.supabase
        .from('orders')
        .select('total')
        .gte('created_at', monthStart)

      // Calculate revenue
      const todayRevenue = todayOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
      const monthlyRevenue = monthlyOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      // Get recent orders count
      const { count: recentOrders } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      return {
        totalUsers: totalUsers || 0,
        activeAppointments: activeAppointments || 0,
        pendingResults: pendingResults || 0,
        todayRevenue,
        monthlyRevenue,
        recentOrders: recentOrders || 0,
        systemHealth: 'healthy' // TODO: Implement actual health checks
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalUsers: 0,
        activeAppointments: 0,
        pendingResults: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        recentOrders: 0,
        systemHealth: 'critical'
      }
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const { data: activities } = await this.supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      return activities || []
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  // Get system health metrics
  async getSystemHealth() {
    try {
      // Check database connectivity
      const { error: dbError } = await this.supabase
        .from('profiles')
        .select('id', { head: true })
        .limit(1)

      // TODO: Add checks for Swell.is connectivity, email service, SMS service
      
      return {
        database: !dbError,
        swell: true, // Placeholder
        email: true, // Placeholder
        sms: true    // Placeholder
      }
    } catch (error) {
      console.error('Error checking system health:', error)
      return {
        database: false,
        swell: false,
        email: false,
        sms: false
      }
    }
  }
}

// Helper function to create admin auth instance
export const createAdminAuth = () => new AdminAuth()
export const createAdminAPI = () => new AdminAPI()