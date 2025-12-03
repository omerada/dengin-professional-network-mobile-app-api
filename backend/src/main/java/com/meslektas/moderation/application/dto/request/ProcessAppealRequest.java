package com.meslektas.moderation.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for processing an appeal.
 */
public record ProcessAppealRequest(
        @NotNull(message = "Sanction ID is required") UUID sanctionId,

        @NotNull(message = "Approval status is required") Boolean approved,

        @Size(max = 2000, message = "Notes cannot exceed 2000 characters") String notes) {
    /**
     * Creates a process appeal request.
     */
    public static ProcessAppealRequest of(UUID sanctionId, boolean approved, String notes) {
        return new ProcessAppealRequest(sanctionId, approved, notes);
    }

    /**
     * Creates a process appeal request without notes.
     */
    public static ProcessAppealRequest of(UUID sanctionId, boolean approved) {
        return new ProcessAppealRequest(sanctionId, approved, null);
    }
}
