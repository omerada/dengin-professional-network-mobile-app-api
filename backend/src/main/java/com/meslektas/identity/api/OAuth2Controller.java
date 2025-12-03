package com.meslektas.identity.api;

import com.meslektas.identity.infrastructure.oauth.OAuth2AuthResult;
import com.meslektas.identity.infrastructure.oauth.OAuth2AuthenticationException;
import com.meslektas.identity.infrastructure.oauth.OAuth2AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * OAuth2 Authentication Controller
 * 
 * Handles social login (Google, Apple) authentication.
 * Mobile app authenticates with provider and sends token to backend.
 * 
 * Endpoints:
 * - POST /api/v1/auth/oauth/google - Google sign-in
 * - POST /api/v1/auth/oauth/apple - Apple sign-in
 */
@RestController
@RequestMapping("/api/v1/auth/oauth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "OAuth Authentication", description = "Social login endpoints")
public class OAuth2Controller {
    
    private final OAuth2AuthenticationService oAuth2AuthenticationService;
    
    /**
     * Authenticate with Google
     * 
     * Mobile app signs in with Google, then sends the ID token here.
     * Backend verifies token with Google and creates/finds user.
     */
    @PostMapping("/google")
    @Operation(summary = "Sign in with Google")
    public ResponseEntity<OAuth2AuthResponse> authenticateWithGoogle(
        @Valid @RequestBody GoogleAuthRequest request
    ) {
        log.info("Google OAuth authentication request");
        
        try {
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithGoogle(
                request.getIdToken()
            );
            
            return ResponseEntity.ok(OAuth2AuthResponse.from(result));
            
        } catch (OAuth2AuthenticationException e) {
            log.warn("Google OAuth failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(OAuth2AuthResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Authenticate with Apple
     * 
     * iOS app signs in with Apple, then sends the ID token here.
     * User's name is only provided on first login - app must send it.
     */
    @PostMapping("/apple")
    @Operation(summary = "Sign in with Apple")
    public ResponseEntity<OAuth2AuthResponse> authenticateWithApple(
        @Valid @RequestBody AppleAuthRequest request
    ) {
        log.info("Apple OAuth authentication request");
        
        try {
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithApple(
                request.getIdToken(),
                request.getAuthorizationCode(),
                request.getFullName()
            );
            
            return ResponseEntity.ok(OAuth2AuthResponse.from(result));
            
        } catch (OAuth2AuthenticationException e) {
            log.warn("Apple OAuth failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(OAuth2AuthResponse.error(e.getMessage()));
        }
    }
    
    // ==================== Request DTOs ====================
    
    @Data
    public static class GoogleAuthRequest {
        @NotBlank(message = "ID token is required")
        private String idToken;
    }
    
    @Data
    public static class AppleAuthRequest {
        @NotBlank(message = "ID token is required")
        private String idToken;
        
        /**
         * Authorization code from Apple (needed for token refresh)
         */
        private String authorizationCode;
        
        /**
         * User's full name (only provided on first login!)
         * Keys: "givenName", "familyName"
         */
        private Map<String, String> fullName;
    }
    
    // ==================== Response DTO ====================
    
    @Data
    public static class OAuth2AuthResponse {
        private boolean success;
        private String error;
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private boolean isNewUser;
        private UserInfo user;
        
        public static OAuth2AuthResponse from(OAuth2AuthResult result) {
            OAuth2AuthResponse response = new OAuth2AuthResponse();
            response.success = true;
            response.accessToken = result.getAccessToken();
            response.refreshToken = result.getRefreshToken();
            response.tokenType = result.getTokenType();
            response.expiresIn = result.getExpiresIn();
            response.isNewUser = result.isNewUser();
            
            if (result.getUser() != null) {
                response.user = new UserInfo();
                response.user.id = result.getUser().getId();
                response.user.email = result.getUser().getEmail();
                response.user.name = result.getUser().getName();
                response.user.surname = result.getUser().getSurname();
                response.user.fullName = result.getUser().getFullName();
                response.user.avatarUrl = result.getUser().getAvatarUrl();
                response.user.verificationStatus = result.getUser().getVerificationStatus();
            }
            
            return response;
        }
        
        public static OAuth2AuthResponse error(String message) {
            OAuth2AuthResponse response = new OAuth2AuthResponse();
            response.success = false;
            response.error = message;
            return response;
        }
        
        @Data
        public static class UserInfo {
            private Long id;
            private String email;
            private String name;
            private String surname;
            private String fullName;
            private String avatarUrl;
            private String verificationStatus;
        }
    }
}
