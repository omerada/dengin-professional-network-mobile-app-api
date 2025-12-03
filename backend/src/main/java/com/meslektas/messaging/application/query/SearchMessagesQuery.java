package com.meslektas.messaging.application.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Query for searching messages in user's conversations.
 * 
 * Supports:
 * - Full-text search in message content
 * - Filter by conversation
 * - Filter by date range
 * - Pagination
 */
@Value
@Builder
public class SearchMessagesQuery {
    
    @NotBlank(message = "Search query cannot be empty")
    String searchQuery;
    
    /** Optional: Filter by specific conversation */
    UUID conversationId;
    
    /** Optional: Filter messages sent after this date */
    LocalDateTime fromDate;
    
    /** Optional: Filter messages sent before this date */
    LocalDateTime toDate;
    
    @Min(value = 0, message = "Page must be non-negative")
    @Builder.Default
    int page = 0;
    
    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    @Builder.Default
    int size = 20;
    
    /**
     * Calculate offset for pagination
     */
    public int getOffset() {
        return page * size;
    }
}
