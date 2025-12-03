package com.meslektas.verification.infrastructure.aws;

import com.meslektas.verification.domain.model.AIVerificationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import software.amazon.awssdk.services.s3.S3Client;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * RekognitionService Unit Tests
 * 
 * Tests AWS Rekognition integration:
 * - Face comparison
 * - OCR text detection
 * - Confidence calculation
 * - Error handling
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RekognitionService Tests")
class RekognitionServiceTest {

    @Mock
    private RekognitionClient rekognitionClient;

    @Mock
    private S3Client s3Client;

    @InjectMocks
    private RekognitionService rekognitionService;

    private static final String DOCUMENT_S3_KEY = "documents/user1/doc.jpg";
    private static final String SELFIE_S3_KEY = "selfies/user1/selfie.jpg";
    private static final String BUCKET_NAME = "meslektas-verifications";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(rekognitionService, "bucketName", BUCKET_NAME);
    }

    @Nested
    @DisplayName("verifyDocument() - Successful Verification")
    class SuccessfulVerificationTests {

        @Test
        @DisplayName("Should verify document with high face similarity")
        void shouldVerifyDocumentWithHighFaceSimilarity() {
            // Given
            CompareFacesResponse faceResponse = createFaceMatchResponse(95.0f);
            DetectTextResponse textResponse = createTextResponse(
                    "12345678901", 85.0f, "AHMET", 90.0f);

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.isSuccessful()).isTrue();
            assertThat(result.getFaceSimilarity()).isEqualTo(95.0);
            assertThat(result.getExtractedDocumentNumber()).isNotNull();
            assertThat(result.getOverallConfidence()).isGreaterThan(60.0);
            assertThat(result.getErrorMessage()).isNull();
        }

        @Test
        @DisplayName("Should extract Turkish ID number (11 digits)")
        void shouldExtractTurkishIdNumber() {
            // Given
            CompareFacesResponse faceResponse = createFaceMatchResponse(90.0f);
            DetectTextResponse textResponse = createTextResponse(
                    "12345678901", 90.0f, "MEHMET", 90.0f);

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.getExtractedDocumentNumber()).isEqualTo("12345678901");
        }

        @Test
        @DisplayName("Should calculate overall confidence correctly")
        void shouldCalculateOverallConfidenceCorrectly() {
            // Given - 90% face similarity, good OCR
            CompareFacesResponse faceResponse = createFaceMatchResponse(90.0f);
            DetectTextResponse textResponse = createTextResponse(
                    "12345678901", 95.0f, "AYŞE", 95.0f);

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            // Face: 90 * 0.7 = 63, OCR: ~28.5 → Total ~91.5
            assertThat(result.getOverallConfidence())
                    .isGreaterThan(85.0)
                    .isLessThanOrEqualTo(100.0);
        }
    }

    @Nested
    @DisplayName("verifyDocument() - No Face Match")
    class NoFaceMatchTests {

        @Test
        @DisplayName("Should return zero similarity when no face match")
        void shouldReturnZeroSimilarityWhenNoFaceMatch() {
            // Given
            CompareFacesResponse faceResponse = CompareFacesResponse.builder()
                    .faceMatches(Collections.emptyList())
                    .build();

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.isSuccessful()).isTrue();
            assertThat(result.getFaceSimilarity()).isEqualTo(0.0);
            assertThat(result.getOverallConfidence()).isEqualTo(0.0);
        }
    }

    @Nested
    @DisplayName("verifyDocument() - Low Confidence OCR")
    class LowConfidenceOcrTests {

        @Test
        @DisplayName("Should ignore low confidence text detections")
        void shouldIgnoreLowConfidenceTextDetections() {
            // Given
            CompareFacesResponse faceResponse = createFaceMatchResponse(85.0f);

            // Low confidence text detection (below 80%)
            TextDetection lowConfidenceText = TextDetection.builder()
                    .detectedText("12345678901")
                    .confidence(50.0f) // Below MIN_CONFIDENCE_FOR_TEXT (80)
                    .build();

            DetectTextResponse textResponse = DetectTextResponse.builder()
                    .textDetections(List.of(lowConfidenceText))
                    .build();

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.isSuccessful()).isTrue();
            assertThat(result.getExtractedDocumentNumber()).isNull();
        }
    }

    @Nested
    @DisplayName("verifyDocument() - Error Handling")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should return failure when Rekognition throws exception")
        void shouldReturnFailureWhenRekognitionThrowsException() {
            // Given
            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenThrow(RekognitionException.builder()
                            .message("Access denied")
                            .awsErrorDetails(software.amazon.awssdk.awscore.exception.AwsErrorDetails.builder()
                                    .errorMessage("Access denied to bucket")
                                    .build())
                            .build());

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.isSuccessful()).isFalse();
            assertThat(result.getErrorMessage()).contains("Rekognition error");
        }

        @Test
        @DisplayName("Should return failure when unexpected exception occurs")
        void shouldReturnFailureWhenUnexpectedExceptionOccurs() {
            // Given
            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenThrow(new RuntimeException("Network error"));

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.isSuccessful()).isFalse();
            assertThat(result.getErrorMessage()).contains("Verification failed");
        }
    }

    @Nested
    @DisplayName("Confidence Threshold Tests")
    class ConfidenceThresholdTests {

        @Test
        @DisplayName("High confidence (>=85%) should auto-approve")
        void highConfidenceShouldAutoApprove() {
            // Given
            CompareFacesResponse faceResponse = createFaceMatchResponse(95.0f);
            DetectTextResponse textResponse = createTextResponse(
                    "12345678901", 95.0f, "ALİ YILMAZ", 95.0f);

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.getConfidenceScore().isAutoApprovalThreshold()).isTrue();
        }

        @Test
        @DisplayName("Medium confidence (60-84%) should need manual review")
        void mediumConfidenceShouldNeedManualReview() {
            // Given - 75% face similarity
            CompareFacesResponse faceResponse = createFaceMatchResponse(75.0f);
            DetectTextResponse textResponse = createTextResponse(
                    "12345678901", 80.0f, "VELI", 80.0f);

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.getConfidenceScore().needsManualReview()).isTrue();
        }

        @Test
        @DisplayName("Low confidence (<60%) should auto-reject")
        void lowConfidenceShouldAutoReject() {
            // Given - Low face similarity
            CompareFacesResponse faceResponse = createFaceMatchResponse(50.0f);
            DetectTextResponse textResponse = DetectTextResponse.builder()
                    .textDetections(Collections.emptyList())
                    .build();

            when(rekognitionClient.compareFaces(any(CompareFacesRequest.class)))
                    .thenReturn(faceResponse);
            when(rekognitionClient.detectText(any(DetectTextRequest.class)))
                    .thenReturn(textResponse);

            // When
            AIVerificationResult result = rekognitionService.verifyDocument(
                    DOCUMENT_S3_KEY, SELFIE_S3_KEY);

            // Then
            assertThat(result.getConfidenceScore().isAutoRejectThreshold()).isTrue();
        }
    }

    // ========== Helper Methods ==========

    private CompareFacesResponse createFaceMatchResponse(float similarity) {
        CompareFacesMatch match = CompareFacesMatch.builder()
                .similarity(similarity)
                .face(ComparedFace.builder().build())
                .build();

        return CompareFacesResponse.builder()
                .faceMatches(List.of(match))
                .build();
    }

    private DetectTextResponse createTextResponse(
            String docNumber, float docConfidence,
            String name, float nameConfidence) {
        TextDetection docDetection = TextDetection.builder()
                .detectedText(docNumber)
                .confidence(docConfidence)
                .build();

        TextDetection nameDetection = TextDetection.builder()
                .detectedText(name)
                .confidence(nameConfidence)
                .build();

        return DetectTextResponse.builder()
                .textDetections(List.of(docDetection, nameDetection))
                .build();
    }
}
