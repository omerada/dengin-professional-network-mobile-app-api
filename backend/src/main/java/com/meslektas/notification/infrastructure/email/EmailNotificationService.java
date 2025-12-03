package com.meslektas.notification.infrastructure.email;

import com.meslektas.notification.domain.model.NotificationContent;
import com.meslektas.notification.domain.model.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import java.util.Map;

/**
 * AWS SES Email Notification Service.
 * 
 * Sends email notifications using AWS Simple Email Service.
 * Supports HTML templates with personalization.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailNotificationService {

    private final SesClient sesClient;
    private final EmailTemplateRenderer templateRenderer;

    @Value("${aws.ses.sender-email:noreply@meslektas.com}")
    private String senderEmail;

    @Value("${aws.ses.enabled:false}")
    private boolean emailEnabled;

    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000;

    /**
     * Send notification email.
     */
    @Async
    public void sendNotificationEmail(
            String recipientEmail,
            String recipientName,
            NotificationType type,
            NotificationContent content,
            Map<String, String> metadata) {
        if (!emailEnabled) {
            log.debug("Email notifications disabled, skipping email to: {}", recipientEmail);
            return;
        }

        log.info("Sending notification email: type={}, recipient={}", type, recipientEmail);

        try {
            String subject = getSubjectForType(type, content);
            String htmlBody = templateRenderer.renderNotificationEmail(type, content, recipientName, metadata);
            String textBody = getTextBody(content);

            sendEmailWithRetry(recipientEmail, subject, htmlBody, textBody);

            log.info("Notification email sent successfully: type={}, recipient={}", type, recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send notification email: type={}, recipient={}", type, recipientEmail, e);
        }
    }

    /**
     * Send verification email.
     */
    @Async
    public void sendVerificationEmail(String recipientEmail, String recipientName, String verificationLink) {
        if (!emailEnabled) {
            log.debug("Email notifications disabled, skipping verification email to: {}", recipientEmail);
            return;
        }

        log.info("Sending verification email to: {}", recipientEmail);

        try {
            String subject = "E-posta Adresinizi Doğrulayın - Meslektaş";
            String htmlBody = templateRenderer.renderVerificationEmail(recipientName, verificationLink);
            String textBody = String.format(
                    "Merhaba %s,\n\nE-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:\n%s\n\nBu bağlantı 24 saat içinde geçerliliğini yitirecektir.\n\nMeslektaş Ekibi",
                    recipientName, verificationLink);

            sendEmailWithRetry(recipientEmail, subject, htmlBody, textBody);

            log.info("Verification email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", recipientEmail, e);
        }
    }

    /**
     * Send password reset email.
     */
    @Async
    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetLink) {
        if (!emailEnabled) {
            log.debug("Email notifications disabled, skipping password reset email to: {}", recipientEmail);
            return;
        }

        log.info("Sending password reset email to: {}", recipientEmail);

        try {
            String subject = "Şifre Sıfırlama - Meslektaş";
            String htmlBody = templateRenderer.renderPasswordResetEmail(recipientName, resetLink);
            String textBody = String.format(
                    "Merhaba %s,\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n%s\n\nBu bağlantı 1 saat içinde geçerliliğini yitirecektir.\n\nBu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\nMeslektaş Ekibi",
                    recipientName, resetLink);

            sendEmailWithRetry(recipientEmail, subject, htmlBody, textBody);

            log.info("Password reset email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", recipientEmail, e);
        }
    }

    /**
     * Send welcome email.
     */
    @Async
    public void sendWelcomeEmail(String recipientEmail, String recipientName) {
        if (!emailEnabled) {
            log.debug("Email notifications disabled, skipping welcome email to: {}", recipientEmail);
            return;
        }

        log.info("Sending welcome email to: {}", recipientEmail);

        try {
            String subject = "Meslektaş'a Hoş Geldiniz!";
            String htmlBody = templateRenderer.renderWelcomeEmail(recipientName);
            String textBody = String.format(
                    "Merhaba %s,\n\nMeslektaş'a hoş geldiniz! Sağlık sektöründeki profesyonel ağınızı genişletmeye hazırsınız.\n\nProfilinizi tamamlayın, meslektaşlarınızı takip edin ve bilgi paylaşımına başlayın.\n\nMeslektaş Ekibi",
                    recipientName);

            sendEmailWithRetry(recipientEmail, subject, htmlBody, textBody);

            log.info("Welcome email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", recipientEmail, e);
        }
    }

    /**
     * Send email with retry logic.
     */
    private void sendEmailWithRetry(String recipient, String subject, String htmlBody, String textBody) {
        SesException lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                SendEmailRequest request = SendEmailRequest.builder()
                        .source(senderEmail)
                        .destination(Destination.builder()
                                .toAddresses(recipient)
                                .build())
                        .message(Message.builder()
                                .subject(Content.builder()
                                        .charset("UTF-8")
                                        .data(subject)
                                        .build())
                                .body(Body.builder()
                                        .html(Content.builder()
                                                .charset("UTF-8")
                                                .data(htmlBody)
                                                .build())
                                        .text(Content.builder()
                                                .charset("UTF-8")
                                                .data(textBody)
                                                .build())
                                        .build())
                                .build())
                        .build();

                sesClient.sendEmail(request);
                return; // Success

            } catch (SesException e) {
                lastException = e;
                log.warn("Email send attempt {} failed: {}", attempt, e.getMessage());

                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Email send interrupted", ie);
                    }
                }
            }
        }

        throw new RuntimeException("Failed to send email after " + MAX_RETRIES + " attempts", lastException);
    }

    private String getSubjectForType(NotificationType type, NotificationContent content) {
        if (content.getTitle() != null && !content.getTitle().isBlank()) {
            return content.getTitle() + " - Meslektaş";
        }

        return switch (type) {
            case NEW_FOLLOWER -> "Yeni takipçiniz var - Meslektaş";
            case POST_LIKED -> "Gönderiniz beğenildi - Meslektaş";
            case POST_COMMENTED -> "Gönderinize yorum yapıldı - Meslektaş";
            case MENTION -> "Bahsedildiniz - Meslektaş";
            case NEW_MESSAGE -> "Yeni mesajınız var - Meslektaş";
            case VERIFICATION_APPROVED -> "Meslek doğrulamanız onaylandı - Meslektaş";
            case VERIFICATION_REJECTED -> "Meslek doğrulamanız hakkında - Meslektaş";
            case VERIFICATION_PENDING_REVIEW -> "Doğrulama işleminiz inceleniyor - Meslektaş";
            case POST_FLAGGED -> "Gönderiniz hakkında bilgilendirme - Meslektaş";
            case CONTENT_REMOVED -> "İçerik bildirimi - Meslektaş";
            case WARNING_ISSUED -> "Önemli bilgilendirme - Meslektaş";
            case WELCOME -> "Meslektaş'a hoş geldiniz!";
            case PASSWORD_RESET -> "Şifre sıfırlama - Meslektaş";
            case ACCOUNT_SUSPENDED -> "Hesap bildirimi - Meslektaş";
            case ACCOUNT_REACTIVATED -> "Hesabınız aktif - Meslektaş";
        };
    }

    private String getTextBody(NotificationContent content) {
        StringBuilder sb = new StringBuilder();
        sb.append(content.getTitle());
        if (content.getBody() != null) {
            sb.append("\n\n").append(content.getBody());
        }
        if (content.getActionUrl() != null) {
            sb.append("\n\nDetaylar için: ").append(content.getActionUrl());
        }
        sb.append("\n\n---\nMeslektaş Ekibi");
        return sb.toString();
    }
}
