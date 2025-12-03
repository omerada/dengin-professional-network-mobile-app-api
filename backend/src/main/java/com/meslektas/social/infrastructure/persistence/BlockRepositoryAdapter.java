package com.meslektas.social.infrastructure.persistence;

import com.meslektas.social.domain.model.Block;
import com.meslektas.social.domain.repository.BlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adapter for BlockRepository
 * 
 * Bridges domain repository interface with JPA repository.
 * This allows the domain layer to remain independent of JPA.
 */
@Component
@RequiredArgsConstructor
public class BlockRepositoryAdapter implements BlockRepository {

    private final JpaBlockRepository jpaRepository;

    @Override
    public Block save(Block block) {
        return jpaRepository.save(block);
    }

    @Override
    public Optional<Block> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<Block> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId) {
        return jpaRepository.findByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    @Override
    public boolean existsByBlockerAndBlocked(Long blockerId, Long blockedId) {
        return jpaRepository.existsByBlockerAndBlocked(blockerId, blockedId);
    }

    @Override
    public List<Block> findByBlockerId(Long blockerId) {
        return jpaRepository.findByBlockerId(blockerId);
    }

    @Override
    public List<Block> findByBlockedId(Long blockedId) {
        return jpaRepository.findByBlockedId(blockedId);
    }

    @Override
    public int countByBlockerId(Long blockerId) {
        return jpaRepository.countByBlockerId(blockerId);
    }

    @Override
    public void delete(Block block) {
        jpaRepository.delete(block);
    }

    @Override
    public void deleteByBlockerIdAndBlockedId(Long blockerId, Long blockedId) {
        jpaRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
    }
}
