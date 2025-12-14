package com.dengin.verification.infrastructure.aws;

import com.dengin.verification.domain.model.LivenessResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

/**
 * Liveness Detection Service
 * 
 * Implements spoofing detection using AWS Rekognition.
 * Detects if the selfie is of a real, live person vs a photo/video/mask.
 * 
 * Detection Methods:
 * 1. Face quality analysis (brightness, sharpness)
 * 2. Eye state detection (eyes open = likely live)
 * 3. Pose analysis (natural pose vs flat ID photo)
 * 4. Quality metrics validation
 * 
 * Thresholds (per documentation):
 * - Liveness >= 80%: LIVE
 * - Liveness 50-79%: UNCERTAIN (manual review)
 * - Liveness < 50%: SPOOF_DETECTED
 * 
 * @see <a href="https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html">AWS Face Liveness</a>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LivenessDetectionService {
    
    private final RekognitionClient rekognitionClient;
    
    @Value("${aws.rekognition.bucket-name:dengin-verifications}")
    private String bucketName;
    
    // Thresholds
    private static final float MIN_BRIGHTNESS = 40.0f;
    private static final float MIN_SHARPNESS = 50.0f;
    private static final float MIN_EYES_OPEN_CONFIDENCE = 80.0f;
    private static final float LIVE_THRESHOLD = 80.0f;
    private static final float UNCERTAIN_THRESHOLD = 50.0f;
    
    /**
     * Perform liveness detection on selfie image
     * 
     * @param selfieS3Key S3 key of the selfie image
     * @return LivenessResult with detection details
     */
    public LivenessResult detectLiveness(String selfieS3Key) {
        try {
            log.info("Starting liveness detection for selfie: {}", selfieS3Key);
            
            // Detect faces with quality attributes
            DetectFacesRequest request = DetectFacesRequest.builder()
                .image(Image.builder()
                    .s3Object(S3Object.builder()
                        .bucket(bucketName)
                        .name(selfieS3Key)
                        .build())
                    .build())
                .attributes(Attribute.ALL) // Get all face attributes
                .build();
            
            DetectFacesResponse response = rekognitionClient.detectFaces(request);
            
            if (response.faceDetails().isEmpty()) {
                log.warn("No face detected in selfie: {}", selfieS3Key);
                return LivenessResult.error("No face detected in the selfie image");
            }
            
            if (response.faceDetails().size() > 1) {
                log.warn("Multiple faces detected in selfie: {}", selfieS3Key);
                return LivenessResult.spoofDetected(
                    0.0,
                    "Multiple faces detected - selfie should contain only one face",
                    buildRawResponse(response)
                );
            }
            
            FaceDetail faceDetail = response.faceDetails().get(0);
            
            return analyzeFaceForLiveness(faceDetail, response);
            
        } catch (RekognitionException e) {
            log.error("AWS Rekognition error during liveness detection: {}", 
                e.awsErrorDetails().errorMessage(), e);
            return LivenessResult.error("Rekognition error: " + e.awsErrorDetails().errorMessage());
        } catch (Exception e) {
            log.error("Liveness detection failed for selfie: {}", selfieS3Key, e);
            return LivenessResult.error("Liveness detection failed: " + e.getMessage());
        }
    }
    
    /**
     * Analyze face details to determine liveness
     */
    private LivenessResult analyzeFaceForLiveness(FaceDetail faceDetail, DetectFacesResponse response) {
        // Extract quality metrics
        ImageQuality quality = faceDetail.quality();
        float brightness = quality != null ? quality.brightness() : 0.0f;
        float sharpness = quality != null ? quality.sharpness() : 0.0f;
        
        // Check eyes open
        EyeOpen eyesOpen = faceDetail.eyesOpen();
        boolean areEyesOpen = eyesOpen != null && eyesOpen.value();
        float eyesOpenConfidence = eyesOpen != null ? eyesOpen.confidence() : 0.0f;
        
        // Analyze pose for naturalness
        Pose pose = faceDetail.pose();
        boolean naturalPose = isNaturalPose(pose);
        float poseConfidence = calculatePoseConfidence(pose);
        
        // Calculate composite liveness score
        double livenessScore = calculateLivenessScore(
            brightness,
            sharpness,
            areEyesOpen,
            eyesOpenConfidence,
            naturalPose,
            poseConfidence,
            faceDetail.confidence()
        );
        
        log.info("Liveness analysis - Score: {:.2f}%, Brightness: {:.2f}, Sharpness: {:.2f}, EyesOpen: {}", 
            livenessScore, brightness, sharpness, areEyesOpen);
        
        // Check for spoof indicators
        String spoofIndicator = detectSpoofIndicators(faceDetail, brightness, sharpness);
        if (spoofIndicator != null) {
            return LivenessResult.spoofDetected(
                livenessScore,
                spoofIndicator,
                buildRawResponse(response)
            );
        }
        
        // Determine result based on score
        if (livenessScore >= LIVE_THRESHOLD) {
            return LivenessResult.live(
                livenessScore,
                brightness,
                sharpness,
                areEyesOpen,
                eyesOpenConfidence,
                naturalPose,
                poseConfidence,
                buildRawResponse(response)
            );
        } else if (livenessScore >= UNCERTAIN_THRESHOLD) {
            return LivenessResult.uncertain(
                livenessScore,
                "Liveness score below threshold - requires manual review",
                buildRawResponse(response)
            );
        } else {
            return LivenessResult.spoofDetected(
                livenessScore,
                "Low liveness confidence - possible spoofing attempt",
                buildRawResponse(response)
            );
        }
    }
    
    /**
     * Check if face pose is natural (not flat like ID photo)
     */
    private boolean isNaturalPose(Pose pose) {
        if (pose == null) return false;
        
        // A perfectly frontal face (0,0,0) might indicate a printed photo
        // Natural poses have some variation
        float pitch = Math.abs(pose.pitch());
        float yaw = Math.abs(pose.yaw());
        float roll = Math.abs(pose.roll());
        
        // Too perfect (flat) = suspicious
        boolean tooFlat = pitch < 2.0f && yaw < 2.0f && roll < 2.0f;
        
        // Too extreme = bad selfie
        boolean tooExtreme = pitch > 30.0f || yaw > 30.0f || roll > 30.0f;
        
        return !tooFlat && !tooExtreme;
    }
    
    /**
     * Calculate pose confidence for liveness
     */
    private float calculatePoseConfidence(Pose pose) {
        if (pose == null) return 50.0f;
        
        float pitch = Math.abs(pose.pitch());
        float yaw = Math.abs(pose.yaw());
        float roll = Math.abs(pose.roll());
        
        // Ideal: slight angle but not extreme
        // Best pose: 5-15 degrees variance
        float idealVariance = 10.0f;
        float pitchScore = 100.0f - Math.abs(pitch - idealVariance) * 2;
        float yawScore = 100.0f - Math.abs(yaw - idealVariance) * 2;
        float rollScore = 100.0f - Math.abs(roll) * 3; // Roll should be minimal
        
        float avgScore = (pitchScore + yawScore + rollScore) / 3.0f;
        return Math.max(0.0f, Math.min(100.0f, avgScore));
    }
    
    /**
     * Calculate composite liveness score
     */
    private double calculateLivenessScore(
        float brightness,
        float sharpness,
        boolean eyesOpen,
        float eyesOpenConfidence,
        boolean naturalPose,
        float poseConfidence,
        float faceConfidence
    ) {
        double score = 0.0;
        
        // Base face detection confidence (20% weight)
        score += (faceConfidence / 100.0) * 20.0;
        
        // Brightness (15% weight)
        if (brightness >= MIN_BRIGHTNESS) {
            score += (brightness / 100.0) * 15.0;
        } else {
            score += (brightness / MIN_BRIGHTNESS) * 10.0;
        }
        
        // Sharpness (15% weight)
        if (sharpness >= MIN_SHARPNESS) {
            score += (sharpness / 100.0) * 15.0;
        } else {
            score += (sharpness / MIN_SHARPNESS) * 10.0;
        }
        
        // Eyes open (25% weight) - key liveness indicator
        if (eyesOpen && eyesOpenConfidence >= MIN_EYES_OPEN_CONFIDENCE) {
            score += (eyesOpenConfidence / 100.0) * 25.0;
        } else if (eyesOpen) {
            score += 15.0;
        } else {
            score += 5.0; // Eyes closed is suspicious but not definitive
        }
        
        // Natural pose (25% weight)
        if (naturalPose) {
            score += (poseConfidence / 100.0) * 25.0;
        } else {
            score += 10.0; // Flat pose is suspicious
        }
        
        return Math.max(0.0, Math.min(100.0, score));
    }
    
    /**
     * Detect specific spoof indicators
     */
    private String detectSpoofIndicators(FaceDetail face, float brightness, float sharpness) {
        // Very low quality = possible photo of photo
        if (brightness < 20.0f && sharpness < 30.0f) {
            return "Very low image quality - possible photo reproduction";
        }
        
        // Check for sunglasses (hiding eyes)
        Sunglasses sunglasses = face.sunglasses();
        if (sunglasses != null && sunglasses.value() && sunglasses.confidence() > 80.0f) {
            return "Sunglasses detected - eyes must be visible for verification";
        }
        
        // Check face occlusion
        FaceOccluded occluded = face.faceOccluded();
        if (occluded != null && occluded.value() && occluded.confidence() > 80.0f) {
            return "Face is partially occluded - full face must be visible";
        }
        
        // Check for very uniform lighting (screen display)
        if (brightness > 90.0f && sharpness < 50.0f) {
            return "Unusual lighting pattern - possible screen display";
        }
        
        return null;
    }
    
    /**
     * Build raw response JSON for audit
     */
    private String buildRawResponse(DetectFacesResponse response) {
        try {
            FaceDetail face = response.faceDetails().isEmpty() ? null : response.faceDetails().get(0);
            if (face == null) return "{}";
            
            return String.format(
                "{\"faceCount\":%d,\"confidence\":%.2f,\"brightness\":%.2f,\"sharpness\":%.2f," +
                "\"eyesOpen\":%b,\"timestamp\":\"%s\"}",
                response.faceDetails().size(),
                face.confidence(),
                face.quality() != null ? face.quality().brightness() : 0,
                face.quality() != null ? face.quality().sharpness() : 0,
                face.eyesOpen() != null && face.eyesOpen().value(),
                java.time.Instant.now()
            );
        } catch (Exception e) {
            log.warn("Failed to build raw response", e);
            return "{}";
        }
    }
}
