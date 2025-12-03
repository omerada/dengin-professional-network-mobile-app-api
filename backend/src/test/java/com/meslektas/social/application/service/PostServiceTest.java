package com.meslektas.social.application.service;

import com.meslektas.common.infrastructure.DomainEventPublisher;
import com.meslektas.identity.application.service.ProfessionService;
import com.meslektas.identity.domain.model.Profession;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.social.application.dto.*;
import com.meslektas.social.domain.model.*;
import com.meslektas.social.domain.repository.CommentRepository;
import com.meslektas.social.domain.repository.FollowRepository;
import com.meslektas.social.domain.repository.PostRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * PostService Unit Tests
 * 
 * Tests:
 * 1. Create post (verified user only)
 * 2. Get post
 * 3. Like/unlike post
 * 4. Delete post
 * 5. Add/delete comments
 * 
 * Sprint 5-6: Social Context
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PostService Tests")
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private ProfessionService professionService;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private PostService postService;

    private User verifiedUser;
    private User unverifiedUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        // Mock profession service
        when(professionService.getProfessionNameById(anyLong())).thenReturn("Software Engineer");

        // Create verified user
        verifiedUser = createMockUser(1L, "John Doe", true);

        // Create unverified user
        unverifiedUser = createMockUser(2L, "Jane Doe", false);

        // Create test post
        testPost = createMockPost(1L, 1L);
    }

    // ============================================
    // CREATE POST TESTS
    // ============================================

    @Nested
    @DisplayName("Create Post")
    class CreatePostTests {

        @Test
        @DisplayName("Should create post successfully for verified user")
        void shouldCreatePost_WhenUserVerified() {
            // Given
            Long userId = 1L;
            CreatePostRequest request = CreatePostRequest.builder()
                    .professionId(10L)
                    .content("This is a valid post content with enough characters.")
                    .images(List.of())
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
                Post post = invocation.getArgument(0);
                // Simulate ID assignment
                return post;
            });

            // When
            PostResponse response = postService.createPost(request, userId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getContent()).isEqualTo(request.getContent());
            assertThat(response.getProfessionId()).isEqualTo(request.getProfessionId());
            assertThat(response.getAuthorId()).isEqualTo(userId);
            assertThat(response.isAuthorVerified()).isTrue();

            verify(postRepository).save(any(Post.class));
            verify(eventPublisher).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should create post with images")
        void shouldCreatePost_WithImages() {
            // Given
            Long userId = 1L;
            List<PostImageDto> images = List.of(
                    PostImageDto.builder()
                            .s3Key("posts/123/img1.jpg")
                            .url("http://example.com/img1.jpg")
                            .build(),
                    PostImageDto.builder()
                            .s3Key("posts/123/img2.jpg")
                            .url("http://example.com/img2.jpg")
                            .build());

            CreatePostRequest request = CreatePostRequest.builder()
                    .professionId(10L)
                    .content("This is a valid post content with images.")
                    .images(images)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            PostResponse response = postService.createPost(request, userId);

            // Then
            assertThat(response.getImages()).hasSize(2);
        }

        @Test
        @DisplayName("Should fail when user is not verified")
        void shouldFail_WhenUserNotVerified() {
            // Given
            Long userId = 2L;
            CreatePostRequest request = CreatePostRequest.builder()
                    .professionId(10L)
                    .content("This is a valid post content.")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(unverifiedUser));

            // When & Then
            assertThatThrownBy(() -> postService.createPost(request, userId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("verified");

            verify(postRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should fail when user not found")
        void shouldFail_WhenUserNotFound() {
            // Given
            Long userId = 999L;
            CreatePostRequest request = CreatePostRequest.builder()
                    .professionId(10L)
                    .content("This is a valid post content.")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> postService.createPost(request, userId))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User not found");
        }
    }

    // ============================================
    // GET POST TESTS
    // ============================================

    @Nested
    @DisplayName("Get Post")
    class GetPostTests {

        @Test
        @DisplayName("Should get post successfully")
        void shouldGetPost() {
            // Given
            Long postId = 1L;
            Long currentUserId = 2L;

            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(userRepository.findById(testPost.getAuthorId())).thenReturn(Optional.of(verifiedUser));

            // When
            PostResponse response = postService.getPost(postId, currentUserId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getAuthorId()).isEqualTo(testPost.getAuthorId());
        }

        @Test
        @DisplayName("Should fail when post not found")
        void shouldFail_WhenPostNotFound() {
            // Given
            Long postId = 999L;

            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> postService.getPost(postId, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Post not found");
        }
    }

    // ============================================
    // LIKE POST TESTS
    // ============================================

    @Nested
    @DisplayName("Like Post")
    class LikePostTests {

        @Test
        @DisplayName("Should like post successfully")
        void shouldLikePost() {
            // Given
            Long postId = 1L;
            Long userId = 2L; // Different from author

            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            LikeResponse response = postService.likePost(postId, userId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.isLiked()).isTrue();
            assertThat(response.getLikeCount()).isEqualTo(1);

            verify(postRepository).save(any(Post.class));
            verify(eventPublisher).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should fail when post not found")
        void shouldFail_WhenPostNotFound() {
            // Given
            Long postId = 999L;

            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> postService.likePost(postId, 2L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Post not found");
        }
    }

    // ============================================
    // UNLIKE POST TESTS
    // ============================================

    @Nested
    @DisplayName("Unlike Post")
    class UnlikePostTests {

        @Test
        @DisplayName("Should unlike post successfully")
        void shouldUnlikePost() {
            // Given
            Long postId = 1L;
            Long userId = 2L;

            // Like first
            testPost.like(userId);

            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            LikeResponse response = postService.unlikePost(postId, userId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.isLiked()).isFalse();

            verify(postRepository).save(any(Post.class));
        }
    }

    // ============================================
    // DELETE POST TESTS
    // ============================================

    @Nested
    @DisplayName("Delete Post")
    class DeletePostTests {

        @Test
        @DisplayName("Should delete post by author")
        void shouldDeletePost_ByAuthor() {
            // Given
            Long postId = 1L;
            Long userId = 1L; // Author

            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            postService.deletePost(postId, userId);

            // Then
            verify(postRepository).save(any(Post.class));
            verify(eventPublisher).publishEvents(anyList());
            assertThat(testPost.getStatus()).isEqualTo(PostStatus.DELETED);
        }

        @Test
        @DisplayName("Should fail when non-author tries to delete")
        void shouldFail_WhenNonAuthorDeletes() {
            // Given
            Long postId = 1L;
            Long userId = 2L; // Not author

            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));

            // When & Then
            assertThatThrownBy(() -> postService.deletePost(postId, userId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only post author");
        }

        @Test
        @DisplayName("Should fail when post not found")
        void shouldFail_WhenPostNotFound() {
            // Given
            Long postId = 999L;

            when(postRepository.findById(postId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> postService.deletePost(postId, 1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Post not found");
        }
    }

    // ============================================
    // ADD COMMENT TESTS
    // ============================================

    @Nested
    @DisplayName("Add Comment")
    class AddCommentTests {

        @Test
        @DisplayName("Should add comment successfully")
        void shouldAddComment() {
            // Given
            Long postId = 1L;
            Long userId = 1L;
            AddCommentRequest request = new AddCommentRequest("This is a valid comment.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));
            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            CommentResponse response = postService.addComment(postId, request, userId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getContent()).isEqualTo(request.getContent());
            assertThat(response.getCommenterId()).isEqualTo(userId);

            verify(commentRepository).save(any(Comment.class));
            verify(postRepository).save(any(Post.class));
        }

        @Test
        @DisplayName("Should fail when user not verified")
        void shouldFail_WhenUserNotVerified() {
            // Given
            Long postId = 1L;
            Long userId = 2L;
            AddCommentRequest request = new AddCommentRequest("This is a comment.");

            when(userRepository.findById(userId)).thenReturn(Optional.of(unverifiedUser));

            // When & Then
            assertThatThrownBy(() -> postService.addComment(postId, request, userId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("verified");
        }
    }

    // ============================================
    // DELETE COMMENT TESTS
    // ============================================

    @Nested
    @DisplayName("Delete Comment")
    class DeleteCommentTests {

        @Test
        @DisplayName("Should delete comment by comment author")
        void shouldDeleteComment_ByCommentAuthor() {
            // Given
            Long postId = 1L;
            Long commentId = 1L;
            Long userId = 2L; // Comment author

            Comment comment = Comment.create(postId, userId, CommentContent.of("Test comment"));

            when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            postService.deleteComment(postId, commentId, userId);

            // Then
            verify(commentRepository).save(any(Comment.class));
            assertThat(comment.isDeleted()).isTrue();
        }

        @Test
        @DisplayName("Should delete comment by post author")
        void shouldDeleteComment_ByPostAuthor() {
            // Given
            Long postId = 1L;
            Long commentId = 1L;
            Long postAuthorId = 1L;
            Long commentAuthorId = 2L;

            Comment comment = Comment.create(postId, commentAuthorId, CommentContent.of("Test comment"));

            when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));
            when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When - Post author deletes comment
            postService.deleteComment(postId, commentId, postAuthorId);

            // Then
            verify(commentRepository).save(any(Comment.class));
        }

        @Test
        @DisplayName("Should fail when unauthorized user tries to delete")
        void shouldFail_WhenUnauthorizedUserDeletes() {
            // Given
            Long postId = 1L;
            Long commentId = 1L;
            Long unauthorizedUserId = 999L;

            Comment comment = Comment.create(postId, 2L, CommentContent.of("Test comment"));

            when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
            when(postRepository.findById(postId)).thenReturn(Optional.of(testPost));

            // When & Then
            assertThatThrownBy(() -> postService.deleteComment(postId, commentId, unauthorizedUserId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Only comment author or post author");
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
        when(profession.getName()).thenReturn("Software Engineer");
        when(user.getProfession()).thenReturn(profession);

        return user;
    }

    private Post createMockPost(Long id, Long authorId) {
        PostContent content = PostContent.of("This is a valid post content with enough characters.");
        Post post = Post.create(authorId, 10L, content, List.of());
        // Clear events from creation
        post.clearEvents();
        return post;
    }
}
