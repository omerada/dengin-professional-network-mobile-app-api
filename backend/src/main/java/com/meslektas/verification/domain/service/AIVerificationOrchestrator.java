package com.meslektas.verification.domain.service;

import com.meslektas.verification.domain.model.*;
import com.meslektas.verification.infrastructure.aws.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * AI Verification Orchestrator
 * 
 * Orchestrates the 6-stage AI verification pipeline:
 * 
 * Stage 1: OCR Text Detection (25% weight)
 *   - Extract text from document
 *   - Identify document type, number, name
 * 
 * Stage 2: Face Detection (included in Face Comparison)
 *   - Detect face in document
 *   - Detect face in selfie
 * 
 * Stage 3: Face Comparison (30% weight)
 *   - Compare selfie with document photo
 *   - Calculate similarity score
 * 
 * Stage 4: Liveness Detection (25% weight)
 *   - Verify selfie is of real person
 *   - Detect spoofing attempts
 * 
 * Stage 5: Document Authenticity (15% weight)
 *   - Check for official logos/seals
 *   - Validate document structure
 *   - Detect tampering
 * 
 * Stage 6: Data Validation (5% weight)
 *   - Match extracted name with profile
 *   - Match profession with selected profession
 * 
 * @see AIVerificationResult for composite result
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIVerificationOrchestrator {
    
    private final RekognitionService rekognitionService;
    private final LivenessDetectionService livenessDetectionService;
    private final DocumentAuthenticityService documentAuthenticityService;
    private final DataMatchingService dataMatchingService;
    
    // Pipeline weights (must sum to 100)
    private static final double OCR_WEIGHT = 0.25;
    private static final double FACE_COMPARISON_WEIGHT = 0.30;
    private static final double LIVENESS_WEIGHT = 0.25;
    private static final double AUTHENTICITY_WEIGHT = 0.15;
    private static final double DATA_MATCH_WEIGHT = 0.05;
    
    // Thresholds
    private static final double AUTO_APPROVE_THRESHOLD = 85.0;
    private static final double MANUAL_REVIEW_THRESHOLD = 60.0;
    
    // Timeout for each stage
    private static final int STAGE_TIMEOUT_SECONDS = 30;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(4);
    
    /**
     * Execute full 6-stage verification pipeline
     * 
     * @param documentS3Key S3 key of document image
     * @param selfieS3Key S3 key of selfie image
     * @param profileName User's full name from profile
     * @param profileProfession User's selected profession
     * @param expectedDocumentType Expected document type (DIPLOMA, LICENSE, etc.)
     * @return Composite AIVerificationResult with all stage results
     */
    public AIVerificationResult verify(
        String documentS3Key,
        String selfieS3Key,
        String profileName,
        String profileProfession,
        String expectedDocumentType
    ) {
        log.info("Starting 6-stage AI verification pipeline");
        log.info("Document: {}, Selfie: {}", documentS3Key, selfieS3Key);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Execute independent stages in parallel
            CompletableFuture<AIVerificationResult> faceComparisonFuture = 
                CompletableFuture.supplyAsync(() -> 
                    rekognitionService.verifyDocument(documentS3Key, selfieS3Key),
                    executorService
                );
            
            CompletableFuture<LivenessResult> livenessFuture = 
                CompletableFuture.supplyAsync(() -> 
                    livenessDetectionService.detectLiveness(selfieS3Key),
                    executorService
                );
            
            CompletableFuture<DocumentAuthenticityResult> authenticityFuture = 
                CompletableFuture.supplyAsync(() -> 
                    documentAuthenticityService.verifyDocument(documentS3Key, expectedDocumentType),
                    executorService
                );
            
            CompletableFuture<DataMatchResult> dataMatchFuture = 
                CompletableFuture.supplyAsync(() -> 
                    dataMatchingService.matchData(documentS3Key, profileName, profileProfession),
                    executorService
                );
            
            // Wait for all stages with timeout
            CompletableFuture.allOf(
                faceComparisonFuture, 
                livenessFuture, 
                authenticityFuture, 
                dataMatchFuture
            ).get(STAGE_TIMEOUT_SECONDS * 4, TimeUnit.SECONDS);
            
            // Get results
            AIVerificationResult faceResult = faceComparisonFuture.get();
            LivenessResult livenessResult = livenessFuture.get();
            DocumentAuthenticityResult authenticityResult = authenticityFuture.get();
            DataMatchResult dataMatchResult = dataMatchFuture.get();
            
            // Calculate weighted confidence score
            double weightedScore = calculateWeightedScore(
                faceResult,
                livenessResult,
                authenticityResult,
                dataMatchResult
            );
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("AI verification pipeline completed in {}ms with score: {:.2f}%", 
                duration, weightedScore);
            
            // Build composite result
            return buildCompositeResult(
                weightedScore,
                faceResult,
                livenessResult,
                authenticityResult,
                dataMatchResult
            );
            
        } catch (Exception e) {
            log.error("AI verification pipeline failed", e);
            long duration = System.currentTimeMillis() - startTime;
            return AIVerificationResult.failure(
                String.format("Verification pipeline failed after %dms: %s", duration, e.getMessage())
            );
        }
    }
    
    /**
     * Calculate weighted confidence score from all stages
     */
    private double calculateWeightedScore(
        AIVerificationResult faceResult,
        LivenessResult livenessResult,
        DocumentAuthenticityResult authenticityResult,
        DataMatchResult dataMatchResult
    ) {
        double score = 0.0;
        
        // Face comparison (30%)
        if (faceResult.isSuccessful()) {
            double faceScore = faceResult.getFaceSimilarity() != null 
                ? faceResult.getFaceSimilarity() 
                : 0.0;
            score += faceScore * FACE_COMPARISON_WEIGHT;
            log.debug("Face comparison score: {:.2f}% (weighted: {:.2f}%)", 
                faceScore, faceScore * FACE_COMPARISON_WEIGHT);
        }
        
        // OCR/Text extraction (25%) - from face result
        if (faceResult.isSuccessful()) {
            double ocrScore = calculateOCRScore(faceResult);
            score += ocrScore * OCR_WEIGHT;
            log.debug("OCR score: {:.2f}% (weighted: {:.2f}%)", 
                ocrScore, ocrScore * OCR_WEIGHT);
        }
        
        // Liveness detection (25%)
        if (livenessResult != null) {
            double livenessScore = livenessResult.getLivenessScore();
            score += livenessScore * LIVENESS_WEIGHT;
            log.debug("Liveness score: {:.2f}% (weighted: {:.2f}%)", 
                livenessScore, livenessScore * LIVENESS_WEIGHT);
            
            // Spoof detection is a hard fail
            if (livenessResult.isSpoofDetected()) {
                log.warn("Spoof detected! Setting score to 0");
                return 0.0;
            }
        }
        
        // Document authenticity (15%)
        if (authenticityResult != null) {
            double authScore = authenticityResult.getAuthenticityScore();
            score += authScore * AUTHENTICITY_WEIGHT;
            log.debug("Authenticity score: {:.2f}% (weighted: {:.2f}%)", 
                authScore, authScore * AUTHENTICITY_WEIGHT);
            
            // Fraudulent document is a hard fail
            if (authenticityResult.isFraudulent()) {
                log.warn("Fraudulent document detected! Setting score to 0");
                return 0.0;
            }
        }
        
        // Data matching (5%)
        if (dataMatchResult != null) {
            double matchScore = dataMatchResult.getMatchScore();
            score += matchScore * DATA_MATCH_WEIGHT;
            log.debug("Data match score: {:.2f}% (weighted: {:.2f}%)", 
                matchScore, matchScore * DATA_MATCH_WEIGHT);
        }
        
        return Math.min(100.0, score);
    }
    
    /**
     * Calculate OCR quality score from extraction results
     */
    private double calculateOCRScore(AIVerificationResult faceResult) {
        double score = 0.0;
        
        // Document number extracted (+40)
        if (faceResult.getExtractedDocumentNumber() != null && 
            !faceResult.getExtractedDocumentNumber().isEmpty()) {
            score += 40.0;
        }
        
        // Name extracted (+40)
        if (faceResult.getExtractedName() != null && 
            !faceResult.getExtractedName().isEmpty()) {
            score += 40.0;
        }
        
        // Base score for any successful OCR (+20)
        if (faceResult.isSuccessful()) {
            score += 20.0;
        }
        
        return Math.min(100.0, score);
    }
    
    /**
     * Build composite verification result with all stage details
     */
    private AIVerificationResult buildCompositeResult(
        double weightedScore,
        AIVerificationResult faceResult,
        LivenessResult livenessResult,
        DocumentAuthenticityResult authenticityResult,
        DataMatchResult dataMatchResult
    ) {
        // Determine decision based on score
        ConfidenceScore.VerificationDecision decision;
        if (weightedScore >= AUTO_APPROVE_THRESHOLD) {
            decision = ConfidenceScore.VerificationDecision.AUTO_APPROVE;
        } else if (weightedScore >= MANUAL_REVIEW_THRESHOLD) {
            decision = ConfidenceScore.VerificationDecision.MANUAL_REVIEW;
        } else {
            decision = ConfidenceScore.VerificationDecision.AUTO_REJECT;
        }
        
        // Check for blocking conditions
        boolean hasBlockingCondition = false;
        String blockingReason = null;
        
        if (livenessResult != null && livenessResult.isSpoofDetected()) {
            hasBlockingCondition = true;
            blockingReason = "Spoof detected: " + livenessResult.getFailureReason();
            decision = ConfidenceScore.VerificationDecision.AUTO_REJECT;
        }
        
        if (authenticityResult != null && authenticityResult.isFraudulent()) {
            hasBlockingCondition = true;
            blockingReason = "Fraudulent document: " + authenticityResult.getTamperingType();
            decision = ConfidenceScore.VerificationDecision.AUTO_REJECT;
        }
        
        // Build raw response with all details
        String compositeRawResponse = buildCompositeRawResponse(
            weightedScore,
            decision,
            faceResult,
            livenessResult,
            authenticityResult,
            dataMatchResult,
            blockingReason
        );
        
        if (hasBlockingCondition) {
            return AIVerificationResult.failure(blockingReason);
        }
        
        return AIVerificationResult.success(
            faceResult.getFaceSimilarity(),
            faceResult.getExtractedDocumentNumber(),
            faceResult.getExtractedName(),
            weightedScore,
            compositeRawResponse
        );
    }
    
    /**
     * Build detailed raw response for audit trail
     */
    private String buildCompositeRawResponse(
        double weightedScore,
        ConfidenceScore.VerificationDecision decision,
        AIVerificationResult faceResult,
        LivenessResult livenessResult,
        DocumentAuthenticityResult authenticityResult,
        DataMatchResult dataMatchResult,
        String blockingReason
    ) {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            
            // Overall result
            sb.append(String.format("\"weightedScore\":%.2f,", weightedScore));
            sb.append(String.format("\"decision\":\"%s\",", decision));
            
            // Face comparison
            sb.append("\"faceComparison\":{");
            if (faceResult != null && faceResult.isSuccessful()) {
                sb.append(String.format("\"similarity\":%.2f,", 
                    faceResult.getFaceSimilarity() != null ? faceResult.getFaceSimilarity() : 0));
                sb.append(String.format("\"documentNumber\":\"%s\",", 
                    faceResult.getExtractedDocumentNumber() != null ? faceResult.getExtractedDocumentNumber() : ""));
                sb.append(String.format("\"name\":\"%s\"", 
                    faceResult.getExtractedName() != null ? faceResult.getExtractedName() : ""));
            } else {
                sb.append("\"error\":\"Failed\"");
            }
            sb.append("},");
            
            // Liveness
            sb.append("\"liveness\":{");
            if (livenessResult != null) {
                sb.append(String.format("\"status\":\"%s\",", livenessResult.getStatus()));
                sb.append(String.format("\"confidence\":%.2f,", 
                    livenessResult.getLivenessConfidence() != null ? livenessResult.getLivenessConfidence() : 0));
                sb.append(String.format("\"isLive\":%b", livenessResult.isLive()));
            } else {
                sb.append("\"error\":\"Not performed\"");
            }
            sb.append("},");
            
            // Authenticity
            sb.append("\"authenticity\":{");
            if (authenticityResult != null) {
                sb.append(String.format("\"status\":\"%s\",", authenticityResult.getStatus()));
                sb.append(String.format("\"confidence\":%.2f,", 
                    authenticityResult.getAuthenticityConfidence() != null ? authenticityResult.getAuthenticityConfidence() : 0));
                sb.append(String.format("\"logoDetected\":%b", 
                    authenticityResult.getLogoDetected() != null && authenticityResult.getLogoDetected()));
            } else {
                sb.append("\"error\":\"Not performed\"");
            }
            sb.append("},");
            
            // Data match
            sb.append("\"dataMatch\":{");
            if (dataMatchResult != null) {
                sb.append(String.format("\"overallScore\":%.2f,", 
                    dataMatchResult.getOverallMatchScore() != null ? dataMatchResult.getOverallMatchScore() : 0));
                sb.append(String.format("\"nameMatched\":%b,", 
                    dataMatchResult.getNameMatched() != null && dataMatchResult.getNameMatched()));
                sb.append(String.format("\"professionMatched\":%b", 
                    dataMatchResult.getProfessionMatched() != null && dataMatchResult.getProfessionMatched()));
            } else {
                sb.append("\"error\":\"Not performed\"");
            }
            sb.append("},");
            
            // Blocking reason if any
            if (blockingReason != null) {
                sb.append(String.format("\"blockingReason\":\"%s\",", blockingReason));
            }
            
            // Timestamp
            sb.append(String.format("\"timestamp\":\"%s\"", java.time.Instant.now()));
            
            sb.append("}");
            return sb.toString();
            
        } catch (Exception e) {
            log.warn("Failed to build composite raw response", e);
            return String.format("{\"weightedScore\":%.2f,\"error\":\"Response build failed\"}", weightedScore);
        }
    }
    
    /**
     * Quick verification (only face comparison + liveness)
     * Used for re-verification or quick checks
     */
    public AIVerificationResult quickVerify(String documentS3Key, String selfieS3Key) {
        log.info("Starting quick verification (face + liveness only)");
        
        try {
            CompletableFuture<AIVerificationResult> faceFuture = 
                CompletableFuture.supplyAsync(() -> 
                    rekognitionService.verifyDocument(documentS3Key, selfieS3Key),
                    executorService
                );
            
            CompletableFuture<LivenessResult> livenessFuture = 
                CompletableFuture.supplyAsync(() -> 
                    livenessDetectionService.detectLiveness(selfieS3Key),
                    executorService
                );
            
            AIVerificationResult faceResult = faceFuture.get(STAGE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            LivenessResult livenessResult = livenessFuture.get(STAGE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            
            if (livenessResult.isSpoofDetected()) {
                return AIVerificationResult.failure("Spoof detected: " + livenessResult.getFailureReason());
            }
            
            double quickScore = (faceResult.getFaceSimilarity() != null ? faceResult.getFaceSimilarity() : 0) * 0.6
                + livenessResult.getLivenessScore() * 0.4;
            
            return AIVerificationResult.success(
                faceResult.getFaceSimilarity(),
                null,
                null,
                quickScore,
                "{\"type\":\"quick\",\"score\":" + quickScore + "}"
            );
            
        } catch (Exception e) {
            log.error("Quick verification failed", e);
            return AIVerificationResult.failure("Quick verification failed: " + e.getMessage());
        }
    }
}
