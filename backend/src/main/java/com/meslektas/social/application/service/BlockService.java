package com.meslektas.social.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.common.infrastructure.DomainEventPublisher;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.social.application.dto.BlockResponse;
import com.meslektas.social.application.dto.BlockedUserDto;
import com.meslektas.social.domain.model.Block;
import com.meslektas.social.domain.model.UserUnblockedEvent;
import com.meslektas.social.domain.repository.BlockRepository;
import com.meslektas.social.domain.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Block Application Service
 * 
 * Orchestrates user blocking operations:
 * - Block user
 * - Unblock user
 * - Get blocked users list
 * - Check block status
 * 
 * Business Rules:
 * - Users can't block themselves
 * - Blocking removes existing follow relationships
 * - Blocked users can't send messages
 * - Blocked users can't see blocker's content
 * 
 * Sprint 7-8: User Safety & Moderation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlockService {

    private final BlockRepository blockRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher eventPublisher;

    /**
     * Block a user
     * 
     * @param blockerId User who is blocking
     * @param blockedId User to be blocked
     * @param reason    Optional reason for blocking
     * @return BlockResponse with updated status
     * @throws BusinessException if user tries to block themselves or user doesn't
     *                           exist
     */
    @Transactional
    public BlockResponse blockUser(Long blockerId, Long blockedId, String reason) {
        log.info("User {} blocking user {}", blockerId, blockedId);

        // Validate: can't block yourself
        if (blockerId.equals(blockedId)) {
            throw new BusinessException("Kendinizi engelleyemezsiniz", "CANNOT_BLOCK_SELF");
        }

        // Validate blocked user exists
        if (!userRepository.existsById(blockedId)) {
            throw new ResourceNotFoundException("User", blockedId);
        }

        // Check if already blocked
        if (blockRepository.existsByBlockerAndBlocked(blockerId, blockedId)) {
            log.debug("User {} already blocked {}", blockerId, blockedId);
            return new BlockResponse(blockedId, true, "Kullanıcı zaten engelli");
        }

        // Create block relationship
        Block block = Block.create(blockerId, blockedId, reason);
        block = blockRepository.save(block);

        // Publish domain events
        eventPublisher.publishEvents(block.getEvents());
        block.clearEvents();

        // Remove follow relationships in both directions
        removeFollowRelationships(blockerId, blockedId);

        log.info("User {} successfully blocked user {}", blockerId, blockedId);

        return new BlockResponse(blockedId, true, "Kullanıcı engellendi");
    }

    /**
     * Unblock a user
     * 
     * @param blockerId User who is unblocking
     * @param blockedId User to be unblocked
     * @return BlockResponse with updated status
     */
    @Transactional
    public BlockResponse unblockUser(Long blockerId, Long blockedId) {
        log.info("User {} unblocking user {}", blockerId, blockedId);

        Block block = blockRepository.findByBlockerIdAndBlockedId(blockerId, blockedId)
                .orElse(null);

        if (block == null) {
            log.debug("User {} was not blocking {}", blockerId, blockedId);
            return new BlockResponse(blockedId, false, "Kullanıcı zaten engelli değil");
        }

        // Delete block
        blockRepository.delete(block);

        // Publish unblock event
        eventPublisher.publishEvents(List.of(new UserUnblockedEvent(blockerId, blockedId)));

        log.info("User {} successfully unblocked user {}", blockerId, blockedId);

        return new BlockResponse(blockedId, false, "Engel kaldırıldı");
    }

    /**
     * Get list of users blocked by the given user
     * 
     * @param blockerId User whose block list to retrieve
     * @return List of blocked user DTOs
     */
    @Transactional(readOnly = true)
    public List<BlockedUserDto> getBlockedUsers(Long blockerId) {
        log.debug("Getting blocked users for user {}", blockerId);

        List<Block> blocks = blockRepository.findByBlockerId(blockerId);

        return blocks.stream()
                .map(block -> {
                    return userRepository.findById(block.getBlockedId())
                            .map(user -> BlockedUserDto.builder()
                                    .userId(user.getId())
                                    .name(user.getName())
                                    .surname(user.getSurname())
                                    .avatarUrl(user.getAvatarUrl())
                                    .blockedAt(block.getCreatedAt())
                                    .reason(block.getReason())
                                    .build())
                            .orElse(null);
                })
                .filter(dto -> dto != null)
                .toList();
    }

    /**
     * Check if one user has blocked another
     * 
     * @param blockerId Potential blocker
     * @param blockedId Potential blocked
     * @return true if blockerId has blocked blockedId
     */
    @Transactional(readOnly = true)
    public boolean isBlocked(Long blockerId, Long blockedId) {
        return blockRepository.existsByBlockerAndBlocked(blockerId, blockedId);
    }

    /**
     * Check if any block relationship exists between two users (in either
     * direction)
     * 
     * @param userId1 First user
     * @param userId2 Second user
     * @return true if any block exists
     */
    @Transactional(readOnly = true)
    public boolean hasBlockBetween(Long userId1, Long userId2) {
        return blockRepository.existsBlockBetween(userId1, userId2);
    }

    /**
     * Remove follow relationships in both directions when blocking
     */
    private void removeFollowRelationships(Long userId1, Long userId2) {
        // Remove userId1 following userId2
        followRepository.findByFollowerIdAndFollowingId(userId1, userId2)
                .ifPresent(follow -> {
                    followRepository.delete(follow);
                    log.debug("Removed follow: {} -> {}", userId1, userId2);
                });

        // Remove userId2 following userId1
        followRepository.findByFollowerIdAndFollowingId(userId2, userId1)
                .ifPresent(follow -> {
                    followRepository.delete(follow);
                    log.debug("Removed follow: {} -> {}", userId2, userId1);
                });
    }
}
