-- Messaging Context - Sprint 7-8
-- Conversations and Messages tables for 1-to-1 messaging

-- Conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    conversation_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    participant1_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant1_deleted_at TIMESTAMP,
    participant2_deleted_at TIMESTAMP,
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique conversation between two users (order-independent)
    CONSTRAINT unique_conversation UNIQUE(participant1_id, participant2_id),
    -- Participants must be different
    CONSTRAINT participants_different CHECK(participant1_id != participant2_id)
);

-- Indexes for conversation lookups
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_uuid ON conversations(conversation_uuid);
-- Composite index for finding user's conversations
CREATE INDEX idx_conversations_p1_active ON conversations(participant1_id, last_message_at DESC) WHERE participant1_deleted_at IS NULL;
CREATE INDEX idx_conversations_p2_active ON conversations(participant2_id, last_message_at DESC) WHERE participant2_deleted_at IS NULL;

-- Messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    message_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    attachment_s3_key VARCHAR(500),
    attachment_file_name VARCHAR(255),
    attachment_content_type VARCHAR(100),
    attachment_file_size BIGINT,
    read_at TIMESTAMP,
    delivered_at TIMESTAMP,
    deleted_by_sender_at TIMESTAMP,
    deleted_by_recipient_at TIMESTAMP,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Content length validation
    CONSTRAINT message_content_length CHECK(LENGTH(content) >= 1 AND LENGTH(content) <= 2000),
    -- Attachment size validation (max 10MB)
    CONSTRAINT attachment_size_limit CHECK(attachment_file_size IS NULL OR attachment_file_size <= 10485760),
    -- Valid message status
    CONSTRAINT valid_message_status CHECK(status IN ('SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'DELETED'))
);

-- Indexes for message queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_uuid ON messages(message_uuid);
-- Index for unread messages count
CREATE INDEX idx_messages_unread ON messages(recipient_id, conversation_id) WHERE status != 'READ' AND deleted_by_recipient_at IS NULL;
-- Index for message search
CREATE INDEX idx_messages_content_search ON messages USING GIN(to_tsvector('simple', content));

-- Function to count unread messages for a user in a conversation
CREATE OR REPLACE FUNCTION count_unread_messages(user_id_param BIGINT, conv_id_param BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM messages
        WHERE conversation_id = conv_id_param
            AND recipient_id = user_id_param
            AND status != 'READ'
            AND deleted_by_recipient_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get total unread message count for a user
CREATE OR REPLACE FUNCTION count_all_unread_messages(user_id_param BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.recipient_id = user_id_param
            AND m.status != 'READ'
            AND m.deleted_by_recipient_at IS NULL
            AND (
                (c.participant1_id = user_id_param AND c.participant1_deleted_at IS NULL) OR
                (c.participant2_id = user_id_param AND c.participant2_deleted_at IS NULL)
            )
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation's last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.sent_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Comment describing the schema
COMMENT ON TABLE conversations IS 'Stores 1-to-1 conversation metadata between two participants';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON COLUMN messages.status IS 'Message delivery status: SENDING, SENT, DELIVERED, READ, FAILED, DELETED';
COMMENT ON COLUMN messages.attachment_s3_key IS 'S3 key for message attachment (max 1 per message, images only, max 10MB)';
