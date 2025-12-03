package com.meslektas.identity.application.listener;

import com.meslektas.identity.domain.event.PasswordChangedEvent;
import com.meslektas.notification.domain.service.EmailService;
import com.meslektas.notification.infrastructure.push.DeviceTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Password Changed Event Listener
 * 
 * Handles security actions when user's password is changed:
 * 1. Invalidate all user sessions (Redis)
 * 2. Deactivate all device tokens (FCM)
 * 3. Send confirmation email
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class PasswordChangedEventListener {
    
    private static final String SESSION_PREFIX = "session:user:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:user:";
    
    private final StringRedisTemplate redisTemplate;
    private final DeviceTokenService deviceTokenService;
    private final EmailService emailService;
    
    /**
     * Handle password changed event
     */
    @EventListener
    @Async
    public void handlePasswordChanged(PasswordChangedEvent event) {
        log.info("Processing password changed event for user: {}", event.getUserId());
        
        try {
            // 1. Invalidate all sessions
            invalidateAllSessions(event.getUserId());
            
            // 2. Invalidate all refresh tokens
            invalidateRefreshTokens(event.getUserId());
            
            // 3. Deactivate all device tokens (FCM)
            deactivateDeviceTokens(event.getUserId());
            
            // 4. Send confirmation email
            if (event.isPasswordReset()) {
                // Password was reset via forgot password flow
                emailService.sendPasswordChangedEmail(event.getEmail(), null);
            } else {
                // Password was changed from settings
                emailService.sendPasswordChangedEmail(event.getEmail(), null);
            }
            
            log.info("Password changed event processed successfully for user: {}", event.getUserId());
            
        } catch (Exception e) {
            log.error("Error processing password changed event for user: {}", event.getUserId(), e);
        }
    }
    
    /**
     * Invalidate all user sessions in Redis
     */
    private void invalidateAllSessions(Long userId) {
        String pattern = SESSION_PREFIX + userId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        if (keys != null && !keys.isEmpty()) {
            Long deleted = redisTemplate.delete(keys);
            log.info("Invalidated {} sessions for user: {}", deleted, userId);
        }
    }
    
    /**
     * Invalidate all refresh tokens
     */
    private void invalidateRefreshTokens(Long userId) {
        String pattern = REFRESH_TOKEN_PREFIX + userId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        if (keys != null && !keys.isEmpty()) {
            Long deleted = redisTemplate.delete(keys);
            log.info("Invalidated {} refresh tokens for user: {}", deleted, userId);
        }
    }
    
    /**
     * Deactivate all FCM device tokens
     */
    private void deactivateDeviceTokens(Long userId) {
        try {
            deviceTokenService.deactivateAllUserTokens(userId);
            log.info("Deactivated all device tokens for user: {}", userId);
        } catch (Exception e) {
            log.warn("Could not deactivate device tokens for user: {}", userId, e);
        }
    }
}
