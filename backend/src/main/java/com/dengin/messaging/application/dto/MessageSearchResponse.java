package com.dengin.messaging.application.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * DTO for paginated message search response.
 */
@Value
@Builder
public class MessageSearchResponse {

    List<MessageSearchResult> results;
    long totalResults;
    int page;
    int size;
    int totalPages;
    boolean hasMore;

    /**
     * Create empty response
     */
    public static MessageSearchResponse empty(int page, int size) {
        return MessageSearchResponse.builder()
                .results(List.of())
                .totalResults(0)
                .page(page)
                .size(size)
                .totalPages(0)
                .hasMore(false)
                .build();
    }

    /**
     * Create response with results
     */
    public static MessageSearchResponse of(
            List<MessageSearchResult> results,
            long totalResults,
            int page,
            int size) {
        int totalPages = (int) Math.ceil((double) totalResults / size);
        boolean hasMore = (page + 1) < totalPages;

        return MessageSearchResponse.builder()
                .results(results)
                .totalResults(totalResults)
                .page(page)
                .size(size)
                .totalPages(totalPages)
                .hasMore(hasMore)
                .build();
    }
}
