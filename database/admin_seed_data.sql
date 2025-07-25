-- ================================================================
-- PRISM HEALTH LAB - ADMIN SEED DATA
-- ================================================================
-- Initial data setup for admin dashboard functionality
-- Includes roles, permissions, locations, and system configuration
-- ================================================================

-- ================================================================
-- STAFF ROLES AND PERMISSIONS SETUP
-- ================================================================

-- Insert default staff roles
INSERT INTO public.staff_roles (id, name, description, level, default_permissions, is_admin_role, is_active) VALUES
    (gen_random_uuid(), 'superadmin', 'Super Administrator - Full system access', 5, 
     '["*"]'::jsonb, true, true),
    (gen_random_uuid(), 'admin', 'System Administrator - Full admin access', 4, 
     '["view_users", "edit_users", "view_appointments", "edit_appointments", "view_results", "upload_results", "approve_results", "view_orders", "process_orders", "manage_inventory", "view_analytics", "audit_logs"]'::jsonb, true, true),
    (gen_random_uuid(), 'manager', 'Department Manager - Limited admin access', 3, 
     '["view_users", "view_appointments", "edit_appointments", "view_results", "view_orders", "view_analytics"]'::jsonb, true, true),
    (gen_random_uuid(), 'lab_technician', 'Laboratory Technician - Results management', 2, 
     '["view_results", "upload_results", "view_appointments"]'::jsonb, false, true),
    (gen_random_uuid(), 'phlebotomist', 'Phlebotomist - Appointment and sample collection', 2, 
     '["view_appointments", "edit_appointments", "view_users"]'::jsonb, false, true),
    (gen_random_uuid(), 'nurse', 'Registered Nurse - Patient care and results', 2, 
     '["view_users", "view_appointments", "edit_appointments", "view_results"]'::jsonb, false, true),
    (gen_random_uuid(), 'receptionist', 'Receptionist - Customer service and scheduling', 1, 
     '["view_appointments", "edit_appointments", "view_users"]'::jsonb, false, true);

-- ================================================================
-- STAFF DEPARTMENTS
-- ================================================================

-- Insert default departments
INSERT INTO public.staff_departments (id, name, description, is_active) VALUES
    (gen_random_uuid(), 'Administration', 'Administrative and management staff', true),
    (gen_random_uuid(), 'Laboratory', 'Laboratory technicians and analysts', true),
    (gen_random_uuid(), 'Clinical', 'Nurses and clinical staff', true),
    (gen_random_uuid(), 'Customer Service', 'Reception and customer support', true),
    (gen_random_uuid(), 'IT', 'Information technology and systems', true),
    (gen_random_uuid(), 'Quality Assurance', 'Quality control and compliance', true);

-- ================================================================
-- SAMPLE LOCATIONS
-- ================================================================

-- Insert sample locations
INSERT INTO public.locations (id, name, location_code, address_line_1, city, state, zip_code, phone, email, operating_hours, timezone, capacity, services_offered, is_active) VALUES
    (gen_random_uuid(), 'Downtown Medical Center', 'DMC001', '123 Health Avenue', 'Chicago', 'IL', '60601', 
     '(312) 555-0101', 'downtown@prismhealthlab.com',
     '{"monday": {"start": "07:00", "end": "18:00"}, "tuesday": {"start": "07:00", "end": "18:00"}, "wednesday": {"start": "07:00", "end": "18:00"}, "thursday": {"start": "07:00", "end": "18:00"}, "friday": {"start": "07:00", "end": "18:00"}, "saturday": {"start": "08:00", "end": "16:00"}, "sunday": {"closed": true}}'::jsonb,
     'America/Chicago', 15, '["blood_draw", "specimen_collection", "basic_diagnostics"]'::jsonb, true),

    (gen_random_uuid(), 'North Campus Laboratory', 'NCL002', '456 Medical Plaza Drive', 'Chicago', 'IL', '60614', 
     '(312) 555-0102', 'north@prismhealthlab.com',
     '{"monday": {"start": "06:00", "end": "20:00"}, "tuesday": {"start": "06:00", "end": "20:00"}, "wednesday": {"start": "06:00", "end": "20:00"}, "thursday": {"start": "06:00", "end": "20:00"}, "friday": {"start": "06:00", "end": "20:00"}, "saturday": {"start": "07:00", "end": "18:00"}, "sunday": {"start": "08:00", "end": "16:00"}}'::jsonb,
     'America/Chicago', 25, '["blood_draw", "specimen_collection", "advanced_diagnostics", "imaging"]'::jsonb, true),

    (gen_random_uuid(), 'South Medical Plaza', 'SMP003', '789 Wellness Boulevard', 'Chicago', 'IL', '60629', 
     '(312) 555-0103', 'south@prismhealthlab.com',
     '{"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}, "saturday": {"start": "09:00", "end": "15:00"}, "sunday": {"closed": true}}'::jsonb,
     'America/Chicago', 10, '["blood_draw", "specimen_collection"]'::jsonb, true);

