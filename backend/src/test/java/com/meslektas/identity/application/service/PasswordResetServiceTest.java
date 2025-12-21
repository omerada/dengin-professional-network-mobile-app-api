package com.dengin.identity.application.service;

import com.dengin.common.exception.BusinessException;
import com.dengin.common.exception.ResourceNotFoundException;
import com.dengin.identity.application.dto.request.PasswordResetConfirmRequest;
import com.dengin.identity.application.dto.request.PasswordResetRequest;
import com.dengin.identity.application.service.PasswordResetService;
import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.model.UserStatus;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.notification.domain.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Tests for PasswordResetService
 * 
 * Tests password reset flow:
 * - Request password reset
 * - Confirm password reset
 * - Rate limiting
 * - Token validation
 * 
 * Coverage Target: 90%+
 * 
 * Sprint 2 Implementation
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PasswordResetService Tests")
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("test@example.com")
                .passwordHash("$2a$10$oldpassword")
                .name("Ahmet")
                .surname("Yılmaz")
                .status(UserStatus.ACTIVE)
                .build();

        // Set ID via reflection (simulating database assignment)
        ReflectionTestUtils.setField(testUser, "id", 1L);

        // Set up common Redis mock behavior
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    // =====================================================
    // Request Password Reset Tests
    // =====================================================

    @Nested
    @DisplayName("Request Password Reset Tests")
    class RequestPasswordResetTests {

        @Test
        @DisplayName("Should generate reset token for valid user")
        void shouldGenerateResetTokenForValidUser() {
            // Given
            PasswordResetRequest request = new PasswordResetRequest("test@example.com");

            when(valueOperations.get(contains("rate_limit"))).thenReturn(null);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            // When - should not throw
            assertThatCode(() -> passwordResetService.requestPasswordReset(request))
                    .doesNotThrowAnyException();

            // Then
            verify(valueOperations).set(
                    argThat(key -> key.startsWith("password_reset:token:")),
                    any(),
                    eq(60L),
                    eq(TimeUnit.MINUTES));
        }

        @Test
        @DisplayName("Should not throw for non-existent email (prevent enumeration)")
        void shouldNotThrowForNonExistentEmail() {
            // Given
            PasswordResetRequest request = new PasswordResetRequest("nonexistent@example.com");

            when(valueOperations.get(contains("rate_limit"))).thenReturn(null);
            when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

            // When - should not throw
            assertThatCode(() -> passwordResetService.requestPasswordReset(request))
                    .doesNotThrowAnyException();

            // Then - no token should be stored for non-existent user
            verify(valueOperations, never()).set(
                    argThat(key -> key.startsWith("password_reset:token:")),
                    any(),
                    anyLong(),
                    any());
        }

        @Test
        @DisplayName("Should respect rate limiting")
        void shouldRespectRateLimiting() {
            // Given - user has already made 3 requests
            PasswordResetRequest request = new PasswordResetRequest("test@example.com");
            when(valueOperations.get(contains("rate_limit"))).thenReturn("3");

            // When - should not throw (but also should not send email)
            assertThatCode(() -> passwordResetService.requestPasswordReset(request))
                    .doesNotThrowAnyException();

            // Then - no token should be generated
            verify(valueOperations, never()).set(
                    argThat(key -> key.startsWith("password_reset:token:")),
                    any(),
                    anyLong(),
                    any());
        }

        @Test
        @DisplayName("Should not process request for inactive user")
        void shouldNotProcessForInactiveUser() {
            // Given
            User bannedUser = User.builder()
                    .email("banned@example.com")
                    .status(UserStatus.BANNED)
                    .build();

            PasswordResetRequest request = new PasswordResetRequest("banned@example.com");

            when(valueOperations.get(contains("rate_limit"))).thenReturn(null);
            when(userRepository.findByEmail("banned@example.com")).thenReturn(Optional.of(bannedUser));

            // When - should not throw
            assertThatCode(() -> passwordResetService.requestPasswordReset(request))
                    .doesNotThrowAnyException();

            // Then - no token should be stored
            verify(valueOperations, never()).set(
                    argThat(key -> key.startsWith("password_reset:token:")),
                    any(),
                    anyLong(),
                    any());
        }

        @Test
        @DisplayName("Should increment rate limit counter")
        void shouldIncrementRateLimitCounter() {
            // Given
            PasswordResetRequest request = new PasswordResetRequest("test@example.com");

            when(valueOperations.get(contains("rate_limit"))).thenReturn("1");
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            // When
            passwordResetService.requestPasswordReset(request);

            // Then
            verify(valueOperations).increment(contains("rate_limit"));
        }
    }

    // =====================================================
    // Confirm Password Reset Tests
    // =====================================================

    @Nested
    @DisplayName("Confirm Password Reset Tests")
    class ConfirmPasswordResetTests {

        @Test
        @DisplayName("Should reset password with valid token")
        void shouldResetPasswordWithValidToken() {
            // Given
            String resetToken = "valid-reset-token";
            String newPassword = "NewSecurePass123!";

            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken(resetToken)
                    .newPassword(newPassword)
                    .confirmPassword(newPassword)
                    .build();

            when(valueOperations.get("password_reset:token:" + resetToken)).thenReturn("1");
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(newPassword)).thenReturn("$2a$10$newhashedpassword");
            when(redisTemplate.delete(anyString())).thenReturn(true);

            // When
            assertThatCode(() -> passwordResetService.confirmPasswordReset(request))
                    .doesNotThrowAnyException();

            // Then
            verify(userRepository).save(testUser);
            verify(redisTemplate).delete("password_reset:token:" + resetToken);
            verify(eventPublisher).publishEvent(any(Object.class));
        }

        @Test
        @DisplayName("Should throw exception when passwords do not match")
        void shouldThrowExceptionWhenPasswordsDoNotMatch() {
            // Given
            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken("some-token")
                    .newPassword("Password123!")
                    .confirmPassword("DifferentPassword123!")
                    .build();

            // When & Then
            assertThatThrownBy(() -> passwordResetService.confirmPasswordReset(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Şifreler eşleşmiyor");
        }

        @Test
        @DisplayName("Should throw exception with invalid token")
        void shouldThrowExceptionWithInvalidToken() {
            // Given
            String invalidToken = "invalid-token";
            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken(invalidToken)
                    .newPassword("NewSecurePass123!")
                    .confirmPassword("NewSecurePass123!")
                    .build();

            when(valueOperations.get("password_reset:token:" + invalidToken)).thenReturn(null);

            // When & Then
            assertThatThrownBy(() -> passwordResetService.confirmPasswordReset(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Geçersiz veya süresi dolmuş token");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            // Given
            String resetToken = "valid-reset-token";
            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken(resetToken)
                    .newPassword("NewSecurePass123!")
                    .confirmPassword("NewSecurePass123!")
                    .build();

            when(valueOperations.get("password_reset:token:" + resetToken)).thenReturn("999");
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> passwordResetService.confirmPasswordReset(request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should publish PasswordChangedEvent after reset")
        void shouldPublishPasswordChangedEvent() {
            // Given
            String resetToken = "valid-reset-token";
            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken(resetToken)
                    .newPassword("NewSecurePass123!")
                    .confirmPassword("NewSecurePass123!")
                    .build();

            when(valueOperations.get("password_reset:token:" + resetToken)).thenReturn("1");
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newhashedpassword");
            when(redisTemplate.delete(anyString())).thenReturn(true);

            // When
            passwordResetService.confirmPasswordReset(request);

            // Then - verify PasswordChangedEvent was published
            ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
            verify(eventPublisher).publishEvent(eventCaptor.capture());
            assertThat(eventCaptor.getValue().getClass().getSimpleName()).isEqualTo("PasswordChangedEvent");
        }

        @Test
        @DisplayName("Should delete token from Redis after successful reset")
        void shouldDeleteTokenFromRedis() {
            // Given
            String resetToken = "valid-reset-token";
            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken(resetToken)
                    .newPassword("NewSecurePass123!")
                    .confirmPassword("NewSecurePass123!")
                    .build();

            when(valueOperations.get("password_reset:token:" + resetToken)).thenReturn("1");
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newhashedpassword");
            when(redisTemplate.delete(anyString())).thenReturn(true);

            // When
            passwordResetService.confirmPasswordReset(request);

            // Then
            verify(redisTemplate).delete("password_reset:token:" + resetToken);
        }
    }
}
