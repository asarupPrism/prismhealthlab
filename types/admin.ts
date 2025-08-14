// Admin Portal Type Definitions

export interface StaffMember {
  id: string
  employee_id: string
  user_id: string
  role_id: string
  department_id: string
  work_email: string
  work_phone: string | null
  manager_id: string | null
  hire_date: string
  employment_status: string
  can_access_admin: boolean
  can_view_phi: boolean
  permissions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  }
  staff_roles?: {
    id: string
    name: string
    description: string | null
    level: number
    is_admin_role: boolean
    default_permissions: string[]
  }
  staff_departments?: {
    id: string
    name: string
    description: string | null
  }
}

export interface Location {
  id: string
  name: string
  location_code: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  zip_code: string
  country: string
  phone: string | null
  email: string | null
  website: string | null
  operating_hours: Record<string, any>
  timezone: string
  capacity: number
  services_offered: string[]
  parking_available: boolean
  wheelchair_accessible: boolean
  accepts_walk_ins: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  order_id: string | null
  location_id: string
  appointment_number: string
  appointment_type: 'blood_draw' | 'consultation' | 'follow_up'
  scheduled_date: string
  scheduled_time: string
  estimated_duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  assigned_staff_id: string | null
  checked_in_at: string | null
  completed_at: string | null
  confirmation_sent: boolean
  reminder_sent: boolean
  special_instructions: string | null
  accessibility_requirements: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  }
  locations?: Location
  staff?: StaffMember
  orders?: Order
}

export interface Order {
  id: string
  swell_order_id: string | null
  swell_order_number: string | null
  user_id: string | null
  customer_email: string
  customer_name: string
  billing_address: Record<string, any>
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_amount: number
  total: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  special_instructions: string | null
  requires_appointment: boolean
  appointment_scheduled: boolean
  preferred_location_id: string | null
  order_source: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TestResult {
  id: string
  user_id: string
  order_id: string | null
  test_id: string
  appointment_id: string | null
  lab_report_number: string
  lab_accession_number: string | null
  performing_lab: string
  sample_collection_date: string | null
  sample_received_date: string | null
  result_date: string
  results_data: Record<string, any>
  reference_ranges: Record<string, any>
  abnormal_flags: string[]
  overall_status: 'normal' | 'abnormal' | 'critical' | 'pending_review'
  clinical_notes: string | null
  quality_control_passed: boolean
  quality_control_notes: string | null
  patient_notified: boolean
  patient_notified_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  requires_follow_up: boolean
  follow_up_instructions: string | null
  pdf_report_url: string | null
  raw_data_url: string | null
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  diagnostic_tests?: {
    name: string
    test_code: string
  }
  orders?: {
    id: string
    swell_order_number: string | null
  }
  appointments?: {
    id: string
    appointment_number: string
    scheduled_date: string
  }
}

export interface DiagnosticTest {
  id: string
  name: string
  description: string | null
  category_id: string
  test_code: string
  loinc_codes: string[]
  swell_product_id: string | null
  base_price: number
  currency: string
  cost_to_lab: number | null
  fasting_required: boolean
  fasting_duration_hours: number
  specimen_type: string
  collection_method: string
  specimen_volume_ml: number | null
  turnaround_time_business_days: number
  lab_processing_time_hours: number
  reference_lab: string | null
  clinical_significance: string | null
  patient_preparation_instructions: string | null
  interpretation_guide: string | null
  tags: string[]
  featured: boolean
  popularity_score: number
  seo_meta: Record<string, any>
  version: number
  last_reviewed_date: string | null
  next_review_date: string | null
  regulatory_approvals: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  address: Record<string, any>
  emergency_contact: Record<string, any>
  insurance_info: Record<string, any>
  medical_history: Record<string, any>
  allergies: string[]
  medications: string[]
  created_at: string
  updated_at: string
  orders?: Order[]
}