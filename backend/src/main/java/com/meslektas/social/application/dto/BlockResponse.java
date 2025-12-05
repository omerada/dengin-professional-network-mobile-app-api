package com.meslektas.social.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Block Response DTO
 * 
 * Response for block/unblock operations
 * Contains block status and message
 * 
 * Sprint 7-8: User Safety & Moderation
 */
@Schema(description = "Block relationship response")
public record BlockResponse(
    @Schema(description = "Target user ID", example = "123")
    Long userId,
    
    @Schema(description = "Is current user blocking this user", example = "true")
    boolean blocked,
    
    @Schema(description = "Response message", example = "Kullanıcı engellendi")
    String message
) {
}
