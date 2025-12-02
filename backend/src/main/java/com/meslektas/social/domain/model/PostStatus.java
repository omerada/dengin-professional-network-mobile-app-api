package com.meslektas.social.domain.model;

/**
 * Post Status Enumeration
 * 
 * Lifecycle states of a post.
 */
public enum PostStatus {
    /**
     * Post is published and visible to users
     */
    PUBLISHED,
    
    /**
     * Post is hidden (not shown in feed)
     * Can be unhidden by author
     */
    HIDDEN,
    
    /**
     * Post is soft-deleted
     * Kept for audit/recovery, not shown anywhere
     */
    DELETED;
    
    /**
     * Check if post is visible in feed
     */
    public boolean isVisible() {
        return this == PUBLISHED;
    }
    
    /**
     * Check if post is in final state (deleted)
     */
    public boolean isFinal() {
        return this == DELETED;
    }
}
