package com.meslektas.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated messages response
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageListResponse {

    private List<MessageDto> messages;
    private int pageNumber;
    private int pageSize;
    private boolean hasMore;
    private long totalMessages;
}
