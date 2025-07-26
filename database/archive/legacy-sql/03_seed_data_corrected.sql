-- =====================================================
-- Prism Health Lab - Seed Data for Development & Testing
-- =====================================================
-- 
-- Fixed seed data that matches your existing schema structure
-- This uses proper UUIDs and correct column names
-- =====================================================

-- Disable triggers during seeding to avoid audit log noise
SET session_replication_role = replica;

-- =====================================================
-- TEST CATEGORIES
-- =====================================================

INSERT INTO test_categories (id, name, description, slug, icon, color_theme, sort_order, is_featured, is_active) VALUES
-- Core Health Categories
('550e8400-e29b-41d4-a716-446655440001', 'Comprehensive Health', 'Complete health assessment panels covering all major body systems', 'comprehensive-health', 'heart-pulse', '#06b6d4', 1, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'Heart Health', 'Cardiovascular risk assessment and heart disease screening', 'heart-health', 'heart', '#ef4444', 2, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'Hormone Health', 'Comprehensive hormone testing and endocrine function', 'hormone-health', 'balance-scale', '#8b5cf6', 3, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'Metabolic Health', 'Diabetes, metabolism, and weight management screening', 'metabolic-health', 'chart-line', '#10b981', 4, true, true),
('550e8400-e29b-41d4-a716-446655440005', 'Immune System', 'Immune function and autoimmune disease screening', 'immune-system', 'shield', '#f59e0b', 5, false, true);

-- =====================================================
-- DIAGNOSTIC TESTS
-- =====================================================

INSERT INTO diagnostic_tests (id, name, description, category_id, test_code, swell_product_id, base_price, 
                             fasting_required, fasting_duration_hours, turnaround_time_business_days, is_active, is_featured) VALUES
-- Comprehensive Health Tests
('770e8400-e29b-41d4-a716-446655440001', 'Essential Health Panel', 
 'Comprehensive metabolic panel including glucose, cholesterol, thyroid, and vitamin D testing', 
 '550e8400-e29b-41d4-a716-446655440001', 'EHP001', 'swell_essential_health', 299.00, true, 12, 2, true, true),

('770e8400-e29b-41d4-a716-446655440002', 'Advanced Cardiac Risk Assessment', 
 'In-depth cardiovascular risk analysis with advanced lipid profile and inflammatory markers',
 '550e8400-e29b-41d4-a716-446655440002', 'ACRA001', 'swell_cardiac_advanced', 449.00, true, 12, 3, true, true),

('770e8400-e29b-41d4-a716-446655440003', 'Complete Hormone Panel', 
 'Comprehensive hormone testing including thyroid, adrenal, and reproductive hormones',
 '550e8400-e29b-41d4-a716-446655440003', 'CHP001', 'swell_hormone_complete', 399.00, false, 0, 3, true, true),

('770e8400-e29b-41d4-a716-446655440004', 'Metabolic Health Screen', 
 'Diabetes and metabolic syndrome screening with insulin resistance markers',
 '550e8400-e29b-41d4-a716-446655440004', 'MHS001', 'swell_metabolic_screen', 199.00, true, 8, 2, true, false);

-- =====================================================
-- LOCATIONS (Using your existing structure)
-- =====================================================

INSERT INTO locations (id, name, location_code, address_line_1, city, state, zip_code, phone, email, 
                      operating_hours, timezone, capacity, is_active, accepts_walk_ins) VALUES
-- Major Metropolitan Areas
('660e8400-e29b-41d4-a716-446655440001', 'Prism Health Lab - Manhattan', 'PHL-NYC-001', 
 '123 Madison Avenue', 'New York', 'NY', '10016', '(212) 555-0101', 'manhattan@prismhealthlab.com',
 '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "8:00-16:00", "sunday": "closed"}'::jsonb,
 'America/New_York', 30, true, false),

('660e8400-e29b-41d4-a716-446655440002', 'Prism Health Lab - Brooklyn', 'PHL-NYC-002',
 '456 Atlantic Avenue', 'Brooklyn', 'NY', '11217', '(718) 555-0102', 'brooklyn@prismhealthlab.com',
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "9:00-15:00", "sunday": "closed"}'::jsonb,
 'America/New_York', 20, true, true),

