-- Cache Operation Logs for monitoring cache performance
CREATE TABLE IF NOT EXISTS cache_operation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation VARCHAR(20) NOT NULL,
  cache_key VARCHAR(500) NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance monitoring queries
  INDEX idx_cache_operation_logs_timestamp (timestamp DESC),
  INDEX idx_cache_operation_logs_operation (operation),
  INDEX idx_cache_operation_logs_cache_key (cache_key)
);

-- Cache Error Logs for debugging cache issues
CREATE TABLE IF NOT EXISTS cache_error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation VARCHAR(20) NOT NULL,
  cache_key VARCHAR(500) NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for error analysis
  INDEX idx_cache_error_logs_timestamp (timestamp DESC),
  INDEX idx_cache_error_logs_operation (operation)
);

-- Admin Audit Logs for tracking cache management actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for audit queries
  INDEX idx_admin_audit_logs_user_id (user_id),
  INDEX idx_admin_audit_logs_action (action),
  INDEX idx_admin_audit_logs_created_at (created_at DESC)
);

-- Row Level Security for admin audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin audit logs
CREATE POLICY admin_audit_logs_admin_access ON admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: System can insert admin audit logs
CREATE POLICY admin_audit_logs_system_insert ON admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Cache Performance Views for easy monitoring
CREATE OR REPLACE VIEW cache_performance_summary AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  operation,
  COUNT(*) as operation_count,
  COUNT(CASE WHEN metadata->>'hit' = 'true' THEN 1 END) as cache_hits,
  COUNT(CASE WHEN metadata->>'hit' = 'false' THEN 1 END) as cache_misses,
  ROUND(
    COUNT(CASE WHEN metadata->>'hit' = 'true' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(CASE WHEN operation = 'GET' THEN 1 END), 0) * 100, 
    2
  ) as hit_rate_percentage
FROM cache_operation_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), operation
ORDER BY hour DESC, operation;

-- Cache Error Summary View
CREATE OR REPLACE VIEW cache_error_summary AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  operation,
  COUNT(*) as error_count,
  ARRAY_AGG(DISTINCT SUBSTRING(error_message, 1, 100)) as common_errors
FROM cache_error_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), operation
ORDER BY hour DESC, error_count DESC;

-- Most Accessed Cache Keys View
CREATE OR REPLACE VIEW most_accessed_cache_keys AS
SELECT 
  SPLIT_PART(cache_key, ':', 1) || ':' || SPLIT_PART(cache_key, ':', 2) as cache_pattern,
  COUNT(*) as access_count,
  COUNT(CASE WHEN metadata->>'hit' = 'true' THEN 1 END) as hits,
  COUNT(CASE WHEN metadata->>'hit' = 'false' THEN 1 END) as misses,
  MAX(timestamp) as last_accessed
FROM cache_operation_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
  AND operation = 'GET'
GROUP BY cache_pattern
ORDER BY access_count DESC
LIMIT 20;

-- Automatic cleanup function for old logs
CREATE OR REPLACE FUNCTION cleanup_cache_logs()
RETURNS void AS $$
BEGIN
  -- Keep only last 7 days of operation logs
  DELETE FROM cache_operation_logs 
  WHERE timestamp < NOW() - INTERVAL '7 days';
  
  -- Keep only last 30 days of error logs
  DELETE FROM cache_error_logs 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Keep only last 90 days of admin audit logs
  DELETE FROM admin_audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup completion
  INSERT INTO cache_operation_logs (operation, cache_key, metadata)
  VALUES ('CLEANUP', 'system:cleanup', jsonb_build_object(
    'cleanup_completed_at', NOW(),
    'operation_logs_cleaned', true,
    'error_logs_cleaned', true,
    'admin_logs_cleaned', true
  ));
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic cleanup (requires pg_cron extension)
-- This would typically be set up by a database administrator
-- SELECT cron.schedule('cache-cleanup', '0 2 * * *', 'SELECT cleanup_cache_logs();');

-- Grant necessary permissions
GRANT SELECT ON cache_performance_summary TO authenticated;
GRANT SELECT ON cache_error_summary TO authenticated;
GRANT SELECT ON most_accessed_cache_keys TO authenticated;

-- Insert initial monitoring data
INSERT INTO cache_operation_logs (operation, cache_key, metadata)
VALUES ('INIT', 'system:initialization', jsonb_build_object(
  'cache_system_initialized', true,
  'migration_version', '20250725_cache_monitoring_tables',
  'initialized_at', NOW()
));

-- Create notification function for critical cache errors
CREATE OR REPLACE FUNCTION notify_cache_critical_error()
RETURNS trigger AS $$
BEGIN
  -- If we have too many errors in a short time, this could indicate a problem
  IF (
    SELECT COUNT(*) 
    FROM cache_error_logs 
    WHERE timestamp >= NOW() - INTERVAL '5 minutes'
  ) > 10 THEN
    -- In a real implementation, this would trigger an alert
    INSERT INTO cache_operation_logs (operation, cache_key, metadata)
    VALUES ('ALERT', 'system:critical_error_threshold', jsonb_build_object(
      'alert_type', 'high_error_rate',
      'error_count_5min', (
        SELECT COUNT(*) 
        FROM cache_error_logs 
        WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      ),
      'triggered_at', NOW()
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for critical error monitoring
CREATE TRIGGER cache_error_monitoring_trigger
  AFTER INSERT ON cache_error_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_cache_critical_error();

COMMENT ON TABLE cache_operation_logs IS 'Logs all cache operations for performance monitoring and analytics';
COMMENT ON TABLE cache_error_logs IS 'Logs cache errors for debugging and system health monitoring';
COMMENT ON TABLE admin_audit_logs IS 'Tracks administrative actions performed on the cache system';
COMMENT ON VIEW cache_performance_summary IS 'Hourly summary of cache performance metrics';
COMMENT ON VIEW cache_error_summary IS 'Hourly summary of cache errors for monitoring';
COMMENT ON VIEW most_accessed_cache_keys IS 'Most frequently accessed cache key patterns';
COMMENT ON FUNCTION cleanup_cache_logs IS 'Automatically removes old cache logs to prevent storage bloat';
COMMENT ON FUNCTION notify_cache_critical_error IS 'Monitors for high error rates and triggers alerts';