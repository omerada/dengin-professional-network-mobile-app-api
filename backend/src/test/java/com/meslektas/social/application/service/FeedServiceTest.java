package com.dengin.social.application.service;

import com.dengin.identity.domain.model.Profession;
import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.social.application.dto.FeedPostResponse;
import com.dengin.social.application.service.FeedService;
import com.dengin.social.domain.model.Post;
import com.dengin.social.domain.model.PostContent;
import com.dengin.social.domain.model.PostImage;
import com.dengin.social.domain.repository.FollowRepository;
import com.dengin.social.domain.repository.PostRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * FeedService Unit Tests
 * 
 * Tests:
 * 1. Personalized feed generation
 * 2. Trending posts
 * 3. Relevance score calculation
 * 4. Time, Engagement, Author, Content scoring
 * 
 * Feed Algorithm:
 * Score = Time(40%) + Engagement(30%) + Author(20%) + Content(10%)
 * 
 * Sprint 5-6: Social Context
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("FeedService Tests")
class FeedServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FeedService feedService;

    private User currentUser;
    private User followedUser;
    private User sameProfessionUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // Setup users
        currentUser = createMockUser(1L, "Current User", 10L);
        followedUser = createMockUser(2L, "Followed User", 20L);
        sameProfessionUser = createMockUser(3L, "Same Profession User", 10L); // Same profession
        otherUser = createMockUser(4L, "Other User", 30L);
    }

    // ============================================
    // GET FEED TESTS
    // ============================================

    @Nested
    @DisplayName("Get Feed")
    class GetFeedTests {

        @Test
        @DisplayName("Should get personalized feed")
        void shouldGetPersonalizedFeed() {
            // Given
            Long userId = 1L;
            int limit = 20;
            Set<Long> followedIds = Set.of(2L);

            Post post1 = createMockPost(1L, 2L, "Post from followed user with enough content length.");
            Post post2 = createMockPost(2L, 3L, "Post from same profession user with enough content.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(followedIds);
            when(postRepository.findPostsForFeed(anyList(), any(), any(LocalDateTime.class), anyInt()))
                    .thenReturn(List.of(post1, post2));
            when(userRepository.findById(2L)).thenReturn(Optional.of(followedUser));
            when(userRepository.findById(3L)).thenReturn(Optional.of(sameProfessionUser));

            // When
            List<FeedPostResponse> feed = feedService.getFeed(userId, null, limit, null);

            // Then
            assertThat(feed).isNotEmpty();
            assertThat(feed.size()).isLessThanOrEqualTo(limit);

            // Verify posts are sorted by relevance (followed user's post should be higher)
            verify(postRepository).findPostsForFeed(anyList(), any(), any(LocalDateTime.class), anyInt());
        }

        @Test
        @DisplayName("Should get feed with profession filter")
        void shouldGetFeed_WithProfessionFilter() {
            // Given
            Long userId = 1L;
            Long professionFilter = 10L;
            int limit = 20;

            Post post = createMockPost(1L, 3L, "Post from user with same profession filtering applied.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(Set.of());
            when(postRepository.findPostsForFeed(anyList(), eq(professionFilter), any(LocalDateTime.class), anyInt()))
                    .thenReturn(List.of(post));
            when(userRepository.findById(3L)).thenReturn(Optional.of(sameProfessionUser));

            // When
            List<FeedPostResponse> feed = feedService.getFeed(userId, professionFilter, limit, null);

            // Then
            assertThat(feed).isNotEmpty();
            verify(postRepository).findPostsForFeed(anyList(), eq(professionFilter), any(), anyInt());
        }

        @Test
        @DisplayName("Should fail when user not found")
        void shouldFail_WhenUserNotFound() {
            // Given
            Long userId = 999L;

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> feedService.getFeed(userId, null, 20, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("Should return empty feed when no posts")
        void shouldReturnEmptyFeed_WhenNoPosts() {
            // Given
            Long userId = 1L;

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(Set.of());
            when(postRepository.findPostsForFeed(anyList(), any(), any(LocalDateTime.class), anyInt()))
                    .thenReturn(List.of());

            // When
            List<FeedPostResponse> feed = feedService.getFeed(userId, null, 20, null);

            // Then
            assertThat(feed).isEmpty();
        }

        @Test
        @DisplayName("Should get feed with cursor-based pagination")
        void shouldGetFeed_WithCursorPagination() {
            // Given
            Long userId = 1L;
            int limit = 20;
            Long beforeId = 100L;

            Post post1 = createMockPost(99L, 2L, "Older post before cursor position.");
            Post post2 = createMockPost(98L, 3L, "Even older post before cursor position.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(Set.of(2L));
            when(postRepository.findPostsForFeedWithCursor(anyList(), any(), any(LocalDateTime.class), anyInt(),
                    eq(beforeId)))
                    .thenReturn(List.of(post1, post2));
            when(userRepository.findById(2L)).thenReturn(Optional.of(followedUser));
            when(userRepository.findById(3L)).thenReturn(Optional.of(sameProfessionUser));

            // When
            List<FeedPostResponse> feed = feedService.getFeed(userId, null, limit, beforeId);

            // Then
            assertThat(feed).isNotEmpty();
            assertThat(feed.size()).isLessThanOrEqualTo(limit);

            // Verify cursor-based query was used
            verify(postRepository).findPostsForFeedWithCursor(anyList(), any(), any(LocalDateTime.class), anyInt(),
                    eq(beforeId));
            verify(postRepository, never()).findPostsForFeed(anyList(), any(), any(LocalDateTime.class), anyInt());
        }
    }

    // ============================================
    // GET TRENDING POSTS TESTS
    // ============================================

    @Nested
    @DisplayName("Get Trending Posts")
    class GetTrendingPostsTests {

        @Test
        @DisplayName("Should get trending posts")
        void shouldGetTrendingPosts() {
            // Given
            Long userId = 1L;
            int limit = 10;

            Post post1 = createMockPost(1L, 2L, "Trending post with many likes and engagement metrics.");
            Post post2 = createMockPost(2L, 4L, "Another trending post with high engagement score.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(Set.of(2L));
            when(postRepository.findTrendingPosts(any(LocalDateTime.class), anyInt()))
                    .thenReturn(List.of(post1, post2));
            when(userRepository.findById(2L)).thenReturn(Optional.of(followedUser));
            when(userRepository.findById(4L)).thenReturn(Optional.of(otherUser));

            // When
            List<FeedPostResponse> trending = feedService.getTrendingPosts(userId, limit);

            // Then
            assertThat(trending).isNotEmpty();
            assertThat(trending.size()).isLessThanOrEqualTo(limit);

            verify(postRepository).findTrendingPosts(any(LocalDateTime.class), anyInt());
        }
    }

    // ============================================
    // RELEVANCE SCORE TESTS
    // ============================================

    @Nested
    @DisplayName("Relevance Score")
    class RelevanceScoreTests {

        @Test
        @DisplayName("Posts from followed users should have higher score")
        void postsFromFollowedUsersShouldHaveHigherScore() {
            // Given
            Long userId = 1L;
            Set<Long> followedIds = Set.of(2L);

            // Post from followed user
            Post followedPost = createMockPost(1L, 2L, "Post from followed user with enough content.");
            // Post from other user
            Post otherPost = createMockPost(2L, 4L, "Post from other user with enough content chars.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(followedIds);
            when(postRepository.findPostsForFeed(anyList(), any(), any(LocalDateTime.class), anyInt()))
                    .thenReturn(List.of(followedPost, otherPost));
            when(userRepository.findById(2L)).thenReturn(Optional.of(followedUser));
            when(userRepository.findById(4L)).thenReturn(Optional.of(otherUser));

            // When
            List<FeedPostResponse> feed = feedService.getFeed(userId, null, 20, null);

            // Then
            assertThat(feed).hasSize(2);
            // First post should be from followed user (higher relevance)
            assertThat(feed.get(0).getAuthor().getUserId()).isEqualTo(2L);
        }

        @Test
        @DisplayName("Posts with images should have higher content score")
        void postsWithImagesShouldHaveHigherContentScore() {
            // Given
            Long userId = 1L;

            // Post with images
            Post postWithImages = createMockPostWithImages(1L, 4L, "Post with images content here.");
            // Post without images
            Post postWithoutImages = createMockPost(2L, 4L, "Post without images content here please.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
            when(followRepository.getFollowingIds(userId)).thenReturn(Set.of());
            when(postRepository.findPostsForFeed(anyList(), any(), any(LocalDateTime.class), anyInt()))
                    .thenReturn(List.of(postWithImages, postWithoutImages));
            when(userRepository.findById(4L)).thenReturn(Optional.of(otherUser));

            // When
            List<FeedPostResponse> feed = feedService.getFeed(userId, null, 20, null);

            // Then
            assertThat(feed).hasSize(2);
            // Post with images should have higher relevance
            assertThat(feed.get(0).getRelevanceScore()).isGreaterThan(feed.get(1).getRelevanceScore());
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private User createMockUser(Long id, String name, Long professionId) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(user.getFullName()).thenReturn(name);
        when(user.isVerified()).thenReturn(true);
        when(user.getProfileImageUrl()).thenReturn("http://example.com/profile.jpg");

        Profession profession = mock(Profession.class);
        when(profession.getId()).thenReturn(professionId);
        when(profession.getName()).thenReturn("Profession " + professionId);
        when(user.getProfession()).thenReturn(profession);

        return user;
    }

    private Post createMockPost(Long id, Long authorId, String content) {
        PostContent postContent = PostContent.of(content);
        Post post = Post.create(authorId, 10L, postContent, List.of());
        post.clearEvents();
        setCreatedAt(post, LocalDateTime.now().minusHours(1));
        return post;
    }

    private Post createMockPostWithImages(Long id, Long authorId, String content) {
        PostContent postContent = PostContent.of(content);
        List<PostImage> images = List.of(
                PostImage.of("key1", "http://example.com/img1.jpg"),
                PostImage.of("key2", "http://example.com/img2.jpg"));
        Post post = Post.create(authorId, 10L, postContent, images);
        post.clearEvents();
        setCreatedAt(post, LocalDateTime.now().minusHours(1));
        return post;
    }

    private void setCreatedAt(Post post, LocalDateTime createdAt) {
        try {
            java.lang.reflect.Field field = post.getClass().getSuperclass().getSuperclass()
                    .getDeclaredField("createdAt");
            field.setAccessible(true);
            field.set(post, createdAt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set createdAt", e);
        }
    }
}
