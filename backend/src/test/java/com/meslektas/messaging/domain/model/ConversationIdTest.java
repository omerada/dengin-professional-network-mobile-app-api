package com.meslektas.messaging.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for ConversationId Value Object
 */
@DisplayName("ConversationId Tests")
class ConversationIdTest {
    
    @Nested
    @DisplayName("Factory Methods")
    class FactoryMethods {
        
        @Test
        @DisplayName("Should generate unique ConversationId")
        void shouldGenerateUniqueConversationId() {
            ConversationId id1 = ConversationId.generate();
            ConversationId id2 = ConversationId.generate();
            
            assertThat(id1).isNotNull();
            assertThat(id2).isNotNull();
            assertThat(id1).isNotEqualTo(id2);
            assertThat(id1.getValue()).isNotNull();
            assertThat(id2.getValue()).isNotNull();
        }
        
        @Test
        @DisplayName("Should create ConversationId from UUID")
        void shouldCreateFromUuid() {
            UUID uuid = UUID.randomUUID();
            ConversationId id = ConversationId.of(uuid);
            
            assertThat(id).isNotNull();
            assertThat(id.getValue()).isEqualTo(uuid);
        }
        
        @Test
        @DisplayName("Should throw exception for null UUID")
        void shouldThrowExceptionForNullUuid() {
            assertThatThrownBy(() -> ConversationId.of(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("null");
        }
        
        @Test
        @DisplayName("Should create from string")
        void shouldCreateFromString() {
            UUID uuid = UUID.randomUUID();
            ConversationId id = ConversationId.fromString(uuid.toString());
            
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
            ConversationId id1 = ConversationId.of(uuid);
            ConversationId id2 = ConversationId.of(uuid);
            
            assertThat(id1).isEqualTo(id2);
            assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
        }
        
        @Test
        @DisplayName("Should not be equal when UUIDs differ")
        void shouldNotBeEqualWhenUuidsDiffer() {
            ConversationId id1 = ConversationId.generate();
            ConversationId id2 = ConversationId.generate();
            
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
            ConversationId id = ConversationId.of(uuid);
            
            assertThat(id.toString()).isEqualTo(uuid.toString());
        }
    }
}
