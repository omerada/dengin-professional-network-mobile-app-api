package com.dengin.messaging.domain.model;

import com.dengin.messaging.domain.model.MessageAttachment;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for MessageAttachment Value Object
 */
@DisplayName("MessageAttachment Tests")
class MessageAttachmentTest {

    private static final String VALID_S3_KEY = "messages/2024/01/15/abc123.jpg";
    private static final String VALID_URL = "https://s3.amazonaws.com/bucket/messages/2024/01/15/abc123.jpg";
    private static final String VALID_FILENAME = "photo.jpg";
    private static final String VALID_CONTENT_TYPE = "image/jpeg";
    private static final long VALID_FILE_SIZE = 1024L; // 1KB

    @Nested
    @DisplayName("Creation")
    class Creation {

        @Test
        @DisplayName("Should create valid attachment")
        void shouldCreateValidAttachment() {
            MessageAttachment attachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME);

            assertThat(attachment).isNotNull();
            assertThat(attachment.getS3Key()).isEqualTo(VALID_S3_KEY);
            assertThat(attachment.getUrl()).isEqualTo(VALID_URL);
            assertThat(attachment.getFileName()).isEqualTo(VALID_FILENAME);
            assertThat(attachment.getContentType()).isEqualTo(VALID_CONTENT_TYPE);
            assertThat(attachment.getFileSize()).isEqualTo(VALID_FILE_SIZE);
        }

        @ParameterizedTest
        @ValueSource(strings = { "image/jpeg", "image/png", "image/gif", "image/webp" })
        @DisplayName("Should accept valid image content types")
        void shouldAcceptValidImageContentTypes(String contentType) {
            MessageAttachment attachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, contentType, VALID_FILE_SIZE, VALID_FILENAME);

            assertThat(attachment.getContentType()).isEqualTo(contentType);
            assertThat(attachment.isImage()).isTrue();
        }

        @Test
        @DisplayName("Should accept file at max size limit")
        void shouldAcceptFileAtMaxSizeLimit() {
            long maxSize = 10 * 1024 * 1024; // 10MB
            MessageAttachment attachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, maxSize, VALID_FILENAME);

            assertThat(attachment.getFileSize()).isEqualTo(maxSize);
        }

        @Test
        @DisplayName("Should create simple attachment with just S3 key and URL")
        void shouldCreateSimpleAttachment() {
            MessageAttachment attachment = MessageAttachment.of(VALID_S3_KEY, VALID_URL);

            assertThat(attachment.getS3Key()).isEqualTo(VALID_S3_KEY);
            assertThat(attachment.getUrl()).isEqualTo(VALID_URL);
        }
    }

    @Nested
    @DisplayName("Validation")
    class Validation {

        @Test
        @DisplayName("Should throw exception for null S3 key")
        void shouldThrowExceptionForNullS3Key() {
            assertThatThrownBy(() -> MessageAttachment.of(
                    null, VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("S3 key");
        }

        @Test
        @DisplayName("Should throw exception for empty S3 key")
        void shouldThrowExceptionForEmptyS3Key() {
            assertThatThrownBy(() -> MessageAttachment.of(
                    "", VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("S3 key");
        }

        @Test
        @DisplayName("Should throw exception for null URL")
        void shouldThrowExceptionForNullUrl() {
            assertThatThrownBy(() -> MessageAttachment.of(
                    VALID_S3_KEY, null, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("URL");
        }

        @Test
        @DisplayName("Should throw exception for invalid content type")
        void shouldThrowExceptionForInvalidContentType() {
            assertThatThrownBy(() -> MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, "application/pdf", VALID_FILE_SIZE, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("image");
        }

        @Test
        @DisplayName("Should throw exception for zero file size")
        void shouldThrowExceptionForZeroFileSize() {
            assertThatThrownBy(() -> MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, 0L, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("positive");
        }

        @Test
        @DisplayName("Should throw exception for negative file size")
        void shouldThrowExceptionForNegativeFileSize() {
            assertThatThrownBy(() -> MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, -1L, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("positive");
        }

        @Test
        @DisplayName("Should throw exception for file size exceeding max")
        void shouldThrowExceptionForFileSizeExceedingMax() {
            long overMaxSize = 10 * 1024 * 1024 + 1; // 10MB + 1 byte

            assertThatThrownBy(() -> MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, overMaxSize, VALID_FILENAME))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("10MB");
        }
    }

    @Nested
    @DisplayName("Query Methods")
    class QueryMethods {

        @Test
        @DisplayName("Should identify image content types")
        void shouldIdentifyImageContentTypes() {
            MessageAttachment jpegAttachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, "image/jpeg", VALID_FILE_SIZE, VALID_FILENAME);
            MessageAttachment pngAttachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, "image/png", VALID_FILE_SIZE, VALID_FILENAME);

            assertThat(jpegAttachment.isImage()).isTrue();
            assertThat(pngAttachment.isImage()).isTrue();
        }

        @Test
        @DisplayName("Should return file size in KB")
        void shouldReturnFileSizeInKB() {
            MessageAttachment attachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, 2048L, VALID_FILENAME // 2KB
            );

            assertThat(attachment.getFileSizeKb()).isEqualTo(2L);
        }

        @Test
        @DisplayName("Should return file size in MB")
        void shouldReturnFileSizeInMB() {
            MessageAttachment attachment = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, 2 * 1024 * 1024L, VALID_FILENAME // 2MB
            );

            assertThat(attachment.getFileSizeMb()).isEqualTo(2.0);
        }
    }

    @Nested
    @DisplayName("Equality")
    class Equality {

        @Test
        @DisplayName("Should be equal when fields match")
        void shouldBeEqualWhenFieldsMatch() {
            MessageAttachment attachment1 = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME);
            MessageAttachment attachment2 = MessageAttachment.of(
                    VALID_S3_KEY, VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME);

            assertThat(attachment1).isEqualTo(attachment2);
            assertThat(attachment1.hashCode()).isEqualTo(attachment2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal when S3 keys differ")
        void shouldNotBeEqualWhenS3KeysDiffer() {
            MessageAttachment attachment1 = MessageAttachment.of(
                    "messages/key1.jpg", VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME);
            MessageAttachment attachment2 = MessageAttachment.of(
                    "messages/key2.jpg", VALID_URL, VALID_CONTENT_TYPE, VALID_FILE_SIZE, VALID_FILENAME);

            assertThat(attachment1).isNotEqualTo(attachment2);
        }
    }
}
