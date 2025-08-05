-- ================================================================
-- PRISM HEALTH LAB - ADMIN SEED DATA
-- ================================================================
-- Production-safe seed data for admin dashboard functionality
-- Includes roles, permissions, locations, and system configuration
-- 
-- Deploy Order: Run this file after admin schema and RLS policies
-- Dependencies: 01_admin_schema.sql, 02_admin_rls_policies.sql
-- ================================================================

-- Disable triggers during seeding to avoid audit log noise
SET session_replication_role = replica;

-- ================================================================
-- STAFF ROLES AND PERMISSIONS SETUP
-- ================================================================

-- Insert default staff roles with proper permission structure
INSERT INTO public.staff_roles (name, description, level, default_permissions, is_admin_role, is_active) VALUES
('Super Administrator', 'Full system access with all permissions', 5, 
 '["*"]'::jsonb, true, true),

('System Administrator', 'Full admin access excluding system configuration', 4, 
 '["user_management", "appointment_management", "result_management", "order_management", "location_management", "test_management", "staff_management", "analytics_access", "audit_access"]'::jsonb, true, true),

('Lab Manager', 'Laboratory operations and staff management', 3, 
 '["result_management", "appointment_management", "test_management", "staff_supervision", "quality_control"]'::jsonb, true, true),

('Medical Director', 'Clinical oversight and result review', 4, 
 '["result_management", "clinical_oversight", "patient_data_access", "result_approval"]'::jsonb, true, true),

('Lab Technician', 'Laboratory testing and result processing', 2, 
 '["result_processing", "sample_processing", "equipment_operation"]'::jsonb, false, true),

('Phlebotomist', 'Blood draw and sample collection', 1, 
 '["sample_collection", "appointment_management", "patient_interaction"]'::jsonb, false, true),

('Customer Service Representative', 'Patient support and appointment scheduling', 1, 
 '["appointment_management", "customer_support", "basic_order_info"]'::jsonb, false, true)

ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- STAFF DEPARTMENTS
-- ================================================================

-- Insert organizational departments
INSERT INTO public.staff_departments (name, description, is_active) VALUES
('Administration', 'Executive and administrative management', true),
('Laboratory Operations', 'Core laboratory testing and processing', true),
('Clinical Affairs', 'Medical oversight and clinical operations', true),
('Patient Services', 'Customer service and patient support', true),
('Quality Assurance', 'Quality control and regulatory compliance', true),
('Information Technology', 'IT support and system administration', true)

ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- TESTING LOCATIONS
-- ================================================================

-- Insert production-ready testing locations
INSERT INTO public.locations (
    name, location_code, address_line_1, city, state, zip_code, 
    phone, email, operating_hours, timezone, capacity, 
    services_offered, parking_available, wheelchair_accessible, accepts_walk_ins, is_active
) VALUES

-- Flagship Location
('Prism Health Lab - Manhattan Flagship', 'PHL-NYC-001', 
 '123 Madison Avenue, Suite 200', 'New York', 'NY', '10016',
 '(212) 555-0101', 'manhattan@prismhealthlab.com',
 '{
    "monday": {"start": "07:00", "end": "19:00"},
    "tuesday": {"start": "07:00", "end": "19:00"},
    "wednesday": {"start": "07:00", "end": "19:00"},
    "thursday": {"start": "07:00", "end": "19:00"},
    "friday": {"start": "07:00", "end": "19:00"},
    "saturday": {"start": "08:00", "end": "16:00"},
    "sunday": {"closed": true}
 }'::jsonb,
 'America/New_York', 30, 
 '["blood_draw", "specimen_collection", "rapid_testing", "consultation"]', 
 true, true, false, true),

