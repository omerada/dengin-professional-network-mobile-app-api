package com.meslektas.social.application.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Feed Post Response DTO
 * 
 * Lighter version for feed display with relevance score.
 */
@Getter
@Builder
public class FeedPostResponse {
    
    private Long id;
    private UUID postId;
    
    // Author info
    private AuthorDto author;
    
    // Content
    private String content;
    private List<PostImageDto> images;
    
    // Engagement
    private int likeCount;
    private int commentCount;
    private boolean liked;
    
    // Feed algorithm
    private Double relevanceScore;
    
    // Timestamp
    private LocalDateTime createdAt;
    
    @Getter
    @Builder
    public static class AuthorDto {
        private Long userId;
        private String name;
        private String surname;
        private String fullName;
        private String profileImageUrl;
        private Long professionId;
        private String professionName;
        private boolean verified;
    }
}
