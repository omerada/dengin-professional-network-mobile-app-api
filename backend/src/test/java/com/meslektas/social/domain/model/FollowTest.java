package com.meslektas.social.domain.model;

import org.junit.jupiter.api.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Follow Aggregate Root Tests
 * 
 * Business Rules:
 * - Users can't follow themselves
 * - Follow relationship is one-way
 * - Events are published for follow/unfollow
 * 
 * Sprint 5-6: Social Context
 */
@DisplayName("Follow Aggregate Tests")
class FollowTest {

    private static final Long FOLLOWER_ID = 1L;
    private static final Long FOLLOWING_ID = 2L;

    // ============================================
    // FACTORY METHOD TESTS
    // ============================================

    @Nested
    @DisplayName("Factory Method (create)")
    class CreateTests {

        @Test
        @DisplayName("Should create follow relationship with valid data")
        void shouldCreateFollow_WhenValidData() {
            // When
            Follow follow = Follow.create(FOLLOWER_ID, FOLLOWING_ID);

            // Then
            assertThat(follow).isNotNull();
            assertThat(follow.getFollowerId()).isEqualTo(FOLLOWER_ID);
            assertThat(follow.getFollowingId()).isEqualTo(FOLLOWING_ID);
        }

        @Test
        @DisplayName("Should fail when follower ID is null")
        void shouldFail_WhenFollowerIdNull() {
            // When & Then
            assertThatThrownBy(() -> Follow.create(null, FOLLOWING_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Follower ID");
        }

        @Test
        @DisplayName("Should fail when following ID is null")
        void shouldFail_WhenFollowingIdNull() {
            // When & Then
            assertThatThrownBy(() -> Follow.create(FOLLOWER_ID, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Following ID");
        }

        @Test
        @DisplayName("Should fail when trying to follow yourself")
        void shouldFail_WhenFollowingYourself() {
            // When & Then
            assertThatThrownBy(() -> Follow.create(FOLLOWER_ID, FOLLOWER_ID))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("follow yourself");
        }
    }

    // ============================================
    // DOMAIN EVENTS TESTS
    // ============================================

    @Nested
    @DisplayName("Domain Events")
    class DomainEventsTests {

        @Test
        @DisplayName("publishCreatedEvent should register UserFollowedEvent")
        void shouldRegisterUserFollowedEvent() {
            // Given
            Follow follow = Follow.create(FOLLOWER_ID, FOLLOWING_ID);

            // When
            follow.publishCreatedEvent();

            // Then
            assertThat(follow.getEvents()).hasSize(1);
            assertThat(follow.getEvents().get(0)).isInstanceOf(UserFollowedEvent.class);

            UserFollowedEvent event = (UserFollowedEvent) follow.getEvents().get(0);
            assertThat(event.getFollowerId()).isEqualTo(FOLLOWER_ID);
            assertThat(event.getFollowingId()).isEqualTo(FOLLOWING_ID);
        }

        @Test
        @DisplayName("publishDeletedEvent should register UserUnfollowedEvent")
        void shouldRegisterUserUnfollowedEvent() {
            // Given
            Follow follow = Follow.create(FOLLOWER_ID, FOLLOWING_ID);

            // When
            follow.publishDeletedEvent();

            // Then
            assertThat(follow.getEvents()).hasSize(1);
            assertThat(follow.getEvents().get(0)).isInstanceOf(UserUnfollowedEvent.class);

            UserUnfollowedEvent event = (UserUnfollowedEvent) follow.getEvents().get(0);
            assertThat(event.getFollowerId()).isEqualTo(FOLLOWER_ID);
            assertThat(event.getFollowingId()).isEqualTo(FOLLOWING_ID);
        }

        @Test
        @DisplayName("clearEvents should remove all events")
        void shouldClearEvents() {
            // Given
            Follow follow = Follow.create(FOLLOWER_ID, FOLLOWING_ID);
            follow.publishCreatedEvent();
            assertThat(follow.getEvents()).isNotEmpty();

            // When
            follow.clearEvents();

            // Then
            assertThat(follow.getEvents()).isEmpty();
        }
    }

    // ============================================
    // BIDIRECTIONAL FOLLOW TESTS
    // ============================================

    @Nested
    @DisplayName("Bidirectional Follow")
    class BidirectionalFollowTests {

        @Test
        @DisplayName("Should allow mutual follow (A follows B, B follows A)")
        void shouldAllowMutualFollow() {
            // Given - A follows B
            Follow followAB = Follow.create(1L, 2L);

            // When - B follows A (different follow relationship)
            Follow followBA = Follow.create(2L, 1L);

            // Then - Both should be valid
            assertThat(followAB).isNotNull();
            assertThat(followBA).isNotNull();
            assertThat(followAB.getFollowerId()).isEqualTo(followBA.getFollowingId());
            assertThat(followAB.getFollowingId()).isEqualTo(followBA.getFollowerId());
        }
    }
}
