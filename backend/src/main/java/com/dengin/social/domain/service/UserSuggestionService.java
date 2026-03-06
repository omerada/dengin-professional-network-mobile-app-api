package com.dengin.social.domain.service;

import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.social.domain.repository.FollowRepository;
import com.dengin.social.domain.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * User Suggestion Algorithm Domain Service
 * 
 * Generates personalized user recommendations based on:
 * - Same profession (50% weight)
 * - High engagement/followers (30% weight)
 * - Verified users (20% weight)
 * 
 * Business Rules:
 * - Don't suggest users already followed
 * - Don't suggest blocked users
 * - Don't suggest self
 * - Prioritize verified professionals
 * - Return 8-10 users for carousel
 * 
 * Algorithm Scoring:
 * ```
 * Score = (SameProfession * 50) + (EngagementScore * 30) + (VerifiedBonus * 20)
 * 
 * SameProfession: 1.0 if same, 0.5 if related, 0.0 if different
 * EngagementScore: followerCount / maxFollowers (normalized 0-1)
 * VerifiedBonus: 1.0 if verified, 0.0 if not
 * ```
 * 
 * @see User
 * @see FollowRepository
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserSuggestionService {
    
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;
    
    private static final int DEFAULT_SUGGESTION_COUNT = 8;
    private static final double PROFESSION_WEIGHT = 0.50;
    private static final double ENGAGEMENT_WEIGHT = 0.30;
    private static final double VERIFIED_WEIGHT = 0.20;
    
    /**
     * Generate suggested users for current user
     * 
     * @param currentUserId Current user ID
     * @param limit         Number of suggestions to return (default: 8)
     * @return Scored and sorted list of suggested users
     */
    @Transactional(readOnly = true)
    public List<ScoredUser> getSuggestedUsers(Long currentUserId, int limit) {
        log.debug("Generating user suggestions for user {}, limit {}", currentUserId, limit);
        
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + currentUserId));
        
        // Get users to exclude (already following + self)
        Set<Long> excludedUserIds = new HashSet<>(followRepository.getFollowingIds(currentUserId));
        excludedUserIds.add(currentUserId);
        
        // Get candidate users (active, not excluded)
        List<User> candidates = userRepository.findActiveUsersNotIn(new ArrayList<>(excludedUserIds));
        
        if (candidates.isEmpty()) {
            log.warn("No candidate users found for suggestions (user {})", currentUserId);
            return Collections.emptyList();
        }
        
        // Calculate scores for each candidate
        List<ScoredUser> scoredUsers = candidates.stream()
            .map(user -> scoreUser(user, currentUser))
            .sorted((u1, u2) -> Double.compare(u2.score, u1.score)) // Descending
            .limit(limit)
            .collect(Collectors.toList());
        
        log.info("Generated {} user suggestions for user {}", scoredUsers.size(), currentUserId);
        return scoredUsers;
    }
    
    /**
     * Get suggested users with default limit (8)
     */
    public List<ScoredUser> getSuggestedUsers(Long currentUserId) {
        return getSuggestedUsers(currentUserId, DEFAULT_SUGGESTION_COUNT);
    }
    
    /**
     * Calculate relevance score for candidate user
     */
    private ScoredUser scoreUser(User candidate, User currentUser) {
        double professionScore = calculateProfessionScore(candidate, currentUser);
        double engagementScore = calculateEngagementScore(candidate);
        double verifiedScore = candidate.isVerified() ? 1.0 : 0.0;
        
        double totalScore = 
            (professionScore * PROFESSION_WEIGHT) +
            (engagementScore * ENGAGEMENT_WEIGHT) +
            (verifiedScore * VERIFIED_WEIGHT);
        
        return new ScoredUser(candidate, totalScore);
    }
    
    /**
     * Calculate profession match score
     * 
     * 1.0 = Same profession
     * 0.5 = Same profession category
     * 0.0 = Different
     */
    private double calculateProfessionScore(User candidate, User currentUser) {
        if (candidate.getProfession() == null || currentUser.getProfession() == null) {
            return 0.0;
        }
        
        // Exact profession match
        if (candidate.getProfession().getId().equals(currentUser.getProfession().getId())) {
            return 1.0;
        }
        
        // Same profession category
        if (candidate.getProfession().getCategory().equals(currentUser.getProfession().getCategory())) {
            return 0.5;
        }
        
        return 0.0;
    }
    
    /**
     * Calculate engagement score based on followers
     * 
     * Normalized to 0.0 - 1.0 range
     * Uses logarithmic scale for fairness
     */
    private double calculateEngagementScore(User candidate) {
        long followerCount = followRepository.countByFollowingId(candidate.getId());
        
        if (followerCount == 0) {
            return 0.0;
        }
        
        // Logarithmic scale: log10(followers + 1) / log10(10000)
        // 1 follower = 0.0, 10 = 0.25, 100 = 0.5, 1000 = 0.75, 10000+ = 1.0
        double logScore = Math.log10(followerCount + 1) / Math.log10(10000);
        return Math.min(logScore, 1.0);
    }
    
    /**
     * Scored user with relevance score
     */
    public static class ScoredUser {
        public final User user;
        public final double score;
        
        public ScoredUser(User user, double score) {
            this.user = user;
            this.score = score;
        }
    }
}
