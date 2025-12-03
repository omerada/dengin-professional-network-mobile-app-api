package com.meslektas.messaging.domain.model;

/**
 * Message Status Enum
 * 
 * Represents the delivery and read status of a message.
 */
public enum MessageStatus {
    
    /**
     * Message is being sent
     */
    SENDING,
    
    /**
     * Message has been sent and stored
     */
    SENT,
    
    /**
     * Message has been delivered to recipient's device
     */
    DELIVERED,
    
    /**
     * Message has been read by recipient
     */
    READ,
    
    /**
     * Message failed to send
     */
    FAILED,
    
    /**
     * Message has been deleted (soft delete)
     */
    DELETED;
    
    /**
     * Check if message is visible to users
     */
    public boolean isVisible() {
        return this != DELETED && this != FAILED;
    }
    
    /**
     * Check if message has been successfully sent
     */
    public boolean isSent() {
        return this == SENT || this == DELIVERED || this == READ;
    }
    
    /**
     * Check if message has been read
     */
    public boolean isRead() {
        return this == READ;
    }
    
    /**
     * Check if message can be marked as read
     */
    public boolean canMarkAsRead() {
        return this == SENT || this == DELIVERED;
    }
}
