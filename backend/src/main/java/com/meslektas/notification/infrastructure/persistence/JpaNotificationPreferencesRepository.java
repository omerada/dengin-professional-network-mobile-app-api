package com.meslektas.notification.infrastructure.persistence;

import com.meslektas.notification.domain.model.NotificationPreferences;
import com.meslektas.notification.domain.repository.NotificationPreferencesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * JPA implementation of NotificationPreferencesRepository.
 * 
 * Bridges domain repository interface with Spring Data JPA.
 */
@Repository
@RequiredArgsConstructor
public class JpaNotificationPreferencesRepository implements NotificationPreferencesRepository {

    private final SpringDataNotificationPreferencesRepository springDataRepository;

    @Override
    public Optional<NotificationPreferences> findByUserId(Long userId) {
        return springDataRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public NotificationPreferences getOrCreate(Long userId) {
        return springDataRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreferences preferences = NotificationPreferences.createDefault(userId);
                    return springDataRepository.save(preferences);
                });
    }

    @Override
    public NotificationPreferences save(NotificationPreferences preferences) {
        return springDataRepository.save(preferences);
    }

    @Override
    @Transactional
    public void delete(Long userId) {
        springDataRepository.deleteByUserId(userId);
    }
}
