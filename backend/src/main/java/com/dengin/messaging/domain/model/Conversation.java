package com.dengin.messaging.domain.model;

import com.dengin.common.domain.DomainEvent;
import com.dengin.messaging.domain.event.ConversationCreatedEvent;
import com.dengin.messaging.domain.event.MessageReadEvent;
import com.dengin.messaging.domain.event.MessageSentEvent;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Conversation Aggregate Root
 * 
 * Represents a 1-to-1 conversation between two users.
 * Manages the lifecycle of messages within the conversation.
 * 
 * Business Rules:
 * - Conversation is strictly 1-to-1 (two participants only)
 * - Only verified users can participate
 * - Users can't message blocked users
 * - Conversations are unique per participant pair
 */
@Entity
@Table(name = "conversations", uniqueConstraints = @UniqueConstraint(name = "uk_conversation_participants", columnNames = {
        "participant1_id", "participant2_id" }))
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Conversation {

    // Domain Events Management
    private final transient List<DomainEvent> domainEvents = new ArrayList<>();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "conversation_id"))
    private ConversationId conversationId;

    @Column(name = "participant1_id", nullable = false)
    private Long participant1Id;

    @Column(name = "participant2_id", nullable = false)
    private Long participant2Id;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", referencedColumnName = "id")
    @OrderBy("createdAt ASC")
    private List<Message> messages = new ArrayList<>();

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "last_message_preview")
    private String lastMessagePreview;

    @Column(name = "last_message_sender_id")
    private Long lastMessageSenderId;

    @Column(name = "participant1_unread_count")
    private int participant1UnreadCount = 0;

    @Column(name = "participant2_unread_count")
    private int participant2UnreadCount = 0;

    @Column(name = "participant1_deleted_at")
    private LocalDateTime participant1DeletedAt;

    @Column(name = "participant2_deleted_at")
    private LocalDateTime participant2DeletedAt;

    // Auditing fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create a new conversation between two users
     * 
     * @param participant1Id First participant (usually message initiator)
     * @param participant2Id Second participant
     * @return New Conversation aggregate
     */
    public static Conversation create(Long participant1Id, Long participant2Id) {
        validateParticipants(participant1Id, participant2Id);

        Conversation conversation = new Conversation();
        conversation.conversationId = ConversationId.generate();

        // Ensure consistent ordering (lower ID first) for uniqueness
        if (participant1Id < participant2Id) {
            conversation.participant1Id = participant1Id;
            conversation.participant2Id = participant2Id;
        } else {
            conversation.participant1Id = participant2Id;
            conversation.participant2Id = participant1Id;
        }

        conversation.lastMessageAt = LocalDateTime.now();

        // Publish domain event
        conversation.registerEvent(new ConversationCreatedEvent(
                conversation.conversationId,
                conversation.participant1Id,
                conversation.participant2Id));

        return conversation;
    }

    private static void validateParticipants(Long participant1Id, Long participant2Id) {
        if (participant1Id == null) {
            throw new IllegalArgumentException("Participant 1 ID cannot be null");
        }
        if (participant2Id == null) {
            throw new IllegalArgumentException("Participant 2 ID cannot be null");
        }
        if (participant1Id.equals(participant2Id)) {
            throw new IllegalArgumentException("Cannot create conversation with yourself");
        }
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Send a message in this conversation
     * 
     * @param senderId   User ID of sender
     * @param content    Message content
     * @param attachment Optional attachment
     * @return Created message
     */
    public Message sendMessage(Long senderId, MessageContent content, MessageAttachment attachment) {
        validateSenderIsParticipant(senderId);

        // Get recipient ID
        Long recipientId = getOtherParticipant(senderId);

        // Create message with conversation's Long ID (not UUID)
        Message message = Message.createWithRecipient(
            this.id,  // Use Long ID for database foreign key
            senderId,
            recipientId,
            content,
            attachment
        );
        
        this.messages.add(message);

        // Update conversation metadata
        this.lastMessageAt = LocalDateTime.now();
        this.lastMessagePreview = content.getPreview(100);
        this.lastMessageSenderId = senderId;

        // Increment unread count for recipient
        incrementUnreadCount(recipientId);

        // Clear deleted status if conversation was deleted
        clearDeletedStatus(recipientId);

        // Publish domain event
        registerEvent(new MessageSentEvent(
                this.conversationId,
                message.getMessageId(),
                senderId,
                recipientId,
                content.getPreview(50)));

        return message;
    }

    /**
     * Send a message without attachment
     */
    public Message sendMessage(Long senderId, MessageContent content) {
        return sendMessage(senderId, content, null);
    }

    /**
     * Mark messages as read by a user
     * 
     * @param userId User marking messages as read
     */
    public void markAsRead(Long userId) {
        validateParticipant(userId);

        List<Message> unreadMessages = messages.stream()
                .filter(m -> !m.isSentBy(userId))
                .filter(m -> !m.isRead())
                .filter(Message::isVisible)
                .toList();

        for (Message message : unreadMessages) {
            message.markAsRead(userId);

            // Publish read event
            registerEvent(new MessageReadEvent(
                    this.conversationId,
                    message.getMessageId(),
                    message.getSenderId(),
                    userId));
        }

        // Reset unread count
        resetUnreadCount(userId);
    }

    /**
     * Mark a specific message as read
     * 
     * @param userId    User marking as read
     * @param messageId ID of message to mark
     */
    public void markMessageAsRead(Long userId, MessageId messageId) {
        validateParticipant(userId);

        Message message = findMessage(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));

        if (!message.isSentBy(userId) && !message.isRead() && message.isVisible()) {
            message.markAsRead(userId);
            decrementUnreadCount(userId);

            registerEvent(new MessageReadEvent(
                    this.conversationId,
                    message.getMessageId(),
                    message.getSenderId(),
                    userId));
        }
    }

    /**
     * Delete conversation for a user (soft delete)
     * 
     * @param userId User deleting the conversation
     */
    public void deleteForUser(Long userId) {
        validateParticipant(userId);

        if (userId.equals(participant1Id)) {
            this.participant1DeletedAt = LocalDateTime.now();
        } else {
            this.participant2DeletedAt = LocalDateTime.now();
        }
    }

    // ============================================
    // QUERY METHODS
    // ============================================

    /**
     * Check if a user is a participant
     */
    public boolean isParticipant(Long userId) {
        return participant1Id.equals(userId) || participant2Id.equals(userId);
    }

    /**
     * Get the other participant
     */
    public Long getOtherParticipant(Long userId) {
        if (participant1Id.equals(userId)) {
            return participant2Id;
        } else if (participant2Id.equals(userId)) {
            return participant1Id;
        }
        throw new IllegalArgumentException("User is not a participant: " + userId);
    }

    /**
     * Get unread count for a user
     */
    public int getUnreadCount(Long userId) {
        if (participant1Id.equals(userId)) {
            return participant1UnreadCount;
        } else if (participant2Id.equals(userId)) {
            return participant2UnreadCount;
        }
        return 0;
    }

    /**
     * Check if conversation is deleted for a user
     */
    public boolean isDeletedFor(Long userId) {
        if (participant1Id.equals(userId)) {
            return participant1DeletedAt != null;
        } else if (participant2Id.equals(userId)) {
            return participant2DeletedAt != null;
        }
        return false;
    }

    /**
     * Find a message by ID
     */
    public Optional<Message> findMessage(MessageId messageId) {
        return messages.stream()
                .filter(m -> m.getMessageId().equals(messageId))
                .findFirst();
    }

    /**
     * Get visible messages (not deleted)
     */
    public List<Message> getVisibleMessages() {
        return messages.stream()
                .filter(Message::isVisible)
                .toList();
    }

    /**
     * Get message count
     */
    public int getMessageCount() {
        return (int) messages.stream()
                .filter(Message::isVisible)
                .count();
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private void validateSenderIsParticipant(Long senderId) {
        if (!isParticipant(senderId)) {
            throw new IllegalArgumentException("Sender is not a participant in this conversation");
        }
    }

    private void validateParticipant(Long userId) {
        if (!isParticipant(userId)) {
            throw new IllegalArgumentException("User is not a participant in this conversation");
        }
    }

    private void incrementUnreadCount(Long recipientId) {
        if (participant1Id.equals(recipientId)) {
            this.participant1UnreadCount++;
        } else {
            this.participant2UnreadCount++;
        }
    }

    private void decrementUnreadCount(Long userId) {
        if (participant1Id.equals(userId) && participant1UnreadCount > 0) {
            this.participant1UnreadCount--;
        } else if (participant2Id.equals(userId) && participant2UnreadCount > 0) {
            this.participant2UnreadCount--;
        }
    }

    private void resetUnreadCount(Long userId) {
        if (participant1Id.equals(userId)) {
            this.participant1UnreadCount = 0;
        } else if (participant2Id.equals(userId)) {
            this.participant2UnreadCount = 0;
        }
    }

    private void clearDeletedStatus(Long userId) {
        if (participant1Id.equals(userId) && participant1DeletedAt != null) {
            this.participant1DeletedAt = null;
        } else if (participant2Id.equals(userId) && participant2DeletedAt != null) {
            this.participant2DeletedAt = null;
        }
    }

    // ============================================
    // DOMAIN EVENTS MANAGEMENT
    // ============================================

    /**
     * Register a domain event.
     * Events will be published after transaction commit.
     */
    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    /**
     * Get all domain events (immutable copy).
     */
    public List<DomainEvent> getEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    /**
     * Clear all domain events.
     * Should be called after events are published.
     */
    public void clearEvents() {
        domainEvents.clear();
    }
}
