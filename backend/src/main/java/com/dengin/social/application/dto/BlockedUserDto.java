package com.dengin.social.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Blocked User DTO
 * 
 * Contains information about a blocked user
 * Used in block list responses
 * 
 * Sprint 7-8: User Safety & Moderation
 */
@Schema(description = "Blocked user information")
@Builder
public record BlockedUserDto(
        @Schema(description = "User ID", example = "123") Long userId,

        @Schema(description = "User's first name", example = "Ahmet") String name,

        @Schema(description = "User's surname", example = "Yılmaz") String surname,

        @Schema(description = "User's avatar URL", example = "https://cdn.meslektas.com/avatars/123.jpg") String avatarUrl,

        @Schema(description = "When the user was blocked", example = "2024-01-15T10:30:00") LocalDateTime blockedAt,

        @Schema(description = "Reason for blocking (optional)", example = "Spam messages") String reason) {
    /**
     * Get full display name
     */
    public String getFullName() {
        return name + " " + surname;
    }
}
