package com.meslektas.verification.application.eventhandler;

import com.meslektas.verification.domain.event.VerificationSubmittedEvent;
import com.meslektas.verification.application.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Verification Submitted Event Handler
 * 
 * Listens to verification submission and triggers async AI processing.
 * 
 * Event: VerificationSubmittedEvent
 * 
 * Action:
 * - Trigger AI processing asynchronously
 * - Process with AWS Rekognition
 * - Auto-decision or route to manual review
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VerificationSubmittedEventHandler {
    
    private final VerificationService verificationService;
    
    /**
     * Handle verification submitted event
     * Triggers async AI processing
     */
    @EventListener
    @Async
    public void handleVerificationSubmitted(VerificationSubmittedEvent event) {
        log.info("Processing verification request {} for user {}", 
            event.getVerificationId(), event.getUserId());
        
        try {
            // Trigger AI processing (async)
            // Note: event has verificationRequestId (Long DB ID)
            verificationService.processVerificationAsync(event.getVerificationRequestId());
            
            log.info("AI processing started for verification {}", event.getVerificationId());
            
        } catch (Exception e) {
            log.error("Failed to process verification {}", event.getVerificationId(), e);
            // TODO: Add to retry queue or dead letter queue
        }
    }
}
