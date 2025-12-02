package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: Post Unliked
 * 
 * Published when a user unlikes a post.
 */
@Getter
public class PostUnlikedEvent implements DomainEvent {
    
    private final Long postDatabaseId;
    private final PostId postId;
    private final Long userId;
    private final LocalDateTime occurredOn;
    
    public PostUnlikedEvent(Long postDatabaseId, PostId postId, Long userId) {
        this.postDatabaseId = postDatabaseId;
        this.postId = postId;
        this.userId = userId;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return postDatabaseId;
    }
}
