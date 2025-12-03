package com.meslektas.verification.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Liveness Detection Result - Value Object
 * 
 * Represents the result of liveness detection to prevent spoofing attacks.
 * Uses AWS Rekognition FaceDetails to detect if the selfie is of a real person.
 * 
 * Spoofing Detection:
 * - Photo of a photo detection
 * - Screen display detection
 * - Print attack detection
 * - 3D mask detection (if available)
 * 
 * @see <a href="https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html">AWS Face Liveness</a>
 */
@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LivenessResult {
    
    /**
     * Liveness confidence score (0-100%)
     * Higher score = more likely to be a real person
     */
    @Column(name = "liveness_confidence")
    private Double livenessConfidence;
    
    /**
     * Liveness detection status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "liveness_status", length = 30)
    private LivenessStatus status;
    
    /**
     * Brightness level of the face (0-100)
     * Low brightness may indicate a photo/screen
     */
    @Column(name = "face_brightness")
    private Double faceBrightness;
    
    /**
     * Sharpness level of the face (0-100)
     * Low sharpness may indicate a photo reproduction
     */
    @Column(name = "face_sharpness")
    private Double faceSharpness;
    
    /**
     * Whether eyes are open (true = likely real person)
     */
    @Column(name = "eyes_open")
    private Boolean eyesOpen;
    
    /**
     * Eyes open confidence (0-100%)
     */
    @Column(name = "eyes_open_confidence")
    private Double eyesOpenConfidence;
    
    /**
     * Whether face has natural pose (not perfectly frontal like ID photos)
     */
    @Column(name = "natural_pose")
    private Boolean naturalPose;
    
    /**
     * Pose confidence score (0-100%)
     */
    @Column(name = "pose_confidence")
    private Double poseConfidence;
    
    /**
     * Detailed reason for failure (if any)
     */
    @Column(name = "liveness_failure_reason", length = 500)
    private String failureReason;
    
    /**
     * Raw AWS response for audit
     */
    @Column(name = "liveness_raw_response", columnDefinition = "TEXT")
    private String rawResponse;
    
    // Thresholds
    private static final double MIN_LIVENESS_CONFIDENCE = 80.0;
    private static final double MIN_BRIGHTNESS = 40.0;
    private static final double MIN_SHARPNESS = 50.0;
    private static final double MIN_EYES_OPEN_CONFIDENCE = 80.0;
    
    public enum LivenessStatus {
        LIVE,           // Real person detected
        SPOOF_DETECTED, // Fake/spoofing attempt
        UNCERTAIN,      // Cannot determine with confidence
        ERROR           // Detection failed
    }
    
    private LivenessResult(
        Double livenessConfidence,
        LivenessStatus status,
        Double faceBrightness,
        Double faceSharpness,
        Boolean eyesOpen,
        Double eyesOpenConfidence,
        Boolean naturalPose,
        Double poseConfidence,
        String failureReason,
        String rawResponse
    ) {
        this.livenessConfidence = livenessConfidence;
        this.status = status;
        this.faceBrightness = faceBrightness;
        this.faceSharpness = faceSharpness;
        this.eyesOpen = eyesOpen;
        this.eyesOpenConfidence = eyesOpenConfidence;
        this.naturalPose = naturalPose;
        this.poseConfidence = poseConfidence;
        this.failureReason = failureReason;
        this.rawResponse = rawResponse;
    }
    
    /**
     * Create successful liveness result (real person detected)
     */
    public static LivenessResult live(
        double livenessConfidence,
        double faceBrightness,
        double faceSharpness,
        boolean eyesOpen,
        double eyesOpenConfidence,
        boolean naturalPose,
        double poseConfidence,
        String rawResponse
    ) {
        return new LivenessResult(
            livenessConfidence,
            LivenessStatus.LIVE,
            faceBrightness,
            faceSharpness,
            eyesOpen,
            eyesOpenConfidence,
            naturalPose,
            poseConfidence,
            null,
            rawResponse
        );
    }
    
    /**
     * Create spoof detection result
     */
    public static LivenessResult spoofDetected(
        double livenessConfidence,
        String reason,
        String rawResponse
    ) {
        return new LivenessResult(
            livenessConfidence,
            LivenessStatus.SPOOF_DETECTED,
            null,
            null,
            null,
            null,
            null,
            null,
            reason,
            rawResponse
        );
    }
    
    /**
     * Create uncertain result
     */
    public static LivenessResult uncertain(
        double livenessConfidence,
        String reason,
        String rawResponse
    ) {
        return new LivenessResult(
            livenessConfidence,
            LivenessStatus.UNCERTAIN,
            null,
            null,
            null,
            null,
            null,
            null,
            reason,
            rawResponse
        );
    }
    
    /**
     * Create error result
     */
    public static LivenessResult error(String errorMessage) {
        return new LivenessResult(
            0.0,
            LivenessStatus.ERROR,
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
     * Check if liveness detection passed
     */
    public boolean isLive() {
        return status == LivenessStatus.LIVE && 
               livenessConfidence != null && 
               livenessConfidence >= MIN_LIVENESS_CONFIDENCE;
    }
    
    /**
     * Check if spoofing was detected
     */
    public boolean isSpoofDetected() {
        return status == LivenessStatus.SPOOF_DETECTED;
    }
    
    /**
     * Check if result requires manual review
     */
    public boolean requiresManualReview() {
        return status == LivenessStatus.UNCERTAIN;
    }
    
    /**
     * Get liveness score for confidence calculation (0-100)
     */
    public double getLivenessScore() {
        if (status == LivenessStatus.LIVE && livenessConfidence != null) {
            return livenessConfidence;
        }
        if (status == LivenessStatus.UNCERTAIN && livenessConfidence != null) {
            return livenessConfidence * 0.5; // Reduce score for uncertain
        }
        return 0.0;
    }
    
    /**
     * Validate all quality metrics
     */
    public boolean passesQualityChecks() {
        if (faceBrightness != null && faceBrightness < MIN_BRIGHTNESS) {
            return false;
        }
        if (faceSharpness != null && faceSharpness < MIN_SHARPNESS) {
            return false;
        }
        if (eyesOpenConfidence != null && eyesOpenConfidence < MIN_EYES_OPEN_CONFIDENCE) {
            return false;
        }
        return true;
    }
    
    @Override
    public String toString() {
        return String.format(
            "LivenessResult{status=%s, confidence=%.2f%%}",
            status, livenessConfidence != null ? livenessConfidence : 0.0
        );
    }
}
