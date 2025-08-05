-- PWA Push Notifications Schema
-- Supports push notification subscriptions and delivery tracking

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Subscription data
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  subscription_data JSONB NOT NULL,
  
  -- Device and browser information
  user_agent TEXT,
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  browser_name VARCHAR(50),
  os_name VARCHAR(50),
  
  -- Status tracking
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason VARCHAR(100),
  
  -- Failure tracking
  failure_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,
  
  -- Indexes
  INDEX idx_push_subscriptions_user_id (user_id),
  INDEX idx_push_subscriptions_endpoint (endpoint),
  INDEX idx_push_subscriptions_active (is_active, user_id),
  INDEX idx_push_subscriptions_created_at (created_at)
);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Push notification settings
  push_notifications BOOLEAN DEFAULT FALSE,
  notification_types JSONB DEFAULT '{
    "order_updates": true,
    "appointment_reminders": true,
    "result_notifications": true,
    "system_alerts": true,
    "marketing": false,
    "health_tips": true
  }'::JSONB,
  
  -- Quiet hours configuration
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Frequency limits
  max_notifications_per_day INTEGER DEFAULT 20,
  max_notifications_per_hour INTEGER DEFAULT 5,
  
  -- PWA preferences
  pwa_install_prompted BOOLEAN DEFAULT FALSE,
  pwa_install_dismissed_at TIMESTAMPTZ,
  pwa_installed BOOLEAN DEFAULT FALSE,
  
  -- Other preferences
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  high_priority_only BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_user_preferences_user_id (user_id),
  INDEX idx_user_preferences_push_enabled (push_notifications, user_id)
);

-- Push Notifications Log
CREATE TABLE IF NOT EXISTS push_notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
  
  -- Notification details
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Status and metadata
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'expired')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  failure_reason TEXT,
  
  -- Response data
  push_response JSONB,
  user_action VARCHAR(50), -- 'clicked', 'dismissed', 'ignored'
  
  -- TTL and expiry
  expires_at TIMESTAMPTZ,
  
  -- Indexes
  INDEX idx_push_notifications_log_user_id (user_id),
  INDEX idx_push_notifications_log_subscription_id (subscription_id),
  INDEX idx_push_notifications_log_sent_at (sent_at DESC),
  INDEX idx_push_notifications_log_type (notification_type, sent_at DESC),
  INDEX idx_push_notifications_log_status (status, sent_at DESC)
);

-- Notification Rate Limiting
CREATE TABLE IF NOT EXISTS notification_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Rate limiting windows
  hourly_count INTEGER DEFAULT 0,
  daily_count INTEGER DEFAULT 0,
  weekly_count INTEGER DEFAULT 0,
  
  -- Window tracking
  hour_window_start TIMESTAMPTZ DEFAULT NOW(),
  day_window_start TIMESTAMPTZ DEFAULT NOW(),
  week_window_start TIMESTAMPTZ DEFAULT NOW(),
  
  -- Limits exceeded tracking
  hourly_limit_exceeded_at TIMESTAMPTZ,
  daily_limit_exceeded_at TIMESTAMPTZ,
  weekly_limit_exceeded_at TIMESTAMPTZ,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id),
  INDEX idx_notification_rate_limits_user_id (user_id),
  INDEX idx_notification_rate_limits_updated_at (updated_at)
);

-- PWA Installation Tracking
CREATE TABLE IF NOT EXISTS pwa_installations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Installation details
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  uninstalled_at TIMESTAMPTZ,
  install_source VARCHAR(50), -- 'banner', 'menu', 'shortcut', 'share'
  
  -- Device information
  user_agent TEXT,
  device_type VARCHAR(50),
  browser_name VARCHAR(50),
  os_name VARCHAR(50),
  screen_resolution VARCHAR(20),
  
  -- Usage tracking
  sessions_count INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  total_session_duration INTEGER DEFAULT 0, -- in seconds
  
  -- Engagement metrics
  features_used JSONB DEFAULT '[]'::JSONB,
  notifications_enabled BOOLEAN DEFAULT FALSE,
  offline_usage_count INTEGER DEFAULT 0,
  
  INDEX idx_pwa_installations_user_id (user_id),
  INDEX idx_pwa_installations_installed_at (installed_at DESC),
  INDEX idx_pwa_installations_device_type (device_type)
);

