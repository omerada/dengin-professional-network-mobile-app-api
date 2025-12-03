package com.meslektas.notification.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a device token for push notifications.
 * 
 * Stores FCM/APNs tokens for each user's device.
 */
@Entity
@Table(name = "device_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 20)
    private Platform platform;

    @Column(name = "device_name", length = 100)
    private String deviceName;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Supported platforms.
     */
    public enum Platform {
        IOS,
        ANDROID,
        WEB
    }

    // ==================== Factory Methods ====================

    /**
     * Register a new device token.
     */
    public static DeviceToken register(Long userId, String token, Platform platform, String deviceName) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token cannot be blank");
        }
        if (platform == null) {
            throw new IllegalArgumentException("Platform cannot be null");
        }

        DeviceToken deviceToken = new DeviceToken();
        deviceToken.userId = userId;
        deviceToken.token = token;
        deviceToken.platform = platform;
        deviceToken.deviceName = deviceName;
        deviceToken.active = true;
        deviceToken.createdAt = LocalDateTime.now();
        deviceToken.updatedAt = deviceToken.createdAt;
        deviceToken.lastUsedAt = deviceToken.createdAt;

        return deviceToken;
    }

    // ==================== State Methods ====================

    /**
     * Mark the device as used (update last used time).
     */
    public void markAsUsed() {
        this.lastUsedAt = LocalDateTime.now();
        this.updatedAt = this.lastUsedAt;
    }

    /**
     * Update the token (e.g., when FCM token is refreshed).
     */
    public void updateToken(String newToken) {
        if (newToken == null || newToken.isBlank()) {
            throw new IllegalArgumentException("Token cannot be blank");
        }
        this.token = newToken;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Deactivate the device token.
     */
    public void deactivate() {
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Reactivate the device token.
     */
    public void activate() {
        this.active = true;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Check if the token is stale (not used for a long time).
     */
    public boolean isStale(int maxDaysInactive) {
        if (lastUsedAt == null) {
            return true;
        }
        return lastUsedAt.plusDays(maxDaysInactive).isBefore(LocalDateTime.now());
    }
}
