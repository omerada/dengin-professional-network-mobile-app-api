package com.meslektas.messaging.infrastructure.persistence;

import com.meslektas.messaging.domain.model.Conversation;
import com.meslektas.messaging.domain.model.ConversationId;
import com.meslektas.messaging.domain.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adapter for ConversationRepository
 * 
 * Bridges domain repository interface with JPA repository.
 * Domain model has JPA annotations so we use it directly.
 */
@Component
@RequiredArgsConstructor
public class ConversationRepositoryAdapter implements ConversationRepository {

    private final JpaConversationRepository jpaRepository;

    @Override
    public Conversation save(Conversation conversation) {
        return jpaRepository.save(conversation);
    }

    @Override
    public Optional<Conversation> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<Conversation> findByConversationId(ConversationId conversationId) {
        return jpaRepository.findByConversationId(conversationId.getValue());
    }

    @Override
    public Optional<Conversation> findByParticipants(Long userId1, Long userId2) {
        return jpaRepository.findByParticipants(userId1, userId2);
    }

    @Override
    public Page<Conversation> findByUserId(Long userId, Pageable pageable) {
        return jpaRepository.findByUserId(userId, pageable);
    }

    @Override
    public Page<Conversation> findActiveByUserId(Long userId, Pageable pageable) {
        return jpaRepository.findActiveByUserId(userId, pageable);
    }

    @Override
    public int countUnreadConversations(Long userId) {
        return jpaRepository.countUnreadConversations(userId);
    }

    @Override
    public int countTotalUnreadMessages(Long userId) {
        return jpaRepository.countTotalUnreadMessages(userId);
    }

    @Override
    public boolean existsByParticipants(Long userId1, Long userId2) {
        return jpaRepository.existsByParticipants(userId1, userId2);
    }

    @Override
    public void delete(Conversation conversation) {
        jpaRepository.delete(conversation);
    }
}
