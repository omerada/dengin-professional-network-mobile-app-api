package com.dengin.social.application.service;

import com.dengin.common.infrastructure.DomainEventPublisher;
import com.dengin.identity.domain.model.Profession;
import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.social.application.dto.FollowResponse;
import com.dengin.social.application.dto.UserFollowDto;
import com.dengin.social.application.service.FollowService;
import com.dengin.social.domain.model.Follow;
import com.dengin.social.domain.repository.FollowRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * FollowService Unit Tests
 * 
 * Tests:
 * 1. Follow user
 * 2. Unfollow user
 * 3. Get followers
 * 4. Get following
 * 5. Check following status
 * 
 * Business Rules:
 * - Users can't follow themselves
 * - Only verified users can follow
 * - Follow relationships are unique
 * 
 * Sprint 5-6: Social Context
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("FollowService Tests")
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private FollowService followService;

    private User verifiedUser;
    private User unverifiedUser;
    private User targetUser;

    @BeforeEach
    void setUp() {
        verifiedUser = createMockUser(1L, "Verified User", true);
        unverifiedUser = createMockUser(2L, "Unverified User", false);
        targetUser = createMockUser(3L, "Target User", true);
    }

    // ============================================
    // FOLLOW USER TESTS
    // ============================================

    @Nested
    @DisplayName("Follow User")
    class FollowUserTests {

        @Test
        @DisplayName("Should follow user successfully")
        void shouldFollowUser() {
            // Given
            Long followerId = 1L;
            Long followingId = 3L;

            when(userRepository.findById(followerId)).thenReturn(Optional.of(verifiedUser));
            when(userRepository.existsById(followingId)).thenReturn(true);
            when(followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)).thenReturn(false);
            when(followRepository.save(any(Follow.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(followRepository.countByFollowingId(followingId)).thenReturn(10L);
            when(followRepository.countByFollowerId(followingId)).thenReturn(5L);

            // When
            FollowResponse response = followService.followUser(followerId, followingId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.userId()).isEqualTo(followingId);
            assertThat(response.following()).isTrue();
            assertThat(response.followerCount()).isEqualTo(10L);
            assertThat(response.followingCount()).isEqualTo(5L);

            verify(followRepository).save(any(Follow.class));
            verify(eventPublisher).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should not create duplicate follow relationship")
        void shouldNotCreateDuplicateFollow() {
            // Given
            Long followerId = 1L;
            Long followingId = 3L;

            when(userRepository.findById(followerId)).thenReturn(Optional.of(verifiedUser));
            when(userRepository.existsById(followingId)).thenReturn(true);
            when(followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)).thenReturn(true);
            when(followRepository.countByFollowingId(followingId)).thenReturn(10L);
            when(followRepository.countByFollowerId(followingId)).thenReturn(5L);

            // When
            FollowResponse response = followService.followUser(followerId, followingId);

            // Then
            assertThat(response.following()).isTrue();
            verify(followRepository, never()).save(any(Follow.class));
        }

        @Test
        @DisplayName("Should fail when user not verified")
        void shouldFail_WhenUserNotVerified() {
            // Given
            Long followerId = 2L;
            Long followingId = 3L;

            when(userRepository.findById(followerId)).thenReturn(Optional.of(unverifiedUser));

            // When & Then
            assertThatThrownBy(() -> followService.followUser(followerId, followingId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("verified");
        }

        @Test
        @DisplayName("Should fail when follower not found")
        void shouldFail_WhenFollowerNotFound() {
            // Given
            Long followerId = 999L;

            when(userRepository.findById(followerId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> followService.followUser(followerId, 3L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Follower not found");
        }

        @Test
        @DisplayName("Should fail when target user not found")
        void shouldFail_WhenTargetUserNotFound() {
            // Given
            Long followerId = 1L;
            Long followingId = 999L;

            when(userRepository.findById(followerId)).thenReturn(Optional.of(verifiedUser));
            when(userRepository.existsById(followingId)).thenReturn(false);

            // When & Then
            assertThatThrownBy(() -> followService.followUser(followerId, followingId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User to follow not found");
        }
    }

    // ============================================
    // UNFOLLOW USER TESTS
    // ============================================

    @Nested
    @DisplayName("Unfollow User")
    class UnfollowUserTests {

        @Test
        @DisplayName("Should unfollow user successfully")
        void shouldUnfollowUser() {
            // Given
            Long followerId = 1L;
            Long followingId = 3L;
            Follow follow = Follow.create(followerId, followingId);

            when(followRepository.findByFollowerIdAndFollowingId(followerId, followingId))
                    .thenReturn(Optional.of(follow));
            when(followRepository.countByFollowingId(followingId)).thenReturn(9L);
            when(followRepository.countByFollowerId(followingId)).thenReturn(5L);

            // When
            FollowResponse response = followService.unfollowUser(followerId, followingId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.following()).isFalse();

            verify(followRepository).delete(any(Follow.class));
            verify(eventPublisher).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should be no-op when not following")
        void shouldBeNoOp_WhenNotFollowing() {
            // Given
            Long followerId = 1L;
            Long followingId = 3L;

            when(followRepository.findByFollowerIdAndFollowingId(followerId, followingId))
                    .thenReturn(Optional.empty());
            when(followRepository.countByFollowingId(followingId)).thenReturn(10L);
            when(followRepository.countByFollowerId(followingId)).thenReturn(5L);

            // When
            FollowResponse response = followService.unfollowUser(followerId, followingId);

            // Then
            assertThat(response.following()).isFalse();
            verify(followRepository, never()).delete(any());
        }
    }

    // ============================================
    // GET FOLLOWERS TESTS
    // ============================================

    @Nested
    @DisplayName("Get Followers")
    class GetFollowersTests {

        @Test
        @DisplayName("Should get followers list")
        void shouldGetFollowers() {
            // Given
            Long userId = 3L;
            Follow follow1 = Follow.create(1L, userId);
            Follow follow2 = Follow.create(2L, userId);

            when(followRepository.findByFollowingId(userId)).thenReturn(List.of(follow1, follow2));
            when(userRepository.findAllById(anyList())).thenReturn(List.of(verifiedUser, unverifiedUser));

            // When
            List<UserFollowDto> followers = followService.getFollowers(userId);

            // Then
            assertThat(followers).hasSize(2);
        }

        @Test
        @DisplayName("Should return empty list when no followers")
        void shouldReturnEmptyList_WhenNoFollowers() {
            // Given
            Long userId = 3L;

            when(followRepository.findByFollowingId(userId)).thenReturn(List.of());
            when(userRepository.findAllById(anyList())).thenReturn(List.of());

            // When
            List<UserFollowDto> followers = followService.getFollowers(userId);

            // Then
            assertThat(followers).isEmpty();
        }
    }

    // ============================================
    // GET FOLLOWING TESTS
    // ============================================

    @Nested
    @DisplayName("Get Following")
    class GetFollowingTests {

        @Test
        @DisplayName("Should get following list")
        void shouldGetFollowing() {
            // Given
            Long userId = 1L;
            Follow follow1 = Follow.create(userId, 2L);
            Follow follow2 = Follow.create(userId, 3L);

            when(followRepository.findByFollowerId(userId)).thenReturn(List.of(follow1, follow2));
            when(userRepository.findAllById(anyList())).thenReturn(List.of(unverifiedUser, targetUser));

            // When
            List<UserFollowDto> following = followService.getFollowing(userId);

            // Then
            assertThat(following).hasSize(2);
        }
    }

    // ============================================
    // IS FOLLOWING TESTS
    // ============================================

    @Nested
    @DisplayName("Is Following")
    class IsFollowingTests {

        @Test
        @DisplayName("Should return true when following")
        void shouldReturnTrue_WhenFollowing() {
            // Given
            Long followerId = 1L;
            Long followingId = 3L;

            when(followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)).thenReturn(true);

            // When
            boolean isFollowing = followService.isFollowing(followerId, followingId);

            // Then
            assertThat(isFollowing).isTrue();
        }

        @Test
        @DisplayName("Should return false when not following")
        void shouldReturnFalse_WhenNotFollowing() {
            // Given
            Long followerId = 1L;
            Long followingId = 3L;

            when(followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)).thenReturn(false);

            // When
            boolean isFollowing = followService.isFollowing(followerId, followingId);

            // Then
            assertThat(isFollowing).isFalse();
        }
    }

    // ============================================
    // COUNT TESTS
    // ============================================

    @Nested
    @DisplayName("Counts")
    class CountTests {

        @Test
        @DisplayName("Should get follower count")
        void shouldGetFollowerCount() {
            // Given
            Long userId = 1L;
            when(followRepository.countByFollowingId(userId)).thenReturn(100L);

            // When
            long count = followService.getFollowerCount(userId);

            // Then
            assertThat(count).isEqualTo(100L);
        }

        @Test
        @DisplayName("Should get following count")
        void shouldGetFollowingCount() {
            // Given
            Long userId = 1L;
            when(followRepository.countByFollowerId(userId)).thenReturn(50L);

            // When
            long count = followService.getFollowingCount(userId);

            // Then
            assertThat(count).isEqualTo(50L);
        }
    }

    // ============================================
    // GET IDS TESTS
    // ============================================

    @Nested
    @DisplayName("Get IDs")
    class GetIdsTests {

        @Test
        @DisplayName("Should get follower IDs")
        void shouldGetFollowerIds() {
            // Given
            Long userId = 1L;
            Set<Long> expectedIds = Set.of(2L, 3L, 4L);
            when(followRepository.getFollowerIds(userId)).thenReturn(expectedIds);

            // When
            Set<Long> ids = followService.getFollowerIds(userId);

            // Then
            assertThat(ids).containsExactlyInAnyOrder(2L, 3L, 4L);
        }

        @Test
        @DisplayName("Should get following IDs")
        void shouldGetFollowingIds() {
            // Given
            Long userId = 1L;
            Set<Long> expectedIds = Set.of(5L, 6L);
            when(followRepository.getFollowingIds(userId)).thenReturn(expectedIds);

            // When
            Set<Long> ids = followService.getFollowingIds(userId);

            // Then
            assertThat(ids).containsExactlyInAnyOrder(5L, 6L);
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private User createMockUser(Long id, String name, boolean verified) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(user.getFullName()).thenReturn(name);
        when(user.isVerified()).thenReturn(verified);
        when(user.getProfileImageUrl()).thenReturn("http://example.com/profile.jpg");

        Profession profession = mock(Profession.class);
        when(profession.getId()).thenReturn(10L);
        when(profession.getName()).thenReturn("Test Profession");
        when(user.getProfession()).thenReturn(profession);

        return user;
    }
}
