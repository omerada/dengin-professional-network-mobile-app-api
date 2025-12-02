package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: Post Deleted
 * 
 * Published when a post is deleted by author.
 */
@Getter
public class PostDeletedEvent implements DomainEvent {
    
    private final Long postDatabaseId;
    private final PostId postId;
    private final Long authorId;
    private final LocalDateTime occurredOn;
    
    public PostDeletedEvent(Long postDatabaseId, PostId postId, Long authorId) {
        this.postDatabaseId = postDatabaseId;
        this.postId = postId;
        this.authorId = authorId;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return postDatabaseId;
    }
}
