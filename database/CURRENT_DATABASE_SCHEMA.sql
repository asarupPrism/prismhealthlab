-- ================================================================
-- PRISM HEALTH LAB - CURRENT DATABASE SCHEMA
-- ================================================================
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- ================================================================

-- This file documents the current state of the Prism Health Lab database
-- as of January 2025. It includes all production tables, indexes, and
-- constraints that are currently in use.

-- ================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ================================================================

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  first_name text,
  last_name text,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'prefer_not_to_say'::text])),
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'US'::text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  medical_history jsonb DEFAULT '{}'::jsonb,
  allergies jsonb DEFAULT '[]'::jsonb,
  medications jsonb DEFAULT '[]'::jsonb,
  preferred_language text DEFAULT 'en'::text,
  timezone text DEFAULT 'America/New_York'::text,
  communication_preferences jsonb DEFAULT '{"sms": false, "push": true, "email": true}'::jsonb,
  profile_completed boolean DEFAULT false,
  last_profile_update timestamp with time zone,
  swell_customer_id character varying,
  two_factor_enabled boolean DEFAULT false,
  totp_secret character varying,
  backup_codes ARRAY,
  last_2fa_verification timestamp without time zone,
  failed_2fa_attempts integer DEFAULT 0,
  locked_until timestamp without time zone,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ================================================================
-- STAFF & ADMINISTRATION
-- ================================================================

CREATE TABLE public.staff_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  level integer NOT NULL DEFAULT 1,
  default_permissions jsonb DEFAULT '[]'::jsonb,
  is_admin_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.staff_departments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_departments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  employee_id text UNIQUE,
  role_id uuid,
  department_id uuid,
  work_email text,
  work_phone text,
  hire_date date,
  employment_status text DEFAULT 'active'::text CHECK (employment_status = ANY (ARRAY['active'::text, 'inactive'::text, 'terminated'::text, 'on_leave'::text])),
  permissions jsonb DEFAULT '[]'::jsonb,
  location_access jsonb DEFAULT '[]'::jsonb,
  can_access_admin boolean DEFAULT false,
  can_view_phi boolean DEFAULT false,
  admin_dashboard_permissions jsonb DEFAULT '{}'::jsonb,
  work_schedule jsonb DEFAULT '{}'::jsonb,
  last_admin_login timestamp with time zone,
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamp with time zone,
  manager_id uuid,
  first_name text,
  last_name text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT staff_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.staff_roles(id),
  CONSTRAINT staff_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.staff_departments(id),
  CONSTRAINT staff_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.staff(id),
  CONSTRAINT staff_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id)
);

-- ================================================================
-- TEST CATALOG & PRODUCTS
-- ================================================================

CREATE TABLE public.test_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  parent_category_id uuid,
  icon text,
  color_theme text,
  sort_order integer DEFAULT 0,
  swell_category_id text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT test_categories_pkey PRIMARY KEY (id),
  CONSTRAINT test_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.test_categories(id)
);

CREATE TABLE public.diagnostic_tests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  short_description text,
  category_id uuid,
  test_code text UNIQUE,
  slug text,
  tags ARRAY DEFAULT '{}'::text[],
  key_biomarkers jsonb DEFAULT '[]'::jsonb,
  sample_types jsonb DEFAULT '[]'::jsonb,
  specimen_type text DEFAULT 'blood'::text,
  collection_method text DEFAULT 'venipuncture'::text,
  fasting_required boolean DEFAULT false,
  fasting_duration_hours integer,
  preparation_instructions jsonb DEFAULT '[]'::jsonb,
  special_requirements text,
  collection_time_minutes integer DEFAULT 15,
  processing_time_hours integer DEFAULT 24,
  turnaround_time_business_days integer DEFAULT 2,
  normal_ranges jsonb DEFAULT '{}'::jsonb,
  reference_information jsonb DEFAULT '{}'::jsonb,
  clinical_significance text,
  loinc_codes ARRAY DEFAULT '{}'::text[],
  swell_product_id text UNIQUE,
  swell_variant_id text,
  base_price numeric,
  currency text DEFAULT 'USD'::text,
  insurance_covered boolean DEFAULT false,
  age_restrictions jsonb DEFAULT '{}'::jsonb,
  requires_physician_order boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  featured boolean DEFAULT false,
  popularity_score integer DEFAULT 0,
  seo_meta jsonb DEFAULT '{}'::jsonb,
  version integer DEFAULT 1,
  last_reviewed_date date,
  next_review_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT diagnostic_tests_pkey PRIMARY KEY (id),
  CONSTRAINT diagnostic_tests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.test_categories(id)
);

-- ================================================================
-- ORDERS & E-COMMERCE
-- ================================================================

CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  swell_order_id text UNIQUE,
  swell_order_number text,
  order_number text UNIQUE,
  user_id uuid,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  guest_order boolean DEFAULT false,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  shipping_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  currency text DEFAULT 'USD'::text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'completed'::text, 'cancelled'::text, 'refunded'::text])),
  payment_status text DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'authorized'::text, 'captured'::text, 'failed'::text, 'refunded'::text, 'partially_refunded'::text])),
  fulfillment_status text DEFAULT 'pending'::text CHECK (fulfillment_status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_tests jsonb DEFAULT '[]'::jsonb,
  billing_address jsonb,
  shipping_address jsonb,
  payment_method jsonb,
  payment_gateway_transaction_id text,
  payment_method_id uuid,
  appointment_id uuid,
  requires_appointment boolean DEFAULT true,
  appointment_scheduled boolean DEFAULT false,
  appointments_data jsonb DEFAULT '[]'::jsonb,
  customer_notes text,
  admin_notes text,
  special_handling_required boolean DEFAULT false,
  order_source text DEFAULT 'web'::text CHECK (order_source = ANY (ARRAY['web'::text, 'admin'::text, 'phone'::text, 'walk_in'::text])),
  discount_codes ARRAY DEFAULT '{}'::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  purchase_metadata jsonb DEFAULT '{}'::jsonb,
  swell_order_data jsonb DEFAULT '{}'::jsonb,
  swell_sync_status text DEFAULT 'pending'::text CHECK (swell_sync_status = ANY (ARRAY['pending'::text, 'synced'::text, 'failed'::text, 'manual'::text])),
  swell_last_sync_at timestamp with time zone,
  swell_sync_error text,
  refund_status character varying DEFAULT 'none'::character varying,
  ordered_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id),
  CONSTRAINT orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id)
);

-- ================================================================
-- APPOINTMENTS & SCHEDULING
-- ================================================================

CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  location_code text UNIQUE,
  slug text,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text DEFAULT 'US'::text,
  latitude numeric,
  longitude numeric,
  phone text,
  email text,
  website text,
  operating_hours jsonb DEFAULT '{}'::jsonb,
  timezone text DEFAULT 'America/New_York'::text,
  capacity integer DEFAULT 10,
  services_offered jsonb DEFAULT '[]'::jsonb,
  equipment_available jsonb DEFAULT '[]'::jsonb,
  location_manager_id uuid,
  is_active boolean DEFAULT true,
  accepts_walk_ins boolean DEFAULT false,
  requires_appointment boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT locations_location_manager_id_fkey FOREIGN KEY (location_manager_id) REFERENCES public.staff(id)
);

CREATE TABLE public.appointment_slots (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  location_id uuid,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  max_appointments integer DEFAULT 1,
  available_slots integer DEFAULT 1,
  assigned_staff_id uuid,
  appointment_types jsonb DEFAULT '[]'::jsonb,
  special_requirements jsonb DEFAULT '{}'::jsonb,
  is_available boolean DEFAULT true,
  is_blocked boolean DEFAULT false,
  block_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointment_slots_pkey PRIMARY KEY (id),
  CONSTRAINT appointment_slots_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT appointment_slots_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES public.staff(id)
);

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  order_id uuid,
  location_id uuid,
  slot_id uuid,
  appointment_number text UNIQUE,
  appointment_type text DEFAULT 'blood_draw'::text CHECK (appointment_type = ANY (ARRAY['blood_draw'::text, 'consultation'::text, 'follow_up'::text, 'collection_only'::text])),
  scheduled_date date NOT NULL,
  scheduled_time time without time zone NOT NULL,
  appointment_date date,
  appointment_time time without time zone,
  duration_minutes integer DEFAULT 30,
  estimated_duration integer DEFAULT 30,
  status text DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'checked_in'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text, 'rescheduled'::text])),
  assigned_staff_id uuid,
  checked_in_by uuid,
  completed_by uuid,
  special_instructions text,
  patient_notes text,
  accessibility_needs jsonb DEFAULT '{}'::jsonb,
  language_preference text,
  confirmation_sent boolean DEFAULT false,
  confirmation_sent_at timestamp with time zone,
  reminder_sent boolean DEFAULT false,
  reminder_24h_sent boolean DEFAULT false,
  reminder_24h_sent_at timestamp with time zone,
  reminder_1h_sent boolean DEFAULT false,
  reminder_1h_sent_at timestamp with time zone,
  check_in_time timestamp with time zone,
  start_time timestamp with time zone,
  completion_time timestamp with time zone,
  pre_appointment_notes text,
  post_appointment_notes text,
  follow_up_required boolean DEFAULT false,
  follow_up_notes text,
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  cancelled_by uuid,
  rescheduled_from uuid,
  original_appointment_id uuid,
  reschedule_reason text,
  no_show boolean DEFAULT false,
  purchase_order_id uuid,
  swell_order_id character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT appointments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT appointments_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id),
  CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.appointment_slots(id),
  CONSTRAINT appointments_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES public.staff(id),
  CONSTRAINT appointments_checked_in_by_fkey FOREIGN KEY (checked_in_by) REFERENCES public.staff(id),
  CONSTRAINT appointments_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.staff(id),
  CONSTRAINT appointments_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.staff(id),
  CONSTRAINT appointments_rescheduled_from_fkey FOREIGN KEY (rescheduled_from) REFERENCES public.appointments(id),
  CONSTRAINT appointments_original_appointment_id_fkey FOREIGN KEY (original_appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT appointments_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.orders(id),
  CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id)
);

