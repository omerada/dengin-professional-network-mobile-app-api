package com.dengin.identity.infrastructure.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Apple ID Token Verifier
 * 
 * Verifies Apple ID tokens using Apple's public keys.
 * 
 * Apple Sign In flow:
 * 1. User authenticates in iOS app
 * 2. iOS app sends identity token to backend
 * 3. Backend fetches Apple's public keys
 * 4. Backend verifies token signature
 * 5. Backend extracts user info from claims
 * 
 * Note: User's name is only provided on FIRST login.
 * Mobile app must send the name along with the token.
 * 
 * Configuration:
 * - apple.oauth.client-id: Your app's bundle ID (e.g., com.dengin.app)
 * - apple.oauth.team-id: Your Apple Developer Team ID
 */
@Component
@Slf4j
public class AppleTokenVerifier {
    
    private static final String APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";
    private static final String APPLE_ISSUER = "https://appleid.apple.com";
    
    @Value("${apple.oauth.client-id:}")
    private String clientId;
    
    @Value("${apple.oauth.team-id:}")
    private String teamId;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, PublicKey> publicKeys = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() {
        if (clientId == null || clientId.isBlank()) {
            log.warn("Apple OAuth client ID not configured. Apple sign-in will be disabled.");
            return;
        }
        
        // Load Apple's public keys
        refreshPublicKeys();
        log.info("Apple Token Verifier initialized for client: {}", clientId);
    }
    
    /**
     * Refresh Apple's public keys (run daily)
     */
    @Scheduled(fixedRate = 24 * 60 * 60 * 1000) // 24 hours
    public void refreshPublicKeys() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(APPLE_KEYS_URL, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Failed to fetch Apple public keys");
                return;
            }
            
            JsonNode keysNode = objectMapper.readTree(response.getBody()).get("keys");
            
            publicKeys.clear();
            
            for (JsonNode keyNode : keysNode) {
                String kid = keyNode.get("kid").asText();
                String n = keyNode.get("n").asText();
                String e = keyNode.get("e").asText();
                
                PublicKey publicKey = buildPublicKey(n, e);
                if (publicKey != null) {
                    publicKeys.put(kid, publicKey);
                }
            }
            
            log.info("Loaded {} Apple public keys", publicKeys.size());
            
        } catch (Exception ex) {
            log.error("Failed to refresh Apple public keys", ex);
        }
    }
    
    /**
     * Verify Apple ID token and extract user info
     * 
     * @param idToken Apple ID token from iOS app
     * @return AppleUserInfo or null if invalid
     */
    public AppleUserInfo verify(String idToken) {
        if (clientId == null || clientId.isBlank()) {
            log.error("Apple OAuth not configured");
            return null;
        }
        
        if (idToken == null || idToken.isBlank()) {
            log.warn("Empty ID token provided");
            return null;
        }
        
        try {
            // Parse header to get key ID
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                log.warn("Invalid JWT format");
                return null;
            }
            
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
            JsonNode header = objectMapper.readTree(headerJson);
            String kid = header.get("kid").asText();
            
            // Get public key for this token
            PublicKey publicKey = publicKeys.get(kid);
            if (publicKey == null) {
                // Key not found, try refreshing
                refreshPublicKeys();
                publicKey = publicKeys.get(kid);
                
                if (publicKey == null) {
                    log.warn("Apple public key not found for kid: {}", kid);
                    return null;
                }
            }
            
            // Verify and parse token
            Claims claims = Jwts.parser()
                .verifyWith(publicKey)
                .requireIssuer(APPLE_ISSUER)
                .requireAudience(clientId)
                .build()
                .parseSignedClaims(idToken)
                .getPayload();
            
            // Extract user info
            String email = claims.get("email", String.class);
            Boolean emailVerified = claims.get("email_verified", Boolean.class);
            
            // Apple may hide email - use private relay
            if (email == null) {
                email = claims.get("private_email", String.class);
            }
            
            if (email == null) {
                log.warn("No email in Apple ID token");
                return null;
            }
            
            AppleUserInfo userInfo = new AppleUserInfo(
                claims.getSubject(),
                email,
                emailVerified != null && emailVerified,
                claims.get("is_private_email", Boolean.class) != null &&
                    claims.get("is_private_email", Boolean.class)
            );
            
            log.debug("Apple token verified for: {}", userInfo.email());
            return userInfo;
            
        } catch (ExpiredJwtException e) {
            log.warn("Expired Apple ID token");
            return null;
        } catch (JwtException e) {
            log.warn("Invalid Apple ID token: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Failed to verify Apple ID token", e);
            return null;
        }
    }
    
    /**
     * Build RSA public key from modulus and exponent
     */
    private PublicKey buildPublicKey(String modulusBase64, String exponentBase64) {
        try {
            byte[] nBytes = Base64.getUrlDecoder().decode(modulusBase64);
            byte[] eBytes = Base64.getUrlDecoder().decode(exponentBase64);
            
            BigInteger modulus = new BigInteger(1, nBytes);
            BigInteger exponent = new BigInteger(1, eBytes);
            
            RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
            KeyFactory factory = KeyFactory.getInstance("RSA");
            
            return factory.generatePublic(spec);
            
        } catch (Exception e) {
            log.error("Failed to build public key", e);
            return null;
        }
    }
    
    /**
     * Verified Apple user information
     */
    public record AppleUserInfo(
        String sub,           // Apple user ID (unique, stable)
        String email,
        boolean emailVerified,
        boolean isPrivateEmail  // True if using Apple's private relay email
    ) {}
}
