package com.dengin.verification.application.service;

import com.dengin.identity.application.service.ProfessionService;
import com.dengin.verification.application.dto.SubmitVerificationRequest;
import com.dengin.verification.application.dto.VerificationResponse;
import com.dengin.verification.application.dto.VerificationAttemptResponse;
import com.dengin.verification.application.dto.VerificationEligibilityResponse;
import com.dengin.verification.application.dto.VerificationStatisticsResponse;
import com.dengin.verification.domain.model.*;
import com.dengin.verification.domain.model.*;
import com.dengin.verification.domain.repository.VerificationRequestRepository;
import com.dengin.verification.domain.service.VerificationAttemptPolicy;
import com.dengin.verification.infrastructure.aws.RekognitionService;
import com.dengin.common.infrastructure.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Verification Application Service
 * 
 * Orchestrates verification workflow:
 * 1. User submits verification request
 * 2. Validate attempt policy (max 3, 24h cooldown)
 * 3. Create verification request
 * 4. Upload documents to S3
 * 5. Trigger AI processing
 * 6. Auto-decision or manual review
 * 
 * Transaction boundaries and application logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {
    
    private final VerificationRequestRepository repository;
    private final VerificationAttemptPolicy attemptPolicy;
    private final RekognitionService rekognitionService;
    private final ProfessionService professionService;
    private final DomainEventPublisher eventPublisher;
    
    /**
     * Submit new verification request
     * 
     * @param request Verification request with document and selfie
     * @param userId Current user ID
     * @return Created verification request
     */
    @Transactional
    public VerificationResponse submitVerification(SubmitVerificationRequest request, Long userId) {
        log.info("User {} submitting verification for profession {}", userId, request.getProfessionId());
        
        // Step 1: Validate attempt policy
        VerificationAttemptPolicy.ValidationResult validationResult = 
            attemptPolicy.canSubmitVerification(userId, request.getProfessionId());
        
        if (!validationResult.isValid()) {
            log.warn("Verification submission rejected: {}", validationResult.getErrorMessage());
            throw new IllegalStateException(validationResult.getErrorMessage());
        }
        
        // Step 2: Get next attempt number
        int attemptNumber = attemptPolicy.getNextAttemptNumber(userId, request.getProfessionId());
        
        log.info("Creating verification request - Attempt {}/3", attemptNumber);
        
        // Step 3: Create value objects
        DocumentImage documentImage = DocumentImage.of(
            request.getDocumentS3Key(),
            request.getDocumentFileName(),
            request.getDocumentContentType(),
            request.getDocumentFileSize()
        );
        
        SelfieImage selfieImage = SelfieImage.of(
            request.getSelfieS3Key(),
            request.getSelfieFileName(),
            request.getSelfieContentType(),
            request.getSelfieFileSize()
        );
        
        // Step 4: Create verification request aggregate
        VerificationRequest verificationRequest = VerificationRequest.create(
            userId,
            request.getProfessionId(),
            documentImage,
            selfieImage,
            attemptNumber
        );
        
        // Step 5: Save (generates ID)
        verificationRequest = repository.save(verificationRequest);
        
        // Step 6: Publish submitted event (after ID is set)
        verificationRequest.publishSubmittedEvent();
        eventPublisher.publishEvents(verificationRequest.getEvents());
        verificationRequest.clearEvents();
        
        log.info("Verification request created: {}", verificationRequest.getVerificationId());
        
        // Step 7: Start AI processing asynchronously
        processVerificationAsync(verificationRequest.getId());
        
        return mapToResponse(verificationRequest);
    }
    
    /**
     * Process verification with AI (async)
     * This will be called asynchronously by event listener or scheduler
     */
    @Transactional
    public void processVerificationAsync(Long verificationId) {
        log.info("Starting AI processing for verification {}", verificationId);
        
        VerificationRequest verification = repository.findById(verificationId)
            .orElseThrow(() -> new IllegalArgumentException("Verification not found: " + verificationId));
        
        // Mark as AI processing
        verification.startAIProcessing();
        repository.save(verification);
        eventPublisher.publishEvents(verification.getEvents());
        verification.clearEvents();
        
        // Call AWS Rekognition
        AIVerificationResult aiResult = rekognitionService.verifyDocument(
            verification.getDocumentImage().getS3Key(),
            verification.getSelfieImage().getS3Key()
        );
        
        // Process AI result (auto-decision or manual review)
        verification.processAIResult(aiResult);
        repository.save(verification);
        eventPublisher.publishEvents(verification.getEvents());
        verification.clearEvents();
        
        log.info("AI processing completed - Status: {}, Confidence: {}%", 
            verification.getStatus(), 
            aiResult.getOverallConfidence());
    }
    
    /**
     * Get user's verification requests
     */
    @Transactional(readOnly = true)
    public List<VerificationResponse> getUserVerifications(Long userId) {
        return repository.findByUserIdOrderBySubmittedAtDesc(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get verification by ID
     */
    @Transactional(readOnly = true)
    public VerificationResponse getVerificationById(Long id, Long userId) {
        VerificationRequest verification = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Verification not found: " + id));
        
        // Authorization check
        if (!verification.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to verification");
        }
        
        return mapToResponse(verification);
    }
    
    /**
     * Get pending manual reviews (admin only)
     */
    @Transactional(readOnly = true)
    public List<VerificationResponse> getPendingManualReviews() {
        return repository.findByStatus(VerificationStatus.PENDING_MANUAL_REVIEW).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Admin approve verification
     */
    @Transactional
    public VerificationResponse approveVerification(Long verificationId, Long adminId, String notes) {
        log.info("Admin {} approving verification {}", adminId, verificationId);
        
        VerificationRequest verification = repository.findById(verificationId)
            .orElseThrow(() -> new IllegalArgumentException("Verification not found: " + verificationId));
        
        verification.approveManually(adminId, notes);
        repository.save(verification);
        eventPublisher.publishEvents(verification.getEvents());
        verification.clearEvents();
        
        log.info("Verification {} approved by admin {}", verificationId, adminId);
        
        return mapToResponse(verification);
    }
    
    /**
     * Admin reject verification
     */
    @Transactional
    public VerificationResponse rejectVerification(Long verificationId, Long adminId, String notes) {
        log.info("Admin {} rejecting verification {}", adminId, verificationId);
        
        VerificationRequest verification = repository.findById(verificationId)
            .orElseThrow(() -> new IllegalArgumentException("Verification not found: " + verificationId));
        
        verification.rejectManually(adminId, notes);
        repository.save(verification);
        eventPublisher.publishEvents(verification.getEvents());
        verification.clearEvents();
        
        log.info("Verification {} rejected by admin {}", verificationId, adminId);
        
        return mapToResponse(verification);
    }
    
    /**
     * Get user's verification history
     * Returns all verification attempts with detailed info
     */
    @Transactional(readOnly = true)
    public List<VerificationAttemptResponse> getUserVerificationHistory(Long userId) {
        return repository.findByUserIdOrderBySubmittedAtDesc(userId).stream()
            .map(this::mapToAttemptResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Check eligibility with detailed response
     */
    @Transactional(readOnly = true)
    public VerificationEligibilityResponse checkEligibility(Long userId, Long professionId) {
        // Check if already verified
        boolean alreadyVerified = repository.existsByUserIdAndProfessionIdAndStatusIn(
            userId, 
            professionId,
            List.of(VerificationStatus.AUTO_APPROVED, VerificationStatus.APPROVED)
        );
        
        if (alreadyVerified) {
            return VerificationEligibilityResponse.alreadyVerified();
        }
        
        // Check attempt policy
        VerificationAttemptPolicy.ValidationResult validation = 
            attemptPolicy.canSubmitVerification(userId, professionId);
        
        int totalAttempts = repository.countTotalAttempts(userId, professionId);
        int remainingAttempts = attemptPolicy.getRemainingAttempts(userId, professionId);
        
        if (!validation.isValid()) {
            // Check if max attempts reached
            if (totalAttempts >= 3) {
                return VerificationEligibilityResponse.maxAttemptsReached();
            }
            
            // Check if cooldown active
            Instant cooldownStart = Instant.now().minus(24, ChronoUnit.HOURS);
            int recentFailed = repository.countRecentFailedAttempts(userId, professionId, cooldownStart);
            
            if (recentFailed > 0) {
                // Get last failed attempt timestamp and calculate exact cooldown
                Instant lastFailedAt = repository.findLastFailedAttemptTime(userId, professionId);
                if (lastFailedAt != null) {
                    Instant cooldownEnd = lastFailedAt.plus(24, ChronoUnit.HOURS);
                    long cooldownSeconds = java.time.Duration.between(Instant.now(), cooldownEnd).getSeconds();
                    if (cooldownSeconds > 0) {
                        return VerificationEligibilityResponse.cooldownActive(cooldownSeconds);
                    }
                } else {
                    // Fallback to 24 hours if timestamp not found
                    long cooldownSeconds = 24 * 3600;
                    return VerificationEligibilityResponse.cooldownActive(cooldownSeconds);
                }
            }
        }
        
        return VerificationEligibilityResponse.eligible(remainingAttempts, totalAttempts);
    }
    
    /**
     * Get admin dashboard statistics
     * Aggregates verification data for dashboard
     */
    @Transactional(readOnly = true)
    public VerificationStatisticsResponse getStatistics() {
        // Total counts by status
        long totalRequests = repository.count();
        long pendingReviews = repository.countByStatus(VerificationStatus.PENDING_MANUAL_REVIEW);
        long approvedCount = repository.countByStatusIn(
            List.of(VerificationStatus.AUTO_APPROVED, VerificationStatus.APPROVED)
        );
        long rejectedCount = repository.countByStatusIn(
            List.of(VerificationStatus.AUTO_REJECTED, VerificationStatus.REJECTED)
        );
        long expiredCount = repository.countByStatus(VerificationStatus.EXPIRED);
        
        // Auto-approval stats
        long autoApprovedCount = repository.countByStatus(VerificationStatus.AUTO_APPROVED);
        
        // Calculate rates
        double approvalRate = totalRequests > 0 
            ? (approvedCount * 100.0 / totalRequests) 
            : 0.0;
        double autoApprovalRate = approvedCount > 0 
            ? (autoApprovedCount * 100.0 / approvedCount) 
            : 0.0;
        
        // Average processing time (submitted to processed)
        Double avgMinutes = repository.calculateAverageProcessingTimeMinutes();
        double averageProcessingMinutes = avgMinutes != null ? avgMinutes : 0.0;
        
        // Time-based counts
        Instant todayStart = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant weekStart = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant monthStart = Instant.now().minus(30, ChronoUnit.DAYS);
        
        long todaySubmissions = repository.countBySubmittedAtAfter(todayStart);
        long thisWeekSubmissions = repository.countBySubmittedAtAfter(weekStart);
        long thisMonthSubmissions = repository.countBySubmittedAtAfter(monthStart);
        
        return VerificationStatisticsResponse.builder()
            .totalRequests(totalRequests)
            .pendingReviews(pendingReviews)
            .approvedCount(approvedCount)
            .rejectedCount(rejectedCount)
            .expiredCount(expiredCount)
            .approvalRate(approvalRate)
            .autoApprovalRate(autoApprovalRate)
            .averageProcessingMinutes(averageProcessingMinutes)
            .todaySubmissions(todaySubmissions)
            .thisWeekSubmissions(thisWeekSubmissions)
            .thisMonthSubmissions(thisMonthSubmissions)
            .build();
    }
    
    /**
     * Check if user can submit verification for profession
     */
    @Transactional(readOnly = true)
    public boolean canSubmitVerification(Long userId, Long professionId) {
        return attemptPolicy.canSubmitVerification(userId, professionId).isValid();
    }
    
    /**
     * Get remaining attempts for user-profession
     */
    @Transactional(readOnly = true)
    public int getRemainingAttempts(Long userId, Long professionId) {
        return attemptPolicy.getRemainingAttempts(userId, professionId);
    }
    
    /**
     * Map domain model to DTO
     */
    private VerificationResponse mapToResponse(VerificationRequest verification) {
        return VerificationResponse.builder()
            .id(verification.getId())
            .verificationId(verification.getVerificationId().getValue())
            .userId(verification.getUserId())
            .professionId(verification.getProfessionId())
            .status(verification.getStatus())
            .documentS3Key(verification.getDocumentImage().getS3Key())
            .selfieS3Key(verification.getSelfieImage().getS3Key())
            .attemptNumber(verification.getAttemptNumber())
            .submittedAt(verification.getSubmittedAt())
            .processedAt(verification.getProcessedAt())
            .expiresAt(verification.getExpiresAt())
            .aiConfidence(verification.getAiResult() != null ? 
                verification.getAiResult().getOverallConfidence() : null)
            .faceSimilarity(verification.getAiResult() != null ? 
                verification.getAiResult().getFaceSimilarity() : null)
            .manualReviewNotes(verification.getManualReviewResult() != null ? 
                verification.getManualReviewResult().getNotes() : null)
            .build();
    }
    
    /**
     * Map domain model to attempt response DTO
     */
    private VerificationAttemptResponse mapToAttemptResponse(VerificationRequest verification) {
        return VerificationAttemptResponse.builder()
            .id(verification.getId())
            .verificationId(verification.getVerificationId().getValue())
            .professionId(verification.getProfessionId())
            .professionName(professionService.getProfessionNameById(verification.getProfessionId()))
            .status(verification.getStatus())
            .attemptNumber(verification.getAttemptNumber())
            .submittedAt(verification.getSubmittedAt())
            .processedAt(verification.getProcessedAt())
            .aiConfidence(verification.getAiResult() != null ? 
                verification.getAiResult().getOverallConfidence() : null)
            .faceSimilarity(verification.getAiResult() != null ? 
                verification.getAiResult().getFaceSimilarity() : null)
            .reviewNotes(verification.getManualReviewResult() != null ? 
                verification.getManualReviewResult().getNotes() : null)
            .isApproved(verification.isApproved())
            .isRejected(verification.isRejected())
            .isPending(!verification.getStatus().isFinal())
            .build();
    }
}
