package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.identity.application.dto.request.PasswordResetConfirmRequest;
import com.meslektas.identity.application.dto.request.PasswordResetRequest;
import com.meslektas.identity.application.dto.request.LoginRequest;
import com.meslektas.identity.application.dto.request.RegisterRequest;
import com.meslektas.identity.application.dto.response.LoginResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.service.AuthService;
import com.meslektas.identity.application.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST Controller
 * 
 * Endpoints:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login
 * - POST /api/auth/refresh - Refresh access token
 * - POST /api/auth/logout - Logout
 * - POST /api/auth/password-reset/request - Request password reset
 * - POST /api/auth/password-reset/confirm - Confirm password reset
 * 
 * Sprint 1 & 2 Implementation
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account with email and password")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", user));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and get JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @RequestHeader("Refresh-Token") String refreshToken) {
        LoginResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Clear authentication (client-side token deletion)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    /**
     * POST /api/auth/password-reset/request
     * Request password reset
     * 
     * Flow:
     * 1. User enters email
     * 2. System generates reset token
     * 3. Token stored in Redis (1-hour TTL)
     * 4. Reset email sent
     * 
     * Security:
     * - Always returns 204 No Content (prevent email enumeration)
     * - Rate limited: max 3 requests per hour per email
     * 
     * @param request Password reset request with email
     * @return 204 No Content
     */
    @PostMapping("/password-reset/request")
    @Operation(summary = "Request password reset", description = "Sends password reset email. Always returns success to prevent email enumeration.")
    public ResponseEntity<Void> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        log.info("POST /api/auth/password-reset/request - email: {}", request.getEmail());

        passwordResetService.requestPasswordReset(request);

        // Always return 204 No Content (security: prevent email enumeration)
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/auth/password-reset/confirm
     * Confirm password reset
     * 
     * Flow:
     * 1. User clicks reset link with token
     * 2. User enters new password
     * 3. System validates token
     * 4. Password updated
     * 5. All user sessions invalidated
     * 6. Confirmation email sent
     * 
     * @param request Password reset confirmation request
     * @return 200 OK with success message
     */
    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Confirm password reset", description = "Validates reset token and updates password. Invalidates all user sessions.")
    public ResponseEntity<ApiResponse<Void>> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        log.info("POST /api/auth/password-reset/confirm - token: {}", request.getResetToken());

        passwordResetService.confirmPasswordReset(request);

        return ResponseEntity.ok(
                ApiResponse.success("Şifreniz başarıyla sıfırlandı", null));
    }
}
