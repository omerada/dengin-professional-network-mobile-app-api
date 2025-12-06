package com.meslektas.notification.infrastructure.email;

import com.meslektas.notification.domain.model.NotificationContent;
import com.meslektas.notification.domain.model.NotificationType;
import com.meslektas.notification.domain.service.EmailService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Mailgun Email Service Implementation
 * 
 * Production-ready email service using Mailgun API.
 * Supports:
 * - Transactional emails
 * - HTML templates
 * - Retry logic with exponential backoff
 * - Rate limiting awareness
 */
@Service
@Primary
@Slf4j
@RequiredArgsConstructor
public class MailgunEmailService implements EmailService {

    private final EmailTemplateRenderer templateRenderer;

    @Value("${mailgun.api-key:}")
    private String apiKey;

    @Value("${mailgun.domain:}")
    private String domain;

    @Value("${mailgun.sender-email:noreply@meslektas.com}")
    private String senderEmail;

    @Value("${mailgun.sender-name:Meslektaş}")
    private String senderName;

    @Value("${mailgun.enabled:true}")
    private boolean emailEnabled;

    @Value("${mailgun.base-url:https://api.eu.mailgun.net/v3}")
    private String baseUrl;

    private OkHttpClient httpClient;

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 1000;

    @PostConstruct
    public void init() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();

