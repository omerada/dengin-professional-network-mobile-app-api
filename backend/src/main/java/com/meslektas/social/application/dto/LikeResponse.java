package com.meslektas.social.application.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Like/Unlike Response DTO
 */
@Getter
@Builder
public class LikeResponse {
    
    private UUID postId;
    private boolean liked;
    private int likeCount;
}
