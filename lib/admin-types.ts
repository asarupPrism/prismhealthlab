// Shared admin types and interfaces for Prism Health Lab
// Used by both server and client admin utilities

import { User } from '@supabase/supabase-js'

// Admin role types
export type AdminRole = 'admin' | 'staff' | 'manager' | 'superadmin'

export interface AdminProfile {
  id: string
  user_id: string
  role: AdminRole
  permissions: string[]
  department?: string
  created_at: string
  updated_at: string
}

export interface AdminUser extends User {
  adminProfile?: AdminProfile
}

// Admin dashboard statistics
export interface DashboardStats {
  totalUsers: number
  activeAppointments: number
  pendingResults: number
  todayRevenue: number
  monthlyRevenue: number
  recentOrders: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

// Permission constants
export const ADMIN_PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Appointment management
  VIEW_APPOINTMENTS: 'view_appointments',
  EDIT_APPOINTMENTS: 'edit_appointments',
  CANCEL_APPOINTMENTS: 'cancel_appointments',
  
  // Test results
  VIEW_RESULTS: 'view_results',
  UPLOAD_RESULTS: 'upload_results',
  APPROVE_RESULTS: 'approve_results',
  
  // Orders and inventory
  VIEW_ORDERS: 'view_orders',
  PROCESS_ORDERS: 'process_orders',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Analytics and reports
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // System administration
  MANAGE_STAFF: 'manage_staff',
  SYSTEM_CONFIG: 'system_config',
  AUDIT_LOGS: 'audit_logs'
} as const