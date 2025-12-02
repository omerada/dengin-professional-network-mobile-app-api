package com.meslektas.verification.application.eventhandler;

import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.verification.domain.event.VerificationAutoApprovedEvent;
import com.meslektas.verification.domain.event.VerificationManuallyApprovedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Verification Approved Event Handler
 * 
 * Listens to verification approval events and updates user's profession verification status.
 * 
 * Events:
 * - VerificationAutoApprovedEvent (AI auto-approved, confidence >= 85%)
 * - VerificationManuallyApprovedEvent (Admin approved after manual review)
 * 
 * Action:
 * - Mark user's profession as verified
 * - Update user entity with verified profession
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VerificationApprovedEventHandler {
    
    private final UserRepository userRepository;
    
    /**
     * Handle auto-approved verification
     * Updates user's profession to verified status
     */
    @EventListener
    @Async
    @Transactional
    public void handleAutoApproved(VerificationAutoApprovedEvent event) {
        log.info("Handling auto-approved verification for user {} profession {}", 
            event.getUserId(), event.getProfessionId());
        
        try {
            User user = userRepository.findById(event.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found: " + event.getUserId()));
            
            // Mark profession as verified
            user.verifyProfession();
            userRepository.save(user);
            
            log.info("User {} profession verified automatically (confidence: {}%)", 
                event.getUserId(), event.getAiConfidence());
                
        } catch (Exception e) {
            log.error("Failed to update user verification status for user {}", event.getUserId(), e);
            throw e; // Re-throw to trigger retry or error handling
        }
    }
    
    /**
     * Handle manually approved verification
     * Updates user's profession to verified status
     */
    @EventListener
    @Async
    @Transactional
    public void handleManuallyApproved(VerificationManuallyApprovedEvent event) {
        log.info("Handling manually approved verification for user {} profession {} by admin {}", 
            event.getUserId(), event.getProfessionId(), event.getApprovedByAdminId());
        
        try {
            User user = userRepository.findById(event.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found: " + event.getUserId()));
            
            // Mark profession as verified
            user.verifyProfession();
            userRepository.save(user);
            
            log.info("User {} profession verified manually by admin {}", 
                event.getUserId(), event.getApprovedByAdminId());
                
        } catch (Exception e) {
            log.error("Failed to update user verification status for user {}", event.getUserId(), e);
            throw e; // Re-throw to trigger retry or error handling
        }
    }
}
