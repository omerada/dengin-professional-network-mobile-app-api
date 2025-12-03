-- V9: Push Notification Device Tokens Extensions
-- Topic subscriptions and push notification log for FCM

-- Topic subscriptions for broadcast notifications
CREATE TABLE IF NOT EXISTS topic_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_token_id BIGINT NOT NULL REFERENCES device_tokens(id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- One subscription per device per topic
    CONSTRAINT unique_topic_subscription UNIQUE (device_token_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_topic_subscriptions_topic ON topic_subscriptions(topic);
CREATE INDEX IF NOT EXISTS idx_topic_subscriptions_device ON topic_subscriptions(device_token_id);

-- Push notification log for analytics and debugging
CREATE TABLE IF NOT EXISTS push_notification_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_token_id BIGINT,
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
CREATE INDEX IF NOT EXISTS idx_push_log_user_id ON push_notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_push_log_sent_at ON push_notification_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_log_status ON push_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_push_log_type ON push_notification_log(notification_type);

-- Comments
COMMENT ON TABLE topic_subscriptions IS 'Firebase topic subscriptions for broadcast messages';
COMMENT ON TABLE push_notification_log IS 'Audit log for push notification delivery tracking';
COMMENT ON COLUMN push_notification_log.status IS 'Delivery status: SENT, DELIVERED, FAILED, INVALID_TOKEN';
