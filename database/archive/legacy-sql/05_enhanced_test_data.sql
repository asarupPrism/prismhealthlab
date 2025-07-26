-- =====================================================
-- Enhanced Test Panels and Diagnostic Data
-- =====================================================
-- 
-- Comprehensive test panels, bundles, and clinical data
-- that are missing from the base schema. This addresses
-- real-world diagnostic testing scenarios.
-- =====================================================

-- =====================================================
-- MISSING TABLE: TEST BUNDLES AND PANELS
-- =====================================================

-- Test bundles (multiple tests sold together at a discount)
CREATE TABLE IF NOT EXISTS test_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swell_product_id TEXT UNIQUE, -- Link to Swell bundle product
    name TEXT NOT NULL,
    description TEXT,
    bundle_type TEXT CHECK (bundle_type IN ('wellness', 'condition_specific', 'age_based', 'gender_specific', 'seasonal', 'comprehensive')),
    
    -- Bundled tests
    included_test_ids UUID[] NOT NULL, -- Array of diagnostic_tests.id
    
    -- Pricing
    individual_price DECIMAL(10,2) NOT NULL, -- Sum of individual test prices
    bundle_price DECIMAL(10,2) NOT NULL, -- Discounted bundle price
    savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (individual_price - bundle_price) STORED,
    savings_percentage DECIMAL(5,2) GENERATED ALWAYS AS (((individual_price - bundle_price) / individual_price) * 100) STORED,
    
    -- Clinical information
    recommended_for TEXT[], -- Conditions, symptoms, or demographics
    clinical_rationale TEXT, -- Why these tests are bundled together
    interpretation_guide TEXT, -- How to interpret results together
    
    -- Targeting
    target_demographics JSONB DEFAULT '{}', -- Age ranges, gender, etc.
    seasonal_relevance TEXT[], -- Months when most relevant
    follow_up_recommendations TEXT,
    
    -- Marketing
    featured BOOLEAN DEFAULT FALSE,
    popularity_rank INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    available_from DATE,
    available_until DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MISSING TABLE: TEST RESULT TEMPLATES
-- =====================================================

-- Templates for how test results should be displayed and interpreted
CREATE TABLE IF NOT EXISTS test_result_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
    
    -- Template structure
    template_name TEXT NOT NULL,
    result_format JSONB NOT NULL, -- Structure for how results are displayed
    interpretation_rules JSONB NOT NULL, -- Rules for flagging abnormal results
    
    -- Reference ranges by demographics
    reference_ranges_by_age JSONB DEFAULT '{}',
    reference_ranges_by_gender JSONB DEFAULT '{}',
    reference_ranges_by_ethnicity JSONB DEFAULT '{}',
    
    -- Clinical decision support
    clinical_alerts JSONB DEFAULT '{}', -- Critical value alerts
    follow_up_recommendations JSONB DEFAULT '{}',
    lifestyle_recommendations JSONB DEFAULT '{}',
    
    -- Visualization
    chart_config JSONB DEFAULT '{}', -- How to chart/graph the results
    trend_analysis_config JSONB DEFAULT '{}',
    
    -- Version control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MISSING TABLE: BIOMARKER DEFINITIONS
-- =====================================================

-- Comprehensive biomarker reference database
CREATE TABLE IF NOT EXISTS biomarker_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    biomarker_name TEXT NOT NULL UNIQUE,
    biomarker_code TEXT UNIQUE, -- LOINC, SNOMED, etc.
    common_names TEXT[], -- Alternative names
    abbreviation TEXT,
    
    -- Clinical information
    category TEXT NOT NULL, -- cardiovascular, metabolic, etc.
    subcategory TEXT,
    clinical_significance TEXT NOT NULL,
    what_it_measures TEXT NOT NULL,
    
    -- Reference ranges (base ranges, refined by demographics)
    default_unit TEXT NOT NULL,
    alternative_units JSONB DEFAULT '{}', -- Unit conversions
    default_reference_range JSONB NOT NULL,
    
    -- Demographic variations
    age_based_ranges JSONB DEFAULT '{}',
    gender_based_ranges JSONB DEFAULT '{}',
    ethnicity_based_ranges JSONB DEFAULT '{}',
    pregnancy_ranges JSONB DEFAULT '{}',
    
    -- Clinical interpretation
    low_significance TEXT, -- What low values mean
    high_significance TEXT, -- What high values mean
    critical_low_threshold DECIMAL(15,6),
    critical_high_threshold DECIMAL(15,6),
    
    -- Factors affecting results
    factors_increasing TEXT[], -- Diet, medications, conditions that increase
    factors_decreasing TEXT[], -- Diet, medications, conditions that decrease
    sample_timing_requirements TEXT,
    
    -- Related biomarkers
    related_biomarkers TEXT[], -- Other markers to consider
    ratio_calculations JSONB DEFAULT '{}', -- Common ratios using this marker
    
    -- Patient education
    patient_friendly_name TEXT,
    patient_explanation TEXT,
    improvement_tips TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MISSING TABLE: TEST PREREQUISITES AND CONTRAINDICATIONS
