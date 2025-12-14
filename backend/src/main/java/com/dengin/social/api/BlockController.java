package com.dengin.social.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.social.application.dto.BlockResponse;
import com.dengin.social.application.dto.BlockedUserDto;
import com.dengin.social.application.service.BlockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Block REST Controller
 * 
 * Endpoints:
 * - POST /api/users/{userId}/block - Block a user
 * - DELETE /api/users/{userId}/block - Unblock a user
 * - GET /api/users/me/blocked - Get blocked users list
 * - GET /api/users/{userId}/block/status - Check block status
 * 
 * Security:
 * - All endpoints require authentication (Bearer JWT)
 * 
 * Business Rules:
 * - Can't block yourself
 * - Blocking removes mutual follow relationships
 * - Blocked users can't see blocker's content
 * - Blocked users can't send messages
 * 
 * Rate Limiting:
 * - Block/unblock: 30 actions per hour per user
 * 
 * Sprint 7-8: User Safety & Moderation
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Block", description = "User blocking management endpoints")
public class BlockController {

    private final BlockService blockService;

    /**
     * POST /api/users/{userId}/block
     * Block a user
     * 
     * @param userId      User ID to block
     * @param request     Optional block reason
     * @param currentUser Authenticated user
     * @return BlockResponse with updated status
     */
    @PostMapping("/{userId}/block")
    @Operation(summary = "Block a user", description = "Blocks another user. Removes mutual follow relationships. Blocked users cannot see blocker's content or send messages.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User blocked successfully", content = @Content(schema = @Schema(implementation = BlockResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request - Can't block self"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Too many requests - Rate limit exceeded")
    })
    public ResponseEntity<ApiResponse<BlockResponse>> blockUser(
            @Parameter(description = "User ID to block", required = true) @PathVariable Long userId,
            @Valid @RequestBody(required = false) BlockRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long blockerId = currentUser.getId();
        String reason = request != null ? request.reason() : null;

        log.info("POST /api/users/{}/block - blockerId: {}", userId, blockerId);

        BlockResponse response = blockService.blockUser(blockerId, userId, reason);

        log.info("User blocked - blockerId: {}, blockedId: {}", blockerId, userId);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    /**
     * DELETE /api/users/{userId}/block
     * Unblock a user
     * 
     * @param userId      User ID to unblock
     * @param currentUser Authenticated user
     * @return BlockResponse with updated status
     */
    @DeleteMapping("/{userId}/block")
    @Operation(summary = "Unblock a user", description = "Removes block on a user. Does not restore previous follow relationships.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User unblocked successfully", content = @Content(schema = @Schema(implementation = BlockResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BlockResponse>> unblockUser(
            @Parameter(description = "User ID to unblock", required = true) @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long blockerId = currentUser.getId();

        log.info("DELETE /api/users/{}/block - blockerId: {}", userId, blockerId);

        BlockResponse response = blockService.unblockUser(blockerId, userId);

        log.info("User unblocked - blockerId: {}, blockedId: {}", blockerId, userId);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    /**
     * GET /api/users/me/blocked
     * Get list of users blocked by current user
     * 
     * @param currentUser Authenticated user
     * @return List of blocked users
     */
    @GetMapping("/me/blocked")
    @Operation(summary = "Get blocked users list", description = "Returns list of all users blocked by the current user", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Blocked users retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<List<BlockedUserDto>>> getBlockedUsers(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();

        log.info("GET /api/users/me/blocked - userId: {}", userId);

        List<BlockedUserDto> blockedUsers = blockService.getBlockedUsers(userId);

        log.info("Blocked users retrieved - userId: {}, count: {}", userId, blockedUsers.size());
        return ResponseEntity.ok(ApiResponse.success(blockedUsers));
    }

    /**
     * GET /api/users/{userId}/block/status
     * Check if current user has blocked given user
     * 
     * @param userId      User ID to check
     * @param currentUser Authenticated user
     * @return Block status
     */
    @GetMapping("/{userId}/block/status")
    @Operation(summary = "Check block status", description = "Checks if the current user has blocked the specified user", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Block status retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BlockStatusResponse>> getBlockStatus(
            @Parameter(description = "User ID to check", required = true) @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long blockerId = currentUser.getId();

        boolean isBlocked = blockService.isBlocked(blockerId, userId);
        boolean isBlockedBy = blockService.isBlocked(userId, blockerId);
        boolean hasAnyBlock = blockService.hasBlockBetween(blockerId, userId);

        BlockStatusResponse response = new BlockStatusResponse(
                userId, isBlocked, isBlockedBy, hasAnyBlock);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== Request/Response DTOs ====================

    /**
     * Block request with optional reason
     */
    public record BlockRequest(
            @Size(max = 500, message = "Reason cannot exceed 500 characters") String reason) {
    }

    /**
     * Block status response
     */
    public record BlockStatusResponse(
            Long userId,
            boolean blocked,
            boolean blockedBy,
            boolean hasAnyBlock) {
    }
}
