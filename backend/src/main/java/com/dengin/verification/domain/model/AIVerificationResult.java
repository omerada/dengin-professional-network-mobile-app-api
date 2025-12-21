package com.dengin.verification.domain.model;

import com.dengin.common.domain.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AI Verification Result Value Object
 * 
 * Encapsulates AWS Rekognition analysis results:
 * - Face comparison similarity
 * - OCR extracted text
 * - Overall confidence score
 * 
 * Immutable result from AI processing.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AIVerificationResult implements ValueObject {
    
    /**
     * Face similarity percentage from AWS Rekognition CompareFaces
     * Range: 0-100%
     */
    @Column(name = "face_similarity")
    private Double faceSimilarity;
    
    /**
     * OCR extracted document number
     */
    @Column(name = "extracted_document_number", length = 100)
    private String extractedDocumentNumber;
    
    /**
     * OCR extracted name
     */
    @Column(name = "extracted_name", length = 255)
    private String extractedName;
    
    /**
     * Overall AI confidence score (composite of face match + OCR accuracy)
     */
    @Column(name = "ai_confidence_score")
    private Double overallConfidence;
    
    /**
     * AWS Rekognition raw response (for debugging/audit)
     */
    @Column(name = "rekognition_raw_response", columnDefinition = "TEXT")
    private String rawResponse;
    
    /**
     * Error message if AI processing failed
     */
    @Column(name = "ai_error_message", length = 500)
    private String errorMessage;
    
    public static AIVerificationResult success(
        Double faceSimilarity,
        String extractedDocumentNumber,
        String extractedName,
        Double overallConfidence,
        String rawResponse
    ) {
        if (faceSimilarity == null || faceSimilarity < 0 || faceSimilarity > 100) {
            throw new IllegalArgumentException("Face similarity must be between 0 and 100");
        }
        if (overallConfidence == null || overallConfidence < 0 || overallConfidence > 100) {
            throw new IllegalArgumentException("Overall confidence must be between 0 and 100");
        }
        
        return new AIVerificationResult(
            faceSimilarity,
            extractedDocumentNumber,
            extractedName,
            overallConfidence,
            rawResponse,
            null
        );
    }
    
    public static AIVerificationResult failure(String errorMessage) {
        if (errorMessage == null || errorMessage.isBlank()) {
            throw new IllegalArgumentException("Error message cannot be null or empty");
        }
        
        return new AIVerificationResult(
            0.0,
            null,
            null,
            0.0,
            null,
            errorMessage
        );
    }
    
    /**
     * Check if AI processing was successful
     */
    public boolean isSuccessful() {
        return errorMessage == null;
    }
    
    /**
     * Check if face match is acceptable (>= 90%)
     */
    public boolean isFaceMatchAcceptable() {
        return faceSimilarity != null && faceSimilarity >= 90.0;
    }
    
    /**
     * Get confidence score as ConfidenceScore value object
     */
    public ConfidenceScore getConfidenceScore() {
        return ConfidenceScore.of(overallConfidence);
    }
    
    @Override
    public String toString() {
        if (!isSuccessful()) {
            return String.format("AIVerificationResult[FAILED: %s]", errorMessage);
        }
        return String.format(
            "AIVerificationResult[Face: %.2f%%, Confidence: %.2f%%]",
            faceSimilarity,
            overallConfidence
        );
    }
}