-- =====================================================

-- Prerequisites and contraindications for tests
CREATE TABLE IF NOT EXISTS test_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE NOT NULL,
    
    -- Prerequisites
    fasting_hours INTEGER,
    fasting_instructions TEXT,
    medication_restrictions TEXT[], -- Medications to avoid
    dietary_restrictions TEXT[], -- Foods to avoid
    timing_requirements TEXT, -- Best time of day, cycle timing
    
    -- Contraindications
    absolute_contraindications TEXT[], -- When test cannot be done
    relative_contraindications TEXT[], -- When test should be cautious
    pregnancy_safety TEXT CHECK (pregnancy_safety IN ('safe', 'caution', 'contraindicated', 'unknown')),
    
    -- Age restrictions
    minimum_age_years INTEGER,
    maximum_age_years INTEGER,
    pediatric_considerations TEXT,
    geriatric_considerations TEXT,
    
    -- Medical conditions
    required_conditions TEXT[], -- Conditions that must be present
    excluded_conditions TEXT[], -- Conditions that exclude the test
    
    -- Pre-test requirements
    informed_consent_required BOOLEAN DEFAULT FALSE,
    physician_order_required BOOLEAN DEFAULT FALSE,
    insurance_preauth_required BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MISSING TABLE: HEALTH CONDITIONS AND TEST RECOMMENDATIONS
-- =====================================================

-- Health conditions and their recommended test panels
CREATE TABLE IF NOT EXISTS condition_test_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Condition information
    condition_name TEXT NOT NULL,
    condition_code TEXT, -- ICD-10 or similar
    condition_category TEXT,
    severity_level TEXT CHECK (severity_level IN ('screening', 'monitoring', 'diagnostic', 'emergency')),
    
    -- Test recommendations
    recommended_tests UUID[], -- Array of test IDs
    recommended_bundles UUID[], -- Array of bundle IDs
    test_frequency TEXT, -- How often to repeat
    
    -- Clinical context
    symptoms TEXT[], -- Associated symptoms
    risk_factors TEXT[], -- Risk factors for condition
    population TEXT, -- Who should be tested
    
    -- Evidence level
    evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'expert_opinion')),
    guideline_source TEXT, -- Medical society recommendations
    last_updated DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MISSING TABLE: SEASONAL AND TRENDING TESTS
-- =====================================================

-- Track seasonal test demand and trending health topics
CREATE TABLE IF NOT EXISTS seasonal_test_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Test information
    test_id UUID REFERENCES diagnostic_tests(id) NOT NULL,
    bundle_id UUID REFERENCES test_bundles(id),
    
    -- Seasonal patterns
    peak_months INTEGER[], -- Months with highest demand (1-12)
    seasonal_factors TEXT[], -- Why seasonal (allergies, flu season, etc.)
    
    -- Trending topics
    trending_keywords TEXT[], -- Health topics driving demand
    social_media_mentions INTEGER DEFAULT 0,
    news_mentions INTEGER DEFAULT 0,
    
    -- Marketing insights
    target_campaigns TEXT[], -- Marketing campaigns this applies to
    promotional_messaging TEXT,
    
    -- Analytics
    demand_multiplier DECIMAL(4,2) DEFAULT 1.0, -- Demand increase factor
    year INTEGER NOT NULL,
    last_analyzed DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT COMPREHENSIVE TEST BUNDLES
-- =====================================================

INSERT INTO test_bundles (id, swell_product_id, name, description, bundle_type, included_test_ids, individual_price, bundle_price, recommended_for, clinical_rationale, target_demographics) VALUES

