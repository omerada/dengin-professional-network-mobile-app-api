package com.meslektas.social.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Follow DTO for follower/following lists
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFollowDto {
    
    private Long userId;
    private String fullName;
    private String profileImageUrl;
    private Long professionId;
    private String professionName;
    private boolean verified;
    private long followerCount;
    private long followingCount;
}
