-- Performance Alerts Table
-- Stores performance alerts and system warnings for monitoring dashboard

CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Alert identification
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  
  -- Alert details
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  alert_type VARCHAR(50) DEFAULT 'performance_degradation',
  
  -- Context information
  page_path VARCHAR(500),
  session_id VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timing
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'ignored')),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Additional context
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Indexes for performance
  INDEX idx_performance_alerts_severity (severity, recorded_at DESC),
  INDEX idx_performance_alerts_metric (metric_name, recorded_at DESC),
  INDEX idx_performance_alerts_page (page_path, recorded_at DESC),
  INDEX idx_performance_alerts_session (session_id),
  INDEX idx_performance_alerts_user (user_id, recorded_at DESC),
  INDEX idx_performance_alerts_status (status, recorded_at DESC),
  INDEX idx_performance_alerts_recorded_at (recorded_at DESC)
);

-- Alert aggregation view for dashboard
CREATE OR REPLACE VIEW performance_alerts_summary AS
SELECT 
  DATE_TRUNC('hour', recorded_at) as alert_hour,
  severity,
  metric_name,
  COUNT(*) as alert_count,
  AVG(metric_value) as avg_metric_value,
  MAX(metric_value) as max_metric_value,
  MIN(metric_value) as min_metric_value,
  COUNT(DISTINCT session_id) as affected_sessions,
  COUNT(DISTINCT page_path) as affected_pages
FROM performance_alerts
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', recorded_at), severity, metric_name
ORDER BY alert_hour DESC, severity DESC, alert_count DESC;

-- Current active alerts view
CREATE OR REPLACE VIEW active_performance_alerts AS
SELECT 
  pa.*,
  profiles.full_name as acknowledged_by_name
FROM performance_alerts pa
LEFT JOIN profiles ON pa.acknowledged_by = profiles.user_id
WHERE pa.status = 'active'
AND pa.recorded_at >= NOW() - INTERVAL '24 hours'
ORDER BY pa.severity DESC, pa.recorded_at DESC;

-- Row Level Security
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;

-- Admin and system users can see all alerts
CREATE POLICY performance_alerts_admin_access ON performance_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'system', 'healthcare_provider')
    )
  );

-- Users can only see their own alerts
CREATE POLICY performance_alerts_user_access ON performance_alerts
  FOR SELECT
  USING (user_id = auth.uid());

-- Function to automatically resolve old alerts
CREATE OR REPLACE FUNCTION auto_resolve_old_alerts()
RETURNS INTEGER AS $$
DECLARE
  resolved_count INTEGER := 0;
BEGIN
  -- Auto-resolve alerts older than 7 days that haven't been acknowledged
  UPDATE performance_alerts
  SET 
    status = 'resolved',
    resolved_at = NOW(),
    metadata = COALESCE(metadata, '{}'::JSONB) || '{"auto_resolved": true, "reason": "expired"}'::JSONB
  WHERE 
    status = 'active'
    AND recorded_at < NOW() - INTERVAL '7 days'
    AND acknowledged_at IS NULL;
  
  GET DIAGNOSTICS resolved_count = ROW_COUNT;
  
  -- Log the auto-resolution
  IF resolved_count > 0 THEN
    INSERT INTO audit_logs (
      event_type,
      actor_id,
      description,
      metadata
    ) VALUES (
      'system_maintenance',
      NULL,
      'Auto-resolved expired performance alerts',
      jsonb_build_object('resolved_count', resolved_count)
    );
  END IF;
  
  RETURN resolved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create performance alert
