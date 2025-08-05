-- Enhanced Patient Portal Schema with 2FA and Security Features
-- Migration: 20250725_enhanced_patient_portal_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enhanced profiles table for 2FA and Swell integration
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS swell_customer_id VARCHAR,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS totp_secret VARCHAR,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_2fa_verification TIMESTAMP,
ADD COLUMN IF NOT EXISTS failed_2fa_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

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

-- Enhanced orders table with Swell integration
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS swell_order_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS purchase_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id),
ADD COLUMN IF NOT EXISTS refund_status VARCHAR DEFAULT 'none',
ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR DEFAULT 'pending';

-- Real-time cache management
CREATE TABLE IF NOT EXISTS cache_invalidation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR NOT NULL,
  cache_type VARCHAR NOT NULL, -- 'purchase_history', 'analytics', etc.
  user_id UUID REFERENCES profiles(user_id),
  invalidated_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  retry_count INTEGER DEFAULT 0
);

-- Enhanced audit logging for HIPAA compliance
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

-- Patient audit logs (specialized for healthcare data access)
CREATE TABLE IF NOT EXISTS patient_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  action VARCHAR NOT NULL, -- 'view_results', 'download_report', 'update_profile', etc.
  resource VARCHAR NOT NULL, -- 'test_results', 'appointment', 'payment_method', etc.
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
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

-- Enhanced appointments table with purchase linking
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS purchase_order_id UUID REFERENCES orders(id),
ADD COLUMN IF NOT EXISTS swell_order_id VARCHAR,
ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_show BOOLEAN DEFAULT false;

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_swell_customer_id ON profiles(swell_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON profiles(two_factor_enabled);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_user_id ON patient_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_logs_resource ON patient_audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_user_id ON two_factor_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_expires_at ON two_factor_attempts(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_processed ON cache_invalidation_queue(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_purchase_order_id ON appointments(purchase_order_id);

-- Row Level Security (RLS) Policies

-- Payment methods - users can only access their own
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_methods_user_policy ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Security audit logs - users can only view their own, admins can view all
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY security_audit_logs_user_policy ON security_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Patient audit logs - users can only view their own
ALTER TABLE patient_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY patient_audit_logs_user_policy ON patient_audit_logs
  FOR ALL USING (auth.uid() = user_id);

-- Two-factor attempts - users can only access their own
ALTER TABLE two_factor_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY two_factor_attempts_user_policy ON two_factor_attempts
  FOR ALL USING (auth.uid() = user_id);

-- User consents - users can only access their own
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_consents_user_policy ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- Functions for automated cleanup and maintenance

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
  INSERT INTO patient_audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_resource,
    p_resource_id,
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

-- Triggers for automated logging

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

CREATE TRIGGER profile_changes_audit_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- Insert default data retention policies
INSERT INTO data_retention_policies (resource_type, retention_period_months, auto_archive, auto_delete)
VALUES 
  ('test_results', 84, true, false), -- 7 years, archive but don't delete
  ('appointments', 84, true, false), -- 7 years
  ('orders', 84, true, false), -- 7 years  
  ('audit_logs', 84, false, false), -- 7 years, never delete audit logs
  ('payment_methods', 36, false, true), -- 3 years, can delete if user removes
  ('two_factor_attempts', 1, false, true), -- 1 month, auto-delete
  ('cache_invalidation_queue', 1, false, true); -- 1 month

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE payment_methods IS 'PCI-compliant tokenized payment method storage';
COMMENT ON TABLE security_audit_logs IS 'Security-focused audit logging for compliance';
COMMENT ON TABLE patient_audit_logs IS 'HIPAA-compliant patient data access logging';
COMMENT ON TABLE two_factor_attempts IS 'Tracking 2FA verification attempts';
COMMENT ON TABLE data_retention_policies IS 'Automated data lifecycle management';
COMMENT ON TABLE user_consents IS 'Patient consent management for HIPAA compliance';
COMMENT ON TABLE cache_invalidation_queue IS 'Real-time cache invalidation management';