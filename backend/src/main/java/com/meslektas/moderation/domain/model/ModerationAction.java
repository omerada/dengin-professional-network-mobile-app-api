package com.meslektas.moderation.domain.model;

import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Value Object representing a moderation action taken.
 */
@Value
public class ModerationAction {

    UUID actionId;
    ModerationDecision decision;
    Long moderatorId;
    String notes;
    LocalDateTime actionTakenAt;

    private ModerationAction(
            ModerationDecision decision,
            Long moderatorId,
            String notes) {
        if (decision == null) {
            throw new IllegalArgumentException("Decision cannot be null");
        }
        if (moderatorId == null) {
            throw new IllegalArgumentException("Moderator ID cannot be null");
        }

        this.actionId = UUID.randomUUID();
        this.decision = decision;
        this.moderatorId = moderatorId;
        this.notes = notes;
        this.actionTakenAt = LocalDateTime.now();
    }

    /**
     * Create a moderation action.
     */
    public static ModerationAction of(
            ModerationDecision decision,
            Long moderatorId,
            String notes) {
        return new ModerationAction(decision, moderatorId, notes);
    }

    /**
     * Create an approval action.
     */
    public static ModerationAction approve(Long moderatorId, String notes) {
        return new ModerationAction(ModerationDecision.APPROVE_CONTENT, moderatorId, notes);
    }

    /**
     * Create a content removal action.
     */
    public static ModerationAction removeContent(Long moderatorId, String notes) {
        return new ModerationAction(ModerationDecision.REMOVE_CONTENT, moderatorId, notes);
    }

    /**
     * Create a warning action.
     */
    public static ModerationAction warnUser(Long moderatorId, String notes) {
        return new ModerationAction(ModerationDecision.WARN_USER, moderatorId, notes);
    }

    /**
     * Create a suspension action.
     */
    public static ModerationAction suspendUser(Long moderatorId, String notes) {
        return new ModerationAction(ModerationDecision.SUSPEND_USER, moderatorId, notes);
    }

    /**
     * Create a ban action.
     */
    public static ModerationAction banUser(Long moderatorId, String notes) {
        return new ModerationAction(ModerationDecision.BAN_USER, moderatorId, notes);
    }

    /**
     * Check if this action results in user sanction.
     */
    public boolean sanctionsUser() {
        return decision.sanctionsUser();
    }

    /**
     * Get the sanction type if applicable.
     */
    public SanctionType getSanctionType() {
        return decision.getSanctionType();
    }
}
