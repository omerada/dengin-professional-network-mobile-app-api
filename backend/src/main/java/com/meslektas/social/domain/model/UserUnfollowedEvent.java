package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: User Unfollowed
 * 
 * Published when a user unfollows another user.
 */
@Getter
public class UserUnfollowedEvent implements DomainEvent {
    
    private final Long followDatabaseId;
    private final Long followerId;
    private final Long followingId;
    private final LocalDateTime occurredOn;
    
    public UserUnfollowedEvent(Long followDatabaseId, Long followerId, Long followingId) {
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
