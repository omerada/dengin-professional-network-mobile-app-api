package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.identity.application.dto.request.ChangePasswordRequest;
import com.meslektas.identity.application.dto.request.PasswordResetConfirmRequest;
import com.meslektas.identity.application.dto.request.PasswordResetRequest;
import com.meslektas.identity.application.dto.request.LoginRequest;
import com.meslektas.identity.application.dto.request.RegisterRequest;
import com.meslektas.identity.application.dto.response.LoginResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.service.AuthService;
import com.meslektas.identity.application.service.PasswordResetService;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
 * - POST /api/auth/change-password - Change password (authenticated)
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
    @Operation(summary = "Register new user", description = "Create a new user account with email, password and optional profession. Returns tokens for auto-login.")
    public ResponseEntity<ApiResponse<LoginResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kayıt başarılı! Otomatik giriş yapılıyor.", response));
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

    /**
     * POST /api/auth/change-password
     * Change password (authenticated users only)
     * 
     * Flow:
     * 1. User enters current password and new password
     * 2. System validates current password
     * 3. Password updated
     * 4. All other user sessions invalidated
     * 5. Confirmation email sent
     * 
     * Security:
     * - Requires authentication
     * - Current password must be verified
     * - New password must meet strength requirements
     * - Rate limited: max 5 requests per hour per user
     * 
     * @param request     Change password request
     * @param currentUser Authenticated user
     * @return 200 OK with success message
     */
    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change password for authenticated user. Requires current password verification.", security = @SecurityRequirement(name = "Bearer Authentication"))
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long userId = currentUser.getId();
        log.info("POST /api/auth/change-password - userId: {}", userId);

        authService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());

        log.info("Password changed successfully - userId: {}", userId);
        return ResponseEntity.ok(
                ApiResponse.success("Şifreniz başarıyla değiştirildi", null));
    }

    /**
     * POST /api/auth/verify-email
     * Verify user's email address with token
     * 
     * Flow:
     * 1. User clicks verification link in email
     * 2. Token is validated
     * 3. Email marked as verified
     * 4. User can now access email-verified features
     * 
     * @param request Email verification request with token
     * @return 200 OK with success message
     */
    @PostMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verifies user's email address using token from verification email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody EmailVerificationRequest request) {
        log.info("POST /api/auth/verify-email - token: {}", request.token());

        authService.verifyEmail(request.token());

        log.info("Email verified successfully - token: {}", request.token());
        return ResponseEntity.ok(
                ApiResponse.success("Email adresiniz başarıyla doğrulandı", null));
    }

    /**
     * Email verification request DTO
     */
    public record EmailVerificationRequest(
            @jakarta.validation.constraints.NotBlank(message = "Token is required")
            String token
    ) {}
}
