package com.dengin.messaging.infrastructure.persistence;

import com.dengin.messaging.domain.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * JPA Repository for Conversation domain model.
 * 
 * Infrastructure implementation using Spring Data JPA.
 * Conversation domain model has JPA annotations, so we use it directly.
 */
@Repository
public interface JpaConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find by ConversationId (UUID)
     */
    @Query("SELECT c FROM Conversation c WHERE c.conversationId.value = :conversationId")
    Optional<Conversation> findByConversationId(@Param("conversationId") UUID conversationId);

    /**
     * Find conversation between two users
     * Order-independent: checks both directions
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE (c.participant1Id = :user1Id AND c.participant2Id = :user2Id)
               OR (c.participant1Id = :user2Id AND c.participant2Id = :user1Id)
            """)
    Optional<Conversation> findByParticipants(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id);

    /**
     * Find all active conversations for a user ordered by last message time
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE (c.participant1Id = :userId AND c.participant1DeletedAt IS NULL)
               OR (c.participant2Id = :userId AND c.participant2DeletedAt IS NULL)
            ORDER BY c.lastMessageAt DESC
            """)
    Page<Conversation> findActiveByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find all conversations for a user
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE c.participant1Id = :userId OR c.participant2Id = :userId
            ORDER BY c.lastMessageAt DESC
            """)
    Page<Conversation> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Check if conversation exists between two users
     */
    @Query("""
            SELECT COUNT(c) > 0 FROM Conversation c
            WHERE (c.participant1Id = :user1Id AND c.participant2Id = :user2Id)
               OR (c.participant1Id = :user2Id AND c.participant2Id = :user1Id)
            """)
    boolean existsByParticipants(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id);

    /**
     * Count conversations with unread messages for a user
     */
    @Query("""
            SELECT COUNT(c) FROM Conversation c
            WHERE (c.participant1Id = :userId AND c.participant1UnreadCount > 0)
               OR (c.participant2Id = :userId AND c.participant2UnreadCount > 0)
            """)
    int countUnreadConversations(@Param("userId") Long userId);

    /**
     * Sum total unread messages for a user
     */
    @Query("""
            SELECT COALESCE(
                SUM(CASE WHEN c.participant1Id = :userId THEN c.participant1UnreadCount
                         WHEN c.participant2Id = :userId THEN c.participant2UnreadCount
                         ELSE 0 END), 0)
            FROM Conversation c
            WHERE c.participant1Id = :userId OR c.participant2Id = :userId
            """)
    int countTotalUnreadMessages(@Param("userId") Long userId);
}
