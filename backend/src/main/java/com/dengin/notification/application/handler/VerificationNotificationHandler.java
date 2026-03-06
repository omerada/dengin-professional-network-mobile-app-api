package com.dengin.notification.application.handler;

import com.dengin.notification.application.service.NotificationService;
import com.dengin.notification.domain.model.NotificationType;
import com.dengin.verification.domain.event.*;
import com.dengin.verification.domain.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Event handler for verification-related notifications.
 * 
 * Listens to domain events from Verification Context and creates appropriate
 * notifications.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class VerificationNotificationHandler {

    private final NotificationService notificationService;

    /**
     * Handle verification auto-approved event.
     */
    @EventListener
    @Async
    public void handleVerificationAutoApproved(VerificationAutoApprovedEvent event) {
        log.debug("Handling VerificationAutoApprovedEvent: verification={}, user={}",
                event.getVerificationId(), event.getUserId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("verificationId", event.getVerificationId().toString());
            metadata.put("professionId", event.getProfessionId().toString());

            notificationService.createNotification(
                    event.getUserId(),
                    NotificationType.VERIFICATION_APPROVED,
                    "Meslek doğrulamanız onaylandı!",
                    "Tebrikler! AI doğrulama sistemi belgenizi başarıyla doğruladı.",
                    "/profile/verification",
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for VerificationAutoApprovedEvent", e);
        }
    }

    /**
     * Handle verification manually approved event.
     */
    @EventListener
    @Async
    public void handleVerificationManuallyApproved(VerificationManuallyApprovedEvent event) {
        log.debug("Handling VerificationManuallyApprovedEvent: verification={}, user={}",
                event.getVerificationId(), event.getUserId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("verificationId", event.getVerificationId().toString());
            metadata.put("professionId", event.getProfessionId().toString());

            notificationService.createNotification(
                    event.getUserId(),
                    NotificationType.VERIFICATION_APPROVED,
                    "Meslek doğrulamanız onaylandı!",
                    "Tebrikler! Belgeleriniz incelendi ve onaylandı.",
                    "/profile/verification",
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for VerificationManuallyApprovedEvent", e);
        }
    }

    /**
     * Handle verification auto-rejected event.
     */
    @EventListener
    @Async
    public void handleVerificationAutoRejected(VerificationAutoRejectedEvent event) {
        log.debug("Handling VerificationAutoRejectedEvent: verification={}, user={}",
                event.getVerificationId(), event.getUserId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("verificationId", event.getVerificationId().toString());
            metadata.put("reason",
                    event.getRejectionReason() != null ? event.getRejectionReason() : "Belgeler doğrulanamadı");

            notificationService.createNotification(
                    event.getUserId(),
                    NotificationType.VERIFICATION_REJECTED,
                    "Meslek doğrulamanız reddedildi",
                    "Belgeleriniz doğrulanamadı. Lütfen yeniden deneyin.",
                    "/profile/verification",
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for VerificationAutoRejectedEvent", e);
        }
    }

    /**
     * Handle verification manually rejected event.
     */
    @EventListener
    @Async
    public void handleVerificationManuallyRejected(VerificationManuallyRejectedEvent event) {
        log.debug("Handling VerificationManuallyRejectedEvent: verification={}, user={}",
                event.getVerificationId(), event.getUserId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("verificationId", event.getVerificationId().toString());
            if (event.getNotes() != null) {
                metadata.put("reason", event.getNotes());
            }

            notificationService.createNotification(
                    event.getUserId(),
                    NotificationType.VERIFICATION_REJECTED,
                    "Meslek doğrulamanız reddedildi",
                    event.getNotes() != null ? event.getNotes() : "Belgeleriniz kabul edilmedi.",
                    "/profile/verification",
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for VerificationManuallyRejectedEvent", e);
        }
    }

    /**
     * Handle verification sent to manual review event.
     */
    @EventListener
    @Async
    public void handleVerificationSentToManualReview(VerificationSentToManualReviewEvent event) {
        log.debug("Handling VerificationSentToManualReviewEvent: verification={}, user={}",
                event.getVerificationId(), event.getUserId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("verificationId", event.getVerificationId().toString());

            notificationService.createNotification(
                    event.getUserId(),
                    NotificationType.VERIFICATION_PENDING_REVIEW,
                    "Doğrulama işleminiz inceleniyor",
                    "Belgeleriniz manuel inceleme için gönderildi. Sonucu en kısa sürede bildireceğiz.",
                    "/profile/verification",
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for VerificationSentToManualReviewEvent", e);
        }
    }
}
