// Database type definitions based on CLAUDE.md schema
// These types should be generated from your Supabase schema once tables are created

export interface Database {
  public: {
    Tables: {
      // Users & Authentication
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      
      user_preferences: {
        Row: {
          id: string
          user_id: string
          notification_email: boolean
          notification_sms: boolean
          notification_push: boolean
          theme_preference: 'light' | 'dark' | 'system'
          language: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_email?: boolean
          notification_sms?: boolean
          notification_push?: boolean
          theme_preference?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_email?: boolean
          notification_sms?: boolean
          notification_push?: boolean
          theme_preference?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Tests & Products
      test_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      diagnostic_tests: {
        Row: {
          id: string
          swell_product_id: string | null
          name: string
          description: string | null
          category_id: string
          key_tests: string[]
          biomarkers: string[]
          sample_type: string
          fasting_required: boolean
          turnaround_time: string
          normal_ranges: Record<string, unknown> | null
          reference_info: Record<string, unknown> | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          swell_product_id?: string | null
          name: string
          description?: string | null
          category_id: string
          key_tests?: string[]
          biomarkers?: string[]
          sample_type: string
          fasting_required?: boolean
          turnaround_time: string
          normal_ranges?: Record<string, unknown> | null
          reference_info?: Record<string, unknown> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          swell_product_id?: string | null
          name?: string
          description?: string | null
          category_id?: string
          key_tests?: string[]
          biomarkers?: string[]
          sample_type?: string
          fasting_required?: boolean
          turnaround_time?: string
          normal_ranges?: Record<string, unknown> | null
          reference_info?: Record<string, unknown> | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Orders & Appointments
      orders: {
        Row: {
          id: string
          swell_order_id: string
          user_id: string
          customer_email: string
          customer_name: string
          total: number
          currency: string
          status: string
          payment_status: string
          items: Record<string, unknown>[]
          billing_address: Record<string, unknown> | null
          shipping_address: Record<string, unknown> | null
          appointment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          swell_order_id: string
          user_id: string
          customer_email: string
          customer_name: string
          total: number
          currency?: string
          status: string
          payment_status?: string
          items: Record<string, unknown>[]
          billing_address?: Record<string, unknown> | null
          shipping_address?: Record<string, unknown> | null
          appointment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          swell_order_id?: string
          user_id?: string
          customer_email?: string
          customer_name?: string
          total?: number
          currency?: string
          status?: string
          payment_status?: string
          items?: Record<string, unknown>[]
          billing_address?: Record<string, unknown> | null
          shipping_address?: Record<string, unknown> | null
          appointment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      appointments: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          location_id: string
          appointment_date: string
          appointment_time: string
          duration_minutes: number
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          staff_id: string | null
          notes: string | null
          confirmation_sent: boolean
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          location_id: string
          appointment_date: string
          appointment_time: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          staff_id?: string | null
          notes?: string | null
          confirmation_sent?: boolean
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          location_id?: string
          appointment_date?: string
          appointment_time?: string
          duration_minutes?: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          staff_id?: string | null
          notes?: string | null
          confirmation_sent?: boolean
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      locations: {
        Row: {
          id: string
          name: string
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          zip_code: string
          country: string
          phone: string | null
          email: string | null
          operating_hours: Record<string, unknown>
          services: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address_line_1: string
          address_line_2?: string | null
          city: string
          state: string
          zip_code: string
          country?: string
          phone?: string | null
          email?: string | null
          operating_hours?: Record<string, unknown>
          services?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string
          zip_code?: string
          country?: string
          phone?: string | null
          email?: string | null
          operating_hours?: Record<string, unknown>
          services?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Results & Health Data
      test_results: {
        Row: {
          id: string
          user_id: string
          order_id: string
          test_id: string
          lab_report_number: string | null
          collection_date: string
          result_date: string
          results_data: Record<string, unknown>
          status: 'pending' | 'processing' | 'completed' | 'cancelled'
          is_abnormal: boolean
          provider_notes: string | null
          patient_notified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          test_id: string
          lab_report_number?: string | null
          collection_date: string
          result_date?: string
          results_data: Record<string, unknown>
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          is_abnormal?: boolean
          provider_notes?: string | null
          patient_notified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string
          test_id?: string
          lab_report_number?: string | null
          collection_date?: string
          result_date?: string
          results_data?: Record<string, unknown>
          status?: 'pending' | 'processing' | 'completed' | 'cancelled'
          is_abnormal?: boolean
          provider_notes?: string | null
          patient_notified?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      result_files: {
        Row: {
          id: string
          result_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          result_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          result_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          is_primary?: boolean
          created_at?: string
        }
      }

      // Admin & Operations
      staff: {
        Row: {
          id: string
          user_id: string
          employee_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: string
          permissions: string[]
          location_ids: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employee_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role: string
          permissions?: string[]
          location_ids?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          employee_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: string
          permissions?: string[]
          location_ids?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_values: Record<string, unknown> | null
          new_values: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Record<string, unknown> | null
          new_values?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Record<string, unknown> | null
          new_values?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'] 
export type TestCategory = Database['public']['Tables']['test_categories']['Row']
export type DiagnosticTest = Database['public']['Tables']['diagnostic_tests']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type TestResult = Database['public']['Tables']['test_results']['Row']
export type ResultFile = Database['public']['Tables']['result_files']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']