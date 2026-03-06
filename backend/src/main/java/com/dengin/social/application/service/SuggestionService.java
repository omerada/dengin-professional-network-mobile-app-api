package com.dengin.social.application.service;

import com.dengin.identity.domain.model.User;
import com.dengin.social.application.dto.SuggestedUserResponse;
import com.dengin.social.domain.repository.FollowRepository;
import com.dengin.social.domain.service.UserSuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User Suggestion Application Service
 * 
 * Orchestrates user suggestion use cases:
 * - Get suggested users for current user
 * - Map domain models to DTOs
 * - Cache management
 * 
 * Layer: Application Service (coordinates domain services)
 * Caching: 5 minutes per user (suggestions may change frequently)
 * Transaction: Read-only
 * 
 * Replaces Mobile Mocks:
 * - mockExperts.ts (MOCK_SUGGESTED_EXPERTS)
 * - NoFollowingEmptyState.types.ts (MOCK_SUGGESTED_EXPERTS)
 * 
 * @see UserSuggestionService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SuggestionService {
    
    private final UserSuggestionService userSuggestionService;
    private final FollowRepository followRepository;
    
    private static final int DEFAULT_LIMIT = 8;
    
    /**
     * Get suggested users for current user
     * 
     * @param currentUserId Current user ID
     * @param limit         Number of suggestions (default: 8)
     * @return List of suggested user responses
     */
    @Transactional(readOnly = true)
    @Cacheable(
        value = "user-suggestions",
        key = "#currentUserId + ':' + #limit",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<SuggestedUserResponse> getSuggestedUsers(Long currentUserId, int limit) {
        log.debug("Getting {} suggested users for user {}", limit, currentUserId);
        
        List<UserSuggestionService.ScoredUser> scoredUsers = 
            userSuggestionService.getSuggestedUsers(currentUserId, limit);
        
        return scoredUsers.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get suggested users with default limit (8)
     */
    public List<SuggestedUserResponse> getSuggestedUsers(Long currentUserId) {
        return getSuggestedUsers(currentUserId, DEFAULT_LIMIT);
    }
    
    /**
     * Map ScoredUser to SuggestedUserResponse DTO
     */
    private SuggestedUserResponse mapToResponse(UserSuggestionService.ScoredUser scoredUser) {
        User user = scoredUser.user;
        
        SuggestedUserResponse response = new SuggestedUserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setProfession(user.getProfession() != null ? user.getProfession().getName() : null);
        response.setAvatarUrl(user.getAvatarUrl());
        response.setVerified(user.isVerified());
        response.setFollowing(false); // Always false for new suggestions
        
        // Get follower count
        long followerCount = followRepository.countByFollowingId(user.getId());
        response.setFollowerCount(followerCount);
        
        // Optional: Include relevance score for debugging
        // response.setRelevanceScore(scoredUser.score);
        
        return response;
    }
}
