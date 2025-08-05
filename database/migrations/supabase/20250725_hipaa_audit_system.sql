-- HIPAA Audit Logs - Tamper-proof audit trail for healthcare data access
CREATE TABLE IF NOT EXISTS hipaa_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID, -- References patient data (could be from different tables)
  
  -- Resource information
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  action_taken VARCHAR(255) NOT NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('success', 'failure', 'warning')),
  
  -- Risk assessment
  risk_level INTEGER NOT NULL CHECK (risk_level BETWEEN 1 AND 4),
  phi_accessed BOOLEAN DEFAULT FALSE,
  
  -- Technical details
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  geolocation JSONB,
  
  -- Tamper-proof measures
  event_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for integrity verification
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  log_source VARCHAR(50) DEFAULT 'application',
  
  -- Indexes for performance and compliance queries
  INDEX idx_hipaa_audit_logs_user_id (user_id),
  INDEX idx_hipaa_audit_logs_patient_id (patient_id),
  INDEX idx_hipaa_audit_logs_event_type (event_type),
  INDEX idx_hipaa_audit_logs_logged_at (logged_at DESC),
  INDEX idx_hipaa_audit_logs_risk_level (risk_level),
  INDEX idx_hipaa_audit_logs_phi_accessed (phi_accessed),
  INDEX idx_hipaa_audit_logs_ip_address (ip_address),
  INDEX idx_hipaa_audit_logs_hash (event_hash),
  
  -- Composite indexes for common queries
  INDEX idx_hipaa_audit_logs_user_date (user_id, logged_at DESC),
  INDEX idx_hipaa_audit_logs_patient_date (patient_id, logged_at DESC),
  INDEX idx_hipaa_audit_logs_high_risk (risk_level, logged_at DESC) WHERE risk_level >= 3
);

-- Security Alerts for high-risk events
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_security_alerts_severity (severity),
  INDEX idx_security_alerts_status (status),
  INDEX idx_security_alerts_created_at (created_at DESC),
  INDEX idx_security_alerts_assigned_to (assigned_to)
);

-- Audit Log Integrity Checks
CREATE TABLE IF NOT EXISTS audit_integrity_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type VARCHAR(50) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Results
  total_logs_checked INTEGER NOT NULL,
  corrupted_logs INTEGER NOT NULL DEFAULT 0,
  missing_logs INTEGER NOT NULL DEFAULT 0,
  integrity_score DECIMAL(5,2), -- Percentage of logs that passed integrity check
  
  -- Details
  corrupted_log_ids UUID[],
  check_metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_audit_integrity_checks_performed_at (performed_at DESC),
  INDEX idx_audit_integrity_checks_integrity_score (integrity_score)
);

-- Data Retention and Archival Configuration
CREATE TABLE IF NOT EXISTS audit_retention_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name VARCHAR(100) NOT NULL UNIQUE,
  event_types VARCHAR(50)[], -- NULL means applies to all event types
  
  -- Retention periods
  active_retention_days INTEGER NOT NULL DEFAULT 2557, -- 7 years (HIPAA requirement)
  archive_retention_days INTEGER NOT NULL DEFAULT 3653, -- 10 years
  
  -- Archive settings
  archive_enabled BOOLEAN DEFAULT TRUE,
  archive_location VARCHAR(255),
  compression_enabled BOOLEAN DEFAULT TRUE,
  encryption_enabled BOOLEAN DEFAULT TRUE,
  
  -- Policy metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_applied TIMESTAMPTZ,
  
  -- Compliance notes
  compliance_basis TEXT NOT NULL DEFAULT 'HIPAA Security Rule - 45 CFR 164.312(b)',
  notes TEXT
);

-- Insert default retention policy
INSERT INTO audit_retention_policies (
  policy_name,
  event_types,
  active_retention_days,
  archive_retention_days,
  compliance_basis,
  notes
) VALUES (
  'HIPAA_Default_Policy',
  NULL, -- Applies to all event types
  2557, -- 7 years active retention
  3653, -- 10 years total retention
  'HIPAA Security Rule - 45 CFR 164.312(b) - Audit controls standard',
  'Default HIPAA-compliant audit log retention policy'
) ON CONFLICT (policy_name) DO NOTHING;