-- ================================================================
-- TEST CATEGORIES AND DIAGNOSTIC TESTS
-- ================================================================

-- Insert test categories
INSERT INTO public.test_categories (id, name, description, slug, icon, color_theme, sort_order, is_active, is_featured) VALUES
    (gen_random_uuid(), 'General Health', 'Comprehensive health screening panels', 'general-health', 'health-check', 'emerald', 1, true, true),
    (gen_random_uuid(), 'Heart Health', 'Cardiovascular and cardiac biomarkers', 'heart-health', 'heart', 'rose', 2, true, true),
    (gen_random_uuid(), 'Metabolic Health', 'Diabetes, cholesterol, and metabolic markers', 'metabolic-health', 'metabolism', 'blue', 3, true, true),
    (gen_random_uuid(), 'Hormone Testing', 'Endocrine and reproductive hormones', 'hormone-testing', 'hormones', 'purple', 4, true, true),
    (gen_random_uuid(), 'Nutrition & Vitamins', 'Vitamin levels and nutritional status', 'nutrition-vitamins', 'nutrition', 'amber', 5, true, false),
    (gen_random_uuid(), 'Infectious Disease', 'STD testing and infectious disease screening', 'infectious-disease', 'virus', 'cyan', 6, true, false);

-- Insert sample diagnostic tests
DO $$
DECLARE
    general_health_id UUID;
    heart_health_id UUID;
    metabolic_health_id UUID;
    hormone_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO general_health_id FROM public.test_categories WHERE slug = 'general-health';
    SELECT id INTO heart_health_id FROM public.test_categories WHERE slug = 'heart-health';
    SELECT id INTO metabolic_health_id FROM public.test_categories WHERE slug = 'metabolic-health';
    SELECT id INTO hormone_id FROM public.test_categories WHERE slug = 'hormone-testing';

    -- Insert diagnostic tests
    INSERT INTO public.diagnostic_tests (
        id, name, description, short_description, category_id, test_code, 
        key_biomarkers, sample_types, fasting_required, fasting_duration_hours,
        preparation_instructions, collection_time_minutes, processing_time_hours,
        turnaround_time_business_days, normal_ranges, base_price, is_active, is_featured
    ) VALUES
    -- General Health Tests
    (gen_random_uuid(), 'Complete Blood Count (CBC)', 
     'Comprehensive blood count analysis including white blood cells, red blood cells, hemoglobin, hematocrit, and platelet count.',
     'Complete blood cell analysis and counts',
     general_health_id, 'CBC001',
     '["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets", "MCV", "MCH", "MCHC"]'::jsonb,
     '["whole_blood"]'::jsonb, false, 0,
     '["No special preparation required", "Stay hydrated"]'::jsonb,
     10, 4, 1,
     '{"WBC": {"min": 4.5, "max": 11.0, "unit": "K/uL"}, "RBC": {"min": 4.0, "max": 5.5, "unit": "M/uL"}, "Hemoglobin": {"min": 12.0, "max": 16.0, "unit": "g/dL"}}'::jsonb,
     49.99, true, true),

    (gen_random_uuid(), 'Comprehensive Metabolic Panel (CMP)',
     'Complete metabolic panel including glucose, electrolytes, kidney function, and liver function tests.',
     'Complete metabolic and organ function panel',
     metabolic_health_id, 'CMP001',
     '["Glucose", "BUN", "Creatinine", "eGFR", "Sodium", "Potassium", "Chloride", "CO2", "ALT", "AST", "Total Protein", "Albumin", "Total Bilirubin", "Alkaline Phosphatase"]'::jsonb,
     '["serum"]'::jsonb, true, 12,
     '["Fast for 12 hours before test", "Only water permitted during fasting", "Take medications as prescribed"]'::jsonb,
     10, 6, 1,
     '{"Glucose": {"min": 70, "max": 99, "unit": "mg/dL"}, "BUN": {"min": 7, "max": 20, "unit": "mg/dL"}, "Creatinine": {"min": 0.6, "max": 1.3, "unit": "mg/dL"}}'::jsonb,
     89.99, true, true),

    -- Heart Health Tests
    (gen_random_uuid(), 'Lipid Panel',
     'Complete cholesterol profile including total cholesterol, HDL, LDL, and triglycerides.',
     'Complete cholesterol and lipid analysis',
     heart_health_id, 'LIPID001',
     '["Total Cholesterol", "HDL Cholesterol", "LDL Cholesterol", "Triglycerides", "Non-HDL Cholesterol", "Cholesterol/HDL Ratio"]'::jsonb,
     '["serum"]'::jsonb, true, 12,
     '["Fast for 9-12 hours before test", "Only water permitted during fasting", "Avoid alcohol 24 hours before test"]'::jsonb,
     10, 6, 1,
     '{"Total Cholesterol": {"min": 0, "max": 200, "unit": "mg/dL"}, "HDL Cholesterol": {"min": 40, "max": 999, "unit": "mg/dL"}, "LDL Cholesterol": {"min": 0, "max": 100, "unit": "mg/dL"}, "Triglycerides": {"min": 0, "max": 150, "unit": "mg/dL"}}'::jsonb,
     79.99, true, true),

    (gen_random_uuid(), 'High-Sensitivity C-Reactive Protein (hs-CRP)',
     'Marker of inflammation and cardiovascular risk assessment.',
     'Inflammation marker for heart disease risk',
     heart_health_id, 'HSCRP001',
     '["hs-CRP"]'::jsonb,
     '["serum"]'::jsonb, false, 0,
     '["No special preparation required"]'::jsonb,
     10, 4, 1,
     '{"hs-CRP": {"min": 0, "max": 3.0, "unit": "mg/L", "reference": "Low risk: <1.0, Average risk: 1.0-3.0, High risk: >3.0"}}'::jsonb,
     59.99, true, false),

    -- Hormone Tests
    (gen_random_uuid(), 'Thyroid Function Panel',
     'Complete thyroid function assessment including TSH, T3, and T4.',
     'Complete thyroid hormone evaluation',
     hormone_id, 'THYROID001',
     '["TSH", "Free T4", "Free T3", "Reverse T3"]'::jsonb,
     '["serum"]'::jsonb, false, 0,
     '["No special preparation required", "Inform lab of any thyroid medications"]'::jsonb,
     10, 8, 2,
     '{"TSH": {"min": 0.4, "max": 4.0, "unit": "mIU/L"}, "Free T4": {"min": 0.8, "max": 1.8, "unit": "ng/dL"}, "Free T3": {"min": 2.3, "max": 4.2, "unit": "pg/mL"}}'::jsonb,
     149.99, true, true),

    (gen_random_uuid(), 'Vitamin D, 25-Hydroxy',
     'Vitamin D status assessment for bone health and immune function.',
     'Vitamin D level for bone and immune health',
     general_health_id, 'VITD001',
     '["25-Hydroxy Vitamin D"]'::jsonb,
     '["serum"]'::jsonb, false, 0,
     '["No special preparation required"]'::jsonb,
     10, 4, 1,
     '{"25-Hydroxy Vitamin D": {"min": 30, "max": 100, "unit": "ng/mL", "reference": "Deficient: <20, Insufficient: 20-29, Sufficient: 30-100, Potential Toxicity: >100"}}'::jsonb,
     69.99, true, false);
