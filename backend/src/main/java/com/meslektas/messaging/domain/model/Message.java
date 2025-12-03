package com.meslektas.messaging.domain.model;

import com.meslektas.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Message Entity
 * 
 * Represents a single message within a conversation.
 * Messages are owned by the Conversation aggregate.
 * 
 * Business Rules:
 * - Message must have sender and content
 * - Content: 1-2000 characters
 * - Max 1 attachment per message
 * - Only recipient can mark as read
 * - Messages can be deleted (soft delete)
 */
@Entity
@Table(name = "messages")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Message extends BaseEntity {

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "message_id"))
    private MessageId messageId;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "conversation_id"))
    private ConversationId conversationId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Embedded
    private MessageContent content;

    @Embedded
    private MessageAttachment attachment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MessageStatus status;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    // ============================================
    // FACTORY METHOD
    // ============================================

    /**
     * Create a new message
     * 
     * @param conversationId Conversation this message belongs to
     * @param senderId       User ID of message sender
     * @param content        Message text content
     * @param attachment     Optional attachment
     * @return New Message entity
     */
    public static Message create(
            ConversationId conversationId,
            Long senderId,
            MessageContent content,
            MessageAttachment attachment) {
        if (conversationId == null) {
            throw new IllegalArgumentException("Conversation ID cannot be null");
        }
        if (senderId == null) {
            throw new IllegalArgumentException("Sender ID cannot be null");
        }
        if (content == null) {
            throw new IllegalArgumentException("Message content cannot be null");
        }

        Message message = new Message();
        message.messageId = MessageId.generate();
        message.conversationId = conversationId;
        message.senderId = senderId;
        message.content = content;
        message.attachment = attachment;
        message.status = MessageStatus.SENT;

        return message;
    }

    /**
     * Create a message for a conversation using ConversationId
     * 
     * @param conversationId Conversation ID value object
     * @param senderId       User ID of message sender
     * @param content        Message text content
     * @param attachment     Optional attachment
     * @return New Message entity
     */
    public static Message createForConversation(
            ConversationId conversationId,
            Long senderId,
            MessageContent content,
            MessageAttachment attachment) {
        return create(conversationId, senderId, content, attachment);
    }

    /**
     * Create a message without attachment
     */
    public static Message create(
            ConversationId conversationId,
            Long senderId,
            MessageContent content) {
        return create(conversationId, senderId, content, null);
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Mark message as delivered
     */
    public void markAsDelivered() {
        if (this.status == MessageStatus.SENT) {
            this.status = MessageStatus.DELIVERED;
        }
    }

    /**
     * Mark message as read
     * 
     * @param readerId User ID who is reading the message
     */
    public void markAsRead(Long readerId) {
        if (readerId == null) {
            throw new IllegalArgumentException("Reader ID cannot be null");
        }

        // Can't mark own messages as read
        if (this.senderId.equals(readerId)) {
            return;
        }

        if (this.status.canMarkAsRead()) {
            this.status = MessageStatus.READ;
            this.readAt = LocalDateTime.now();
        }
    }

    /**
     * Delete message (soft delete)
     * 
     * @param deleterId User ID who is deleting the message
     */
    public void delete(Long deleterId) {
        if (deleterId == null) {
            throw new IllegalArgumentException("Deleter ID cannot be null");
        }

        if (this.status == MessageStatus.DELETED) {
            return; // Already deleted
        }

        this.status = MessageStatus.DELETED;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deleterId;
    }

    // ============================================
    // QUERY METHODS
    // ============================================

    /**
     * Check if message has an attachment
     */
    public boolean hasAttachment() {
        return this.attachment != null;
    }

    /**
     * Check if message is from a specific sender
     */
    public boolean isSentBy(Long userId) {
        return this.senderId.equals(userId);
    }

    /**
     * Check if message is visible
     */
    public boolean isVisible() {
        return this.status.isVisible();
    }

    /**
     * Check if message has been read
     */
    public boolean isRead() {
        return this.status.isRead();
    }

    /**
     * Get content preview for notifications
     */
    public String getContentPreview() {
        return content.getPreview(50);
    }
}
