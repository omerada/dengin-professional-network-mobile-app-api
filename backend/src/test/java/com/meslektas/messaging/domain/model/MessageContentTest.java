package com.meslektas.messaging.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for MessageContent Value Object
 */
@DisplayName("MessageContent Tests")
class MessageContentTest {

    @Nested
    @DisplayName("Creation")
    class Creation {

        @Test
        @DisplayName("Should create valid MessageContent")
        void shouldCreateValidMessageContent() {
            String text = "Merhaba, nasılsınız?";
            MessageContent content = MessageContent.of(text);

            assertThat(content).isNotNull();
            assertThat(content.getValue()).isEqualTo(text);
        }

        @Test
        @DisplayName("Should create content with minimum length")
        void shouldCreateContentWithMinimumLength() {
            MessageContent content = MessageContent.of("A");

            assertThat(content).isNotNull();
            assertThat(content.getValue()).isEqualTo("A");
        }

        @Test
        @DisplayName("Should create content with maximum length")
        void shouldCreateContentWithMaximumLength() {
            String maxContent = "A".repeat(2000);
            MessageContent content = MessageContent.of(maxContent);

            assertThat(content).isNotNull();
            assertThat(content.getValue()).hasSize(2000);
        }

        @Test
        @DisplayName("Should trim whitespace from content")
        void shouldTrimWhitespace() {
            MessageContent content = MessageContent.of("  Merhaba  ");

            assertThat(content.getValue()).isEqualTo("Merhaba");
        }
    }

    @Nested
    @DisplayName("Validation")
    class Validation {

        @Test
        @DisplayName("Should throw exception for null content")
        void shouldThrowExceptionForNullContent() {
            assertThatThrownBy(() -> MessageContent.of(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("null");
        }

        @Test
        @DisplayName("Should throw exception for empty content")
        void shouldThrowExceptionForEmptyContent() {
            assertThatThrownBy(() -> MessageContent.of(""))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("blank");
        }

        @Test
        @DisplayName("Should throw exception for blank content")
        void shouldThrowExceptionForBlankContent() {
            assertThatThrownBy(() -> MessageContent.of("   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("blank");
        }

        @Test
        @DisplayName("Should throw exception for content exceeding max length")
        void shouldThrowExceptionForExceedingMaxLength() {
            String tooLong = "A".repeat(2001);

            assertThatThrownBy(() -> MessageContent.of(tooLong))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("2000");
        }
    }

    @Nested
    @DisplayName("Preview")
    class Preview {

        @Test
        @DisplayName("Should return full content when shorter than max length")
        void shouldReturnFullContentWhenShorterThanMaxLength() {
            MessageContent content = MessageContent.of("Kısa mesaj");

            assertThat(content.getPreview(50)).isEqualTo("Kısa mesaj");
        }

        @Test
        @DisplayName("Should truncate content and add ellipsis when longer than max length")
        void shouldTruncateContentWhenLongerThanMaxLength() {
            MessageContent content = MessageContent.of("Bu çok uzun bir mesajdır ve kesilmeli");

            String preview = content.getPreview(20);

            assertThat(preview).hasSize(20); // maxLength - 3 + "..."
            assertThat(preview).endsWith("...");
        }

        @Test
        @DisplayName("Should handle preview length equal to content length")
        void shouldHandlePreviewLengthEqualToContentLength() {
            MessageContent content = MessageContent.of("Tam uzunluk");

            assertThat(content.getPreview(11)).isEqualTo("Tam uzunluk");
        }
    }

    @Nested
    @DisplayName("Equality")
    class Equality {

        @Test
        @DisplayName("Should be equal when content matches")
        void shouldBeEqualWhenContentMatches() {
            MessageContent content1 = MessageContent.of("Merhaba");
            MessageContent content2 = MessageContent.of("Merhaba");

            assertThat(content1).isEqualTo(content2);
            assertThat(content1.hashCode()).isEqualTo(content2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal when content differs")
        void shouldNotBeEqualWhenContentDiffers() {
            MessageContent content1 = MessageContent.of("Merhaba");
            MessageContent content2 = MessageContent.of("Güle güle");

            assertThat(content1).isNotEqualTo(content2);
        }
    }

    @Nested
    @DisplayName("Character Count")
    class CharacterCount {

        @ParameterizedTest
        @ValueSource(strings = { "A", "Hello", "Merhaba Dünya!" })
        @DisplayName("Should return correct length")
        void shouldReturnCorrectLength(String text) {
            MessageContent content = MessageContent.of(text);

            assertThat(content.length()).isEqualTo(text.length());
        }
    }
}
