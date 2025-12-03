package com.meslektas.verification.application.eventhandler;

import com.meslektas.verification.domain.event.VerificationSubmittedEvent;
import com.meslektas.verification.application.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

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
 * - Retry failed processing with exponential backoff
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VerificationSubmittedEventHandler {
    
    private final VerificationService verificationService;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String FAILED_VERIFICATION_QUEUE = "verification:failed-queue";
    private static final String RETRY_COUNT_KEY = "verification:retry:";
    private static final int MAX_RETRIES = 3;
    
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
            
            // Clear any retry count on success
            clearRetryCount(event.getVerificationRequestId());
            
        } catch (Exception e) {
            log.error("Failed to process verification {}", event.getVerificationId(), e);
            handleFailedProcessing(event);
        }
    }
    
    /**
     * Handle failed verification processing with retry logic
     */
    private void handleFailedProcessing(VerificationSubmittedEvent event) {
        Long verificationId = event.getVerificationRequestId();
        String retryKey = RETRY_COUNT_KEY + verificationId;
        
        try {
            // Get current retry count
            Integer retryCount = (Integer) redisTemplate.opsForValue().get(retryKey);
            int currentRetry = (retryCount != null) ? retryCount : 0;
            
            if (currentRetry < MAX_RETRIES) {
                // Increment retry count with expiration
                currentRetry++;
                redisTemplate.opsForValue().set(retryKey, currentRetry, 24, TimeUnit.HOURS);
                
                // Add to failed queue for retry processing
                FailedVerification failedVerification = new FailedVerification(
                    verificationId,
                    event.getVerificationId().toString(),
                    event.getUserId(),
                    currentRetry,
                    System.currentTimeMillis()
                );
                
                redisTemplate.opsForList().leftPush(FAILED_VERIFICATION_QUEUE, failedVerification);
                log.warn("Added verification {} to retry queue, attempt {}/{}", 
                    verificationId, currentRetry, MAX_RETRIES);
                
                // Schedule retry with exponential backoff (handled by scheduled job)
            } else {
                // Max retries exceeded - move to dead letter queue
                log.error("Verification {} failed after {} retries, moving to dead letter queue", 
                    verificationId, MAX_RETRIES);
                
                String deadLetterKey = "verification:dead-letter";
                redisTemplate.opsForList().leftPush(deadLetterKey, new FailedVerification(
                    verificationId,
                    event.getVerificationId().toString(),
                    event.getUserId(),
                    currentRetry,
                    System.currentTimeMillis()
                ));
                
                // Clear retry count
                clearRetryCount(verificationId);
            }
        } catch (Exception redisError) {
            log.error("Failed to handle retry for verification {}: {}", 
                verificationId, redisError.getMessage());
        }
    }
    
    /**
     * Clear retry count on success or when max retries exceeded
     */
    private void clearRetryCount(Long verificationId) {
        try {
            redisTemplate.delete(RETRY_COUNT_KEY + verificationId);
        } catch (Exception e) {
            log.warn("Failed to clear retry count for verification {}", verificationId);
        }
    }
    
    /**
     * Failed verification record for queue processing
     */
    public record FailedVerification(
        Long verificationRequestId,
        String verificationId,
        Long userId,
        int retryCount,
        long failedAt
    ) {}
}
