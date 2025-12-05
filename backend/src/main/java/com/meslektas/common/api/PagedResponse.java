package com.meslektas.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Standard paginated response wrapper.
 * Provides consistent pagination structure across all endpoints.
 * 
 * @param <T> Content item type
 * 
 *            Usage:
 *            - Cursor-based pagination: Use lastId + hasMore
 *            - Offset-based pagination: Use page + totalPages + totalElements
 * 
 *            Example Response:
 *            {
 *            "content": [...],
 *            "page": 0,
 *            "size": 20,
 *            "totalElements": 150,
 *            "totalPages": 8,
 *            "hasNext": true,
 *            "hasPrevious": false,
 *            "lastId": 12345
 *            }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PagedResponse<T> {

    /**
     * Content items for current page
     */
    private List<T> content;

    /**
     * Current page number (0-indexed)
     */
    private Integer page;

    /**
     * Page size (number of items per page)
     */
    private Integer size;

    /**
     * Total number of elements across all pages
     */
    private Long totalElements;

    /**
     * Total number of pages
     */
    private Integer totalPages;

    /**
     * Whether there are more pages after current
     */
    private Boolean hasNext;

    /**
     * Whether there are pages before current
     */
    private Boolean hasPrevious;

    /**
     * Last item ID for cursor-based pagination
     * Used with beforeId parameter for next page
     */
    private Long lastId;

    /**
     * Create a paged response with offset-based pagination
     */
    public static <T> PagedResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        Long lastId = null;

        return PagedResponse.<T>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .lastId(lastId)
                .build();
    }

    /**
     * Create a paged response with cursor-based pagination
     */
    public static <T> PagedResponse<T> ofCursor(List<T> content, int requestedSize, Long lastItemId) {
        boolean hasMore = content.size() >= requestedSize;

        return PagedResponse.<T>builder()
                .content(content)
                .size(content.size())
                .hasNext(hasMore)
                .lastId(lastItemId)
                .build();
    }

    /**
     * Create an empty paged response
     */
    public static <T> PagedResponse<T> empty() {
        return PagedResponse.<T>builder()
                .content(List.of())
                .page(0)
                .size(0)
                .totalElements(0L)
                .totalPages(0)
                .hasNext(false)
                .hasPrevious(false)
                .build();
    }
}
