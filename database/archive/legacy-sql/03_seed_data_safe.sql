-- =====================================================
-- Prism Health Lab - Safe Seed Data for Development & Testing
-- =====================================================
-- 
-- Safe seed data that handles existing data gracefully
-- Uses INSERT ON CONFLICT to avoid duplicate key errors
-- =====================================================

-- Disable triggers during seeding to avoid audit log noise
SET session_replication_role = replica;

-- =====================================================
-- TEST CATEGORIES (Safe Insert)
-- =====================================================

INSERT INTO test_categories (id, name, description, slug, icon, color_theme, sort_order, is_featured, is_active) VALUES
-- Core Health Categories
('550e8400-e29b-41d4-a716-446655440001', 'Comprehensive Health', 'Complete health assessment panels covering all major body systems', 'comprehensive-health-phl', 'heart-pulse', '#06b6d4', 1, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'Heart Health Advanced', 'Cardiovascular risk assessment and heart disease screening', 'heart-health-advanced-phl', 'heart', '#ef4444', 2, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'Hormone Health Complete', 'Comprehensive hormone testing and endocrine function', 'hormone-health-complete-phl', 'balance-scale', '#8b5cf6', 3, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'Metabolic Health Pro', 'Diabetes, metabolism, and weight management screening', 'metabolic-health-pro-phl', 'chart-line', '#10b981', 4, true, true),
('550e8400-e29b-41d4-a716-446655440005', 'Immune System Plus', 'Immune function and autoimmune disease screening', 'immune-system-plus-phl', 'shield', '#f59e0b', 5, false, true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DIAGNOSTIC TESTS (Safe Insert)
-- =====================================================

INSERT INTO diagnostic_tests (id, name, description, category_id, test_code, swell_product_id, base_price, 
                             fasting_required, fasting_duration_hours, turnaround_time_business_days, is_active, is_featured) VALUES
-- Comprehensive Health Tests
('770e8400-e29b-41d4-a716-446655440001', 'Essential Health Panel PHL', 
 'Comprehensive metabolic panel including glucose, cholesterol, thyroid, and vitamin D testing', 
 '550e8400-e29b-41d4-a716-446655440001', 'EHP001', 'swell_essential_health_phl', 299.00, true, 12, 2, true, true),

('770e8400-e29b-41d4-a716-446655440002', 'Advanced Cardiac Risk Assessment PHL', 
 'In-depth cardiovascular risk analysis with advanced lipid profile and inflammatory markers',
 '550e8400-e29b-41d4-a716-446655440002', 'ACRA001', 'swell_cardiac_advanced_phl', 449.00, true, 12, 3, true, true),

('770e8400-e29b-41d4-a716-446655440003', 'Complete Hormone Panel PHL', 
 'Comprehensive hormone testing including thyroid, adrenal, and reproductive hormones',
 '550e8400-e29b-41d4-a716-446655440003', 'CHP001', 'swell_hormone_complete_phl', 399.00, false, 0, 3, true, true),

('770e8400-e29b-41d4-a716-446655440004', 'Metabolic Health Screen PHL', 
 'Diabetes and metabolic syndrome screening with insulin resistance markers',
 '550e8400-e29b-41d4-a716-446655440004', 'MHS001', 'swell_metabolic_screen_phl', 199.00, true, 8, 2, true, false)
ON CONFLICT (test_code) DO NOTHING;

-- =====================================================
-- LOCATIONS (Safe Insert)
-- =====================================================

INSERT INTO locations (id, name, location_code, address_line_1, city, state, zip_code, phone, email, 
                      operating_hours, timezone, capacity, is_active, accepts_walk_ins) VALUES
-- Major Metropolitan Areas
('660e8400-e29b-41d4-a716-446655440001', 'Prism Health Lab - Manhattan Flagship', 'PHL-NYC-001', 
 '123 Madison Avenue', 'New York', 'NY', '10016', '(212) 555-0101', 'manhattan@prismhealthlab.com',
 '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "8:00-16:00", "sunday": "closed"}'::jsonb,
 'America/New_York', 30, true, false),

('660e8400-e29b-41d4-a716-446655440002', 'Prism Health Lab - Brooklyn Center', 'PHL-NYC-002',
 '456 Atlantic Avenue', 'Brooklyn', 'NY', '11217', '(718) 555-0102', 'brooklyn@prismhealthlab.com',
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "9:00-15:00", "sunday": "closed"}'::jsonb,
 'America/New_York', 20, true, true),

