package com.meslektas.identity.infrastructure.oauth;

import com.meslektas.identity.domain.model.OAuthProvider;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.identity.infrastructure.security.JwtTokenProvider;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * OAuth2 Authentication Service
 * 
 * Handles OAuth2 token verification and user creation/login
 * for Google and Apple sign-in.
 * 
 * Flow:
 * 1. Mobile app authenticates with Google/Apple
 * 2. Mobile app sends ID token to backend
 * 3. Backend verifies token with provider
 * 4. Backend creates/finds user and returns JWT
 * 
 * This is the server-side token verification approach,
 * which is more secure than redirect-based OAuth.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthenticationService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final AppleTokenVerifier appleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Authenticate with Google ID token
     * 
     * @param idToken Google ID token from mobile app
     * @return OAuth2AuthResult with tokens and user info
     */
    @Transactional
    public OAuth2AuthResult authenticateWithGoogle(String idToken) {
        log.info("Processing Google OAuth2 authentication");

        // Verify token with Google
        GoogleTokenVerifier.GoogleUserInfo googleUser = googleTokenVerifier.verify(idToken);

        if (googleUser == null) {
            log.warn("Invalid Google ID token");
            throw new OAuth2AuthenticationException("Geçersiz Google token");
        }

        // Find or create user
        Optional<User> existingUser = userRepository.findByEmail(googleUser.email());

        boolean isNewUser = existingUser.isEmpty();
        User user;

        if (isNewUser) {
            // Create new user from Google info
            user = User.createFromOAuth(
                    googleUser.email(),
                    googleUser.givenName(),
                    googleUser.familyName(),
                    googleUser.pictureUrl(),
                    OAuthProvider.GOOGLE,
                    googleUser.sub());
            user = userRepository.save(user);
            log.info("Created new user from Google OAuth: {}", user.getId());
        } else {
            user = existingUser.get();

            // Update OAuth info if this is first OAuth login for existing user
            if (user.getOauthProvider() == null) {
                user.linkOAuthProvider(OAuthProvider.GOOGLE, googleUser.sub());
                user = userRepository.save(user);
                log.info("Linked Google OAuth to existing user: {}", user.getId());
            } else if (user.getOauthProvider() != OAuthProvider.GOOGLE) {
                // User exists with different OAuth provider
                log.warn("User {} already linked with different OAuth provider: {}",
                        user.getId(), user.getOauthProvider());
            }
        }

        // Generate JWT tokens
        return generateAuthResult(user, isNewUser);
    }

    /**
     * Authenticate with Apple ID token
     * 
     * @param idToken           Apple ID token
     * @param authorizationCode Apple authorization code (for first login)
     * @param fullName          User's full name (only provided on first login)
     * @return OAuth2AuthResult with tokens and user info
     */
    @Transactional
    public OAuth2AuthResult authenticateWithApple(
            String idToken,
            String authorizationCode,
            Map<String, String> fullName) {
        log.info("Processing Apple OAuth2 authentication");

        // Verify token with Apple
        AppleTokenVerifier.AppleUserInfo appleUser = appleTokenVerifier.verify(idToken);

        if (appleUser == null) {
            log.warn("Invalid Apple ID token");
            throw new OAuth2AuthenticationException("Geçersiz Apple token");
        }

        // Find or create user
        Optional<User> existingUser = userRepository.findByEmail(appleUser.email());

        boolean isNewUser = existingUser.isEmpty();
        User user;

        if (isNewUser) {
            // Extract name from provided fullName (only available on first login)
            String firstName = null;
            String lastName = null;
            if (fullName != null) {
                firstName = fullName.get("givenName");
                lastName = fullName.get("familyName");
            }

            // Create new user from Apple info
            user = User.createFromOAuth(
                    appleUser.email(),
                    firstName,
                    lastName,
                    null, // Apple doesn't provide avatar
                    OAuthProvider.APPLE,
                    appleUser.sub());
            user = userRepository.save(user);
            log.info("Created new user from Apple OAuth: {}", user.getId());
        } else {
            user = existingUser.get();

            // Update OAuth info if this is first OAuth login for existing user
            if (user.getOauthProvider() == null) {
                user.linkOAuthProvider(OAuthProvider.APPLE, appleUser.sub());
                user = userRepository.save(user);
                log.info("Linked Apple OAuth to existing user: {}", user.getId());
            }
        }

        // Generate JWT tokens
        return generateAuthResult(user, isNewUser);
    }

    /**
     * Generate authentication result with JWT tokens
     */
    private OAuth2AuthResult generateAuthResult(User user, boolean isNewUser) {
        String accessToken = jwtTokenProvider.generateTokenFromUserId(
                user.getId(),
                user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(),
                user.getEmail());

        return OAuth2AuthResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationInSeconds())
                .isNewUser(isNewUser)
                .user(OAuth2AuthResult.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .surname(user.getSurname())
                        .avatarUrl(user.getAvatarUrl())
                        .verificationStatus(user.isVerified() ? "VERIFIED" : "UNVERIFIED")
                        .build())
                .build();
    }
}
