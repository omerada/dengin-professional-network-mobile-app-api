package com.dengin.identity.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User Profile Response DTO
 * 
 * Returned from:
 * - GET /api/users/{userId} - Get user profile
 * - PUT /api/users/{userId} - Update profile (returns updated profile)
 * 
 * Security Note:
 * - Sensitive fields (email, phone) may be hidden based on privacy settings
 * - Other users see limited profile based on privacy configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long userId;

    private String email; // May be hidden for other users

    private String name;

    private String surname;

    private String fullName; // Computed: name + surname

    private String bio;

    private String avatarUrl;

    private LocalDate dateOfBirth; // May be hidden

    private String gender; // May be hidden

    // Profession
    private Long professionId;

    private String professionName;

    private String professionCategory;

    private Boolean isProfessionVerified;

    private LocalDateTime professionVerifiedAt;

    // Status
    private String status; // ACTIVE, SUSPENDED, BANNED, DELETED

    private Boolean isProfileComplete;

    private Boolean isEmailVerified;

    // Timestamps
    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt; // May be hidden

    private LocalDateTime lastActiveAt; // May be hidden

    // OAuth
    private String oauthProvider; // LOCAL, GOOGLE, INSTAGRAM

    /**
     * Check if this profile belongs to the requesting user
     */
    public boolean isOwnProfile(Long requestingUserId) {
        return this.userId.equals(requestingUserId);
    }

    /**
     * Create limited profile for other users (privacy-aware)
     */
    public static UserProfileResponse createLimitedProfile(UserProfileResponse fullProfile) {
        return UserProfileResponse.builder()
                .userId(fullProfile.userId)
                .name(fullProfile.name)
                .surname(fullProfile.surname)
                .fullName(fullProfile.fullName)
                .bio(fullProfile.bio)
                .avatarUrl(fullProfile.avatarUrl)
                .professionId(fullProfile.professionId)
                .professionName(fullProfile.professionName)
                .professionCategory(fullProfile.professionCategory)
                .isProfessionVerified(fullProfile.isProfessionVerified)
                .professionVerifiedAt(fullProfile.professionVerifiedAt)
                .status(fullProfile.status)
                .oauthProvider(fullProfile.oauthProvider)
                .build();
    }
}
