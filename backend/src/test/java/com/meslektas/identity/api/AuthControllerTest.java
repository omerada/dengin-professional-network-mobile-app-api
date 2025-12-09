package com.meslektas.identity.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meslektas.identity.application.dto.request.LoginRequest;
import com.meslektas.identity.application.dto.request.PasswordResetConfirmRequest;
import com.meslektas.identity.application.dto.request.PasswordResetRequest;
import com.meslektas.identity.application.dto.request.RegisterRequest;
import com.meslektas.identity.application.dto.response.LoginResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.service.AuthService;
import com.meslektas.identity.application.service.PasswordResetService;
import com.meslektas.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller Unit Tests for AuthController
 * 
 * Tests API endpoints with mocked services
 * Uses standalone MockMvc for lightweight testing
 * 
 * Coverage Target: 80%+
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @Mock
    private PasswordResetService passwordResetService;

    @InjectMocks
    private AuthController authController;

    private static final String AUTH_BASE_URL = "/api/auth";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .build();
    }

    // =====================================================
    // Registration Tests
    // =====================================================

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("Should register user successfully")
        void shouldRegisterSuccessfully() throws Exception {
            // Given
            RegisterRequest request = new RegisterRequest(
                    "test@example.com",
                    "SecurePass123!",
                    "Ahmet",
                    "Yılmaz",
                    null,  // sectorId - Sprint 1
                    1L,    // professionId - backward compatibility
                    null);

            UserResponse userResponse = UserResponse.builder()
                    .id(1L)
                    .email("test@example.com")
                    .name("Ahmet")
                    .surname("Yılmaz")
                    .build();
                    
            LoginResponse expectedResponse = LoginResponse.builder()
                    .user(userResponse)
                    .accessToken("mock.jwt.token")
                    .refreshToken("mock.refresh.token")
                    .build();

            when(authService.register(any(RegisterRequest.class))).thenReturn(expectedResponse);

            // When & Then
            mockMvc.perform(post(AUTH_BASE_URL + "/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.email").value("test@example.com"))
                    .andExpect(jsonPath("$.data.name").value("Ahmet"));

            verify(authService).register(any(RegisterRequest.class));
        }

        // Note: Exception handling tests require GlobalExceptionHandler to be
        // configured
        // In standalone MockMvc setup, exceptions propagate as 500 errors
        // These tests verify service layer is called correctly
    }

    // =====================================================
    // Login Tests
    // =====================================================

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully")
        void shouldLoginSuccessfully() throws Exception {
            // Given
            LoginRequest request = new LoginRequest("test@example.com", "SecurePass123!");

            LoginResponse expectedResponse = LoginResponse.builder()
                    .accessToken("jwt-access-token")
                    .refreshToken("jwt-refresh-token")
                    .tokenType("Bearer")
                    .expiresIn(3600L)
                    .build();

            when(authService.login(any(LoginRequest.class))).thenReturn(expectedResponse);

            // When & Then
            mockMvc.perform(post(AUTH_BASE_URL + "/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.accessToken").value("jwt-access-token"))
                    .andExpect(jsonPath("$.data.tokenType").value("Bearer"));

            verify(authService).login(any(LoginRequest.class));
        }
    }

    // =====================================================
    // Token Refresh Tests
    // =====================================================

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token successfully")
        void shouldRefreshTokenSuccessfully() throws Exception {
            // Given
            String refreshToken = "valid-refresh-token";

            LoginResponse expectedResponse = LoginResponse.builder()
                    .accessToken("new-jwt-access-token")
                    .refreshToken("new-jwt-refresh-token")
                    .tokenType("Bearer")
                    .expiresIn(3600L)
                    .build();

            when(authService.refreshToken(anyString())).thenReturn(expectedResponse);

            // When & Then
            mockMvc.perform(post(AUTH_BASE_URL + "/refresh")
                    .header("Refresh-Token", refreshToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.accessToken").value("new-jwt-access-token"));

            verify(authService).refreshToken(anyString());
        }
    }

    // =====================================================
    // Password Reset Tests
    // =====================================================

    @Nested
    @DisplayName("Password Reset Endpoints")
    class PasswordResetTests {

        @Test
        @DisplayName("Should request password reset successfully")
        void shouldRequestPasswordResetSuccessfully() throws Exception {
            // Given
            PasswordResetRequest request = new PasswordResetRequest("test@example.com");

            doNothing().when(passwordResetService).requestPasswordReset(any(PasswordResetRequest.class));

            // When & Then
            mockMvc.perform(post(AUTH_BASE_URL + "/password-reset/request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNoContent());

            verify(passwordResetService).requestPasswordReset(any(PasswordResetRequest.class));
        }

        @Test
        @DisplayName("Should confirm password reset successfully")
        void shouldConfirmPasswordResetSuccessfully() throws Exception {
            // Given
            PasswordResetConfirmRequest request = PasswordResetConfirmRequest.builder()
                    .resetToken("valid-reset-token")
                    .newPassword("NewSecurePass123!")
                    .confirmPassword("NewSecurePass123!")
                    .build();

            doNothing().when(passwordResetService).confirmPasswordReset(any(PasswordResetConfirmRequest.class));

            // When & Then - Controller returns 200 OK, not 204
            mockMvc.perform(post(AUTH_BASE_URL + "/password-reset/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());

            verify(passwordResetService).confirmPasswordReset(any(PasswordResetConfirmRequest.class));
        }
    }

    // =====================================================
    // Logout Tests
    // =====================================================

    @Nested
    @DisplayName("POST /api/auth/logout")
    class LogoutTests {

        @Test
        @DisplayName("Should logout successfully")
        void shouldLogoutSuccessfully() throws Exception {
            // Given
            doNothing().when(authService).logout();

            // When & Then
            mockMvc.perform(post(AUTH_BASE_URL + "/logout"))
                    .andExpect(status().isOk());

            verify(authService).logout();
        }
    }
}
