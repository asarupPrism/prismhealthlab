-- =====================================================
-- Prism Health Lab - Seed Data for Development & Testing
-- =====================================================
-- 
-- Comprehensive seed data for the Prism Health Lab patient portal
-- including test categories, diagnostic tests, locations, sample
-- users, orders, appointments, and test results.
--
-- This data is designed for development and testing purposes
-- and includes realistic healthcare scenarios while maintaining
-- HIPAA compliance for test environments.
-- =====================================================

-- Disable triggers during seeding to avoid audit log noise
SET session_replication_role = replica;

-- =====================================================
-- TEST CATEGORIES
-- =====================================================

INSERT INTO test_categories (id, name, description, slug, icon, sort_order, featured, color_scheme, is_active) VALUES
-- Core Health Categories
('550e8400-e29b-41d4-a716-446655440001', 'Comprehensive Health', 'Complete health assessment panels covering all major body systems', 'comprehensive-health', 'heart-pulse', 1, true, '{"primary": "#06b6d4", "secondary": "#0891b2"}', true),
('550e8400-e29b-41d4-a716-446655440002', 'Heart Health', 'Cardiovascular risk assessment and heart disease screening', 'heart-health', 'heart', 2, true, '{"primary": "#ef4444", "secondary": "#dc2626"}', true),
('550e8400-e29b-41d4-a716-446655440003', 'Hormone Health', 'Comprehensive hormone testing and endocrine function', 'hormone-health', 'balance-scale', 3, true, '{"primary": "#8b5cf6", "secondary": "#7c3aed"}', true),
('550e8400-e29b-41d4-a716-446655440004', 'Metabolic Health', 'Diabetes, metabolism, and weight management screening', 'metabolic-health', 'chart-line', 4, true, '{"primary": "#10b981", "secondary": "#059669"}', true),
('550e8400-e29b-41d4-a716-446655440005', 'Immune System', 'Immune function and autoimmune disease screening', 'immune-system', 'shield', 5, false, '{"primary": "#f59e0b", "secondary": "#d97706"}', true),

-- Specialty Categories
('550e8400-e29b-41d4-a716-446655440006', 'Nutritional Health', 'Vitamin, mineral, and nutritional deficiency testing', 'nutritional-health', 'leaf', 6, false, '{"primary": "#84cc16", "secondary": "#65a30d"}', true),
('550e8400-e29b-41d4-a716-446655440007', 'Fitness & Performance', 'Athletic performance and fitness optimization', 'fitness-performance', 'dumbbell', 7, false, '{"primary": "#06b6d4", "secondary": "#0891b2"}', true),
('550e8400-e29b-41d4-a716-446655440008', 'Reproductive Health', 'Fertility, pregnancy, and reproductive hormone testing', 'reproductive-health', 'heart', 8, false, '{"primary": "#ec4899", "secondary": "#db2777"}', true),
('550e8400-e29b-41d4-a716-446655440009', 'Digestive Health', 'Gut health, food sensitivities, and digestive disorders', 'digestive-health', 'stomach', 9, false, '{"primary": "#f97316", "secondary": "#ea580c"}', true),
('550e8400-e29b-41d4-a716-446655440010', 'Preventive Screening', 'Early detection and preventive health screenings', 'preventive-screening', 'search', 10, false, '{"primary": "#3b82f6", "secondary": "#2563eb"}', true);

-- =====================================================
-- LOCATIONS (Testing Centers)
-- =====================================================

INSERT INTO locations (id, name, location_type, address_line_1, city, state, zip_code, phone, email, latitude, longitude, operating_hours, services, capacity_per_hour, equipment_list, wheelchair_accessible, parking_available, is_active) VALUES
-- Major Metropolitan Areas
('660e8400-e29b-41d4-a716-446655440001', 'Prism Health Lab - Manhattan', 'lab', '123 Madison Avenue', 'New York', 'NY', '10016', '(212) 555-0101', 'manhattan@prismhealthlab.com', 40.7505, -73.9934, 
 '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "8:00-16:00", "sunday": "closed"}',
 '{"blood_draw", "consultation", "result_review"}', 6, '{"automated_analyzers", "centrifuge", "refrigerated_storage"}', true, false, true),

('660e8400-e29b-41d4-a716-446655440002', 'Prism Health Lab - Brooklyn', 'collection_site', '456 Atlantic Avenue', 'Brooklyn', 'NY', '11217', '(718) 555-0102', 'brooklyn@prismhealthlab.com', 40.6892, -73.9442,
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "9:00-15:00", "sunday": "closed"}',
 '{"blood_draw", "consultation"}', 4, '{"basic_collection", "refrigerated_storage"}', true, true, true),

