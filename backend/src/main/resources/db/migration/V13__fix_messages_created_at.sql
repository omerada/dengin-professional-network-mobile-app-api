-- V13: Fix messages table column names to match BaseEntity
-- BaseEntity expects created_at and updated_at columns

-- Rename sent_at to created_at
ALTER TABLE messages RENAME COLUMN sent_at TO created_at;

-- Update related indexes
DROP INDEX IF EXISTS idx_messages_sent_at;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Update conversation trigger to use created_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN messages.created_at IS 'When the message was sent (BaseEntity created_at)';
