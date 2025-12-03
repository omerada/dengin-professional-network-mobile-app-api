package com.meslektas.messaging.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for MessageId Value Object
 */
@DisplayName("MessageId Tests")
class MessageIdTest {

    @Nested
    @DisplayName("Factory Methods")
    class FactoryMethods {

        @Test
        @DisplayName("Should generate unique MessageId")
        void shouldGenerateUniqueMessageId() {
            MessageId id1 = MessageId.generate();
            MessageId id2 = MessageId.generate();

            assertThat(id1).isNotNull();
            assertThat(id2).isNotNull();
            assertThat(id1).isNotEqualTo(id2);
        }

        @Test
        @DisplayName("Should create MessageId from UUID")
        void shouldCreateFromUuid() {
            UUID uuid = UUID.randomUUID();
            MessageId id = MessageId.of(uuid);

            assertThat(id).isNotNull();
            assertThat(id.getValue()).isEqualTo(uuid);
        }

        @Test
        @DisplayName("Should throw exception for null UUID")
        void shouldThrowExceptionForNullUuid() {
            assertThatThrownBy(() -> MessageId.of(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("null");
        }

        @Test
        @DisplayName("Should create from string")
        void shouldCreateFromString() {
            UUID uuid = UUID.randomUUID();
            MessageId id = MessageId.fromString(uuid.toString());

            assertThat(id.getValue()).isEqualTo(uuid);
        }
    }

    @Nested
    @DisplayName("Equality")
    class Equality {

        @Test
        @DisplayName("Should be equal when UUIDs match")
        void shouldBeEqualWhenUuidsMatch() {
            UUID uuid = UUID.randomUUID();
            MessageId id1 = MessageId.of(uuid);
            MessageId id2 = MessageId.of(uuid);

            assertThat(id1).isEqualTo(id2);
            assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal when UUIDs differ")
        void shouldNotBeEqualWhenUuidsDiffer() {
            MessageId id1 = MessageId.generate();
            MessageId id2 = MessageId.generate();

            assertThat(id1).isNotEqualTo(id2);
        }
    }

    @Nested
    @DisplayName("String Representation")
    class StringRepresentation {

        @Test
        @DisplayName("toString should return UUID string")
        void toStringShouldReturnUuidString() {
            UUID uuid = UUID.randomUUID();
            MessageId id = MessageId.of(uuid);

            assertThat(id.toString()).isEqualTo(uuid.toString());
        }
    }
}
