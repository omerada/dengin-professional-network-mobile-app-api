package com.dengin.notification.domain.repository;

import com.dengin.notification.domain.model.NotificationPreferences;

import java.util.Optional;

/**
 * Repository interface for NotificationPreferences.
 */
public interface NotificationPreferencesRepository {

    /**
     * Find preferences by user ID
     */
    Optional<NotificationPreferences> findByUserId(Long userId);

    /**
     * Get or create preferences for a user
     */
    NotificationPreferences getOrCreate(Long userId);

    /**
     * Save preferences
     */
    NotificationPreferences save(NotificationPreferences preferences);

    /**
     * Delete preferences
     */
    void delete(Long userId);
}
