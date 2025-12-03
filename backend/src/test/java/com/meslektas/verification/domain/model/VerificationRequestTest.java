package com.meslektas.verification.domain.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

/**
 * Verification Request Aggregate Root Unit Tests
 * 
 * Tests:
 * - Factory method validation
 * - Status transitions
 * - AI result processing
 * - Manual review workflow
 * - Expiration logic
 */
@DisplayName("VerificationRequest Aggregate Tests")
class VerificationRequestTest {

    private DocumentImage validDocumentImage;
    private SelfieImage validSelfieImage;

    @BeforeEach
    void setUp() {
        validDocumentImage = DocumentImage.of(
                "documents/user123/doc.jpg",
                "diploma.jpg",
                "image/jpeg",
                1024L * 500 // 500KB
        );

        validSelfieImage = SelfieImage.of(
                "selfies/user123/selfie.jpg",
                "selfie.jpg",
                "image/jpeg",
                1024L * 200 // 200KB
        );
    }

    @Nested
    @DisplayName("Factory Method - create()")
    class CreateTests {

        @Test
        @DisplayName("Should create verification request with valid data")
        void shouldCreateVerificationRequestWithValidData() {
            VerificationRequest request = VerificationRequest.create(
                    1L,
                    100L,
                    validDocumentImage,
                    validSelfieImage,
                    1);

            assertThat(request).isNotNull();
            assertThat(request.getUserId()).isEqualTo(1L);
            assertThat(request.getProfessionId()).isEqualTo(100L);
            assertThat(request.getDocumentImage()).isEqualTo(validDocumentImage);
            assertThat(request.getSelfieImage()).isEqualTo(validSelfieImage);
            assertThat(request.getAttemptNumber()).isEqualTo(1);
            assertThat(request.getStatus()).isEqualTo(VerificationStatus.PENDING);
            assertThat(request.getVerificationId()).isNotNull();
            assertThat(request.getSubmittedAt()).isNotNull();
            assertThat(request.getExpiresAt()).isNotNull();
            assertThat(request.getProcessedAt()).isNull();
        }

        @Test
        @DisplayName("Should create with attempt number 2")
        void shouldCreateWithAttemptNumberTwo() {
            VerificationRequest request = VerificationRequest.create(
                    1L, 100L, validDocumentImage, validSelfieImage, 2);

            assertThat(request.getAttemptNumber()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should create with attempt number 3")
        void shouldCreateWithAttemptNumberThree() {
            VerificationRequest request = VerificationRequest.create(
                    1L, 100L, validDocumentImage, validSelfieImage, 3);

            assertThat(request.getAttemptNumber()).isEqualTo(3);
        }

        @Test
        @DisplayName("Should throw exception when userId is null")
        void shouldThrowExceptionWhenUserIdIsNull() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    null, 100L, validDocumentImage, validSelfieImage, 1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("User ID cannot be null");
        }

        @Test
        @DisplayName("Should throw exception when professionId is null")
        void shouldThrowExceptionWhenProfessionIdIsNull() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    1L, null, validDocumentImage, validSelfieImage, 1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Profession ID cannot be null");
        }

        @Test
        @DisplayName("Should throw exception when documentImage is null")
        void shouldThrowExceptionWhenDocumentImageIsNull() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    1L, 100L, null, validSelfieImage, 1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Document image cannot be null");
        }

