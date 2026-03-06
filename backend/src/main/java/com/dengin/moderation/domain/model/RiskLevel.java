package com.dengin.moderation.domain.model;

/**
 * Enum representing risk level for content moderation.
 */
public enum RiskLevel {

    LOW("Düşük", 0, 29),
    MEDIUM("Orta", 30, 49),
    HIGH("Yüksek", 50, 100);

    private final String displayName;
    private final int minScore;
    private final int maxScore;

    RiskLevel(String displayName, int minScore, int maxScore) {
        this.displayName = displayName;
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMinScore() {
        return minScore;
    }

    public int getMaxScore() {
        return maxScore;
    }

    /**
     * Determine risk level from score.
     */
    public static RiskLevel fromScore(int score) {
        if (score >= 50) {
            return HIGH;
        } else if (score >= 30) {
            return MEDIUM;
        } else {
            return LOW;
        }
    }

    /**
     * Check if this risk level requires priority handling.
     */
    public boolean requiresPriorityHandling() {
        return this == HIGH;
    }

    /**
     * Check if this risk level should trigger auto-flag.
     */
    public boolean shouldAutoFlag() {
        return this == HIGH;
    }
}