-- Comprehensive Health Packages
('bundle_001', 'swell_bundle_complete_health', 'Complete Health Assessment', 
 'Our most comprehensive health panel covering all major body systems and health markers', 'comprehensive',
 '{"770e8400-e29b-41d4-a716-446655440001", "770e8400-e29b-41d4-a716-446655440003", "770e8400-e29b-41d4-a716-446655440005", "770e8400-e29b-41d4-a716-446655440007"}',
 827.00, 599.00,
 '{"annual_physical", "preventive_care", "health_optimization", "executive_physical"}',
 'Comprehensive assessment combining metabolic, cardiovascular, hormone, and immune system evaluation for complete health picture',
 '{"age_range": "25-65", "frequency": "annually", "ideal_for": "health_conscious_adults"}'),

-- Age-Specific Bundles
('bundle_002', 'swell_bundle_mens_40plus', 'Men''s Health 40+ Panel', 
 'Comprehensive health screening designed for men over 40, focusing on age-related health concerns', 'age_based',
 '{"770e8400-e29b-41d4-a716-446655440002", "770e8400-e29b-41d4-a716-446655440004", "770e8400-e29b-41d4-a716-446655440005"}',
 948.00, 699.00,
 '{"men_over_40", "cardiovascular_risk", "hormone_decline", "metabolic_syndrome"}',
 'Targets common health concerns in men over 40: heart disease, diabetes, testosterone decline, and comprehensive metabolic assessment',
 '{"gender": "male", "age_range": "40-70", "frequency": "annually"}'),

('bundle_003', 'swell_bundle_womens_wellness', 'Women''s Wellness Complete', 
 'Comprehensive women''s health panel including hormones, reproductive health, and general wellness', 'gender_specific',
 '{"770e8400-e29b-41d4-a716-446655440002", "770e8400-e29b-41d4-a716-446655440006", "770e8400-e29b-41d4-a716-446655440009"}',
 1047.00, 799.00,
 '{"women_health", "hormone_balance", "reproductive_health", "menopause_screening"}',
 'Complete women''s health assessment including hormone balance, nutritional status, and comprehensive health markers',
 '{"gender": "female", "age_range": "25-55", "frequency": "annually"}'),

-- Condition-Specific Bundles
('bundle_004', 'swell_bundle_diabetes_monitoring', 'Diabetes Risk & Monitoring Panel', 
 'Complete diabetes screening and monitoring package for pre-diabetics and diabetics', 'condition_specific',
 '{"770e8400-e29b-41d4-a716-446655440007", "770e8400-e29b-41d4-a716-446655440003", "770e8400-e29b-41d4-a716-446655440008"}',
 567.00, 399.00,
 '{"diabetes_risk", "prediabetes", "metabolic_syndrome", "insulin_resistance"}',
 'Comprehensive diabetes screening including glucose metabolism, cardiovascular risk factors, and immune function',
 '{"conditions": ["prediabetes", "family_history_diabetes"], "frequency": "quarterly"}'),

-- Athletic/Performance Bundles
('bundle_005', 'swell_bundle_athlete_performance', 'Elite Athletic Performance Panel', 
 'Advanced testing for serious athletes and fitness enthusiasts focusing on performance optimization', 'wellness',
 '{"770e8400-e29b-41d4-a716-446655440010", "770e8400-e29b-41d4-a716-446655440006", "770e8400-e29b-41d4-a716-446655440005"}',
 977.00, 699.00,
 '{"athletes", "fitness_enthusiasts", "performance_optimization", "recovery_monitoring"}',
 'Comprehensive athletic assessment including performance markers, nutritional status, and hormonal optimization',
 '{"lifestyle": "athletic", "age_range": "18-50", "activity_level": "high"}'),

-- Seasonal Bundles
('bundle_006', 'swell_bundle_immune_support', 'Immune System Support Panel', 
 'Comprehensive immune system assessment with nutritional support analysis', 'seasonal',
 '{"770e8400-e29b-41d4-a716-446655440008", "770e8400-e29b-41d4-a716-446655440009"}',
 528.00, 399.00,
 '{"frequent_illness", "immune_support", "seasonal_preparation", "stress_management"}',
 'Complete immune system evaluation with nutritional assessment to identify deficiencies affecting immune function',
 '{"seasonal": ["fall", "winter"], "frequency": "seasonally"}');

-- =====================================================
-- INSERT BIOMARKER DEFINITIONS
-- =====================================================

