package com.dengin.social.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.common.api.PagedResponse;
import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.social.application.dto.CreatePostRequest;
import com.dengin.social.application.dto.LikeResponse;
import com.dengin.social.application.dto.PostResponse;
import com.dengin.social.application.dto.ShareResponse;
import com.dengin.social.application.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Post REST Controller
 * 
 * Endpoints:
 * - POST /api/posts - Create new post
 * - GET /api/posts/{postId} - Get post by ID
 * - DELETE /api/posts/{postId} - Delete post (soft delete)
 * - POST /api/posts/{postId}/like - Like a post
 * - DELETE /api/posts/{postId}/like - Unlike a post
 * 
 * Security:
 * - All endpoints require authentication (Bearer JWT)
 * - Users can only delete their own posts
 * - Verified users only can create posts
 * 
 * Rate Limiting:
 * - Create post: 10 posts per hour per user
 * - Like/unlike: 100 actions per hour per user
 * 
 * Sprint 5-6 Implementation
 */
@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Social feed post management endpoints")
public class PostController {

    private final PostService postService;

    /**
     * POST /api/posts
     * Create new post
     * 
     * @param request CreatePostRequest (content + images)
     * @param currentUser Authenticated user
     * @return PostResponse
     */
    @PostMapping
    @Operation(
        summary = "Create new post",
        description = "Creates a new post in the social feed. Only verified users can create posts. Max 5 images.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Post created successfully",
            content = @Content(schema = @Schema(implementation = PostResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request data (content length, image count)"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Invalid or missing token"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - User not verified"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "429",
            description = "Too many requests - Rate limit exceeded (10 posts/hour)"
        )
    })
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("POST /api/posts - userId: {}, contentLength: {}, imageCount: {}", 
            userId, request.getContent().length(), request.getImages() != null ? request.getImages().size() : 0);
        
        PostResponse post = postService.createPost(request, userId);
        
