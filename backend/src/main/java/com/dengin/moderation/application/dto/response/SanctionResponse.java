package com.dengin.moderation.application.dto.response;

import com.dengin.moderation.domain.model.UserSanction;
import com.dengin.moderation.domain.model.SanctionType;
import com.dengin.moderation.domain.model.ReportReason;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for user sanction details.
 */
public record SanctionResponse(
        UUID id,
        Long userId,
        SanctionType sanctionType,
        ReportReason reason,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        Long moderatorId,
        boolean isActive,
        long remainingDays,
        LiftInfo liftInfo) {
    /**
     * Lift information record.
     */
    public record LiftInfo(
            LocalDateTime liftedAt,
            Long liftedBy,
            String liftReason) {
    }

    /**
     * Creates a response from a domain entity.
     */
    public static SanctionResponse from(UserSanction sanction) {
        LiftInfo liftInfo = null;
        if (sanction.getLiftedAt() != null) {
            liftInfo = new LiftInfo(
                    sanction.getLiftedAt(),
                    sanction.getLiftedBy(),
                    sanction.getLiftReason());
        }

        return new SanctionResponse(
                sanction.getId(),
                sanction.getUserId(),
                sanction.getSanctionType(),
                sanction.getReason(),
                sanction.getNotes(),
                sanction.getCreatedAt(),
                sanction.getExpiresAt(),
                sanction.getModeratorId(),
                sanction.isActive(),
                sanction.getRemainingDays(),
                liftInfo);
    }

    /**
     * Creates a summary response (for list views).
     */
    public static SanctionResponse summary(UserSanction sanction) {
        return new SanctionResponse(
                sanction.getId(),
                sanction.getUserId(),
                sanction.getSanctionType(),
                sanction.getReason(),
                null, // omit notes in summary
                sanction.getCreatedAt(),
                sanction.getExpiresAt(),
                sanction.getModeratorId(),
                sanction.isActive(),
                sanction.getRemainingDays(),
                null // omit lift info in summary
        );
    }
}