('660e8400-e29b-41d4-a716-446655440003', 'Prism Health Lab - Los Angeles', 'PHL-LAX-001',
 '789 Wilshire Boulevard', 'Los Angeles', 'CA', '90017', '(213) 555-0103', 'losangeles@prismhealthlab.com',
 '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "8:00-16:00", "sunday": "closed"}'::jsonb,
 'America/Los_Angeles', 25, true, false);

-- =====================================================
-- STAFF ROLES AND DEPARTMENTS
-- =====================================================

INSERT INTO staff_departments (id, name, description, is_active) VALUES
('dept_001', 'Laboratory Operations', 'Core laboratory testing and processing', true),
('dept_002', 'Patient Services', 'Customer service and patient support', true),
('dept_003', 'Clinical Affairs', 'Medical oversight and result review', true),
('dept_004', 'Administration', 'Management and administrative functions', true);

INSERT INTO staff_roles (id, name, description, level, default_permissions, is_admin_role, is_active) VALUES
('role_001', 'Lab Technician', 'Laboratory testing and sample processing', 2, '["sample_processing", "equipment_operation"]'::jsonb, false, true),
('role_002', 'Phlebotomist', 'Blood draw and sample collection', 1, '["sample_collection", "patient_interaction"]'::jsonb, false, true),
('role_003', 'Lab Manager', 'Laboratory management and oversight', 4, '["lab_management", "staff_supervision", "quality_control"]'::jsonb, true, true),
('role_004', 'Medical Director', 'Clinical oversight and result review', 5, '["clinical_oversight", "result_review", "patient_data_access"]'::jsonb, true, true);

-- =====================================================
-- SAMPLE USER PROFILES
-- =====================================================

-- Note: These would normally be created through Supabase Auth
-- This is just for reference - actual users need auth.users entries first
INSERT INTO profiles (id, user_id, first_name, last_name, email, phone, date_of_birth, gender, 
                     address_line_1, city, state, zip_code, is_active) VALUES
('profile_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John', 'Smith', 'john.smith@example.com', 
 '(555) 123-4567', '1985-03-15', 'male', '123 Main Street', 'New York', 'NY', '10001', true),
 
('profile_002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah', 'Johnson', 'sarah.johnson@example.com',
 '(555) 987-6543', '1990-07-22', 'female', '456 Oak Avenue', 'Brooklyn', 'NY', '11201', true),
 
('profile_003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Michael', 'Davis', 'michael.davis@example.com',
 '(555) 456-7890', '1978-11-08', 'male', '789 Pine Street', 'Los Angeles', 'CA', '90210', true);

-- =====================================================
-- SAMPLE STAFF
-- =====================================================

INSERT INTO staff (id, user_id, employee_id, role_id, department_id, work_email, hire_date, 
                  employment_status, can_access_admin, is_active) VALUES
('staff_001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'EMP001', 'role_004', 'dept_003', 
 'dr.wilson@prismhealthlab.com', '2020-01-15', 'active', true, true),
 
('staff_002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'EMP002', 'role_003', 'dept_001',
 'lab.manager@prismhealthlab.com', '2021-03-01', 'active', true, true),
 
('staff_003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'EMP003', 'role_002', 'dept_002',
 'phlebotomist@prismhealthlab.com', '2022-06-15', 'active', false, true);

-- =====================================================
-- SAMPLE ORDERS
-- =====================================================

INSERT INTO orders (id, swell_order_id, swell_order_number, user_id, customer_email, customer_name,
                   subtotal, tax_amount, total, status, payment_status, items,
                   requires_appointment, appointment_scheduled) VALUES
('order_001', 'swell_12345', 'PHL-2024-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'john.smith@example.com', 'John Smith', 299.00, 23.92, 322.92, 'completed', 'captured',
 '[{"test_id": "770e8400-e29b-41d4-a716-446655440001", "test_name": "Essential Health Panel", "quantity": 1, "price": 299.00}]'::jsonb,
 true, true),

('order_002', 'swell_12346', 'PHL-2024-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'sarah.johnson@example.com', 'Sarah Johnson', 449.00, 35.92, 484.92, 'processing', 'captured',
 '[{"test_id": "770e8400-e29b-41d4-a716-446655440002", "test_name": "Advanced Cardiac Risk Assessment", "quantity": 1, "price": 449.00}]'::jsonb,
 true, true);

-- =====================================================
-- SAMPLE APPOINTMENTS
-- =====================================================

INSERT INTO appointments (id, user_id, order_id, location_id, appointment_number, appointment_type,
                         scheduled_date, scheduled_time, status, assigned_staff_id, confirmation_sent) VALUES
