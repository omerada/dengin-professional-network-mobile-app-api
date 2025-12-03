package com.meslektas.moderation.domain.model;

import lombok.Value;

import java.time.LocalDateTime;

/**
 * Value Object representing a moderation score.
 * 
 * Used by automated moderation to assess content risk.
 */
@Value
public class ModerationScore {

    int score;
    RiskLevel riskLevel;
    String details;
    LocalDateTime assessedAt;

    private ModerationScore(int score, RiskLevel riskLevel, String details) {
        this.score = Math.max(0, Math.min(100, score)); // Clamp to 0-100
        this.riskLevel = riskLevel;
        this.details = details;
        this.assessedAt = LocalDateTime.now();
    }

    /**
     * Create a moderation score from raw score value.
     */
    public static ModerationScore of(int score, String details) {
        return new ModerationScore(score, RiskLevel.fromScore(score), details);
    }

    /**
     * Create a low risk score.
     */
    public static ModerationScore low(String details) {
        return new ModerationScore(0, RiskLevel.LOW, details);
    }

    /**
     * Create a medium risk score.
     */
    public static ModerationScore medium(int score, String details) {
        return new ModerationScore(Math.max(30, Math.min(49, score)), RiskLevel.MEDIUM, details);
    }

    /**
     * Create a high risk score.
     */
    public static ModerationScore high(int score, String details) {
        return new ModerationScore(Math.max(50, score), RiskLevel.HIGH, details);
    }

    /**
     * Check if content should be auto-flagged.
     */
    public boolean shouldAutoFlag() {
        return riskLevel.shouldAutoFlag();
    }

    /**
     * Check if content should be auto-rejected.
     */
    public boolean shouldAutoReject() {
        return score >= 80;
    }

    /**
     * Check if content requires manual review.
     */
    public boolean requiresManualReview() {
        return riskLevel == RiskLevel.MEDIUM || riskLevel == RiskLevel.HIGH;
    }
}