('660e8400-e29b-41d4-a716-446655440003', 'Prism Health Lab - Los Angeles', 'lab', '789 Wilshire Boulevard', 'Los Angeles', 'CA', '90017', '(213) 555-0103', 'losangeles@prismhealthlab.com', 34.0522, -118.2437,
 '{"monday": "6:00-20:00", "tuesday": "6:00-20:00", "wednesday": "6:00-20:00", "thursday": "6:00-20:00", "friday": "6:00-20:00", "saturday": "7:00-17:00", "sunday": "9:00-15:00"}',
 '{"blood_draw", "consultation", "result_review", "specialized_testing"}', 8, '{"automated_analyzers", "mass_spectrometry", "molecular_diagnostics"}', true, true, true),

('660e8400-e29b-41d4-a716-446655440004', 'Prism Health Lab - Chicago', 'lab', '321 Michigan Avenue', 'Chicago', 'IL', '60601', '(312) 555-0104', 'chicago@prismhealthlab.com', 41.8781, -87.6298,
 '{"monday": "7:00-19:00", "tuesday": "7:00-19:00", "wednesday": "7:00-19:00", "thursday": "7:00-19:00", "friday": "7:00-19:00", "saturday": "8:00-16:00", "sunday": "closed"}',
 '{"blood_draw", "consultation", "result_review"}', 5, '{"automated_analyzers", "immunoassay_platform", "hematology_analyzer"}', true, false, true),

('660e8400-e29b-41d4-a716-446655440005', 'Prism Health Lab - Austin', 'collection_site', '567 South Congress', 'Austin', 'TX', '78704', '(512) 555-0105', 'austin@prismhealthlab.com', 30.2672, -97.7431,
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "9:00-14:00", "sunday": "closed"}',
 '{"blood_draw", "consultation"}', 3, '{"basic_collection", "point_of_care_testing"}', true, true, true);

-- =====================================================
-- DIAGNOSTIC TESTS
-- =====================================================

INSERT INTO diagnostic_tests (id, swell_product_id, name, description, category_id, key_tests, biomarkers, sample_type, fasting_required, turnaround_time, turnaround_hours, normal_ranges, clinical_significance, base_price, is_active) VALUES

-- Comprehensive Health Tests
('770e8400-e29b-41d4-a716-446655440001', 'swell_comprehensive_basic', 'Essential Health Panel', 'Complete basic health screening including metabolic panel, lipids, and CBC', '550e8400-e29b-41d4-a716-446655440001',
 '{"Complete Blood Count", "Comprehensive Metabolic Panel", "Lipid Panel", "TSH", "Vitamin D"}',
 '{"glucose", "cholesterol", "HDL", "LDL", "triglycerides", "creatinine", "ALT", "AST", "TSH", "vitamin_d"}',
 'blood', true, '1-2 business days', 24, 
 '{"glucose": {"min": 70, "max": 99, "unit": "mg/dL"}, "total_cholesterol": {"max": 200, "unit": "mg/dL"}, "HDL": {"min": 40, "unit": "mg/dL"}}',
 'Comprehensive screening for diabetes, heart disease, liver function, and thyroid health', 199.00, true),

('770e8400-e29b-41d4-a716-446655440002', 'swell_comprehensive_advanced', 'Advanced Health Panel', 'Comprehensive health assessment with advanced biomarkers and inflammation markers', '550e8400-e29b-41d4-a716-446655440001',
 '{"Complete Blood Count", "Comprehensive Metabolic Panel", "Lipid Panel", "Thyroid Panel", "Inflammatory Markers", "Cardiac Risk", "Nutrient Status"}',
 '{"glucose", "HbA1c", "total_cholesterol", "HDL", "LDL", "triglycerides", "apoB", "CRP", "homocysteine", "vitamin_d", "vitamin_b12", "folate", "TSH", "T3", "T4"}',
 'blood', true, '2-3 business days', 48,
 '{"HbA1c": {"max": 5.6, "unit": "%"}, "CRP": {"max": 3.0, "unit": "mg/L"}, "apoB": {"max": 100, "unit": "mg/dL"}}',
 'Advanced cardiovascular risk assessment with metabolic and nutritional evaluation', 399.00, true),

-- Heart Health Tests
('770e8400-e29b-41d4-a716-446655440003', 'swell_heart_basic', 'Heart Health Basic', 'Essential cardiovascular risk screening panel', '550e8400-e29b-41d4-a716-446655440002',
 '{"Lipid Panel", "CRP", "Homocysteine", "Lipoprotein(a)"}',
 '{"total_cholesterol", "HDL", "LDL", "triglycerides", "CRP", "homocysteine", "lp_a"}',
 'blood', true, '1-2 business days', 24,
 '{"LDL": {"max": 100, "unit": "mg/dL"}, "HDL": {"min": 50, "unit": "mg/dL"}, "triglycerides": {"max": 150, "unit": "mg/dL"}}',
 'Assessment of cardiovascular disease risk factors', 159.00, true),

