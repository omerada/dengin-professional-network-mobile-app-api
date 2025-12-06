package com.meslektas.identity.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.identity.application.dto.request.LoginRequest;
import com.meslektas.identity.application.dto.request.RegisterRequest;
import com.meslektas.identity.application.dto.response.LoginResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.domain.model.OAuthProvider;
import com.meslektas.identity.application.mapper.UserMapper;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.model.UserStatus;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.identity.infrastructure.security.JwtTokenProvider;
import com.meslektas.notification.domain.service.EmailService;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit Tests for AuthService
 * 
 * Tests authentication application service:
 * - User registration
 * - Login/logout
 * - Token refresh
 * 
 * Coverage Target: 90%+
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
    private User testUser;
    private UserResponse testUserResponse;

    @BeforeEach
    void setUp() {
        // Setup Redis mock
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        validRegisterRequest = new RegisterRequest(
                "test@example.com",
                "SecurePass123!",
                "Ahmet",
                "Yılmaz",
                1L,
                null);

        validLoginRequest = new LoginRequest(
                "test@example.com",
                "SecurePass123!");

        testUser = User.builder()
                .email("test@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .name("Ahmet")
                .surname("Yılmaz")
                .status(UserStatus.ACTIVE)
                .build();

        // Set ID via reflection (simulating database assignment)
        ReflectionTestUtils.setField(testUser, "id", 1L);

        testUserResponse = UserResponse.builder()
                .id(1L)
                .email("test@example.com")
                .name("Ahmet")
                .surname("Yılmaz")
                .build();
    }

    // =====================================================
    // Registration Tests
    // =====================================================

    @Nested
    @DisplayName("Register Tests")
    class RegisterTests {

        @Test
        @DisplayName("Should register user successfully with valid data")
        void shouldRegisterUserSuccessfully() {
            // Given
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedpassword");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                // Simulate ID assignment
                ReflectionTestUtils.setField(user, "id", 1L);
                return user;
            });
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);
            when(jwtTokenProvider.generateTokenFromUserId(anyLong(), anyString())).thenReturn("mock.jwt.token");
            when(jwtTokenProvider.generateRefreshToken(anyLong(), anyString())).thenReturn("mock.refresh.token");

            // When
            LoginResponse result = authService.register(validRegisterRequest);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getUser().getEmail()).isEqualTo("test@example.com");
            assertThat(result.getUser().getName()).isEqualTo("Ahmet");
            assertThat(result.getAccessToken()).isNotNull();

            // Verify interactions
            verify(userRepository).existsByEmail("test@example.com");
            verify(passwordEncoder).encode("SecurePass123!");
            verify(userRepository).save(any(User.class));
            // Event publisher is called via forEach on domain events
            verify(eventPublisher, atLeastOnce()).publishEvent(any(Object.class));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            // Given
            when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

            // When & Then
            assertThatThrownBy(() -> authService.register(validRegisterRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Email already exists");

            // Verify no user was saved
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should save user with encoded password")
        void shouldSaveUserWithEncodedPassword() {
            // Given
            String encodedPassword = "$2a$10$encodedpassword";
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode("SecurePass123!")).thenReturn(encodedPassword);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                ReflectionTestUtils.setField(user, "id", 1L);
                return user;
            });
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            authService.register(validRegisterRequest);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getPasswordHash()).isEqualTo(encodedPassword);
        }

        @Test
        @DisplayName("Should publish UserRegisteredEvent after successful registration")
        void shouldPublishUserRegisteredEvent() {
            // Given
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedpassword");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                ReflectionTestUtils.setField(user, "id", 1L);
                return user;
            });
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            authService.register(validRegisterRequest);

            // Then - Event publisher called with domain event
            verify(eventPublisher, atLeastOnce()).publishEvent(any(Object.class));
        }
    }

    // =====================================================
    // Login Tests
    // =====================================================

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully with valid credentials")
        void shouldLoginSuccessfully() {
            // Given
            Authentication authentication = mock(Authentication.class);
            when(authenticationManager.authenticate(any())).thenReturn(authentication);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn("access-token");
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn("refresh-token");
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(900L);
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            LoginResponse result = authService.login(validLoginRequest);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo("access-token");
            assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(result.getTokenType()).isEqualTo("Bearer");
            assertThat(result.getExpiresIn()).isEqualTo(900L);
        }

        @Test
        @DisplayName("Should throw exception with invalid credentials")
        void shouldThrowExceptionWithInvalidCredentials() {
            // Given
            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            // When & Then
            assertThatThrownBy(() -> authService.login(validLoginRequest))
                    .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        @DisplayName("Should throw exception when user not found after authentication")
        void shouldThrowExceptionWhenUserNotFound() {
            // Given
            Authentication authentication = mock(Authentication.class);
            when(authenticationManager.authenticate(any())).thenReturn(authentication);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> authService.login(validLoginRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("Should throw exception when user is banned")
        void shouldThrowExceptionWhenUserBanned() {
            // Given
            User bannedUser = User.builder()
                    .email("test@example.com")
                    .passwordHash("$2a$10$hashedpassword")
                    .name("Ahmet")
                    .surname("Yılmaz")
                    .status(UserStatus.BANNED)
                    .banReason("Violations")
                    .build();

            Authentication authentication = mock(Authentication.class);
            when(authenticationManager.authenticate(any())).thenReturn(authentication);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(bannedUser));

            // When & Then
            assertThatThrownBy(() -> authService.login(validLoginRequest))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Account is banned");
        }

        @Test
        @DisplayName("Should record login timestamp on successful login")
        void shouldRecordLoginTimestamp() {
            // Given
            Authentication authentication = mock(Authentication.class);
            when(authenticationManager.authenticate(any())).thenReturn(authentication);
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn("access-token");
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn("refresh-token");
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(900L);
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            authService.login(validLoginRequest);

            // Then
            verify(userRepository).save(testUser);
        }
    }

    // =====================================================
    // Token Refresh Tests
    // =====================================================

    @Nested
    @DisplayName("Token Refresh Tests")
    class TokenRefreshTests {

        @Test
        @DisplayName("Should refresh token successfully with valid refresh token")
        void shouldRefreshTokenSuccessfully() {
            // Given
            String validRefreshToken = "valid-refresh-token";
            when(jwtTokenProvider.validateToken(validRefreshToken)).thenReturn(true);
            when(jwtTokenProvider.getUserIdFromToken(validRefreshToken)).thenReturn(1L);
            when(jwtTokenProvider.getEmailFromToken(validRefreshToken)).thenReturn("test@example.com");
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(jwtTokenProvider.generateTokenFromUserId(1L, "test@example.com")).thenReturn("new-access-token");
            when(jwtTokenProvider.generateRefreshToken(1L, "test@example.com")).thenReturn("new-refresh-token");
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(900L);

            // When
            LoginResponse result = authService.refreshToken(validRefreshToken);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo("new-access-token");
            assertThat(result.getRefreshToken()).isEqualTo("new-refresh-token");
        }

        @Test
        @DisplayName("Should throw exception with invalid refresh token")
        void shouldThrowExceptionWithInvalidRefreshToken() {
            // Given
            String invalidRefreshToken = "invalid-refresh-token";
            when(jwtTokenProvider.validateToken(invalidRefreshToken)).thenReturn(false);

            // When & Then
            assertThatThrownBy(() -> authService.refreshToken(invalidRefreshToken))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Invalid refresh token");
        }

        @Test
        @DisplayName("Should throw exception when user is inactive")
        void shouldThrowExceptionWhenUserInactive() {
            // Given
            User suspendedUser = User.builder()
                    .email("test@example.com")
                    .status(UserStatus.SUSPENDED)
                    .build();

            String validRefreshToken = "valid-refresh-token";
            when(jwtTokenProvider.validateToken(validRefreshToken)).thenReturn(true);
            when(jwtTokenProvider.getUserIdFromToken(validRefreshToken)).thenReturn(1L);
            when(jwtTokenProvider.getEmailFromToken(validRefreshToken)).thenReturn("test@example.com");
            when(userRepository.findById(1L)).thenReturn(Optional.of(suspendedUser));

            // When & Then
            assertThatThrownBy(() -> authService.refreshToken(validRefreshToken))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Account is inactive");
        }
    }

    // =====================================================
    // Logout Tests
    // =====================================================

    @Nested
    @DisplayName("Logout Tests")
    class LogoutTests {

        @Test
        @DisplayName("Should logout successfully")
        void shouldLogoutSuccessfully() {
            // When & Then - no exception should be thrown
            assertThatCode(() -> authService.logout()).doesNotThrowAnyException();
        }
    }
}
