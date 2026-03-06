package com.dengin.verification.domain.model;

import com.dengin.verification.domain.model.DocumentImage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * DocumentImage Value Object Unit Tests
 * 
 * Business Rules:
 * - Max file size: 10MB
 * - Allowed formats: image/jpeg, image/png, application/pdf
 */
@DisplayName("DocumentImage Value Object Tests")
class DocumentImageTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("Should create with valid JPEG image")
        void shouldCreateWithValidJpegImage() {
            DocumentImage image = DocumentImage.of(
                    "documents/user123/doc.jpg",
                    "diploma.jpg",
                    "image/jpeg",
                    1024L * 500 // 500KB
            );

            assertThat(image.getS3Key()).isEqualTo("documents/user123/doc.jpg");
            assertThat(image.getFileName()).isEqualTo("diploma.jpg");
            assertThat(image.getContentType()).isEqualTo("image/jpeg");
            assertThat(image.getFileSizeBytes()).isEqualTo(512000L);
            assertThat(image.isImage()).isTrue();
            assertThat(image.isPdf()).isFalse();
        }

        @Test
        @DisplayName("Should create with valid PNG image")
        void shouldCreateWithValidPngImage() {
            DocumentImage image = DocumentImage.of(
                    "documents/user123/doc.png",
                    "certificate.png",
                    "image/png",
                    2048L * 1024 // 2MB
            );

            assertThat(image.getContentType()).isEqualTo("image/png");
            assertThat(image.isImage()).isTrue();
        }

        @Test
        @DisplayName("Should create with valid PDF document")
        void shouldCreateWithValidPdfDocument() {
            DocumentImage image = DocumentImage.of(
                    "documents/user123/doc.pdf",
                    "diploma.pdf",
                    "application/pdf",
                    5L * 1024 * 1024 // 5MB
            );

            assertThat(image.getContentType()).isEqualTo("application/pdf");
            assertThat(image.isPdf()).isTrue();
            assertThat(image.isImage()).isFalse();
        }

        @Test
        @DisplayName("Should create with maximum allowed size (10MB)")
        void shouldCreateWithMaximumAllowedSize() {
            DocumentImage image = DocumentImage.of(
                    "documents/user123/large.jpg",
                    "large.jpg",
                    "image/jpeg",
                    10L * 1024 * 1024 // 10MB exactly
            );

            assertThat(image.getFileSizeBytes()).isEqualTo(10485760L);
        }
    }

    @Nested
    @DisplayName("Validation Tests - S3 Key")
    class S3KeyValidationTests {

        @Test
        @DisplayName("Should throw exception for null S3 key")
        void shouldThrowExceptionForNullS3Key() {
            assertThatThrownBy(() -> DocumentImage.of(
                    null, "doc.jpg", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("S3 key cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for empty S3 key")
        void shouldThrowExceptionForEmptyS3Key() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "", "doc.jpg", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("S3 key cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for blank S3 key")
        void shouldThrowExceptionForBlankS3Key() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "   ", "doc.jpg", "image/jpeg", 1024L))
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
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.jpg", null, "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File name cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for empty file name")
        void shouldThrowExceptionForEmptyFileName() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.jpg", "", "image/jpeg", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File name cannot be null or empty");
        }
    }

    @Nested
    @DisplayName("Validation Tests - Content Type")
    class ContentTypeValidationTests {

        @Test
        @DisplayName("Should throw exception for null content type")
        void shouldThrowExceptionForNullContentType() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.jpg", "doc.jpg", null, 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid content type");
        }

        @Test
        @DisplayName("Should throw exception for unsupported content type")
        void shouldThrowExceptionForUnsupportedContentType() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.gif", "doc.gif", "image/gif", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid content type: image/gif")
                    .hasMessageContaining("Allowed: image/jpeg, image/png, application/pdf");
        }

        @Test
        @DisplayName("Should throw exception for text content type")
        void shouldThrowExceptionForTextContentType() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.txt", "doc.txt", "text/plain", 1024L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid content type");
        }
    }

    @Nested
    @DisplayName("Validation Tests - File Size")
    class FileSizeValidationTests {

        @Test
        @DisplayName("Should throw exception for null file size")
        void shouldThrowExceptionForNullFileSize() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.jpg", "doc.jpg", "image/jpeg", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size must be greater than 0");
        }

        @Test
        @DisplayName("Should throw exception for zero file size")
        void shouldThrowExceptionForZeroFileSize() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.jpg", "doc.jpg", "image/jpeg", 0L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size must be greater than 0");
        }

        @Test
        @DisplayName("Should throw exception for negative file size")
        void shouldThrowExceptionForNegativeFileSize() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/doc.jpg", "doc.jpg", "image/jpeg", -1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size must be greater than 0");
        }

        @Test
        @DisplayName("Should throw exception for file size exceeding 10MB")
        void shouldThrowExceptionForFileSizeExceeding10MB() {
            assertThatThrownBy(() -> DocumentImage.of(
                    "docs/large.jpg", "large.jpg", "image/jpeg",
                    10L * 1024 * 1024 + 1 // 10MB + 1 byte
            ))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("File size exceeds maximum allowed size of 10MB");
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Same images should be equal")
        void sameImagesShouldBeEqual() {
            DocumentImage image1 = DocumentImage.of(
                    "docs/doc.jpg", "doc.jpg", "image/jpeg", 1024L);
            DocumentImage image2 = DocumentImage.of(
                    "docs/doc.jpg", "doc.jpg", "image/jpeg", 1024L);

            assertThat(image1).isEqualTo(image2);
            assertThat(image1.hashCode()).isEqualTo(image2.hashCode());
        }

        @Test
        @DisplayName("Different images should not be equal")
        void differentImagesShouldNotBeEqual() {
            DocumentImage image1 = DocumentImage.of(
                    "docs/doc1.jpg", "doc1.jpg", "image/jpeg", 1024L);
            DocumentImage image2 = DocumentImage.of(
                    "docs/doc2.jpg", "doc2.jpg", "image/jpeg", 2048L);

            assertThat(image1).isNotEqualTo(image2);
        }
    }

    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {

        @Test
        @DisplayName("Should return formatted string")
        void shouldReturnFormattedString() {
            DocumentImage image = DocumentImage.of(
                    "docs/doc.jpg", "diploma.jpg", "image/jpeg", 512000L);

            String result = image.toString();

            assertThat(result).contains("diploma.jpg");
            assertThat(result).contains("image/jpeg");
            assertThat(result).contains("512000 bytes");
        }
    }
}
