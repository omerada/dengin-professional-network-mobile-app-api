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
    @AttributeOverride(name = "value", column = @Column(name = "message_uuid"))
    private MessageId messageId;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationIdValue;

    @Transient
    private ConversationId conversationId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(name = "content", nullable = false, length = 2000)
    private String contentText;

    @Transient
    private MessageContent content;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "s3Key", column = @Column(name = "attachment_s3_key")),
        @AttributeOverride(name = "fileName", column = @Column(name = "attachment_file_name")),
        @AttributeOverride(name = "contentType", column = @Column(name = "attachment_content_type")),
        @AttributeOverride(name = "fileSize", column = @Column(name = "attachment_file_size"))
    })
    private MessageAttachment attachment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MessageStatus status;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "deleted_by_sender_at")
    private LocalDateTime deletedBySenderAt;

    @Column(name = "deleted_by_recipient_at")
    private LocalDateTime deletedByRecipientAt;

    // Transient fields for backward compatibility
    @Transient
    private LocalDateTime deletedAt;
    
    @Transient
    private Long deletedBy;

    // ============================================
    // POST-LOAD INITIALIZATION
    // ============================================
    
    @PostLoad
    private void initTransientFields() {
        this.content = MessageContent.of(this.contentText);
        // Set deletedAt based on which party deleted first
        if (deletedBySenderAt != null || deletedByRecipientAt != null) {
            this.deletedAt = deletedBySenderAt != null ? deletedBySenderAt : deletedByRecipientAt;
            this.deletedBy = deletedBySenderAt != null ? senderId : recipientId;
        }
    }

    // ============================================
    // FACTORY METHODS (Backward Compatible)
    // ============================================

    /**
     * Create a new message with ConversationId (backward compatible for tests)
     */
    public static Message create(
            ConversationId conversationId,
            Long senderId,
            MessageContent content) {
        return create(conversationId, senderId, content, null);
    }

    /**
     * Create a new message with ConversationId and attachment (backward compatible)
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
        message.conversationIdValue = 0L; // Placeholder, will be set by repository
        message.senderId = senderId;
        message.recipientId = 0L; // Placeholder, will be set by conversation
        message.content = content;
        message.contentText = content.getValue();
        message.attachment = attachment;
        message.status = MessageStatus.SENT;

        return message;
    }

    /**
     * Create a new message with full parameters
     */
    public static Message createWithRecipient(
            Long conversationIdValue,
            Long senderId,
            Long recipientId,
            MessageContent content,
            MessageAttachment attachment) {
        if (conversationIdValue == null) {
            throw new IllegalArgumentException("Conversation ID cannot be null");
        }
        if (senderId == null) {
            throw new IllegalArgumentException("Sender ID cannot be null");
        }
        if (recipientId == null) {
            throw new IllegalArgumentException("Recipient ID cannot be null");
        }
        if (content == null) {
            throw new IllegalArgumentException("Message content cannot be null");
        }

        Message message = new Message();
        message.messageId = MessageId.generate();
        message.conversationIdValue = conversationIdValue;
        message.senderId = senderId;
        message.recipientId = recipientId;
        message.content = content;
        message.contentText = content.getValue();
        message.attachment = attachment;
        message.status = MessageStatus.SENT;

        return message;
    }

    /**
     * Create a message for a conversation using ConversationId (alias)
     */
    public static Message createForConversation(
            ConversationId conversationId,
            Long senderId,
            MessageContent content,
            MessageAttachment attachment) {
        return create(conversationId, senderId, content, attachment);
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
            this.deliveredAt = LocalDateTime.now();
        }
    }

    /**
     * Mark message as read
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
     * Delete message (marks as deleted status)
     */
    public void delete(Long deleterId) {
        if (deleterId == null) {
            throw new IllegalArgumentException("Deleter ID cannot be null");
        }

        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deleterId;

        if (deleterId.equals(senderId)) {
            this.deletedBySenderAt = this.deletedAt;
        } else if (deleterId.equals(recipientId)) {
            this.deletedByRecipientAt = this.deletedAt;
        }

        // Mark as deleted status if completely deleted
        if (deletedBySenderAt != null && deletedByRecipientAt != null) {
            this.status = MessageStatus.DELETED;
        }
    }

    // ============================================
    // QUERY METHODS
    // ============================================

    public boolean hasAttachment() {
        return this.attachment != null && this.attachment.getS3Key() != null;
    }

    public boolean isSentBy(Long userId) {
        return this.senderId.equals(userId);
    }

    public boolean isVisible() {
        return this.status != MessageStatus.DELETED;
    }

    public boolean isRead() {
        return this.status.isRead();
    }

    public String getContentPreview() {
        if (content != null) {
            return content.getPreview(50);
        }
        if (contentText != null) {
            return contentText.length() > 50 ? contentText.substring(0, 50) + "..." : contentText;
        }
        return "";
    }

    public MessageContent getContent() {
        if (content == null && contentText != null) {
            content = MessageContent.of(contentText);
        }
        return content;
    }

    public ConversationId getConversationId() {
        return conversationId;
    }
}
