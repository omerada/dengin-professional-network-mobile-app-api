package com.meslektas.social.domain.model;

import org.junit.jupiter.api.*;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Like Value Object Tests
 * 
 * Like represents a user's like on a post.
 * Embedded in Post aggregate as collection.
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("Like Value Object Tests")
class LikeTest {

    // ============================================
    // FACTORY METHOD TESTS
    // ============================================

    @Nested
    @DisplayName("Factory Methods")
    class FactoryMethodTests {

        @Test
        @DisplayName("Should create Like with user ID")
        void shouldCreateLike_WithUserId() {
            // Given
            Long userId = 1L;

            // When
            Like like = Like.of(userId);

            // Then
            assertThat(like).isNotNull();
            assertThat(like.getUserId()).isEqualTo(userId);
            assertThat(like.getLikedAt()).isNotNull();
            // LikedAt should be very recent (within last second)
            assertThat(like.getLikedAt()).isAfter(LocalDateTime.now().minusSeconds(1));
        }

        @Test
        @DisplayName("Should create Like with specific timestamp")
        void shouldCreateLike_WithSpecificTimestamp() {
            // Given
            Long userId = 1L;
            LocalDateTime likedAt = LocalDateTime.of(2024, 1, 15, 10, 30);

            // When
            Like like = Like.of(userId, likedAt);

            // Then
            assertThat(like).isNotNull();
            assertThat(like.getUserId()).isEqualTo(userId);
            assertThat(like.getLikedAt()).isEqualTo(likedAt);
        }

        @Test
        @DisplayName("Should fail when user ID is null")
        void shouldFail_WhenUserIdNull() {
            // When & Then
            assertThatThrownBy(() -> Like.of(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User ID");
        }

        @Test
        @DisplayName("Should fail when liked timestamp is null")
        void shouldFail_WhenLikedAtNull() {
            // When & Then
            assertThatThrownBy(() -> Like.of(1L, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("timestamp");
        }
    }

    // ============================================
    // EQUALITY TESTS
    // ============================================

    @Nested
    @DisplayName("Equality")
    class EqualityTests {

        @Test
        @DisplayName("Should be equal for same user ID (ignoring timestamp)")
        void shouldBeEqual_ForSameUserId() {
            // Given - Same user, different timestamps
            Long userId = 1L;
            Like like1 = Like.of(userId, LocalDateTime.of(2024, 1, 1, 10, 0));
            Like like2 = Like.of(userId, LocalDateTime.of(2024, 1, 2, 15, 30));

            // Then - Should be equal (equality by userId only)
            assertThat(like1).isEqualTo(like2);
            assertThat(like1.hashCode()).isEqualTo(like2.hashCode());
        }

        @Test
        @DisplayName("Should not be equal for different user IDs")
        void shouldNotBeEqual_ForDifferentUserIds() {
            // Given
            Like like1 = Like.of(1L);
            Like like2 = Like.of(2L);

            // Then
            assertThat(like1).isNotEqualTo(like2);
        }
    }

    // ============================================
    // TO STRING TESTS
    // ============================================

    @Nested
    @DisplayName("toString")
    class ToStringTests {

        @Test
        @DisplayName("toString should include userId and timestamp")
        void toStringShouldIncludeDetails() {
            // Given
            Long userId = 42L;
            Like like = Like.of(userId);

            // When
            String result = like.toString();

            // Then
            assertThat(result).contains("42");
            assertThat(result).contains("Like");
        }
    }
}
