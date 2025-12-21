package com.dengin.notification.domain.service;

import com.dengin.notification.domain.model.NotificationContent;
import com.dengin.notification.domain.model.NotificationType;

import java.util.Map;

/**
 * Email Service Interface
 * 
 * Defines email notification operations.
 * Implemented by EmailNotificationService using AWS SES.
 */
public interface EmailService {
    
    /**
     * Send notification email
     */
    void sendNotificationEmail(
        String recipientEmail,
        String recipientName,
        NotificationType type,
        NotificationContent content,
        Map<String, String> metadata
    );
    
    /**
     * Send email verification link
     */
    void sendVerificationEmail(String recipientEmail, String recipientName, String verificationLink);
    
    /**
     * Send password reset email
     */
    void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetLink);
    
    /**
     * Send welcome email
     */
    void sendWelcomeEmail(String recipientEmail, String recipientName);
    
    /**
     * Send OAuth login reminder
     * Used when user with OAuth account tries to reset password
     */
    void sendOAuthLoginReminder(String recipientEmail, String oauthProviderName);
    
    /**
     * Send password changed confirmation
     */
    void sendPasswordChangedEmail(String recipientEmail, String recipientName);
}