-- Brooklyn Location
('Prism Health Lab - Brooklyn Heights', 'PHL-NYC-002',
 '456 Atlantic Avenue, 3rd Floor', 'Brooklyn', 'NY', '11217',
 '(718) 555-0102', 'brooklyn@prismhealthlab.com',
 '{
    "monday": {"start": "08:00", "end": "18:00"},
    "tuesday": {"start": "08:00", "end": "18:00"},
    "wednesday": {"start": "08:00", "end": "18:00"},
    "thursday": {"start": "08:00", "end": "18:00"},
    "friday": {"start": "08:00", "end": "18:00"},
    "saturday": {"start": "09:00", "end": "15:00"},
    "sunday": {"closed": true}
 }'::jsonb,
 'America/New_York', 20,
 '["blood_draw", "specimen_collection"]',
 true, true, true, true),

-- Los Angeles Location
('Prism Health Lab - Los Angeles Main', 'PHL-LAX-001',
 '789 Wilshire Boulevard, Suite 100', 'Los Angeles', 'CA', '90017',
 '(213) 555-0103', 'losangeles@prismhealthlab.com',
 '{
    "monday": {"start": "07:00", "end": "19:00"},
    "tuesday": {"start": "07:00", "end": "19:00"},
    "wednesday": {"start": "07:00", "end": "19:00"},
    "thursday": {"start": "07:00", "end": "19:00"},
    "friday": {"start": "07:00", "end": "19:00"},
    "saturday": {"start": "08:00", "end": "16:00"},
    "sunday": {"closed": true}
 }'::jsonb,
 'America/Los_Angeles', 25,
 '["blood_draw", "specimen_collection", "rapid_testing"]',
 true, true, false, true)

ON CONFLICT (location_code) DO NOTHING;

-- ================================================================
-- MEDICAL TEST CATEGORIES
-- ================================================================

-- Insert medical test categories with professional medical theme
INSERT INTO public.test_categories (
    name, description, slug, icon, color_theme, sort_order, is_featured, is_active
) VALUES

('Comprehensive Health Panels', 
 'Complete health assessment packages covering multiple body systems', 
 'comprehensive-health', 'activity', '#06b6d4', 1, true, true),

('Cardiovascular Health', 
 'Heart health, cholesterol, and cardiovascular risk markers', 
 'cardiovascular-health', 'heart', '#ef4444', 2, true, true),

('Metabolic & Diabetes Screening', 
 'Blood sugar, insulin, and metabolic syndrome markers', 
 'metabolic-diabetes', 'trending-up', '#10b981', 3, true, true),

('Hormone & Endocrine Testing', 
 'Thyroid, reproductive, and adrenal hormone panels', 
 'hormone-endocrine', 'zap', '#8b5cf6', 4, true, true),

('Nutritional Health', 
 'Vitamin levels, minerals, and nutritional assessments', 
 'nutritional-health', 'leaf', '#f59e0b', 5, true, true),

('Immune System Health', 
 'Immune function, inflammation, and autoimmune markers', 
 'immune-system', 'shield', '#06b6d4', 6, false, true),

('Men\'s Health Specialty', 
 'Male-specific health markers and hormone testing', 
 'mens-health', 'user', '#3b82f6', 7, false, true),

('Women\'s Health Specialty', 
 'Female-specific health markers and reproductive testing', 
 'womens-health', 'user', '#ec4899', 8, false, true)

ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- SAMPLE DIAGNOSTIC TESTS
-- ================================================================