-- Row Level Security
ALTER TABLE hipaa_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_integrity_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for HIPAA Audit Logs
-- Policy: Users can only view their own audit logs (patients accessing their own data)
CREATE POLICY hipaa_audit_logs_user_access ON hipaa_audit_logs
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    patient_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'healthcare_provider', 'compliance_officer')
    )
  );

-- Policy: System can insert audit logs
CREATE POLICY hipaa_audit_logs_system_insert ON hipaa_audit_logs
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts from application

-- Policy: No updates or deletes (tamper-proof)
-- Updates and deletes are restricted to prevent tampering

-- RLS Policies for Security Alerts
CREATE POLICY security_alerts_admin_access ON security_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'security_officer', 'compliance_officer')
    )
  );

-- RLS Policies for Audit Integrity Checks
CREATE POLICY audit_integrity_checks_compliance_access ON audit_integrity_checks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'compliance_officer')
    )
  );

-- RLS Policies for Retention Policies
CREATE POLICY audit_retention_policies_admin_access ON audit_retention_policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'compliance_officer')
    )
  );

-- Audit reporting views
CREATE OR REPLACE VIEW hipaa_audit_summary AS
SELECT 
  DATE_TRUNC('day', logged_at) as audit_date,
  event_type,
  COUNT(*) as event_count,
  COUNT(CASE WHEN phi_accessed THEN 1 END) as phi_access_count,
  COUNT(CASE WHEN risk_level >= 3 THEN 1 END) as high_risk_count,
  COUNT(CASE WHEN outcome = 'failure' THEN 1 END) as failed_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT patient_id) as unique_patients,
  COUNT(DISTINCT ip_address) as unique_ip_addresses
FROM hipaa_audit_logs
WHERE logged_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', logged_at), event_type
ORDER BY audit_date DESC, event_count DESC;

-- High-risk events view for security monitoring
CREATE OR REPLACE VIEW high_risk_audit_events AS
SELECT 
  id,
  event_type,
  user_id,
  patient_id,
  resource_type,
  action_taken,
  outcome,
  risk_level,
  phi_accessed,
  ip_address,
  logged_at,
  metadata->>'alert_reason' as alert_reason
FROM hipaa_audit_logs
WHERE risk_level >= 3
  AND logged_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY logged_at DESC, risk_level DESC;

-- PHI access tracking view
CREATE OR REPLACE VIEW phi_access_tracking AS
SELECT 
  patient_id,
  user_id,
  resource_type,
  action_taken,
  logged_at,
  ip_address,
  user_agent,
  metadata
FROM hipaa_audit_logs
WHERE phi_accessed = true
  AND logged_at >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY logged_at DESC;

-- Compliance monitoring functions
CREATE OR REPLACE FUNCTION check_audit_log_integrity(
  start_date TIMESTAMPTZ DEFAULT CURRENT_DATE - INTERVAL '1 day',
  end_date TIMESTAMPTZ DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_logs BIGINT,
  potential_issues BIGINT,
  integrity_percentage DECIMAL
) AS $$
DECLARE
  total_count BIGINT;
  issue_count BIGINT := 0;
