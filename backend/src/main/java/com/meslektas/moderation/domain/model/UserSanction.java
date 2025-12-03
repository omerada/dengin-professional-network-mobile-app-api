package com.meslektas.moderation.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a sanction applied to a user.
 */
@Entity
@Table(name = "user_sanctions", indexes = {
        @Index(name = "idx_sanctions_user", columnList = "user_id"),
        @Index(name = "idx_sanctions_active", columnList = "user_id, is_active"),
        @Index(name = "idx_sanctions_expires", columnList = "expires_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSanction {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sanction_type", nullable = false)
    private SanctionType sanctionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false)
    private ReportReason reason;

    @Column(name = "report_id")
    private UUID reportId;

    @Column(name = "moderator_id", nullable = false)
    private Long moderatorId;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "lifted_at")
    private LocalDateTime liftedAt;

    @Column(name = "lifted_by")
    private Long liftedBy;

    @Column(name = "lift_reason", length = 500)
    private String liftReason;

    // ==================== Factory Methods ====================

    /**
     * Apply a new sanction to a user.
     */
    public static UserSanction apply(
            Long userId,
            SanctionType sanctionType,
            ReportReason reason,
            UUID reportId,
            Long moderatorId,
            String notes) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (sanctionType == null) {
            throw new IllegalArgumentException("Sanction type cannot be null");
        }
        if (reason == null) {
            throw new IllegalArgumentException("Reason cannot be null");
        }
        if (moderatorId == null) {
            throw new IllegalArgumentException("Moderator ID cannot be null");
        }

        UserSanction sanction = new UserSanction();
        sanction.id = UUID.randomUUID();
        sanction.userId = userId;
        sanction.sanctionType = sanctionType;
        sanction.reason = reason;
        sanction.reportId = reportId;
        sanction.moderatorId = moderatorId;
        sanction.notes = notes;
        sanction.active = true;
        sanction.createdAt = LocalDateTime.now();

        // Calculate expiration for temporary sanctions
        if (sanctionType.isSuspension()) {
            sanction.expiresAt = sanction.createdAt.plusDays(sanctionType.getDurationDays());
        }

        return sanction;
    }

    /**
     * Issue a warning to a user.
     */
    public static UserSanction warning(
            Long userId,
            ReportReason reason,
            UUID reportId,
            Long moderatorId,
            String notes) {
        return apply(userId, SanctionType.WARNING, reason, reportId, moderatorId, notes);
    }

    /**
     * Suspend a user for 7 days.
     */
    public static UserSanction suspend7Days(
            Long userId,
            ReportReason reason,
            UUID reportId,
            Long moderatorId,
            String notes) {
        return apply(userId, SanctionType.SUSPENSION_7_DAYS, reason, reportId, moderatorId, notes);
    }

    /**
     * Suspend a user for 30 days.
     */
    public static UserSanction suspend30Days(
            Long userId,
            ReportReason reason,
            UUID reportId,
            Long moderatorId,
            String notes) {
        return apply(userId, SanctionType.SUSPENSION_30_DAYS, reason, reportId, moderatorId, notes);
    }

    /**
     * Permanently ban a user.
     */
    public static UserSanction permanentBan(
            Long userId,
            ReportReason reason,
            UUID reportId,
            Long moderatorId,
            String notes) {
        return apply(userId, SanctionType.PERMANENT_BAN, reason, reportId, moderatorId, notes);
    }

    // ==================== Domain Methods ====================

    /**
     * Lift the sanction.
     */
    public void lift(Long liftedBy, String reason) {
        if (!active) {
            throw new IllegalStateException("Sanction is already inactive");
        }
        if (liftedBy == null) {
            throw new IllegalArgumentException("Lifted by ID cannot be null");
        }

        this.active = false;
        this.liftedAt = LocalDateTime.now();
        this.liftedBy = liftedBy;
        this.liftReason = reason;
    }

    /**
     * Check if sanction is expired.
     */
    public boolean isExpired() {
        if (sanctionType.isPermanent()) {
            return false;
        }
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if sanction is currently in effect.
     */
    public boolean isInEffect() {
        return active && !isExpired();
    }

    /**
     * Get remaining duration in days.
     */
    public long getRemainingDays() {
        if (!isInEffect() || sanctionType.isPermanent() || expiresAt == null) {
            return sanctionType.isPermanent() ? -1 : 0;
        }

        long days = java.time.Duration.between(LocalDateTime.now(), expiresAt).toDays();
        return Math.max(0, days);
    }
}