        if (isConfigured()) {
            log.info("Mailgun email service initialized for domain: {}", domain);
        } else {
            log.warn("Mailgun not fully configured, emails will be logged only");
        }
    }

    @Override
    @Async
    public void sendNotificationEmail(
            String recipientEmail,
            String recipientName,
            NotificationType type,
            NotificationContent content,
            Map<String, String> metadata) {

        if (!isReady()) {
            logEmail("notification", recipientEmail, type.name());
            return;
        }

        log.info("Sending notification email: type={}, recipient={}", type, recipientEmail);

        try {
            String subject = getSubjectForType(type, content);
            String htmlBody = templateRenderer.renderNotificationEmail(type, content, recipientName, metadata);

            sendEmailWithRetry(recipientEmail, recipientName, subject, htmlBody);
            log.info("Notification email sent: type={}, recipient={}", type, recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send notification email: type={}, recipient={}", type, recipientEmail, e);
        }
    }

    @Override
    @Async
    public void sendVerificationEmail(String recipientEmail, String recipientName, String verificationLink) {
        if (!isReady()) {
            logEmail("verification", recipientEmail, verificationLink);
            return;
        }

        log.info("Sending verification email to: {}", recipientEmail);

        try {
            String subject = "E-posta Adresinizi Doğrulayın - Meslektaş";
            String htmlBody = templateRenderer.renderVerificationEmail(recipientName, verificationLink);

            sendEmailWithRetry(recipientEmail, recipientName, subject, htmlBody);
            log.info("Verification email sent to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", recipientEmail, e);
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetLink) {
        if (!isReady()) {
            logEmail("password-reset", recipientEmail, resetLink);
            return;
        }

        log.info("Sending password reset email to: {}", recipientEmail);

        try {
            String subject = "Şifre Sıfırlama - Meslektaş";
            String htmlBody = templateRenderer.renderPasswordResetEmail(recipientName, resetLink);

            sendEmailWithRetry(recipientEmail, recipientName, subject, htmlBody);
            log.info("Password reset email sent to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", recipientEmail, e);
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String recipientEmail, String recipientName) {
        if (!isReady()) {
            logEmail("welcome", recipientEmail, null);
            return;
        }

        log.info("Sending welcome email to: {}", recipientEmail);

        try {
            String subject = "Meslektaş'a Hoş Geldiniz!";
            String htmlBody = templateRenderer.renderWelcomeEmail(recipientName);

            sendEmailWithRetry(recipientEmail, recipientName, subject, htmlBody);
            log.info("Welcome email sent to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", recipientEmail, e);
        }
    }

    @Override
    @Async
    public void sendOAuthLoginReminder(String recipientEmail, String oauthProviderName) {
        if (!isReady()) {
            logEmail("oauth-reminder", recipientEmail, oauthProviderName);
            return;
        }

        log.info("Sending OAuth login reminder to: {}", recipientEmail);

        try {
            String subject = "Şifre Sıfırlama Hakkında - Meslektaş";
            String htmlBody = templateRenderer.renderOAuthReminderEmail(oauthProviderName);

            sendEmailWithRetry(recipientEmail, null, subject, htmlBody);
            log.info("OAuth reminder email sent to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send OAuth reminder email to: {}", recipientEmail, e);
        }
    }

    @Override
    @Async
    public void sendPasswordChangedEmail(String recipientEmail, String recipientName) {
        if (!isReady()) {
            logEmail("password-changed", recipientEmail, null);
            return;
        }

        log.info("Sending password changed email to: {}", recipientEmail);

        try {
            String subject = "Şifreniz Değiştirildi - Meslektaş";
            String htmlBody = templateRenderer.renderPasswordChangedEmail(recipientName);

            sendEmailWithRetry(recipientEmail, recipientName, subject, htmlBody);
            log.info("Password changed email sent to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send password changed email to: {}", recipientEmail, e);
        }
    }

    /**
     * Send email with retry logic and exponential backoff
     */
    private void sendEmailWithRetry(String recipientEmail, String recipientName, String subject, String htmlBody)
            throws IOException {

        String fromAddress = senderName != null && !senderName.isBlank()
                ? senderName + " <" + senderEmail + ">"
                : senderEmail;

        String toAddress = recipientName != null && !recipientName.isBlank()
                ? recipientName + " <" + recipientEmail + ">"
                : recipientEmail;

        IOException lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // Build form data
                FormBody.Builder formBuilder = new FormBody.Builder()
                        .add("from", fromAddress)
                        .add("to", toAddress)
                        .add("subject", subject)
                        .add("html", htmlBody);

                // Add tracking tags
                formBuilder.add("o:tag", "meslektas-transactional");
                formBuilder.add("o:tracking", "yes");
                formBuilder.add("o:tracking-clicks", "yes");
                formBuilder.add("o:tracking-opens", "yes");

                RequestBody formBody = formBuilder.build();

                String url = baseUrl + "/" + domain + "/messages";

                Request request = new Request.Builder()
                        .url(url)
                        .addHeader("Authorization", Credentials.basic("api", apiKey))
                        .post(formBody)
                        .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        log.debug("Email sent successfully via Mailgun: status={}", response.code());
                        return;
                    } else if (response.code() == 429) {
                        // Rate limited - wait longer with exponential backoff
                        long waitTime = INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt);
                        log.warn("Mailgun rate limit hit, waiting {}ms before retry...", waitTime);
                        Thread.sleep(waitTime);
                    } else {
                        String responseBody = response.body() != null ? response.body().string() : "No body";
                        log.warn("Mailgun returned error: status={}, body={}", response.code(), responseBody);

                        // Don't retry on client errors (4xx except 429)
                        if (response.code() >= 400 && response.code() < 500 && response.code() != 429) {
                            throw new IOException("Mailgun client error: " + response.code() + " - " + responseBody);
                        }

                        throw new IOException("Mailgun error: " + response.code());
                    }
                }
            } catch (IOException e) {
                lastException = e;
                log.warn("Email send attempt {} failed: {}", attempt, e.getMessage());

                if (attempt < MAX_RETRIES) {
                    try {
                        long waitTime = INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt - 1);
                        Thread.sleep(waitTime);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Email send interrupted", ie);
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Email send interrupted", e);
            }
        }

        throw new IOException("Failed to send email after " + MAX_RETRIES + " attempts", lastException);
    }

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !"not-configured".equals(apiKey)
                && domain != null && !domain.isBlank() && !"not-configured".equals(domain);
    }

    private boolean isReady() {
        return emailEnabled && isConfigured();
    }

    private void logEmail(String type, String recipient, String details) {
        if (!emailEnabled) {
            log.info("📧 [EMAIL DISABLED] Email sending is disabled in configuration");
        } else if (!isConfigured()) {
            log.info("📧 [EMAIL NOT CONFIGURED] Mailgun credentials not configured. Email would be sent: type={}, recipient={}, details={}",
                    type, recipient, details);
        } else {
            log.info("📧 [DEV MODE] Email would be sent: type={}, recipient={}, details={}",
                    type, recipient, details);
        }
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
}
