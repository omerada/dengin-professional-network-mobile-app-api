package com.dengin.social.application.service;

import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.social.application.dto.FeedPostResponse;
import com.dengin.social.application.dto.PostImageDto;
import com.dengin.social.domain.model.Post;
import com.dengin.social.domain.repository.FollowRepository;
import com.dengin.social.domain.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Feed Service - Generates personalized feed with relevance scoring
 * 
 * Feed Algorithm:
 * Relevance Score = Time(40%) + Engagement(30%) + Author(20%) + Content(10%)
 * 
 * Time Score:
 * - < 24h: 100
 * - 1-3d: 75
 * - 3-7d: 50
 * - > 7d: 25
 * 
 * Engagement Score:
 * - (likes × 2) + (comments × 5)
 * - Cap at 100
 * 
 * Author Score:
 * - Following: 100
 * - Same profession: 75
 * - Different: 50
 * 
 * Content Score:
 * - Has images: +20
 * - Length > 200: +10
 * - Base: 70
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {

    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    // Scoring weights
    private static final double TIME_WEIGHT = 0.40;
    private static final double ENGAGEMENT_WEIGHT = 0.30;
    private static final double AUTHOR_WEIGHT = 0.20;
    private static final double CONTENT_WEIGHT = 0.10;

    /**
     * Generate personalized feed for user
     * 
     * @param userId           Current user ID
     * @param professionFilter Optional profession filter
     * @param limit            Max posts to return
     * @param beforeId         Optional cursor - get posts before this ID
     */
    @Transactional(readOnly = true)
    public List<FeedPostResponse> getFeed(Long userId, Long professionFilter, int limit, Long beforeId) {
        log.debug("Generating feed for user {} with profession filter {} limit {} beforeId {}",
                userId, professionFilter, limit, beforeId);

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Get followed user IDs
        Set<Long> followedUserIds = followRepository.getFollowingIds(userId);

        // Get recent posts (last 7 days)
        LocalDateTime since = LocalDateTime.now().minusDays(7);

        // Use cursor-based query if beforeId is provided, otherwise use standard query
        List<Post> posts;
        if (beforeId != null) {
            posts = postRepository.findPostsForFeedWithCursor(
                    new java.util.ArrayList<>(followedUserIds),
                    professionFilter,
                    since,
                    limit * 2, // Fetch more to ensure enough after scoring
                    beforeId);
        } else {
            posts = postRepository.findPostsForFeed(
                    new java.util.ArrayList<>(followedUserIds),
                    professionFilter,
                    since,
                    limit * 2 // Fetch more to ensure enough after scoring
            );
        }

        // Calculate relevance scores and map to DTOs
        List<FeedPostResponse> feedPosts = posts.stream()
                .map(post -> {
                    User author = userRepository.findById(post.getAuthorId())
                            .orElse(null);

                    if (author == null) {
                        return null;
                    }

                    double relevanceScore = calculateRelevanceScore(
                            post,
                            author,
                            currentUser,
                            followedUserIds);

                    boolean liked = post.isLikedBy(userId);

                    return mapToFeedResponse(post, author, liked, relevanceScore);
                })
                .filter(post -> post != null)
                .sorted((p1, p2) -> Double.compare(p2.getRelevanceScore(), p1.getRelevanceScore()))
                .limit(limit)
                .collect(Collectors.toList());

        log.debug("Generated feed with {} posts", feedPosts.size());

        return feedPosts;
    }

    /**
     * Get trending posts (high engagement, recent)
     */
    @Transactional(readOnly = true)
    public List<FeedPostResponse> getTrendingPosts(Long userId, int limit) {
        log.debug("Getting trending posts, limit {}", limit);

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Set<Long> followedUserIds = followRepository.getFollowingIds(userId);

        LocalDateTime since = LocalDateTime.now().minusDays(3); // Last 3 days

        List<Post> posts = postRepository.findTrendingPosts(since, limit * 2);

        return posts.stream()
                .map(post -> {
                    User author = userRepository.findById(post.getAuthorId())
                            .orElse(null);

                    if (author == null) {
                        return null;
                    }

                    double relevanceScore = calculateRelevanceScore(
                            post,
                            author,
                            currentUser,
                            followedUserIds);

                    boolean liked = post.isLikedBy(userId);

                    return mapToFeedResponse(post, author, liked, relevanceScore);
                })
                .filter(post -> post != null)
                .sorted((p1, p2) -> Double.compare(p2.getRelevanceScore(), p1.getRelevanceScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calculate relevance score for post
     * 
     * Formula: Time(40%) + Engagement(30%) + Author(20%) + Content(10%)
     */
    private double calculateRelevanceScore(
            Post post,
            User author,
            User currentUser,
            Set<Long> followedUserIds) {
        double timeScore = calculateTimeScore(post);
        double engagementScore = calculateEngagementScore(post);
        double authorScore = calculateAuthorScore(author, currentUser, followedUserIds);
        double contentScore = calculateContentScore(post);

        double totalScore = (timeScore * TIME_WEIGHT) +
                (engagementScore * ENGAGEMENT_WEIGHT) +
                (authorScore * AUTHOR_WEIGHT) +
                (contentScore * CONTENT_WEIGHT);

        log.trace("Post {} scores - Time: {}, Engagement: {}, Author: {}, Content: {}, Total: {}",
                post.getPostId(), timeScore, engagementScore, authorScore, contentScore, totalScore);

        return totalScore;
    }

    /**
     * Calculate time score based on post age
     * 
     * < 24h: 100
     * 1-3d: 75
     * 3-7d: 50
     * > 7d: 25
     */
    private double calculateTimeScore(Post post) {
        long ageInHours = post.getAgeInHours();

        if (ageInHours < 24) {
            return 100.0;
        } else if (ageInHours < 72) { // 3 days
            return 75.0;
        } else if (ageInHours < 168) { // 7 days
            return 50.0;
        } else {
            return 25.0;
        }
    }

    /**
     * Calculate engagement score
     * 
     * (likes × 2) + (comments × 5), capped at 100
     */
    private double calculateEngagementScore(Post post) {
        int score = (post.getLikeCount() * 2) + (post.getCommentCount() * 5);
        return Math.min(score, 100.0);
    }

    /**
     * Calculate author score based on relationship
     * 
     * Following: 100
     * Same profession: 75
     * Different: 50
     */
    private double calculateAuthorScore(
            User author,
            User currentUser,
            Set<Long> followedUserIds) {
        // Is following
        if (followedUserIds.contains(author.getId())) {
            return 100.0;
        }

        // Same profession (null-safe)
        if (author.getProfession() != null && 
            currentUser.getProfession() != null && 
            author.getProfession().getId().equals(currentUser.getProfession().getId())) {
            return 75.0;
        }

        // Different
        return 50.0;
    }

    /**
     * Calculate content score
     * 
     * Base: 70
     * Has images: +20
     * Length > 200: +10
     */
    private double calculateContentScore(Post post) {
        double score = 70.0;

        if (!post.getImages().isEmpty()) {
            score += 20.0;
        }

        if (post.getContent().getValue().length() > 200) {
            score += 10.0;
        }

        return score;
    }

    /**
     * Map post to feed response
     */
    private FeedPostResponse mapToFeedResponse(
            Post post,
            User author,
            boolean liked,
            double relevanceScore) {
        // Null-safe profession extraction
        Long professionId = author.getProfession() != null ? author.getProfession().getId() : null;
        String professionName = author.getProfession() != null ? author.getProfession().getName() : null;
        
        return FeedPostResponse.builder()
                .id(post.getId())
                .postId(post.getPostId().getValue())
                .author(FeedPostResponse.AuthorDto.builder()
                        .userId(author.getId())
                        .fullName(author.getFullName())
                        .profileImageUrl(author.getProfileImageUrl())
                        .professionId(professionId)
                        .professionName(professionName)
                        .verified(author.isVerified())
                        .build())
                .content(post.getContent().getValue())
                .images(post.getImages().stream()
                        .map(img -> PostImageDto.builder()
                                .s3Key(img.getS3Key())
                                .url(img.getUrl())
                                .width(img.getWidth())
                                .height(img.getHeight())
                                .fileSize(img.getFileSize())
                                .build())
                        .collect(Collectors.toList()))
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .liked(liked)
                .relevanceScore(relevanceScore)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
