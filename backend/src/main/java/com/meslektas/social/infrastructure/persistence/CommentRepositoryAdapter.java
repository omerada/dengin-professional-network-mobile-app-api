package com.meslektas.social.infrastructure.persistence;

import com.meslektas.social.domain.model.Comment;
import com.meslektas.social.domain.model.CommentId;
import com.meslektas.social.domain.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adapter for CommentRepository
 * 
 * Bridges domain repository interface with JPA repository.
 */
@Component
@RequiredArgsConstructor
public class CommentRepositoryAdapter implements CommentRepository {
    
    private final JpaCommentRepository jpaRepository;
    
    @Override
    public Comment save(Comment comment) {
        return jpaRepository.save(comment);
    }
    
    @Override
    public Optional<Comment> findById(Long id) {
        return jpaRepository.findById(id);
    }
    
    @Override
    public Optional<Comment> findByCommentId(CommentId commentId) {
        return jpaRepository.findByCommentId(commentId.getValue());
    }
    
    @Override
    public List<Comment> findByPostId(Long postId) {
        return jpaRepository.findByPostId(postId);
    }
    
    @Override
    public List<Comment> findVisibleByPostId(Long postId) {
        return jpaRepository.findVisibleByPostId(postId);
    }
    
    @Override
    public List<Comment> findByCommenterId(Long commenterId) {
        return jpaRepository.findByCommenterId(commenterId);
    }
    
    @Override
    public long countByPostId(Long postId) {
        return jpaRepository.countByPostId(postId);
    }
    
    @Override
    public long countVisibleByPostId(Long postId) {
        return jpaRepository.countVisibleByPostId(postId);
    }
    
    @Override
    public long countByCommenterId(Long commenterId) {
        return jpaRepository.countByCommenterId(commenterId);
    }
    
    @Override
    public void delete(Comment comment) {
        jpaRepository.delete(comment);
    }
}