('660e8400-e29b-41d4-a716-446655440003', 'Prism Health Lab - Los Angeles Main', 'PHL-LAX-001',
 '789 Wilshire Boulevard', 'Los Angeles', 'CA', '90017', '(213) 555-0103', 'losangeles@prismhealthlab.com',
 '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "8:00-16:00", "sunday": "closed"}'::jsonb,
 'America/Los_Angeles', 25, true, false)
ON CONFLICT (location_code) DO NOTHING;

-- =====================================================
-- STAFF ROLES AND DEPARTMENTS (Safe Insert)
-- =====================================================

INSERT INTO staff_departments (id, name, description, is_active) VALUES
('110e8400-e29b-41d4-a716-446655440001', 'Laboratory Operations', 'Core laboratory testing and processing', true),
('110e8400-e29b-41d4-a716-446655440002', 'Patient Services', 'Customer service and patient support', true),
('110e8400-e29b-41d4-a716-446655440003', 'Clinical Affairs', 'Medical oversight and result review', true),
('110e8400-e29b-41d4-a716-446655440004', 'Administration', 'Management and administrative functions', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO staff_roles (id, name, description, level, default_permissions, is_admin_role, is_active) VALUES
('220e8400-e29b-41d4-a716-446655440001', 'Lab Technician', 'Laboratory testing and sample processing', 2, '["sample_processing", "equipment_operation"]'::jsonb, false, true),
('220e8400-e29b-41d4-a716-446655440002', 'Phlebotomist', 'Blood draw and sample collection', 1, '["sample_collection", "patient_interaction"]'::jsonb, false, true),
('220e8400-e29b-41d4-a716-446655440003', 'Lab Manager', 'Laboratory management and oversight', 4, '["lab_management", "staff_supervision", "quality_control"]'::jsonb, true, true),
('220e8400-e29b-41d4-a716-446655440004', 'Medical Director', 'Clinical oversight and result review', 5, '["clinical_oversight", "result_review", "patient_data_access"]'::jsonb, true, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CONDITIONAL DATA INSERTS (Only if tables are empty)
-- =====================================================

-- Only insert sample profiles if table is relatively empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM profiles) < 10 THEN
        INSERT INTO profiles (id, user_id, first_name, last_name, email, phone, date_of_birth, gender, 
                             address_line_1, city, state, zip_code, is_active) VALUES
        ('330e8400-e29b-41d4-a716-446655440001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John', 'Smith', 'john.smith@example.com', 
         '(555) 123-4567', '1985-03-15', 'male', '123 Main Street', 'New York', 'NY', '10001', true),
         
        ('330e8400-e29b-41d4-a716-446655440002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah', 'Johnson', 'sarah.johnson@example.com',
         '(555) 987-6543', '1990-07-22', 'female', '456 Oak Avenue', 'Brooklyn', 'NY', '11201', true),
         
        ('330e8400-e29b-41d4-a716-446655440003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Michael', 'Davis', 'michael.davis@example.com',
         '(555) 456-7890', '1978-11-08', 'male', '789 Pine Street', 'Los Angeles', 'CA', '90210', true);
         
        RAISE NOTICE 'Sample profiles inserted';
    ELSE
        RAISE NOTICE 'Profiles table already has data, skipping sample profiles';
    END IF;
END $$;

-- Only insert sample staff if table is relatively empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM staff) < 5 THEN
        INSERT INTO staff (id, user_id, employee_id, role_id, department_id, work_email, hire_date, 
                          employment_status, can_access_admin, is_active) VALUES
        ('440e8400-e29b-41d4-a716-446655440001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'EMP001', '220e8400-e29b-41d4-a716-446655440004', '110e8400-e29b-41d4-a716-446655440003', 
         'dr.wilson@prismhealthlab.com', '2020-01-15', 'active', true, true),
         
        ('440e8400-e29b-41d4-a716-446655440002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'EMP002', '220e8400-e29b-41d4-a716-446655440003', '110e8400-e29b-41d4-a716-446655440001',
         'lab.manager@prismhealthlab.com', '2021-03-01', 'active', true, true),
         
        ('440e8400-e29b-41d4-a716-446655440003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'EMP003', '220e8400-e29b-41d4-a716-446655440002', '110e8400-e29b-41d4-a716-446655440002',
         'phlebotomist@prismhealthlab.com', '2022-06-15', 'active', false, true);
         
        RAISE NOTICE 'Sample staff inserted';
    ELSE
        RAISE NOTICE 'Staff table already has data, skipping sample staff';
    END IF;
