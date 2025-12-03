package com.meslektas.notification.domain.model;

import lombok.Builder;
import lombok.Value;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Value Object representing notification metadata.
 * 
 * Contains additional data needed for:
 * - Deep linking (postId, userId, etc.)
 * - Rendering rich notifications
 * - Grouping notifications
 */
@Value
@Builder
public class NotificationMetadata {

    @Builder.Default
    Map<String, String> data = new HashMap<>();

    public NotificationMetadata(Map<String, String> data) {
        this.data = data != null ? new HashMap<>(data) : new HashMap<>();
    }

    /**
     * Create empty metadata
     */
    public static NotificationMetadata empty() {
        return new NotificationMetadata(new HashMap<>());
    }

    /**
     * Create metadata with a single key-value pair
     */
    public static NotificationMetadata of(String key, String value) {
        Map<String, String> data = new HashMap<>();
        data.put(key, value);
        return new NotificationMetadata(data);
    }

    /**
     * Create metadata from map
     */
    public static NotificationMetadata of(Map<String, String> data) {
        return new NotificationMetadata(data);
    }

    /**
     * Get value by key
     */
    public Optional<String> get(String key) {
        return Optional.ofNullable(data.get(key));
    }

    /**
     * Get value as UUID
     */
    public Optional<UUID> getAsUUID(String key) {
        return get(key).map(UUID::fromString);
    }

    /**
     * Get value as Long
     */
    public Optional<Long> getAsLong(String key) {
        return get(key).map(Long::parseLong);
    }

    /**
     * Check if metadata contains key
     */
    public boolean contains(String key) {
        return data.containsKey(key);
    }

    /**
     * Check if metadata is empty
     */
    public boolean isEmpty() {
        return data.isEmpty();
    }

    /**
     * Get number of metadata entries
     */
    public int size() {
        return data.size();
    }

    /**
     * Create a copy with an additional entry
     */
    public NotificationMetadata with(String key, String value) {
        Map<String, String> newData = new HashMap<>(data);
        newData.put(key, value);
        return new NotificationMetadata(newData);
    }

    /**
     * Create a copy with additional entries
     */
    public NotificationMetadata withAll(Map<String, String> additional) {
        Map<String, String> newData = new HashMap<>(data);
        newData.putAll(additional);
        return new NotificationMetadata(newData);
    }

    // ==================== Common Metadata Keys ====================

    public static final String KEY_POST_ID = "postId";
    public static final String KEY_USER_ID = "userId";
    public static final String KEY_COMMENT_ID = "commentId";
    public static final String KEY_MESSAGE_ID = "messageId";
    public static final String KEY_CONVERSATION_ID = "conversationId";
    public static final String KEY_VERIFICATION_ID = "verificationId";
    public static final String KEY_ACTOR_NAME = "actorName";
    public static final String KEY_ACTOR_IMAGE = "actorImage";
    public static final String KEY_COUNT = "count";

    // ==================== Builder Methods ====================

    /**
     * Create metadata for post-related notifications
     */
    public static NotificationMetadata forPost(UUID postId, Long actorId, String actorName) {
        Map<String, String> data = new HashMap<>();
        data.put(KEY_POST_ID, postId.toString());
        data.put(KEY_USER_ID, actorId.toString());
        data.put(KEY_ACTOR_NAME, actorName);
        return new NotificationMetadata(data);
    }

    /**
     * Create metadata for message notifications
     */
    public static NotificationMetadata forMessage(UUID conversationId, UUID messageId, String senderName) {
        Map<String, String> data = new HashMap<>();
        data.put(KEY_CONVERSATION_ID, conversationId.toString());
        data.put(KEY_MESSAGE_ID, messageId.toString());
        data.put(KEY_ACTOR_NAME, senderName);
        return new NotificationMetadata(data);
    }

    /**
     * Create metadata for follower notifications
     */
    public static NotificationMetadata forFollower(Long followerId, String followerName, String followerImage) {
        Map<String, String> data = new HashMap<>();
        data.put(KEY_USER_ID, followerId.toString());
        data.put(KEY_ACTOR_NAME, followerName);
        if (followerImage != null) {
            data.put(KEY_ACTOR_IMAGE, followerImage);
        }
        return new NotificationMetadata(data);
    }

    /**
     * Create metadata for verification notifications
     */
    public static NotificationMetadata forVerification(Long verificationId) {
        return of(KEY_VERIFICATION_ID, verificationId.toString());
    }
}
