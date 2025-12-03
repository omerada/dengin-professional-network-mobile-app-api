package com.meslektas.notification.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a device token for push notifications.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDeviceRequest {

    /**
     * FCM/APNs token.
     */
    @NotBlank(message = "Device token is required")
    @Size(max = 500, message = "Device token must not exceed 500 characters")
    private String token;

    /**
     * Platform: IOS, ANDROID, WEB.
     */
    @NotNull(message = "Platform is required")
    private Platform platform;

    /**
     * Optional device name for user reference.
     */
    @Size(max = 100, message = "Device name must not exceed 100 characters")
    private String deviceName;

    /**
     * Supported platforms.
     */
    public enum Platform {
        IOS,
        ANDROID,
        WEB
    }
}
