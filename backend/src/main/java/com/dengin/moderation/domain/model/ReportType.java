package com.dengin.moderation.domain.model;

/**
 * Enum representing the type of content being reported.
 */
public enum ReportType {

    POST("Gönderi", "Bir gönderinin rapor edilmesi"),
    COMMENT("Yorum", "Bir yorumun rapor edilmesi"),
    USER("Kullanıcı", "Bir kullanıcı profilinin rapor edilmesi"),
    MESSAGE("Mesaj", "Bir mesajın rapor edilmesi");

    private final String displayName;
    private final String description;

    ReportType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
