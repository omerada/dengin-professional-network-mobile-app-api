package com.dengin.moderation.infrastructure.persistence;

import com.dengin.moderation.domain.model.UserSanction;
import com.dengin.moderation.domain.model.SanctionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for UserSanction.
 */
@Repository
public interface SpringDataUserSanctionRepository extends JpaRepository<UserSanction, UUID> {

        /**
         * Finds all sanctions for a user.
         */
        List<UserSanction> findByUserId(Long userId);

        /**
         * Finds active sanctions for a user.
         */
        @Query("SELECT s FROM UserSanction s WHERE s.userId = :userId AND s.active = true " +
                        "AND (s.expiresAt IS NULL OR s.expiresAt > CURRENT_TIMESTAMP)")
        List<UserSanction> findActiveByUserId(@Param("userId") Long userId);

        /**
         * Checks if a user has any active sanction.
         */
        @Query("SELECT COUNT(s) > 0 FROM UserSanction s WHERE s.userId = :userId AND s.active = true " +
                        "AND (s.expiresAt IS NULL OR s.expiresAt > CURRENT_TIMESTAMP)")
        boolean hasActiveSanction(@Param("userId") Long userId);

        /**
         * Checks if a user has a specific type of active sanction.
         */
        @Query("SELECT COUNT(s) > 0 FROM UserSanction s WHERE s.userId = :userId AND s.sanctionType = :type " +
                        "AND s.active = true AND (s.expiresAt IS NULL OR s.expiresAt > CURRENT_TIMESTAMP)")
        boolean hasActiveSanctionOfType(@Param("userId") Long userId, @Param("type") SanctionType type);

        /**
         * Gets the most severe active sanction for a user (BAN > SUSPENSION > WARNING).
         */
        @Query("SELECT s FROM UserSanction s WHERE s.userId = :userId AND s.active = true " +
                        "AND (s.expiresAt IS NULL OR s.expiresAt > CURRENT_TIMESTAMP) " +
                        "ORDER BY CASE s.sanctionType WHEN 'PERMANENT_BAN' THEN 0 WHEN 'SUSPENSION_30_DAYS' THEN 1 WHEN 'SUSPENSION_7_DAYS' THEN 2 WHEN 'WARNING' THEN 3 END")
        List<UserSanction> findActiveSanctionsOrderedBySeverity(@Param("userId") Long userId);

        /**
         * Finds sanctions by type.
         */
        List<UserSanction> findBySanctionType(SanctionType sanctionType);

        /**
         * Finds sanctions that have been appealed but not processed.
         */
        @Query("SELECT s FROM UserSanction s WHERE s.liftedAt IS NULL AND s.liftReason IS NOT NULL AND s.active = true")
        List<UserSanction> findPendingAppeals();

        /**
         * Counts total sanctions for a user.
         */
        int countByUserId(Long userId);

        /**
         * Counts sanctions by type for a user.
         */
        int countByUserIdAndSanctionType(Long userId, SanctionType sanctionType);

        /**
         * Finds sanctions applied by a specific moderator.
         */
        List<UserSanction> findByModeratorId(Long moderatorId);

        /**
         * Finds sanctions within a date range.
         */
        List<UserSanction> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

        /**
         * Finds expired sanctions that need cleanup.
         */
        @Query("SELECT s FROM UserSanction s WHERE s.active = true AND s.expiresAt IS NOT NULL " +
                        "AND s.expiresAt < CURRENT_TIMESTAMP")
        List<UserSanction> findExpiredSanctions();

        /**
         * Deactivates expired sanctions.
         */
        @Modifying
        @Query("UPDATE UserSanction s SET s.active = false WHERE s.active = true " +
                        "AND s.expiresAt IS NOT NULL AND s.expiresAt < CURRENT_TIMESTAMP")
        int deactivateExpiredSanctions();

        /**
         * Finds all sanctions with pagination.
         */
        Page<UserSanction> findAll(Pageable pageable);

        /**
         * Counts active sanctions by type.
         */
        @Query("SELECT s.sanctionType, COUNT(s) FROM UserSanction s WHERE s.active = true " +
                        "AND (s.expiresAt IS NULL OR s.expiresAt > CURRENT_TIMESTAMP) GROUP BY s.sanctionType")
        List<Object[]> countActiveSanctionsByType();

        /**
         * Counts pending appeals.
         */
        @Query("SELECT COUNT(s) FROM UserSanction s WHERE s.liftReason IS NOT NULL AND s.liftedAt IS NULL AND s.active = true")
        int countPendingAppeals();

        /**
         * Counts approved appeals.
         */
        @Query("SELECT COUNT(s) FROM UserSanction s WHERE s.liftedAt IS NOT NULL")
        int countApprovedAppeals();

        /**
         * Counts rejected appeals.
         */
        @Query("SELECT COUNT(s) FROM UserSanction s WHERE s.liftReason IS NOT NULL AND s.liftedAt IS NULL AND s.active = false")
        int countRejectedAppeals();
}