-- ================================================================
-- TEST RESULTS & HEALTH DATA
-- ================================================================

CREATE TABLE public.test_results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  order_id uuid,
  appointment_id uuid,
  test_id uuid,
  lab_report_number text,
  lab_name text,
  lab_location text,
  sample_collection_date timestamp with time zone,
  sample_type text,
  sample_quality text,
  received_at_lab timestamp with time zone,
  processing_started_at timestamp with time zone,
  processing_completed_at timestamp with time zone,
  result_date timestamp with time zone,
  results_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_lab_data jsonb DEFAULT '{}'::jsonb,
  overall_status text DEFAULT 'pending'::text CHECK (overall_status = ANY (ARRAY['pending'::text, 'processing'::text, 'normal'::text, 'abnormal'::text, 'critical'::text, 'cancelled'::text])),
  abnormal_flags jsonb DEFAULT '[]'::jsonb,
  critical_values jsonb DEFAULT '[]'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  provider_interpretation text,
  recommendations text,
  follow_up_required boolean DEFAULT false,
  patient_notified boolean DEFAULT false,
  notification_sent_at timestamp with time zone,
  notification_method text,
  patient_viewed boolean DEFAULT false,
  patient_viewed_at timestamp with time zone,
  quality_control_passed boolean DEFAULT false,
  quality_control_notes text,
  requires_retest boolean DEFAULT false,
  retest_reason text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT test_results_pkey PRIMARY KEY (id),
  CONSTRAINT test_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT test_results_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT test_results_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.diagnostic_tests(id),
  CONSTRAINT test_results_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.staff(id),
  CONSTRAINT test_results_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id)
);

-- ================================================================
-- SUPPORTING TABLES
-- ================================================================

-- Payment Methods
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider character varying NOT NULL,
  token character varying NOT NULL,
  last_four character varying,
  brand character varying,
  exp_month integer,
  exp_year integer,
  is_default boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

-- User Preferences
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  notification_email boolean DEFAULT true,
  notification_sms boolean DEFAULT true,
  notification_push boolean DEFAULT true,
  theme_preference text DEFAULT 'system'::text CHECK (theme_preference = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text])),
  language text DEFAULT 'en'::text,
  timezone text DEFAULT 'America/New_York'::text,
  share_data_for_research boolean DEFAULT false,
  receive_marketing boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  staff_id uuid,
  session_id text,
  action text NOT NULL,
  action_category text CHECK (action_category = ANY (ARRAY['authentication'::text, 'data_access'::text, 'data_modification'::text, 'system'::text, 'security'::text, 'admin'::text])),
  resource_type text,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  affected_fields jsonb DEFAULT '[]'::jsonb,
  ip_address inet,
  user_agent text,
  request_id text,
  endpoint text,
  http_method text,
  success boolean DEFAULT true,
  error_message text,
  risk_level text DEFAULT 'low'::text CHECK (risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  requires_review boolean DEFAULT false,
  phi_accessed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);

-- ================================================================
-- BOOTSTRAP DATA REQUIREMENTS
-- ================================================================

-- Required Staff Roles:
-- - Super Administrator (level 100, admin)
-- - Administrator (level 90, admin)
-- - Lab Technician (level 50)
-- - Customer Service (level 30)
-- - Read Only (level 10)

-- Required Staff Departments:
-- - Administration
-- - Laboratory
-- - Customer Service
-- - IT/Technical

-- ================================================================
-- NOTES
-- ================================================================

-- 1. This schema represents the current working state as of January 2025
-- 2. All circular dependencies have been resolved
-- 3. RLS policies are in place for security
-- 4. Staff table supports proper admin user management
-- 5. Integration with Swell.is for e-commerce functionality
-- 6. Full HIPAA compliance with audit logging
-- 7. Support for both authenticated users and guest orders
-- 8. Complete appointment scheduling and results management

-- End of Current Database Schema