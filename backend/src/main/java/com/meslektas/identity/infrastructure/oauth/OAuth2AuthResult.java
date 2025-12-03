package com.meslektas.identity.infrastructure.oauth;

import lombok.Builder;
import lombok.Value;

/**
 * OAuth2 Authentication Result
 * 
 * Response DTO for OAuth2 authentication endpoints.
 */
@Value
@Builder
public class OAuth2AuthResult {
    
    String accessToken;
    String refreshToken;
    String tokenType;
    long expiresIn;
    boolean isNewUser;
    UserInfo user;
    
    @Value
    @Builder
    public static class UserInfo {
        Long id;
        String email;
        String name;
        String surname;
        String avatarUrl;
        String verificationStatus;
        
        public String getFullName() {
            if (name == null && surname == null) return null;
            if (name == null) return surname;
            if (surname == null) return name;
            return name + " " + surname;
        }
    }
}
