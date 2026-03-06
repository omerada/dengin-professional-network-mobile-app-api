package com.dengin.social.infrastructure.persistence;

import com.dengin.social.domain.model.Post;
import com.dengin.social.domain.model.PostId;
import com.dengin.social.domain.model.PostStatus;
import com.dengin.social.domain.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Adapter for PostRepository
 * 
 * Bridges domain repository interface with JPA repository.
 * This allows the domain layer to remain independent of JPA.
 */
@Component
@RequiredArgsConstructor
public class PostRepositoryAdapter implements PostRepository {

    private final JpaPostRepository jpaRepository;

    @Override
    public Post save(Post post) {
        return jpaRepository.save(post);
    }

    @Override
    public Optional<Post> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<Post> findByPostId(PostId postId) {
        return jpaRepository.findByPostId(postId.getValue());
    }

    @Override
    public List<Post> findByAuthorId(Long authorId) {
        return jpaRepository.findByAuthorId(authorId);
    }

    @Override
    public List<Post> findVisiblePostsByAuthorId(Long authorId) {
        return jpaRepository.findVisiblePostsByAuthorId(authorId);
    }

    @Override
    public List<Post> findPostsForFeed(
            List<Long> followedUserIds,
            Long professionId,
            LocalDateTime since,
            int limit) {
        // Handle empty followed list
        if (followedUserIds == null || followedUserIds.isEmpty()) {
            followedUserIds = List.of(-1L); // Dummy ID to avoid SQL error
        }

        return jpaRepository.findPostsForFeed(
                followedUserIds,
                professionId,
                since,
                limit);
    }

    @Override
    public List<Post> findPostsForFeedWithCursor(
            List<Long> followedUserIds,
            Long professionId,
            LocalDateTime since,
            int limit,
            Long beforeId) {
        // Handle empty followed list
        if (followedUserIds == null || followedUserIds.isEmpty()) {
            followedUserIds = List.of(-1L); // Dummy ID to avoid SQL error
        }

        return jpaRepository.findPostsForFeedWithCursor(
                followedUserIds,
                professionId,
                since,
                limit,
                beforeId);
    }

    @Override
    public List<Post> findTrendingPosts(LocalDateTime since, int limit) {
        return jpaRepository.findTrendingPosts(since, limit);
    }

    @Override
    public long countByAuthorId(Long authorId) {
        return jpaRepository.countByAuthorId(authorId);
    }

    @Override
    public long countVisiblePostsByAuthorId(Long authorId) {
        return jpaRepository.countVisiblePostsByAuthorId(authorId);
    }

    @Override
    public boolean existsByIdAndStatus(Long id, PostStatus status) {
        return jpaRepository.existsByIdAndStatus(id, status);
    }

    @Override
    public void delete(Post post) {
        jpaRepository.delete(post);
    }
    
    @Override
    public Page<Post> findSavedPostsByUserId(Long userId, Pageable pageable) {
        return jpaRepository.findSavedPostsByUserId(userId, pageable);
    }
}
