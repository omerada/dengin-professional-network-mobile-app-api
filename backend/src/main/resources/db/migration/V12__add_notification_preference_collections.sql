-- V12: Add collection tables for NotificationPreferences
-- ElementCollection tables for disabled notification types

-- Disabled in-app notification types
CREATE TABLE IF NOT EXISTS disabled_inapp_notifications (
    user_id BIGINT NOT NULL REFERENCES notification_preferences(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, notification_type)
);

-- Disabled email notification types
CREATE TABLE IF NOT EXISTS disabled_email_notifications (
    user_id BIGINT NOT NULL REFERENCES notification_preferences(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, notification_type)
);

-- Disabled push notification types
CREATE TABLE IF NOT EXISTS disabled_push_notifications (
    user_id BIGINT NOT NULL REFERENCES notification_preferences(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, notification_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disabled_inapp_user ON disabled_inapp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_disabled_email_user ON disabled_email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_disabled_push_user ON disabled_push_notifications(user_id);

-- Comments
COMMENT ON TABLE disabled_inapp_notifications IS 'Disabled in-app notification types per user';
COMMENT ON TABLE disabled_email_notifications IS 'Disabled email notification types per user';
COMMENT ON TABLE disabled_push_notifications IS 'Disabled push notification types per user';
