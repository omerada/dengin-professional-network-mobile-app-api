package com.meslektas.social.application.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Comment Response DTO
 */
@Getter
@Builder
public class CommentResponse {
    
    private Long id;
    private UUID commentId;
    private Long postId;
    
    // Commenter info
    private Long commenterId;
    private String commenterName;
    private String commenterProfileImageUrl;
    private Long professionId;
    private String professionName;
    private boolean verified;
    
    // Content
    private String content;
    
    // Timestamp
    private LocalDateTime createdAt;
}
