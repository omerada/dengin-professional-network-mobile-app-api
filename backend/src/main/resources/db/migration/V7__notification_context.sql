-- =====================================================
-- V7: Notification Context Database Schema
-- Sprint 9-10: Comprehensive Notification System
-- =====================================================

-- Note: update_updated_at_column() function is created in V4__create_social_tables.sql

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_uuid UUID NOT NULL UNIQUE,
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    read_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- Indexes for notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_recipient_status ON notifications(recipient_id, status);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id) WHERE status != 'READ';
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for all notification types';
COMMENT ON COLUMN notifications.type IS 'Notification type: NEW_FOLLOWER, POST_LIKED, NEW_MESSAGE, etc.';
COMMENT ON COLUMN notifications.status IS 'PENDING, DELIVERED, READ, FAILED';
COMMENT ON COLUMN notifications.metadata IS 'Additional data like postId, likerId, etc.';

-- =====================================================
-- 2. NOTIFICATION DELIVERIES TABLE
-- =====================================================

CREATE TABLE notification_deliveries (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    delivered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    error_message TEXT,
    UNIQUE(notification_id, channel)
);

-- Index for deliveries
CREATE INDEX idx_notification_deliveries_notification ON notification_deliveries(notification_id);

-- Comments
COMMENT ON TABLE notification_deliveries IS 'Tracks delivery status per channel (IN_APP, EMAIL, PUSH)';
COMMENT ON COLUMN notification_deliveries.channel IS 'Delivery channel: IN_APP, EMAIL, PUSH';

-- =====================================================
-- 3. NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Push notification settings
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    push_new_follower BOOLEAN NOT NULL DEFAULT true,
    push_post_liked BOOLEAN NOT NULL DEFAULT true,
    push_post_commented BOOLEAN NOT NULL DEFAULT true,
    push_new_message BOOLEAN NOT NULL DEFAULT true,
    push_verification_update BOOLEAN NOT NULL DEFAULT true,
    push_system BOOLEAN NOT NULL DEFAULT true,
    
    -- Email notification settings
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    email_new_follower BOOLEAN NOT NULL DEFAULT false,
    email_post_liked BOOLEAN NOT NULL DEFAULT false,
    email_post_commented BOOLEAN NOT NULL DEFAULT false,
    email_new_message BOOLEAN NOT NULL DEFAULT true,
    email_verification_update BOOLEAN NOT NULL DEFAULT true,
    email_system BOOLEAN NOT NULL DEFAULT true,
    email_marketing BOOLEAN NOT NULL DEFAULT false,
    
    -- In-app notification settings
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_new_follower BOOLEAN NOT NULL DEFAULT true,
    in_app_post_liked BOOLEAN NOT NULL DEFAULT true,
    in_app_post_commented BOOLEAN NOT NULL DEFAULT true,
    in_app_new_message BOOLEAN NOT NULL DEFAULT true,
    in_app_verification_update BOOLEAN NOT NULL DEFAULT true,
    in_app_system BOOLEAN NOT NULL DEFAULT true,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- Batching preferences
    batch_notifications BOOLEAN NOT NULL DEFAULT true,
    batch_interval_minutes INTEGER NOT NULL DEFAULT 60,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE notification_preferences IS 'User notification preferences for each type and channel';
COMMENT ON COLUMN notification_preferences.quiet_hours_enabled IS 'If true, no push/email during quiet hours';
COMMENT ON COLUMN notification_preferences.batch_notifications IS 'If true, group similar notifications';
COMMENT ON COLUMN notification_preferences.batch_interval_minutes IS 'Interval to batch notifications (default 60 min)';

-- =====================================================
-- 4. DEVICE TOKENS TABLE (for Push Notifications)
-- =====================================================

CREATE TABLE device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    device_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Index for device tokens
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON device_tokens(user_id) WHERE is_active = true;

-- Comments
COMMENT ON TABLE device_tokens IS 'FCM/APNs tokens for push notifications';
COMMENT ON COLUMN device_tokens.platform IS 'Platform: IOS, ANDROID, WEB';
COMMENT ON COLUMN device_tokens.token IS 'Firebase Cloud Messaging or APNs token';

-- =====================================================
-- 5. NOTIFICATION BATCH TABLE (for grouping)
-- =====================================================

CREATE TABLE notification_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    count INTEGER NOT NULL DEFAULT 1,
    actor_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    first_notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMP,
    UNIQUE(recipient_id, type, reference_id)
);

-- Index for batches
CREATE INDEX idx_notification_batches_recipient ON notification_batches(recipient_id);
CREATE INDEX idx_notification_batches_unsent ON notification_batches(recipient_id) WHERE sent_at IS NULL;

-- Comments
COMMENT ON TABLE notification_batches IS 'Groups similar notifications (e.g., "5 people liked your post")';
COMMENT ON COLUMN notification_batches.reference_id IS 'Reference to grouped entity (postId, etc.)';
COMMENT ON COLUMN notification_batches.actor_ids IS 'JSON array of user IDs who triggered notifications';

-- =====================================================
-- 6. TRIGGER FOR UPDATED_AT
-- =====================================================

-- Notifications updated_at trigger
CREATE TRIGGER set_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notification preferences updated_at trigger
CREATE TRIGGER set_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Device tokens updated_at trigger
CREATE TRIGGER set_device_tokens_updated_at
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. DEFAULT NOTIFICATION PREFERENCES FUNCTION
-- =====================================================

-- Function to create default preferences when user is created
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create preferences for new users
CREATE TRIGGER create_notification_preferences_on_user_insert
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- 8. CLEANUP FUNCTION FOR EXPIRED NOTIFICATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at < NOW()
    AND status = 'READ';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION cleanup_expired_notifications IS 'Deletes expired and read notifications. Call periodically via cron.';

-- =====================================================
-- 9. INDEXES FOR COMMON QUERIES
-- =====================================================

-- For fetching unread notifications with pagination
CREATE INDEX idx_notifications_unread_paginated 
    ON notifications(recipient_id, created_at DESC) 
    WHERE status != 'READ';

-- For counting unread by type
CREATE INDEX idx_notifications_unread_type 
    ON notifications(recipient_id, type) 
    WHERE status != 'READ';

-- For notification batching queries
CREATE INDEX idx_notifications_batch_lookup 
    ON notifications(recipient_id, type, status, created_at DESC);
