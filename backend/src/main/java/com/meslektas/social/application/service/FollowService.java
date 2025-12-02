package com.meslektas.social.application.service;

import com.meslektas.common.infrastructure.DomainEventPublisher;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.social.application.dto.FollowResponse;
import com.meslektas.social.application.dto.UserFollowDto;
import com.meslektas.social.domain.model.Follow;
import com.meslektas.social.domain.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Follow Application Service
 * 
 * Orchestrates follow-related operations:
 * - Follow user
 * - Unfollow user
 * - Get followers
 * - Get following
 * - Check following status
 * 
 * Business Rules:
 * - Users can't follow themselves
 * - Follow relationships are unique
 * - Only verified users can follow
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FollowService {
    
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher eventPublisher;
    
    /**
     * Follow user
     * 
     * Business Rule: Can't follow yourself
     */
    @Transactional
    public FollowResponse followUser(Long followerId, Long followingId) {
        log.info("User {} following user {}", followerId, followingId);
        
        // Validate follower is verified
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new IllegalArgumentException("Follower not found: " + followerId));
        
        if (!follower.isVerified()) {
            throw new IllegalStateException("Only verified users can follow others");
        }
        
        // Validate following user exists
        if (!userRepository.existsById(followingId)) {
            throw new IllegalArgumentException("User to follow not found: " + followingId);
        }
        
        // Check if already following
        boolean alreadyFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        
        if (!alreadyFollowing) {
            // Create follow relationship
            Follow follow = Follow.create(followerId, followingId);
            follow = followRepository.save(follow);
            
            // Publish event
            follow.publishCreatedEvent();
            eventPublisher.publishEvents(follow.getEvents());
            follow.clearEvents();
            
            log.info("User {} now following {}", followerId, followingId);
        } else {
            log.debug("User {} already following {}", followerId, followingId);
        }
        
        // Return follow response with counts
        long followerCount = followRepository.countByFollowingId(followingId);
        long followingCount = followRepository.countByFollowerId(followingId);
        
        return new FollowResponse(followingId, true, followerCount, followingCount);
    }
    
    /**
     * Unfollow user
     */
    @Transactional
    public FollowResponse unfollowUser(Long followerId, Long followingId) {
        log.info("User {} unfollowing user {}", followerId, followingId);
        
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
            .orElse(null);
        
        if (follow != null) {
            // Publish event before deletion
            follow.publishDeletedEvent();
            eventPublisher.publishEvents(follow.getEvents());
            
            followRepository.delete(follow);
            
            log.info("User {} unfollowed {}", followerId, followingId);
        } else {
            log.debug("Follow relationship not found, idempotent unfollow");
        }
        
        // Return follow response with updated counts
        long followerCount = followRepository.countByFollowingId(followingId);
        long followingCount = followRepository.countByFollowerId(followingId);
        
        return new FollowResponse(followingId, false, followerCount, followingCount);
    }
    
    /**
     * Get user's followers
     */
    @Transactional(readOnly = true)
    public List<UserFollowDto> getFollowers(Long userId) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        
        Set<Long> followerIds = follows.stream()
            .map(Follow::getFollowerId)
            .collect(Collectors.toSet());
        
        List<User> followers = userRepository.findAllById(new java.util.ArrayList<>(followerIds));
        
        return followers.stream()
            .map(this::mapToUserFollowDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get users followed by user
     */
    @Transactional(readOnly = true)
    public List<UserFollowDto> getFollowing(Long userId) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        
Set<Long> followingIds = follows.stream()
            .map(Follow::getFollowingId)
            .collect(Collectors.toSet());
        
        List<User> following = userRepository.findAllById(new java.util.ArrayList<>(followingIds));
        
        return following.stream()
            .map(this::mapToUserFollowDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Check if user is following another user
     */
    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    /**
     * Get follower count
     */
    @Transactional(readOnly = true)
    public long getFollowerCount(Long userId) {
        return followRepository.countByFollowingId(userId);
    }
    
    /**
     * Get following count
     */
    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }
    
    /**
     * Get follower IDs for feed generation
     */
    @Transactional(readOnly = true)
    public Set<Long> getFollowerIds(Long userId) {
        return followRepository.getFollowerIds(userId);
    }
    
    /**
     * Get following IDs for feed generation
     */
    @Transactional(readOnly = true)
    public Set<Long> getFollowingIds(Long userId) {
        return followRepository.getFollowingIds(userId);
    }
    
    // ============================================
    // MAPPING METHODS
    // ============================================
    
    private UserFollowDto mapToUserFollowDto(User user) {
        return UserFollowDto.builder()
            .userId(user.getId())
            .fullName(user.getFullName())
            .profileImageUrl(user.getProfileImageUrl())
            .professionId(user.getProfession().getId())
            .professionName(user.getProfession().getName())
            .verified(user.isVerified())
            .followerCount(followRepository.countByFollowingId(user.getId()))
            .followingCount(followRepository.countByFollowerId(user.getId()))
            .build();
    }
}
