package com.meslektas.notification.domain.model;

/**
 * Enum representing all notification types in the system.
 * 
 * Categories:
 * - SOCIAL: Follower, likes, comments
 * - MESSAGING: New messages
 * - VERIFICATION: Verification status changes
 * - MODERATION: Content moderation actions
 * - SYSTEM: Welcome, password reset, account status
 */
public enum NotificationType {

    // ==================== SOCIAL ====================

    /**
     * Someone started following the user
     */
    NEW_FOLLOWER("new_follower", "Yeni takipçi", Category.SOCIAL),

    /**
     * Someone liked the user's post
     */
    POST_LIKED("post_liked", "Gönderi beğenisi", Category.SOCIAL),

    /**
     * Someone commented on the user's post
     */
    POST_COMMENTED("post_commented", "Gönderi yorumu", Category.SOCIAL),

    /**
     * Someone mentioned the user in a post or comment
     */
    MENTION("mention", "Bahsetme", Category.SOCIAL),

    // ==================== MESSAGING ====================

    /**
     * New message received
     */
    NEW_MESSAGE("new_message", "Yeni mesaj", Category.MESSAGING),

    // ==================== VERIFICATION ====================

    /**
     * Verification request approved
     */
    VERIFICATION_APPROVED("verification_approved", "Doğrulama onaylandı", Category.VERIFICATION),

    /**
     * Verification request rejected
     */
    VERIFICATION_REJECTED("verification_rejected", "Doğrulama reddedildi", Category.VERIFICATION),

    /**
     * Verification request requires manual review
     */
    VERIFICATION_PENDING_REVIEW("verification_pending_review", "Doğrulama inceleniyor", Category.VERIFICATION),

    // ==================== MODERATION ====================

    /**
     * User's post was flagged for review
     */
    POST_FLAGGED("post_flagged", "Gönderi işaretlendi", Category.MODERATION),

    /**
     * User's content was removed by moderation
     */
    CONTENT_REMOVED("content_removed", "İçerik kaldırıldı", Category.MODERATION),

    /**
     * Warning issued to user
     */
    WARNING_ISSUED("warning_issued", "Uyarı verildi", Category.MODERATION),

    // ==================== SYSTEM ====================

    /**
     * Welcome notification for new users
     */
    WELCOME("welcome", "Hoş geldiniz", Category.SYSTEM),

    /**
     * Password reset requested
     */
    PASSWORD_RESET("password_reset", "Şifre sıfırlama", Category.SYSTEM),

    /**
     * Account suspended
     */
    ACCOUNT_SUSPENDED("account_suspended", "Hesap askıya alındı", Category.SYSTEM),

    /**
     * Account reactivated
     */
    ACCOUNT_REACTIVATED("account_reactivated", "Hesap yeniden etkinleştirildi", Category.SYSTEM);

    private final String code;
    private final String displayName;
    private final Category category;

    NotificationType(String code, String displayName, Category category) {
        this.code = code;
        this.displayName = displayName;
        this.category = category;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Category getCategory() {
        return category;
    }

    /**
     * Get category name as string.
     */
    public String getCategoryName() {
        return category.name();
    }

    /**
     * Get description for this notification type.
     */
    public String getDescription() {
        return switch (this) {
            case NEW_FOLLOWER -> "Birisi sizi takip etmeye başladığında";
            case POST_LIKED -> "Gönderiniz beğenildiğinde";
            case POST_COMMENTED -> "Gönderinize yorum yapıldığında";
            case MENTION -> "Bir gönderi veya yorumda bahsedildiğinizde";
            case NEW_MESSAGE -> "Yeni mesaj aldığınızda";
            case VERIFICATION_APPROVED -> "Meslek doğrulamanız onaylandığında";
            case VERIFICATION_REJECTED -> "Meslek doğrulamanız reddedildiğinde";
            case VERIFICATION_PENDING_REVIEW -> "Doğrulamanız manuel incelemeye alındığında";
            case POST_FLAGGED -> "Gönderiniz incelemeye alındığında";
            case CONTENT_REMOVED -> "İçeriğiniz kaldırıldığında";
            case WARNING_ISSUED -> "Hesabınıza uyarı verildiğinde";
            case WELCOME -> "Hoş geldin bildirimi";
            case PASSWORD_RESET -> "Şifre sıfırlama talep edildiğinde";
            case ACCOUNT_SUSPENDED -> "Hesabınız askıya alındığında";
            case ACCOUNT_REACTIVATED -> "Hesabınız yeniden etkinleştirildiğinde";
        };
    }

    /**
     * Check if this notification type is in the social category
     */
    public boolean isSocial() {
        return category == Category.SOCIAL;
    }

    /**
     * Check if this notification type is in the messaging category
     */
    public boolean isMessaging() {
        return category == Category.MESSAGING;
    }

    /**
     * Check if this notification type is in the verification category
     */
    public boolean isVerification() {
        return category == Category.VERIFICATION;
    }

    /**
     * Check if this notification type is in the moderation category
     */
    public boolean isModeration() {
        return category == Category.MODERATION;
    }

    /**
     * Check if this notification type is in the system category
     */
    public boolean isSystem() {
        return category == Category.SYSTEM;
    }

    /**
     * Check if this notification type can be disabled by user preferences
     */
    public boolean isOptional() {
        // System and moderation notifications cannot be disabled
        return category == Category.SOCIAL ||
                category == Category.MESSAGING;
    }

    /**
     * Check if this notification type should send email by default
     */
    public boolean shouldEmailByDefault() {
        return this == VERIFICATION_APPROVED ||
                this == VERIFICATION_REJECTED ||
                this == PASSWORD_RESET ||
                this == ACCOUNT_SUSPENDED ||
                this == WARNING_ISSUED;
    }

    /**
     * Check if this notification type should send push by default
     */
    public boolean shouldPushByDefault() {
        return this == NEW_MESSAGE ||
                this == NEW_FOLLOWER ||
                this == VERIFICATION_APPROVED ||
                this == VERIFICATION_REJECTED;
    }

    /**
     * Notification category enum
     */
    public enum Category {
        SOCIAL("Sosyal"),
        MESSAGING("Mesajlaşma"),
        VERIFICATION("Doğrulama"),
        MODERATION("Moderasyon"),
        SYSTEM("Sistem");

        private final String displayName;

        Category(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
