package com.dengin.messaging.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.common.storage.S3PresignedUrlService;
import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.messaging.application.command.DeleteMessageCommand;
import com.dengin.messaging.application.command.MarkMessagesReadCommand;
import com.dengin.messaging.application.command.SendMessageCommand;
import com.dengin.messaging.application.dto.*;
import com.meslektas.messaging.application.dto.*;
import com.dengin.messaging.application.query.GetConversationsQuery;
import com.dengin.messaging.application.query.GetMessagesQuery;
import com.dengin.messaging.application.query.SearchMessagesQuery;
import com.dengin.messaging.application.service.ConversationService;
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

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Messaging REST Controller
 * 
 * Endpoints:
 * - GET /api/conversations - Get user's conversations
 * - GET /api/conversations/{conversationId}/messages - Get messages in
 * conversation
 * - POST /api/messages - Send a new message
 * - PUT /api/conversations/{conversationId}/read - Mark messages as read
 * - DELETE /api/messages/{messageId} - Delete a message
 * - GET /api/conversations/unread-count - Get total unread count
 * - POST /api/messages/attachments/upload-url - Get presigned URL for
 * attachment upload
 * - GET /api/messages/search - Search messages
 * 
 * Security:
 * - All endpoints require authentication (Bearer JWT)
 * - Only verified users can send messages
 * - Users can only access their own conversations
 * 
 * Business Rules:
 * - Message content: 1-2000 characters
 * - Max 1 attachment per message (10MB max, images only)
 * - 1-to-1 conversations only
 * - Cannot message blocked users
 * 
 * Sprint 7-8 Implementation
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Messaging", description = "Direct messaging endpoints")
public class ConversationController {

    private static final long MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

    private final ConversationService conversationService;
    private final S3PresignedUrlService s3PresignedUrlService;

    // ============================================
    // CONVERSATION ENDPOINTS
    // ============================================

