package com.meslektas.notification.infrastructure.persistence;

import com.meslektas.notification.domain.model.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository for NotificationPreferences entity.
 */
@Repository
public interface SpringDataNotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Long> {

    /**
     * Find preferences by user ID.
     */
    Optional<NotificationPreferences> findByUserId(Long userId);

    /**
     * Check if preferences exist for a user.
     */
    boolean existsByUserId(Long userId);

    /**
     * Delete preferences by user ID.
     */
    void deleteByUserId(Long userId);
}
