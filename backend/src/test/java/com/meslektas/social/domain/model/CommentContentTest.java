package com.dengin.social.domain.model;

import com.dengin.social.domain.model.CommentContent;
import org.junit.jupiter.api.*;

import static org.assertj.core.api.Assertions.*;

/**
 * CommentContent Value Object Tests
 * 
 * Business Rules:
 * - Min 1 character
 * - Max 500 characters
 * - Cannot be null or blank
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("CommentContent Value Object Tests")
class CommentContentTest {

    // ============================================
    // VALID CREATION TESTS
    // ============================================

    @Nested
    @DisplayName("Valid Creation")
    class ValidCreationTests {

        @Test
        @DisplayName("Should create CommentContent with valid content")
        void shouldCreateCommentContent_WithValidContent() {
            // Given
            String content = "This is a valid comment.";

            // When
            CommentContent commentContent = CommentContent.of(content);

            // Then
            assertThat(commentContent).isNotNull();
            assertThat(commentContent.getValue()).isEqualTo(content.trim());
        }

        @Test
        @DisplayName("Should create CommentContent with single character")
        void shouldCreateCommentContent_WithSingleCharacter() {
            // Given - 1 character (minimum)
            String content = "A";

            // When
            CommentContent commentContent = CommentContent.of(content);

            // Then
            assertThat(commentContent).isNotNull();
        }

        @Test
        @DisplayName("Should create CommentContent with exactly 500 characters")
        void shouldCreateCommentContent_WithMaxLength() {
            // Given - exactly 500 characters
            String content = "a".repeat(500);

            // When
            CommentContent commentContent = CommentContent.of(content);

            // Then
            assertThat(commentContent).isNotNull();
        }

        @Test
        @DisplayName("Should trim whitespace from content")
        void shouldTrimWhitespace() {
            // Given
            String content = "  Valid comment  ";

            // When
            CommentContent commentContent = CommentContent.of(content);

            // Then
            assertThat(commentContent.getValue()).isEqualTo("Valid comment");
        }
    }

    // ============================================
    // VALIDATION TESTS
    // ============================================

    @Nested
    @DisplayName("Validation")
    class ValidationTests {

        @Test
        @DisplayName("Should fail when content is null")
        void shouldFail_WhenContentNull() {
            // When & Then
            assertThatThrownBy(() -> CommentContent.of(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should fail when content is blank")
        void shouldFail_WhenContentBlank() {
            // When & Then
            assertThatThrownBy(() -> CommentContent.of("   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should fail when content is empty")
        void shouldFail_WhenContentEmpty() {
            // When & Then
            assertThatThrownBy(() -> CommentContent.of(""))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should fail when content exceeds 500 characters")
        void shouldFail_WhenContentTooLong() {
            // Given - 501 characters
            String content = "a".repeat(501);

            // When & Then
            assertThatThrownBy(() -> CommentContent.of(content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("500");
        }
    }

    // ============================================
    // EQUALITY TESTS
    // ============================================

    @Nested
    @DisplayName("Equality")
    class EqualityTests {

        @Test
        @DisplayName("Should be equal for same content")
        void shouldBeEqual_ForSameContent() {
            // Given
            String content = "Same comment content";
            CommentContent content1 = CommentContent.of(content);
            CommentContent content2 = CommentContent.of(content);

            // Then
            assertThat(content1).isEqualTo(content2);
            assertThat(content1.hashCode()).isEqualTo(content2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal for different content")
        void shouldNotBeEqual_ForDifferentContent() {
            // Given
            CommentContent content1 = CommentContent.of("First comment");
            CommentContent content2 = CommentContent.of("Second comment");

            // Then
            assertThat(content1).isNotEqualTo(content2);
        }
    }
}
