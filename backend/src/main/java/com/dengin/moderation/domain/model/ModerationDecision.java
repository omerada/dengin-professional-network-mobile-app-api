package com.dengin.moderation.domain.model;

/**
 * Enum representing the moderation decision.
 */
public enum ModerationDecision {

    /**
     * Content approved - no violation found (false report).
     */
    APPROVE_CONTENT("İçerik Onaylandı", "İhlal bulunamadı, rapor geçersiz"),

    /**
     * Content removed - violates rules.
     */
    REMOVE_CONTENT("İçerik Kaldırıldı", "İçerik topluluk kurallarını ihlal ediyor"),

    /**
     * User warned - minor violation.
     */
    WARN_USER("Kullanıcı Uyarıldı", "Küçük ihlal, kullanıcıya uyarı verildi"),

    /**
     * User suspended - serious violation.
     */
    SUSPEND_USER("Kullanıcı Askıya Alındı", "Ciddi ihlal, hesap askıya alındı"),

    /**
     * User banned - extreme violation.
     */
    BAN_USER("Kullanıcı Yasaklandı", "Çok ciddi ihlal, hesap kalıcı olarak yasaklandı");

    private final String displayName;
    private final String description;

    ModerationDecision(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if this decision results in content removal.
     */
    public boolean removesContent() {
        return this != APPROVE_CONTENT;
    }

    /**
     * Check if this decision results in a user sanction.
     */
    public boolean sanctionsUser() {
        return this == WARN_USER || this == SUSPEND_USER || this == BAN_USER;
    }

    /**
     * Get corresponding sanction type.
     */
    public SanctionType getSanctionType() {
        return switch (this) {
            case WARN_USER -> SanctionType.WARNING;
            case SUSPEND_USER -> SanctionType.SUSPENSION_7_DAYS;
            case BAN_USER -> SanctionType.PERMANENT_BAN;
            default -> null;
        };
    }
}
