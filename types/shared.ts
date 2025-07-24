// Shared type definitions for Prism Health Lab
// This file contains common interfaces used across components and API routes

// User and Authentication Types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Profile {
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

// Location Types
export interface Location {
  id: string
  name: string
  address: string
  phone: string | null
  hours: Record<string, { start: string; end: string; closed?: boolean }> | null
  timezone: string | null
  active: boolean
  created_at: string
  updated_at: string
}

// Order and Product Types
export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  variant_id?: string
  description?: string
}

export interface Order {
  id: string
  swell_order_id: string
  user_id: string
  customer_email: string
  customer_name: string
  total: number
  currency: string
  status: string
  payment_status: string
  items: OrderItem[]
  billing_address: Record<string, unknown>
  shipping_address: Record<string, unknown> | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Appointment Types
export interface Appointment {
  id: string
  user_id: string
  order_id: string | null
  location_id: string
  scheduled_date: string
  appointment_type: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  staff_name: string | null
  notes: string | null
  confirmation_email_sent: boolean | null
  confirmation_email_sent_at: string | null
  reminder_24h_sent: boolean | null
  reminder_24h_sent_at: string | null
  reminder_1h_sent: boolean | null
  reminder_1h_sent_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  // Relations
  locations?: Location
  orders?: Order
  profiles?: Profile
  test_results?: TestResult[]
}

// Test Result Types
export interface TestValue {
  value: number | string
  unit?: string
  status?: 'normal' | 'elevated' | 'high' | 'low' | 'critical'
  reference?: string
}

export interface TestResult {
  id: string
  user_id: string
  appointment_id: string | null
  diagnostic_test_id: string | null
  status: 'pending' | 'normal' | 'elevated' | 'high' | 'low' | 'critical'
  result_date: string | null
  test_values: Record<string, TestValue> | null
  summary: string | null
  interpretation: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
  // Relations
  diagnostic_tests?: DiagnosticTest
  appointments?: Appointment
  result_files?: ResultFile[]
}

export interface ResultFile {
  id: string
  test_result_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number | null
  created_at: string
}

export interface DiagnosticTest {
  id: string
  name: string
  category: string
  description: string | null
  normal_ranges: Record<string, { min: number; max: number; unit?: string; reference?: string }> | null
  preparation_instructions: string[] | null
  active: boolean
  created_at: string
  updated_at: string
}

// Form and Component Types
export interface AppointmentData {
  selectedDate: Date
  selectedTime: string
  locationId: string
  locationName: string
  locationAddress: string
  staffId?: string
  staffName?: string
  notes?: string
}

export interface CheckoutData {
  appointment?: AppointmentData
  authentication?: { 
    isAuthenticated: boolean
    user?: User
    mode?: 'login' | 'signup' 
  }
  billing?: BillingData
  payment?: PaymentData
}

export interface BillingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  billingZip: string
}

// Cart Types
export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  description?: string
  image?: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  metadata?: Record<string, unknown>
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  total?: number
  page?: number
  limit?: number
}

// Auth Context Types
export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, additionalData?: Partial<Profile>) => Promise<{ user: User | null; error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<void>
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'tel' | 'date' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: (value: string) => string | undefined
}