END $$;

-- ================================================================
-- NOTIFICATION TEMPLATES
-- ================================================================

-- Insert default notification templates
INSERT INTO public.notification_templates (id, name, template_type, category, subject, body_text, body_html, available_variables) VALUES
    (gen_random_uuid(), 'appointment_confirmation', 'email', 'appointment',
     'Your Appointment is Confirmed - Prism Health Lab',
     'Dear {{first_name}}, your appointment at {{location_name}} on {{appointment_date}} at {{appointment_time}} is confirmed. Please arrive 15 minutes early and bring a valid ID.',
     '<p>Dear {{first_name}},</p><p>Your appointment at <strong>{{location_name}}</strong> on <strong>{{appointment_date}}</strong> at <strong>{{appointment_time}}</strong> is confirmed.</p><p>Please arrive 15 minutes early and bring a valid ID.</p>',
     '["first_name", "last_name", "appointment_date", "appointment_time", "location_name", "location_address"]'::jsonb),

    (gen_random_uuid(), 'appointment_reminder_24h', 'email', 'reminder',
     'Appointment Reminder - Tomorrow at Prism Health Lab',
     'Dear {{first_name}}, this is a reminder that you have an appointment tomorrow at {{location_name}} at {{appointment_time}}. {{preparation_instructions}}',
     '<p>Dear {{first_name}},</p><p>This is a reminder that you have an appointment tomorrow at <strong>{{location_name}}</strong> at <strong>{{appointment_time}}</strong>.</p><div>{{preparation_instructions}}</div>',
     '["first_name", "appointment_time", "location_name", "preparation_instructions"]'::jsonb),

    (gen_random_uuid(), 'results_available', 'email', 'results',
     'Your Test Results Are Ready - Prism Health Lab',
     'Dear {{first_name}}, your test results for {{test_name}} are now available in your patient portal. Please log in to view your results.',
     '<p>Dear {{first_name}},</p><p>Your test results for <strong>{{test_name}}</strong> are now available in your patient portal.</p><p><a href="{{portal_link}}">Click here to view your results</a></p>',
     '["first_name", "test_name", "portal_link"]'::jsonb),

    (gen_random_uuid(), 'appointment_reminder_sms', 'sms', 'reminder',
     NULL,
     'Reminder: You have an appointment tomorrow at {{location_name}} at {{appointment_time}}. Reply STOP to opt out.',
     NULL,
     '["location_name", "appointment_time"]'::jsonb);

