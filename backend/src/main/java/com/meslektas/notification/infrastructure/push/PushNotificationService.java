package com.meslektas.notification.infrastructure.push;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.*;
import com.meslektas.notification.domain.model.NotificationContent;
import com.meslektas.notification.domain.model.NotificationType;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Firebase Cloud Messaging (FCM) Push Notification Service.
 * 
 * Sends push notifications to mobile devices via FCM.
 * Supports both Android (FCM) and iOS (APNs via FCM).
 */
@Service
@Slf4j
public class PushNotificationService {

    @Value("${firebase.enabled:false}")
    private boolean pushEnabled;

    @Value("${firebase.project-id:}")
    private String projectId;

    @Value("${firebase.credentials-json:}")
    private String credentialsJson;

    private static final int MAX_RETRIES = 3;
    private static final int BATCH_SIZE = 500; // FCM limit for batch sends
    
    private boolean firebaseInitialized = false;

    @PostConstruct
    public void initialize() {
        if (!pushEnabled) {
            log.info("Firebase push notifications are disabled");
            return;
        }

        if (credentialsJson == null || credentialsJson.isBlank()) {
            log.warn("Firebase credentials not configured, push notifications will be simulated");
            return;
        }

        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
                );
                
                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build();

                FirebaseApp.initializeApp(options);
                firebaseInitialized = true;
                log.info("Firebase initialized successfully for project: {}", projectId);
            } else {
                firebaseInitialized = true;
                log.info("Firebase already initialized");
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase", e);
        }
    }

    /**
     * Send push notification to a single device.
     */
    @Async
    public void sendPushNotification(
            String deviceToken,
            NotificationType type,
            NotificationContent content,
            Map<String, String> data) {
        if (!pushEnabled) {
            log.debug("Push notifications disabled, skipping notification to token: {}",
                    maskToken(deviceToken));
            return;
        }

        log.info("Sending push notification: type={}, token={}...", type, maskToken(deviceToken));

        try {
            Message message = buildFcmMessage(deviceToken, type, content, data);
            sendWithRetry(message, type);
            log.info("Push notification sent successfully: type={}", type);
        } catch (Exception e) {
            log.error("Failed to send push notification: type={}", type, e);
        }
    }

    /**
     * Send push notification to multiple devices.
     */
    @Async
    public void sendPushNotificationToMultiple(
            List<String> deviceTokens,
            NotificationType type,
            NotificationContent content,
            Map<String, String> data) {
        if (!pushEnabled) {
            log.debug("Push notifications disabled, skipping batch notification");
            return;
        }

        if (deviceTokens == null || deviceTokens.isEmpty()) {
            return;
        }

        log.info("Sending batch push notification: type={}, devices={}", type, deviceTokens.size());

        // Split into batches if more than FCM limit
        List<List<String>> batches = partitionList(deviceTokens, BATCH_SIZE);

        for (List<String> batch : batches) {
            try {
                if (firebaseInitialized && batch.size() > 1) {
                    sendBatchNotification(batch, type, content, data);
                } else {
                    // Fallback to individual sends
                    for (String token : batch) {
                        sendPushNotification(token, type, content, data);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to send batch push notification", e);
            }
        }
    }

    /**
     * Send batch notification using Firebase multicast.
     */
    private void sendBatchNotification(
            List<String> tokens,
            NotificationType type,
            NotificationContent content,
            Map<String, String> data) {
        
        MulticastMessage message = MulticastMessage.builder()
            .addAllTokens(tokens)
            .setNotification(Notification.builder()
                .setTitle(content.getTitle())
                .setBody(content.getBody())
                .build())
            .setAndroidConfig(buildAndroidConfig(type))
            .setApnsConfig(buildApnsConfig())
            .putAllData(data != null ? data : Map.of())
            .build();

        try {
            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            log.info("Batch notification sent: success={}, failure={}", 
                response.getSuccessCount(), response.getFailureCount());
            
            // Log failed tokens for cleanup
            if (response.getFailureCount() > 0) {
                handleFailedTokens(tokens, response);
            }
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send batch notification: {}", e.getMessage());
        }
    }

    /**
     * Handle failed tokens - log for potential cleanup.
     */
    private void handleFailedTokens(List<String> tokens, BatchResponse response) {
        List<SendResponse> responses = response.getResponses();
        for (int i = 0; i < responses.size(); i++) {
            if (!responses.get(i).isSuccessful()) {
                String token = tokens.get(i);
                FirebaseMessagingException exception = responses.get(i).getException();
                if (exception != null) {
                    MessagingErrorCode errorCode = exception.getMessagingErrorCode();
                    if (errorCode == MessagingErrorCode.UNREGISTERED || 
                        errorCode == MessagingErrorCode.INVALID_ARGUMENT) {
                        log.warn("Invalid or unregistered token detected, scheduling for cleanup: {}", maskToken(token));
                        // Mark token for cleanup - in production this would trigger a database update
                        // via an event or direct call to remove the invalid device token
                        invalidTokenCleanupQueue.add(token);
                    }
                }
            }
        }
        
        // Process cleanup queue asynchronously
        if (!invalidTokenCleanupQueue.isEmpty()) {
            processInvalidTokenCleanup();
        }
    }

    /**
     * Queue for invalid tokens that need cleanup
     */
    private final java.util.concurrent.ConcurrentLinkedQueue<String> invalidTokenCleanupQueue = 
            new java.util.concurrent.ConcurrentLinkedQueue<>();

    /**
     * Process invalid token cleanup
     * In production, this would call a service to remove tokens from database
     */
    private void processInvalidTokenCleanup() {
        String token;
        int count = 0;
        while ((token = invalidTokenCleanupQueue.poll()) != null && count < 100) {
            log.info("Marking device token for removal: {}", maskToken(token));
            // Could emit an event or call a service here:
            // deviceTokenService.markAsInvalid(token);
            count++;
        }
        if (count > 0) {
            log.info("Processed {} invalid device tokens for cleanup", count);
        }
    }

    /**
     * Send silent push notification (data-only).
     * Used for background updates without showing a notification.
     */
    @Async
    public void sendSilentPush(String deviceToken, Map<String, String> data) {
        if (!pushEnabled) {
            return;
        }

        log.debug("Sending silent push to: {}...", maskToken(deviceToken));

        try {
            Message message = Message.builder()
                .setToken(deviceToken)
                .putAllData(data != null ? data : Map.of())
                .setAndroidConfig(AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .build())
                .setApnsConfig(ApnsConfig.builder()
                    .setAps(Aps.builder()
                        .setContentAvailable(true)
                        .build())
                    .build())
                .build();

            sendWithRetry(message, null);
        } catch (Exception e) {
            log.error("Failed to send silent push", e);
        }
    }

    /**
     * Build FCM message.
     */
    private Message buildFcmMessage(
            String deviceToken,
            NotificationType type,
            NotificationContent content,
            Map<String, String> data) {
        
        return Message.builder()
            .setToken(deviceToken)
            .setNotification(Notification.builder()
                .setTitle(content.getTitle())
                .setBody(content.getBody())
                .build())
            .setAndroidConfig(buildAndroidConfig(type))
            .setApnsConfig(buildApnsConfig())
            .putAllData(data != null ? data : Map.of())
            .build();
    }

    /**
     * Build Android-specific configuration.
     */
    private AndroidConfig buildAndroidConfig(NotificationType type) {
        return AndroidConfig.builder()
            .setPriority(AndroidConfig.Priority.HIGH)
            .setNotification(AndroidNotification.builder()
                .setIcon(getIconForType(type))
                .setColor(getColorForType(type))
                .setSound("default")
                .setClickAction("OPEN_ACTIVITY")
                .build())
            .build();
    }

    /**
     * Build iOS-specific configuration.
     */
    private ApnsConfig buildApnsConfig() {
        return ApnsConfig.builder()
            .setAps(Aps.builder()
                .setBadge(1)
                .setSound("default")
                .build())
            .build();
    }

    /**
     * Send message with retry logic.
     */
    private void sendWithRetry(Message message, NotificationType type) {
        if (!firebaseInitialized) {
            // Simulate send when Firebase is not configured
            log.info("FCM Message simulated (Firebase not initialized): type={}", type);
            return;
        }

        int retryCount = 0;
        while (retryCount < MAX_RETRIES) {
            try {
                String response = FirebaseMessaging.getInstance().send(message);
                log.debug("FCM send response: {}", response);
                return;
            } catch (FirebaseMessagingException e) {
                retryCount++;
                MessagingErrorCode errorCode = e.getMessagingErrorCode();
                
                // Don't retry for permanent errors
                if (errorCode == MessagingErrorCode.UNREGISTERED || 
                    errorCode == MessagingErrorCode.INVALID_ARGUMENT) {
                    log.warn("Permanent FCM error, not retrying: {}", errorCode);
                    return;
                }

                if (retryCount < MAX_RETRIES) {
                    log.warn("FCM send failed, retrying ({}/{}): {}", retryCount, MAX_RETRIES, e.getMessage());
                    try {
                        Thread.sleep(1000L * retryCount); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                } else {
                    log.error("FCM send failed after {} retries", MAX_RETRIES, e);
                }
            }
        }
    }

    /**
     * Partition a list into smaller sublists.
     */
    private <T> List<List<T>> partitionList(List<T> list, int size) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            partitions.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return partitions;
    }

    /**
     * Mask token for logging (security).
     */
    private String maskToken(String token) {
        if (token == null || token.length() < 10) {
            return "***";
        }
        return token.substring(0, 10) + "...";
    }

    private String getIconForType(NotificationType type) {
        return switch (type) {
            case NEW_FOLLOWER -> "ic_person_add";
            case POST_LIKED -> "ic_favorite";
            case POST_COMMENTED -> "ic_chat";
            case MENTION -> "ic_alternate_email";
            case NEW_MESSAGE -> "ic_mail";
            case VERIFICATION_APPROVED -> "ic_verified";
            case VERIFICATION_REJECTED -> "ic_error";
            default -> "ic_notification";
        };
    }

    private String getColorForType(NotificationType type) {
        return switch (type) {
            case VERIFICATION_APPROVED -> "#10B981";
            case VERIFICATION_REJECTED, ACCOUNT_SUSPENDED -> "#EF4444";
            case NEW_MESSAGE -> "#6366F1";
            case NEW_FOLLOWER -> "#3B82F6";
            case POST_LIKED -> "#EF4444";
            default -> "#2563EB";
        };
    }
}
