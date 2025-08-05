-- =============================================================================
-- PRISM HEALTH LAB - DATABASE SYNCHRONIZATION MIGRATION
-- =============================================================================
-- Migration: 20250730_database_sync_migration.sql
-- Purpose: Sync existing database with intended migration state
-- SAFE: Only adds new columns/tables, doesn't modify existing data
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PHASE 1: ENHANCE PROFILES TABLE WITH 2FA FEATURES
-- =============================================================================

-- Add missing 2FA and Swell integration columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS swell_customer_id VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS totp_secret VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS backup_codes TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_2fa_verification TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_2fa_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Add performance indexes for new 2FA columns
CREATE INDEX IF NOT EXISTS idx_profiles_swell_customer_id ON profiles(swell_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON profiles(two_factor_enabled);

-- =============================================================================
-- PHASE 2: CREATE MISSING SECURITY TABLES
-- =============================================================================

-- Payment methods table (PCI-compliant tokenized storage)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  provider VARCHAR NOT NULL, -- 'stripe', 'square', etc.
  token VARCHAR NOT NULL, -- Tokenized payment method
  last_four VARCHAR(4),
  brand VARCHAR(20), -- 'visa', 'mastercard', etc.
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Security audit logs (enhanced audit logging)
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  action VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  ip_address INET,
  user_agent TEXT,
  risk_score INTEGER DEFAULT 0,
  session_id VARCHAR,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Two-factor authentication attempts tracking
CREATE TABLE IF NOT EXISTS two_factor_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  attempt_type VARCHAR NOT NULL, -- 'totp', 'sms', 'email'
  code_hash VARCHAR, -- Hashed version of the code for verification
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User consent management for HIPAA compliance
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  consent_type VARCHAR NOT NULL, -- 'data_processing', 'marketing', 'research', etc.
  granted BOOLEAN NOT NULL,
  consent_text TEXT,
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR NOT NULL, -- 'test_results', 'appointments', 'audit_logs', etc.
  retention_period_months INTEGER NOT NULL,
  auto_archive BOOLEAN DEFAULT true,
  auto_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- PHASE 3: ENHANCE EXISTING TABLES WITH MISSING COLUMNS
-- =============================================================================

-- Enhanced orders table with Swell integration and payment tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS swell_order_data JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS purchase_metadata JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR DEFAULT 'none';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR DEFAULT 'pending';

-- Enhanced appointments table with purchase linking
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS purchase_order_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS swell_order_id VARCHAR;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS no_show BOOLEAN DEFAULT false;

-- Add foreign key constraints for new columns (handle duplicates gracefully)
DO $$
BEGIN
  -- Add payment method reference to orders
  BEGIN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_id_fkey 
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);
  EXCEPTION
    WHEN duplicate_object THEN NULL; -- Constraint already exists, ignore
  END;

  -- Add purchase order reference to appointments  
  BEGIN
    ALTER TABLE appointments ADD CONSTRAINT appointments_purchase_order_id_fkey 
    FOREIGN KEY (purchase_order_id) REFERENCES orders(id);
  EXCEPTION
    WHEN duplicate_object THEN NULL; -- Constraint already exists, ignore
  END;
END $$;

-- =============================================================================
-- PHASE 4: CREATE PERFORMANCE INDEXES
-- =============================================================================

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- Security audit logs indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);

-- Two-factor attempts indexes
CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_user_id ON two_factor_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_expires_at ON two_factor_attempts(expires_at);

-- User consents indexes
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);

