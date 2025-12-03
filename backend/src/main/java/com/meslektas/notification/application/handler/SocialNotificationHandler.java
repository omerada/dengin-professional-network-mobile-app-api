package com.meslektas.notification.application.handler;

import com.meslektas.notification.application.service.NotificationService;
import com.meslektas.notification.domain.model.NotificationType;
import com.meslektas.social.domain.model.PostLikedEvent;
import com.meslektas.social.domain.model.UserFollowedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Event handler for social-related notifications.
 * 
 * Listens to domain events from Social Context and creates appropriate
 * notifications.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SocialNotificationHandler {

    private final NotificationService notificationService;

    /**
     * Handle new follower event.
     */
    @EventListener
    @Async
    public void handleUserFollowed(UserFollowedEvent event) {
        log.debug("Handling UserFollowedEvent: follower={}, following={}",
                event.getFollowerId(), event.getFollowingId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("followerId", event.getFollowerId().toString());

            notificationService.createNotification(
                    event.getFollowingId(), // The user being followed
                    NotificationType.NEW_FOLLOWER,
                    "Yeni takipçiniz var",
                    "Bir kullanıcı sizi takip etmeye başladı",
                    "/profile/" + event.getFollowerId(),
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for UserFollowedEvent", e);
        }
    }

    /**
     * Handle post liked event.
     */
    @EventListener
    @Async
    public void handlePostLiked(PostLikedEvent event) {
        log.debug("Handling PostLikedEvent: post={}, liker={}",
                event.getPostId(), event.getUserId());

        try {
            // Don't notify if user liked their own post
            if (event.getPostAuthorId().equals(event.getUserId())) {
                return;
            }

            Map<String, String> metadata = new HashMap<>();
            metadata.put("postId", event.getPostId().getValue().toString());
            metadata.put("likerId", event.getUserId().toString());

            notificationService.createNotification(
                    event.getPostAuthorId(),
                    NotificationType.POST_LIKED,
                    "Gönderiniz beğenildi",
                    "Bir kullanıcı gönderinizi beğendi",
                    "/post/" + event.getPostId().getValue(),
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for PostLikedEvent", e);
        }
    }
}
