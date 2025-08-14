-- ================================================================
-- PRISM HEALTH LAB - ADMIN TABLES DEPLOYMENT SCRIPT
-- ================================================================
-- Combined script to create admin tables and populate with seed data
-- Run this in Supabase SQL editor to set up admin functionality
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- ADMIN STAFF MANAGEMENT TABLES
-- ================================================================

-- Staff Departments
CREATE TABLE IF NOT EXISTS public.staff_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Roles with Hierarchical Structure
CREATE TABLE IF NOT EXISTS public.staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1, -- Higher number = higher privilege
    default_permissions JSONB DEFAULT '[]',
    is_admin_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Members (links to auth.users)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    role_id UUID REFERENCES public.staff_roles(id) NOT NULL,
    department_id UUID REFERENCES public.staff_departments(id) NOT NULL,
    
    -- Contact Information
    work_email TEXT UNIQUE NOT NULL,
    work_phone TEXT,
    manager_id UUID REFERENCES public.staff(id),
    
    -- Employment Details
    hire_date DATE NOT NULL,
    employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated')),
    
    -- Admin Permissions
    can_access_admin BOOLEAN DEFAULT false,
    can_view_phi BOOLEAN DEFAULT false, -- Protected Health Information
    permissions JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_department ON public.staff(role_id, department_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(is_active);

-- ================================================================
-- SEED DATA - STAFF ROLES AND DEPARTMENTS
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
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on staff tables
ALTER TABLE public.staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Staff departments policies - allow read access to all authenticated users, write access to admins
CREATE POLICY "Allow read access to staff departments" ON public.staff_departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin write access to staff departments" ON public.staff_departments
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.user_id = auth.uid()
            AND s.can_access_admin = true
            AND s.is_active = true
        )
    );

-- Staff roles policies - allow read access to all authenticated users, write access to admins
CREATE POLICY "Allow read access to staff roles" ON public.staff_roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin write access to staff roles" ON public.staff_roles
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.user_id = auth.uid()
            AND s.can_access_admin = true
            AND s.is_active = true
        )
    );

-- Staff policies - allow users to see their own record, admins can see all
CREATE POLICY "Users can view own staff record" ON public.staff
    FOR SELECT TO authenticated USING (
        user_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.user_id = auth.uid()
            AND s.can_access_admin = true
            AND s.is_active = true
        )
    );

CREATE POLICY "Admins can manage staff records" ON public.staff
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.user_id = auth.uid()
            AND s.can_access_admin = true
            AND s.is_active = true
        )
    );

-- ================================================================
-- DEPLOYMENT VERIFICATION
-- ================================================================

SELECT 
    'Admin tables deployment completed successfully!' as result,
    'Tables created: staff_departments, staff_roles, staff' as tables_created,
    (SELECT COUNT(*) FROM public.staff_roles) as roles_count,
    (SELECT COUNT(*) FROM public.staff_departments) as departments_count,
    NOW() as deployed_at;