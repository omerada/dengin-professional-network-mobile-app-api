package com.meslektas.notification.infrastructure.push;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * FCM Device Token Entity
 * 
 * Stores device tokens for push notifications.
 * Each user can have multiple devices (phone, tablet, etc.)
 * 
 * Tokens should be refreshed periodically by the app
 * and invalid tokens should be removed when FCM reports errors.
 */
@Entity
@Table(
    name = "device_tokens",
    indexes = {
        @Index(name = "idx_device_token_user_id", columnList = "user_id"),
        @Index(name = "idx_device_token_token", columnList = "token", unique = true)
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "token", nullable = false, unique = true, length = 255)
    private String token;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false)
    private Platform platform;
    
    @Column(name = "device_name")
    private String deviceName;
    
    @Column(name = "app_version")
    private String appVersion;
    
    @Column(name = "os_version")
    private String osVersion;
    
    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @Column(name = "last_used_at")
    private Instant lastUsedAt;
    
    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    public void markAsUsed() {
        this.lastUsedAt = Instant.now();
    }
    
    public void deactivate() {
        this.active = false;
    }
    
    public enum Platform {
        ANDROID,
        IOS,
        WEB
    }
}
