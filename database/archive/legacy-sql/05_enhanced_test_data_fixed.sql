-- =====================================================
-- Enhanced Test Panels and Diagnostic Data (FIXED)
-- =====================================================
-- 
-- Comprehensive test panels, bundles, and clinical data
-- with PROPER UUID FORMAT for PostgreSQL
-- =====================================================

-- =====================================================
-- TEST BUNDLES AND PANELS (Fixed UUIDs)
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
-- BIOMARKER DEFINITIONS (Fixed UUIDs)
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
-- TEST RESULT TEMPLATES (Fixed UUIDs)
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
-- TEST REQUIREMENTS (Fixed UUIDs)
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
-- CONDITION TEST RECOMMENDATIONS (Fixed UUIDs)
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
-- SEASONAL TEST TRENDS (Fixed UUIDs)
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
-- INSERT SAMPLE DATA WITH PROPER UUIDs
-- =====================================================

-- Insert test bundles with PROPER UUIDs
INSERT INTO test_bundles (id, swell_product_id, name, description, bundle_type, included_test_ids, individual_price, bundle_price, recommended_for, clinical_rationale, target_demographics) VALUES

-- Comprehensive Health Packages
('880e8400-e29b-41d4-a716-446655440001', 'swell_bundle_complete_health', 'Complete Health Assessment', 
 'Our most comprehensive health panel covering all major body systems and health markers', 'comprehensive',
 '{"770e8400-e29b-41d4-a716-446655440001", "770e8400-e29b-41d4-a716-446655440003", "770e8400-e29b-41d4-a716-446655440005"}',
 827.00, 599.00,
 '{"annual_physical", "preventive_care", "health_optimization", "executive_physical"}',
 'Comprehensive assessment combining metabolic, cardiovascular, hormone, and immune system evaluation for complete health picture',
 '{"age_range": "25-65", "frequency": "annually", "ideal_for": "health_conscious_adults"}'::jsonb),

-- Age-Specific Bundles
('880e8400-e29b-41d4-a716-446655440002', 'swell_bundle_mens_40plus', 'Men''s Health 40+ Panel', 
 'Comprehensive health screening designed for men over 40, focusing on age-related health concerns', 'age_based',
 '{"770e8400-e29b-41d4-a716-446655440002", "770e8400-e29b-41d4-a716-446655440004"}',
 948.00, 699.00,
 '{"men_over_40", "cardiovascular_risk", "hormone_decline", "metabolic_syndrome"}',
 'Targets common health concerns in men over 40: heart disease, diabetes, testosterone decline, and comprehensive metabolic assessment',
 '{"gender": "male", "age_range": "40-70", "frequency": "annually"}'::jsonb),

-- Condition-Specific Bundles
('880e8400-e29b-41d4-a716-446655440003', 'swell_bundle_diabetes_monitoring', 'Diabetes Risk & Monitoring Panel', 
 'Complete diabetes screening and monitoring package for pre-diabetics and diabetics', 'condition_specific',
 '{"770e8400-e29b-41d4-a716-446655440001", "770e8400-e29b-41d4-a716-446655440003"}',
 567.00, 399.00,
 '{"diabetes_risk", "prediabetes", "metabolic_syndrome", "insulin_resistance"}',
 'Comprehensive diabetes screening including glucose metabolism, cardiovascular risk factors, and immune function',
 '{"conditions": ["prediabetes", "family_history_diabetes"], "frequency": "quarterly"}'::jsonb);

-- Insert biomarker definitions with PROPER UUIDs
INSERT INTO biomarker_definitions (id, biomarker_name, biomarker_code, common_names, abbreviation, category, subcategory, clinical_significance, what_it_measures, default_unit, default_reference_range, age_based_ranges, gender_based_ranges, low_significance, high_significance, critical_low_threshold, critical_high_threshold, factors_increasing, factors_decreasing, patient_friendly_name, patient_explanation, improvement_tips) VALUES

-- Cardiovascular Markers
('990e8400-e29b-41d4-a716-446655440001', 'Total Cholesterol', 'CHOL_TOTAL', '{"Cholesterol", "Total Chol"}', 'TC', 'cardiovascular', 'lipids',
 'Primary screening marker for cardiovascular disease risk assessment',
 'Total amount of cholesterol in blood, including both good (HDL) and bad (LDL) cholesterol',
 'mg/dL', '{"optimal": {"max": 200}, "borderline": {"min": 200, "max": 239}, "high": {"min": 240}}'::jsonb,
 '{"under_20": {"max": 170}, "20_39": {"max": 200}, "40_plus": {"max": 200}}'::jsonb,
 '{"male": {"max": 200}, "female": {"max": 200}}'::jsonb,
 'May indicate malnutrition, liver disease, or hyperthyroidism',
 'Increased risk of heart disease, stroke, and peripheral artery disease',
 100, 300,
 '{"saturated_fat", "trans_fat", "dietary_cholesterol", "obesity", "diabetes", "hypothyroidism"}',
 '{"exercise", "soluble_fiber", "plant_sterols", "weight_loss", "statins"}',
 'Total Cholesterol', 'The total amount of cholesterol (both good and bad types) circulating in your blood',
 '{"increase_fiber_intake", "reduce_saturated_fat", "exercise_regularly", "maintain_healthy_weight"}'),

-- Metabolic Markers
('990e8400-e29b-41d4-a716-446655440002', 'Fasting Glucose', 'GLUCOSE_FAST', '{"Blood Sugar", "Blood Glucose", "FBG"}', 'FG', 'metabolic', 'glucose',
 'Primary screening test for diabetes and glucose metabolism disorders',
 'Blood sugar level after fasting for at least 8 hours',
 'mg/dL', '{"normal": {"min": 70, "max": 99}, "prediabetes": {"min": 100, "max": 125}, "diabetes": {"min": 126}}'::jsonb,
 '{"all_ages": {"min": 70, "max": 99}}'::jsonb,
 '{"male": {"min": 70, "max": 99}, "female": {"min": 70, "max": 99}}'::jsonb,
 'May indicate hypoglycemia, liver disease, or insulin excess',
 'May indicate diabetes, prediabetes, or insulin resistance',
 50, 400,
 '{"diabetes", "stress", "infection", "medications", "poor_diet"}',
 '{"exercise", "weight_loss", "healthy_diet", "diabetes_medication"}',
 'Blood Sugar (Fasting)', 'Your blood sugar level after not eating for at least 8 hours',
 '{"eat_balanced_meals", "exercise_regularly", "maintain_healthy_weight", "limit_refined_carbs"}');

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
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'Enhanced test data loaded successfully with proper UUIDs!' as result,
    (SELECT COUNT(*) FROM test_bundles) as test_bundles_created,
    (SELECT COUNT(*) FROM biomarker_definitions) as biomarker_definitions_created,
    (SELECT COUNT(*) FROM test_requirements) as test_requirements_created,
    (SELECT COUNT(*) FROM test_result_templates) as result_templates_created,
    (SELECT COUNT(*) FROM condition_test_recommendations) as condition_recommendations_created,
    (SELECT COUNT(*) FROM seasonal_test_trends) as seasonal_trends_created;