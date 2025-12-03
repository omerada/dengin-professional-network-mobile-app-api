package com.meslektas.moderation.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for appealing a sanction.
 */
public record AppealRequest(
        @NotNull(message = "Sanction ID is required") UUID sanctionId,

        @NotNull(message = "Appeal reason is required") @Size(min = 50, max = 2000, message = "Appeal reason must be between 50 and 2000 characters") String reason) {
    /**
     * Creates an appeal request.
     */
    public static AppealRequest of(UUID sanctionId, String reason) {
        return new AppealRequest(sanctionId, reason);
    }
}
