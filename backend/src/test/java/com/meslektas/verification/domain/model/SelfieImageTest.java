package com.dengin.verification.domain.model;

import com.dengin.verification.domain.model.SelfieImage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * SelfieImage Value Object Unit Tests
 * 
 * Business Rules:
 * - Max file size: 5MB
 * - Only image formats: image/jpeg, image/png (no PDF)
 */
@DisplayName("SelfieImage Value Object Tests")
class SelfieImageTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("Should create with valid JPEG image")
        void shouldCreateWithValidJpegImage() {
            SelfieImage image = SelfieImage.of(
                    "selfies/user123/selfie.jpg",
                    "selfie.jpg",
                    "image/jpeg",
                    1024L * 200 // 200KB
            );

            assertThat(image.getS3Key()).isEqualTo("selfies/user123/selfie.jpg");
            assertThat(image.getFileName()).isEqualTo("selfie.jpg");
            assertThat(image.getContentType()).isEqualTo("image/jpeg");
            assertThat(image.getFileSizeBytes()).isEqualTo(204800L);
        }

        @Test
        @DisplayName("Should create with valid PNG image")
        void shouldCreateWithValidPngImage() {
            SelfieImage image = SelfieImage.of(
                    "selfies/user123/selfie.png",
                    "selfie.png",
                    "image/png",
                    1024L * 500 // 500KB
            );

            assertThat(image.getContentType()).isEqualTo("image/png");
        }

        @Test
        @DisplayName("Should create with maximum allowed size (5MB)")
        void shouldCreateWithMaximumAllowedSize() {
            SelfieImage image = SelfieImage.of(
                    "selfies/user123/large.jpg",
                    "large.jpg",
                    "image/jpeg",
                    5L * 1024 * 1024 // 5MB exactly
            );

            assertThat(image.getFileSizeBytes()).isEqualTo(5242880L);
        }
    }

    @Nested
    @DisplayName("Validation Tests - S3 Key")
    class S3KeyValidationTests {

        @Test
        @DisplayName("Should throw exception for null S3 key")
        void shouldThrowExceptionForNullS3Key() {
            assertThatThrownBy(() -> SelfieImage.of(
                    null, "selfie.jpg", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("S3 key cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for empty S3 key")
        void shouldThrowExceptionForEmptyS3Key() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "", "selfie.jpg", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("S3 key cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for blank S3 key")
        void shouldThrowExceptionForBlankS3Key() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "   ", "selfie.jpg", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("S3 key cannot be null or empty");
        }
    }

    @Nested
    @DisplayName("Validation Tests - File Name")
    class FileNameValidationTests {

        @Test
        @DisplayName("Should throw exception for null file name")
        void shouldThrowExceptionForNullFileName() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.jpg", null, "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File name cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for empty file name")
        void shouldThrowExceptionForEmptyFileName() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.jpg", "", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File name cannot be null or empty");
        }
    }

    @Nested
    @DisplayName("Validation Tests - Content Type (No PDF allowed)")
    class ContentTypeValidationTests {

        @Test
        @DisplayName("Should throw exception for null content type")
        void shouldThrowExceptionForNullContentType() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.jpg", "selfie.jpg", null, 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid content type");
        }

        @Test
        @DisplayName("Should throw exception for PDF content type - selfie cannot be PDF")
        void shouldThrowExceptionForPdfContentType() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.pdf", "selfie.pdf", "application/pdf", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Selfie must be image/jpeg or image/png");
        }

        @Test
        @DisplayName("Should throw exception for GIF content type")
        void shouldThrowExceptionForGifContentType() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.gif", "selfie.gif", "image/gif", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Selfie must be image/jpeg or image/png");
        }

        @Test
        @DisplayName("Should throw exception for unsupported image format")
        void shouldThrowExceptionForUnsupportedImageFormat() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.webp", "selfie.webp", "image/webp", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid content type");
        }
    }

    @Nested
    @DisplayName("Validation Tests - File Size (Max 5MB)")
    class FileSizeValidationTests {

        @Test
        @DisplayName("Should throw exception for null file size")
        void shouldThrowExceptionForNullFileSize() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.jpg", "selfie.jpg", "image/jpeg", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size must be greater than 0");
        }

        @Test
        @DisplayName("Should throw exception for zero file size")
        void shouldThrowExceptionForZeroFileSize() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.jpg", "selfie.jpg", "image/jpeg", 0L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size must be greater than 0");
        }

        @Test
        @DisplayName("Should throw exception for negative file size")
        void shouldThrowExceptionForNegativeFileSize() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/selfie.jpg", "selfie.jpg", "image/jpeg", -1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size must be greater than 0");
        }

        @Test
        @DisplayName("Should throw exception for file size exceeding 5MB")
        void shouldThrowExceptionForFileSizeExceeding5MB() {
            assertThatThrownBy(() -> SelfieImage.of(
                    "selfies/large.jpg", "large.jpg", "image/jpeg",
                    5L * 1024 * 1024 + 1 // 5MB + 1 byte
            ))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Selfie size exceeds maximum allowed size of 5MB");
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Same images should be equal")
        void sameImagesShouldBeEqual() {
            SelfieImage image1 = SelfieImage.of(
                    "selfies/selfie.jpg", "selfie.jpg", "image/jpeg", 1024L);
            SelfieImage image2 = SelfieImage.of(
                    "selfies/selfie.jpg", "selfie.jpg", "image/jpeg", 1024L);

            assertThat(image1).isEqualTo(image2);
            assertThat(image1.hashCode()).isEqualTo(image2.hashCode());
        }

        @Test
        @DisplayName("Different images should not be equal")
        void differentImagesShouldNotBeEqual() {
            SelfieImage image1 = SelfieImage.of(
                    "selfies/selfie1.jpg", "selfie1.jpg", "image/jpeg", 1024L);
            SelfieImage image2 = SelfieImage.of(
                    "selfies/selfie2.jpg", "selfie2.jpg", "image/jpeg", 2048L);

            assertThat(image1).isNotEqualTo(image2);
        }
    }

    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should return formatted string")
        void shouldReturnFormattedString() {
            SelfieImage image = SelfieImage.of(
                    "selfies/selfie.jpg", "my-selfie.jpg", "image/jpeg", 204800L);

            String result = image.toString();

            assertThat(result).contains("my-selfie.jpg");
            assertThat(result).contains("image/jpeg");
            assertThat(result).contains("204800 bytes");
        }
    }
}
