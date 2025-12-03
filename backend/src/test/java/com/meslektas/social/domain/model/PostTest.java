package com.meslektas.social.domain.model;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Post Aggregate Root Tests
 * 
 * Tests:
 * 1. Factory method (create)
 * 2. Like/unlike functionality
 * 3. Delete functionality
 * 4. Business rules validation
 * 5. Domain events
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("Post Aggregate Tests")
class PostTest {

    private static final Long AUTHOR_ID = 1L;
    private static final Long PROFESSION_ID = 10L;
    private static final String VALID_CONTENT = "This is a valid post content with enough characters.";

    // ============================================
    // FACTORY METHOD TESTS
    // ============================================

    @Nested
    @DisplayName("Factory Method (create)")
    class CreateTests {

        @Test
        @DisplayName("Should create post with valid data")
        void shouldCreatePost_WhenValidData() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);

            // When
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // Then
            assertThat(post).isNotNull();
            assertThat(post.getPostId()).isNotNull();
            assertThat(post.getAuthorId()).isEqualTo(AUTHOR_ID);
            assertThat(post.getProfessionId()).isEqualTo(PROFESSION_ID);
            assertThat(post.getContent()).isEqualTo(content);
            assertThat(post.getImages()).isEmpty();
            assertThat(post.getLikeCount()).isZero();
            assertThat(post.getCommentCount()).isZero();
            assertThat(post.getStatus()).isEqualTo(PostStatus.PUBLISHED);
        }

        @Test
        @DisplayName("Should create post with images")
        void shouldCreatePost_WithImages() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            PostImage image1 = PostImage.of("key1", "http://example.com/img1.jpg");
            PostImage image2 = PostImage.of("key2", "http://example.com/img2.jpg");
            List<PostImage> images = List.of(image1, image2);

            // When
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, images);

            // Then
            assertThat(post.getImages()).hasSize(2);
        }

        @Test
        @DisplayName("Should fail when author ID is null")
        void shouldFail_WhenAuthorIdNull() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);

            // When & Then
            assertThatThrownBy(() -> Post.create(null, PROFESSION_ID, content, List.of()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Author ID");
        }

        @Test
        @DisplayName("Should fail when profession ID is null")
        void shouldFail_WhenProfessionIdNull() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);

            // When & Then
            assertThatThrownBy(() -> Post.create(AUTHOR_ID, null, content, List.of()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Profession ID");
        }

        @Test
        @DisplayName("Should fail when content is null")
        void shouldFail_WhenContentNull() {
            // When & Then
            assertThatThrownBy(() -> Post.create(AUTHOR_ID, PROFESSION_ID, null, List.of()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Content");
        }

        @Test
        @DisplayName("Should fail when more than 5 images")
        void shouldFail_WhenMoreThanFiveImages() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            List<PostImage> images = List.of(
                    PostImage.of("key1", "http://example.com/img1.jpg"),
                    PostImage.of("key2", "http://example.com/img2.jpg"),
                    PostImage.of("key3", "http://example.com/img3.jpg"),
                    PostImage.of("key4", "http://example.com/img4.jpg"),
                    PostImage.of("key5", "http://example.com/img5.jpg"),
                    PostImage.of("key6", "http://example.com/img6.jpg"));

            // When & Then
            assertThatThrownBy(() -> Post.create(AUTHOR_ID, PROFESSION_ID, content, images))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("5 images");
        }

        @Test
        @DisplayName("Should create post with exactly 5 images")
        void shouldCreatePost_WithExactlyFiveImages() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            List<PostImage> images = List.of(
                    PostImage.of("key1", "http://example.com/img1.jpg"),
                    PostImage.of("key2", "http://example.com/img2.jpg"),
                    PostImage.of("key3", "http://example.com/img3.jpg"),
                    PostImage.of("key4", "http://example.com/img4.jpg"),
                    PostImage.of("key5", "http://example.com/img5.jpg"));

            // When
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, images);

            // Then
            assertThat(post.getImages()).hasSize(5);
        }
    }

    // ============================================
    // LIKE FUNCTIONALITY TESTS
    // ============================================

    @Nested
    @DisplayName("Like Functionality")
    class LikeTests {

        private Post post;

        @BeforeEach
        void setUp() {
            PostContent content = PostContent.of(VALID_CONTENT);
            post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());
        }

        @Test
        @DisplayName("Should like post successfully")
        void shouldLikePost() {
            // Given
            Long userId = 2L; // Different from author

            // When
            post.like(userId);

            // Then
            assertThat(post.getLikeCount()).isEqualTo(1);
            assertThat(post.isLikedBy(userId)).isTrue();
        }

        @Test
        @DisplayName("Should fail when liking own post")
        void shouldFail_WhenLikingOwnPost() {
            // When & Then
            assertThatThrownBy(() -> post.like(AUTHOR_ID))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("own post");
        }

        @Test
        @DisplayName("Should be idempotent when liking same post twice")
        void shouldBeIdempotent_WhenLikingTwice() {
            // Given
            Long userId = 2L;
            post.like(userId);
            int likeCountAfterFirst = post.getLikeCount();

            // When - like again (should be idempotent)
            post.like(userId);

            // Then - like count should not increase
            assertThat(post.getLikeCount()).isEqualTo(likeCountAfterFirst);
            assertThat(post.getLikeCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should fail when user ID is null")
        void shouldFail_WhenUserIdNull() {
            // When & Then
            assertThatThrownBy(() -> post.like(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Multiple users can like the same post")
        void multipleUsersCanLikePost() {
            // Given
            Long user1 = 2L;
            Long user2 = 3L;
            Long user3 = 4L;

            // When
            post.like(user1);
            post.like(user2);
            post.like(user3);

            // Then
            assertThat(post.getLikeCount()).isEqualTo(3);
            assertThat(post.isLikedBy(user1)).isTrue();
            assertThat(post.isLikedBy(user2)).isTrue();
            assertThat(post.isLikedBy(user3)).isTrue();
        }
    }

    // ============================================
    // UNLIKE FUNCTIONALITY TESTS
    // ============================================

    @Nested
    @DisplayName("Unlike Functionality")
    class UnlikeTests {

        private Post post;

        @BeforeEach
        void setUp() {
            PostContent content = PostContent.of(VALID_CONTENT);
            post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());
        }

        @Test
        @DisplayName("Should unlike post successfully")
        void shouldUnlikePost() {
            // Given
            Long userId = 2L;
            post.like(userId);
            assertThat(post.getLikeCount()).isEqualTo(1);

            // When
            post.unlike(userId);

            // Then
            assertThat(post.getLikeCount()).isZero();
            assertThat(post.isLikedBy(userId)).isFalse();
        }

        @Test
        @DisplayName("Should be no-op when unliking not-liked post")
        void shouldBeNoOp_WhenUnlikingNotLikedPost() {
            // Given
            Long userId = 2L;
            assertThat(post.getLikeCount()).isZero();

            // When - Should not throw
            post.unlike(userId);

            // Then
            assertThat(post.getLikeCount()).isZero();
        }

        @Test
        @DisplayName("Should fail when user ID is null")
        void shouldFail_WhenUserIdNull() {
            // When & Then
            assertThatThrownBy(() -> post.unlike(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ============================================
    // DELETE FUNCTIONALITY TESTS
    // ============================================

    @Nested
    @DisplayName("Delete Functionality")
    class DeleteTests {

        private Post post;

        @BeforeEach
        void setUp() {
            PostContent content = PostContent.of(VALID_CONTENT);
            post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());
        }

        @Test
        @DisplayName("Should delete post by author")
        void shouldDeletePost_ByAuthor() {
            // When
            post.delete(AUTHOR_ID);

            // Then
            assertThat(post.getStatus()).isEqualTo(PostStatus.DELETED);
            assertThat(post.isVisible()).isFalse();
        }

        @Test
        @DisplayName("Should fail when non-author tries to delete")
        void shouldFail_WhenNonAuthorDeletes() {
            // Given
            Long otherId = 2L;

            // When & Then
            assertThatThrownBy(() -> post.delete(otherId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only post author");
        }

        @Test
        @DisplayName("Should fail when user ID is null")
        void shouldFail_WhenUserIdNull() {
            // When & Then
            assertThatThrownBy(() -> post.delete(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should be no-op when deleting already deleted post")
        void shouldBeNoOp_WhenDeletingAlreadyDeletedPost() {
            // Given
            post.delete(AUTHOR_ID);
            PostStatus statusAfterFirstDelete = post.getStatus();

            // When - Should not throw
            post.delete(AUTHOR_ID);

            // Then
            assertThat(post.getStatus()).isEqualTo(statusAfterFirstDelete);
        }
    }

    // ============================================
    // COMMENT COUNT TESTS
    // ============================================

    @Nested
    @DisplayName("Comment Count")
    class CommentCountTests {

        private Post post;

        @BeforeEach
        void setUp() {
            PostContent content = PostContent.of(VALID_CONTENT);
            post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());
        }

        @Test
        @DisplayName("Should increment comment count")
        void shouldIncrementCommentCount() {
            // Given
            assertThat(post.getCommentCount()).isZero();

            // When
            post.incrementCommentCount();

            // Then
            assertThat(post.getCommentCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should decrement comment count")
        void shouldDecrementCommentCount() {
            // Given
            post.incrementCommentCount();
            post.incrementCommentCount();
            assertThat(post.getCommentCount()).isEqualTo(2);

            // When
            post.decrementCommentCount();

            // Then
            assertThat(post.getCommentCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Comment count should not go below zero")
        void commentCountShouldNotGoBelowZero() {
            // Given
            assertThat(post.getCommentCount()).isZero();

            // When
            post.decrementCommentCount();

            // Then
            assertThat(post.getCommentCount()).isZero();
        }
    }

    // ============================================
    // VISIBILITY TESTS
    // ============================================

    @Nested
    @DisplayName("Visibility")
    class VisibilityTests {

        @Test
        @DisplayName("Active post should be visible")
        void activePostShouldBeVisible() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // Then
            assertThat(post.isVisible()).isTrue();
        }

        @Test
        @DisplayName("Deleted post should not be visible")
        void deletedPostShouldNotBeVisible() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // When
            post.delete(AUTHOR_ID);

            // Then
            assertThat(post.isVisible()).isFalse();
        }
    }

    // ============================================
    // AUTHOR CHECK TESTS
    // ============================================

    @Nested
    @DisplayName("Author Check")
    class AuthorCheckTests {

        @Test
        @DisplayName("isAuthor should return true for author")
        void isAuthorShouldReturnTrue_ForAuthor() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // Then
            assertThat(post.isAuthor(AUTHOR_ID)).isTrue();
        }

        @Test
        @DisplayName("isAuthor should return false for non-author")
        void isAuthorShouldReturnFalse_ForNonAuthor() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // Then
            assertThat(post.isAuthor(2L)).isFalse();
        }
    }

    // ============================================
    // DOMAIN EVENTS TESTS
    // ============================================

    @Nested
    @DisplayName("Domain Events")
    class DomainEventsTests {

        @Test
        @DisplayName("publishCreatedEvent should register PostCreatedEvent")
        void shouldRegisterPostCreatedEvent() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // When
            post.publishCreatedEvent();

            // Then
            assertThat(post.getEvents()).hasSize(1);
            assertThat(post.getEvents().get(0)).isInstanceOf(PostCreatedEvent.class);
        }

        @Test
        @DisplayName("like should register PostLikedEvent")
        void shouldRegisterPostLikedEvent() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // When
            post.like(2L);

            // Then
            assertThat(post.getEvents()).hasSize(1);
            assertThat(post.getEvents().get(0)).isInstanceOf(PostLikedEvent.class);
        }

        @Test
        @DisplayName("unlike should register PostUnlikedEvent")
        void shouldRegisterPostUnlikedEvent() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());
            post.like(2L);
            post.clearEvents(); // Clear like event

            // When
            post.unlike(2L);

            // Then
            assertThat(post.getEvents()).hasSize(1);
            assertThat(post.getEvents().get(0)).isInstanceOf(PostUnlikedEvent.class);
        }

        @Test
        @DisplayName("delete should register PostDeletedEvent")
        void shouldRegisterPostDeletedEvent() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());

            // When
            post.delete(AUTHOR_ID);

            // Then
            assertThat(post.getEvents()).hasSize(1);
            assertThat(post.getEvents().get(0)).isInstanceOf(PostDeletedEvent.class);
        }

        @Test
        @DisplayName("clearEvents should remove all events")
        void shouldClearEvents() {
            // Given
            PostContent content = PostContent.of(VALID_CONTENT);
            Post post = Post.create(AUTHOR_ID, PROFESSION_ID, content, List.of());
            post.publishCreatedEvent();
            assertThat(post.getEvents()).isNotEmpty();

            // When
            post.clearEvents();

            // Then
            assertThat(post.getEvents()).isEmpty();
        }
    }
}
