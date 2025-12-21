package com.dengin.moderation.domain.model;

/**
 * Enum representing the type of sanction applied to a user.
 * 
 * Sanctions escalate: WARNING → SUSPENSION → BAN
 */
public enum SanctionType {

    /**
     * Warning - no action taken, just notification.
     */
    WARNING("Uyarı", "Kullanıcıya uyarı verildi", 0),

    /**
     * Temporary suspension - 7 days.
     */
    SUSPENSION_7_DAYS("7 Gün Askıya Alma", "Hesap 7 gün süreyle askıya alındı", 7),

    /**
     * Temporary suspension - 30 days.
     */
    SUSPENSION_30_DAYS("30 Gün Askıya Alma", "Hesap 30 gün süreyle askıya alındı", 30),

    /**
     * Permanent ban.
     */
    PERMANENT_BAN("Kalıcı Yasak", "Hesap kalıcı olarak yasaklandı", -1);

    private final String displayName;
    private final String description;
    private final int durationDays;

    SanctionType(String displayName, String description, int durationDays) {
        this.displayName = displayName;
        this.description = description;
        this.durationDays = durationDays;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public int getDurationDays() {
        return durationDays;
    }

    /**
     * Check if this is a permanent sanction.
     */
    public boolean isPermanent() {
        return this == PERMANENT_BAN;
    }

    /**
     * Check if this is a suspension (temporary).
     */
    public boolean isSuspension() {
        return this == SUSPENSION_7_DAYS || this == SUSPENSION_30_DAYS;
    }

    /**
     * Check if this is just a warning.
     */
    public boolean isWarning() {
        return this == WARNING;
    }

    /**
     * Get the next escalation level.
     */
    public SanctionType escalate() {
        return switch (this) {
            case WARNING -> SUSPENSION_7_DAYS;
            case SUSPENSION_7_DAYS -> SUSPENSION_30_DAYS;
            case SUSPENSION_30_DAYS, PERMANENT_BAN -> PERMANENT_BAN;
        };
    }
}