INSERT INTO biomarker_definitions (biomarker_name, biomarker_code, common_names, abbreviation, category, subcategory, clinical_significance, what_it_measures, default_unit, default_reference_range, age_based_ranges, gender_based_ranges, low_significance, high_significance, critical_low_threshold, critical_high_threshold, factors_increasing, factors_decreasing, patient_friendly_name, patient_explanation, improvement_tips) VALUES

-- Cardiovascular Markers
('Total Cholesterol', 'CHOL_TOTAL', '{"Cholesterol", "Total Chol"}', 'TC', 'cardiovascular', 'lipids',
 'Primary screening marker for cardiovascular disease risk assessment',
 'Total amount of cholesterol in blood, including both good (HDL) and bad (LDL) cholesterol',
 'mg/dL', '{"optimal": {"max": 200}, "borderline": {"min": 200, "max": 239}, "high": {"min": 240}}',
 '{"under_20": {"max": 170}, "20_39": {"max": 200}, "40_plus": {"max": 200}}',
 '{"male": {"max": 200}, "female": {"max": 200}}',
 'May indicate malnutrition, liver disease, or hyperthyroidism',
 'Increased risk of heart disease, stroke, and peripheral artery disease',
 100, 300,
 '{"saturated_fat", "trans_fat", "dietary_cholesterol", "obesity", "diabetes", "hypothyroidism"}',
 '{"exercise", "soluble_fiber", "plant_sterols", "weight_loss", "statins"}',
 'Total Cholesterol', 'The total amount of cholesterol (both good and bad types) circulating in your blood',
 '{"increase_fiber_intake", "reduce_saturated_fat", "exercise_regularly", "maintain_healthy_weight"}'),

('HDL Cholesterol', 'HDL_CHOL', '{"Good Cholesterol", "High-Density Lipoprotein"}', 'HDL', 'cardiovascular', 'lipids',
 'Protective cholesterol that removes excess cholesterol from arteries',
 'High-density lipoprotein cholesterol that transports cholesterol to liver for disposal',
 'mg/dL', '{"low": {"max": 40}, "borderline": {"min": 40, "max": 59}, "high": {"min": 60}}',
 '{"all_ages": {"min": 40}}',
 '{"male": {"min": 40}, "female": {"min": 50}}',
 'Increased risk of heart disease and stroke',
 'Protective against heart disease - higher is better',
 20, null,
 '{"exercise", "moderate_alcohol", "weight_loss", "niacin", "omega_3"}',
 '{"smoking", "diabetes", "obesity", "sedentary_lifestyle"}',
 'Good Cholesterol (HDL)', 'The "good" cholesterol that helps remove harmful cholesterol from your arteries',
 '{"exercise_regularly", "quit_smoking", "eat_healthy_fats", "maintain_healthy_weight"}'),

-- Metabolic Markers
('Fasting Glucose', 'GLUCOSE_FAST', '{"Blood Sugar", "Blood Glucose", "FBG"}', 'FG', 'metabolic', 'glucose',
 'Primary screening test for diabetes and glucose metabolism disorders',
 'Blood sugar level after fasting for at least 8 hours',
 'mg/dL', '{"normal": {"min": 70, "max": 99}, "prediabetes": {"min": 100, "max": 125}, "diabetes": {"min": 126}}',
 '{"all_ages": {"min": 70, "max": 99}}',
 '{"male": {"min": 70, "max": 99}, "female": {"min": 70, "max": 99}}',
 'May indicate hypoglycemia, liver disease, or insulin excess',
 'May indicate diabetes, prediabetes, or insulin resistance',
 50, 400,
 '{"diabetes", "stress", "infection", "medications", "poor_diet"}',
 '{"exercise", "weight_loss", "healthy_diet", "diabetes_medication"}',
 'Blood Sugar (Fasting)', 'Your blood sugar level after not eating for at least 8 hours',
 '{"eat_balanced_meals", "exercise_regularly", "maintain_healthy_weight", "limit_refined_carbs"}'),

