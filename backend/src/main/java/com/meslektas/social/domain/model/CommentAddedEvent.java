package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: Comment Added
 * 
 * Published when a user adds a comment to a post.
 */
@Getter
public class CommentAddedEvent implements DomainEvent {
    
    private final Long postDatabaseId;
    private final PostId postId;
    private final CommentId commentId;
    private final Long commenterId;
    private final Long postAuthorId;
    private final String content;
    private final LocalDateTime occurredOn;
    
    public CommentAddedEvent(
        Long postDatabaseId,
        PostId postId,
        CommentId commentId,
        Long commenterId,
        Long postAuthorId,
        String content
    ) {
        this.postDatabaseId = postDatabaseId;
        this.postId = postId;
        this.commentId = commentId;
        this.commenterId = commenterId;
        this.postAuthorId = postAuthorId;
        this.content = content;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return postDatabaseId;
    }
}
