-- V14: Add attachment_url column to messages
-- Required by MessageAttachment embeddable

ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(1000);

COMMENT ON COLUMN messages.attachment_url IS 'Public URL for the message attachment';