-- Get category IDs for test insertion
DO $$
DECLARE
    comprehensive_id UUID;
    cardiovascular_id UUID;
    metabolic_id UUID;
    hormone_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO comprehensive_id FROM public.test_categories WHERE slug = 'comprehensive-health';
    SELECT id INTO cardiovascular_id FROM public.test_categories WHERE slug = 'cardiovascular-health';
    SELECT id INTO metabolic_id FROM public.test_categories WHERE slug = 'metabolic-diabetes';
    SELECT id INTO hormone_id FROM public.test_categories WHERE slug = 'hormone-endocrine';

    -- Insert essential diagnostic tests
    INSERT INTO public.diagnostic_tests (
        name, description, category_id, test_code, swell_product_id,
        base_price, fasting_required, fasting_duration_hours, 
        turnaround_time_business_days, specimen_type, collection_method,
        clinical_significance, is_active, is_featured
    ) VALUES

    -- Comprehensive Health Tests
    ('Essential Health Panel',
     'Comprehensive metabolic panel including glucose, lipid profile, liver function, kidney function, and complete blood count',
     comprehensive_id, 'EHP-001', 'swell_essential_health_panel',
     299.00, true, 12, 2, 'blood', 'venipuncture',
     'Provides broad overview of metabolic health, organ function, and blood cell counts for preventive care and health monitoring',
     true, true),

    ('Executive Health Assessment',
     'Premium comprehensive health screening including advanced cardiovascular markers, hormone panel, and nutritional assessment',
     comprehensive_id, 'EHA-001', 'swell_executive_health_assessment', 
     699.00, true, 12, 3, 'blood', 'venipuncture',
     'Complete executive physical screening for busy professionals focused on early detection and health optimization',
     true, true),

    -- Cardiovascular Tests
    ('Advanced Cardiac Risk Panel',
     'Comprehensive cardiovascular risk assessment including lipid subfractions, inflammatory markers, and cardiac biomarkers',
     cardiovascular_id, 'ACRP-001', 'swell_advanced_cardiac_risk',
     449.00, true, 12, 3, 'blood', 'venipuncture',
     'Advanced assessment of cardiovascular disease risk with detailed lipid analysis and inflammation markers',
     true, true),

    -- Metabolic Tests
    ('Diabetes Risk Assessment',
     'Complete diabetes screening including glucose, HbA1c, insulin levels, and insulin resistance markers',
     metabolic_id, 'DRA-001', 'swell_diabetes_risk_assessment',
     199.00, true, 8, 2, 'blood', 'venipuncture',
     'Early detection of diabetes risk and metabolic syndrome with comprehensive glucose metabolism analysis',
     true, true),

    -- Hormone Tests
    ('Complete Thyroid Panel',
     'Comprehensive thyroid function testing including TSH, T3, T4, reverse T3, and thyroid antibodies',
     hormone_id, 'CTP-001', 'swell_complete_thyroid_panel',
     299.00, false, 0, 2, 'blood', 'venipuncture',
     'Complete thyroid function assessment for metabolism, energy, and hormonal balance evaluation',
     true, true)

    ON CONFLICT (test_code) DO NOTHING;
END $$;

-- ================================================================
-- SYSTEM CONFIGURATION
-- ================================================================

-- Insert essential system settings
INSERT INTO public.system_settings (
    setting_key, setting_value, setting_type, description, category, is_sensitive
) VALUES

-- Communication Settings
('lab_contact_email', '"support@prismhealthlab.com"'::jsonb, 'string', 
 'Primary contact email for lab communications', 'communication', false),

('customer_service_phone', '"1-800-PRISM-LAB"'::jsonb, 'string',
 'Customer service phone number', 'communication', false),

-- Appointment Settings
('appointment_reminder_hours', '24'::jsonb, 'number',
 'Hours before appointment to send reminder', 'appointments', false),

('max_appointments_per_slot', '3'::jsonb, 'number',
 'Maximum appointments per time slot', 'appointments', false),

('appointment_cancellation_hours', '4'::jsonb, 'number',
 'Minimum hours before appointment for cancellation', 'appointments', false),

-- Result Settings
('result_delivery_method', '"portal_and_email"'::jsonb, 'string',
 'How results are delivered to patients', 'results', false),

('critical_result_notification', 'true'::jsonb, 'boolean',
 'Enable immediate notification for critical results', 'results', false),

-- Compliance Settings
('hipaa_audit_retention_days', '2555'::jsonb, 'number',
 'Days to retain HIPAA audit logs (7 years)', 'compliance', false),

