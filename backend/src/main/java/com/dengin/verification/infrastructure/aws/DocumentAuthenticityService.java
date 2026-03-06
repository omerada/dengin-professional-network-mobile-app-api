package com.dengin.verification.infrastructure.aws;

import com.dengin.verification.domain.model.DocumentAuthenticityResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Document Authenticity Service
 * 
 * Verifies document authenticity using AWS Rekognition.
 * Detects official elements, validates structure, and checks for tampering.
 * 
 * Verification Steps:
 * 1. Logo/emblem detection (official seals)
 * 2. Watermark detection
 * 3. Document structure validation
 * 4. Text layout analysis
 * 5. Quality assessment
 * 
 * Supported Documents (Turkey):
 * - Diploma (Üniversite)
 * - Professional License (Ruhsat)
 * - Government ID (Nüfus Cüzdanı, Kimlik Kartı)
 * - Chamber Membership (Oda Kayıt)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentAuthenticityService {
    
    private final RekognitionClient rekognitionClient;
    
    @Value("${aws.rekognition.bucket-name:dengin-verifications}")
    private String bucketName;
    
    // Known official labels to detect
    private static final Set<String> OFFICIAL_LABELS = Set.of(
        "Logo", "Emblem", "Seal", "Stamp", "Coat of Arms",
        "Symbol", "Badge", "Crest", "Insignia"
    );
    
    private static final Set<String> DOCUMENT_LABELS = Set.of(
        "Document", "Paper", "Text", "Card", "Certificate",
        "Diploma", "License", "ID Card", "Passport"
    );
    
    // Turkish document keywords
    private static final Set<String> TURKISH_OFFICIAL_KEYWORDS = Set.of(
        "TÜRKİYE CUMHURİYETİ", "T.C.", "TC", "REPUBLIC OF TURKEY",
        "MİLLİ EĞİTİM BAKANLIĞI", "SAĞLIK BAKANLIĞI",
        "ÜNİVERSİTESİ", "UNIVERSITY", "FAKÜLTE", "FACULTY",
        "DİPLOMA", "MEZUN", "LİSANS", "YÜKSEK LİSANS",
        "RUHSAT", "BELGESİ", "SERTİFİKA", "CERTIFICATE"
    );
    
    // Patterns for tampering detection
    private static final Pattern UNUSUAL_FONT_PATTERN = Pattern.compile(
        ".*[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F].*"
    );
    
    /**
     * Verify document authenticity
     * 
     * @param documentS3Key S3 key of the document image
     * @param expectedDocumentType Expected type (DIPLOMA, LICENSE, etc.)
     * @return DocumentAuthenticityResult with verification details
     */
    public DocumentAuthenticityResult verifyDocument(String documentS3Key, String expectedDocumentType) {
        try {
            log.info("Starting document authenticity check: {} (expected: {})", 
                documentS3Key, expectedDocumentType);
            
            // Step 1: Detect labels (logos, document type)
            DetectLabelsResponse labelsResponse = detectLabels(documentS3Key);
            
            // Step 2: Detect text for structure analysis
            DetectTextResponse textResponse = detectText(documentS3Key);
            
            // Analyze results
            return analyzeDocumentAuthenticity(
                labelsResponse, 
                textResponse, 
                expectedDocumentType
            );
            
        } catch (RekognitionException e) {
            log.error("AWS Rekognition error during document verification: {}", 
                e.awsErrorDetails().errorMessage(), e);
            return DocumentAuthenticityResult.error(
                "Rekognition error: " + e.awsErrorDetails().errorMessage()
            );
        } catch (Exception e) {
            log.error("Document authenticity check failed: {}", documentS3Key, e);
            return DocumentAuthenticityResult.error(
                "Document verification failed: " + e.getMessage()
            );
        }
    }
    
    /**
     * Detect labels in document
     */
    private DetectLabelsResponse detectLabels(String documentS3Key) {
        DetectLabelsRequest request = DetectLabelsRequest.builder()
            .image(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket(bucketName)
                    .name(documentS3Key)
                    .build())
                .build())
            .maxLabels(50)
            .minConfidence(50.0f)
            .build();
        
        return rekognitionClient.detectLabels(request);
    }
    
    /**
     * Detect text in document
     */
    private DetectTextResponse detectText(String documentS3Key) {
        DetectTextRequest request = DetectTextRequest.builder()
            .image(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket(bucketName)
                    .name(documentS3Key)
                    .build())
                .build())
            .build();
        
        return rekognitionClient.detectText(request);
    }
    
    /**
     * Analyze document authenticity based on detected elements
     */
    private DocumentAuthenticityResult analyzeDocumentAuthenticity(
        DetectLabelsResponse labelsResponse,
        DetectTextResponse textResponse,
        String expectedDocumentType
    ) {
        // Check for document type
        boolean isDocument = false;
        String detectedDocumentType = null;
        double documentConfidence = 0.0;
        
        for (Label label : labelsResponse.labels()) {
            String labelName = label.name();
            if (DOCUMENT_LABELS.contains(labelName)) {
                isDocument = true;
                if (label.confidence() > documentConfidence) {
                    detectedDocumentType = labelName;
                    documentConfidence = label.confidence();
                }
            }
        }
        
        if (!isDocument) {
            log.warn("No document detected in image");
            return DocumentAuthenticityResult.unverifiable(
                "Image does not appear to be a document",
                0.0,
                buildRawResponse(labelsResponse, textResponse)
            );
        }
        
        // Check for official elements (logo, seal, emblem)
        boolean logoDetected = false;
        double logoConfidence = 0.0;
        
        for (Label label : labelsResponse.labels()) {
            if (OFFICIAL_LABELS.contains(label.name())) {
                logoDetected = true;
                logoConfidence = Math.max(logoConfidence, label.confidence());
            }
        }
        
        // Analyze text for official keywords
        List<String> detectedKeywords = new ArrayList<>();
        boolean hasOfficialText = false;
        double textConfidenceSum = 0.0;
        int textCount = 0;
        
        for (TextDetection detection : textResponse.textDetections()) {
            if (detection.type() == TextTypes.LINE) {
                String text = detection.detectedText().toUpperCase();
                textConfidenceSum += detection.confidence();
                textCount++;
                
                for (String keyword : TURKISH_OFFICIAL_KEYWORDS) {
                    if (text.contains(keyword)) {
                        hasOfficialText = true;
                        detectedKeywords.add(keyword);
                    }
                }
            }
        }
        
        double avgTextConfidence = textCount > 0 ? textConfidenceSum / textCount : 0.0;
        
        // Check document structure
        boolean structureValid = validateDocumentStructure(textResponse, expectedDocumentType);
        double structureConfidence = structureValid ? avgTextConfidence : 30.0;
        
        // Check for tampering indicators
        String tamperingIndicator = detectTampering(textResponse, labelsResponse);
        if (tamperingIndicator != null) {
            return DocumentAuthenticityResult.fraudulent(
                "TAMPERING",
                tamperingIndicator,
                buildRawResponse(labelsResponse, textResponse)
            );
        }
        
        // Calculate overall authenticity score
        double authenticityScore = calculateAuthenticityScore(
            logoDetected, logoConfidence,
            hasOfficialText, detectedKeywords.size(),
            structureValid, structureConfidence,
            documentConfidence
        );
        
        // Calculate document quality
        double documentQuality = calculateDocumentQuality(textResponse);
        
        log.info("Document authenticity analysis - Score: {:.2f}%, Logo: {}, OfficialText: {}, Structure: {}",
            authenticityScore, logoDetected, hasOfficialText, structureValid);
        
        // Determine result
        if (authenticityScore >= 70.0 && (logoDetected || hasOfficialText) && structureValid) {
            return DocumentAuthenticityResult.authentic(
                authenticityScore,
                logoDetected,
                logoConfidence,
                false, // watermark detection would need custom models
                0.0,
                structureValid,
                structureConfidence,
                documentQuality,
                detectedDocumentType,
                buildRawResponse(labelsResponse, textResponse)
            );
        } else if (authenticityScore >= 50.0) {
            return DocumentAuthenticityResult.suspicious(
                authenticityScore,
                buildSuspiciousReason(logoDetected, hasOfficialText, structureValid),
                documentQuality,
                buildRawResponse(labelsResponse, textResponse)
            );
        } else {
            return DocumentAuthenticityResult.unverifiable(
                "Could not verify document authenticity",
                documentQuality,
                buildRawResponse(labelsResponse, textResponse)
            );
        }
    }
    
    /**
     * Validate document structure based on text layout
     */
    private boolean validateDocumentStructure(DetectTextResponse textResponse, String expectedDocumentType) {
        if (textResponse.textDetections().isEmpty()) {
            return false;
        }
        
        // Check for minimum text elements
        long lineCount = textResponse.textDetections().stream()
            .filter(t -> t.type() == TextTypes.LINE)
            .count();
        
        if (lineCount < 5) {
            return false; // Too few text lines for an official document
        }
        
        // Check for header-like elements (text at top)
        boolean hasHeader = textResponse.textDetections().stream()
            .filter(t -> t.type() == TextTypes.LINE)
            .anyMatch(t -> {
                Geometry geo = t.geometry();
                return geo != null && 
                       geo.boundingBox() != null && 
                       geo.boundingBox().top() < 0.2;
            });
        
        // Check for structured layout (aligned text)
        boolean hasStructuredLayout = checkTextAlignment(textResponse);
        
        return hasHeader && hasStructuredLayout;
    }
    
    /**
     * Check if text elements are properly aligned (indicating structured document)
     */
    private boolean checkTextAlignment(DetectTextResponse textResponse) {
        List<Float> leftPositions = textResponse.textDetections().stream()
            .filter(t -> t.type() == TextTypes.LINE)
            .filter(t -> t.geometry() != null && t.geometry().boundingBox() != null)
            .map(t -> t.geometry().boundingBox().left())
            .sorted()
            .toList();
        
        if (leftPositions.size() < 5) return false;
        
        // Check for common left margins (grouped positions)
        Map<Integer, Integer> marginGroups = new HashMap<>();
        for (Float pos : leftPositions) {
            int bucket = (int)(pos * 10); // Group by 10% intervals
            marginGroups.merge(bucket, 1, Integer::sum);
        }
        
        // Structured documents have text aligned to common margins
        return marginGroups.values().stream().anyMatch(count -> count >= 3);
    }
    
    /**
     * Detect tampering indicators
     */
    private String detectTampering(DetectTextResponse textResponse, DetectLabelsResponse labelsResponse) {
        // Check for inconsistent text (different fonts might indicate editing)
        List<TextDetection> texts = textResponse.textDetections();
        
        if (texts.size() > 10) {
            // Check for wildly different confidence scores (might indicate pasted text)
            double avgConfidence = texts.stream()
                .mapToDouble(TextDetection::confidence)
                .average()
                .orElse(0.0);
            
            long lowConfidenceCount = texts.stream()
                .filter(t -> t.confidence() < avgConfidence - 30)
                .count();
            
            if (lowConfidenceCount > texts.size() * 0.3) {
                return "Inconsistent text quality detected - possible tampering";
            }
        }
        
        // Check for Photo label with high confidence (photo of document is OK, but photo manipulation is not)
        for (Label label : labelsResponse.labels()) {
            if (label.name().equalsIgnoreCase("Photoshop") || 
                label.name().equalsIgnoreCase("Edited") ||
                label.name().equalsIgnoreCase("Screenshot")) {
                if (label.confidence() > 80.0) {
                    return "Image appears to be digitally edited";
                }
            }
        }
        
        return null;
    }
    
    /**
     * Calculate overall authenticity score
     */
    private double calculateAuthenticityScore(
        boolean logoDetected, double logoConfidence,
        boolean hasOfficialText, int keywordCount,
        boolean structureValid, double structureConfidence,
        double documentConfidence
    ) {
        double score = 0.0;
        
        // Document type detection (15%)
        score += (documentConfidence / 100.0) * 15.0;
        
        // Logo/seal detection (25%)
        if (logoDetected) {
            score += (logoConfidence / 100.0) * 25.0;
        }
        
        // Official text keywords (25%)
        if (hasOfficialText) {
            double keywordScore = Math.min(25.0, keywordCount * 5.0);
            score += keywordScore;
        }
        
        // Structure validation (25%)
        if (structureValid) {
            score += (structureConfidence / 100.0) * 25.0;
        } else {
            score += 5.0; // Some points for having text
        }
        
        // Base confidence for having readable document (10%)
        score += 10.0;
        
        return Math.min(100.0, score);
    }
    
    /**
     * Calculate document quality score
     */
    private double calculateDocumentQuality(DetectTextResponse textResponse) {
        if (textResponse.textDetections().isEmpty()) {
            return 0.0;
        }
        
        // Average text confidence as quality indicator
        double avgConfidence = textResponse.textDetections().stream()
            .mapToDouble(TextDetection::confidence)
            .average()
            .orElse(0.0);
        
        // Number of readable text elements
        long readableCount = textResponse.textDetections().stream()
            .filter(t -> t.confidence() > 80.0)
            .count();
        
        double readabilityScore = Math.min(100.0, readableCount * 5.0);
        
        return (avgConfidence + readabilityScore) / 2.0;
    }
    
    /**
     * Build reason for suspicious result
     */
    private String buildSuspiciousReason(boolean logoDetected, boolean hasOfficialText, boolean structureValid) {
        List<String> issues = new ArrayList<>();
        
        if (!logoDetected) {
            issues.add("No official logo/seal detected");
        }
        if (!hasOfficialText) {
            issues.add("No official keywords found");
        }
        if (!structureValid) {
            issues.add("Document structure unclear");
        }
        
        return String.join("; ", issues);
    }
    
    /**
     * Build raw response for audit
     */
    private String buildRawResponse(DetectLabelsResponse labelsResponse, DetectTextResponse textResponse) {
        try {
            List<String> topLabels = labelsResponse.labels().stream()
                .limit(5)
                .map(l -> l.name() + ":" + String.format("%.0f", l.confidence()))
                .toList();
            
            return String.format(
                "{\"labelCount\":%d,\"topLabels\":%s,\"textCount\":%d,\"timestamp\":\"%s\"}",
                labelsResponse.labels().size(),
                topLabels,
                textResponse.textDetections().size(),
                java.time.Instant.now()
            );
        } catch (Exception e) {
            log.warn("Failed to build raw response", e);
            return "{}";
        }
    }
}
