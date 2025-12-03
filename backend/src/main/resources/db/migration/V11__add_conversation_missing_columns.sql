-- V11: Add missing columns for Conversation entity
-- These columns are required by the Conversation domain model

-- Rename conversation_uuid to conversation_id (matching entity field name)
ALTER TABLE conversations RENAME COLUMN conversation_uuid TO conversation_id;

-- Add missing Conversation columns
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_preview VARCHAR(255);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participant1_unread_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participant2_unread_count INTEGER DEFAULT 0 NOT NULL;

-- Update index name for renamed column
DROP INDEX IF EXISTS idx_conversations_uuid;
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);

COMMENT ON COLUMN conversations.conversation_id IS 'UUID business identifier for the conversation';
COMMENT ON COLUMN conversations.last_message_preview IS 'Preview text of the last message (max 100 chars)';
COMMENT ON COLUMN conversations.last_message_sender_id IS 'User ID who sent the last message';
COMMENT ON COLUMN conversations.participant1_unread_count IS 'Unread message count for participant1';
COMMENT ON COLUMN conversations.participant2_unread_count IS 'Unread message count for participant2';
