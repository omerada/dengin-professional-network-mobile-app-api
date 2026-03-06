package com.dengin.social.infrastructure.persistence;

import com.dengin.social.domain.model.Follow;
import com.dengin.social.domain.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Adapter for FollowRepository
 * 
 * Bridges domain repository interface with JPA repository.
 */
@Component
@RequiredArgsConstructor
public class FollowRepositoryAdapter implements FollowRepository {
    
    private final JpaFollowRepository jpaRepository;
    
    @Override
    public Follow save(Follow follow) {
        return jpaRepository.save(follow);
    }
    
    @Override
    public Optional<Follow> findById(Long id) {
        return jpaRepository.findById(id);
    }
    
    @Override
    public Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId) {
        return jpaRepository.findByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    @Override
    public List<Follow> findByFollowerId(Long followerId) {
        return jpaRepository.findByFollowerId(followerId);
    }
    
    @Override
    public List<Follow> findByFollowingId(Long followingId) {
        return jpaRepository.findByFollowingId(followingId);
    }
    
    @Override
    public Set<Long> getFollowerIds(Long userId) {
        return jpaRepository.getFollowerIds(userId);
    }
    
    @Override
    public Set<Long> getFollowingIds(Long userId) {
        return jpaRepository.getFollowingIds(userId);
    }
    
    @Override
    public boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId) {
        return jpaRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
    
    @Override
    public long countFollowers(Long userId) {
        return jpaRepository.countFollowers(userId);
    }
    
    @Override
    public long countByFollowingId(Long userId) {
        return jpaRepository.countByFollowingId(userId);
    }
    
    @Override
    public long countFollowing(Long userId) {
        return jpaRepository.countFollowing(userId);
    }
    
    @Override
    public long countByFollowerId(Long userId) {
        return jpaRepository.countByFollowerId(userId);
    }
    
    @Override
    public void delete(Follow follow) {
        jpaRepository.delete(follow);
    }
    
    @Override
    public void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId) {
        jpaRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }
}