    /**
     * GET /api/conversations
     * Get user's conversations with pagination
     */
    @GetMapping("/conversations")
    @Operation(summary = "Get conversations", description = "Returns user's conversations sorted by most recent message. Includes last message preview and unread count.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Conversations retrieved successfully", content = @Content(schema = @Schema(implementation = ConversationListResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    public ResponseEntity<ApiResponse<ConversationListResponse>> getConversations(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("GET /api/conversations - userId: {}, page: {}, size: {}", userId, page, size);

        GetConversationsQuery query = GetConversationsQuery.builder()
                .page(page)
                .size(size)
                .build();

        ConversationListResponse response = conversationService.getConversations(query, userId);

        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", response));
    }

    /**
     * GET /api/conversations/{conversationId}/messages
     * Get messages in a conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    @Operation(summary = "Get messages in conversation", description = "Returns messages in a conversation with pagination. Oldest messages first for chat view.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Messages retrieved successfully", content = @Content(schema = @Schema(implementation = MessageListResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a participant"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Conversation not found")
    })
    public ResponseEntity<ApiResponse<MessageListResponse>> getMessages(
            @Parameter(description = "Conversation ID") @PathVariable UUID conversationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 100)") @RequestParam(defaultValue = "30") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("GET /api/conversations/{}/messages - userId: {}", conversationId, userId);

        GetMessagesQuery query = GetMessagesQuery.builder()
                .conversationId(conversationId)
                .page(page)
                .size(size)
                .build();

        MessageListResponse response = conversationService.getMessages(query, userId);

        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", response));
    }

    /**
     * GET /api/conversations/unread-count
     * Get total unread message count
     */
    @GetMapping("/conversations/unread-count")
    @Operation(summary = "Get total unread count", description = "Returns the total number of unread messages across all conversations.", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<Integer>> getTotalUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        int unreadCount = conversationService.getTotalUnreadCount(userId);

        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", unreadCount));
    }

    /**
     * GET /api/messages/search
     * Search messages across all conversations
     */
    @GetMapping("/messages/search")
    @Operation(summary = "Search messages", description = "Full-text search across all user's messages. Results are ranked by relevance.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search completed successfully", content = @Content(schema = @Schema(implementation = MessageSearchResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid search query"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    public ResponseEntity<ApiResponse<MessageSearchResponse>> searchMessages(
            @Parameter(description = "Search query", required = true) @RequestParam String q,
            @Parameter(description = "Filter by conversation ID") @RequestParam(required = false) UUID conversationId,
            @Parameter(description = "Filter messages sent after this date (ISO 8601)") @RequestParam(required = false) LocalDateTime fromDate,
            @Parameter(description = "Filter messages sent before this date (ISO 8601)") @RequestParam(required = false) LocalDateTime toDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 100)") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("GET /api/messages/search - userId: {}, query: {}", userId, q);

        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Search query cannot be empty"));
        }

        SearchMessagesQuery query = SearchMessagesQuery.builder()
                .searchQuery(q.trim())
                .conversationId(conversationId)
                .fromDate(fromDate)
                .toDate(toDate)
                .page(page)
                .size(Math.min(size, 100))
                .build();

        MessageSearchResponse response = conversationService.searchMessages(query, userId);

        log.debug("Search returned {} results", response.getTotalResults());

        return ResponseEntity.ok(ApiResponse.success("Search completed", response));
    }

    // ============================================
    // MESSAGE ENDPOINTS
    // ============================================

    /**
     * POST /api/messages
     * Send a new message
     */
    @PostMapping("/messages")
    @Operation(summary = "Send a message", description = "Sends a message to another user. Creates conversation if not exists. Only verified users can send messages.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Message sent successfully", content = @Content(schema = @Schema(implementation = SendMessageResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request (empty content, content too long)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User not verified or blocked"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Recipient not found")
    })
    public ResponseEntity<ApiResponse<SendMessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("POST /api/messages - userId: {}, recipientId: {}", userId, request.getRecipientId());

        SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .attachment(request.getAttachment() != null ? SendMessageCommand.AttachmentData.builder()
                        .s3Key(request.getAttachment().getS3Key())
                        .url(request.getAttachment().getUrl())
                        .contentType(request.getAttachment().getContentType())
                        .fileSize(request.getAttachment().getFileSize())
                        .fileName(request.getAttachment().getFileName())
                        .build() : null)
                .build();

        SendMessageResponse response = conversationService.sendMessage(command, userId);

        log.info("Message sent: messageId={}, conversationId={}",
                response.getMessageId(), response.getConversationId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent successfully", response));
    }

    /**
     * PUT /api/conversations/{conversationId}/read
     * Mark messages as read
     */
    @PutMapping("/conversations/{conversationId}/read")
    @Operation(summary = "Mark messages as read", description = "Marks all unread messages in a conversation as read.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Messages marked as read"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not a participant"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Conversation not found")
    })
    public ResponseEntity<ApiResponse<Void>> markMessagesAsRead(
            @Parameter(description = "Conversation ID") @PathVariable UUID conversationId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("PUT /api/conversations/{}/read - userId: {}", conversationId, userId);

        MarkMessagesReadCommand command = MarkMessagesReadCommand.builder()
                .conversationId(conversationId)
                .build();

        conversationService.markMessagesAsRead(command, userId);

        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    /**
     * DELETE /api/messages/{messageId}
     * Delete a message
     */
    @DeleteMapping("/conversations/{conversationId}/messages/{messageId}")
    @Operation(summary = "Delete a message", description = "Soft-deletes a message. Only the sender can delete their message.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Message deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - User is not the sender"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Message not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @Parameter(description = "Conversation ID") @PathVariable UUID conversationId,
            @Parameter(description = "Message ID") @PathVariable UUID messageId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("DELETE /api/conversations/{}/messages/{} - userId: {}", conversationId, messageId, userId);

        DeleteMessageCommand command = DeleteMessageCommand.builder()
                .conversationId(conversationId)
                .messageId(messageId)
                .build();

        conversationService.deleteMessage(command, userId);

        return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", null));
    }

    // ============================================
    // ATTACHMENT ENDPOINTS
    // ============================================

    /**
     * POST /api/messages/attachments/upload-url
     * Get presigned URL for uploading message attachment
     */
    @PostMapping("/messages/attachments/upload-url")
    @Operation(summary = "Get presigned upload URL", description = "Generates a presigned S3 URL for direct client-side upload of message attachments. "
            +
            "Only image files (JPEG, PNG, GIF, WebP) up to 10MB are allowed.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Presigned URL generated successfully", content = @Content(schema = @Schema(implementation = AttachmentUploadResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request (file too large, unsupported format)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    public ResponseEntity<ApiResponse<AttachmentUploadResponse>> getAttachmentUploadUrl(
            @Valid @RequestBody AttachmentUploadRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("POST /api/messages/attachments/upload-url - userId: {}, fileName: {}",
                userId, request.getFileName());

        // Validate file size
        if (request.getFileSize() > MAX_ATTACHMENT_SIZE) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File size exceeds maximum allowed (10MB)"));
        }

        // Generate presigned URL
        S3PresignedUrlService.PresignedUploadUrl presignedUrl = s3PresignedUrlService.generateUploadUrl(
                request.getConversationId(),
                request.getFileName(),
                request.getContentType());

        AttachmentUploadResponse response = AttachmentUploadResponse.builder()
                .uploadUrl(presignedUrl.getUploadUrl())
                .s3Key(presignedUrl.getS3Key())
                .expiresIn(presignedUrl.getExpiresIn())
                .instructions(AttachmentUploadResponse.UploadInstructions.builder()
                        .method("PUT")
                        .contentType(request.getContentType())
                        .maxFileSize(MAX_ATTACHMENT_SIZE)
                        .build())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Upload URL generated", response));
    }
}