-- Offline Data Cache Metadata
CREATE TABLE IF NOT EXISTS offline_cache_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Cache information
  cache_key VARCHAR(255) NOT NULL,
  cache_type VARCHAR(50) NOT NULL, -- 'page', 'api', 'asset'
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Data size and metadata
  data_size INTEGER, -- in bytes
  content_type VARCHAR(100),
  etag VARCHAR(255),
  last_modified TIMESTAMPTZ,
  
  -- Usage tracking
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Status
  is_valid BOOLEAN DEFAULT TRUE,
  invalidated_at TIMESTAMPTZ,
  invalidation_reason VARCHAR(100),
  
  UNIQUE(user_id, cache_key),
  INDEX idx_offline_cache_metadata_user_id (user_id),
  INDEX idx_offline_cache_metadata_type (cache_type, user_id),
  INDEX idx_offline_cache_metadata_expires (expires_at),
  INDEX idx_offline_cache_metadata_accessed (last_accessed_at DESC)
);

-- Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Push Subscriptions
CREATE POLICY push_subscriptions_user_access ON push_subscriptions
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for User Preferences
CREATE POLICY user_preferences_user_access ON user_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for Push Notifications Log
CREATE POLICY push_notifications_log_user_access ON push_notifications_log
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'healthcare_provider')
    )
  );

-- Admin insert access for notifications log
CREATE POLICY push_notifications_log_admin_insert ON push_notifications_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'healthcare_provider', 'system')
    )
  );

-- RLS Policies for Rate Limits
CREATE POLICY notification_rate_limits_user_access ON notification_rate_limits
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for PWA Installations
CREATE POLICY pwa_installations_user_access ON pwa_installations
  FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin')
    )
  );

-- RLS Policies for Offline Cache Metadata
CREATE POLICY offline_cache_metadata_user_access ON offline_cache_metadata
  FOR ALL
  USING (user_id = auth.uid());

-- Triggers and Functions

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_rate_limits_updated_at
  BEFORE UPDATE ON notification_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check notification rate limits
