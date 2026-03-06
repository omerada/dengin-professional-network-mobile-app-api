package com.dengin.social.domain.model;

import com.dengin.social.domain.model.PostImage;
import org.junit.jupiter.api.*;

import static org.assertj.core.api.Assertions.*;

/**
 * PostImage Value Object Tests
 * 
 * PostImage stores image metadata for posts:
 * - S3 key (required)
 * - URL (required)
 * - Width, Height, FileSize (optional)
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("PostImage Value Object Tests")
class PostImageTest {

    private static final String VALID_S3_KEY = "posts/123/image.jpg";
    private static final String VALID_URL = "https://cdn.dengin.com/posts/123/image.jpg";

    // ============================================
    // FACTORY METHOD TESTS
    // ============================================

    @Nested
    @DisplayName("Factory Methods")
    class FactoryMethodTests {

        @Test
        @DisplayName("Should create PostImage with full metadata")
        void shouldCreatePostImage_WithFullMetadata() {
            // Given
            Integer width = 1920;
            Integer height = 1080;
            Long fileSize = 2_500_000L;

            // When
            PostImage image = PostImage.of(VALID_S3_KEY, VALID_URL, width, height, fileSize);

            // Then
            assertThat(image).isNotNull();
            assertThat(image.getS3Key()).isEqualTo(VALID_S3_KEY);
            assertThat(image.getUrl()).isEqualTo(VALID_URL);
            assertThat(image.getWidth()).isEqualTo(width);
            assertThat(image.getHeight()).isEqualTo(height);
            assertThat(image.getFileSize()).isEqualTo(fileSize);
        }

        @Test
        @DisplayName("Should create PostImage with minimal metadata")
        void shouldCreatePostImage_WithMinimalMetadata() {
            // When
            PostImage image = PostImage.of(VALID_S3_KEY, VALID_URL);

            // Then
            assertThat(image).isNotNull();
            assertThat(image.getS3Key()).isEqualTo(VALID_S3_KEY);
            assertThat(image.getUrl()).isEqualTo(VALID_URL);
            assertThat(image.getWidth()).isNull();
            assertThat(image.getHeight()).isNull();
            assertThat(image.getFileSize()).isNull();
        }

        @Test
        @DisplayName("Should fail when S3 key is null")
        void shouldFail_WhenS3KeyNull() {
            // When & Then
            assertThatThrownBy(() -> PostImage.of(null, VALID_URL))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("S3 key");
        }

        @Test
        @DisplayName("Should fail when S3 key is blank")
        void shouldFail_WhenS3KeyBlank() {
            // When & Then
            assertThatThrownBy(() -> PostImage.of("   ", VALID_URL))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("S3 key");
        }

        @Test
        @DisplayName("Should fail when URL is null")
        void shouldFail_WhenUrlNull() {
            // When & Then
            assertThatThrownBy(() -> PostImage.of(VALID_S3_KEY, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("URL");
        }

        @Test
        @DisplayName("Should fail when URL is blank")
        void shouldFail_WhenUrlBlank() {
            // When & Then
            assertThatThrownBy(() -> PostImage.of(VALID_S3_KEY, ""))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("URL");
        }
    }

    // ============================================
    // IS LARGE TESTS
    // ============================================

    @Nested
    @DisplayName("isLarge Method")
    class IsLargeTests {

        @Test
        @DisplayName("Should return true for file size > 2MB")
        void shouldReturnTrue_WhenFileSizeAbove2MB() {
            // Given
            Long largeFileSize = 2_500_000L; // 2.5 MB
            PostImage image = PostImage.of(VALID_S3_KEY, VALID_URL, 1920, 1080, largeFileSize);

            // Then
            assertThat(image.isLarge()).isTrue();
        }

        @Test
        @DisplayName("Should return false for file size <= 2MB")
        void shouldReturnFalse_WhenFileSizeBelow2MB() {
            // Given
            Long smallFileSize = 1_500_000L; // 1.5 MB
            PostImage image = PostImage.of(VALID_S3_KEY, VALID_URL, 1920, 1080, smallFileSize);

            // Then
            assertThat(image.isLarge()).isFalse();
        }

        @Test
        @DisplayName("Should return false for exactly 2MB")
        void shouldReturnFalse_WhenFileSizeExactly2MB() {
            // Given
            Long exactly2MB = 2_000_000L;
            PostImage image = PostImage.of(VALID_S3_KEY, VALID_URL, 1920, 1080, exactly2MB);

            // Then
            assertThat(image.isLarge()).isFalse();
        }

        @Test
        @DisplayName("Should return false when file size is null")
        void shouldReturnFalse_WhenFileSizeNull() {
            // Given
            PostImage image = PostImage.of(VALID_S3_KEY, VALID_URL);

            // Then
            assertThat(image.isLarge()).isFalse();
        }
    }

    // ============================================
    // EQUALITY TESTS
    // ============================================

    @Nested
    @DisplayName("Equality")
    class EqualityTests {

        @Test
        @DisplayName("Should be equal for same values")
        void shouldBeEqual_ForSameValues() {
            // Given
            PostImage image1 = PostImage.of(VALID_S3_KEY, VALID_URL, 800, 600, 100_000L);
            PostImage image2 = PostImage.of(VALID_S3_KEY, VALID_URL, 800, 600, 100_000L);

            // Then
            assertThat(image1).isEqualTo(image2);
            assertThat(image1.hashCode()).isEqualTo(image2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal for different S3 key")
        void shouldNotBeEqual_ForDifferentS3Key() {
            // Given
            PostImage image1 = PostImage.of("key1", VALID_URL);
            PostImage image2 = PostImage.of("key2", VALID_URL);

            // Then
            assertThat(image1).isNotEqualTo(image2);
        }

        @Test
        @DisplayName("Should not be equal for different URL")
        void shouldNotBeEqual_ForDifferentUrl() {
            // Given
            PostImage image1 = PostImage.of(VALID_S3_KEY, "http://example1.com/img.jpg");
            PostImage image2 = PostImage.of(VALID_S3_KEY, "http://example2.com/img.jpg");

            // Then
            assertThat(image1).isNotEqualTo(image2);
        }
    }
}
