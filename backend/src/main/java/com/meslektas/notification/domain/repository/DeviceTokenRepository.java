package com.meslektas.notification.domain.repository;

import com.meslektas.notification.domain.model.DeviceToken;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DeviceToken aggregate.
 */
public interface DeviceTokenRepository {

    /**
     * Save a device token.
     */
    DeviceToken save(DeviceToken deviceToken);

    /**
     * Find device token by ID.
     */
    Optional<DeviceToken> findById(Long id);

    /**
     * Find device token by user ID and token.
     */
    Optional<DeviceToken> findByUserIdAndToken(Long userId, String token);

    /**
     * Find all active tokens for a user.
     */
    List<DeviceToken> findActiveByUserId(Long userId);

    /**
     * Find all tokens for a user.
     */
    List<DeviceToken> findAllByUserId(Long userId);

    /**
     * Delete a device token.
     */
    void delete(DeviceToken deviceToken);

    /**
     * Delete all tokens for a user.
     */
    void deleteAllByUserId(Long userId);

    /**
     * Check if token exists for user.
     */
    boolean existsByUserIdAndToken(Long userId, String token);

    /**
     * Deactivate stale tokens (not used for specified days).
     */
    int deactivateStaleTokens(int maxDaysInactive);
}