-- Enhanced orders/appointments indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_method_id ON orders(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_appointments_purchase_order_id ON appointments(purchase_order_id);

-- =============================================================================
-- PHASE 5: ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Payment methods - users can only access their own
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_methods_user_policy ON payment_methods;
CREATE POLICY payment_methods_user_policy ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Security audit logs - users can only view their own
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS security_audit_logs_user_policy ON security_audit_logs;
CREATE POLICY security_audit_logs_user_policy ON security_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Two-factor attempts - users can only access their own
ALTER TABLE two_factor_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS two_factor_attempts_user_policy ON two_factor_attempts;
CREATE POLICY two_factor_attempts_user_policy ON two_factor_attempts
  FOR ALL USING (auth.uid() = user_id);

-- User consents - users can only access their own
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_consents_user_policy ON user_consents;
CREATE POLICY user_consents_user_policy ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- PHASE 6: UTILITY FUNCTIONS
-- =============================================================================

-- Function to clean up expired 2FA attempts
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_attempts 
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to log patient data access
CREATE OR REPLACE FUNCTION log_patient_data_access(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_audit_logs (
    user_id,
    action,
    resource,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_resource,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    p_metadata
  );
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate cache
CREATE OR REPLACE FUNCTION invalidate_cache(
  p_cache_key VARCHAR,
  p_cache_type VARCHAR,
  p_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO cache_invalidation_queue (
    cache_key,
    cache_type,
    user_id,
    invalidated_at
  ) VALUES (
    p_cache_key,
    p_cache_type,
    p_user_id,
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PHASE 7: TRIGGERS FOR AUTOMATED LOGGING
-- =============================================================================

-- Trigger to log profile updates
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_patient_data_access(
    NEW.user_id,
    'update_profile',
    'profiles',
    NEW.user_id,
    jsonb_build_object(
      'changed_fields', 
      (SELECT jsonb_object_agg(key, value) 
       FROM jsonb_each(to_jsonb(NEW)) 
       WHERE key NOT IN ('updated_at', 'totp_secret', 'backup_codes'))
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if it exists)
DROP TRIGGER IF EXISTS profile_changes_audit_trigger ON profiles;
CREATE TRIGGER profile_changes_audit_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- =============================================================================
-- PHASE 8: INSERT DEFAULT DATA RETENTION POLICIES
-- =============================================================================

-- Insert default data retention policies (only if not exists)
INSERT INTO data_retention_policies (resource_type, retention_period_months, auto_archive, auto_delete)
SELECT * FROM (VALUES 
  ('test_results', 84, true, false), -- 7 years, archive but don't delete
  ('appointments', 84, true, false), -- 7 years
  ('orders', 84, true, false), -- 7 years  
  ('audit_logs', 84, false, false), -- 7 years, never delete audit logs
  ('payment_methods', 36, false, true), -- 3 years, can delete if user removes
  ('two_factor_attempts', 1, false, true), -- 1 month, auto-delete
  ('cache_invalidation_queue', 1, false, true) -- 1 month
) AS t(resource_type, retention_period_months, auto_archive, auto_delete)
WHERE NOT EXISTS (
  SELECT 1 FROM data_retention_policies dp 
  WHERE dp.resource_type = t.resource_type
);

-- =============================================================================
-- PHASE 9: GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- PHASE 10: ADD HELPFUL COMMENTS
-- =============================================================================

COMMENT ON TABLE payment_methods IS 'PCI-compliant tokenized payment method storage';
COMMENT ON TABLE security_audit_logs IS 'Security-focused audit logging for compliance';
COMMENT ON TABLE two_factor_attempts IS 'Tracking 2FA verification attempts';
COMMENT ON TABLE data_retention_policies IS 'Automated data lifecycle management';
COMMENT ON TABLE user_consents IS 'Patient consent management for HIPAA compliance';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify the migration completed successfully
SELECT 'Database synchronization migration completed!' as status;

-- Check if all new tables exist
SELECT 
  'New tables created:' as info,
  string_agg(tablename, ', ') as tables
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('payment_methods', 'security_audit_logs', 'two_factor_attempts', 'user_consents', 'data_retention_policies');

-- Check if new columns were added to profiles
SELECT 
  'New profiles columns:' as info,
  string_agg(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('swell_customer_id', 'two_factor_enabled', 'totp_secret', 'backup_codes');

-- Check data retention policies
SELECT 
  'Default retention policies:' as info,
  COUNT(*) as policy_count
FROM data_retention_policies;