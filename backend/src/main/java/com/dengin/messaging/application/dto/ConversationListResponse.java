package com.dengin.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated conversations response
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationListResponse {

    private List<ConversationDto> conversations;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private long totalElements;
    private boolean hasMore;
}