CREATE OR REPLACE FUNCTION check_notification_rate_limit(
  target_user_id UUID,
  notification_priority VARCHAR DEFAULT 'medium'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_prefs RECORD;
  rate_limits RECORD;
  current_hour TIMESTAMPTZ;
  current_day TIMESTAMPTZ;
  current_week TIMESTAMPTZ;
BEGIN
  -- Get user preferences
  SELECT * INTO user_prefs
  FROM user_preferences
  WHERE user_id = target_user_id;
  
  -- If no preferences found, use defaults
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;
  
  -- Skip rate limiting for urgent notifications
  IF notification_priority = 'urgent' THEN
    RETURN TRUE;
  END IF;
  
  -- Get or create rate limit record
  current_hour := DATE_TRUNC('hour', NOW());
  current_day := DATE_TRUNC('day', NOW());
  current_week := DATE_TRUNC('week', NOW());
  
  SELECT * INTO rate_limits
  FROM notification_rate_limits
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO notification_rate_limits (
      user_id, 
      hour_window_start, 
      day_window_start, 
      week_window_start
    )
    VALUES (target_user_id, current_hour, current_day, current_week);
    RETURN TRUE;
  END IF;
  
  -- Reset counters if windows have moved
  IF rate_limits.hour_window_start < current_hour THEN
    UPDATE notification_rate_limits
    SET hourly_count = 0, hour_window_start = current_hour
    WHERE user_id = target_user_id;
    rate_limits.hourly_count := 0;
  END IF;
  
  IF rate_limits.day_window_start < current_day THEN
    UPDATE notification_rate_limits
    SET daily_count = 0, day_window_start = current_day
    WHERE user_id = target_user_id;
    rate_limits.daily_count := 0;
  END IF;
  
  IF rate_limits.week_window_start < current_week THEN
    UPDATE notification_rate_limits
    SET weekly_count = 0, week_window_start = current_week
    WHERE user_id = target_user_id;
    rate_limits.weekly_count := 0;
  END IF;
  
  -- Check limits
  IF rate_limits.hourly_count >= user_prefs.max_notifications_per_hour THEN
    RETURN FALSE;
  END IF;
  
  IF rate_limits.daily_count >= user_prefs.max_notifications_per_day THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counters
  UPDATE notification_rate_limits
  SET 
    hourly_count = hourly_count + 1,
    daily_count = daily_count + 1,
    weekly_count = weekly_count + 1,
    updated_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check quiet hours
CREATE OR REPLACE FUNCTION is_in_quiet_hours(
  target_user_id UUID,
  check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  user_prefs RECORD;
  user_time TIME;
BEGIN
  SELECT * INTO user_prefs
  FROM user_preferences
  WHERE user_id = target_user_id;
  
  -- If no preferences or quiet hours disabled, allow notification
  IF NOT FOUND OR NOT user_prefs.quiet_hours_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Convert check_time to user's timezone
  user_time := (check_time AT TIME ZONE COALESCE(user_prefs.quiet_hours_timezone, 'UTC'))::TIME;
  
  -- Check if current time is within quiet hours
  IF user_prefs.quiet_hours_start <= user_prefs.quiet_hours_end THEN
    -- Same day range (e.g., 22:00 - 08:00 next day)
    RETURN user_time >= user_prefs.quiet_hours_start OR user_time <= user_prefs.quiet_hours_end;
  ELSE
    -- Cross midnight range (e.g., 10:00 - 14:00 same day)
    RETURN user_time >= user_prefs.quiet_hours_start AND user_time <= user_prefs.quiet_hours_end;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for old notifications
CREATE OR REPLACE FUNCTION cleanup_old_push_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete notifications older than 90 days
  WITH deleted AS (
    DELETE FROM push_notifications_log
    WHERE sent_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  -- Delete expired cache metadata
  DELETE FROM offline_cache_metadata
  WHERE expires_at < NOW() AND expires_at IS NOT NULL;
  
  -- Update subscription failure counts
  UPDATE push_subscriptions
  SET is_active = FALSE
  WHERE failure_count >= 5 AND is_active = TRUE;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
GRANT SELECT ON push_notifications_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_rate_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pwa_installations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON offline_cache_metadata TO authenticated;

-- Grant admin permissions
GRANT ALL ON push_notifications_log TO service_role;
GRANT EXECUTE ON FUNCTION check_notification_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION is_in_quiet_hours TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_push_notifications TO service_role;

-- Comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Store web push notification subscriptions for PWA users';
COMMENT ON TABLE user_preferences IS 'User preferences for notifications, PWA settings, and privacy controls';
COMMENT ON TABLE push_notifications_log IS 'Complete audit trail of all push notifications sent to users';
COMMENT ON TABLE notification_rate_limits IS 'Rate limiting data to prevent notification spam';
COMMENT ON TABLE pwa_installations IS 'Track PWA installations and usage metrics';
COMMENT ON TABLE offline_cache_metadata IS 'Metadata for offline cache management and optimization';

COMMENT ON FUNCTION check_notification_rate_limit IS 'Check if user has exceeded notification rate limits';
COMMENT ON FUNCTION is_in_quiet_hours IS 'Check if current time is within user quiet hours';
COMMENT ON FUNCTION cleanup_old_push_notifications IS 'Clean up old notification logs and expired cache data';

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, push_notifications)
SELECT id, FALSE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;