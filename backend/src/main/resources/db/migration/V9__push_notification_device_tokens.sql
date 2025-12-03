-- V9: Push Notification Device Tokens
-- Device token management for FCM push notifications

CREATE TABLE device_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL,
    device_name VARCHAR(100),
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    
    -- Valid platform types
    CONSTRAINT valid_platform CHECK (platform IN ('ANDROID', 'IOS', 'WEB'))
);

-- Indexes for efficient queries
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_active ON device_tokens(user_id, active) WHERE active = true;
CREATE INDEX idx_device_tokens_last_used ON device_tokens(last_used_at) WHERE active = true;

-- Topic subscriptions for broadcast notifications
CREATE TABLE topic_subscriptions (
    id UUID PRIMARY KEY,
    device_token_id UUID NOT NULL REFERENCES device_tokens(id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- One subscription per device per topic
    CONSTRAINT unique_topic_subscription UNIQUE (device_token_id, topic)
);

CREATE INDEX idx_topic_subscriptions_topic ON topic_subscriptions(topic);
CREATE INDEX idx_topic_subscriptions_device ON topic_subscriptions(device_token_id);

-- Push notification log for analytics and debugging
CREATE TABLE push_notification_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    device_token_id UUID,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    body TEXT,
    data JSONB,
    status VARCHAR(20) NOT NULL,
    fcm_message_id VARCHAR(255),
    error_code VARCHAR(50),
    error_message TEXT,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Partition by month for better performance
CREATE INDEX idx_push_log_user_id ON push_notification_log(user_id);
CREATE INDEX idx_push_log_sent_at ON push_notification_log(sent_at DESC);
CREATE INDEX idx_push_log_status ON push_notification_log(status);
CREATE INDEX idx_push_log_type ON push_notification_log(notification_type);

-- Comments
COMMENT ON TABLE device_tokens IS 'FCM device tokens for push notifications, supports multi-device per user';
COMMENT ON TABLE topic_subscriptions IS 'Firebase topic subscriptions for broadcast messages';
COMMENT ON TABLE push_notification_log IS 'Audit log for push notification delivery tracking';
COMMENT ON COLUMN device_tokens.platform IS 'Device platform: ANDROID, IOS, or WEB';
COMMENT ON COLUMN push_notification_log.status IS 'Delivery status: SENT, DELIVERED, FAILED, INVALID_TOKEN';