-- ================================================================
-- SYSTEM SETTINGS
-- ================================================================

-- Insert default system settings
INSERT INTO public.system_settings (id, setting_key, setting_value, setting_type, description, category) VALUES
    (gen_random_uuid(), 'site_name', '"Prism Health Lab"'::jsonb, 'string', 'Name of the healthcare organization', 'general'),
    (gen_random_uuid(), 'default_timezone', '"America/New_York"'::jsonb, 'string', 'Default timezone for the system', 'general'),
    (gen_random_uuid(), 'appointment_duration_default', '30'::jsonb, 'number', 'Default appointment duration in minutes', 'appointments'),
    (gen_random_uuid(), 'appointment_buffer_time', '15'::jsonb, 'number', 'Buffer time between appointments in minutes', 'appointments'),
    (gen_random_uuid(), 'max_appointments_per_slot', '1'::jsonb, 'number', 'Maximum number of appointments per time slot', 'appointments'),
    (gen_random_uuid(), 'result_notification_delay_hours', '2'::jsonb, 'number', 'Hours to wait before sending result notifications', 'results'),
    (gen_random_uuid(), 'require_fasting_confirmation', 'true'::jsonb, 'boolean', 'Require patients to confirm fasting requirements', 'appointments'),
    (gen_random_uuid(), 'auto_send_appointment_confirmations', 'true'::jsonb, 'boolean', 'Automatically send appointment confirmation emails', 'notifications'),
    (gen_random_uuid(), 'auto_send_24h_reminders', 'true'::jsonb, 'boolean', 'Automatically send 24-hour appointment reminders', 'notifications'),
    (gen_random_uuid(), 'auto_send_1h_reminders', 'false'::jsonb, 'boolean', 'Automatically send 1-hour appointment reminders', 'notifications'),
    (gen_random_uuid(), 'swell_api_url', '"https://api.swell.store"'::jsonb, 'string', 'Swell.is API base URL', 'integrations'),
    (gen_random_uuid(), 'results_retention_years', '7'::jsonb, 'number', 'Number of years to retain test results', 'compliance'),
    (gen_random_uuid(), 'audit_log_retention_years', '10'::jsonb, 'number', 'Number of years to retain audit logs', 'compliance'),
    (gen_random_uuid(), 'patient_portal_url', '"https://portal.prismhealthlab.com"'::jsonb, 'string', 'URL for the patient portal', 'general'),
    (gen_random_uuid(), 'support_email', '"support@prismhealthlab.com"'::jsonb, 'string', 'Support email address', 'general'),
    (gen_random_uuid(), 'support_phone', '"1-800-PRISM-LAB"'::jsonb, 'string', 'Support phone number', 'general');

