// Server-side admin API utilities for Prism Health Lab
// For use in server components and API routes only

import { createClient } from '@/lib/supabase/server'
import type { DashboardStats } from './admin-types'

// Server-side admin API utilities
export class AdminServerAPI {
  private supabase: Awaited<ReturnType<typeof createClient>>

  constructor(supabaseClient: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabaseClient
  }

  // Get dashboard statistics (server-side)
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
      const todayRevenue = todayOrders?.reduce((sum: number, order: { total?: number }) => sum + (order.total || 0), 0) || 0
      const monthlyRevenue = monthlyOrders?.reduce((sum: number, order: { total?: number }) => sum + (order.total || 0), 0) || 0

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
      console.error('Server error fetching dashboard stats:', error)
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

  // Get recent activity (server-side)
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
      console.error('Server error fetching recent activity:', error)
      return []
    }
  }

  // Get system health metrics (server-side)
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
      console.error('Server error checking system health:', error)
      return {
        database: false,
        swell: false,
        email: false,
        sms: false
      }
    }
  }

  // Get user management data (server-side)
  async getUserManagementData() {
    try {
      const { data: users } = await this.supabase
        .from('profiles')
        .select(`
          *,
          staff (
            id,
            role_id,
            can_access_admin,
            is_active,
            staff_roles (
              name,
              is_admin_role
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      return users || []
    } catch (error) {
      console.error('Server error fetching user management data:', error)
      return []
    }
  }

  // Get orders data (server-side)
  async getOrdersData(limit = 50) {
    try {
      const { data: orders } = await this.supabase
        .from('orders')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      return orders || []
    } catch (error) {
      console.error('Server error fetching orders data:', error)
      return []
    }
  }

  // Get appointments data (server-side)
  async getAppointmentsData(limit = 50) {
    try {
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email,
            phone
          ),
          locations (
            name,
            address
          )
        `)
        .order('scheduled_date', { ascending: true })
        .limit(limit)

      return appointments || []
    } catch (error) {
      console.error('Server error fetching appointments data:', error)
      return []
    }
  }

  // Get test results data (server-side)
  async getTestResultsData(limit = 50) {
    try {
      const { data: results } = await this.supabase
        .from('test_results')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          ),
          diagnostic_tests (
            name,
            category
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      return results || []
    } catch (error) {
      console.error('Server error fetching test results data:', error)
      return []
    }
  }
}

// Helper function to create server API instance
export const createAdminServerAPI = (supabaseClient: Awaited<ReturnType<typeof createClient>>) => 
  new AdminServerAPI(supabaseClient)