('770e8400-e29b-41d4-a716-446655440004', 'swell_heart_advanced', 'Advanced Cardiac Risk', 'Comprehensive cardiovascular risk assessment with advanced lipid analysis', '550e8400-e29b-41d4-a716-446655440002',
 '{"Advanced Lipid Panel", "ApoB", "ApoA1", "CRP", "Fibrinogen", "Homocysteine", "Lp(a)", "Oxidized LDL"}',
 '{"total_cholesterol", "HDL", "LDL", "VLDL", "triglycerides", "apoB", "apoA1", "CRP", "fibrinogen", "homocysteine", "lp_a", "ox_LDL"}',
 'blood', true, '3-5 business days', 72,
 '{"apoB": {"max": 100, "unit": "mg/dL"}, "apoA1": {"min": 120, "unit": "mg/dL"}, "ox_LDL": {"max": 60, "unit": "U/L"}}',
 'Comprehensive assessment for early detection of cardiovascular disease risk', 299.00, true),

-- Hormone Health Tests
('770e8400-e29b-41d4-a716-446655440005', 'swell_hormone_basic', 'Essential Hormone Panel', 'Basic hormone screening for men and women', '550e8400-e29b-41d4-a716-446655440003',
 '{"Thyroid Panel", "Testosterone", "Estradiol", "Cortisol", "DHEA-S"}',
 '{"TSH", "T3", "T4", "testosterone", "estradiol", "cortisol", "DHEA_S"}',
 'blood', false, '2-3 business days', 48,
 '{"TSH": {"min": 0.4, "max": 4.0, "unit": "mIU/L"}, "testosterone": {"min": 300, "max": 1000, "unit": "ng/dL"}, "cortisol": {"min": 6, "max": 23, "unit": "mcg/dL"}}',
 'Comprehensive hormone balance assessment for energy, mood, and metabolism', 249.00, true),

('770e8400-e29b-41d4-a716-446655440006', 'swell_hormone_comprehensive', 'Complete Hormone Analysis', 'Comprehensive hormone panel including sex hormones, thyroid, and adrenal function', '550e8400-e29b-41d4-a716-446655440003',
 '{"Complete Thyroid Panel", "Sex Hormone Panel", "Adrenal Function", "Growth Hormone", "Insulin"}',
 '{"TSH", "T3", "T4", "reverse_T3", "testosterone", "free_testosterone", "estradiol", "progesterone", "DHEA_S", "cortisol", "IGF_1", "insulin", "SHBG"}',
 'blood', false, '3-5 business days', 72,
 '{"free_testosterone": {"min": 50, "max": 200, "unit": "pg/mL"}, "progesterone": {"min": 2, "max": 25, "unit": "ng/mL"}, "IGF_1": {"min": 115, "max": 307, "unit": "ng/mL"}}',
 'Complete hormonal health assessment for optimization and anti-aging', 449.00, true),

-- Metabolic Health Tests
('770e8400-e29b-41d4-a716-446655440007', 'swell_metabolic_basic', 'Diabetes Risk Assessment', 'Essential screening for diabetes and metabolic syndrome', '550e8400-e29b-41d4-a716-446655440004',
 '{"Glucose", "HbA1c", "Insulin", "C-Peptide"}',
 '{"glucose", "HbA1c", "insulin", "c_peptide", "HOMA_IR"}',
 'blood', true, '1-2 business days', 24,
 '{"glucose": {"min": 70, "max": 99, "unit": "mg/dL"}, "HbA1c": {"max": 5.6, "unit": "%"}, "insulin": {"min": 2, "max": 25, "unit": "uIU/mL"}}',
 'Early detection and monitoring of diabetes and insulin resistance', 129.00, true),

-- Immune System Tests
('770e8400-e29b-41d4-a716-446655440008', 'swell_immune_basic', 'Immune Function Panel', 'Basic immune system function and inflammatory markers', '550e8400-e29b-41d4-a716-446655440005',
 '{"Complete Blood Count", "CRP", "ESR", "Immunoglobulins"}',
 '{"WBC", "neutrophils", "lymphocytes", "CRP", "ESR", "IgG", "IgA", "IgM"}',
 'blood', false, '2-3 business days', 48,
 '{"WBC": {"min": 4.5, "max": 11.0, "unit": "K/uL"}, "CRP": {"max": 3.0, "unit": "mg/L"}, "IgG": {"min": 700, "max": 1600, "unit": "mg/dL"}}',
 'Assessment of immune system function and chronic inflammation', 179.00, true),