-- ================================================================
-- SAMPLE APPOINTMENT SLOTS (NEXT 30 DAYS)
-- ================================================================

-- Create appointment slots for the next 30 days
DO $$
DECLARE
    location_rec RECORD;
    loop_date DATE := CURRENT_DATE;
    end_date DATE := CURRENT_DATE + INTERVAL '30 days';
    time_slot TIME;
    day_of_week INTEGER;
BEGIN
    -- Loop through each location
    FOR location_rec IN SELECT id, operating_hours FROM public.locations WHERE is_active = true LOOP
        -- Loop through each day
        WHILE loop_date <= end_date LOOP
            day_of_week := EXTRACT(DOW FROM loop_date); -- 0=Sunday, 1=Monday, etc.
            
            -- Create slots based on operating hours (simplified - assumes 30-minute slots)
            -- Monday-Friday: 7:00 AM to 5:00 PM (30-minute slots)
            IF day_of_week BETWEEN 1 AND 5 THEN
                time_slot := '07:00:00';
                WHILE time_slot < '17:00:00' LOOP
                    INSERT INTO public.appointment_slots (
                        location_id, date, start_time, end_time, 
                        duration_minutes, max_appointments, available_slots
                    ) VALUES (
                        location_rec.id, loop_date, time_slot, time_slot + INTERVAL '30 minutes',
                        30, 1, 1
                    ) ON CONFLICT DO NOTHING;
                    
                    time_slot := time_slot + INTERVAL '30 minutes';
                END LOOP;
            END IF;
            
            -- Saturday: 8:00 AM to 4:00 PM
            IF day_of_week = 6 THEN
                time_slot := '08:00:00';
                WHILE time_slot < '16:00:00' LOOP
                    INSERT INTO public.appointment_slots (
                        location_id, date, start_time, end_time,
                        duration_minutes, max_appointments, available_slots
                    ) VALUES (
                        location_rec.id, loop_date, time_slot, time_slot + INTERVAL '30 minutes',
                        30, 1, 1
                    ) ON CONFLICT DO NOTHING;
                    
                    time_slot := time_slot + INTERVAL '30 minutes';
                END LOOP;
            END IF;
            
            loop_date := loop_date + INTERVAL '1 day';
        END LOOP;
        
        -- Reset date for next location
        loop_date := CURRENT_DATE;
    END LOOP;
END $$;

-- ================================================================
-- SAMPLE BUSINESS METRICS (LAST 30 DAYS)
-- ================================================================

-- Insert sample business metrics for the last 30 days
DO $$
DECLARE
    loop_metric_date DATE := CURRENT_DATE - INTERVAL '30 days';
    end_date DATE := CURRENT_DATE;
    daily_orders INTEGER;
    daily_revenue DECIMAL(10,2);