        @Test
        @DisplayName("Should throw exception when selfieImage is null")
        void shouldThrowExceptionWhenSelfieImageIsNull() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    1L, 100L, validDocumentImage, null, 1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Selfie image cannot be null");
        }

        @Test
        @DisplayName("Should throw exception when attemptNumber is null")
        void shouldThrowExceptionWhenAttemptNumberIsNull() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    1L, 100L, validDocumentImage, validSelfieImage, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Attempt number must be between 1 and 3");
        }

        @Test
        @DisplayName("Should throw exception when attemptNumber is 0")
        void shouldThrowExceptionWhenAttemptNumberIsZero() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    1L, 100L, validDocumentImage, validSelfieImage, 0))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Attempt number must be between 1 and 3");
        }

        @Test
        @DisplayName("Should throw exception when attemptNumber exceeds 3")
        void shouldThrowExceptionWhenAttemptNumberExceedsThree() {
            assertThatThrownBy(() -> VerificationRequest.create(
                    1L, 100L, validDocumentImage, validSelfieImage, 4))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Attempt number must be between 1 and 3");
        }

        @Test
        @DisplayName("Should set expires_at to 7 days from now")
        void shouldSetExpiresAtToSevenDaysFromNow() {
            VerificationRequest request = VerificationRequest.create(
                    1L, 100L, validDocumentImage, validSelfieImage, 1);

            long daysDifference = java.time.temporal.ChronoUnit.DAYS.between(
                    request.getSubmittedAt(), request.getExpiresAt());

            assertThat(daysDifference).isEqualTo(7);
        }
    }

    @Nested
    @DisplayName("Status Transitions - startAIProcessing()")
    class StartAIProcessingTests {

        @Test
        @DisplayName("Should start AI processing from PENDING status")
        void shouldStartAIProcessingFromPendingStatus() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "id", 1L);

            request.startAIProcessing();

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.AI_PROCESSING);
            assertThat(request.getEvents()).hasSize(1);
        }

        @Test
        @DisplayName("Should throw exception when starting AI processing from non-PENDING status")
        void shouldThrowExceptionWhenStartingFromNonPendingStatus() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "id", 1L);
            ReflectionTestUtils.setField(request, "status", VerificationStatus.AI_PROCESSING);

            assertThatThrownBy(request::startAIProcessing)
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot start AI processing from status");
        }
    }

    @Nested
    @DisplayName("AI Result Processing - processAIResult()")
    class ProcessAIResultTests {

        @Test
        @DisplayName("Should auto-approve when confidence >= 85%")
        void shouldAutoApproveWhenConfidenceHighEnough() {
            VerificationRequest request = createAIProcessingRequest();

            AIVerificationResult aiResult = AIVerificationResult.success(
                    92.0, "12345678", "John Doe", 88.0, "raw response");

            request.processAIResult(aiResult);

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.AUTO_APPROVED);
            assertThat(request.getAiResult()).isEqualTo(aiResult);
            assertThat(request.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should auto-reject when confidence < 60%")
        void shouldAutoRejectWhenConfidenceTooLow() {
            VerificationRequest request = createAIProcessingRequest();

            AIVerificationResult aiResult = AIVerificationResult.success(
                    50.0, null, null, 45.0, "raw response");

            request.processAIResult(aiResult);

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.AUTO_REJECTED);
            assertThat(request.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should send to manual review when confidence 60-84%")
        void shouldSendToManualReviewWhenConfidenceInMiddleRange() {
            VerificationRequest request = createAIProcessingRequest();

            AIVerificationResult aiResult = AIVerificationResult.success(
                    75.0, "12345678", "John Doe", 72.0, "raw response");

            request.processAIResult(aiResult);

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.PENDING_MANUAL_REVIEW);
            assertThat(request.getProcessedAt()).isNull(); // Not final yet
        }

        @Test
        @DisplayName("Should send to manual review when AI processing fails")
        void shouldSendToManualReviewWhenAIProcessingFails() {
            VerificationRequest request = createAIProcessingRequest();

            AIVerificationResult aiResult = AIVerificationResult.failure("Rekognition error");

            request.processAIResult(aiResult);

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.PENDING_MANUAL_REVIEW);
        }

        @Test
        @DisplayName("Should throw exception when processing AI result from non-AI_PROCESSING status")
        void shouldThrowExceptionWhenProcessingFromWrongStatus() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "id", 1L);

            AIVerificationResult aiResult = AIVerificationResult.success(
                    90.0, "12345", "Test", 88.0, "raw");

            assertThatThrownBy(() -> request.processAIResult(aiResult))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot process AI result from status");
        }
    }

    @Nested
    @DisplayName("Manual Review - approveManually()")
    class ApproveManuallyTests {

        @Test
        @DisplayName("Should approve manually from PENDING_MANUAL_REVIEW status")
        void shouldApproveManuallyFromPendingManualReviewStatus() {
            VerificationRequest request = createManualReviewRequest();

            request.approveManually(999L, "Document verified");

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.APPROVED);
            assertThat(request.getManualReviewResult()).isNotNull();
            assertThat(request.getManualReviewResult().getReviewedByAdminId()).isEqualTo(999L);
            assertThat(request.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception when approving from wrong status")
        void shouldThrowExceptionWhenApprovingFromWrongStatus() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "id", 1L);

            assertThatThrownBy(() -> request.approveManually(999L, "Notes"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot manually approve from status");
        }
    }

    @Nested
    @DisplayName("Manual Review - rejectManually()")
    class RejectManuallyTests {

        @Test
        @DisplayName("Should reject manually from PENDING_MANUAL_REVIEW status")
        void shouldRejectManuallyFromPendingManualReviewStatus() {
            VerificationRequest request = createManualReviewRequest();

            request.rejectManually(999L, "Document unclear");

            assertThat(request.getStatus()).isEqualTo(VerificationStatus.REJECTED);
            assertThat(request.getManualReviewResult()).isNotNull();
            assertThat(request.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should throw exception when rejecting from wrong status")
        void shouldThrowExceptionWhenRejectingFromWrongStatus() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "id", 1L);

            assertThatThrownBy(() -> request.rejectManually(999L, "Reason"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot manually reject from status");
        }
    }

    @Nested
    @DisplayName("Expiration Logic")
    class ExpirationTests {

        @Test
        @DisplayName("Should not be expired when within 7 days")
        void shouldNotBeExpiredWhenWithinSevenDays() {
            VerificationRequest request = createValidRequest();

            assertThat(request.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Should be expired when past expiration date")
        void shouldBeExpiredWhenPastExpirationDate() {
            VerificationRequest request = createValidRequest();

            // Set expires_at to the past
            ReflectionTestUtils.setField(request, "expiresAt",
                    java.time.Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS));

            assertThat(request.isExpired()).isTrue();
        }

        @Test
        @DisplayName("Should not be expired if already in final status")
        void shouldNotBeExpiredIfAlreadyInFinalStatus() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "status", VerificationStatus.AUTO_APPROVED);
            ReflectionTestUtils.setField(request, "expiresAt",
                    java.time.Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS));

            assertThat(request.isExpired()).isFalse();
        }
    }

    @Nested
    @DisplayName("Status Helper Methods")
    class StatusHelperMethodsTests {

        @Test
        @DisplayName("isApproved should return true for AUTO_APPROVED")
        void isApprovedShouldReturnTrueForAutoApproved() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "status", VerificationStatus.AUTO_APPROVED);

            assertThat(request.isApproved()).isTrue();
            assertThat(request.isRejected()).isFalse();
        }

        @Test
        @DisplayName("isApproved should return true for APPROVED")
        void isApprovedShouldReturnTrueForApproved() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "status", VerificationStatus.APPROVED);

            assertThat(request.isApproved()).isTrue();
        }

        @Test
        @DisplayName("isRejected should return true for AUTO_REJECTED")
        void isRejectedShouldReturnTrueForAutoRejected() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "status", VerificationStatus.AUTO_REJECTED);

            assertThat(request.isRejected()).isTrue();
            assertThat(request.isApproved()).isFalse();
        }

        @Test
        @DisplayName("isRejected should return true for REJECTED")
        void isRejectedShouldReturnTrueForRejected() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "status", VerificationStatus.REJECTED);

            assertThat(request.isRejected()).isTrue();
        }

        @Test
        @DisplayName("needsManualReview should return true for PENDING_MANUAL_REVIEW")
        void needsManualReviewShouldReturnTrueForPendingManualReview() {
            VerificationRequest request = createValidRequest();
            ReflectionTestUtils.setField(request, "status", VerificationStatus.PENDING_MANUAL_REVIEW);

            assertThat(request.needsManualReview()).isTrue();
        }
    }

    // ========== Helper Methods ==========

    private VerificationRequest createValidRequest() {
        return VerificationRequest.create(
                1L, 100L, validDocumentImage, validSelfieImage, 1);
    }

    private VerificationRequest createAIProcessingRequest() {
        VerificationRequest request = createValidRequest();
        ReflectionTestUtils.setField(request, "id", 1L);
        ReflectionTestUtils.setField(request, "status", VerificationStatus.AI_PROCESSING);
        return request;
    }

    private VerificationRequest createManualReviewRequest() {
        VerificationRequest request = createValidRequest();
        ReflectionTestUtils.setField(request, "id", 1L);
        ReflectionTestUtils.setField(request, "status", VerificationStatus.PENDING_MANUAL_REVIEW);
        return request;
    }
}
