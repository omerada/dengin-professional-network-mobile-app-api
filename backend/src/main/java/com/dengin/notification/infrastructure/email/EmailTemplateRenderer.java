package com.dengin.notification.infrastructure.email;

import com.dengin.notification.domain.model.NotificationContent;
import com.dengin.notification.domain.model.NotificationType;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Email template renderer.
 * 
 * Generates HTML email content from templates.
 * Uses inline styles for maximum email client compatibility.
 */
@Component
public class EmailTemplateRenderer {

    private static final String PRIMARY_COLOR = "#2563EB";
    private static final String SUCCESS_COLOR = "#10B981";
    private static final String WARNING_COLOR = "#F59E0B";
    private static final String DANGER_COLOR = "#EF4444";

    /**
     * Render notification email.
     */
    public String renderNotificationEmail(
            NotificationType type,
            NotificationContent content,
            String recipientName,
            Map<String, String> metadata) {
        String iconColor = getIconColorForType(type);

        return renderBaseTemplate(
                content.getTitle(),
                buildNotificationBody(content, recipientName),
                content.getActionUrl(),
                getButtonTextForType(type),
                iconColor);
    }

    /**
     * Render verification email.
     */
    public String renderVerificationEmail(String recipientName, String verificationLink) {
        String body = String.format("""
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Merhaba %s,
                </p>
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Dengin hesabınızı oluşturduğunuz için teşekkür ederiz.
                    E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın.
                </p>
                <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                    Bu bağlantı 24 saat süreyle geçerlidir.
                </p>
                """, recipientName);

        return renderBaseTemplate(
                "E-posta Doğrulama",
                body,
                verificationLink,
                "E-postamı Doğrula",
                PRIMARY_COLOR);
    }

    /**
     * Render password reset email.
     */
    public String renderPasswordResetEmail(String recipientName, String resetLink) {
        String body = String.format("""
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Merhaba %s,
                </p>
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Şifre sıfırlama talebinde bulundunuz. Yeni bir şifre belirlemek için
                    aşağıdaki butona tıklayın.
                </p>
                <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                    Bu bağlantı 1 saat süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız,
                    bu e-postayı görmezden gelebilirsiniz.
                </p>
                """, recipientName);

        return renderBaseTemplate(
                "Şifre Sıfırlama",
                body,
                resetLink,
                "Şifremi Sıfırla",
                WARNING_COLOR);
    }

    /**
     * Render welcome email.
     */
    public String renderWelcomeEmail(String recipientName) {
        String body = String.format("""
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Merhaba %s,
                </p>
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Dengin'a hoş geldiniz! 🎉
                </p>
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Sağlık sektöründeki meslektaşlarınızla bağlantı kurmak, bilgi paylaşmak
                    ve profesyonel ağınızı genişletmek için doğru yerdesiniz.
                </p>
                <h3 style="margin: 24px 0 12px 0; color: #111827; font-size: 18px;">
                    Başlamak için:
                </h3>
                <ul style="margin: 0 0 16px 0; padding-left: 24px; color: #374151; font-size: 16px; line-height: 1.8;">
                    <li>Profilinizi tamamlayın</li>
                    <li>Meslek doğrulaması yapın</li>
                    <li>Denginlarınızı takip edin</li>
                    <li>İlk gönderinizi paylaşın</li>
                </ul>
                """, recipientName);

        return renderBaseTemplate(
                "Dengin'a Hoş Geldiniz!",
                body,
                "https://dengin.com/dashboard",
                "Profili Tamamla",
                SUCCESS_COLOR);
    }

    /**
     * Render OAuth login reminder email.
     */
    public String renderOAuthReminderEmail(String oauthProviderName) {
        String body = String.format("""
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Merhaba,
                </p>
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Şifre sıfırlama talebinde bulundunuz. Ancak hesabınız <strong>%s</strong> ile oluşturulmuş.
                </p>
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Giriş yapmak için lütfen <strong>%s ile Giriş Yap</strong> seçeneğini kullanın.
                </p>
                <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                    Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                </p>
                """, oauthProviderName, oauthProviderName);

        return renderBaseTemplate(
                "Şifre Sıfırlama Hakkında",
                body,
                "https://dengin.com/login",
                "Giriş Yap",
                PRIMARY_COLOR);
    }