        log.info("Post created successfully - postId: {}, userId: {}", post.getPostId(), userId);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post başarıyla oluşturuldu", post));
    }

    /**
     * GET /api/posts/{postId}
     * Get post by ID
     * 
     * @param postId Post UUID
     * @param currentUser Authenticated user
     * @return PostResponse
     */
    @GetMapping("/{postId}")
    @Operation(
        summary = "Get post by ID",
        description = "Retrieves a single post with full details including like/comment counts",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post retrieved successfully",
            content = @Content(schema = @Schema(implementation = PostResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found or deleted"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @Parameter(description = "Post UUID", required = true)
            @PathVariable String postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("GET /api/posts/{} - userId: {}", postId, userId);
        
        PostResponse post = postService.getPost(Long.parseLong(postId), userId);
        
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    /**
     * DELETE /api/posts/{postId}
     * Delete post (soft delete)
     * 
     * Security: Only post author can delete
     * 
     * @param postId Post UUID
     * @param currentUser Authenticated user
     * @return No content
     */
    @DeleteMapping("/{postId}")
    @Operation(
        summary = "Delete post",
        description = "Soft deletes a post. Only the post author can delete their own posts.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Post deleted successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - Not the post author"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<Void> deletePost(
            @Parameter(description = "Post UUID", required = true)
            @PathVariable String postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("DELETE /api/posts/{} - userId: {}", postId, userId);
        
        postService.deletePost(Long.parseLong(postId), userId);
        
        log.info("Post deleted successfully - postId: {}, userId: {}", postId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/posts/{postId}/like
     * Like a post
     * 
     * @param postId Post UUID
     * @param currentUser Authenticated user
     * @return Updated post with like status
     */
    @PostMapping("/{postId}/like")
    @Operation(
        summary = "Like a post",
        description = "Likes a post. User can only like a post once. Idempotent operation.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post liked successfully",
            content = @Content(schema = @Schema(implementation = PostResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "429",
            description = "Too many requests - Rate limit exceeded (100 likes/hour)"
        )
    })
    public ResponseEntity<ApiResponse<LikeResponse>> likePost(
            @Parameter(description = "Post UUID", required = true)
            @PathVariable String postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("POST /api/posts/{}/like - userId: {}", postId, userId);
        
        LikeResponse likeResponse = postService.likePost(Long.parseLong(postId), userId);
        
        log.info("Post liked - postId: {}, userId: {}, newLikeCount: {}", 
            postId, userId, likeResponse.getLikeCount());
        return ResponseEntity.ok(ApiResponse.success("Post beğenildi", likeResponse));
    }

    /**
     * DELETE /api/posts/{postId}/like
     * Unlike a post
     * 
     * @param postId Post UUID
     * @param currentUser Authenticated user
     * @return Updated post with like status
     */
    @DeleteMapping("/{postId}/like")
    @Operation(
        summary = "Unlike a post",
        description = "Removes like from a post. Idempotent operation.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post unliked successfully",
            content = @Content(schema = @Schema(implementation = PostResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<LikeResponse>> unlikePost(
            @Parameter(description = "Post UUID", required = true)
            @PathVariable String postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("DELETE /api/posts/{}/like - userId: {}", postId, userId);
        
        LikeResponse likeResponse = postService.unlikePost(Long.parseLong(postId), userId);
        
        log.info("Post unliked - postId: {}, userId: {}, newLikeCount: {}", 
            postId, userId, likeResponse.getLikeCount());
        return ResponseEntity.ok(ApiResponse.success("Beğeni kaldırıldı", likeResponse));
    }

    // ====================================
    // POST SAVE/BOOKMARK ENDPOINTS
    // ====================================

    /**
     * POST /api/posts/{postId}/save
     * Save/bookmark a post
     * 
     * @param postId Post ID
     * @param currentUser Authenticated user
     * @return Success response
     */
    @PostMapping("/{postId}/save")
    @Operation(
        summary = "Save a post",
        description = "Saves/bookmarks a post for later viewing. Idempotent operation.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post saved successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<Void>> savePost(
            @Parameter(description = "Post ID", required = true)
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("POST /api/posts/{}/save - userId: {}", postId, userId);
        
        postService.savePost(postId, userId);
        
        log.info("Post saved - postId: {}, userId: {}", postId, userId);
        return ResponseEntity.ok(ApiResponse.success("Post kaydedildi", null));
    }

    /**
     * DELETE /api/posts/{postId}/save
     * Unsave/remove bookmark from a post
     * 
     * @param postId Post ID
     * @param currentUser Authenticated user
     * @return Success response
     */
    @DeleteMapping("/{postId}/save")
    @Operation(
        summary = "Unsave a post",
        description = "Removes a post from saved/bookmarks. Idempotent operation.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Post unsaved successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<Void>> unsavePost(
            @Parameter(description = "Post ID", required = true)
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("DELETE /api/posts/{}/save - userId: {}", postId, userId);
        
        postService.unsavePost(postId, userId);
        
        log.info("Post unsaved - postId: {}, userId: {}", postId, userId);
        return ResponseEntity.ok(ApiResponse.success("Kayıt kaldırıldı", null));
    }

    /**
     * GET /api/posts/saved
     * Get user's saved/bookmarked posts
     * 
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param currentUser Authenticated user
     * @return Paginated list of saved posts
     */
    @GetMapping("/saved")
    @Operation(
        summary = "Get saved posts",
        description = "Retrieves user's saved/bookmarked posts with pagination.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Saved posts retrieved successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<PagedResponse<PostResponse>>> getSavedPosts(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)")
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("GET /api/posts/saved - userId: {}, page: {}, size: {}", userId, page, size);
        
        var savedPosts = postService.getSavedPosts(userId, page, Math.min(size, 50));
        
        log.info("Saved posts retrieved - userId: {}, count: {}", userId, savedPosts.getContent().size());
        return ResponseEntity.ok(ApiResponse.success(savedPosts));
    }

    /**
     * POST /api/posts/{postId}/share
     * Track post share action
     * 
     * @param postId Post ID
     * @param currentUser Authenticated user
     * @return Updated share count
     */
    @PostMapping("/{postId}/share")
    @Operation(
        summary = "Share a post",
        description = "Tracks a share action and increments share count.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Share tracked successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Post not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<ShareResponse>> sharePost(
            @Parameter(description = "Post ID", required = true)
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        log.info("POST /api/posts/{}/share - userId: {}", postId, userId);
        
        ShareResponse response = postService.sharePost(postId, userId);
        
        log.info("Post shared - postId: {}, userId: {}, shareCount: {}", postId, userId, response.getSharesCount());
        return ResponseEntity.ok(ApiResponse.success("Post paylaşıldı", response));
    }
}
