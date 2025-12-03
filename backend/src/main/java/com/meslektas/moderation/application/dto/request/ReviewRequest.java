package com.meslektas.moderation.application.dto.request;

import com.meslektas.moderation.domain.model.ModerationDecision;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for reviewing a content report.
 */
public record ReviewRequest(
        @NotNull(message = "Report ID is required") UUID reportId,

        @NotNull(message = "Decision is required") ModerationDecision decision,

        @Size(max = 2000, message = "Notes cannot exceed 2000 characters") String notes,

        /**
         * Duration in days for suspension (only applicable for SUSPEND_USER decision).
         */
        Integer suspensionDays) {
    /**
     * Creates a review request with all fields.
     */
    public static ReviewRequest of(UUID reportId, ModerationDecision decision, String notes, Integer suspensionDays) {
        return new ReviewRequest(reportId, decision, notes, suspensionDays);
    }

    /**
     * Creates a review request without suspension days.
     */
    public static ReviewRequest of(UUID reportId, ModerationDecision decision, String notes) {
        return new ReviewRequest(reportId, decision, notes, null);
    }

    /**
     * Creates a simple review request.
     */
    public static ReviewRequest of(UUID reportId, ModerationDecision decision) {
        return new ReviewRequest(reportId, decision, null, null);
    }

    /**
     * Validates the request.
     */
    public void validate() {
        if (decision == ModerationDecision.SUSPEND_USER && (suspensionDays == null || suspensionDays <= 0)) {
            throw new IllegalArgumentException("Suspension days must be specified for SUSPEND_USER decision");
        }
    }
}