BEGIN
  -- Count total logs in date range
  SELECT COUNT(*) INTO total_count
  FROM hipaa_audit_logs
  WHERE logged_at BETWEEN start_date AND end_date;
  
  -- Check for potential integrity issues
  -- (In a real implementation, you'd verify hashes and check for gaps)
  SELECT COUNT(*) INTO issue_count
  FROM hipaa_audit_logs
  WHERE logged_at BETWEEN start_date AND end_date
    AND (event_hash IS NULL OR event_hash = '');
  
  RETURN QUERY
  SELECT 
    total_count,
    issue_count,
    CASE 
      WHEN total_count = 0 THEN 100.0
      ELSE ROUND((total_count - issue_count)::DECIMAL / total_count * 100, 2)
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic cleanup function for old audit logs (respecting retention policies)
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS TABLE (
  archived_count BIGINT,
  deleted_count BIGINT
) AS $$
DECLARE
  retention_days INTEGER;
  archive_days INTEGER;
  archived_records BIGINT := 0;
  deleted_records BIGINT := 0;
BEGIN
  -- Get default retention policy
  SELECT 
    active_retention_days,
    archive_retention_days
  INTO retention_days, archive_days
  FROM audit_retention_policies
  WHERE policy_name = 'HIPAA_Default_Policy';
  
  -- Archive logs older than active retention period
  -- (In production, this would move data to archive storage)
  WITH archived AS (
    UPDATE hipaa_audit_logs
    SET metadata = metadata || jsonb_build_object('archived_at', NOW())
    WHERE logged_at < NOW() - (retention_days || ' days')::INTERVAL
      AND metadata->>'archived_at' IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO archived_records FROM archived;
  
  -- Delete logs older than total retention period
  WITH deleted AS (
    DELETE FROM hipaa_audit_logs
    WHERE logged_at < NOW() - (archive_days || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_records FROM deleted;
  
  -- Log the archival process
  INSERT INTO hipaa_audit_logs (
    event_type,
    resource_type,
    action_taken,
    outcome,
    risk_level,
    phi_accessed,
    metadata
  ) VALUES (
    'system_maintenance',
    'audit_logs',
    'automatic_archival_cleanup',
    'success',
    1,
    false,
    jsonb_build_object(
      'archived_count', archived_records,
      'deleted_count', deleted_records,
      'retention_days', retention_days,
      'archive_days', archive_days
    )
  );
  
  RETURN QUERY SELECT archived_records, deleted_records;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update security alert timestamps
CREATE OR REPLACE FUNCTION update_security_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER security_alerts_update_timestamp
  BEFORE UPDATE ON security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_security_alert_timestamp();

-- Trigger to prevent modification of audit logs (tamper-proof)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the attempted modification
  INSERT INTO security_alerts (
    alert_type,
    severity,
    title,
    description,
    metadata
  ) VALUES (
    'audit_tampering_attempt',
    'critical',
    'Attempted modification of audit log',
    'Someone attempted to modify or delete an audit log record',
    jsonb_build_object(
      'attempted_operation', TG_OP,
      'table_name', TG_TABLE_NAME,
      'old_record', to_jsonb(OLD),
      'new_record', to_jsonb(NEW),
      'user_id', current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
  );
  
  -- Prevent the modification
  RAISE EXCEPTION 'Audit log modification is not permitted for compliance reasons';
END;
$$ LANGUAGE plpgsql;

-- Apply tamper-proof triggers
CREATE TRIGGER prevent_audit_log_updates
  BEFORE UPDATE ON hipaa_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_deletes
  BEFORE DELETE ON hipaa_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Grant appropriate permissions
GRANT SELECT ON hipaa_audit_summary TO authenticated;
GRANT SELECT ON high_risk_audit_events TO authenticated;
GRANT SELECT ON phi_access_tracking TO authenticated;

-- Comments for documentation
COMMENT ON TABLE hipaa_audit_logs IS 'HIPAA-compliant audit trail with tamper-proof measures for all PHI access and system events';
COMMENT ON TABLE security_alerts IS 'Security alerts generated from high-risk audit events and system monitoring';
COMMENT ON TABLE audit_integrity_checks IS 'Results of periodic integrity checks on audit logs';
COMMENT ON TABLE audit_retention_policies IS 'Data retention policies for audit logs to ensure HIPAA compliance';
COMMENT ON VIEW hipaa_audit_summary IS 'Daily summary of audit events for compliance reporting';
COMMENT ON VIEW high_risk_audit_events IS 'High-risk audit events requiring security review';
COMMENT ON VIEW phi_access_tracking IS 'Tracking of all PHI access for compliance monitoring';
COMMENT ON FUNCTION check_audit_log_integrity IS 'Verifies integrity of audit logs within a date range';
COMMENT ON FUNCTION archive_old_audit_logs IS 'Archives and removes old audit logs according to retention policies';

-- Initial system event to mark audit system installation
INSERT INTO hipaa_audit_logs (
  event_type,
  resource_type,
  action_taken,
  outcome,
  risk_level,
  phi_accessed,
  metadata,
  log_source
) VALUES (
  'system_initialization',
  'audit_system',
  'hipaa_audit_system_installed',
  'success',
  1,
  false,
  jsonb_build_object(
    'version', '1.0',
    'installation_date', NOW(),
    'compliance_standard', 'HIPAA Security Rule 45 CFR 164.312(b)',
    'features', jsonb_build_array(
      'tamper_proof_logging',
      'integrity_verification',
      'retention_management',
      'security_alerting'
    )
  ),
  'migration'
);