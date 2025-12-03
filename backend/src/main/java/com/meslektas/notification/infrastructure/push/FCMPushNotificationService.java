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
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Firebase Cloud Messaging (FCM) Push Notification Service
 * 
 * Production-ready implementation using Firebase Admin SDK.
 * Supports both Android (FCM) and iOS (APNs via FCM).
 * 
 * Features:
 * - Single device notifications
 * - Batch notifications (up to 500 devices)
 * - Silent push (data-only)
 * - Topic-based messaging
 * - Retry with exponential backoff
 * 
 * Configuration:
 * - Place firebase-service-account.json in resources/
 * - Set firebase.enabled=true in application.yml
 */
@Service
@Slf4j
public class FCMPushNotificationService {
    
    @Value("${firebase.enabled:false}")
    private boolean pushEnabled;
    
    @Value("${firebase.credentials-file:firebase-service-account.json}")
    private String credentialsFile;
    
    @Value("${firebase.project-id:}")
    private String projectId;
    
    private boolean initialized = false;
    
    private static final int MAX_BATCH_SIZE = 500; // FCM limit
    private static final int MAX_RETRIES = 3;
    private static final int[] RETRY_DELAYS_MS = {1000, 2000, 4000}; // Exponential backoff
    
    /**
     * Initialize Firebase Admin SDK
     */
    @PostConstruct
    public void initialize() {
        if (!pushEnabled) {
            log.info("Firebase push notifications disabled");
            return;
        }
        
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource resource = new ClassPathResource(credentialsFile);
                
                if (!resource.exists()) {
                    log.warn("Firebase credentials file not found: {}. Push notifications will be disabled.", 
                        credentialsFile);
                    return;
                }
                
                try (InputStream serviceAccount = resource.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setProjectId(projectId)
                        .build();
                    
                    FirebaseApp.initializeApp(options);
                    initialized = true;
                    log.info("Firebase Admin SDK initialized successfully for project: {}", projectId);
                }
            } else {
                initialized = true;
                log.info("Firebase Admin SDK already initialized");
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase Admin SDK", e);
        }
    }
    
    /**
     * Send push notification to a single device
     * 
     * @param deviceToken FCM device token
     * @param type Notification type
     * @param content Notification content (title, body)
     * @param data Additional data payload
     * @return true if sent successfully
     */
    @Async
    public CompletableFuture<Boolean> sendPushNotification(
        String deviceToken,
        NotificationType type,
        NotificationContent content,
        Map<String, String> data
    ) {
        if (!isReady()) {
            log.debug("FCM not ready, skipping notification");
            return CompletableFuture.completedFuture(false);
        }
        
        if (deviceToken == null || deviceToken.isBlank()) {
            log.warn("Empty device token provided");
            return CompletableFuture.completedFuture(false);
        }
        
        log.info("Sending FCM push: type={}, token={}...", type, maskToken(deviceToken));
        
        try {
            Message message = buildMessage(deviceToken, type, content, data);
            String response = sendWithRetry(message);
            
            log.info("FCM push sent successfully: type={}, response={}", type, response);
            return CompletableFuture.completedFuture(true);
            
        } catch (FirebaseMessagingException e) {
            handleFCMError(e, deviceToken);
            return CompletableFuture.completedFuture(false);
        } catch (Exception e) {
            log.error("Failed to send FCM push: type={}", type, e);
            return CompletableFuture.completedFuture(false);
        }
    }
    
    /**
     * Send push notification to multiple devices
     * Automatically batches if more than 500 devices
     * 
     * @param deviceTokens List of FCM device tokens
     * @param type Notification type
     * @param content Notification content
     * @param data Additional data payload
     * @return Number of successful sends
     */
    @Async
    public CompletableFuture<Integer> sendPushNotificationToMultiple(
        List<String> deviceTokens,
        NotificationType type,
        NotificationContent content,
        Map<String, String> data
    ) {
        if (!isReady() || deviceTokens == null || deviceTokens.isEmpty()) {
            return CompletableFuture.completedFuture(0);
        }
        
        log.info("Sending batch FCM push: type={}, devices={}", type, deviceTokens.size());
        
        // Filter out invalid tokens
        List<String> validTokens = deviceTokens.stream()
            .filter(t -> t != null && !t.isBlank())
            .toList();
        
        if (validTokens.isEmpty()) {
            return CompletableFuture.completedFuture(0);
        }
        
        int successCount = 0;
        
        // Batch in groups of 500 (FCM limit)
        for (int i = 0; i < validTokens.size(); i += MAX_BATCH_SIZE) {
            List<String> batch = validTokens.subList(
                i, 
                Math.min(i + MAX_BATCH_SIZE, validTokens.size())
            );
            
            try {
                int batchSuccess = sendBatch(batch, type, content, data);
                successCount += batchSuccess;
            } catch (Exception e) {
                log.error("Failed to send FCM batch starting at index {}", i, e);
            }
        }
        
        log.info("Batch FCM push completed: {}/{} successful", successCount, validTokens.size());
        return CompletableFuture.completedFuture(successCount);
    }
    
    /**
     * Send notification batch
     */
    private int sendBatch(
        List<String> deviceTokens,
        NotificationType type,
        NotificationContent content,
        Map<String, String> data
    ) throws FirebaseMessagingException {
        MulticastMessage message = buildMulticastMessage(deviceTokens, type, content, data);
        
        BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
        
        int successCount = response.getSuccessCount();
        int failureCount = response.getFailureCount();
        
        if (failureCount > 0) {
            List<String> invalidTokens = new ArrayList<>();
            List<SendResponse> responses = response.getResponses();
            
            for (int i = 0; i < responses.size(); i++) {
                SendResponse sendResponse = responses.get(i);
                if (!sendResponse.isSuccessful()) {
                    FirebaseMessagingException exception = sendResponse.getException();
                    if (exception != null && isInvalidToken(exception)) {
                        invalidTokens.add(deviceTokens.get(i));
                    }
                }
            }
            
            if (!invalidTokens.isEmpty()) {
                log.warn("Found {} invalid FCM tokens, should be removed from database", 
                    invalidTokens.size());
                // In production, publish event to remove invalid tokens
                // eventPublisher.publishEvent(new InvalidTokensDetectedEvent(invalidTokens));
            }
        }
        
        log.debug("Batch result: {}/{} successful", successCount, deviceTokens.size());
        return successCount;
    }
    
    /**
     * Send silent push (data-only) for background updates
     * 
     * @param deviceToken FCM device token
     * @param data Data payload
     * @return true if sent successfully
     */
    @Async
    public CompletableFuture<Boolean> sendSilentPush(String deviceToken, Map<String, String> data) {
        if (!isReady() || deviceToken == null || deviceToken.isBlank()) {
            return CompletableFuture.completedFuture(false);
        }
        
        log.debug("Sending silent push to: {}...", maskToken(deviceToken));
        
        try {
            Message message = Message.builder()
                .setToken(deviceToken)
                .putAllData(data)
                .setAndroidConfig(AndroidConfig.builder()
                    .setPriority(AndroidConfig.Priority.HIGH)
                    .build())
                .setApnsConfig(ApnsConfig.builder()
                    .setAps(Aps.builder()
                        .setContentAvailable(true)
                        .build())
                    .build())
                .build();
            
            FirebaseMessaging.getInstance().send(message);
            return CompletableFuture.completedFuture(true);
            
        } catch (Exception e) {
            log.error("Failed to send silent push", e);
            return CompletableFuture.completedFuture(false);
        }
    }
    
    /**
     * Send notification to a topic
     * 
     * @param topic Topic name (e.g., "profession_doctors")
     * @param type Notification type
     * @param content Notification content
     * @param data Additional data
     */
    @Async
    public CompletableFuture<Boolean> sendToTopic(
        String topic,
        NotificationType type,
        NotificationContent content,
        Map<String, String> data
    ) {
        if (!isReady() || topic == null || topic.isBlank()) {
            return CompletableFuture.completedFuture(false);
        }
        
        log.info("Sending FCM to topic: {}, type={}", topic, type);
        
        try {
            Message message = Message.builder()
                .setTopic(topic)
                .setNotification(Notification.builder()
                    .setTitle(content.getTitle())
                    .setBody(content.getBody())
                    .build())
                .setAndroidConfig(buildAndroidConfig(type))
                .setApnsConfig(buildApnsConfig(type))
                .putAllData(data != null ? data : Map.of())
                .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Topic notification sent: topic={}, response={}", topic, response);
            return CompletableFuture.completedFuture(true);
            
        } catch (Exception e) {
            log.error("Failed to send topic notification: topic={}", topic, e);
            return CompletableFuture.completedFuture(false);
        }
    }
    
    /**
     * Subscribe device to a topic
     */
    public boolean subscribeToTopic(String deviceToken, String topic) {
        if (!isReady()) return false;
        
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                .subscribeToTopic(List.of(deviceToken), topic);
            
            return response.getSuccessCount() > 0;
        } catch (Exception e) {
            log.error("Failed to subscribe to topic: {}", topic, e);
            return false;
        }
    }
    
    /**
     * Unsubscribe device from a topic
     */
    public boolean unsubscribeFromTopic(String deviceToken, String topic) {
        if (!isReady()) return false;
        
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                .unsubscribeFromTopic(List.of(deviceToken), topic);
            
            return response.getSuccessCount() > 0;
        } catch (Exception e) {
            log.error("Failed to unsubscribe from topic: {}", topic, e);
            return false;
        }
    }
    
    /**
     * Build FCM Message for single device
     */
    private Message buildMessage(
        String deviceToken,
        NotificationType type,
        NotificationContent content,
        Map<String, String> data
    ) {
        Message.Builder builder = Message.builder()
            .setToken(deviceToken)
            .setNotification(Notification.builder()
                .setTitle(content.getTitle())
                .setBody(content.getBody())
                .build())
            .setAndroidConfig(buildAndroidConfig(type))
            .setApnsConfig(buildApnsConfig(type));
        
        if (data != null && !data.isEmpty()) {
            builder.putAllData(data);
        }
        
        // Add notification type to data for app handling
        builder.putData("notificationType", type.name());
        
        if (content.getActionUrl() != null) {
            builder.putData("actionUrl", content.getActionUrl());
        }
        
        return builder.build();
    }
    
    /**
     * Build multicast message for batch sending
     */
    private MulticastMessage buildMulticastMessage(
        List<String> deviceTokens,
        NotificationType type,
        NotificationContent content,
        Map<String, String> data
    ) {
        MulticastMessage.Builder builder = MulticastMessage.builder()
            .addAllTokens(deviceTokens)
            .setNotification(Notification.builder()
                .setTitle(content.getTitle())
                .setBody(content.getBody())
                .build())
            .setAndroidConfig(buildAndroidConfig(type))
            .setApnsConfig(buildApnsConfig(type));
        
        if (data != null && !data.isEmpty()) {
            builder.putAllData(data);
        }
        
        builder.putData("notificationType", type.name());
        
        return builder.build();
    }
    
    /**
     * Build Android-specific config
     */
    private AndroidConfig buildAndroidConfig(NotificationType type) {
        return AndroidConfig.builder()
            .setPriority(AndroidConfig.Priority.HIGH)
            .setTtl(3600 * 1000) // 1 hour
            .setNotification(AndroidNotification.builder()
                .setIcon(getIconForType(type))
                .setColor(getColorForType(type))
                .setSound("default")
                .setChannelId(getChannelForType(type))
                .build())
            .build();
    }
    
    /**
     * Build iOS-specific config
     */
    private ApnsConfig buildApnsConfig(NotificationType type) {
        return ApnsConfig.builder()
            .setAps(Aps.builder()
                .setSound("default")
                .setBadge(1)
                .setCategory(getCategoryForType(type))
                .build())
            .build();
    }
    
    /**
     * Send with retry logic
     */
    private String sendWithRetry(Message message) throws FirebaseMessagingException {
        FirebaseMessagingException lastException = null;
        
        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                return FirebaseMessaging.getInstance().send(message);
            } catch (FirebaseMessagingException e) {
                lastException = e;
                
                if (!isRetryable(e)) {
                    throw e;
                }
                
                if (attempt < MAX_RETRIES - 1) {
                    try {
                        Thread.sleep(RETRY_DELAYS_MS[attempt]);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw e;
                    }
                    log.warn("FCM send failed, retrying (attempt {}): {}", attempt + 1, e.getMessage());
                }
            }
        }
        
        throw lastException;
    }
    
    /**
     * Check if error is retryable
     */
    private boolean isRetryable(FirebaseMessagingException e) {
        MessagingErrorCode code = e.getMessagingErrorCode();
        return code == MessagingErrorCode.INTERNAL ||
               code == MessagingErrorCode.UNAVAILABLE;
    }
    
    /**
     * Check if token is invalid
     */
    private boolean isInvalidToken(FirebaseMessagingException e) {
        MessagingErrorCode code = e.getMessagingErrorCode();
        return code == MessagingErrorCode.INVALID_ARGUMENT ||
               code == MessagingErrorCode.UNREGISTERED;
    }
    
    /**
     * Handle FCM errors
     */
    private void handleFCMError(FirebaseMessagingException e, String token) {
        MessagingErrorCode code = e.getMessagingErrorCode();
        
        switch (code) {
            case INVALID_ARGUMENT:
            case UNREGISTERED:
                log.warn("Invalid/unregistered FCM token: {}...", maskToken(token));
                // Token should be removed from database
                break;
            case QUOTA_EXCEEDED:
                log.error("FCM quota exceeded!");
                break;
            case SENDER_ID_MISMATCH:
                log.error("FCM sender ID mismatch - check configuration");
                break;
            default:
                log.error("FCM error ({}): {}", code, e.getMessage());
        }
    }
    
    /**
     * Check if service is ready
     */
    private boolean isReady() {
        return pushEnabled && initialized;
    }
    
    /**
     * Mask token for logging
     */
    private String maskToken(String token) {
        if (token == null || token.length() < 10) return "***";
        return token.substring(0, 10) + "...";
    }
    
    // Icon, color, channel mappings
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
    
    private String getChannelForType(NotificationType type) {
        return switch (type) {
            case NEW_MESSAGE -> "messages";
            case NEW_FOLLOWER, POST_LIKED, POST_COMMENTED, MENTION -> "social";
            case VERIFICATION_APPROVED, VERIFICATION_REJECTED, VERIFICATION_PENDING_REVIEW -> "verification";
            default -> "default";
        };
    }
    
    private String getCategoryForType(NotificationType type) {
        return switch (type) {
            case NEW_MESSAGE -> "MESSAGE_CATEGORY";
            case NEW_FOLLOWER -> "SOCIAL_CATEGORY";
            default -> "DEFAULT_CATEGORY";
        };
    }
}
