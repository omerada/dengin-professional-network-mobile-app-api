package com.meslektas.social.presentation.controller;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import com.meslektas.social.application.command.AddCommentCommand;
import com.meslektas.social.application.command.DeleteCommentCommand;
import com.meslektas.social.application.dto.CommentListResponse;
import com.meslektas.social.application.dto.CommentResponse;
import com.meslektas.social.application.query.GetPostCommentsQuery;
import com.meslektas.social.application.service.CommentService;
import com.meslektas.social.domain.model.CommentId;
import com.meslektas.social.domain.model.PostId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for Comment operations.
 * 
 * <p>Provides endpoints for:
 * <ul>
 *   <li>Adding comments to posts</li>
 *   <li>Retrieving paginated comments for a post</li>
 *   <li>Deleting comments</li>
 * </ul>
 * 
 * <p>Rate Limits (as per Sprint documentation):
 * <ul>
 *   <li>Add comment: 30 comments per hour per user</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Comments", description = "Comment management API")
public class CommentController {

    private final CommentService commentService;

    /**
     * Add a comment to a post.
     * 
     * <p>Business Rules:
     * <ul>
     *   <li>Only verified users can comment</li>
     *   <li>Comment content: 1-500 characters</li>
     *   <li>Post must exist and not be deleted</li>
     * </ul>
     * 
     * @param postId the post ID
     * @param request the comment request
     * @param currentUser the authenticated user
     * @return the created comment
     */
    @PostMapping("/{postId}/comments")
    @Operation(
        summary = "Add comment to post",
        description = "Adds a new comment to the specified post. Only verified users can comment."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comment added successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or content"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User not verified"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Post not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Rate limit exceeded (30 comments/hour)")
    })
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
        @Parameter(description = "Post ID", required = true)
        @PathVariable String postId,
        @Valid @RequestBody AddCommentRequest request,
        @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        log.info("Adding comment to post: {} by user: {}", postId, currentUser.getId());

        AddCommentCommand command = new AddCommentCommand(
            PostId.of(UUID.fromString(postId)),
            currentUser.getId(),
            request.content()
        );

        CommentResponse response = commentService.addComment(command);

        return ResponseEntity.ok(
            ApiResponse.success("Comment added successfully", response)
        );
    }

    /**
     * Get paginated comments for a post.
     * 
     * <p>Comments are sorted chronologically (oldest first) to show conversation flow.
     * 
     * @param postId the post ID
     * @param page the page number (default: 0)
     * @param size the page size (default: 20, max: 100)
     * @param currentUser the authenticated user
     * @return paginated list of comments
     */
    @GetMapping("/{postId}/comments")
    @Operation(
        summary = "Get post comments",
        description = "Retrieves paginated comments for a post, sorted chronologically (oldest first)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Post not found")
    })
    public ResponseEntity<ApiResponse<CommentListResponse>> getPostComments(
        @Parameter(description = "Post ID", required = true)
        @PathVariable String postId,
        @Parameter(description = "Page number (0-based)")
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @Parameter(description = "Page size (1-100)")
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
        @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        log.info("Getting comments for post: {}, page: {}, size: {}", postId, page, size);

        GetPostCommentsQuery query = new GetPostCommentsQuery(
            PostId.of(UUID.fromString(postId)),
            currentUser.getId(),
            page,
            size
        );

        CommentListResponse response = commentService.getPostComments(query);

        return ResponseEntity.ok(
            ApiResponse.success("Comments retrieved successfully", response)
        );
    }

    /**
     * Delete a comment.
     * 
     * <p>Business Rules:
     * <ul>
     *   <li>Comment author can delete their own comments</li>
     *   <li>Post author can delete any comment on their post</li>
     *   <li>Comments are soft-deleted (not physically removed)</li>
     * </ul>
     * 
     * @param postId the post ID
     * @param commentId the comment ID
     * @param currentUser the authenticated user
     * @return no content response
     */
    @DeleteMapping("/{postId}/comments/{commentId}")
    @Operation(
        summary = "Delete comment",
        description = "Deletes a comment. Only comment author or post author can delete."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User not authorized to delete this comment"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
    })
    public ResponseEntity<Void> deleteComment(
        @Parameter(description = "Post ID", required = true)
        @PathVariable String postId,
        @Parameter(description = "Comment ID", required = true)
        @PathVariable String commentId,
        @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        log.info("Deleting comment: {} from post: {} by user: {}", commentId, postId, currentUser.getId());

        DeleteCommentCommand command = new DeleteCommentCommand(
            CommentId.of(UUID.fromString(commentId)),
            currentUser.getId()
        );

        commentService.deleteComment(command);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    /**
     * Request DTO for adding a comment.
     */
    public record AddCommentRequest(
        @NotBlank(message = "Comment content cannot be empty")
        @Size(min = 1, max = 500, message = "Comment content must be between 1 and 500 characters")
        String content
    ) {}
}
