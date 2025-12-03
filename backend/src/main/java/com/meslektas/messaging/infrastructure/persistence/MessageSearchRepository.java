package com.meslektas.messaging.infrastructure.persistence;

import com.meslektas.messaging.application.dto.MessageSearchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for message search operations.
 * 
 * Uses native SQL queries for full-text search functionality.
 * This is separated from JpaConversationRepository for cleaner architecture.
 */
@Slf4j
@Repository
@RequiredArgsConstructor
public class MessageSearchRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    /**
     * Search messages by content for a specific user.
     * Uses PostgreSQL full-text search with ts_rank for relevance scoring.
     */
    public List<MessageSearchResult> searchMessages(
            Long userId,
            String searchQuery,
            UUID conversationId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            int limit,
            int offset
    ) {
        log.debug("Searching messages for user {} with query: {}", userId, searchQuery);
        
        StringBuilder sql = new StringBuilder("""
            SELECT 
                m.id AS message_id,
                m.conversation_id,
                m.sender_id,
                m.content,
                m.sent_at,
                CAST(ts_rank(m.content_search, plainto_tsquery('simple', ?)) AS REAL) AS relevance,
                u.first_name AS sender_first_name,
                u.last_name AS sender_last_name,
                CASE 
                    WHEN c.participant1_id = ? THEN c.participant2_id 
                    ELSE c.participant1_id 
                END AS other_user_id,
                CASE 
                    WHEN c.participant1_id = ? THEN u2.first_name 
                    ELSE u1.first_name 
                END AS other_first_name,
                CASE 
                    WHEN c.participant1_id = ? THEN u2.last_name 
                    ELSE u1.last_name 
                END AS other_last_name,
                CASE 
                    WHEN c.participant1_id = ? THEN u2.profile_image_url 
                    ELSE u1.profile_image_url 
                END AS other_profile_image
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            JOIN users u ON m.sender_id = u.id
            JOIN users u1 ON c.participant1_id = u1.id
            JOIN users u2 ON c.participant2_id = u2.id
            WHERE m.content_search @@ plainto_tsquery('simple', ?)
                AND (
                    (c.participant1_id = ? AND c.participant1_deleted_at IS NULL) OR
                    (c.participant2_id = ? AND c.participant2_deleted_at IS NULL)
                )
                AND (
                    (m.sender_id = ? AND m.deleted_by_sender_at IS NULL) OR
                    (m.recipient_id = ? AND m.deleted_by_recipient_at IS NULL)
                )
            """);
        
        // Add optional filters
        if (conversationId != null) {
            sql.append(" AND m.conversation_id = ?");
        }
        if (fromDate != null) {
            sql.append(" AND m.sent_at >= ?");
        }
        if (toDate != null) {
            sql.append(" AND m.sent_at <= ?");
        }
        
        sql.append(" ORDER BY relevance DESC, m.sent_at DESC");
        sql.append(" LIMIT ? OFFSET ?");
        
        // Build parameters array
        Object[] params = buildSearchParams(
            userId, searchQuery, conversationId, fromDate, toDate, limit, offset
        );
        
        return jdbcTemplate.query(sql.toString(), new MessageSearchResultMapper(), params);
    }
    
    /**
     * Count total search results for pagination.
     */
    public long countSearchResults(
            Long userId,
            String searchQuery,
            UUID conversationId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*)
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE m.content_search @@ plainto_tsquery('simple', ?)
                AND (
                    (c.participant1_id = ? AND c.participant1_deleted_at IS NULL) OR
                    (c.participant2_id = ? AND c.participant2_deleted_at IS NULL)
                )
                AND (
                    (m.sender_id = ? AND m.deleted_by_sender_at IS NULL) OR
                    (m.recipient_id = ? AND m.deleted_by_recipient_at IS NULL)
                )
            """);
        
        // Add optional filters
        if (conversationId != null) {
            sql.append(" AND m.conversation_id = ?");
        }
        if (fromDate != null) {
            sql.append(" AND m.sent_at >= ?");
        }
        if (toDate != null) {
            sql.append(" AND m.sent_at <= ?");
        }
        
        // Build parameters array
        Object[] params = buildCountParams(userId, searchQuery, conversationId, fromDate, toDate);
        
        Long count = jdbcTemplate.queryForObject(sql.toString(), Long.class, params);
        return count != null ? count : 0L;
    }
    
    /**
     * Generate content highlight with search terms marked.
     */
    public String highlightContent(String content, String searchQuery) {
        String sql = """
            SELECT ts_headline(
                'simple',
                ?,
                plainto_tsquery('simple', ?),
                'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=25'
            )
            """;
        
        return jdbcTemplate.queryForObject(sql, String.class, content, searchQuery);
    }
    
    // ==================== Private Helper Methods ====================
    
    private Object[] buildSearchParams(
            Long userId,
            String searchQuery,
            UUID conversationId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            int limit,
            int offset
    ) {
        // Base params count: 10 (searchQuery appears twice, userId appears 8 times)
        java.util.List<Object> params = new java.util.ArrayList<>();
        
        // For ts_rank
        params.add(searchQuery);
        // For CASE statements (5 times)
        params.add(userId);
        params.add(userId);
        params.add(userId);
        params.add(userId);
        // For plainto_tsquery in WHERE
        params.add(searchQuery);
        // For participant checks
        params.add(userId);
        params.add(userId);
        // For sender/recipient checks
        params.add(userId);
        params.add(userId);
        
        // Optional filters
        if (conversationId != null) {
            params.add(conversationId);
        }
        if (fromDate != null) {
            params.add(java.sql.Timestamp.valueOf(fromDate));
        }
        if (toDate != null) {
            params.add(java.sql.Timestamp.valueOf(toDate));
        }
        
        // Pagination
        params.add(limit);
        params.add(offset);
        
        return params.toArray();
    }
    
    private Object[] buildCountParams(
            Long userId,
            String searchQuery,
            UUID conversationId,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        java.util.List<Object> params = new java.util.ArrayList<>();
        
        params.add(searchQuery);
        params.add(userId);
        params.add(userId);
        params.add(userId);
        params.add(userId);
        
        if (conversationId != null) {
            params.add(conversationId);
        }
        if (fromDate != null) {
            params.add(java.sql.Timestamp.valueOf(fromDate));
        }
        if (toDate != null) {
            params.add(java.sql.Timestamp.valueOf(toDate));
        }
        
        return params.toArray();
    }
    
    /**
     * Row mapper for search results.
     */
    private static class MessageSearchResultMapper implements RowMapper<MessageSearchResult> {
        @Override
        public MessageSearchResult mapRow(ResultSet rs, int rowNum) throws SQLException {
            return MessageSearchResult.builder()
                .messageId(UUID.fromString(rs.getString("message_id")))
                .conversationId(UUID.fromString(rs.getString("conversation_id")))
                .senderId(UUID.fromString(rs.getString("sender_id")))
                .senderName(rs.getString("sender_first_name") + " " + rs.getString("sender_last_name"))
                .content(rs.getString("content"))
                .sentAt(rs.getTimestamp("sent_at").toLocalDateTime())
                .relevanceScore(rs.getDouble("relevance"))
                .otherParticipant(MessageSearchResult.ParticipantInfo.builder()
                    .userId(UUID.fromString(rs.getString("other_user_id")))
                    .firstName(rs.getString("other_first_name"))
                    .lastName(rs.getString("other_last_name"))
                    .profileImageUrl(rs.getString("other_profile_image"))
                    .build())
                .build();
        }
    }
}