-- Nutritional Health Tests
('770e8400-e29b-41d4-a716-446655440009', 'swell_nutrition_comprehensive', 'Complete Nutritional Analysis', 'Comprehensive vitamin, mineral, and nutrient status assessment', '550e8400-e29b-41d4-a716-446655440006',
 '{"Vitamin Panel", "Mineral Panel", "Amino Acids", "Fatty Acids"}',
 '{"vitamin_d", "vitamin_b12", "folate", "vitamin_c", "vitamin_e", "iron", "ferritin", "magnesium", "zinc", "omega_3"}',
 'blood', false, '5-7 business days', 120,
 '{"vitamin_d": {"min": 30, "max": 100, "unit": "ng/mL"}, "vitamin_b12": {"min": 300, "max": 900, "unit": "pg/mL"}, "ferritin": {"min": 30, "max": 400, "unit": "ng/mL"}}',
 'Comprehensive nutritional status for optimal health and performance', 349.00, true),

-- Fitness & Performance Tests
('770e8400-e29b-41d4-a716-446655440010', 'swell_fitness_athlete', 'Athletic Performance Panel', 'Comprehensive testing for athletes and fitness enthusiasts', '550e8400-e29b-41d4-a716-446655440007',
 '{"Complete Blood Count", "Metabolic Panel", "Testosterone", "Growth Hormone", "Inflammatory Markers", "Nutrient Status"}',
 '{"hemoglobin", "hematocrit", "testosterone", "IGF_1", "CRP", "CK", "LDH", "iron", "ferritin", "vitamin_d", "magnesium"}',
 'blood', false, '3-5 business days', 72,
 '{"hemoglobin": {"min": 12, "max": 18, "unit": "g/dL"}, "testosterone": {"min": 400, "max": 1200, "unit": "ng/dL"}, "CK": {"max": 200, "unit": "U/L"}}',
 'Optimize athletic performance and recovery through advanced biomarker analysis', 379.00, true);

-- =====================================================
-- STAFF MEMBERS
-- =====================================================

INSERT INTO staff (id, user_id, employee_id, first_name, last_name, email, phone, role, permissions, department, location_ids, primary_location_id, hire_date, license_number, is_active) VALUES
-- Admin Staff
('880e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'EMP001', 'Sarah', 'Chen', 'sarah.chen@prismhealthlab.com', '(555) 123-4567', 'admin', 
 '{"patient_data_access", "patient_data_modify", "order_management", "appointment_management", "test_results_access", "test_results_modify", "analytics_access", "audit_access", "system_monitoring"}',
 'Administration', '{"660e8400-e29b-41d4-a716-446655440001", "660e8400-e29b-41d4-a716-446655440002"}', '660e8400-e29b-41d4-a716-446655440001', '2023-01-15', 'ADMIN001', true),

-- Medical Director
('880e8400-e29b-41d4-a716-446655440002', '22222222-2222-2222-2222-222222222222', 'EMP002', 'Dr. Michael', 'Rodriguez', 'michael.rodriguez@prismhealthlab.com', '(555) 234-5678', 'doctor',
 '{"patient_data_access", "patient_data_modify", "order_management", "appointment_management", "test_results_access", "test_results_modify", "analytics_access"}',
 'Medical', '{"660e8400-e29b-41d4-a716-446655440001", "660e8400-e29b-41d4-a716-446655440003"}', '660e8400-e29b-41d4-a716-446655440001', '2023-02-01', 'MD123456', true),

-- Lab Technicians
('880e8400-e29b-41d4-a716-446655440003', '33333333-3333-3333-3333-333333333333', 'EMP003', 'Jessica', 'Park', 'jessica.park@prismhealthlab.com', '(555) 345-6789', 'technician',
 '{"patient_data_access", "order_management", "appointment_management", "test_results_modify"}',
 'Laboratory', '{"660e8400-e29b-41d4-a716-446655440001"}', '660e8400-e29b-41d4-a716-446655440001', '2023-03-10', 'MLT987654', true),

('880e8400-e29b-41d4-a716-446655440004', '44444444-4444-4444-4444-444444444444', 'EMP004', 'David', 'Thompson', 'david.thompson@prismhealthlab.com', '(555) 456-7890', 'technician',
 '{"patient_data_access", "order_management", "appointment_management", "test_results_modify"}',
 'Laboratory', '{"660e8400-e29b-41d4-a716-446655440002", "660e8400-e29b-41d4-a716-446655440005"}', '660e8400-e29b-41d4-a716-446655440002', '2023-04-05', 'MLT456789', true),

-- Phlebotomists
('880e8400-e29b-41d4-a716-446655440005', '55555555-5555-5555-5555-555555555555', 'EMP005', 'Maria', 'Garcia', 'maria.garcia@prismhealthlab.com', '(555) 567-8901', 'phlebotomist',
 '{"patient_data_access", "appointment_management"}',
 'Collection', '{"660e8400-e29b-41d4-a716-446655440003"}', '660e8400-e29b-41d4-a716-446655440003', '2023-05-15', 'PBT123456', true),

