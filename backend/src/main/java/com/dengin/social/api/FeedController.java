package com.dengin.social.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.common.api.PagedResponse;
import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.social.application.dto.FeedPostResponse;
import com.dengin.social.application.service.FeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feed REST Controller
 * 
 * Endpoints:
 * - GET /api/feed - Get personalized feed
 * - GET /api/feed/trending - Get trending posts
 * 
 * Security:
 * - All endpoints require authentication (Bearer JWT)
 * 
 * Feed Algorithm:
 * - Time score (40%): Recent posts ranked higher
 * - Engagement score (30%): Like/comment count
 * - Author score (20%): Following users + same profession
 * - Content score (10%): Has images, longer content
 * 
 * Rate Limiting:
 * - Feed: 60 requests per minute per user
 * 
 * Caching:
 * - Feed cached for 5 minutes per user
 * - Cache invalidation on new post by followed user
 * 
 * Sprint 5-6 Implementation
 */
@Slf4j
@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@Tag(name = "Feed", description = "Social feed and trending posts endpoints")
public class FeedController {

    private final FeedService feedService;

    /**
     * GET /api/feed
     * Get personalized feed for current user
     * 
     * Algorithm combines:
     * - Posts from followed users
     * - Posts from same profession
     * - Trending posts
     * 
     * @param professionFilter Optional profession filter
     * @param page             Page number (default 0)
     * @param size             Page size (default 20, max 50)
     * @param currentUser      Authenticated user
     * @return Paginated PostResponse list
     */
    @GetMapping
    @Operation(summary = "Get personalized feed", description = "Returns paginated personalized feed based on following, profession, and engagement. "
            +
            "Feed is cached for 5 minutes per user.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed retrieved successfully", content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests - Rate limit exceeded (60 requests/minute)")
    })
    public ResponseEntity<ApiResponse<PagedResponse<FeedPostResponse>>> getFeed(
            @Parameter(description = "Filter by profession ID (optional)") @RequestParam(required = false) Long professionFilter,

            @Parameter(description = "Max results (max 50)", example = "20") @RequestParam(defaultValue = "20") int limit,

            @Parameter(description = "Cursor for pagination - get posts before this post ID (optional)") @RequestParam(required = false) Long beforeId,

            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();

        // Validate limit
        if (limit > 50) {
            limit = 50;
        }
        if (limit < 1) {
            limit = 20;
        }

        log.info("GET /api/feed - userId: {}, limit: {}, professionFilter: {}, beforeId: {}",
                userId, limit, professionFilter, beforeId);

        List<FeedPostResponse> feed = feedService.getFeed(userId, professionFilter, limit, beforeId);

        // Get last post ID for cursor-based pagination
        Long lastId = feed.isEmpty() ? null : feed.get(feed.size() - 1).getId();

        // Create paged response with cursor-based pagination
        PagedResponse<FeedPostResponse> pagedResponse = PagedResponse.ofCursor(feed, limit, lastId);

        log.info("Feed retrieved - userId: {}, postCount: {}", userId, feed.size());

        return ResponseEntity.ok(ApiResponse.success(pagedResponse));
    }

    /**
     * GET /api/feed/trending
     * Get trending posts based on engagement
     * 
     * Trending Score = (like_count * 2 + comment_count * 5)
     * Only posts from last 7 days considered
     * 
     * @param limit       Max results (max 50)
     * @param currentUser Authenticated user
     * @return Paginated PostResponse list sorted by engagement
     */
    @GetMapping("/trending")
    @Operation(summary = "Get trending posts", description = "Returns trending posts from last 7 days ranked by engagement score. "
            +
            "Score = (likes * 2 + comments * 5)", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Trending posts retrieved successfully", content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid pagination parameters"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PagedResponse<FeedPostResponse>>> getTrendingPosts(
            @Parameter(description = "Max results (max 50)", example = "20") @RequestParam(defaultValue = "20") int limit,

            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();

        // Validate limit
        if (limit > 50) {
            limit = 50;
        }
        if (limit < 1) {
            limit = 20;
        }

        log.info("GET /api/feed/trending - userId: {}, limit: {}", userId, limit);

        List<FeedPostResponse> trending = feedService.getTrendingPosts(userId, limit);

        // Get last post ID for cursor-based pagination
        Long lastId = trending.isEmpty() ? null : trending.get(trending.size() - 1).getId();

        // Create paged response
        PagedResponse<FeedPostResponse> pagedResponse = PagedResponse.ofCursor(trending, limit, lastId);

        log.info("Trending posts retrieved - userId: {}, postCount: {}", userId, trending.size());

        return ResponseEntity.ok(ApiResponse.success(pagedResponse));
    }
}