('Hemoglobin A1c', 'HBA1C', '{"A1C", "Glycated Hemoglobin", "HbA1c"}', 'A1C', 'metabolic', 'glucose',
 'Average blood sugar control over the past 2-3 months',
 'Percentage of hemoglobin with glucose attached, reflecting long-term glucose control',
 '%', '{"normal": {"max": 5.6}, "prediabetes": {"min": 5.7, "max": 6.4}, "diabetes": {"min": 6.5}}',
 '{"all_ages": {"max": 5.6}}',
 '{"male": {"max": 5.6}, "female": {"max": 5.6}}',
 'Usually not clinically significant unless very low',
 'Indicates poor glucose control and increased diabetes complications risk',
 null, 12.0,
 '{"diabetes", "chronic_kidney_disease", "iron_deficiency"}',
 '{"glucose_control", "diabetes_medication", "lifestyle_changes"}',
 'Average Blood Sugar (A1C)', 'Shows your average blood sugar control over the past 2-3 months',
 '{"follow_diabetes_diet", "take_medications_as_prescribed", "monitor_blood_sugar", "exercise_regularly"}'),

-- Thyroid Markers
('Thyroid Stimulating Hormone', 'TSH', '{"TSH", "Thyrotropin"}', 'TSH', 'endocrine', 'thyroid',
 'Primary screening test for thyroid function disorders',
 'Hormone from pituitary gland that stimulates thyroid hormone production',
 'mIU/L', '{"normal": {"min": 0.4, "max": 4.0}, "subclinical_hypo": {"min": 4.0, "max": 10.0}, "hypothyroid": {"min": 10.0}}',
 '{"18_30": {"min": 0.4, "max": 2.5}, "30_50": {"min": 0.4, "max": 4.0}, "over_50": {"min": 0.5, "max": 5.0}}',
 '{"all": {"min": 0.4, "max": 4.0}}',
 'May indicate hyperthyroidism - overactive thyroid',
 'May indicate hypothyroidism - underactive thyroid',
 0.01, 100.0,
 '{"hypothyroidism", "thyroid_resistance", "pituitary_disorders"}',
 '{"hyperthyroidism", "thyroid_hormone_replacement"}',
 'Thyroid Stimulating Hormone (TSH)', 'A hormone that tells your thyroid gland how much thyroid hormone to make',
 '{"maintain_healthy_weight", "manage_stress", "get_adequate_iodine", "avoid_excessive_soy"}');

-- =====================================================
-- INSERT TEST RESULT TEMPLATES
-- =====================================================

INSERT INTO test_result_templates (test_id, template_name, result_format, interpretation_rules, reference_ranges_by_age, clinical_alerts, follow_up_recommendations, chart_config) VALUES

-- Essential Health Panel Template
('770e8400-e29b-41d4-a716-446655440001', 'Essential Health Panel Results',
 '{
   "sections": [
     {
       "name": "Metabolic Panel",
       "biomarkers": ["glucose", "HbA1c", "creatinine", "BUN", "ALT", "AST"],
       "display_order": 1
     },
     {
       "name": "Lipid Panel", 
       "biomarkers": ["total_cholesterol", "HDL", "LDL", "triglycerides"],
       "display_order": 2
     },
     {
       "name": "Thyroid Function",
       "biomarkers": ["TSH"],
       "display_order": 3
     },
     {
       "name": "Nutritional Status",
       "biomarkers": ["vitamin_d"],
       "display_order": 4
     }
   ]
 }',
 '{
   "glucose": {
     "normal": {"min": 70, "max": 99, "flag": "normal"},
     "borderline": {"min": 100, "max": 125, "flag": "attention"},
     "high": {"min": 126, "flag": "abnormal"}
   },
   "total_cholesterol": {
     "optimal": {"max": 200, "flag": "normal"},
     "borderline": {"min": 200, "max": 239, "flag": "attention"},
     "high": {"min": 240, "flag": "abnormal"}
   }
 }',
 '{
   "under_30": {"glucose": {"max": 99}, "cholesterol": {"max": 200}},
   "30_50": {"glucose": {"max": 99}, "cholesterol": {"max": 220}},
   "over_50": {"glucose": {"max": 109}, "cholesterol": {"max": 240}}
 }',
 '{
   "critical_glucose": {"threshold": 400, "message": "Critical high glucose - immediate medical attention required"},
   "critical_low_glucose": {"threshold": 50, "message": "Critical low glucose - immediate medical attention required"}
 }',
 '{
   "high_glucose": {
     "condition": "glucose > 125",
     "recommendation": "Follow up with healthcare provider for diabetes evaluation",
     "timeframe": "within_2_weeks"
   },
   "high_cholesterol": {
     "condition": "total_cholesterol > 240", 
     "recommendation": "Cardiology consultation and lifestyle modifications",
     "timeframe": "within_4_weeks"
   }
 }',
 '{
   "type": "dashboard",
   "sections": [
     {"biomarkers": ["glucose", "HbA1c"], "chart_type": "gauge", "color_zones": true},
     {"biomarkers": ["total_cholesterol", "HDL", "LDL"], "chart_type": "bar", "target_lines": true}
   ]
 }');

