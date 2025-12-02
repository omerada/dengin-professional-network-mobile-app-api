package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: Post Created
 * 
 * Published when a new post is created.
 * Triggers:
 * - Feed cache invalidation for author's followers
 * - Notification to followers (future)
 * - Content moderation check (future)
 */
@Getter
public class PostCreatedEvent implements DomainEvent {
    
    private final Long postDatabaseId;
    private final PostId postId;
    private final Long authorId;
    private final Long professionId;
    private final String content;
    private final int imageCount;
    private final LocalDateTime occurredOn;
    
    public PostCreatedEvent(
        Long postDatabaseId,
        PostId postId,
        Long authorId,
        Long professionId,
        String content,
        int imageCount
    ) {
        this.postDatabaseId = postDatabaseId;
        this.postId = postId;
        this.authorId = authorId;
        this.professionId = professionId;
        this.content = content;
        this.imageCount = imageCount;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return postDatabaseId;
    }
}