('880e8400-e29b-41d4-a716-446655440006', '66666666-6666-6666-6666-666666666666', 'EMP006', 'James', 'Wilson', 'james.wilson@prismhealthlab.com', '(555) 678-9012', 'phlebotomist',
 '{"patient_data_access", "appointment_management"}',
 'Collection', '{"660e8400-e29b-41d4-a716-446655440004"}', '660e8400-e29b-41d4-a716-446655440004', '2023-06-01', 'PBT789123', true);

-- =====================================================
-- SAMPLE USERS AND PROFILES
-- =====================================================

-- Note: In a real environment, these would be created through the Supabase auth system
-- For seed data purposes, we'll create profile records that would correspond to auth users

INSERT INTO profiles (id, user_id, swell_customer_id, first_name, last_name, email, phone, date_of_birth, gender, 
                     address_line_1, city, state, zip_code, is_active, email_verified, profile_completed) VALUES
-- Sample Patients
('990e8400-e29b-41d4-a716-446655440001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'swell_cust_001', 'John', 'Smith', 'john.smith@email.com', '(555) 111-2222', '1985-03-15', 'male',
 '123 Main Street', 'New York', 'NY', '10001', true, true, true),

('990e8400-e29b-41d4-a716-446655440002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'swell_cust_002', 'Emily', 'Johnson', 'emily.johnson@email.com', '(555) 222-3333', '1990-07-22', 'female',
 '456 Oak Avenue', 'Los Angeles', 'CA', '90210', true, true, true),

('990e8400-e29b-41d4-a716-446655440003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'swell_cust_003', 'Michael', 'Brown', 'michael.brown@email.com', '(555) 333-4444', '1982-11-08', 'male',
 '789 Pine Street', 'Chicago', 'IL', '60601', true, true, true),

('990e8400-e29b-41d4-a716-446655440004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'swell_cust_004', 'Sarah', 'Davis', 'sarah.davis@email.com', '(555) 444-5555', '1988-05-30', 'female',
 '321 Elm Drive', 'Austin', 'TX', '78704', true, true, true),

('990e8400-e29b-41d4-a716-446655440005', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'swell_cust_005', 'Robert', 'Wilson', 'robert.wilson@email.com', '(555) 555-6666', '1975-12-03', 'male',
 '654 Maple Lane', 'Brooklyn', 'NY', '11217', true, true, true);

