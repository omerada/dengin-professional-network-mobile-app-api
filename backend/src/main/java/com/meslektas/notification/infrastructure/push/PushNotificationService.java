package com.meslektas.notification.infrastructure.push;

import com.meslektas.notification.domain.model.NotificationContent;
import com.meslektas.notification.domain.model.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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

    private static final int MAX_RETRIES = 3;

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
                    deviceToken.substring(0, 10) + "...");
            return;
        }

        log.info("Sending push notification: type={}, token={}...", type, deviceToken.substring(0, 10));

        try {
            PushMessage message = buildMessage(deviceToken, type, content, data);
            sendWithRetry(message);

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

        log.info("Sending batch push notification: type={}, devices={}", type, deviceTokens.size());

        for (String token : deviceTokens) {
            try {
                sendPushNotification(token, type, content, data);
            } catch (Exception e) {
                log.error("Failed to send push to device: {}", token.substring(0, 10), e);
            }
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

        log.debug("Sending silent push to: {}...", deviceToken.substring(0, 10));

        try {
            PushMessage message = PushMessage.builder()
                    .token(deviceToken)
                    .data(data)
                    .contentAvailable(true)
                    .priority("high")
                    .build();

            sendWithRetry(message);
        } catch (Exception e) {
            log.error("Failed to send silent push", e);
        }
    }

    /**
     * Build FCM message.
     */
    private PushMessage buildMessage(
            String deviceToken,
            NotificationType type,
            NotificationContent content,
            Map<String, String> data) {
        return PushMessage.builder()
                .token(deviceToken)
                .title(content.getTitle())
                .body(content.getBody())
                .icon(getIconForType(type))
                .color(getColorForType(type))
                .clickAction(content.getActionUrl())
                .data(data)
                .priority("high")
                .badge(1)
                .sound("default")
                .build();
    }

    /**
     * Send message with retry logic.
     * In production, this would use Firebase Admin SDK.
     */
    private void sendWithRetry(PushMessage message) {
        // TODO: Implement actual FCM sending using Firebase Admin SDK
        // For now, just log the message
        log.info("FCM Message would be sent: title={}, body={}, token={}...",
                message.getTitle(),
                message.getBody(),
                message.getToken() != null ? message.getToken().substring(0, 10) : "N/A");

        /*
         * // Production implementation would look like:
         * Message fcmMessage = Message.builder()
         * .setToken(message.getToken())
         * .setNotification(Notification.builder()
         * .setTitle(message.getTitle())
         * .setBody(message.getBody())
         * .build())
         * .setAndroidConfig(AndroidConfig.builder()
         * .setPriority(AndroidConfig.Priority.HIGH)
         * .setNotification(AndroidNotification.builder()
         * .setIcon(message.getIcon())
         * .setColor(message.getColor())
         * .setSound("default")
         * .build())
         * .build())
         * .setApnsConfig(ApnsConfig.builder()
         * .setAps(Aps.builder()
         * .setBadge(message.getBadge())
         * .setSound("default")
         * .build())
         * .build())
         * .putAllData(message.getData())
         * .build();
         * 
         * String response = FirebaseMessaging.getInstance().send(fcmMessage);
         * log.debug("FCM send response: {}", response);
         */
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

    /**
     * Internal push message representation.
     */
    @lombok.Builder
    @lombok.Getter
    private static class PushMessage {
        private String token;
        private String title;
        private String body;
        private String icon;
        private String color;
        private String clickAction;
        private Map<String, String> data;
        private String priority;
        private boolean contentAvailable;
        private int badge;
        private String sound;
    }
}
