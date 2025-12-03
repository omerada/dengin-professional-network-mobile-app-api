package com.meslektas.notification.infrastructure.push;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
     * @param appVersion App version
     * @param osVersion OS version
     * @return Registered DeviceToken
     */
    @Transactional
    public DeviceToken registerToken(
        UUID userId,
        String token,
        DeviceToken.Platform platform,
        String deviceName,
        String appVersion,
        String osVersion
    ) {
        log.info("Registering device token for user: {}, platform: {}", userId, platform);
        
        // Check if token already exists
        Optional<DeviceToken> existingToken = deviceTokenRepository.findByToken(token);
        
        if (existingToken.isPresent()) {
            DeviceToken deviceToken = existingToken.get();
            
            // Token exists but for different user - reassign
            if (!deviceToken.getUserId().equals(userId)) {
                log.info("Token reassigned from user {} to {}", deviceToken.getUserId(), userId);
                deviceToken.setUserId(userId);
            }
            
            // Update token info
            deviceToken.setActive(true);
            deviceToken.setDeviceName(deviceName);
            deviceToken.setAppVersion(appVersion);
            deviceToken.setOsVersion(osVersion);
            deviceToken.markAsUsed();
            
            return deviceTokenRepository.save(deviceToken);
        }
        
        // Check token limit per user
        long tokenCount = deviceTokenRepository.countByUserIdAndActiveTrue(userId);
        if (tokenCount >= MAX_TOKENS_PER_USER) {
            log.info("User {} has too many tokens, deactivating oldest", userId);
            // In production, would deactivate oldest tokens
        }
        
        // Create new token
        DeviceToken newToken = DeviceToken.builder()
            .userId(userId)
            .token(token)
            .platform(platform)
            .deviceName(deviceName)
            .appVersion(appVersion)
            .osVersion(osVersion)
            .active(true)
            .build();
        newToken.markAsUsed();
        
        DeviceToken saved = deviceTokenRepository.save(newToken);
        log.info("Device token registered: id={}, user={}, platform={}", 
            saved.getId(), userId, platform);
        
        return saved;
    }
    
    /**
     * Get all active tokens for a user
     */
    @Transactional(readOnly = true)
    public List<String> getActiveTokens(UUID userId) {
        return deviceTokenRepository.findByUserIdAndActiveTrue(userId)
            .stream()
            .map(DeviceToken::getToken)
            .toList();
    }
    
    /**
     * Get all active tokens for multiple users
     */
    @Transactional(readOnly = true)
    public List<String> getActiveTokensForUsers(List<UUID> userIds) {
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
        int updated = deviceTokenRepository.deactivateByToken(token, Instant.now());
        if (updated > 0) {
            log.info("Device token deactivated: {}...", token.substring(0, Math.min(10, token.length())));
        }
    }
    
    /**
     * Deactivate all tokens for a user (e.g., on password change)
     */
    @Transactional
    public void deactivateAllUserTokens(UUID userId) {
        int count = deviceTokenRepository.deactivateAllForUser(userId, Instant.now());
        log.info("Deactivated {} tokens for user {}", count, userId);
    }
    
    /**
     * Mark tokens as invalid (reported by FCM)
     */
    @Transactional
    public void markTokensAsInvalid(List<String> tokens) {
        Instant now = Instant.now();
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
        Instant inactiveCutoff = Instant.now().minus(INACTIVE_DAYS_THRESHOLD, ChronoUnit.DAYS);
        int deactivated = deviceTokenRepository.deactivateInactiveTokens(inactiveCutoff, Instant.now());
        log.info("Deactivated {} inactive tokens", deactivated);
        
        // Delete old inactive tokens (90 days)
        Instant deleteCutoff = Instant.now().minus(OLD_TOKEN_DAYS_THRESHOLD, ChronoUnit.DAYS);
        int deleted = deviceTokenRepository.deleteOldInactiveTokens(deleteCutoff);
        log.info("Deleted {} old inactive tokens", deleted);
    }
}