('result_retention_years', '7'::jsonb, 'number',
 'Years to retain test results', 'compliance', false),

-- System Settings
('maintenance_mode', 'false'::jsonb, 'boolean',
 'Enable maintenance mode', 'system', false),

('system_timezone', '"America/New_York"'::jsonb, 'string',
 'Default system timezone', 'system', false)

ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- ================================================================
-- NOTIFICATION TEMPLATES
-- ================================================================

-- Insert essential notification templates
INSERT INTO public.notification_templates (
    name, template_type, category, subject, body_text,
    required_variables, is_active
) VALUES

-- Result Notifications
('Test Results Available', 'email', 'results', 
 'Your test results are ready - Prism Health Lab',
 'Dear {{patient_name}},

Your test results for {{test_name}} are now available in your patient portal.

To view your results:
1. Log in to your patient portal at https://portal.prismhealthlab.com
2. Navigate to "My Results"
3. Click on your recent test to view detailed results

If you have any questions about your results, please contact us at {{lab_contact_email}} or {{customer_service_phone}}.

Thank you for choosing Prism Health Lab.

Best regards,
The Prism Health Lab Team',
 '["patient_name", "test_name", "lab_contact_email", "customer_service_phone"]', true),

-- Appointment Notifications
('Appointment Confirmation', 'email', 'appointment',
 'Appointment Confirmed - Prism Health Lab',
 'Dear {{patient_name}},

Your appointment has been confirmed:

Date: {{appointment_date}}
Time: {{appointment_time}}
Location: {{location_name}}
Address: {{location_address}}

Test(s): {{test_names}}

Preparation Instructions:
{{preparation_instructions}}

Please arrive 15 minutes early and bring a valid ID.

If you need to reschedule, please call us at {{customer_service_phone}} at least 4 hours before your appointment.

Thank you for choosing Prism Health Lab.',
 '["patient_name", "appointment_date", "appointment_time", "location_name", "location_address", "test_names", "preparation_instructions", "customer_service_phone"]', true),

('Appointment Reminder', 'sms', 'appointment', '',
 'Reminder: You have an appointment tomorrow at {{appointment_time}} for {{test_name}} at {{location_name}}. Please arrive 15 minutes early. Questions? Call {{customer_service_phone}}',
 '["appointment_time", "test_name", "location_name", "customer_service_phone"]', true),

-- Critical Result Notifications
('Critical Result Alert', 'email', 'results',
 'URGENT: Critical Test Results - Prism Health Lab',
 'Dear {{patient_name}},

Your recent test results contain values that require immediate medical attention.

Please contact your healthcare provider immediately or call our medical team at {{urgent_contact_phone}}.

Do not delay in seeking medical care.

Test: {{test_name}}
Critical Values: {{critical_values}}

Your safety is our priority.

Prism Health Lab Medical Team',
 '["patient_name", "test_name", "critical_values", "urgent_contact_phone"]', true)

ON CONFLICT (name) DO NOTHING;

-- Re-enable triggers after seeding
SET session_replication_role = DEFAULT;

-- ================================================================
-- SEED DATA DEPLOYMENT SUCCESS
-- ================================================================

SELECT 
    'Admin seed data deployed successfully!' as result,
    'Production-ready configuration loaded' as status,
    (SELECT COUNT(*) FROM public.staff_roles) as staff_roles_created,
    (SELECT COUNT(*) FROM public.staff_departments) as departments_created,
    (SELECT COUNT(*) FROM public.locations) as locations_created,
    (SELECT COUNT(*) FROM public.test_categories) as test_categories_created,
    (SELECT COUNT(*) FROM public.diagnostic_tests) as diagnostic_tests_created,
    (SELECT COUNT(*) FROM public.system_settings) as system_settings_created,
    (SELECT COUNT(*) FROM public.notification_templates) as notification_templates_created,
    NOW() as deployed_at;