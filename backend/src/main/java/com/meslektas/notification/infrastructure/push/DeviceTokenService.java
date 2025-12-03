package com.meslektas.notification.infrastructure.push;

import com.meslektas.notification.domain.model.DeviceToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Device Token Management Service
 * 
 * Handles registration, refresh, and cleanup of FCM device tokens.
 * 
 * Features:
 * - Register new device tokens
 * - Update existing tokens
 * - Deactivate invalid tokens
 * - Automatic cleanup of stale tokens
 * - Multi-device support per user
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceTokenService {
    
    private final DeviceTokenRepository deviceTokenRepository;
    
    private static final int MAX_TOKENS_PER_USER = 10;
    private static final int INACTIVE_DAYS_THRESHOLD = 60;
    private static final int OLD_TOKEN_DAYS_THRESHOLD = 90;
    
    /**
     * Register or update a device token
     * 
     * @param userId User ID
     * @param token FCM token
     * @param platform Device platform
     * @param deviceName Device name/model
     * @return Registered DeviceToken
     */
    @Transactional
    public DeviceToken registerToken(
        Long userId,
        String token,
        DeviceToken.Platform platform,
        String deviceName
    ) {
        log.info("Registering device token for user: {}, platform: {}", userId, platform);
        
        // Check if token already exists
        Optional<DeviceToken> existingToken = deviceTokenRepository.findByToken(token);
        
        if (existingToken.isPresent()) {
            DeviceToken deviceToken = existingToken.get();
            
            // Token exists but for different user - need to create new one
            if (!deviceToken.getUserId().equals(userId)) {
                log.info("Token was assigned to user {}, deactivating and creating new for {}", 
                    deviceToken.getUserId(), userId);
                deviceToken.deactivate();
                deviceTokenRepository.save(deviceToken);
                
                // Create new token for new user
                DeviceToken newToken = DeviceToken.register(userId, token, platform, deviceName);
                return deviceTokenRepository.save(newToken);
            }
            
            // Update token info - reactivate if needed
            deviceToken.activate();
            deviceToken.markAsUsed();
            
            return deviceTokenRepository.save(deviceToken);
        }
        
        // Check token limit per user
        long tokenCount = deviceTokenRepository.countByUserIdAndActiveTrue(userId);
        if (tokenCount >= MAX_TOKENS_PER_USER) {
            log.info("User {} has too many tokens ({}), limit is {}", userId, tokenCount, MAX_TOKENS_PER_USER);
            // In production, would deactivate oldest tokens
        }
        
        // Create new token using factory method
        DeviceToken newToken = DeviceToken.register(userId, token, platform, deviceName);
        
        DeviceToken saved = deviceTokenRepository.save(newToken);
        log.info("Device token registered: id={}, user={}, platform={}", 
            saved.getId(), userId, platform);
        
        return saved;
    }
    
    /**
     * Get all active tokens for a user
     */
    @Transactional(readOnly = true)
    public List<String> getActiveTokens(Long userId) {
        return deviceTokenRepository.findByUserIdAndActiveTrue(userId)
            .stream()
            .map(DeviceToken::getToken)
            .toList();
    }
    
    /**
     * Get all active tokens for multiple users
     */
    @Transactional(readOnly = true)
    public List<String> getActiveTokensForUsers(List<Long> userIds) {
        return deviceTokenRepository.findActiveByUserIds(userIds)
            .stream()
            .map(DeviceToken::getToken)
            .toList();
    }
    
    /**
     * Deactivate a token (e.g., on logout)
     */
    @Transactional
    public void deactivateToken(String token) {
        int updated = deviceTokenRepository.deactivateByToken(token, LocalDateTime.now());
        if (updated > 0) {
            log.info("Device token deactivated: {}...", token.substring(0, Math.min(10, token.length())));
        }
    }
    
    /**
     * Deactivate all tokens for a user (e.g., on password change)
     */
    @Transactional
    public void deactivateAllUserTokens(Long userId) {
        int count = deviceTokenRepository.deactivateAllForUser(userId, LocalDateTime.now());
        log.info("Deactivated {} tokens for user {}", count, userId);
    }
    
    /**
     * Mark tokens as invalid (reported by FCM)
     */
    @Transactional
    public void markTokensAsInvalid(List<String> tokens) {
        LocalDateTime now = LocalDateTime.now();
        for (String token : tokens) {
            deviceTokenRepository.deactivateByToken(token, now);
        }
        log.info("Marked {} tokens as invalid", tokens.size());
    }
    
    /**
     * Update token's last used timestamp
     */
    @Transactional
    public void updateLastUsed(String token) {
        deviceTokenRepository.findByToken(token)
            .ifPresent(deviceToken -> {
                deviceToken.markAsUsed();
                deviceTokenRepository.save(deviceToken);
            });
    }
    
    /**
     * Check if token is active
     */
    @Transactional(readOnly = true)
    public boolean isTokenActive(String token) {
        return deviceTokenRepository.findByToken(token)
            .map(DeviceToken::isActive)
            .orElse(false);
    }
    
    /**
     * Cleanup inactive tokens - runs daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupInactiveTokens() {
        log.info("Starting device token cleanup");
        
        // Deactivate tokens not used in 60 days
        LocalDateTime inactiveCutoff = LocalDateTime.now().minusDays(INACTIVE_DAYS_THRESHOLD);
        int deactivated = deviceTokenRepository.deactivateInactiveTokens(inactiveCutoff, LocalDateTime.now());
        log.info("Deactivated {} inactive tokens", deactivated);
        
        // Delete old inactive tokens (90 days)
        LocalDateTime deleteCutoff = LocalDateTime.now().minusDays(OLD_TOKEN_DAYS_THRESHOLD);
        int deleted = deviceTokenRepository.deleteOldInactiveTokens(deleteCutoff);
        log.info("Deleted {} old inactive tokens", deleted);
    }
}
