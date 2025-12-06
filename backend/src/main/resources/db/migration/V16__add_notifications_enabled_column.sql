-- =====================================================
-- Migration V16: Fix notification_preferences schema
-- =====================================================
-- Date: 2025-12-06
-- Description: Fixes notification_preferences table to match entity:
--              1. Adds notifications_enabled master switch
--              2. Changes quiet_hours columns from TIME to INTEGER (0-23)
--              3. Removes unused individual notification type columns
-- Note: ElementCollection tables already exist from V12
-- =====================================================

-- 1. Add notifications_enabled column (master switch)
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN notification_preferences.notifications_enabled IS 'Master switch - if false, no notifications are sent regardless of other settings';

-- 2. Fix quiet_hours columns - change from TIME to INTEGER (hour of day 0-23)
-- First, backup and drop existing TIME columns
ALTER TABLE notification_preferences 
DROP COLUMN IF EXISTS quiet_hours_enabled,
DROP COLUMN IF EXISTS quiet_hours_start,
DROP COLUMN IF EXISTS quiet_hours_end;

-- Add them back as INTEGER
ALTER TABLE notification_preferences 
ADD COLUMN quiet_hours_start INTEGER,
ADD COLUMN quiet_hours_end INTEGER;

COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Quiet hours start (0-23), null if not set';
COMMENT ON COLUMN notification_preferences.quiet_hours_end IS 'Quiet hours end (0-23), null if not set';

-- Add constraints for valid hour range
ALTER TABLE notification_preferences
ADD CONSTRAINT chk_quiet_hours_start_range CHECK (quiet_hours_start IS NULL OR (quiet_hours_start >= 0 AND quiet_hours_start <= 23)),
ADD CONSTRAINT chk_quiet_hours_end_range CHECK (quiet_hours_end IS NULL OR (quiet_hours_end >= 0 AND quiet_hours_end <= 23));

-- 3. Drop unused columns (individual notification type settings)
-- These are now handled via ElementCollection tables (disabled_*_notifications from V12)
ALTER TABLE notification_preferences
DROP COLUMN IF EXISTS push_new_follower,
DROP COLUMN IF EXISTS push_post_liked,
DROP COLUMN IF EXISTS push_post_commented,
DROP COLUMN IF EXISTS push_new_message,
DROP COLUMN IF EXISTS push_verification_update,
DROP COLUMN IF EXISTS push_system,
DROP COLUMN IF EXISTS email_new_follower,
DROP COLUMN IF EXISTS email_post_liked,
DROP COLUMN IF EXISTS email_post_commented,
DROP COLUMN IF EXISTS email_new_message,
DROP COLUMN IF EXISTS email_verification_update,
DROP COLUMN IF EXISTS email_system,
DROP COLUMN IF EXISTS email_marketing,
DROP COLUMN IF EXISTS in_app_enabled,
DROP COLUMN IF EXISTS in_app_new_follower,
DROP COLUMN IF EXISTS in_app_post_liked,
DROP COLUMN IF EXISTS in_app_post_commented,
DROP COLUMN IF EXISTS in_app_new_message,
DROP COLUMN IF EXISTS in_app_verification_update,
DROP COLUMN IF EXISTS in_app_system,
DROP COLUMN IF EXISTS batch_notifications,
DROP COLUMN IF EXISTS batch_interval_minutes;

-- 4. Drop the unused 'id' column (user_id is the primary key)
ALTER TABLE notification_preferences
DROP COLUMN IF EXISTS id;

