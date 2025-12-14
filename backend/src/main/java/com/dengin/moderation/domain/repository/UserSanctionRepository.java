package com.dengin.moderation.domain.repository;

import com.dengin.moderation.domain.model.UserSanction;
import com.dengin.moderation.domain.model.SanctionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for UserSanction entity.
 * Follows DDD principles - domain-centric interface.
 */
public interface UserSanctionRepository {

    /**
     * Saves a user sanction.
     *
     * @param sanction the sanction to save
     * @return the saved sanction
     */
    UserSanction save(UserSanction sanction);

    /**
     * Finds a sanction by its ID.
     *
     * @param id the sanction ID
     * @return the sanction if found
     */
    Optional<UserSanction> findById(UUID id);

    /**
     * Finds all sanctions for a user.
     *
     * @param userId the user ID
     * @return list of sanctions
     */
    List<UserSanction> findByUserId(Long userId);

    /**
     * Finds active sanctions for a user.
     *
     * @param userId the user ID
     * @return list of active sanctions
     */
    List<UserSanction> findActiveByUserId(Long userId);

    /**
     * Checks if a user has any active sanction.
     *
     * @param userId the user ID
     * @return true if user has active sanction
     */
    boolean hasActiveSanction(Long userId);

    /**
     * Checks if a user has a specific type of active sanction.
     *
     * @param userId the user ID
     * @param type   the sanction type
     * @return true if user has this type of active sanction
     */
    boolean hasActiveSanctionOfType(Long userId, SanctionType type);

    /**
     * Gets the most severe active sanction for a user.
     *
     * @param userId the user ID
     * @return the most severe active sanction if any
     */
    Optional<UserSanction> findMostSevereActiveSanction(Long userId);

    /**
     * Finds sanctions by type.
     *
     * @param type the sanction type
     * @return list of sanctions
     */
    List<UserSanction> findByType(SanctionType type);

    /**
     * Finds sanctions that have been appealed but not processed.
     *
     * @return list of pending appeal sanctions
     */
    List<UserSanction> findPendingAppeals();

    /**
     * Counts total sanctions for a user.
     *
     * @param userId the user ID
     * @return count of sanctions
     */
    int countByUserId(Long userId);

    /**
     * Counts sanctions by type for a user.
     *
     * @param userId the user ID
     * @param type   the sanction type
     * @return count of sanctions
     */
    int countByUserIdAndType(Long userId, SanctionType type);

    /**
     * Finds sanctions applied by a specific moderator.
     *
     * @param moderatorId the moderator's user ID
     * @return list of sanctions
     */
    List<UserSanction> findByAppliedBy(Long moderatorId);

    /**
     * Finds sanctions within a date range.
     *
     * @param startDate the start date
     * @param endDate   the end date
     * @return list of sanctions
     */
    List<UserSanction> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Finds expired sanctions that need cleanup.
     *
     * @return list of expired sanctions
     */
    List<UserSanction> findExpiredSanctions();

    /**
     * Deactivates expired sanctions.
     *
     * @return count of deactivated sanctions
     */
    int deactivateExpiredSanctions();

    /**
     * Deletes a sanction (soft delete recommended).
     *
     * @param id the sanction ID
     */
    void deleteById(UUID id);

    /**
     * Finds all sanctions with pagination.
     *
     * @param page the page number (0-based)
     * @param size the page size
     * @return list of sanctions
     */
    List<UserSanction> findAll(int page, int size);

    /**
     * Gets sanction statistics.
     *
     * @return statistics
     */
    SanctionStatistics getStatistics();

    /**
     * Statistics record for sanctions.
     */
    record SanctionStatistics(
            int totalSanctions,
            int activeWarnings,
            int activeSuspensions,
            int activeBans,
            int pendingAppeals,
            int approvedAppeals,
            int rejectedAppeals) {
    }
}
