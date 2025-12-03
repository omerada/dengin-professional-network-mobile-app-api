package com.meslektas.identity.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.identity.application.dto.request.PasswordResetConfirmRequest;
import com.meslektas.identity.application.dto.request.PasswordResetRequest;
import com.meslektas.identity.domain.event.PasswordChangedEvent;
import com.meslektas.identity.domain.model.OAuthProvider;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.notification.domain.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

/**
 * Password Reset Service
 * 
 * Handles password reset flow:
 * 1. Request reset: Generate token, store in Redis, send email
 * 2. Confirm reset: Validate token, update password, invalidate sessions
 * 
 * Security Features:
 * - Tokens stored in Redis with 1-hour TTL
 * - Rate limiting via Redis (max 3 requests/hour per email)
 * - All user sessions invalidated on password change
 * - Always returns success to prevent email enumeration
 * 
 * DDD Pattern: Application Service
 * 
 * Sprint 2 Implementation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;

    @Value("${app.frontend-url:https://meslektas.com}")
    private String frontendUrl;

    private static final String RESET_TOKEN_PREFIX = "password_reset:token:";
    private static final String RESET_RATE_LIMIT_PREFIX = "password_reset:rate_limit:";
    private static final long RESET_TOKEN_TTL_MINUTES = 60; // 1 hour
    private static final long RATE_LIMIT_WINDOW_HOURS = 1;
    private static final int MAX_RESET_ATTEMPTS = 3;

    /**
     * Request password reset
     * 
     * Flow:
     * 1. Check rate limit (max 3 requests/hour)
     * 2. Find user by email
     * 3. Generate reset token (UUID)
     * 4. Store token in Redis (1-hour TTL)
     * 5. Send reset email
     * 
     * Note: Always returns success to prevent email enumeration attack
     * 
     * @param request Password reset request with email
     */
    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        String email = request.getEmail().toLowerCase();
        log.info("Password reset requested for email: {}", email);

        // Check rate limit
        if (isRateLimited(email)) {
            log.warn("Password reset rate limit exceeded for email: {}", email);
            // Still return success to prevent enumeration
            return;
        }

        // Find user
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.warn("Password reset requested for non-existent email: {}", email);
            // Return success to prevent enumeration
            incrementRateLimitCounter(email);
            return;
        }

        // Check if user is active
        if (!user.isActive()) {
            log.warn("Password reset requested for inactive user: {}", email);
            incrementRateLimitCounter(email);
            return;
        }

        // Check if OAuth user (they can't reset password)
        if (user.isOAuthUser() && user.getOauthProvider() != OAuthProvider.LOCAL) {
            log.info("OAuth user requested password reset, sending reminder: {}", email);
            emailService.sendOAuthLoginReminder(email, user.getOauthProvider().getDisplayName());
            incrementRateLimitCounter(email);
            return;
        }

        // Generate reset token
        String resetToken = java.util.UUID.randomUUID().toString();

        // Store token in Redis
        String redisKey = RESET_TOKEN_PREFIX + resetToken;
        redisTemplate.opsForValue().set(
                redisKey,
                user.getId().toString(),
                RESET_TOKEN_TTL_MINUTES,
                TimeUnit.MINUTES);

        log.info("Password reset token generated and stored: email={}, token={}", email, resetToken);

        // Increment rate limit counter
        incrementRateLimitCounter(email);

        // Send reset email
        sendResetEmail(user, resetToken);

        log.info("Password reset email sent: email={}", email);
    }

    /**
     * Confirm password reset
     * 
     * Flow:
     * 1. Validate token from Redis
     * 2. Validate new password
     * 3. Find user by ID from token
     * 4. Update password (hash with BCrypt)
     * 5. Delete token from Redis
     * 6. Invalidate all user sessions (publish event)
     * 7. Send confirmation email
     * 
     * @param request Password reset confirmation request
     */
    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        String resetToken = request.getResetToken();
        log.info("Password reset confirmation: token={}", resetToken);

        // Validate passwords match
        if (!request.passwordsMatch()) {
            throw new BusinessException(
                    "Şifreler eşleşmiyor",
                    "PASSWORDS_DO_NOT_MATCH");
        }

        // Validate token
        String redisKey = RESET_TOKEN_PREFIX + resetToken;
        String userIdStr = redisTemplate.opsForValue().get(redisKey);

        if (userIdStr == null) {
            log.warn("Invalid or expired reset token: {}", resetToken);
            throw new BusinessException(
                    "Geçersiz veya süresi dolmuş token",
                    "INVALID_RESET_TOKEN");
        }

        // Find user
        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Update password - use reflection or add setter in User entity
        // For now, we'll use a workaround - create a new password update method in User
        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.resetPassword(hashedPassword);

        // Save
        userRepository.save(user);

        // Delete token from Redis
        redisTemplate.delete(redisKey);

        log.info("Password reset successful: userId={}", userId);

        // Publish PasswordChangedEvent (to invalidate all sessions)
        eventPublisher.publishEvent(new PasswordChangedEvent(
                userId,
                user.getEmail(),
                true // isPasswordReset = true
        ));

        // Send confirmation email
        sendConfirmationEmail(user);

        log.info("Password reset confirmation email sent: userId={}", userId);
    }

    /**
     * Check if email is rate limited
     * 
     * @param email Email address
     * @return true if rate limited
     */
    private boolean isRateLimited(String email) {
        String rateLimitKey = RESET_RATE_LIMIT_PREFIX + email;
        String countStr = redisTemplate.opsForValue().get(rateLimitKey);

        if (countStr == null) {
            return false;
        }

        int count = Integer.parseInt(countStr);
        return count >= MAX_RESET_ATTEMPTS;
    }

    /**
     * Increment rate limit counter
     * 
     * @param email Email address
     */
    private void incrementRateLimitCounter(String email) {
        String rateLimitKey = RESET_RATE_LIMIT_PREFIX + email;
        Long newCount = redisTemplate.opsForValue().increment(rateLimitKey);

        if (newCount != null && newCount == 1) {
            // Set expiration on first increment
            redisTemplate.expire(rateLimitKey, RATE_LIMIT_WINDOW_HOURS, TimeUnit.HOURS);
        }
    }

    /**
     * Send password reset email
     * 
     * @param user       User
     * @param resetToken Reset token
     */
    private void sendResetEmail(User user, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        log.info("Sending password reset email to: {}", user.getEmail());
        
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);
    }

    /**
     * Send password reset confirmation email
     * 
     * @param user User
     */
    private void sendConfirmationEmail(User user) {
        log.info("Sending password reset confirmation email to: {}", user.getEmail());
        
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getName());
    }
}
