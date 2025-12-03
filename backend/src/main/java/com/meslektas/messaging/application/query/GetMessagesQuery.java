package com.meslektas.messaging.application.query;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Query to get messages in a conversation with pagination.
 * 
 * Returns messages sorted by sent time (oldest first for chat view).
 * Supports "load more" pattern with cursor-based pagination.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetMessagesQuery {
    
    @NotNull(message = "Conversation ID is required")
    private UUID conversationId;
    
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 30;
    
    /**
     * If provided, load messages before this message ID (for "load more" pattern)
     */
    private UUID beforeMessageId;
    
    /**
     * Maximum page size to prevent abuse
     */
    public int getSize() {
        return Math.min(size, 100);
    }
}
