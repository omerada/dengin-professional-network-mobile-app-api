package com.meslektas.social.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Response DTO for post share action
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareResponse {
    
    private Long postId;
    private int sharesCount;
    
    public static ShareResponse of(Long postId, int sharesCount) {
        return ShareResponse.builder()
                .postId(postId)
                .sharesCount(sharesCount)
                .build();
    }
}
