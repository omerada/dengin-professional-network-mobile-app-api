-- Message Search Optimization - Sprint 8
-- Full-text search improvements for message content

-- Add tsvector column for cached full-text search
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS content_search TSVECTOR;

-- Update existing records to populate tsvector
UPDATE messages 
SET content_search = to_tsvector('simple', content)
WHERE content_search IS NULL;

-- Create trigger to auto-update tsvector on insert/update
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_search := to_tsvector('simple', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_search_update ON messages;
CREATE TRIGGER messages_search_update
    BEFORE INSERT OR UPDATE OF content ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_search_vector();

-- Create GIN index on the tsvector column for faster searches
DROP INDEX IF EXISTS idx_messages_content_search;
CREATE INDEX idx_messages_content_search_v2 ON messages USING GIN(content_search);

-- Compound index for user-scoped searches
CREATE INDEX idx_messages_search_user ON messages(sender_id, recipient_id, sent_at DESC)
WHERE deleted_by_sender_at IS NULL AND deleted_by_recipient_at IS NULL;

-- Function to search messages for a user
CREATE OR REPLACE FUNCTION search_user_messages(
    user_uuid UUID,
    search_query TEXT,
    result_limit INTEGER DEFAULT 50,
    result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    message_id UUID,
    conversation_id UUID,
    sender_id UUID,
    content TEXT,
    sent_at TIMESTAMP,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS message_id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.sent_at,
        ts_rank(m.content_search, plainto_tsquery('simple', search_query)) AS relevance
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.content_search @@ plainto_tsquery('simple', search_query)
        AND (
            (c.participant1_id = user_uuid AND c.participant1_deleted_at IS NULL) OR
            (c.participant2_id = user_uuid AND c.participant2_deleted_at IS NULL)
        )
        AND (
            (m.sender_id = user_uuid AND m.deleted_by_sender_at IS NULL) OR
            (m.recipient_id = user_uuid AND m.deleted_by_recipient_at IS NULL)
        )
    ORDER BY relevance DESC, m.sent_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to count search results
CREATE OR REPLACE FUNCTION count_search_results(
    user_uuid UUID,
    search_query TEXT
)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.content_search @@ plainto_tsquery('simple', search_query)
            AND (
                (c.participant1_id = user_uuid AND c.participant1_deleted_at IS NULL) OR
                (c.participant2_id = user_uuid AND c.participant2_deleted_at IS NULL)
            )
            AND (
                (m.sender_id = user_uuid AND m.deleted_by_sender_at IS NULL) OR
                (m.recipient_id = user_uuid AND m.deleted_by_recipient_at IS NULL)
            )
    );
END;
$$ LANGUAGE plpgsql;