-- =====================================================
-- INSERT TEST REQUIREMENTS
-- =====================================================

INSERT INTO test_requirements (test_id, fasting_hours, fasting_instructions, medication_restrictions, dietary_restrictions, timing_requirements, absolute_contraindications, pregnancy_safety, informed_consent_required) VALUES

-- Essential Health Panel Requirements
('770e8400-e29b-41d4-a716-446655440001', 12, 
 'Fast for 12 hours before test. Water is allowed. No food, beverages (except water), gum, or candy.',
 '{"biotin_supplements", "high_dose_vitamin_c"}',
 '{"alcohol_24_hours", "high_fat_meals"}',
 'Best collected in morning (7-10 AM) after overnight fast',
 '{}', 'safe', false),

-- Hormone Panel Requirements  
('770e8400-e29b-41d4-a716-446655440005', null,
 'No fasting required. For women, timing relative to menstrual cycle may affect results.',
 '{"hormone_replacement_therapy", "birth_control_pills", "biotin_supplements"}',
 '{}',
 'For women: Best collected on days 3-5 of menstrual cycle for baseline hormones',
 '{}', 'caution', false),

-- Advanced Cardiac Risk Requirements
('770e8400-e29b-41d4-a716-446655440004', 12,
 'Fast for 12 hours. Maintain normal activity level for 48 hours before test.',
 '{"niacin", "fibrates", "statins_consult_physician"}',
 '{"alcohol_48_hours", "high_fat_meals"}', 
 'Avoid strenuous exercise 24 hours before test',
 '{}', 'safe', false);

-- =====================================================
-- INSERT CONDITION-BASED TEST RECOMMENDATIONS
-- =====================================================

INSERT INTO condition_test_recommendations (condition_name, condition_code, condition_category, severity_level, recommended_tests, recommended_bundles, test_frequency, symptoms, risk_factors, population, evidence_level, guideline_source) VALUES

('Type 2 Diabetes Screening', 'E11', 'endocrine', 'screening',
 '{"770e8400-e29b-41d4-a716-446655440007"}', '{"bundle_004"}', 'annually',
 '{"excessive_thirst", "frequent_urination", "unexplained_weight_loss", "fatigue", "blurred_vision"}',
 '{"family_history", "obesity", "sedentary_lifestyle", "age_over_35", "previous_gestational_diabetes"}',
 'Adults age 35+ or younger adults with risk factors',
 'A', 'American Diabetes Association 2024'),

('Cardiovascular Disease Risk', 'I25', 'cardiovascular', 'screening', 
 '{"770e8400-e29b-41d4-a716-446655440003", "770e8400-e29b-41d4-a716-446655440004"}', '{}', 'every_5_years',
 '{"chest_pain", "shortness_of_breath", "fatigue", "palpitations"}',
 '{"family_history", "smoking", "diabetes", "hypertension", "high_cholesterol", "age"}',
 'Men 35+, Women 45+, or younger with risk factors',
 'A', 'American Heart Association 2023'),

('Thyroid Dysfunction', 'E03', 'endocrine', 'screening',
 '{"770e8400-e29b-41d4-a716-446655440005"}', '{}', 'every_5_years',
 '{"fatigue", "weight_changes", "hair_loss", "cold_intolerance", "depression"}',
 '{"family_history", "autoimmune_disease", "previous_thyroid_problems", "female_gender", "age_over_50"}',
 'Women 50+, men 60+, or those with symptoms/risk factors',
 'B', 'American Thyroid Association 2021');

-- =====================================================
-- INSERT SEASONAL TRENDS
-- =====================================================

INSERT INTO seasonal_test_trends (test_id, bundle_id, peak_months, seasonal_factors, trending_keywords, target_campaigns, demand_multiplier, year) VALUES

-- Immune system testing peaks in fall/winter
('770e8400-e29b-41d4-a716-446655440008', null, '{9,10,11,12,1,2}',
 '{"flu_season", "cold_weather", "back_to_school", "holiday_stress"}',
 '{"immune_support", "flu_prevention", "vitamin_d", "cold_and_flu"}',
 '{"fall_wellness", "immune_boost", "winter_prep"}', 1.8, 2024),

