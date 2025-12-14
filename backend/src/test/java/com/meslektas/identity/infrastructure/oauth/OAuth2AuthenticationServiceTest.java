package com.dengin.identity.infrastructure.oauth;

import com.dengin.identity.domain.model.OAuthProvider;
import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.repository.UserRepository;
import com.dengin.identity.infrastructure.oauth.*;
import com.dengin.identity.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OAuth2AuthenticationService
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OAuth2AuthenticationService Tests")
class OAuth2AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    @Mock
    private AppleTokenVerifier appleTokenVerifier;

    @InjectMocks
    private OAuth2AuthenticationService oAuth2AuthenticationService;

    private static final String VALID_ID_TOKEN = "valid.id.token";
    private static final String JWT_TOKEN = "generated.jwt.token";
    private static final String REFRESH_TOKEN = "generated.refresh.token";
    
    @Nested
    @DisplayName("Google Authentication Tests")
    class GoogleAuthenticationTests {
        
        @Test
        @DisplayName("should authenticate new user with Google")
        void shouldAuthenticateNewUserWithGoogle() {
            // Given
            GoogleTokenVerifier.GoogleUserInfo userInfo = new GoogleTokenVerifier.GoogleUserInfo(
                "google-123",
                "test@gmail.com",
                "Test",
                "User",
                "Test User",
                "https://example.com/photo.jpg",
                true,
                "tr"
            );
            
            when(googleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(userInfo);
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn(JWT_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(3600L);
            
            // When
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithGoogle(VALID_ID_TOKEN);
            
            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo(JWT_TOKEN);
            assertThat(result.getRefreshToken()).isEqualTo(REFRESH_TOKEN);
            assertThat(result.isNewUser()).isTrue();
            
            verify(userRepository).save(any(User.class));
        }
        
        @Test
        @DisplayName("should authenticate existing user with Google")
        void shouldAuthenticateExistingUserWithGoogle() {
            // Given
            GoogleTokenVerifier.GoogleUserInfo userInfo = new GoogleTokenVerifier.GoogleUserInfo(
                "google-123",
                "existing@gmail.com",
                "Existing",
                "User",
                "Existing User",
                "https://example.com/photo.jpg",
                true,
                "tr"
            );
            
            User existingUser = mock(User.class);
            lenient().when(existingUser.getId()).thenReturn(1L);
            lenient().when(existingUser.getEmail()).thenReturn("existing@gmail.com");
            lenient().when(existingUser.getName()).thenReturn("Existing");
            lenient().when(existingUser.getSurname()).thenReturn("User");
            lenient().when(existingUser.getOauthProvider()).thenReturn(OAuthProvider.GOOGLE);
            lenient().when(existingUser.isVerified()).thenReturn(true);
            
            when(googleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(userInfo);
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn(JWT_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(3600L);
            
            // When
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithGoogle(VALID_ID_TOKEN);
            
            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo(JWT_TOKEN);
            assertThat(result.isNewUser()).isFalse();
        }
        
        @Test
        @DisplayName("should throw exception for invalid Google token")
        void shouldThrowForInvalidGoogleToken() {
            // Given
            when(googleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(null);
            
            // When/Then
            assertThatThrownBy(() -> 
                oAuth2AuthenticationService.authenticateWithGoogle(VALID_ID_TOKEN))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("Geçersiz");
        }
    }
    
    @Nested
    @DisplayName("Apple Authentication Tests")
    class AppleAuthenticationTests {
        
        @Test
        @DisplayName("should authenticate new user with Apple")
        void shouldAuthenticateNewUserWithApple() {
            // Given
            AppleTokenVerifier.AppleUserInfo userInfo = new AppleTokenVerifier.AppleUserInfo(
                "apple-123",
                "test@icloud.com",
                true,
                false
            );
            
            Map<String, String> fullName = Map.of(
                "givenName", "Test",
                "familyName", "User"
            );
            
            when(appleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(userInfo);
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn(JWT_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(3600L);
            
            // When
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithApple(
                VALID_ID_TOKEN, "auth-code", fullName);
            
            // Then
            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo(JWT_TOKEN);
            assertThat(result.getRefreshToken()).isEqualTo(REFRESH_TOKEN);
            assertThat(result.isNewUser()).isTrue();
            
            verify(userRepository).save(any(User.class));
        }
        
        @Test
        @DisplayName("should authenticate existing user with Apple")
        void shouldAuthenticateExistingUserWithApple() {
            // Given
            AppleTokenVerifier.AppleUserInfo userInfo = new AppleTokenVerifier.AppleUserInfo(
                "apple-123",
                "existing@icloud.com",
                true,
                false
            );
            
            User existingUser = mock(User.class);
            lenient().when(existingUser.getId()).thenReturn(1L);
            lenient().when(existingUser.getEmail()).thenReturn("existing@icloud.com");
            lenient().when(existingUser.getName()).thenReturn("Existing");
            lenient().when(existingUser.getSurname()).thenReturn("User");
            lenient().when(existingUser.getOauthProvider()).thenReturn(OAuthProvider.APPLE);
            lenient().when(existingUser.isVerified()).thenReturn(true);
            
            when(appleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(userInfo);
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn(JWT_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(3600L);
            
            // When
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithApple(
                VALID_ID_TOKEN, "auth-code", null);
            
            // Then
            assertThat(result).isNotNull();
            assertThat(result.isNewUser()).isFalse();
        }
        
        @Test
        @DisplayName("should throw exception for invalid Apple token")
        void shouldThrowForInvalidAppleToken() {
            // Given
            when(appleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(null);
            
            // When/Then
            assertThatThrownBy(() -> 
                oAuth2AuthenticationService.authenticateWithApple(VALID_ID_TOKEN, null, null))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("Geçersiz");
        }
    }
    
    @Nested
    @DisplayName("Link OAuth Provider Tests")
    class LinkOAuthProviderTests {
        
        @Test
        @DisplayName("should link Google account to existing user without OAuth")
        void shouldLinkGoogleAccount() {
            // Given
            GoogleTokenVerifier.GoogleUserInfo userInfo = new GoogleTokenVerifier.GoogleUserInfo(
                "google-123",
                "test@gmail.com",
                "Test",
                "User",
                "Test User",
                null,
                true,
                "tr"
            );
            
            User existingUser = mock(User.class);
            lenient().when(existingUser.getId()).thenReturn(1L);
            lenient().when(existingUser.getEmail()).thenReturn("test@gmail.com");
            lenient().when(existingUser.getName()).thenReturn("Test");
            lenient().when(existingUser.getSurname()).thenReturn("User");
            lenient().when(existingUser.getOauthProvider()).thenReturn(null); // No OAuth yet
            lenient().when(existingUser.isVerified()).thenReturn(true);
            
            when(googleTokenVerifier.verify(VALID_ID_TOKEN)).thenReturn(userInfo);
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));
            when(userRepository.save(any(User.class))).thenReturn(existingUser);
            when(jwtTokenProvider.generateTokenFromUserId(any(), anyString())).thenReturn(JWT_TOKEN);
            when(jwtTokenProvider.generateRefreshToken(any(), anyString())).thenReturn(REFRESH_TOKEN);
            when(jwtTokenProvider.getExpirationInSeconds()).thenReturn(3600L);
            
            // When
            OAuth2AuthResult result = oAuth2AuthenticationService.authenticateWithGoogle(VALID_ID_TOKEN);
            
            // Then
            verify(existingUser).linkOAuthProvider(eq(OAuthProvider.GOOGLE), eq("google-123"));
            verify(userRepository).save(existingUser);
        }
    }
}
