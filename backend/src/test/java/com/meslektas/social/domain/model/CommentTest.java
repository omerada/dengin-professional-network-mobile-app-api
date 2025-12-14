package com.dengin.social.domain.model;

import com.dengin.social.domain.model.Comment;
import com.dengin.social.domain.model.CommentContent;
import org.junit.jupiter.api.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Comment Entity Tests
 * 
 * Business Rules:
 * - Content: 1-500 characters
 * - Only verified users can comment
 * - Comment author or post author can delete
 * - Soft delete
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("Comment Entity Tests")
class CommentTest {

    private static final Long POST_ID = 1L;
    private static final Long COMMENTER_ID = 2L;

    // ============================================
    // FACTORY METHOD TESTS
    // ============================================

    @Nested
    @DisplayName("Factory Method (create)")
    class CreateTests {

        @Test
        @DisplayName("Should create comment with valid data")
        void shouldCreateComment_WhenValidData() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");

            // When
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);

            // Then
            assertThat(comment).isNotNull();
            assertThat(comment.getCommentId()).isNotNull();
            assertThat(comment.getPostId()).isEqualTo(POST_ID);
            assertThat(comment.getCommenterId()).isEqualTo(COMMENTER_ID);
            assertThat(comment.getContent()).isEqualTo(content);
            assertThat(comment.isDeleted()).isFalse();
        }

        @Test
        @DisplayName("Should fail when post ID is null")
        void shouldFail_WhenPostIdNull() {
            // Given
            CommentContent content = CommentContent.of("Valid comment content.");

            // When & Then
            assertThatThrownBy(() -> Comment.create(null, COMMENTER_ID, content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Post ID");
        }

        @Test
        @DisplayName("Should fail when commenter ID is null")
        void shouldFail_WhenCommenterIdNull() {
            // Given
            CommentContent content = CommentContent.of("Valid comment content.");

            // When & Then
            assertThatThrownBy(() -> Comment.create(POST_ID, null, content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Commenter ID");
        }

        @Test
        @DisplayName("Should fail when content is null")
        void shouldFail_WhenContentNull() {
            // When & Then
            assertThatThrownBy(() -> Comment.create(POST_ID, COMMENTER_ID, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Content");
        }
    }

    // ============================================
    // DELETE TESTS
    // ============================================

    @Nested
    @DisplayName("Delete Functionality")
    class DeleteTests {

        @Test
        @DisplayName("Should delete comment")
        void shouldDeleteComment() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);
            assertThat(comment.isDeleted()).isFalse();

            // When
            comment.delete();

            // Then
            assertThat(comment.isDeleted()).isTrue();
            assertThat(comment.isVisible()).isFalse();
        }

        @Test
        @DisplayName("Should be no-op when deleting already deleted comment")
        void shouldBeNoOp_WhenDeletingAlreadyDeletedComment() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);
            comment.delete();

            // When - Should not throw
            comment.delete();

            // Then
            assertThat(comment.isDeleted()).isTrue();
        }
    }

    // ============================================
    // AUTHOR CHECK TESTS
    // ============================================

    @Nested
    @DisplayName("Author Check")
    class AuthorCheckTests {

        @Test
        @DisplayName("isAuthor should return true for commenter")
        void isAuthorShouldReturnTrue_ForCommenter() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);

            // Then
            assertThat(comment.isAuthor(COMMENTER_ID)).isTrue();
        }

        @Test
        @DisplayName("isAuthor should return false for non-commenter")
        void isAuthorShouldReturnFalse_ForNonCommenter() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);

            // Then
            assertThat(comment.isAuthor(999L)).isFalse();
        }
    }

    // ============================================
    // VISIBILITY TESTS
    // ============================================

    @Nested
    @DisplayName("Visibility")
    class VisibilityTests {

        @Test
        @DisplayName("Active comment should be visible")
        void activeCommentShouldBeVisible() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);

            // Then
            assertThat(comment.isVisible()).isTrue();
        }

        @Test
        @DisplayName("Deleted comment should not be visible")
        void deletedCommentShouldNotBeVisible() {
            // Given
            CommentContent content = CommentContent.of("This is a valid comment.");
            Comment comment = Comment.create(POST_ID, COMMENTER_ID, content);
            comment.delete();

            // Then
            assertThat(comment.isVisible()).isFalse();
        }
    }
}
