package com.meslektas.moderation.application.service;

import com.meslektas.moderation.application.dto.request.AppealRequest;
import com.meslektas.moderation.application.dto.response.SanctionResponse;
import com.meslektas.moderation.domain.model.UserSanction;
import com.meslektas.moderation.domain.model.SanctionType;
import com.meslektas.moderation.domain.repository.UserSanctionRepository;
import com.meslektas.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Application service for user-facing sanction operations.
 * Allows users to view their sanctions and submit appeals.
 */
@Service
@Transactional
public class UserSanctionService {

    private static final Logger log = LoggerFactory.getLogger(UserSanctionService.class);

    private final UserSanctionRepository sanctionRepository;

    public UserSanctionService(UserSanctionRepository sanctionRepository) {
        this.sanctionRepository = sanctionRepository;
    }

    /**
     * Gets all sanctions for the current user.
     *
     * @param userId the user ID
     * @return list of sanctions
     */
    @Transactional(readOnly = true)
    public List<SanctionResponse> getMySanctions(Long userId) {
        return sanctionRepository.findByUserId(userId)
                .stream()
                .map(SanctionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Gets active sanctions for the current user.
     *
     * @param userId the user ID
     * @return list of active sanctions
     */
    @Transactional(readOnly = true)
    public List<SanctionResponse> getMyActiveSanctions(Long userId) {
        return sanctionRepository.findActiveByUserId(userId)
                .stream()
                .map(SanctionResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Gets the most severe active sanction for a user.
     *
     * @param userId the user ID
     * @return the most severe sanction if any
     */
    @Transactional(readOnly = true)
    public Optional<SanctionResponse> getMostSevereActiveSanction(Long userId) {
        return sanctionRepository.findMostSevereActiveSanction(userId)
                .map(SanctionResponse::from);
    }

    /**
     * Checks if the user is currently banned.
     *
     * @param userId the user ID
     * @return true if banned
     */
    @Transactional(readOnly = true)
    public boolean isBanned(Long userId) {
        return sanctionRepository.hasActiveSanctionOfType(userId, SanctionType.PERMANENT_BAN);
    }

    /**
     * Checks if the user is currently suspended.
     *
     * @param userId the user ID
     * @return true if suspended
     */
    @Transactional(readOnly = true)
    public boolean isSuspended(Long userId) {
        return sanctionRepository.hasActiveSanctionOfType(userId, SanctionType.SUSPENSION_7_DAYS) ||
                sanctionRepository.hasActiveSanctionOfType(userId, SanctionType.SUSPENSION_30_DAYS);
    }

    /**
     * Submits an appeal for a sanction.
     * Note: This implementation assumes we would add appeal functionality to
     * UserSanction.
     * For now, we just track the appeal submission.
     *
     * @param request the appeal request
     * @param userId  the user ID
     * @return the updated sanction
     */
    public SanctionResponse submitAppeal(AppealRequest request, Long userId) {
        UserSanction sanction = sanctionRepository.findById(request.sanctionId())
                .orElseThrow(() -> new BusinessException("Yapt\u0131r\u0131m bulunamad\u0131", "SANCTION_NOT_FOUND"));

        // Verify ownership
        if (!sanction.getUserId().equals(userId)) {
            throw new BusinessException("Bu yapt\u0131r\u0131m i\u00e7in itiraz yapma yetkiniz yok", "ACCESS_DENIED");
        }

        // Check if sanction is still active
        if (!sanction.isInEffect()) {
            throw new BusinessException("Aktif olmayan yapt\u0131r\u0131ma itiraz edilemez", "SANCTION_INACTIVE");
        }

        // Note: In a full implementation, we would track appeal status in the
        // UserSanction entity
        log.info("Appeal submitted: sanctionId={}, userId={}, reason={}",
                request.sanctionId(), userId, request.reason());

        return SanctionResponse.from(sanction);
    }

    /**
     * Gets a specific sanction by ID.
     *
     * @param sanctionId the sanction ID
     * @param userId     the requesting user's ID
     * @return the sanction
     */
    @Transactional(readOnly = true)
    public SanctionResponse getSanction(UUID sanctionId, Long userId) {
        UserSanction sanction = sanctionRepository.findById(sanctionId)
                .orElseThrow(() -> new BusinessException("Yaptırım bulunamadı", "SANCTION_NOT_FOUND"));

        if (!sanction.getUserId().equals(userId)) {
            throw new BusinessException("Bu yaptırımı görüntüleme yetkiniz yok", "ACCESS_DENIED");
        }

        return SanctionResponse.from(sanction);
    }

    /**
     * Gets the sanction count for a user.
     *
     * @param userId the user ID
     * @return the sanction count
     */
    @Transactional(readOnly = true)
    public int getSanctionCount(Long userId) {
        return sanctionRepository.countByUserId(userId);
    }

    /**
     * Validates if a user can perform an action based on their sanctions.
     *
     * @param userId the user ID
     * @throws BusinessException if user is sanctioned
     */
    public void validateUserCanAct(Long userId) {
        if (isBanned(userId)) {
            throw new BusinessException("Hesabınız kalıcı olarak askıya alınmıştır", "USER_BANNED");
        }

        if (isSuspended(userId)) {
            Optional<SanctionResponse> suspension = getMostSevereActiveSanction(userId);
            String message = suspension
                    .filter(s -> s.remainingDays() > 0)
                    .map(s -> String.format(
                            "Hesabınız %d gün daha askıda", s.remainingDays()))
                    .orElse("Hesabınız geçici olarak askıya alınmıştır");
            throw new BusinessException(message, "USER_SUSPENDED");
        }
    }
}
