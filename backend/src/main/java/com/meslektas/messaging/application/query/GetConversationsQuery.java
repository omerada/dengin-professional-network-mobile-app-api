package com.meslektas.messaging.application.query;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Query to get user's conversations with pagination.
 * 
 * Returns conversations sorted by last message time (most recent first).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetConversationsQuery {

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;

    /**
     * Maximum page size to prevent abuse
     */
    public int getSize() {
        return Math.min(size, 50);
    }
}