CREATE OR REPLACE FUNCTION create_performance_alert(
  p_metric_name VARCHAR,
  p_metric_value NUMERIC,
  p_threshold NUMERIC,
  p_severity VARCHAR DEFAULT 'medium',
  p_page_path VARCHAR DEFAULT NULL,
  p_session_id VARCHAR DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_alert_type VARCHAR DEFAULT 'performance_degradation',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
  duplicate_count INTEGER;
BEGIN
  -- Check for duplicate alerts in the last 5 minutes to prevent spam
  SELECT COUNT(*) INTO duplicate_count
  FROM performance_alerts
  WHERE 
    metric_name = p_metric_name
    AND page_path = p_page_path
    AND session_id = p_session_id
    AND recorded_at >= NOW() - INTERVAL '5 minutes'
    AND status = 'active';
  
  -- If duplicate exists, don't create new alert
  IF duplicate_count > 0 THEN
    RETURN NULL;
  END IF;
  
  -- Create the alert
  INSERT INTO performance_alerts (
    metric_name,
    metric_value,
    threshold,
    severity,
    alert_type,
    page_path,
    session_id,
    user_id,
    metadata
  ) VALUES (
    p_metric_name,
    p_metric_value,
    p_threshold,
    p_severity,
    p_alert_type,
    p_page_path,
    p_session_id,
    p_user_id,
    p_metadata
  )
  RETURNING id INTO alert_id;
  
  -- Log critical alerts
  IF p_severity = 'critical' THEN
    INSERT INTO audit_logs (
      event_type,
      actor_id,
      description,
      metadata
    ) VALUES (
      'critical_alert_created',
      p_user_id,
      'Critical performance alert: ' || p_metric_name,
      jsonb_build_object(
        'alert_id', alert_id,
        'metric_name', p_metric_name,
        'metric_value', p_metric_value,
        'threshold', p_threshold,
        'page_path', p_page_path
      )
    );
  END IF;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to acknowledge alert
CREATE OR REPLACE FUNCTION acknowledge_performance_alert(
  p_alert_id UUID,
  p_acknowledged_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  alert_exists BOOLEAN := FALSE;
BEGIN
  -- Check if alert exists and is active
  SELECT EXISTS(
    SELECT 1 FROM performance_alerts
    WHERE id = p_alert_id AND status = 'active'
  ) INTO alert_exists;
  
  IF NOT alert_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update the alert
  UPDATE performance_alerts
  SET 
    status = 'acknowledged',
    acknowledged_at = NOW(),
    acknowledged_by = p_acknowledged_by
  WHERE id = p_alert_id;
  
  -- Log the acknowledgment
  INSERT INTO audit_logs (
    event_type,
    actor_id,
    description,
    metadata
  ) VALUES (
    'alert_acknowledged',
    p_acknowledged_by,
    'Performance alert acknowledged',
    jsonb_build_object('alert_id', p_alert_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve alert
CREATE OR REPLACE FUNCTION resolve_performance_alert(
  p_alert_id UUID,
  p_resolved_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  alert_exists BOOLEAN := FALSE;
BEGIN
  -- Check if alert exists
  SELECT EXISTS(
    SELECT 1 FROM performance_alerts
    WHERE id = p_alert_id AND status IN ('active', 'acknowledged')
  ) INTO alert_exists;
  
  IF NOT alert_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update the alert
  UPDATE performance_alerts
  SET 
    status = 'resolved',
    resolved_at = NOW(),
    metadata = COALESCE(metadata, '{}'::JSONB) || jsonb_build_object('resolved_by', p_resolved_by)
  WHERE id = p_alert_id;
  
  -- Log the resolution
  INSERT INTO audit_logs (
    event_type,
    actor_id,
    description,
    metadata
  ) VALUES (
    'alert_resolved',
    p_resolved_by,
    'Performance alert resolved',
    jsonb_build_object('alert_id', p_alert_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-resolve old alerts daily
CREATE OR REPLACE FUNCTION trigger_auto_resolve_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run once per day
  IF EXTRACT(HOUR FROM NEW.recorded_at) = 2 THEN -- Run at 2 AM
    PERFORM auto_resolve_old_alerts();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only fires on first alert each hour to prevent excessive runs)
CREATE TRIGGER auto_resolve_alerts_trigger
  AFTER INSERT ON performance_alerts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_resolve_alerts();

-- Grant permissions
GRANT SELECT ON performance_alerts TO authenticated;
GRANT SELECT ON performance_alerts_summary TO authenticated;
GRANT SELECT ON active_performance_alerts TO authenticated;

GRANT ALL ON performance_alerts TO service_role;
GRANT EXECUTE ON FUNCTION create_performance_alert TO service_role;
GRANT EXECUTE ON FUNCTION acknowledge_performance_alert TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_performance_alert TO authenticated;
GRANT EXECUTE ON FUNCTION auto_resolve_old_alerts TO service_role;

-- Comments for documentation
COMMENT ON TABLE performance_alerts IS 'Stores performance alerts and system warnings for monitoring';
COMMENT ON VIEW performance_alerts_summary IS 'Aggregated view of alerts by hour for dashboard charts';
COMMENT ON VIEW active_performance_alerts IS 'Currently active alerts that need attention';
COMMENT ON FUNCTION create_performance_alert IS 'Creates a new performance alert with duplicate prevention';
COMMENT ON FUNCTION acknowledge_performance_alert IS 'Marks an alert as acknowledged by an admin';
COMMENT ON FUNCTION resolve_performance_alert IS 'Marks an alert as resolved';
COMMENT ON FUNCTION auto_resolve_old_alerts IS 'Automatically resolves alerts older than 7 days';

-- Create initial indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_alerts_composite_severity 
ON performance_alerts (severity, recorded_at DESC, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_alerts_composite_metric 
ON performance_alerts (metric_name, page_path, recorded_at DESC) 
WHERE status = 'active';