-- User preferences for sample users
INSERT INTO user_preferences (user_id, notification_email, notification_sms, notification_push, theme_preference, language, timezone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, true, true, 'dark', 'en', 'America/New_York'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, false, true, 'dark', 'en', 'America/Los_Angeles'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, false, 'dark', 'en', 'America/Chicago'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', false, true, true, 'dark', 'en', 'America/Chicago'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, false, false, 'dark', 'en', 'America/New_York');

-- =====================================================
-- SAMPLE ORDERS
-- =====================================================

INSERT INTO orders (id, user_id, swell_order_id, customer_email, customer_name, total_amount, currency, status, payment_status,
                   billing_info, swell_order_data, metadata, order_date, created_at) VALUES
-- Recent Orders
('swell_order_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'swell_order_001', 'john.smith@email.com', 'John Smith', 199.00, 'USD', 'completed', 'paid',
 '{"firstName": "John", "lastName": "Smith", "email": "john.smith@email.com", "phone": "(555) 111-2222", "address1": "123 Main Street", "city": "New York", "state": "NY", "zip": "10001"}',
 '{"swell_id": "swell_order_001", "number": "PHL-001", "created": "2024-06-15T10:00:00Z"}',
 '{"processed_at": "2024-06-15T10:05:00Z", "payment_method": "card", "confirmation_sent": true}',
 '2024-06-15 10:00:00-04', '2024-06-15 10:00:00-04'),

('swell_order_002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'swell_order_002', 'emily.johnson@email.com', 'Emily Johnson', 399.00, 'USD', 'processing', 'paid',
 '{"firstName": "Emily", "lastName": "Johnson", "email": "emily.johnson@email.com", "phone": "(555) 222-3333", "address1": "456 Oak Avenue", "city": "Los Angeles", "state": "CA", "zip": "90210"}',
 '{"swell_id": "swell_order_002", "number": "PHL-002", "created": "2024-06-20T14:30:00Z"}',
 '{"processed_at": "2024-06-20T14:35:00Z", "payment_method": "card", "confirmation_sent": true}',
 '2024-06-20 14:30:00-07', '2024-06-20 14:30:00-07'),

('swell_order_003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'swell_order_003', 'michael.brown@email.com', 'Michael Brown', 249.00, 'USD', 'collecting', 'paid',
 '{"firstName": "Michael", "lastName": "Brown", "email": "michael.brown@email.com", "phone": "(555) 333-4444", "address1": "789 Pine Street", "city": "Chicago", "state": "IL", "zip": "60601"}',
 '{"swell_id": "swell_order_003", "number": "PHL-003", "created": "2024-06-25T09:15:00Z"}',
 '{"processed_at": "2024-06-25T09:20:00Z", "payment_method": "card", "confirmation_sent": true}',
 '2024-06-25 09:15:00-05', '2024-06-25 09:15:00-05'),

('swell_order_004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'swell_order_004', 'sarah.davis@email.com', 'Sarah Davis', 129.00, 'USD', 'confirmed', 'paid',
 '{"firstName": "Sarah", "lastName": "Davis", "email": "sarah.davis@email.com", "phone": "(555) 444-5555", "address1": "321 Elm Drive", "city": "Austin", "state": "TX", "zip": "78704"}',
 '{"swell_id": "swell_order_004", "number": "PHL-004", "created": "2024-07-01T16:45:00Z"}',
 '{"processed_at": "2024-07-01T16:50:00Z", "payment_method": "card", "confirmation_sent": true}',
 '2024-07-01 16:45:00-05', '2024-07-01 16:45:00-05'),

('swell_order_005', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'swell_order_005', 'robert.wilson@email.com', 'Robert Wilson', 179.00, 'USD', 'pending', 'paid',
 '{"firstName": "Robert", "lastName": "Wilson", "email": "robert.wilson@email.com", "phone": "(555) 555-6666", "address1": "654 Maple Lane", "city": "Brooklyn", "state": "NY", "zip": "11217"}',
 '{"swell_id": "swell_order_005", "number": "PHL-005", "created": "2024-07-05T11:20:00Z"}',
 '{"processed_at": "2024-07-05T11:25:00Z", "payment_method": "card", "confirmation_sent": true}',
 '2024-07-05 11:20:00-04', '2024-07-05 11:20:00-04');

-- =====================================================
-- ORDER TESTS (What tests are in each order)
-- =====================================================

INSERT INTO order_tests (order_id, test_id, test_name, quantity, unit_price, total_price, swell_product_id) VALUES
-- Order 1 - Essential Health Panel
('swell_order_001', '770e8400-e29b-41d4-a716-446655440001', 'Essential Health Panel', 1, 199.00, 199.00, 'swell_comprehensive_basic'),

-- Order 2 - Advanced Health Panel
('swell_order_002', '770e8400-e29b-41d4-a716-446655440002', 'Advanced Health Panel', 1, 399.00, 399.00, 'swell_comprehensive_advanced'),

-- Order 3 - Essential Hormone Panel
('swell_order_003', '770e8400-e29b-41d4-a716-446655440005', 'Essential Hormone Panel', 1, 249.00, 249.00, 'swell_hormone_basic'),

-- Order 4 - Diabetes Risk Assessment
('swell_order_004', '770e8400-e29b-41d4-a716-446655440007', 'Diabetes Risk Assessment', 1, 129.00, 129.00, 'swell_metabolic_basic'),

-- Order 5 - Immune Function Panel
('swell_order_005', '770e8400-e29b-41d4-a716-446655440008', 'Immune Function Panel', 1, 179.00, 179.00, 'swell_immune_basic');

-- =====================================================
-- APPOINTMENTS
-- =====================================================

INSERT INTO appointments (id, user_id, order_id, location_id, appointment_date, appointment_time, duration_minutes, status,
                         assigned_staff_id, confirmation_sent, metadata) VALUES
-- Completed Appointments
('app_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'swell_order_001', '660e8400-e29b-41d4-a716-446655440001', 
 '2024-06-16', '09:00:00', 30, 'completed', '880e8400-e29b-41d4-a716-446655440003', true,
 '{"collection_notes": "Sample collected successfully", "fasting_confirmed": true}'),

-- Upcoming Appointments
('app_002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'swell_order_002', '660e8400-e29b-41d4-a716-446655440003',
 '2024-07-30', '14:00:00', 30, 'confirmed', '880e8400-e29b-41d4-a716-446655440005', true,
 '{"special_instructions": "Comprehensive panel - allow extra time", "fasting_required": true}'),

('app_003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'swell_order_003', '660e8400-e29b-41d4-a716-446655440004',
 '2024-07-28', '10:30:00', 30, 'confirmed', '880e8400-e29b-41d4-a716-446655440006', true,
 '{"special_instructions": "Hormone panel - morning collection preferred"}'),

('app_004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'swell_order_004', '660e8400-e29b-41d4-a716-446655440005',
 '2024-08-02', '08:00:00', 30, 'scheduled', null, false,
 '{"fasting_required": true, "reminder_scheduled": true}'),

('app_005', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'swell_order_005', '660e8400-e29b-41d4-a716-446655440002',
 '2024-08-05', '11:15:00', 30, 'scheduled', null, false,
 '{"follow_up_appointment": false});

-- =====================================================
-- TEST RESULTS (For completed orders)
-- =====================================================

INSERT INTO test_results (id, user_id, order_id, test_id, appointment_id, lab_report_number, collection_date, result_date,
                         results_data, status, patient_notified, reviewed_by_provider, reviewed_by_staff_id) VALUES
-- Completed results for John Smith
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'swell_order_001', '770e8400-e29b-41d4-a716-446655440001', 'app_001',
 'LAB2024061601', '2024-06-16 09:00:00-04', '2024-06-17 14:30:00-04',
 '{
   "glucose": {"value": 92, "unit": "mg/dL", "reference_range": "70-99", "status": "normal"},
   "total_cholesterol": {"value": 185, "unit": "mg/dL", "reference_range": "<200", "status": "normal"},
   "HDL": {"value": 55, "unit": "mg/dL", "reference_range": ">40", "status": "normal"},
   "LDL": {"value": 108, "unit": "mg/dL", "reference_range": "<100", "status": "borderline_high"},
   "triglycerides": {"value": 110, "unit": "mg/dL", "reference_range": "<150", "status": "normal"},
   "TSH": {"value": 2.1, "unit": "mIU/L", "reference_range": "0.4-4.0", "status": "normal"},
   "vitamin_d": {"value": 28, "unit": "ng/mL", "reference_range": "30-100", "status": "low"}
 }',
 'completed', true, true, '880e8400-e29b-41d4-a716-446655440002');

