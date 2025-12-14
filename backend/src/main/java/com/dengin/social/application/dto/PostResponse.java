package com.dengin.social.application.dto;

import com.dengin.social.domain.model.PostStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Post Response DTO
 * 
 * Full post details with author information.
 */
@Getter
@Builder
public class PostResponse {
    
    private Long id;
    private UUID postId;
    
    // Author info
    private Long authorId;
    private String authorName;
    private String authorProfileImageUrl;
    private Long professionId;
    private String professionName;
    private boolean authorVerified;
    
    // Post content
    private String content;
    private List<PostImageDto> images;
    
    // Engagement
    private int likeCount;
    private int commentCount;
    private boolean liked; // Has current user liked this post
    
    // Status
    private PostStatus status;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
