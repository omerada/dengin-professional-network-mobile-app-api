package com.dengin.moderation.domain.model;

/**
 * Enum representing the status of a content report.
 * 
 * Status Flow:
 * PENDING → UNDER_REVIEW → RESOLVED (APPROVED/REJECTED)
 * ↓
 * ESCALATED (for complex cases)
 */
public enum ReportStatus {

    /**
     * Report submitted, waiting for review.
     */
    PENDING("Beklemede", "Rapor inceleme için bekliyor"),

    /**
     * Report is being reviewed by a moderator.
     */
    UNDER_REVIEW("İnceleniyor", "Rapor bir moderatör tarafından inceleniyor"),

    /**
     * Report escalated to senior moderator.
     */
    ESCALATED("Üst Kademeye Aktarıldı", "Rapor kıdemli moderatöre aktarıldı"),

    /**
     * Report resolved - content approved (no violation).
     */
    RESOLVED_APPROVED("Onaylandı", "İçerik onaylandı, ihlal bulunamadı"),

    /**
     * Report resolved - content rejected (violation found).
     */
    RESOLVED_REJECTED("Reddedildi", "İçerik reddedildi, ihlal tespit edildi"),

    /**
     * Report dismissed as invalid or duplicate.
     */
    DISMISSED("Reddedildi", "Rapor geçersiz veya mükerrer olarak reddedildi");

    private final String displayName;
    private final String description;

    ReportStatus(String displayName, String description) {
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
     * Check if this is a final/resolved status.
     */
    public boolean isFinal() {
        return this == RESOLVED_APPROVED || this == RESOLVED_REJECTED || this == DISMISSED;
    }

    /**
     * Check if this status allows review.
     */
    public boolean canBeReviewed() {
        return this == PENDING || this == UNDER_REVIEW || this == ESCALATED;
    }

    /**
     * Check if this is a pending status.
     */
    public boolean isPending() {
        return this == PENDING || this == UNDER_REVIEW || this == ESCALATED;
    }

    /**
     * Check if report is resolved with action taken.
     */
    public boolean isActionTaken() {
        return this == RESOLVED_REJECTED;
    }
}
