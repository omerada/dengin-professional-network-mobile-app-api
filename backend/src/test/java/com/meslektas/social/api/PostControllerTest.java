package com.dengin.social.api;

import com.dengin.common.exception.BusinessException;
import com.dengin.common.exception.ResourceNotFoundException;
import com.dengin.social.api.PostController;
import com.dengin.social.application.dto.CreatePostRequest;
import com.dengin.social.application.dto.LikeResponse;
import com.dengin.social.application.dto.PostImageDto;
import com.dengin.social.application.dto.PostResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dengin.common.api.GlobalExceptionHandler;
import com.dengin.social.application.service.PostService;
import com.dengin.social.domain.model.PostStatus;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * PostController Unit Tests
 * 
 * REST API Tests:
 * - POST /api/posts - Create post
 * - GET /api/posts/{postId} - Get post
 * - DELETE /api/posts/{postId} - Delete post
 * - POST /api/posts/{postId}/like - Like post
 * - DELETE /api/posts/{postId}/like - Unlike post
 * 
 * Sprint 5-6: Social Context
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PostController Tests")
class PostControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(postController)
                .setCustomArgumentResolvers(new TestAuthenticationArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    // ============================================
    // CREATE POST TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/posts - Create Post")
    class CreatePostTests {

        @Test
        @DisplayName("Should create post successfully")
        void shouldCreatePost() throws Exception {
            // Given
            CreatePostRequest request = CreatePostRequest.builder()
                    .professionId(10L)
                    .content("This is a valid post content with enough characters.")
                    .images(List.of())
                    .build();

            PostResponse response = PostResponse.builder()
                    .id(1L)
                    .postId(UUID.randomUUID())
                    .authorId(1L)
                    .authorName("John Doe")
                    .authorVerified(true)
                    .professionId(10L)
                    .content(request.getContent())
                    .images(List.of())
                    .likeCount(0)
                    .commentCount(0)
                    .liked(false)
                    .status(PostStatus.PUBLISHED)
                    .createdAt(LocalDateTime.now())
                    .build();

            when(postService.createPost(any(CreatePostRequest.class), eq(1L)))
                    .thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/posts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content").value(request.getContent()))
                    .andExpect(jsonPath("$.data.authorId").value(1));

            verify(postService).createPost(any(CreatePostRequest.class), eq(1L));
        }

        @Test
        @DisplayName("Should create post with images")
        void shouldCreatePost_WithImages() throws Exception {
            // Given
            List<PostImageDto> images = List.of(
                    PostImageDto.builder()
                            .s3Key("posts/123/img1.jpg")
                            .url("http://cdn.example.com/img1.jpg")
                            .width(800)
                            .height(600)
                            .build());

            CreatePostRequest request = CreatePostRequest.builder()
                    .professionId(10L)
                    .content("Post with images content here.")
                    .images(images)
                    .build();

            PostResponse response = PostResponse.builder()
                    .id(1L)
                    .postId(UUID.randomUUID())
                    .authorId(1L)
                    .content(request.getContent())
                    .images(images)
                    .build();

            when(postService.createPost(any(CreatePostRequest.class), eq(1L)))
                    .thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/posts")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.images.length()").value(1));
        }
    }

    // ============================================
    // GET POST TESTS
    // ============================================

    @Nested
    @DisplayName("GET /api/posts/{postId} - Get Post")
    class GetPostTests {

        @Test
        @DisplayName("Should get post successfully")
        void shouldGetPost() throws Exception {
            // Given
            String postId = "1";
            PostResponse response = PostResponse.builder()
                    .id(1L)
                    .postId(UUID.randomUUID())
                    .authorId(2L)
                    .authorName("Jane Doe")
                    .content("This is the post content.")
                    .likeCount(10)
                    .commentCount(5)
                    .liked(true)
                    .status(PostStatus.PUBLISHED)
                    .build();

            when(postService.getPost(eq(1L), eq(1L))).thenReturn(response);

            // When & Then
            mockMvc.perform(get("/api/posts/{postId}", postId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.likeCount").value(10))
                    .andExpect(jsonPath("$.data.liked").value(true));
        }

        @Test
        @DisplayName("Should return 404 when post not found")
        void shouldReturn404_WhenPostNotFound() throws Exception {
            // Given
            String postId = "999";
            when(postService.getPost(eq(999L), eq(1L)))
                    .thenThrow(new ResourceNotFoundException("Post", 999L));

            // When & Then
            mockMvc.perform(get("/api/posts/{postId}", postId))
                    .andExpect(status().isNotFound());
        }
    }

    // ============================================
    // DELETE POST TESTS
    // ============================================

    @Nested
    @DisplayName("DELETE /api/posts/{postId} - Delete Post")
    class DeletePostTests {

        @Test
        @DisplayName("Should delete post successfully")
        void shouldDeletePost() throws Exception {
            // Given
            String postId = "1";
            doNothing().when(postService).deletePost(eq(1L), eq(1L));

            // When & Then
            mockMvc.perform(delete("/api/posts/{postId}", postId))
                    .andExpect(status().isNoContent());

            verify(postService).deletePost(1L, 1L);
        }

        @Test
        @DisplayName("Should return 404 when post not found")
        void shouldReturn404_WhenPostNotFound() throws Exception {
            // Given
            String postId = "999";
            doThrow(new ResourceNotFoundException("Post", 999L))
                    .when(postService).deletePost(eq(999L), eq(1L));

            // When & Then
            mockMvc.perform(delete("/api/posts/{postId}", postId))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 when non-author tries to delete")
        void shouldReturn400_WhenNonAuthorDeletes() throws Exception {
            // Given
            String postId = "1";
            doThrow(new BusinessException("Only post author can delete the post",
                    "POST_UNAUTHORIZED_DELETE"))
                    .when(postService).deletePost(eq(1L), eq(1L));

            // When & Then
            mockMvc.perform(delete("/api/posts/{postId}", postId))
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // LIKE POST TESTS
    // ============================================

    @Nested
    @DisplayName("POST /api/posts/{postId}/like - Like Post")
    class LikePostTests {

        @Test
        @DisplayName("Should like post successfully")
        void shouldLikePost() throws Exception {
            // Given
            String postId = "1";
            LikeResponse response = LikeResponse.builder()
                    .postId(UUID.randomUUID())
                    .liked(true)
                    .likeCount(11)
                    .build();

            when(postService.likePost(eq(1L), eq(1L))).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/posts/{postId}/like", postId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.liked").value(true))
                    .andExpect(jsonPath("$.data.likeCount").value(11));
        }

        @Test
        @DisplayName("Should return 400 when liking own post")
        void shouldReturn400_WhenLikingOwnPost() throws Exception {
            // Given
            String postId = "1";
            when(postService.likePost(eq(1L), eq(1L)))
                    .thenThrow(new BusinessException("Cannot like your own post",
                            "SELF_LIKE_NOT_ALLOWED"));

            // When & Then
            mockMvc.perform(post("/api/posts/{postId}/like", postId))
                    .andExpect(status().isBadRequest());
        }
    }

    // ============================================
    // UNLIKE POST TESTS
    // ============================================

    @Nested
    @DisplayName("DELETE /api/posts/{postId}/like - Unlike Post")
    class UnlikePostTests {

        @Test
        @DisplayName("Should unlike post successfully")
        void shouldUnlikePost() throws Exception {
            // Given
            String postId = "1";
            LikeResponse response = LikeResponse.builder()
                    .postId(UUID.randomUUID())
                    .liked(false)
                    .likeCount(9)
                    .build();

            when(postService.unlikePost(eq(1L), eq(1L))).thenReturn(response);

            // When & Then
            mockMvc.perform(delete("/api/posts/{postId}/like", postId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.liked").value(false))
                    .andExpect(jsonPath("$.data.likeCount").value(9));
        }
    }
}
