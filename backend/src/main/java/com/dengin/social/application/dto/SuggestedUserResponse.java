package com.dengin.social.application.dto;

import com.dengin.identity.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Suggested User Response DTO
 * 
 * API response for user recommendation algorithm.
 * Maps to mobile SuggestedExpert type.
 * 
 * Mobile App Usage:
 * - SuggestedExpertsCarousel component
 * - NoFollowingEmptyState component
 * - FeedScreen suggested experts
 * 
 * Replaces:
 * - mockExperts.ts (MOCK_SUGGESTED_EXPERTS)
 * - NoFollowingEmptyState.types.ts (MOCK_SUGGESTED_EXPERTS)
 * 
 * Example Response:
 * ```json
 * {
 *   "id": 123,
 *   "fullName": "Dr. Ayşe Yılmaz",
 *   "profession": "Kardiyolog",
 *   "avatarUrl": "https://cdn.meslektas.com/avatars/123.jpg",
 *   "isVerified": true,
 *   "isFollowing": false,
 *   "followerCount": 1250
 * }
 * ```
 * 
 * @see User
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedUserResponse {
    
    /**
     * User ID
     */
    private Long id;
    
    /**
     * Full name (name + surname)
     */
    private String fullName;
    
    /**
     * Profession name in Turkish
     */
    private String profession;
    
    /**
     * Profile avatar URL (CloudFront or S3)
     */
    private String avatarUrl;
    
    /**
     * Whether user is profession verified
     */
    private boolean isVerified;
    
    /**
     * Whether current user follows this suggested user
     * Always false for new suggestions
     */
    private boolean isFollowing;
    
    /**
     * Number of followers this user has
     */
    private long followerCount;
    
    /**
     * Optional: Relevance score (0.0 - 1.0)
     * Not sent to mobile by default
     */
    private Double relevanceScore;
}