    /**
     * Render password changed confirmation email.
     */
    public String renderPasswordChangedEmail(String recipientName) {
        String body = String.format(
                """
                        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Merhaba %s,
                        </p>
                        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Şifreniz başarıyla değiştirildi. ✅
                        </p>
                        <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                            Güvenlik amacıyla tüm cihazlarınızdan çıkış yapıldı. Yeni şifrenizle
                            tekrar giriş yapabilirsiniz.
                        </p>
                        <div style="background-color: #FEF2F2; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.5;">
                                <strong>⚠️ Bu işlemi siz yapmadıysanız</strong><br>
                                Lütfen hemen <a href="mailto:destek@dengin.com" style="color: #991B1B;">destek@dengin.com</a>
                                adresinden bizimle iletişime geçin.
                            </p>
                        </div>
                        """,
                recipientName);

        return renderBaseTemplate(
                "Şifreniz Değiştirildi",
                body,
                null,
                null,
                SUCCESS_COLOR);
    }

    /**
     * Render base email template.
     */
    private String renderBaseTemplate(
            String title,
            String body,
            String actionUrl,
            String buttonText,
            String buttonColor) {
        String actionButton = actionUrl != null && buttonText != null ? String.format(
                """
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" style="display: inline-block; background-color: %s; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                %s
                            </a>
                        </div>
                        """,
                actionUrl, buttonColor, buttonText) : "";

        return String.format(
                """
                        <!DOCTYPE html>
                        <html lang="tr">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>%s</title>
                        </head>
                        <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                            <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 40px 20px;">
                                        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                            <!-- Header -->
                                            <tr>
                                                <td style="padding: 32px 32px 0 32px; text-align: center;">
                                                    <img src="https://dengin.com/logo.png" alt="Dengin" style="height: 40px; margin-bottom: 24px;">
                                                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 600;">
                                                        %s
                                                    </h1>
                                                </td>
                                            </tr>

                                            <!-- Content -->
                                            <tr>
                                                <td style="padding: 24px 32px;">
                                                    %s
                                                    %s
                                                </td>
                                            </tr>

                                            <!-- Footer -->
                                            <tr>
                                                <td style="padding: 24px 32px; border-top: 1px solid #E5E7EB;">
                                                    <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center; line-height: 1.5;">
                                                        Bu e-posta Dengin tarafından gönderilmiştir.<br>
                                                        <a href="https://dengin.com/settings/notifications" style="color: #6B7280;">Bildirim tercihlerini yönet</a>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                        """,
                title, title, body, actionButton);
    }

    private String buildNotificationBody(NotificationContent content, String recipientName) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("""
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Merhaba %s,
                </p>
                """, recipientName));

        if (content.getBody() != null) {
            sb.append(String.format("""
                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                        %s
                    </p>
                    """, content.getBody()));
        }

        return sb.toString();
    }

    private String getIconColorForType(NotificationType type) {
        return switch (type) {
            case VERIFICATION_APPROVED, ACCOUNT_REACTIVATED, WELCOME -> SUCCESS_COLOR;
            case VERIFICATION_REJECTED, ACCOUNT_SUSPENDED, CONTENT_REMOVED -> DANGER_COLOR;
            case VERIFICATION_PENDING_REVIEW, POST_FLAGGED, WARNING_ISSUED -> WARNING_COLOR;
            default -> PRIMARY_COLOR;
        };
    }

    private String getIconForType(NotificationType type) {
        return switch (type) {
            case NEW_FOLLOWER -> "👤";
            case POST_LIKED -> "❤️";
            case POST_COMMENTED -> "💬";
            case MENTION -> "@";
            case NEW_MESSAGE -> "✉️";
            case VERIFICATION_APPROVED -> "✅";
            case VERIFICATION_REJECTED -> "❌";
            case VERIFICATION_PENDING_REVIEW -> "⏳";
            case WELCOME -> "🎉";
            default -> "🔔";
        };
    }

    private String getButtonTextForType(NotificationType type) {
        return switch (type) {
            case NEW_FOLLOWER -> "Profili Görüntüle";
            case POST_LIKED, POST_COMMENTED -> "Gönderiyi Görüntüle";
            case NEW_MESSAGE -> "Mesajları Görüntüle";
            case VERIFICATION_APPROVED -> "Profilimi Görüntüle";
            case VERIFICATION_REJECTED, VERIFICATION_PENDING_REVIEW -> "Detayları Görüntüle";
            default -> "Görüntüle";
        };
    }
}
