package com.dengin.moderation.domain.model;

/**
 * Enum representing the reason for reporting content.
 * 
 * Categories:
 * - Inappropriate Content: SPAM, HARASSMENT, HATE_SPEECH, VIOLENCE,
 * ADULT_CONTENT
 * - Misleading: MISINFORMATION, IMPERSONATION, FAKE_CREDENTIALS
 * - Other: COPYRIGHT_VIOLATION, PRIVACY_VIOLATION, OTHER
 */
public enum ReportReason {

    // Inappropriate Content
    SPAM("Spam", "İstenmeyen veya gereksiz içerik", ReportCategory.INAPPROPRIATE),
    HARASSMENT("Taciz", "Hedef alarak rahatsız edici davranış", ReportCategory.INAPPROPRIATE),
    HATE_SPEECH("Nefret Söylemi", "Ayrımcılık veya nefret içeren dil", ReportCategory.INAPPROPRIATE),
    VIOLENCE("Şiddet", "Şiddet içeren veya tehditkâr içerik", ReportCategory.INAPPROPRIATE),
    ADULT_CONTENT("Yetişkin İçerik", "Cinsel veya müstehcen içerik", ReportCategory.INAPPROPRIATE),

    // Misleading
    MISINFORMATION("Yanlış Bilgi", "Kasıtlı olarak yanlış veya yanıltıcı bilgi", ReportCategory.MISLEADING),
    IMPERSONATION("Kimlik Taklidi", "Başka birinin kimliğine bürünme", ReportCategory.MISLEADING),
    FAKE_CREDENTIALS("Sahte Kimlik Bilgileri", "Sahte mesleki belgeler veya unvanlar", ReportCategory.MISLEADING),

    // Other
    COPYRIGHT_VIOLATION("Telif Hakkı İhlali", "İzinsiz olarak telif hakkı korumalı içerik paylaşımı",
            ReportCategory.OTHER),
    PRIVACY_VIOLATION("Gizlilik İhlali", "Kişisel bilgilerin izinsiz paylaşımı", ReportCategory.OTHER),
    OTHER("Diğer", "Yukarıdaki kategorilere uymayan ihlal", ReportCategory.OTHER);

    private final String displayName;
    private final String description;
    private final ReportCategory category;

    ReportReason(String displayName, String description, ReportCategory category) {
        this.displayName = displayName;
        this.description = description;
        this.category = category;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public ReportCategory getCategory() {
        return category;
    }

    /**
     * Check if this reason is considered high priority.
     */
    public boolean isHighPriority() {
        return this == VIOLENCE || this == HARASSMENT || this == HATE_SPEECH || this == ADULT_CONTENT;
    }

    /**
     * Check if this reason requires immediate action.
     */
    public boolean requiresImmediateAction() {
        return this == VIOLENCE;
    }

    /**
     * Report reason categories.
     */
    public enum ReportCategory {
        INAPPROPRIATE("Uygunsuz İçerik"),
        MISLEADING("Yanıltıcı İçerik"),
        OTHER("Diğer");

        private final String displayName;

        ReportCategory(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
