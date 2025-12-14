package com.dengin.verification.infrastructure.aws;

import com.dengin.verification.domain.model.AIVerificationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AWS Rekognition Service
 * 
 * Implements AI verification using AWS Rekognition:
 * 1. Face Comparison: Compare selfie with document photo
 * 2. Text Detection (OCR): Extract document number and name
 * 
 * Business Rules:
 * - Face similarity threshold: 90% for acceptable match
 * - Overall confidence: Composite of face match + OCR accuracy
 * - >= 85%: Auto-approve
 * - 60-84%: Manual review
 * - < 60%: Auto-reject
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RekognitionService {

    private final RekognitionClient rekognitionClient;

    @org.springframework.beans.factory.annotation.Value("${aws.rekognition.bucket-name:meslektas-verifications}")
    private String bucketName;

    private static final float FACE_SIMILARITY_THRESHOLD = 90.0f;
    private static final float MIN_CONFIDENCE_FOR_TEXT = 80.0f;

    /**
     * Verify document and selfie using AWS Rekognition
     * 
     * @param documentS3Key S3 key for document image
     * @param selfieS3Key   S3 key for selfie image
     * @return AI verification result
     */
    public AIVerificationResult verifyDocument(String documentS3Key, String selfieS3Key) {
        try {
            log.info("Starting AI verification - Document: {}, Selfie: {}", documentS3Key, selfieS3Key);

            // Step 1: Face comparison
            CompareFacesResponse faceComparisonResult = compareFaces(documentS3Key, selfieS3Key);

            if (faceComparisonResult.faceMatches().isEmpty()) {
                log.warn("No face match found between document and selfie");
                return AIVerificationResult.success(
                        0.0,
                        null,
                        null,
                        0.0,
                        "No face match found");
            }

            CompareFacesMatch bestMatch = faceComparisonResult.faceMatches().get(0);
            float faceSimilarity = bestMatch.similarity();

            log.info("Face similarity: {}%", faceSimilarity);

            // Step 2: OCR text detection from document
            DetectTextResponse textDetectionResult = detectText(documentS3Key);

            String extractedDocumentNumber = extractDocumentNumber(textDetectionResult);
            String extractedName = extractName(textDetectionResult);

            log.info("Extracted - Document Number: {}, Name: {}", extractedDocumentNumber, extractedName);

            // Step 3: Calculate overall confidence score
            double overallConfidence = calculateOverallConfidence(
                    faceSimilarity,
                    extractedDocumentNumber,
                    extractedName,
                    textDetectionResult);

            log.info("Overall AI confidence: {}%", overallConfidence);

            return AIVerificationResult.success(
                    (double) faceSimilarity,
                    extractedDocumentNumber,
                    extractedName,
                    overallConfidence,
                    buildRawResponse(faceComparisonResult, textDetectionResult));

        } catch (RekognitionException e) {
            log.error("AWS Rekognition error: {}", e.awsErrorDetails().errorMessage(), e);
            return AIVerificationResult.failure("Rekognition error: " + e.awsErrorDetails().errorMessage());
        } catch (Exception e) {
            log.error("AI verification failed", e);
            return AIVerificationResult.failure("Verification failed: " + e.getMessage());
        }
    }

    /**
     * Compare faces between document and selfie
     */
    private CompareFacesResponse compareFaces(String documentS3Key, String selfieS3Key) {
        log.debug("Comparing faces - Source: {}, Target: {}", documentS3Key, selfieS3Key);

        Image sourceImage = Image.builder()
                .s3Object(S3Object.builder()
                        .bucket(bucketName)
                        .name(documentS3Key)
                        .build())
                .build();

        Image targetImage = Image.builder()
                .s3Object(S3Object.builder()
                        .bucket(bucketName)
                        .name(selfieS3Key)
                        .build())
                .build();

        CompareFacesRequest request = CompareFacesRequest.builder()
                .sourceImage(sourceImage)
                .targetImage(targetImage)
                .similarityThreshold(FACE_SIMILARITY_THRESHOLD)
                .build();

        return rekognitionClient.compareFaces(request);
    }

    /**
     * Detect text in document image using OCR
     */
    private DetectTextResponse detectText(String documentS3Key) {
        log.debug("Detecting text in document: {}", documentS3Key);

        Image image = Image.builder()
                .s3Object(S3Object.builder()
                        .bucket(bucketName)
                        .name(documentS3Key)
                        .build())
                .build();

        DetectTextRequest request = DetectTextRequest.builder()
                .image(image)
                .build();

        return rekognitionClient.detectText(request);
    }

    /**
     * Extract document number from OCR results
     * Looks for patterns like: TC 12345678901, License No: ABC123, etc.
     */
    private String extractDocumentNumber(DetectTextResponse result) {
        List<TextDetection> textDetections = result.textDetections();

        // Pattern for Turkish ID number (11 digits)
        Pattern tcPattern = Pattern.compile("\\b\\d{11}\\b");

        // Pattern for license/diploma numbers
        Pattern docPattern = Pattern.compile("(?i)(no|number|numara)[:\\s]*(\\w+)");

        for (TextDetection detection : textDetections) {
            if (detection.confidence() < MIN_CONFIDENCE_FOR_TEXT) {
                continue;
            }

            String text = detection.detectedText();

            // Try TC number pattern
            Matcher tcMatcher = tcPattern.matcher(text);
            if (tcMatcher.find()) {
                return tcMatcher.group();
            }

            // Try document number pattern
            Matcher docMatcher = docPattern.matcher(text);
            if (docMatcher.find()) {
                return docMatcher.group(2);
            }
        }

        return null;
    }

    /**
     * Extract name from OCR results
     * Looks for capitalized words that might be a name
     */
    private String extractName(DetectTextResponse result) {
        StringBuilder nameBuilder = new StringBuilder();

        for (TextDetection detection : result.textDetections()) {
            if (detection.confidence() < MIN_CONFIDENCE_FOR_TEXT) {
                continue;
            }

            String text = detection.detectedText();

            // Look for capitalized words (potential names)
            if (text.matches("^[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$") && text.length() > 2) {
                if (nameBuilder.length() > 0) {
                    nameBuilder.append(" ");
                }
                nameBuilder.append(text);

                // Stop after 3 words (typical Turkish name: Ad Soyad)
                if (nameBuilder.toString().split(" ").length >= 3) {
                    break;
                }
            }
        }

        return nameBuilder.length() > 0 ? nameBuilder.toString() : null;
    }

    /**
     * Calculate overall confidence score
     * 
     * Composite score based on:
     * - Face similarity (70% weight)
     * - OCR text extraction quality (30% weight)
     */
    private double calculateOverallConfidence(
            float faceSimilarity,
            String extractedDocumentNumber,
            String extractedName,
            DetectTextResponse textResult) {
        // Face similarity contributes 70%
        double faceScore = faceSimilarity * 0.7;

        // OCR quality contributes 30%
        double ocrScore = 0.0;

        // Document number found: +15 points
        if (extractedDocumentNumber != null && !extractedDocumentNumber.isEmpty()) {
            ocrScore += 15.0;
        }

        // Name found: +15 points
        if (extractedName != null && !extractedName.isEmpty()) {
            ocrScore += 15.0;
        }

        // Average OCR confidence
        if (!textResult.textDetections().isEmpty()) {
            double avgConfidence = textResult.textDetections().stream()
                    .mapToDouble(TextDetection::confidence)
                    .average()
                    .orElse(0.0);

            // Up to 30% based on OCR confidence
            ocrScore = Math.min(30.0, (avgConfidence / 100.0) * 30.0);
        }

        double overallScore = faceScore + ocrScore;

        // Ensure score is between 0-100
        return Math.max(0.0, Math.min(100.0, overallScore));
    }

    /**
     * Build raw response JSON for audit trail
     */
    private String buildRawResponse(CompareFacesResponse faceResult, DetectTextResponse textResult) {
        try {
            return String.format(
                    "{\"faceMatches\":%d,\"textDetections\":%d,\"timestamp\":\"%s\"}",
                    faceResult.faceMatches().size(),
                    textResult.textDetections().size(),
                    java.time.Instant.now());
        } catch (Exception e) {
            log.warn("Failed to build raw response", e);
            return "{}";
        }
    }
}
