package com.dengin.identity.infrastructure.oauth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Google ID Token Verifier
 * 
 * Verifies Google ID tokens received from mobile app.
 * Uses Google's official API client library.
 * 
 * Configuration:
 * - google.oauth.client-id-ios: iOS app client ID
 * - google.oauth.client-id-android: Android app client ID
 * - google.oauth.client-id-web: Web client ID (optional)
 */
@Component
@Slf4j
public class GoogleTokenVerifier {

    @Value("${google.oauth.client-id-ios:}")
    private String iosClientId;

    @Value("${google.oauth.client-id-android:}")
    private String androidClientId;

    @Value("${google.oauth.client-id-web:}")
    private String webClientId;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        // Build list of valid client IDs
        java.util.List<String> clientIds = new java.util.ArrayList<>();
        if (iosClientId != null && !iosClientId.isBlank()) {
            clientIds.add(iosClientId);
        }
        if (androidClientId != null && !androidClientId.isBlank()) {
            clientIds.add(androidClientId);
        }
        if (webClientId != null && !webClientId.isBlank()) {
            clientIds.add(webClientId);
        }

        if (clientIds.isEmpty()) {
            log.warn("No Google OAuth client IDs configured. Google sign-in will be disabled.");
            return;
        }

        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(clientIds)
                .build();

        log.info("Google Token Verifier initialized with {} client IDs", clientIds.size());
    }

    /**
     * Verify Google ID token and extract user info
     * 
     * @param idToken Google ID token from mobile app
     * @return GoogleUserInfo or null if invalid
     */
    public GoogleUserInfo verify(String idToken) {
        if (verifier == null) {
            log.error("Google Token Verifier not initialized");
            return null;
        }

        if (idToken == null || idToken.isBlank()) {
            log.warn("Empty ID token provided");
            return null;
        }

        try {
            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                log.warn("Invalid Google ID token");
                return null;
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            // Verify email is verified
            if (!payload.getEmailVerified()) {
                log.warn("Google email not verified for: {}", payload.getEmail());
                return null;
            }

            GoogleUserInfo userInfo = new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    (String) payload.get("given_name"),
                    (String) payload.get("family_name"),
                    (String) payload.get("name"),
                    (String) payload.get("picture"),
                    payload.getEmailVerified(),
                    (String) payload.get("locale"));

            log.debug("Google token verified for: {}", userInfo.email());
            return userInfo;

        } catch (Exception e) {
            log.error("Failed to verify Google ID token", e);
            return null;
        }
    }

    /**
     * Verified Google user information
     */
    public record GoogleUserInfo(
            String sub, // Google user ID (unique, stable)
            String email,
            String givenName, // First name
            String familyName, // Last name
            String name, // Full name
            String pictureUrl, // Profile picture URL
            boolean emailVerified,
            String locale // User's locale (e.g., "tr")
    ) {
    }
}
