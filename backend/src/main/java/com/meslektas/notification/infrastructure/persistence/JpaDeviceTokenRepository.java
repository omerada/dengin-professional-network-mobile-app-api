package com.meslektas.notification.infrastructure.persistence;

import com.meslektas.notification.domain.model.DeviceToken;
import com.meslektas.notification.domain.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * JPA implementation of DeviceTokenRepository.
 */
@Repository
@RequiredArgsConstructor
@Transactional
public class JpaDeviceTokenRepository implements DeviceTokenRepository {

    private final SpringDataDeviceTokenRepository springDataRepository;

    @Override
    public DeviceToken save(DeviceToken deviceToken) {
        return springDataRepository.save(deviceToken);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DeviceToken> findById(Long id) {
        return springDataRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DeviceToken> findByUserIdAndToken(Long userId, String token) {
        return springDataRepository.findByUserIdAndToken(userId, token);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> findActiveByUserId(Long userId) {
        return springDataRepository.findActiveByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceToken> findAllByUserId(Long userId) {
        return springDataRepository.findAllByUserId(userId);
    }

    @Override
    public void delete(DeviceToken deviceToken) {
        springDataRepository.delete(deviceToken);
    }

    @Override
    public void deleteAllByUserId(Long userId) {
        springDataRepository.deleteAllByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUserIdAndToken(Long userId, String token) {
        return springDataRepository.existsByUserIdAndToken(userId, token);
    }

    @Override
    public int deactivateStaleTokens(int maxDaysInactive) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(maxDaysInactive);
        return springDataRepository.deactivateStaleTokens(cutoffDate, LocalDateTime.now());
    }
}
