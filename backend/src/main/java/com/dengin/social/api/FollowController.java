package com.dengin.social.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.common.api.PagedResponse;
import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.social.application.dto.FollowResponse;
import com.dengin.social.application.dto.UserFollowDto;
import com.dengin.social.application.service.FollowService;
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
 * Follow REST Controller
 * 
 * Endpoints:
 * - POST /api/users/{userId}/follow - Follow a user
 * - DELETE /api/users/{userId}/follow - Unfollow a user
 * - GET /api/users/{userId}/followers - Get user's followers
 * - GET /api/users/{userId}/following - Get users that user is following
 * 
 * Security:
 * - All endpoints require authentication (Bearer JWT)
 * 
 * Business Rules:
 * - Can't follow self
 * - Can't follow same user twice (idempotent)
 * - Can't follow blocked users
 * - Follower/following counts updated automatically
 * 
 * Rate Limiting:
 * - Follow/unfollow: 60 actions per hour per user
 * 
 * Sprint 5-6 Implementation
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Follow", description = "User follow/unfollow management endpoints")
public class FollowController {

    private final FollowService followService;

    /**
     * POST /api/users/{userId}/follow
     * Follow a user
     * 
     * Business Rules:
     * - Can't follow self
     * - Can't follow same user twice (idempotent)
     * - Can't follow blocked users
     * 
     * @param userId      User ID to follow
     * @param currentUser Authenticated user
     * @return FollowResponse with updated counts
     */
    @PostMapping("/{userId}/follow")
    @Operation(summary = "Follow a user", description = "Follows another user. Idempotent operation - following same user twice has no effect.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User followed successfully", content = @Content(schema = @Schema(implementation = FollowResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request - Can't follow self or blocked user"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests - Rate limit exceeded (60 follows/hour)")
    })
    public ResponseEntity<ApiResponse<FollowResponse>> followUser(
            @Parameter(description = "User ID to follow", required = true) @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long followerId = currentUser.getId();
        log.info("POST /api/users/{}/follow - followerId: {}", userId, followerId);

        FollowResponse response = followService.followUser(followerId, userId);

        log.info("User followed - followerId: {}, followingId: {}, following: {}",
                followerId, userId, response.following());
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı takip edildi", response));
    }

    /**
     * DELETE /api/users/{userId}/follow
     * Unfollow a user
     * 
     * Idempotent operation - unfollowing a user you don't follow has no effect
     * 
     * @param userId      User ID to unfollow
     * @param currentUser Authenticated user
     * @return FollowResponse with updated counts
     */
    @DeleteMapping("/{userId}/follow")
    @Operation(summary = "Unfollow a user", description = "Unfollows a user. Idempotent operation - unfollowing same user twice has no effect.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User unfollowed successfully", content = @Content(schema = @Schema(implementation = FollowResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<FollowResponse>> unfollowUser(
            @Parameter(description = "User ID to unfollow", required = true) @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long followerId = currentUser.getId();
        log.info("DELETE /api/users/{}/follow - followerId: {}", userId, followerId);

        FollowResponse response = followService.unfollowUser(followerId, userId);

        log.info("User unfollowed - followerId: {}, followingId: {}, following: {}",
                followerId, userId, response.following());
        return ResponseEntity.ok(ApiResponse.success("Takip sonlandırıldı", response));
    }

    /**
     * GET /api/users/{userId}/followers
     * Get list of users who follow this user
     * 
     * @param userId      User ID
     * @param page        Page number (0-indexed)
     * @param size        Page size (max 50)
     * @param currentUser Authenticated user
     * @return Paginated list of follower users
     */
    @GetMapping("/{userId}/followers")
    @Operation(summary = "Get user's followers", description = "Returns paginated list of users who follow this user", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Followers retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UserFollowDto>>> getFollowers(
            @Parameter(description = "User ID", required = true) @PathVariable Long userId,
            @Parameter(description = "Page number (0-indexed)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)", example = "20") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Validate page size
        if (size > 50)
            size = 50;
        if (size < 1)
            size = 20;
        if (page < 0)
            page = 0;

        log.info("GET /api/users/{}/followers - requesterId: {}, page: {}, size: {}",
                userId, currentUser.getId(), page, size);

        List<UserFollowDto> followers = followService.getFollowers(userId);

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, followers.size());
        List<UserFollowDto> pagedFollowers = start < followers.size()
                ? followers.subList(start, end)
                : List.of();

        PagedResponse<UserFollowDto> pagedResponse = PagedResponse.of(
                pagedFollowers, page, size, followers.size());

        log.info("Followers retrieved - userId: {}, followerCount: {}, page: {}",
                userId, followers.size(), page);
        return ResponseEntity.ok(ApiResponse.success(pagedResponse));
    }

    /**
     * GET /api/users/{userId}/following
     * Get list of users that this user follows
     * 
     * @param userId      User ID
     * @param page        Page number (0-indexed)
     * @param size        Page size (max 50)
     * @param currentUser Authenticated user
     * @return Paginated list of following users
     */
    @GetMapping("/{userId}/following")
    @Operation(summary = "Get users that user is following", description = "Returns paginated list of users that this user follows", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Following list retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<PagedResponse<UserFollowDto>>> getFollowing(
            @Parameter(description = "User ID", required = true) @PathVariable Long userId,
            @Parameter(description = "Page number (0-indexed)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)", example = "20") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Validate page size
        if (size > 50)
            size = 50;
        if (size < 1)
            size = 20;
        if (page < 0)
            page = 0;

        log.info("GET /api/users/{}/following - requesterId: {}, page: {}, size: {}",
                userId, currentUser.getId(), page, size);

        List<UserFollowDto> following = followService.getFollowing(userId);

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, following.size());
        List<UserFollowDto> pagedFollowing = start < following.size()
                ? following.subList(start, end)
                : List.of();

        PagedResponse<UserFollowDto> pagedResponse = PagedResponse.of(
                pagedFollowing, page, size, following.size());

        log.info("Following retrieved - userId: {}, followingCount: {}, page: {}",
                userId, following.size(), page);
        return ResponseEntity.ok(ApiResponse.success(pagedResponse));
    }
}