END $$;

-- =====================================================
-- SYSTEM SETTINGS (Safe Insert)
-- =====================================================

INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description, category, is_sensitive) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'lab_contact_email', '"support@prismhealthlab.com"'::jsonb, 'string', 'Primary contact email', 'communication', false),
('550e8400-e29b-41d4-a716-446655440012', 'appointment_reminder_hours', '24'::jsonb, 'number', 'Hours before appointment to send reminder', 'appointments', false),
('550e8400-e29b-41d4-a716-446655440013', 'max_results_retention_days', '2555'::jsonb, 'number', 'Days to retain test results (7 years)', 'compliance', false),
('550e8400-e29b-41d4-a716-446655440014', 'enable_sms_notifications', 'true'::jsonb, 'boolean', 'Enable SMS notifications system-wide', 'communication', false)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- =====================================================
-- NOTIFICATION TEMPLATES (Safe Insert)
-- =====================================================

INSERT INTO notification_templates (id, name, template_type, category, subject, body_text, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440011', 'Results Available PHL', 'email', 'results', 'Your test results are ready', 
 'Your test results for {{test_name}} are now available in your patient portal.', true),
 
('660e8400-e29b-41d4-a716-446655440012', 'Appointment Reminder PHL', 'sms', 'appointment', '', 
 'Reminder: You have an appointment tomorrow at {{time}} for {{test_name}} at {{location}}.', true),
 
('660e8400-e29b-41d4-a716-446655440013', 'Abnormal Results Alert PHL', 'email', 'results', 'Important: Review your test results',
 'Your recent test results contain values that require attention. Please log in to review.', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SAMPLE DATA ONLY FOR EMPTY TABLES
-- =====================================================

-- Add sample orders only if orders table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM orders) = 0 THEN
        INSERT INTO orders (id, swell_order_id, swell_order_number, user_id, customer_email, customer_name,
                           subtotal, tax_amount, total, status, payment_status, items,
                           requires_appointment, appointment_scheduled) VALUES
        ('770e8400-e29b-41d4-a716-446655445001', 'swell_phl_12345', 'PHL-2024-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
         'john.smith@example.com', 'John Smith', 299.00, 23.92, 322.92, 'completed', 'captured',
         '[{"test_id": "770e8400-e29b-41d4-a716-446655440001", "test_name": "Essential Health Panel PHL", "quantity": 1, "price": 299.00}]'::jsonb,
         true, true),

        ('770e8400-e29b-41d4-a716-446655445002', 'swell_phl_12346', 'PHL-2024-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
         'sarah.johnson@example.com', 'Sarah Johnson', 449.00, 35.92, 484.92, 'processing', 'captured',
         '[{"test_id": "770e8400-e29b-41d4-a716-446655440002", "test_name": "Advanced Cardiac Risk Assessment PHL", "quantity": 1, "price": 449.00}]'::jsonb,
         true, true);
         
        RAISE NOTICE 'Sample orders inserted';
    ELSE
        RAISE NOTICE 'Orders table already has data, skipping sample orders';
    END IF;
END $$;

-- Add sample user preferences for the sample users
INSERT INTO user_preferences (user_id, notification_email, notification_sms, notification_push,
                             theme_preference, language, timezone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, true, true, 'system', 'en', 'America/New_York'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, false, true, 'dark', 'en', 'America/New_York'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, false, 'light', 'en', 'America/Los_Angeles')
ON CONFLICT (user_id) DO NOTHING;

-- Re-enable triggers after seeding
SET session_replication_role = DEFAULT;

-- =====================================================
-- SUCCESS MESSAGE AND SUMMARY
-- =====================================================

SELECT 
    'Safe seed data deployment completed!' as result,
    'Data inserted only where no conflicts exist' as strategy,
    (SELECT COUNT(*) FROM test_categories) as test_categories_total,
    (SELECT COUNT(*) FROM diagnostic_tests) as diagnostic_tests_total,
    (SELECT COUNT(*) FROM locations) as locations_total,
    (SELECT COUNT(*) FROM staff_roles) as staff_roles_total,
    (SELECT COUNT(*) FROM staff_departments) as staff_departments_total,
    (SELECT COUNT(*) FROM system_settings) as system_settings_total,
    (SELECT COUNT(*) FROM notification_templates) as notification_templates_total;