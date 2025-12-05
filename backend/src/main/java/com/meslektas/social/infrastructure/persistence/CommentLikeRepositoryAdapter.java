package com.meslektas.social.infrastructure.persistence;

import com.meslektas.social.domain.model.CommentLike;
import com.meslektas.social.domain.repository.CommentLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter for CommentLikeRepository
 * 
 * Bridges domain repository interface with JPA repository.
 * This allows the domain layer to remain independent of JPA.
 */
@Component
@RequiredArgsConstructor
public class CommentLikeRepositoryAdapter implements CommentLikeRepository {

    private final JpaCommentLikeRepository jpaRepository;

    @Override
    @Transactional
    public CommentLike save(CommentLike commentLike) {
        return jpaRepository.save(commentLike);
    }

    @Override
    @Transactional
    public void delete(CommentLike commentLike) {
        jpaRepository.delete(commentLike);
    }

    @Override
    @Transactional
    public void deleteByCommentIdAndUserId(UUID commentId, Long userId) {
        findByCommentIdAndUserId(commentId, userId)
                .ifPresent(jpaRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CommentLike> findByCommentIdAndUserId(UUID commentId, Long userId) {
        return jpaRepository.findByCommentIdAndUserId(commentId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCommentIdAndUserId(UUID commentId, Long userId) {
        return jpaRepository.existsByCommentIdAndUserId(commentId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByCommentId(UUID commentId) {
        return jpaRepository.countByCommentId(commentId);
    }

    /**
     * Batch query to get like counts for multiple comments
     * Useful for feed queries where we need counts for many comments
     */
    @Transactional(readOnly = true)
    public Map<UUID, Long> getLikeCountsForComments(List<UUID> commentIds) {
        return jpaRepository.countByCommentIds(commentIds).stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (Long) row[1]));
    }

    /**
     * Batch query to check which comments a user has liked
     * Useful for populating isLikedByMe flag in feed responses
     */
    @Transactional(readOnly = true)
    public List<UUID> getLikedCommentIds(List<UUID> commentIds, Long userId) {
        return jpaRepository.findLikedCommentIds(commentIds, userId);
    }
}
