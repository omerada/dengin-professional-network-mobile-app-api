package com.meslektas.moderation.infrastructure.persistence;

import com.meslektas.moderation.domain.model.UserSanction;
import com.meslektas.moderation.domain.model.SanctionType;
import com.meslektas.moderation.domain.repository.UserSanctionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA implementation of UserSanctionRepository.
 * Acts as an adapter between domain and Spring Data.
 */
@Repository
@Transactional
public class JpaUserSanctionRepository implements UserSanctionRepository {

    private final SpringDataUserSanctionRepository springDataRepository;

    public JpaUserSanctionRepository(SpringDataUserSanctionRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public UserSanction save(UserSanction sanction) {
        return springDataRepository.save(sanction);
    }

    @Override
    public Optional<UserSanction> findById(UUID id) {
        return springDataRepository.findById(id);
    }

    @Override
    public List<UserSanction> findByUserId(Long userId) {
        return springDataRepository.findByUserId(userId);
    }

    @Override
    public List<UserSanction> findActiveByUserId(Long userId) {
        return springDataRepository.findActiveByUserId(userId);
    }

    @Override
    public boolean hasActiveSanction(Long userId) {
        return springDataRepository.hasActiveSanction(userId);
    }

    @Override
    public boolean hasActiveSanctionOfType(Long userId, SanctionType type) {
        return springDataRepository.hasActiveSanctionOfType(userId, type);
    }

    @Override
    public Optional<UserSanction> findMostSevereActiveSanction(Long userId) {
        List<UserSanction> sanctions = springDataRepository.findActiveSanctionsOrderedBySeverity(userId);
        return sanctions.isEmpty() ? Optional.empty() : Optional.of(sanctions.get(0));
    }

    @Override
    public List<UserSanction> findByType(SanctionType type) {
        return springDataRepository.findBySanctionType(type);
    }

    @Override
    public List<UserSanction> findPendingAppeals() {
        return springDataRepository.findPendingAppeals();
    }

    @Override
    public int countByUserId(Long userId) {
        return springDataRepository.countByUserId(userId);
    }

    @Override
    public int countByUserIdAndType(Long userId, SanctionType type) {
        return springDataRepository.countByUserIdAndSanctionType(userId, type);
    }

    @Override
    public List<UserSanction> findByAppliedBy(Long moderatorId) {
        return springDataRepository.findByModeratorId(moderatorId);
    }

    @Override
    public List<UserSanction> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return springDataRepository.findByCreatedAtBetween(startDate, endDate);
    }

    @Override
    public List<UserSanction> findExpiredSanctions() {
        return springDataRepository.findExpiredSanctions();
    }

    @Override
    public int deactivateExpiredSanctions() {
        return springDataRepository.deactivateExpiredSanctions();
    }

    @Override
    public void deleteById(UUID id) {
        springDataRepository.deleteById(id);
    }

    @Override
    public List<UserSanction> findAll(int page, int size) {
        return springDataRepository.findAll(PageRequest.of(page, size)).getContent();
    }

    @Override
    public SanctionStatistics getStatistics() {
        List<Object[]> activeByType = springDataRepository.countActiveSanctionsByType();
        Map<SanctionType, Integer> counts = new HashMap<>();

        for (Object[] row : activeByType) {
            SanctionType type = (SanctionType) row[0];
            Long count = (Long) row[1];
            counts.put(type, count.intValue());
        }

        int activeWarnings = counts.getOrDefault(SanctionType.WARNING, 0);
        int activeSuspensions = counts.getOrDefault(SanctionType.SUSPENSION_7_DAYS, 0) +
                counts.getOrDefault(SanctionType.SUSPENSION_30_DAYS, 0);
        int activeBans = counts.getOrDefault(SanctionType.PERMANENT_BAN, 0);

        return new SanctionStatistics(
                (int) springDataRepository.count(),
                activeWarnings,
                activeSuspensions,
                activeBans,
                springDataRepository.countPendingAppeals(),
                springDataRepository.countApprovedAppeals(),
                springDataRepository.countRejectedAppeals());
    }
}
