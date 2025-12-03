package com.meslektas.verification.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * AIVerificationResult Value Object Unit Tests
 * 
 * Tests:
 * - Success result creation
 * - Failure result creation
 * - Validation rules
 */
@DisplayName("AIVerificationResult Value Object Tests")
class AIVerificationResultTest {

    @Nested
    @DisplayName("Success Result Creation")
    class SuccessResultTests {

        @Test
        @DisplayName("Should create success result with valid data")
        void shouldCreateSuccessResultWithValidData() {
            AIVerificationResult result = AIVerificationResult.success(
                    92.5,
                    "12345678901",
                    "Ahmet Yılmaz",
                    88.0,
                    "{\"matches\": true}");

            assertThat(result.isSuccessful()).isTrue();
            assertThat(result.getFaceSimilarity()).isEqualTo(92.5);
            assertThat(result.getExtractedDocumentNumber()).isEqualTo("12345678901");
            assertThat(result.getExtractedName()).isEqualTo("Ahmet Yılmaz");
            assertThat(result.getOverallConfidence()).isEqualTo(88.0);
            assertThat(result.getRawResponse()).isEqualTo("{\"matches\": true}");
            assertThat(result.getErrorMessage()).isNull();
        }

        @Test
        @DisplayName("Should create success result with null extracted data")
        void shouldCreateSuccessResultWithNullExtractedData() {
            AIVerificationResult result = AIVerificationResult.success(
                    75.0, null, null, 60.0, "raw response");

            assertThat(result.isSuccessful()).isTrue();
            assertThat(result.getExtractedDocumentNumber()).isNull();
            assertThat(result.getExtractedName()).isNull();
        }

        @Test
        @DisplayName("Should create success result with 0 face similarity")
        void shouldCreateSuccessResultWithZeroFaceSimilarity() {
            AIVerificationResult result = AIVerificationResult.success(
                    0.0, null, null, 0.0, "no face match");

            assertThat(result.isSuccessful()).isTrue();
            assertThat(result.getFaceSimilarity()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Should create success result with 100% face similarity")
        void shouldCreateSuccessResultWithFullFaceSimilarity() {
            AIVerificationResult result = AIVerificationResult.success(
                    100.0, "DOC123", "Test User", 100.0, "perfect match");

            assertThat(result.getFaceSimilarity()).isEqualTo(100.0);
            assertThat(result.getOverallConfidence()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Should throw exception for null face similarity")
        void shouldThrowExceptionForNullFaceSimilarity() {
            assertThatThrownBy(() -> AIVerificationResult.success(
                    null, "DOC123", "Test", 80.0, "raw"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Face similarity must be between 0 and 100");
        }

        @Test
        @DisplayName("Should throw exception for negative face similarity")
        void shouldThrowExceptionForNegativeFaceSimilarity() {
            assertThatThrownBy(() -> AIVerificationResult.success(
                    -1.0, "DOC123", "Test", 80.0, "raw"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Face similarity must be between 0 and 100");
        }

        @Test
        @DisplayName("Should throw exception for face similarity over 100")
        void shouldThrowExceptionForFaceSimilarityOver100() {
            assertThatThrownBy(() -> AIVerificationResult.success(
                    101.0, "DOC123", "Test", 80.0, "raw"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Face similarity must be between 0 and 100");
        }

        @Test
        @DisplayName("Should throw exception for null overall confidence")
        void shouldThrowExceptionForNullOverallConfidence() {
            assertThatThrownBy(() -> AIVerificationResult.success(
                    90.0, "DOC123", "Test", null, "raw"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Overall confidence must be between 0 and 100");
        }

        @Test
        @DisplayName("Should throw exception for negative overall confidence")
        void shouldThrowExceptionForNegativeOverallConfidence() {
            assertThatThrownBy(() -> AIVerificationResult.success(
                    90.0, "DOC123", "Test", -5.0, "raw"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Overall confidence must be between 0 and 100");
        }

        @Test
        @DisplayName("Should throw exception for overall confidence over 100")
        void shouldThrowExceptionForOverallConfidenceOver100() {
            assertThatThrownBy(() -> AIVerificationResult.success(
                    90.0, "DOC123", "Test", 105.0, "raw"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Overall confidence must be between 0 and 100");
        }
    }

    @Nested
    @DisplayName("Failure Result Creation")
    class FailureResultTests {

        @Test
        @DisplayName("Should create failure result with error message")
        void shouldCreateFailureResultWithErrorMessage() {
            AIVerificationResult result = AIVerificationResult.failure("Rekognition API error");

            assertThat(result.isSuccessful()).isFalse();
            assertThat(result.getErrorMessage()).isEqualTo("Rekognition API error");
            assertThat(result.getFaceSimilarity()).isEqualTo(0.0);
            assertThat(result.getOverallConfidence()).isEqualTo(0.0);
            assertThat(result.getExtractedDocumentNumber()).isNull();
            assertThat(result.getExtractedName()).isNull();
        }

        @Test
        @DisplayName("Should throw exception for null error message")
        void shouldThrowExceptionForNullErrorMessage() {
            assertThatThrownBy(() -> AIVerificationResult.failure(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Error message cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for empty error message")
        void shouldThrowExceptionForEmptyErrorMessage() {
            assertThatThrownBy(() -> AIVerificationResult.failure(""))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Error message cannot be null or empty");
        }

        @Test
        @DisplayName("Should throw exception for blank error message")
        void shouldThrowExceptionForBlankErrorMessage() {
            assertThatThrownBy(() -> AIVerificationResult.failure("   "))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Error message cannot be null or empty");
        }
    }

    @Nested
    @DisplayName("Confidence Score Retrieval")
    class ConfidenceScoreTests {

        @Test
        @DisplayName("Should return ConfidenceScore for success result")
        void shouldReturnConfidenceScoreForSuccessResult() {
            AIVerificationResult result = AIVerificationResult.success(
                    90.0, "DOC123", "Test", 88.0, "raw");

            ConfidenceScore score = result.getConfidenceScore();

            assertThat(score).isNotNull();
            assertThat(score.getValue()).isEqualTo(88.0);
            assertThat(score.isAutoApprovalThreshold()).isTrue();
        }

        @Test
        @DisplayName("Should return low ConfidenceScore for failure result")
        void shouldReturnLowConfidenceScoreForFailureResult() {
            AIVerificationResult result = AIVerificationResult.failure("Error");

            ConfidenceScore score = result.getConfidenceScore();

            assertThat(score).isNotNull();
            assertThat(score.getValue()).isEqualTo(0.0);
            assertThat(score.isAutoRejectThreshold()).isTrue();
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Same results should be equal")
        void sameResultsShouldBeEqual() {
            AIVerificationResult result1 = AIVerificationResult.success(
                    90.0, "DOC123", "Test User", 85.0, "raw");
            AIVerificationResult result2 = AIVerificationResult.success(
                    90.0, "DOC123", "Test User", 85.0, "raw");

            assertThat(result1).isEqualTo(result2);
            assertThat(result1.hashCode()).isEqualTo(result2.hashCode());
        }

        @Test
        @DisplayName("Different results should not be equal")
        void differentResultsShouldNotBeEqual() {
            AIVerificationResult result1 = AIVerificationResult.success(
                    90.0, "DOC123", "Test User", 85.0, "raw");
            AIVerificationResult result2 = AIVerificationResult.success(
                    80.0, "DOC456", "Other User", 75.0, "raw");

            assertThat(result1).isNotEqualTo(result2);
        }
    }
}
