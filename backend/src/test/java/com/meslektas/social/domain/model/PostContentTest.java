package com.dengin.social.domain.model;

import com.dengin.social.domain.model.PostContent;
import org.junit.jupiter.api.*;

import static org.assertj.core.api.Assertions.*;

/**
 * PostContent Value Object Tests
 * 
 * Business Rules:
 * - Min 10 characters
 * - Max 5000 characters
 * - Cannot be null or blank
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("PostContent Value Object Tests")
class PostContentTest {

    // ============================================
    // VALID CREATION TESTS
    // ============================================

    @Nested
    @DisplayName("Valid Creation")
    class ValidCreationTests {

        @Test
        @DisplayName("Should create PostContent with valid content")
        void shouldCreatePostContent_WithValidContent() {
            // Given
            String content = "This is a valid post content with enough characters.";

            // When
            PostContent postContent = PostContent.of(content);

            // Then
            assertThat(postContent).isNotNull();
            assertThat(postContent.getValue()).isEqualTo(content);
        }

        @Test
        @DisplayName("Should create PostContent with exactly 10 characters")
        void shouldCreatePostContent_WithMinLength() {
            // Given - exactly 10 characters
            String content = "1234567890";

            // When
            PostContent postContent = PostContent.of(content);

            // Then
            assertThat(postContent).isNotNull();
            assertThat(postContent.length()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should create PostContent with exactly 5000 characters")
        void shouldCreatePostContent_WithMaxLength() {
            // Given - exactly 5000 characters
            String content = "a".repeat(5000);

            // When
            PostContent postContent = PostContent.of(content);

            // Then
            assertThat(postContent).isNotNull();
            assertThat(postContent.length()).isEqualTo(5000);
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
            assertThatThrownBy(() -> PostContent.of(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should fail when content is blank")
        void shouldFail_WhenContentBlank() {
            // When & Then
            assertThatThrownBy(() -> PostContent.of("   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should fail when content is empty")
        void shouldFail_WhenContentEmpty() {
            // When & Then
            assertThatThrownBy(() -> PostContent.of(""))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should fail when content is less than 10 characters")
        void shouldFail_WhenContentTooShort() {
            // Given - 9 characters
            String content = "123456789";

            // When & Then
            assertThatThrownBy(() -> PostContent.of(content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("10 characters");
        }

        @Test
        @DisplayName("Should fail when content exceeds 5000 characters")
        void shouldFail_WhenContentTooLong() {
            // Given - 5001 characters
            String content = "a".repeat(5001);

            // When & Then
            assertThatThrownBy(() -> PostContent.of(content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("5000 characters");
        }
    }

    // ============================================
    // UTILITY METHODS TESTS
    // ============================================

    @Nested
    @DisplayName("Utility Methods")
    class UtilityMethodsTests {

        @Test
        @DisplayName("getTrimmed should return trimmed content")
        void getTrimmedShouldReturnTrimmedContent() {
            // Given
            String content = "  Valid content with spaces  ";
            PostContent postContent = PostContent.of(content);

            // When
            String trimmed = postContent.getTrimmed();

            // Then
            assertThat(trimmed).isEqualTo("Valid content with spaces");
        }

        @Test
        @DisplayName("length should return correct length")
        void lengthShouldReturnCorrectLength() {
            // Given
            String content = "Valid post content here!";
            PostContent postContent = PostContent.of(content);

            // Then
            assertThat(postContent.length()).isEqualTo(content.length());
        }

        @Test
        @DisplayName("toString should return content value")
        void toStringShouldReturnValue() {
            // Given
            String content = "This is the post content value.";
            PostContent postContent = PostContent.of(content);

            // Then
            assertThat(postContent.toString()).isEqualTo(content);
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
            String content = "Same content for both objects.";
            PostContent postContent1 = PostContent.of(content);
            PostContent postContent2 = PostContent.of(content);

            // Then
            assertThat(postContent1).isEqualTo(postContent2);
            assertThat(postContent1.hashCode()).isEqualTo(postContent2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal for different content")
        void shouldNotBeEqual_ForDifferentContent() {
            // Given
            PostContent postContent1 = PostContent.of("First content here for testing.");
            PostContent postContent2 = PostContent.of("Second content here for testing.");

            // Then
            assertThat(postContent1).isNotEqualTo(postContent2);
        }
    }
}