('appt_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'order_001', '660e8400-e29b-41d4-a716-446655440001',
 'APT-2024-001', 'blood_draw', '2024-07-30', '09:00:00', 'completed', 'staff_003', true),

('appt_002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'order_002', '660e8400-e29b-41d4-a716-446655440002',
 'APT-2024-002', 'blood_draw', '2024-08-02', '10:30:00', 'scheduled', 'staff_003', true);

-- =====================================================
-- SAMPLE TEST RESULTS
-- =====================================================

INSERT INTO test_results (id, user_id, order_id, test_id, appointment_id, lab_report_number,
                         sample_collection_date, result_date, results_data, overall_status,
                         patient_notified, reviewed_by) VALUES
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'order_001', '770e8400-e29b-41d4-a716-446655440001', 
 'appt_001', 'LAB-2024-001', '2024-07-30 09:15:00-04', '2024-08-01 14:30:00-04',
 '{
   "glucose": {"value": 92, "unit": "mg/dL", "reference_range": "70-99", "status": "normal"},
   "total_cholesterol": {"value": 185, "unit": "mg/dL", "reference_range": "<200", "status": "normal"},
   "HDL": {"value": 55, "unit": "mg/dL", "reference_range": ">40", "status": "normal"},
   "LDL": {"value": 108, "unit": "mg/dL", "reference_range": "<100", "status": "borderline_high"},
   "triglycerides": {"value": 110, "unit": "mg/dL", "reference_range": "<150", "status": "normal"},
   "TSH": {"value": 2.1, "unit": "mIU/L", "reference_range": "0.4-4.0", "status": "normal"},
   "vitamin_d": {"value": 28, "unit": "ng/mL", "reference_range": "30-100", "status": "low"}
 }'::jsonb, 'normal', true, 'staff_001');

-- =====================================================
-- USER PREFERENCES
-- =====================================================

INSERT INTO user_preferences (id, user_id, notification_email, notification_sms, notification_push,
                             theme_preference, language, timezone) VALUES
('pref_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, true, true, 'system', 'en', 'America/New_York'),
('pref_002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, false, true, 'dark', 'en', 'America/New_York'),
('pref_003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, false, 'light', 'en', 'America/Los_Angeles');

-- =====================================================
-- NOTIFICATION TEMPLATES
-- =====================================================

INSERT INTO notification_templates (id, name, template_type, category, subject, body_text, is_active) VALUES
('tmpl_001', 'Results Available', 'email', 'results', 'Your test results are ready', 
 'Your test results for {{test_name}} are now available in your patient portal.', true),
 
('tmpl_002', 'Appointment Reminder', 'sms', 'appointment', '', 
 'Reminder: You have an appointment tomorrow at {{time}} for {{test_name}} at {{location}}.', true),
 
('tmpl_003', 'Abnormal Results Alert', 'email', 'results', 'Important: Review your test results',
 'Your recent test results contain values that require attention. Please log in to review.', true);

-- =====================================================
-- SYSTEM SETTINGS
-- =====================================================

INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description, category, is_sensitive) VALUES
('setting_001', 'lab_contact_email', '"support@prismhealthlab.com"'::jsonb, 'string', 'Primary contact email', 'communication', false),
('setting_002', 'appointment_reminder_hours', '24'::jsonb, 'number', 'Hours before appointment to send reminder', 'appointments', false),
('setting_003', 'max_results_retention_days', '2555'::jsonb, 'number', 'Days to retain test results (7 years)', 'compliance', false),
('setting_004', 'enable_sms_notifications', 'true'::jsonb, 'boolean', 'Enable SMS notifications system-wide', 'communication', false);

-- Re-enable triggers after seeding
SET session_replication_role = DEFAULT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Seed data loaded successfully!' as result,
    (SELECT COUNT(*) FROM test_categories) as test_categories_loaded,
    (SELECT COUNT(*) FROM diagnostic_tests) as diagnostic_tests_loaded,
    (SELECT COUNT(*) FROM locations) as locations_loaded,
    (SELECT COUNT(*) FROM profiles) as profiles_loaded,
    (SELECT COUNT(*) FROM orders) as orders_loaded,
    (SELECT COUNT(*) FROM appointments) as appointments_loaded,
    (SELECT COUNT(*) FROM test_results) as test_results_loaded;