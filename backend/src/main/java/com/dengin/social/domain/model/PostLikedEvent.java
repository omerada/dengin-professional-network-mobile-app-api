package com.dengin.social.domain.model;

import com.dengin.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: Post Liked
 * 
 * Published when a user likes a post.
 */
@Getter
public class PostLikedEvent implements DomainEvent {
    
    private final Long postDatabaseId;
    private final PostId postId;
    private final Long userId;
    private final Long postAuthorId;
    private final LocalDateTime occurredOn;
    
    public PostLikedEvent(Long postDatabaseId, PostId postId, Long userId, Long postAuthorId) {
        this.postDatabaseId = postDatabaseId;
        this.postId = postId;
        this.userId = userId;
        this.postAuthorId = postAuthorId;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return postDatabaseId;
    }
}