-- =====================================================
-- BIOMARKER DATA (Extracted from test results)
-- =====================================================

INSERT INTO biomarker_data (result_id, user_id, test_id, biomarker_name, biomarker_code, value, unit, 
                           reference_range_min, reference_range_max, is_abnormal, abnormal_flag, measurement_date) VALUES
-- John Smith's biomarkers
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'Glucose', 'GLUCOSE', 92, 'mg/dL', 70, 99, false, null, '2024-06-17 14:30:00-04'),
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'Total Cholesterol', 'CHOL', 185, 'mg/dL', null, 200, false, null, '2024-06-17 14:30:00-04'),
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'HDL Cholesterol', 'HDL', 55, 'mg/dL', 40, null, false, null, '2024-06-17 14:30:00-04'),
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'LDL Cholesterol', 'LDL', 108, 'mg/dL', null, 100, true, 'HIGH', '2024-06-17 14:30:00-04'),
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'Triglycerides', 'TRIG', 110, 'mg/dL', null, 150, false, null, '2024-06-17 14:30:00-04'),
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'TSH', 'TSH', 2.1, 'mIU/L', 0.4, 4.0, false, null, '2024-06-17 14:30:00-04'),
('result_001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '770e8400-e29b-41d4-a716-446655440001', 'Vitamin D', 'VIT_D', 28, 'ng/mL', 30, 100, true, 'LOW', '2024-06-17 14:30:00-04');

-- =====================================================
-- EMAIL TEMPLATES
-- =====================================================

INSERT INTO email_templates (template_name, template_type, subject, html_content, text_content, variables, is_active) VALUES
('appointment_confirmation', 'appointment_confirmation', 'Your Prism Health Lab Appointment Confirmation',
 '<html><body><h1>Appointment Confirmed</h1><p>Dear {{firstName}},</p><p>Your appointment has been confirmed for {{appointmentDate}} at {{appointmentTime}}.</p><p>Location: {{locationName}}</p><p>Tests: {{testNames}}</p><p>Please arrive 10 minutes early and bring a valid ID.</p></body></html>',
 'Dear {{firstName}}, Your appointment has been confirmed for {{appointmentDate}} at {{appointmentTime}}. Location: {{locationName}}. Tests: {{testNames}}. Please arrive 10 minutes early and bring a valid ID.',
 '{"firstName": "Patient first name", "appointmentDate": "Date of appointment", "appointmentTime": "Time of appointment", "locationName": "Testing location", "testNames": "List of tests"}',
 true),

('appointment_reminder', 'appointment_reminder', 'Reminder: Your Prism Health Lab Appointment Tomorrow',
 '<html><body><h1>Appointment Reminder</h1><p>Dear {{firstName}},</p><p>This is a reminder that you have an appointment tomorrow at {{appointmentTime}}.</p><p>Location: {{locationName}}</p><p>{{fastingInstructions}}</p></body></html>',
 'Dear {{firstName}}, This is a reminder that you have an appointment tomorrow at {{appointmentTime}}. Location: {{locationName}}. {{fastingInstructions}}',
 '{"firstName": "Patient first name", "appointmentTime": "Time of appointment", "locationName": "Testing location", "fastingInstructions": "Fasting requirements"}',
 true),

('result_notification', 'result_notification', 'Your Prism Health Lab Results Are Ready',
 '<html><body><h1>Test Results Available</h1><p>Dear {{firstName}},</p><p>Your test results for {{testName}} are now available in your patient portal.</p><p>Log in at: {{portalUrl}}</p></body></html>',
 'Dear {{firstName}}, Your test results for {{testName}} are now available in your patient portal. Log in at: {{portalUrl}}',
 '{"firstName": "Patient first name", "testName": "Name of completed test", "portalUrl": "Link to patient portal"}',
 true);

-- =====================================================
-- APPOINTMENT SLOTS (Sample availability)
-- =====================================================

-- Generate appointment slots for the next 30 days
INSERT INTO appointment_slots (location_id, slot_date, start_time, end_time, duration_minutes, max_appointments, is_available)
SELECT 
    location.id,
    current_date + (day_offset || ' days')::interval,
    (hour_slot || ':00:00')::time,
    (hour_slot || ':30:00')::time,
    30,
    CASE 
        WHEN location.capacity_per_hour IS NULL THEN 2
        ELSE location.capacity_per_hour / 2
    END,
    true
FROM 
    (SELECT id, capacity_per_hour FROM locations WHERE is_active = true) location,
    generate_series(1, 30) day_offset,
    generate_series(8, 17) hour_slot
WHERE 
    -- Only create slots for weekdays
    EXTRACT(dow FROM current_date + (day_offset || ' days')::interval) BETWEEN 1 AND 5;

-- =====================================================
-- PERFORMANCE METRICS (Sample data)
-- =====================================================

INSERT INTO performance_metrics (user_id, session_id, metric_name, metric_type, metric_value, metric_unit, page_url, timestamp) VALUES
-- Sample performance data for the last week
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'session_001', 'page_load_time', 'timing', 1250, 'ms', '/portal/dashboard', NOW() - INTERVAL '1 day'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'session_001', 'time_to_interactive', 'timing', 2100, 'ms', '/portal/dashboard', NOW() - INTERVAL '1 day'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'session_002', 'page_load_time', 'timing', 980, 'ms', '/portal/purchase-history', NOW() - INTERVAL '2 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'session_003', 'api_response_time', 'timing', 340, 'ms', '/api/portal/purchase-history', NOW() - INTERVAL '3 days');

-- =====================================================
-- CACHE OPERATION LOGS (Sample data)
-- =====================================================

INSERT INTO cache_operation_logs (operation_type, cache_key, cache_type, execution_time_ms, cache_hit, user_id, success) VALUES
('get', 'purchase_history:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa:default', 'purchase_history', 15, true, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
('set', 'purchase_history:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb:default', 'purchase_history', 45, false, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
('get', 'analytics:cccccccc-cccc-cccc-cccc-cccccccccccc:monthly', 'analytics', 22, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc', true),
('invalidate', 'purchase_history:*', 'purchase_history', 120, false, null, true);

-- =====================================================
-- SAMPLE AUDIT LOGS
-- =====================================================

-- Create some sample audit logs using our logging function
SELECT log_patient_access(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'view_purchase_history',
    'orders',
    'swell_order_001',
    true,
    '{"query_params": {"page": 1, "limit": 10}, "total_records": 1}'::jsonb
);

SELECT log_patient_access(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'view_test_results',
    'test_results',
    null,
    true,
    '{"pending_results": 1}'::jsonb
);

-- =====================================================
-- WEBHOOK EVENTS (Sample Swell integration data)
-- =====================================================

INSERT INTO webhook_events (webhook_source, event_type, event_id, raw_payload, processed, processing_success) VALUES
('swell', 'order.created', 'swell_order_001', 
 '{"id": "swell_order_001", "status": "pending", "total": 199.00, "customer": {"email": "john.smith@email.com"}}',
 true, true),
('swell', 'order.paid', 'swell_order_001',
 '{"id": "swell_order_001", "status": "processing", "payment_status": "paid"}',
 true, true),
('swell', 'order.updated', 'swell_order_002',
 '{"id": "swell_order_002", "status": "processing", "total": 399.00}',
 true, true);

-- =====================================================
-- SWELL SYNC LOG
-- =====================================================

INSERT INTO swell_sync_log (sync_type, sync_direction, total_records, successful_syncs, failed_syncs, success, triggered_by, records_created, records_updated) VALUES
('orders', 'swell_to_local', 5, 5, 0, true, 'webhook', 3, 2),
('products', 'swell_to_local', 10, 10, 0, true, 'scheduled', 10, 0),
('customers', 'swell_to_local', 5, 5, 0, true, 'webhook', 2, 3);

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 
    'Seed data inserted successfully!' as result,
    (SELECT COUNT(*) FROM test_categories) as test_categories_created,
    (SELECT COUNT(*) FROM diagnostic_tests) as diagnostic_tests_created,
    (SELECT COUNT(*) FROM locations) as locations_created,
    (SELECT COUNT(*) FROM staff) as staff_created,
    (SELECT COUNT(*) FROM profiles) as sample_patients_created,
    (SELECT COUNT(*) FROM orders) as sample_orders_created,
    (SELECT COUNT(*) FROM appointments) as appointments_created,
    (SELECT COUNT(*) FROM test_results) as test_results_created,
    (SELECT COUNT(*) FROM appointment_slots) as appointment_slots_created;