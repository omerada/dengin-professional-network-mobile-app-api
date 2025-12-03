package com.meslektas.notification.infrastructure.persistence;

import com.meslektas.notification.domain.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for DeviceToken entities.
 */
@Repository
public interface SpringDataDeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    /**
     * Find device token by user ID and token string.
     */
    Optional<DeviceToken> findByUserIdAndToken(Long userId, String token);

    /**
     * Find all active tokens for a user.
     */
    @Query("SELECT dt FROM DeviceToken dt WHERE dt.userId = :userId AND dt.active = true ORDER BY dt.lastUsedAt DESC")
    List<DeviceToken> findActiveByUserId(@Param("userId") Long userId);

    /**
     * Find all tokens for a user.
     */
    List<DeviceToken> findAllByUserId(Long userId);

    /**
     * Delete all tokens for a user.
     */
    @Modifying
    @Query("DELETE FROM DeviceToken dt WHERE dt.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    /**
     * Check if token exists for user.
     */
    boolean existsByUserIdAndToken(Long userId, String token);

    /**
     * Deactivate stale tokens.
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now WHERE dt.active = true AND dt.lastUsedAt < :cutoffDate")
    int deactivateStaleTokens(@Param("cutoffDate") LocalDateTime cutoffDate, @Param("now") LocalDateTime now);
}