BEGIN
    WHILE loop_metric_date <= end_date LOOP
        -- Generate random but realistic metrics
        daily_orders := (RANDOM() * 20 + 5)::INTEGER; -- 5-25 orders per day
        daily_revenue := daily_orders * (RANDOM() * 100 + 50); -- $50-150 average order value
        
        INSERT INTO public.business_metrics (
            metric_date, metric_period, total_revenue, gross_revenue, net_revenue,
            total_orders, completed_orders, average_order_value,
            total_appointments, completed_appointments,
            new_customers, returning_customers
        ) VALUES (
            loop_metric_date, 'daily', daily_revenue, daily_revenue * 1.1, daily_revenue * 0.9,
            daily_orders, (daily_orders * 0.9)::INTEGER, daily_revenue / daily_orders,
            daily_orders, (daily_orders * 0.95)::INTEGER,
            (daily_orders * 0.3)::INTEGER, (daily_orders * 0.7)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        loop_metric_date := loop_metric_date + INTERVAL '1 day';
    END LOOP;
END $$;

-- ================================================================
-- ADMIN USER SETUP INSTRUCTIONS
-- ================================================================

-- Create a function to set up the first admin user
CREATE OR REPLACE FUNCTION setup_admin_user(
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    auth_user_id UUID;
    profile_id UUID;
    staff_id UUID;
    admin_role_id UUID;
    admin_dept_id UUID;
BEGIN
    -- Get the admin role and department IDs
    SELECT id INTO admin_role_id FROM public.staff_roles WHERE name = 'admin' LIMIT 1;
    SELECT id INTO admin_dept_id FROM public.staff_departments WHERE name = 'Administration' LIMIT 1;
    
    -- Note: In a real setup, you would need to create the auth user first
    -- This function assumes the auth.users record already exists
    
    -- For now, we'll return instructions for manual setup
    RETURN 'To complete admin setup:
1. Create user account through Supabase Auth with email: ' || user_email || '
2. Note the auth.users.id (UUID) for the created user
3. Insert profile record with that user_id
4. Insert staff record with admin role
5. Set can_access_admin = true for the staff record

Example SQL (replace USER_ID_HERE with actual UUID):
INSERT INTO public.profiles (user_id, first_name, last_name, email, phone) 
VALUES (''USER_ID_HERE'', ''' || user_first_name || ''', ''' || user_last_name || ''', ''' || user_email || ''', ''' || COALESCE(user_phone, 'NULL') || ''');

INSERT INTO public.staff (user_id, role_id, department_id, employee_id, can_access_admin, permissions, is_active)
VALUES (''USER_ID_HERE'', ''' || admin_role_id || ''', ''' || admin_dept_id || ''', ''ADMIN001'', true, ''["*"]''::jsonb, true);';
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- DATA VALIDATION AND CLEANUP
-- ================================================================

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION validate_admin_setup()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check if roles exist
    SELECT 
        'Staff Roles'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' staff roles'::TEXT
    FROM public.staff_roles WHERE is_active = true;
    
    RETURN QUERY
    -- Check if departments exist  
    SELECT 
        'Staff Departments'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' departments'::TEXT
    FROM public.staff_departments WHERE is_active = true;
    
    RETURN QUERY
    -- Check if locations exist
    SELECT 
        'Locations'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' active locations'::TEXT
    FROM public.locations WHERE is_active = true;
    
    RETURN QUERY
    -- Check if test categories exist
    SELECT 
        'Test Categories'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' test categories'::TEXT
    FROM public.test_categories WHERE is_active = true;
    
    RETURN QUERY
    -- Check if diagnostic tests exist
    SELECT 
        'Diagnostic Tests'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' diagnostic tests'::TEXT
    FROM public.diagnostic_tests WHERE is_active = true;
    
    RETURN QUERY
    -- Check if appointment slots exist
    SELECT 
        'Appointment Slots'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' appointment slots'::TEXT
    FROM public.appointment_slots WHERE date >= CURRENT_DATE;
    
    RETURN QUERY
    -- Check if notification templates exist
    SELECT 
        'Notification Templates'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' notification templates'::TEXT
    FROM public.notification_templates WHERE is_active = true;
    
    RETURN QUERY
    -- Check if system settings exist
    SELECT 
        'System Settings'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*)::TEXT || ' system settings'::TEXT
    FROM public.system_settings;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- COMMENTS AND DOCUMENTATION
-- ================================================================

COMMENT ON FUNCTION setup_admin_user(TEXT, TEXT, TEXT, TEXT) IS 'Helper function to provide instructions for setting up the first admin user';
COMMENT ON FUNCTION validate_admin_setup() IS 'Validates that all required admin data has been properly inserted';

-- ================================================================
-- END OF SEED DATA
-- ================================================================

-- Run validation to confirm setup
SELECT * FROM validate_admin_setup();