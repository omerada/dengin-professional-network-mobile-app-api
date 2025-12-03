package com.meslektas.notification.api;

import com.meslektas.notification.infrastructure.push.DeviceToken;
import com.meslektas.notification.infrastructure.push.DeviceTokenService;
import com.meslektas.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

/**
 * Device Token Registration API
 * 
 * Endpoints for managing FCM device tokens for push notifications.
 * Used by mobile apps to register/unregister for push notifications.
 */
@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Device Tokens", description = "Push notification device token management")
public class DeviceTokenController {
    
    private final DeviceTokenService deviceTokenService;
    
    /**
     * Register a device token for push notifications
     * Called when app starts or when FCM token is refreshed
     */
    @PostMapping("/register")
    @Operation(summary = "Register device for push notifications")
    public ResponseEntity<DeviceTokenResponse> registerDevice(
        @Valid @RequestBody RegisterDeviceRequest request,
        @CurrentUser Principal principal
    ) {
        UUID userId = UUID.fromString(principal.getName());
        
        DeviceToken deviceToken = deviceTokenService.registerToken(
            userId,
            request.getToken(),
            request.getPlatform(),
            request.getDeviceName(),
            request.getAppVersion(),
            request.getOsVersion()
        );
        
        return ResponseEntity.ok(DeviceTokenResponse.from(deviceToken));
    }
    
    /**
     * Unregister a device token
     * Called on logout or when user disables notifications
     */
    @PostMapping("/unregister")
    @Operation(summary = "Unregister device from push notifications")
    public ResponseEntity<Void> unregisterDevice(
        @Valid @RequestBody UnregisterDeviceRequest request,
        @CurrentUser Principal principal
    ) {
        deviceTokenService.deactivateToken(request.getToken());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Unregister all devices for current user
     * Called on password change or account security event
     */
    @PostMapping("/unregister-all")
    @Operation(summary = "Unregister all devices for current user")
    public ResponseEntity<Void> unregisterAllDevices(@CurrentUser Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        deviceTokenService.deactivateAllUserTokens(userId);
        return ResponseEntity.ok().build();
    }
    
    // Request/Response DTOs
    
    @Data
    public static class RegisterDeviceRequest {
        @NotBlank(message = "Device token is required")
        private String token;
        
        @NotNull(message = "Platform is required")
        private DeviceToken.Platform platform;
        
        private String deviceName;
        private String appVersion;
        private String osVersion;
    }
    
    @Data
    public static class UnregisterDeviceRequest {
        @NotBlank(message = "Device token is required")
        private String token;
    }
    
    @Data
    public static class DeviceTokenResponse {
        private UUID id;
        private String platform;
        private String deviceName;
        private boolean active;
        
        public static DeviceTokenResponse from(DeviceToken token) {
            DeviceTokenResponse response = new DeviceTokenResponse();
            response.id = token.getId();
            response.platform = token.getPlatform().name();
            response.deviceName = token.getDeviceName();
            response.active = token.isActive();
            return response;
        }
    }
}
