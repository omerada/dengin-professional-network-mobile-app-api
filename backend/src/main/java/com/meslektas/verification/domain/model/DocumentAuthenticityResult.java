package com.meslektas.verification.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Document Authenticity Result - Value Object
 * 
 * Represents the result of document authenticity verification.
 * Checks if the submitted document is genuine and not tampered.
 * 
 * Authenticity Checks:
 * - Logo/watermark detection
 * - Document structure validation
 * - Tampering detection
 * - Expected elements verification
 * - Print quality analysis
 * 
 * @see com.meslektas.verification.infrastructure.aws.DocumentAuthenticityService
 */
@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentAuthenticityResult {
    
    /**
     * Overall authenticity confidence score (0-100%)
     */
    @Column(name = "authenticity_confidence")
    private Double authenticityConfidence;
    
    /**
     * Authenticity status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "authenticity_status", length = 30)
    private AuthenticityStatus status;
    
    /**
     * Whether official logo was detected
     */
    @Column(name = "logo_detected")
    private Boolean logoDetected;
    
    /**
     * Logo detection confidence (0-100%)
     */
    @Column(name = "logo_confidence")
    private Double logoConfidence;
    
    /**
     * Whether watermark was detected
     */
    @Column(name = "watermark_detected")
    private Boolean watermarkDetected;
    
    /**
     * Watermark detection confidence (0-100%)
     */
    @Column(name = "watermark_confidence")
    private Double watermarkConfidence;
    
    /**
     * Whether document structure matches expected format
     */
    @Column(name = "structure_valid")
    private Boolean structureValid;
    
    /**
     * Structure validation confidence (0-100%)
     */
    @Column(name = "structure_confidence")
    private Double structureConfidence;
    
    /**
     * Whether tampering was detected
     */
    @Column(name = "tampering_detected")
    private Boolean tamperingDetected;
    
    /**
     * Type of tampering detected (if any)
     */
    @Column(name = "tampering_type", length = 100)
    private String tamperingType;
    
    /**
     * Document quality score (0-100)
     */
    @Column(name = "document_quality")
    private Double documentQuality;
    
    /**
     * Detected document type
     */
    @Column(name = "detected_document_type", length = 50)
    private String detectedDocumentType;
    
    /**
     * Failure reason (if verification failed)
     */
    @Column(name = "authenticity_failure_reason", length = 500)
    private String failureReason;
    
    /**
     * Raw response for audit
     */
    @Column(name = "authenticity_raw_response", columnDefinition = "TEXT")
    private String rawResponse;
    
    // Thresholds
    private static final double MIN_AUTHENTICITY_CONFIDENCE = 70.0;
    private static final double MIN_LOGO_CONFIDENCE = 60.0;
    private static final double MIN_STRUCTURE_CONFIDENCE = 65.0;
    private static final double MIN_DOCUMENT_QUALITY = 50.0;
    
    public enum AuthenticityStatus {
        AUTHENTIC,          // Document appears genuine
        SUSPICIOUS,         // Possible tampering or issues
        FRAUDULENT,         // Clear signs of fraud/tampering
        UNVERIFIABLE,       // Cannot verify authenticity
        ERROR               // Verification failed
    }
    
    private DocumentAuthenticityResult(
        Double authenticityConfidence,
        AuthenticityStatus status,
        Boolean logoDetected,
        Double logoConfidence,
        Boolean watermarkDetected,
        Double watermarkConfidence,
        Boolean structureValid,
        Double structureConfidence,
        Boolean tamperingDetected,
        String tamperingType,
        Double documentQuality,
        String detectedDocumentType,
        String failureReason,
        String rawResponse
    ) {
        this.authenticityConfidence = authenticityConfidence;
        this.status = status;
        this.logoDetected = logoDetected;
        this.logoConfidence = logoConfidence;
        this.watermarkDetected = watermarkDetected;
        this.watermarkConfidence = watermarkConfidence;
        this.structureValid = structureValid;
        this.structureConfidence = structureConfidence;
        this.tamperingDetected = tamperingDetected;
        this.tamperingType = tamperingType;
        this.documentQuality = documentQuality;
        this.detectedDocumentType = detectedDocumentType;
        this.failureReason = failureReason;
        this.rawResponse = rawResponse;
    }
    
    /**
     * Create authentic document result
     */
    public static DocumentAuthenticityResult authentic(
        double authenticityConfidence,
        boolean logoDetected,
        double logoConfidence,
        boolean watermarkDetected,
        double watermarkConfidence,
        boolean structureValid,
        double structureConfidence,
        double documentQuality,
        String detectedDocumentType,
        String rawResponse
    ) {
        return new DocumentAuthenticityResult(
            authenticityConfidence,
            AuthenticityStatus.AUTHENTIC,
            logoDetected,
            logoConfidence,
            watermarkDetected,
            watermarkConfidence,
            structureValid,
            structureConfidence,
            false,
            null,
            documentQuality,
            detectedDocumentType,
            null,
            rawResponse
        );
    }
    
    /**
     * Create suspicious document result
     */
    public static DocumentAuthenticityResult suspicious(
        double authenticityConfidence,
        String reason,
        double documentQuality,
        String rawResponse
    ) {
        return new DocumentAuthenticityResult(
            authenticityConfidence,
            AuthenticityStatus.SUSPICIOUS,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            documentQuality,
            null,
            reason,
            rawResponse
        );
    }
    
    /**
     * Create fraudulent document result
     */
    public static DocumentAuthenticityResult fraudulent(
        String tamperingType,
        String reason,
        String rawResponse
    ) {
        return new DocumentAuthenticityResult(
            0.0,
            AuthenticityStatus.FRAUDULENT,
            null,
            null,
            null,
            null,
            null,
            null,
            true,
            tamperingType,
            null,
            null,
            reason,
            rawResponse
        );
    }
    
    /**
     * Create unverifiable result
     */
    public static DocumentAuthenticityResult unverifiable(
        String reason,
        double documentQuality,
        String rawResponse
    ) {
        return new DocumentAuthenticityResult(
            null,
            AuthenticityStatus.UNVERIFIABLE,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            documentQuality,
            null,
            reason,
            rawResponse
        );
    }
    
    /**
     * Create error result
     */
    public static DocumentAuthenticityResult error(String errorMessage) {
        return new DocumentAuthenticityResult(
            null,
            AuthenticityStatus.ERROR,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            errorMessage,
            null
        );
    }
    
    /**
     * Check if document is authentic
     */
    public boolean isAuthentic() {
        return status == AuthenticityStatus.AUTHENTIC &&
               authenticityConfidence != null &&
               authenticityConfidence >= MIN_AUTHENTICITY_CONFIDENCE;
    }
    
    /**
     * Check if document is suspicious
     */
    public boolean isSuspicious() {
        return status == AuthenticityStatus.SUSPICIOUS;
    }
    
    /**
     * Check if document is fraudulent
     */
    public boolean isFraudulent() {
        return status == AuthenticityStatus.FRAUDULENT ||
               (tamperingDetected != null && tamperingDetected);
    }
    
    /**
     * Check if verification requires manual review
     */
    public boolean requiresManualReview() {
        return status == AuthenticityStatus.SUSPICIOUS ||
               status == AuthenticityStatus.UNVERIFIABLE;
    }
    
    /**
     * Get authenticity score for confidence calculation (0-100)
     */
    public double getAuthenticityScore() {
        if (status == AuthenticityStatus.AUTHENTIC && authenticityConfidence != null) {
            return authenticityConfidence;
        }
        if (status == AuthenticityStatus.SUSPICIOUS && authenticityConfidence != null) {
            return authenticityConfidence * 0.6; // Reduce score for suspicious
        }
        if (status == AuthenticityStatus.UNVERIFIABLE) {
            return 50.0; // Neutral score for unverifiable
        }
        return 0.0;
    }
    
    /**
     * Check if document quality is acceptable
     */
    public boolean hasAcceptableQuality() {
        return documentQuality != null && documentQuality >= MIN_DOCUMENT_QUALITY;
    }
    
    /**
     * Check if logo was verified
     */
    public boolean hasVerifiedLogo() {
        return logoDetected != null && logoDetected &&
               logoConfidence != null && logoConfidence >= MIN_LOGO_CONFIDENCE;
    }
    
    /**
     * Check if structure was verified
     */
    public boolean hasVerifiedStructure() {
        return structureValid != null && structureValid &&
               structureConfidence != null && structureConfidence >= MIN_STRUCTURE_CONFIDENCE;
    }
    
    @Override
    public String toString() {
        return String.format(
            "DocumentAuthenticityResult{status=%s, confidence=%.2f%%, tampering=%s}",
            status,
            authenticityConfidence != null ? authenticityConfidence : 0.0,
            tamperingDetected != null && tamperingDetected ? "YES" : "NO"
        );
    }
}
