package com.dengin.identity.domain.model;

/**
 * Profession Categories
 * 
 * Business Rule (BR-003): Profession-based access control
 */
public enum ProfessionCategory {
    MEDICAL("Sağlık"),
    LEGAL("Hukuk"),
    ENGINEERING("Mühendislik"),
    EDUCATION("Eğitim"),
    SERVICE("Hizmet Sektörü"),
    CREATIVE("Yaratıcı Sektör"),
    BUSINESS("İş Dünyası"),
    OTHER("Diğer");

    private final String displayName;

    ProfessionCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
