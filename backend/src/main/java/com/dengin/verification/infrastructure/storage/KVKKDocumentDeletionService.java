package com.dengin.verification.infrastructure.storage;

import com.dengin.verification.domain.event.VerificationAutoApprovedEvent;
import com.dengin.verification.domain.event.VerificationAutoRejectedEvent;
import com.dengin.common.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.time.Instant;
import java.util.List;

/**
 * KVKK Compliant Document Deletion Service
 * 
 * Handles secure deletion of verification documents in compliance with
 * Turkish Personal Data Protection Law (KVKK - Kişisel Verilerin Korunması Kanunu).
 * 
 * KVKK Requirements (per documentation):
 * - Verification approved → Immediate document deletion
 * - Verification rejected → Immediate document deletion
 * - Manual review → 7-day retention, then auto-delete
 * - User request → Immediate data anonymization
 * 
 * Security:
 * - Permanent deletion from S3 (not soft delete)
 * - Delete all versions if versioning enabled
 * - Audit log for deletion events
 * - No copies retained after deletion
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KVKKDocumentDeletionService {
    
    private final S3Client s3Client;
    private final StorageService storageService;
    
    @Value("${aws.s3.verification-bucket:dengin-verifications}")
    private String verificationBucket;
    
    @Value("${kvkk.manual-review-retention-days:7}")
    private int manualReviewRetentionDays;
    
    /**
     * Delete verification documents immediately
     * Called after verification approval or rejection
     * 
     * @param documentS3Key S3 key of the document image
     * @param selfieS3Key S3 key of the selfie image
     * @param userId User ID for audit logging
     * @param reason Deletion reason for audit
     */
    public void deleteVerificationDocuments(
        String documentS3Key,
        String selfieS3Key,
        Long userId,
        String reason
    ) {
        log.info("KVKK: Initiating document deletion for user {} - Reason: {}", userId, reason);
        
        boolean documentDeleted = deleteObjectPermanently(documentS3Key, userId, "document");
        boolean selfieDeleted = deleteObjectPermanently(selfieS3Key, userId, "selfie");
        
        if (documentDeleted && selfieDeleted) {
            log.info("KVKK: Successfully deleted all verification documents for user {}", userId);
            auditDeletion(userId, List.of(documentS3Key, selfieS3Key), reason, true);
        } else {
            log.error("KVKK: Failed to delete some documents for user {} - document: {}, selfie: {}", 
                userId, documentDeleted, selfieDeleted);
            auditDeletion(userId, List.of(documentS3Key, selfieS3Key), reason, false);
            
            // Schedule retry for failed deletions
            if (!documentDeleted) {
                scheduleRetryDeletion(documentS3Key, userId, "document");
            }
            if (!selfieDeleted) {
                scheduleRetryDeletion(selfieS3Key, userId, "selfie");
            }
        }
    }
    
    /**
     * Delete a single S3 object permanently
     * Handles versioned buckets by deleting all versions
     */
    private boolean deleteObjectPermanently(String s3Key, Long userId, String objectType) {
        if (s3Key == null || s3Key.isEmpty()) {
            log.warn("KVKK: Empty S3 key provided for {} deletion, user {}", objectType, userId);
            return true; // Nothing to delete
        }
        
        try {
            // Check if object exists
            if (!storageService.exists(s3Key)) {
                log.info("KVKK: Object {} does not exist, nothing to delete", s3Key);
                return true;
            }
            
            // Delete the object
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(verificationBucket)
                .key(s3Key)
                .build();
            
            s3Client.deleteObject(deleteRequest);
            log.debug("KVKK: Deleted {} from S3: {}", objectType, s3Key);
            
            // If versioning is enabled, delete all versions
            deleteAllVersions(s3Key);
            
            // Verify deletion
            boolean stillExists = storageService.exists(s3Key);
            if (stillExists) {
                log.error("KVKK: Object {} still exists after deletion attempt", s3Key);
                return false;
            }
            
            return true;
            
        } catch (S3Exception e) {
            log.error("KVKK: S3 error deleting {} - {}: {}", 
                objectType, s3Key, e.awsErrorDetails().errorMessage());
            return false;
        } catch (Exception e) {
            log.error("KVKK: Error deleting {} - {}", objectType, s3Key, e);
            return false;
        }
    }
    
    /**
     * Delete all versions of an object (for versioned buckets)
     */
    private void deleteAllVersions(String s3Key) {
        try {
            ListObjectVersionsRequest listRequest = ListObjectVersionsRequest.builder()
                .bucket(verificationBucket)
                .prefix(s3Key)
                .build();
            
            ListObjectVersionsResponse listResponse = s3Client.listObjectVersions(listRequest);
            
            // Delete all versions
            for (ObjectVersion version : listResponse.versions()) {
                if (version.key().equals(s3Key)) {
                    DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(verificationBucket)
                        .key(s3Key)
                        .versionId(version.versionId())
                        .build();
                    
                    s3Client.deleteObject(deleteRequest);
                    log.debug("KVKK: Deleted version {} of {}", version.versionId(), s3Key);
                }
            }
            
            // Delete all delete markers
            for (DeleteMarkerEntry marker : listResponse.deleteMarkers()) {
                if (marker.key().equals(s3Key)) {
                    DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(verificationBucket)
                        .key(s3Key)
                        .versionId(marker.versionId())
                        .build();
                    
                    s3Client.deleteObject(deleteRequest);
                    log.debug("KVKK: Deleted delete marker {} of {}", marker.versionId(), s3Key);
                }
            }
            
        } catch (Exception e) {
            log.warn("KVKK: Could not delete versions for {} (versioning may be disabled): {}", 
                s3Key, e.getMessage());
        }
    }
    
    /**
     * Schedule retry for failed deletions
     */
    @Async
    public void scheduleRetryDeletion(String s3Key, Long userId, String objectType) {
        log.info("KVKK: Scheduling retry deletion for {} - user {}", s3Key, userId);
        
        // Retry with exponential backoff (3 attempts)
        int[] delaysSeconds = {60, 300, 900}; // 1 min, 5 min, 15 min
        
        for (int i = 0; i < delaysSeconds.length; i++) {
            try {
                Thread.sleep(delaysSeconds[i] * 1000L);
                
                boolean deleted = deleteObjectPermanently(s3Key, userId, objectType);
                if (deleted) {
                    log.info("KVKK: Retry {} successful for {} - user {}", i + 1, s3Key, userId);
                    auditDeletion(userId, List.of(s3Key), "Retry deletion successful", true);
                    return;
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("KVKK: Retry deletion interrupted for {} - user {}", s3Key, userId);
                return;
            }
        }
        
        // All retries failed - alert admin
        log.error("KVKK: CRITICAL - All retry attempts failed for {} - user {}. Manual intervention required!", 
            s3Key, userId);
        auditDeletion(userId, List.of(s3Key), "All retry attempts failed - MANUAL INTERVENTION REQUIRED", false);
    }
    
    /**
     * Delete expired manual review documents (older than 7 days)
     * Called by scheduled job
     */
    public int deleteExpiredManualReviewDocuments() {
        log.info("KVKK: Starting cleanup of expired manual review documents");
        
        int deletedCount = 0;
        String prefix = "manual-review/";
        
        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(verificationBucket)
                .prefix(prefix)
                .build();
            
            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
            Instant cutoffTime = Instant.now().minusSeconds(manualReviewRetentionDays * 24L * 60 * 60);
            
            for (S3Object object : listResponse.contents()) {
                if (object.lastModified().isBefore(cutoffTime)) {
                    try {
                        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                            .bucket(verificationBucket)
                            .key(object.key())
                            .build();
                        
                        s3Client.deleteObject(deleteRequest);
                        deletedCount++;
                        log.debug("KVKK: Deleted expired manual review document: {}", object.key());
                        
                    } catch (Exception e) {
                        log.error("KVKK: Failed to delete expired document: {}", object.key(), e);
                    }
                }
            }
            
            log.info("KVKK: Deleted {} expired manual review documents", deletedCount);
            
        } catch (Exception e) {
            log.error("KVKK: Error during expired document cleanup", e);
        }
        
        return deletedCount;
    }
    
    /**
     * Handle user data deletion request (KVKK Article 7)
     * Anonymizes all verification data for a user
     */
    public void handleUserDataDeletionRequest(Long userId) {
        log.info("KVKK: Processing user data deletion request for user {}", userId);
        
        String userPrefix = "users/" + userId + "/";
        
        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(verificationBucket)
                .prefix(userPrefix)
                .build();
            
            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
            
            int deletedCount = 0;
            for (S3Object object : listResponse.contents()) {
                try {
                    DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(verificationBucket)
                        .key(object.key())
                        .build();
                    
                    s3Client.deleteObject(deleteRequest);
                    deleteAllVersions(object.key());
                    deletedCount++;
                    
                } catch (Exception e) {
                    log.error("KVKK: Failed to delete user document: {}", object.key(), e);
                }
            }
            
            log.info("KVKK: Deleted {} documents for user data deletion request - user {}", 
                deletedCount, userId);
            
            auditDeletion(userId, List.of(userPrefix + "*"), 
                "User data deletion request (KVKK Article 7)", true);
            
        } catch (Exception e) {
            log.error("KVKK: Error processing user data deletion request for user {}", userId, e);
            throw new RuntimeException("Failed to process data deletion request", e);
        }
    }
    
    /**
     * Audit log for deletion events
     */
    private void auditDeletion(Long userId, List<String> deletedKeys, String reason, boolean success) {
        // In production, this would write to an audit log table
        log.info("KVKK AUDIT: userId={}, keys={}, reason={}, success={}, timestamp={}", 
            userId, deletedKeys, reason, success, Instant.now());
    }
    
    /**
     * Event listener for verification approved event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void onVerificationApproved(VerificationAutoApprovedEvent event) {
        log.info("KVKK: Handling VerificationApprovedEvent for user {}", event.getUserId());
        deleteVerificationDocuments(
            event.getDocumentS3Key(),
            event.getSelfieS3Key(),
            event.getUserId(),
            "Verification approved - KVKK immediate deletion"
        );
    }
    
    /**
     * Event listener for verification rejected event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void onVerificationRejected(VerificationAutoRejectedEvent event) {
        log.info("KVKK: Handling VerificationRejectedEvent for user {}", event.getUserId());
        deleteVerificationDocuments(
            event.getDocumentS3Key(),
            event.getSelfieS3Key(),
            event.getUserId(),
            "Verification rejected - KVKK immediate deletion"
        );
    }
}
