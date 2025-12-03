-- V10: Add version columns for optimistic locking
-- All entities extending BaseEntity require a version column for JPA @Version

-- Users table (Identity Context)
ALTER TABLE users ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- User blocks table (Identity Context)
ALTER TABLE user_blocks ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Professions table (Identity Context)
ALTER TABLE professions ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Refresh tokens table (Identity Context)
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Verification requests table (Verification Context)
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Posts table (Social Context)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Comments table (Social Context)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Follows table (Social Context)
ALTER TABLE follows ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Post likes table (Social Context)
ALTER TABLE post_likes ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Conversations table (Messaging Context)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Messages table (Messaging Context)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Notifications table (Notification Context)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Notification preferences table (Notification Context)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Device tokens table (Notification Context)
ALTER TABLE device_tokens ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Notification batches table (Notification Context)
ALTER TABLE notification_batches ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Content reports table (Moderation Context)
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Moderation actions table (Moderation Context)
ALTER TABLE moderation_actions ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- User sanctions table (Moderation Context)
ALTER TABLE user_sanctions ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- Comment on version columns
COMMENT ON COLUMN users.version IS 'Optimistic locking version for JPA @Version';
COMMENT ON COLUMN conversations.version IS 'Optimistic locking version for JPA @Version';
COMMENT ON COLUMN messages.version IS 'Optimistic locking version for JPA @Version';
COMMENT ON COLUMN notifications.version IS 'Optimistic locking version for JPA @Version';