-- Comprehensive health testing peaks in January (New Year resolutions)
('770e8400-e29b-41d4-a716-446655440001', 'bundle_001', '{1,2}',
 '{"new_year_resolutions", "health_goals", "insurance_deductible_reset"}',
 '{"new_year_health", "wellness_goals", "health_checkup", "preventive_care"}',
 '{"new_year_wellness", "resolution_health", "fresh_start"}', 2.5, 2024),

-- Athletic performance testing peaks in spring (sports season prep)
('770e8400-e29b-41d4-a716-446655440010', 'bundle_005', '{3,4,5}',
 '{"sports_season_prep", "summer_body_prep", "marathon_training"}',
 '{"athletic_performance", "fitness_optimization", "sports_medicine", "performance_testing"}',
 '{"athlete_performance", "spring_training", "fitness_goals"}', 1.6, 2024);

-- =====================================================
-- CREATE INDEXES FOR NEW TABLES
-- =====================================================

-- Test bundles indexes
CREATE INDEX IF NOT EXISTS idx_test_bundles_swell_product_id ON test_bundles(swell_product_id);
CREATE INDEX IF NOT EXISTS idx_test_bundles_bundle_type ON test_bundles(bundle_type);
CREATE INDEX IF NOT EXISTS idx_test_bundles_is_active ON test_bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_test_bundles_featured ON test_bundles(featured);

-- Biomarker definitions indexes
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_name ON biomarker_definitions(biomarker_name);
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_code ON biomarker_definitions(biomarker_code);
CREATE INDEX IF NOT EXISTS idx_biomarker_definitions_category ON biomarker_definitions(category);

-- Test requirements indexes
CREATE INDEX IF NOT EXISTS idx_test_requirements_test_id ON test_requirements(test_id);

-- Test result templates indexes
CREATE INDEX IF NOT EXISTS idx_test_result_templates_test_id ON test_result_templates(test_id);
CREATE INDEX IF NOT EXISTS idx_test_result_templates_active ON test_result_templates(is_active);

-- Condition recommendations indexes
CREATE INDEX IF NOT EXISTS idx_condition_recommendations_condition ON condition_test_recommendations(condition_name);
CREATE INDEX IF NOT EXISTS idx_condition_recommendations_category ON condition_test_recommendations(condition_category);

-- Seasonal trends indexes
CREATE INDEX IF NOT EXISTS idx_seasonal_trends_test_id ON seasonal_test_trends(test_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_trends_year ON seasonal_test_trends(year);

-- =====================================================
-- UPDATE EXISTING DIAGNOSTIC TESTS WITH MISSING DATA
-- =====================================================

-- Add comprehensive clinical data to existing tests
UPDATE diagnostic_tests SET 
    clinical_significance = 'Comprehensive metabolic and cardiovascular screening panel providing essential health indicators for preventive care and early disease detection',
    preparation_instructions = 'Fast for 12 hours before testing. Maintain normal activity level. Avoid alcohol for 24 hours.',
    lab_provider = 'Quest Diagnostics',
    cpt_codes = '{"80053", "80061", "84443", "25(OH)D3"}'
WHERE id = '770e8400-e29b-41d4-a716-446655440001';

UPDATE diagnostic_tests SET
    clinical_significance = 'Advanced cardiovascular risk stratification including inflammatory markers and advanced lipid analysis for early detection of heart disease risk',
    preparation_instructions = 'Fast for 12 hours. Avoid strenuous exercise for 24 hours. Maintain current medications unless otherwise directed.',
    lab_provider = 'LabCorp',
    cpt_codes = '{"80061", "83718", "83090", "83695", "82465"}'
WHERE id = '770e8400-e29b-41d4-a716-446655440002';

-- =====================================================
-- COMPLETION VERIFICATION
-- =====================================================

SELECT 
    'Enhanced test data loaded successfully!' as result,
    (SELECT COUNT(*) FROM test_bundles) as test_bundles_created,
    (SELECT COUNT(*) FROM biomarker_definitions) as biomarker_definitions_created,
    (SELECT COUNT(*) FROM test_requirements) as test_requirements_created,
    (SELECT COUNT(*) FROM test_result_templates) as result_templates_created,
    (SELECT COUNT(*) FROM condition_test_recommendations) as condition_recommendations_created,
    (SELECT COUNT(*) FROM seasonal_test_trends) as seasonal_trends_created;