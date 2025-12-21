package com.dengin.identity.domain.model;

/**
 * OAuth Provider Types
 * 
 * Supported authentication providers:
 * - GOOGLE: Google Sign-In (via ID token verification)
 * - APPLE: Apple Sign-In (via ID token verification)
 * - INSTAGRAM: Instagram OAuth (via Meta API) - planned
 * - LOCAL: Email/password registration
 */
public enum OAuthProvider {
    GOOGLE("Google"),
    APPLE("Apple"),
    INSTAGRAM("Instagram"),
    LOCAL("Email");
    
    private final String displayName;
    
    OAuthProvider(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
