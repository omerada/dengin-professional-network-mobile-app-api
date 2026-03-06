package com.dengin.messaging.domain.repository;

import com.dengin.messaging.domain.model.Conversation;
import com.dengin.messaging.domain.model.ConversationId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * Repository interface for Conversation aggregate
 * 
 * Follows DDD repository pattern - works with aggregate roots only
 */
public interface ConversationRepository {

    /**
     * Save a conversation aggregate
     */
    Conversation save(Conversation conversation);

    /**
     * Find conversation by ID
     */
    Optional<Conversation> findById(Long id);

    /**
     * Find conversation by ConversationId
     */
    Optional<Conversation> findByConversationId(ConversationId conversationId);

    /**
     * Find conversation between two users
     * 
     * @param userId1 First user ID
     * @param userId2 Second user ID
     * @return Conversation if exists
     */
    Optional<Conversation> findByParticipants(Long userId1, Long userId2);

    /**
     * Find all conversations for a user
     * 
     * @param userId   User ID
     * @param pageable Pagination
     * @return Page of conversations
     */
    Page<Conversation> findByUserId(Long userId, Pageable pageable);

    /**
     * Find active (non-deleted) conversations for a user
     * Ordered by last message time (most recent first)
     * 
     * @param userId   User ID
     * @param pageable Pagination
     * @return Page of active conversations
     */
    Page<Conversation> findActiveByUserId(Long userId, Pageable pageable);

    /**
     * Count unread conversations for a user
     * 
     * @param userId User ID
     * @return Number of conversations with unread messages
     */
    int countUnreadConversations(Long userId);

    /**
     * Count total unread messages for a user across all conversations
     * 
     * @param userId User ID
     * @return Total unread message count
     */
    int countTotalUnreadMessages(Long userId);

    /**
     * Check if conversation exists between two users
     */
    boolean existsByParticipants(Long userId1, Long userId2);

    /**
     * Delete a conversation
     */
    void delete(Conversation conversation);
}
