package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: User Followed
 * 
 * Published when a user follows another user.
 */
@Getter
public class UserFollowedEvent implements DomainEvent {
    
    private final Long followDatabaseId;
    private final Long followerId;
    private final Long followingId;
    private final LocalDateTime occurredOn;
    
    public UserFollowedEvent(Long followDatabaseId, Long followerId, Long followingId) {
        this.followDatabaseId = followDatabaseId;
        this.followerId = followerId;
        this.followingId = followingId;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return followDatabaseId;
    }
}
