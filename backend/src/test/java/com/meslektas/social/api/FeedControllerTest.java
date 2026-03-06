package com.dengin.social.api;

import com.dengin.common.api.GlobalExceptionHandler;
import com.dengin.social.api.FeedController;
import com.dengin.social.application.dto.FeedPostResponse;
import com.dengin.social.application.service.FeedService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
 * FeedController Unit Tests
 * 
 * REST API Tests:
 * - GET /api/feed - Get personalized feed
 * - GET /api/feed/trending - Get trending posts
 * 
 * Sprint 5-6: Social Context
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FeedController Tests")
class FeedControllerTest {

        private MockMvc mockMvc;

        @Mock
        private FeedService feedService;

        @InjectMocks
        private FeedController feedController;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(feedController)
                                .setCustomArgumentResolvers(new TestAuthenticationArgumentResolver())
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        // ============================================
        // GET FEED TESTS
        // ============================================

        @Nested
        @DisplayName("GET /api/feed - Get Feed")
        class GetFeedTests {

                @Test
                @DisplayName("Should get personalized feed")
                void shouldGetPersonalizedFeed() throws Exception {
                        // Given
                        List<FeedPostResponse> feed = List.of(
                                        createFeedPostResponse(1L, 2L, "First post content"),
                                        createFeedPostResponse(2L, 3L, "Second post content"));

                        when(feedService.getFeed(eq(1L), isNull(), eq(20), isNull()))
                                        .thenReturn(feed);

                        // When & Then
                        mockMvc.perform(get("/api/feed"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.length()").value(2))
                                        .andExpect(jsonPath("$.data[0].content").value("First post content"));
                }

                @Test
                @DisplayName("Should get feed with profession filter")
                void shouldGetFeed_WithProfessionFilter() throws Exception {
                        // Given
                        Long professionFilter = 10L;
                        List<FeedPostResponse> feed = List.of(
                                        createFeedPostResponse(1L, 2L, "Filtered post content"));

                        when(feedService.getFeed(eq(1L), eq(professionFilter), eq(20), isNull()))
                                        .thenReturn(feed);

                        // When & Then
                        mockMvc.perform(get("/api/feed")
                                        .param("professionFilter", "10"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.length()").value(1));

                        verify(feedService).getFeed(1L, 10L, 20, null);
                }

                @Test
                @DisplayName("Should get feed with custom limit")
                void shouldGetFeed_WithCustomLimit() throws Exception {
                        // Given
                        int limit = 10;
                        List<FeedPostResponse> feed = List.of(
                                        createFeedPostResponse(1L, 2L, "Post content here"));

                        when(feedService.getFeed(eq(1L), isNull(), eq(limit), isNull()))
                                        .thenReturn(feed);

                        // When & Then
                        mockMvc.perform(get("/api/feed")
                                        .param("limit", "10"))
                                        .andExpect(status().isOk());

                        verify(feedService).getFeed(1L, null, 10, null);
                }

                @Test
                @DisplayName("Should cap limit at 50")
                void shouldCapLimitAt50() throws Exception {
                        // Given
                        when(feedService.getFeed(eq(1L), isNull(), eq(50), isNull()))
                                        .thenReturn(List.of());

                        // When & Then
                        mockMvc.perform(get("/api/feed")
                                        .param("limit", "100"))
                                        .andExpect(status().isOk());

                        // Limit should be capped at 50
                        verify(feedService).getFeed(1L, null, 50, null);
                }

                @Test
                @DisplayName("Should return empty feed when no posts")
                void shouldReturnEmptyFeed_WhenNoPosts() throws Exception {
                        // Given
                        when(feedService.getFeed(eq(1L), isNull(), eq(20), isNull()))
                                        .thenReturn(List.of());

                        // When & Then
                        mockMvc.perform(get("/api/feed"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.length()").value(0));
                }

                @Test
                @DisplayName("Should get feed with cursor-based pagination (beforeId)")
                void shouldGetFeed_WithCursorPagination() throws Exception {
                        // Given
                        Long beforeId = 100L;
                        List<FeedPostResponse> feed = List.of(
                                        createFeedPostResponse(99L, 2L, "Older post content"),
                                        createFeedPostResponse(98L, 3L, "Even older post content"));

                        when(feedService.getFeed(eq(1L), isNull(), eq(20), eq(beforeId)))
                                        .thenReturn(feed);

                        // When & Then
                        mockMvc.perform(get("/api/feed")
                                        .param("beforeId", "100"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.length()").value(2));

                        verify(feedService).getFeed(1L, null, 20, 100L);
                }

                @Test
                @DisplayName("Should get feed with all parameters")
                void shouldGetFeed_WithAllParameters() throws Exception {
                        // Given
                        Long professionFilter = 5L;
                        Long beforeId = 50L;
                        int limit = 15;
                        List<FeedPostResponse> feed = List.of(
                                        createFeedPostResponse(49L, 2L, "Filtered post"));

                        when(feedService.getFeed(eq(1L), eq(professionFilter), eq(limit), eq(beforeId)))
                                        .thenReturn(feed);

                        // When & Then
                        mockMvc.perform(get("/api/feed")
                                        .param("professionFilter", "5")
                                        .param("limit", "15")
                                        .param("beforeId", "50"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.length()").value(1));

                        verify(feedService).getFeed(1L, 5L, 15, 50L);
                }
        }

        // ============================================
        // GET TRENDING POSTS TESTS
        // ============================================

        @Nested
        @DisplayName("GET /api/feed/trending - Get Trending Posts")
        class GetTrendingPostsTests {

                @Test
                @DisplayName("Should get trending posts")
                void shouldGetTrendingPosts() throws Exception {
                        // Given
                        List<FeedPostResponse> trending = List.of(
                                        createFeedPostResponse(1L, 2L, "Trending post content 1"),
                                        createFeedPostResponse(2L, 3L, "Trending post content 2"));

                        when(feedService.getTrendingPosts(eq(1L), eq(20)))
                                        .thenReturn(trending);

                        // When & Then
                        mockMvc.perform(get("/api/feed/trending"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.length()").value(2));
                }

                @Test
                @DisplayName("Should get trending posts with custom limit")
                void shouldGetTrendingPosts_WithCustomLimit() throws Exception {
                        // Given
                        int limit = 5;
                        when(feedService.getTrendingPosts(eq(1L), eq(limit)))
                                        .thenReturn(List.of());

                        // When & Then
                        mockMvc.perform(get("/api/feed/trending")
                                        .param("limit", "5"))
                                        .andExpect(status().isOk());

                        verify(feedService).getTrendingPosts(1L, 5);
                }

                @Test
                @DisplayName("Should cap limit at 50")
                void shouldCapLimitAt50() throws Exception {
                        // Given
                        when(feedService.getTrendingPosts(eq(1L), eq(50)))
                                        .thenReturn(List.of());

                        // When & Then
                        mockMvc.perform(get("/api/feed/trending")
                                        .param("limit", "100"))
                                        .andExpect(status().isOk());

                        // Limit should be capped at 50
                        verify(feedService).getTrendingPosts(1L, 50);
                }
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private FeedPostResponse createFeedPostResponse(Long id, Long authorId, String content) {
                return FeedPostResponse.builder()
                                .id(id)
                                .postId(UUID.randomUUID())
                                .author(FeedPostResponse.AuthorDto.builder()
                                                .userId(authorId)
                                                .fullName("Author " + authorId)
                                                .profileImageUrl("http://example.com/profile.jpg")
                                                .professionId(10L)
                                                .professionName("Software Engineer")
                                                .verified(true)
                                                .build())
                                .content(content)
                                .images(List.of())
                                .likeCount(10)
                                .commentCount(5)
                                .liked(false)
                                .relevanceScore(75.5)
                                .createdAt(LocalDateTime.now())
                                .build();
        }
}
