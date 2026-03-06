package com.dengin.verification.infrastructure.scheduler;

import com.dengin.verification.domain.model.VerificationRequest;
import com.dengin.verification.domain.repository.VerificationRequestRepository;
import com.dengin.common.infrastructure.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Scheduled job to mark expired verification requests
 * 
 * Runs daily at 2 AM to find requests that have passed
 * their expiration date (7 days after submission) and
 * mark them as EXPIRED.
 * 
 * Business Rule: BR-007 - Verification requests expire after 7 days
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VerificationExpiryScheduler {
    
    private final VerificationRequestRepository repository;
    private final DomainEventPublisher eventPublisher;
    
    /**
     * Mark expired verification requests
     * 
     * Runs daily at 2:00 AM (cron: 0 0 2 * * *)
     * Finds all requests where:
     * - expiresAt < now()
     * - status is not in final states (AUTO_APPROVED, AUTO_REJECTED, APPROVED, REJECTED, EXPIRED)
     */
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2:00 AM
    @Transactional
    public void markExpiredVerifications() {
        log.info("Starting verification expiry job");
        
        Instant now = Instant.now();
        List<VerificationRequest> expiredRequests = repository.findExpiredRequests(now);
        
        if (expiredRequests.isEmpty()) {
            log.info("No expired verification requests found");
            return;
        }
        
        log.info("Found {} expired verification requests", expiredRequests.size());
        
        int markedCount = 0;
        for (VerificationRequest request : expiredRequests) {
            try {
                // Mark as expired
                request.markAsExpired();
                repository.save(request);
                
                // Publish domain events
                eventPublisher.publishEvents(request.getEvents());
                request.clearEvents();
                
                markedCount++;
                
                log.debug("Marked verification {} as EXPIRED", request.getVerificationId());
                
            } catch (Exception e) {
                log.error("Failed to mark verification {} as expired", 
                    request.getVerificationId(), e);
            }
        }
        
        log.info("Verification expiry job completed - Marked {}/{} requests as EXPIRED", 
            markedCount, expiredRequests.size());
    }
}
