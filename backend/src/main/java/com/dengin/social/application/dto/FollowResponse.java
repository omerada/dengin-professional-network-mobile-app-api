package com.dengin.social.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Follow Response DTO
 * 
 * Response for follow/unfollow operations
 * Contains following status and counts
 * 
 * Sprint 5-6 Social Context
 */
@Schema(description = "Follow relationship response")
public record FollowResponse(
    @Schema(description = "Target user ID", example = "123")
    Long userId,
    
    @Schema(description = "Is current user following this user", example = "true")
    boolean following,
    
    @Schema(description = "Number of followers this user has", example = "1250")
    long followerCount,
    
    @Schema(description = "Number of users this user follows", example = "340")
    long followingCount
) {
}
