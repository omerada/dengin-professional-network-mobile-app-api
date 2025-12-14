package com.dengin.verification.application.service;

import com.dengin.common.infrastructure.DomainEventPublisher;
import com.dengin.verification.application.dto.SubmitVerificationRequest;
import com.dengin.verification.application.dto.VerificationEligibilityResponse;
import com.dengin.verification.application.dto.VerificationResponse;
import com.dengin.verification.application.dto.VerificationStatisticsResponse;
import com.dengin.verification.application.service.VerificationService;
import com.dengin.verification.domain.model.*;
import com.dengin.verification.domain.repository.VerificationRequestRepository;
import com.dengin.verification.domain.service.VerificationAttemptPolicy;
import com.dengin.verification.infrastructure.aws.RekognitionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * VerificationService Application Service Unit Tests
 * 
 * Tests:
 * - Submit verification workflow
 * - AI processing workflow
 * - Manual review workflow
 * - User verification queries
 * - Admin statistics
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("VerificationService Tests")
class VerificationServiceTest {

    @Mock
    private VerificationRequestRepository repository;

    @Mock
    private VerificationAttemptPolicy attemptPolicy;

    @Mock
    private RekognitionService rekognitionService;

    @Mock
    private DomainEventPublisher eventPublisher;

    @InjectMocks
    private VerificationService service;

    private static final Long USER_ID = 1L;
    private static final Long PROFESSION_ID = 100L;
    private static final Long ADMIN_ID = 999L;

    @Nested
    @DisplayName("submitVerification() Tests")
    class SubmitVerificationTests {

        private SubmitVerificationRequest validRequest;

        @BeforeEach
        void setUp() {
            validRequest = SubmitVerificationRequest.builder()
                    .professionId(PROFESSION_ID)
                    .documentS3Key("documents/user1/doc.jpg")
                    .documentFileName("diploma.jpg")
                    .documentContentType("image/jpeg")
                    .documentFileSize(500000L)
                    .selfieS3Key("selfies/user1/selfie.jpg")
                    .selfieFileName("selfie.jpg")
                    .selfieContentType("image/jpeg")
                    .selfieFileSize(200000L)
                    .build();
        }

        @Test
        @DisplayName("Should submit verification successfully")
        void shouldSubmitVerificationSuccessfully() {
            // Given
            when(attemptPolicy.canSubmitVerification(USER_ID, PROFESSION_ID))
                    .thenReturn(VerificationAttemptPolicy.ValidationResult.success());
            when(attemptPolicy.getNextAttemptNumber(USER_ID, PROFESSION_ID))
                    .thenReturn(1);

            VerificationRequest[] savedRequest = new VerificationRequest[1];
            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> {
                VerificationRequest req = invocation.getArgument(0);
                ReflectionTestUtils.setField(req, "id", 1L);
                savedRequest[0] = req;
                return req;
            });

            // Mock for processVerificationAsync call
            when(repository.findById(1L)).thenAnswer(inv -> {
                if (savedRequest[0] != null) {
                    return Optional.of(savedRequest[0]);
                }
                return Optional.empty();
            });

            // Mock AI result
            when(rekognitionService.verifyDocument(anyString(), anyString()))
                    .thenReturn(AIVerificationResult.success(90.0, "12345", "Test", 88.0, "raw"));

            // When
            VerificationResponse response = service.submitVerification(validRequest, USER_ID);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getUserId()).isEqualTo(USER_ID);
            assertThat(response.getProfessionId()).isEqualTo(PROFESSION_ID);
            assertThat(response.getAttemptNumber()).isEqualTo(1);

            verify(repository, atLeastOnce()).save(any(VerificationRequest.class));
            verify(eventPublisher, atLeastOnce()).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should reject when attempt policy fails")
        void shouldRejectWhenAttemptPolicyFails() {
            // Given
            when(attemptPolicy.canSubmitVerification(USER_ID, PROFESSION_ID))
                    .thenReturn(VerificationAttemptPolicy.ValidationResult.failure("Max attempts reached"));

            // When/Then
            assertThatThrownBy(() -> service.submitVerification(validRequest, USER_ID))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Max attempts reached");

            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Should use correct attempt number for second attempt")
        void shouldUseCorrectAttemptNumberForSecondAttempt() {
            // Given
            when(attemptPolicy.canSubmitVerification(USER_ID, PROFESSION_ID))
                    .thenReturn(VerificationAttemptPolicy.ValidationResult.success());
            when(attemptPolicy.getNextAttemptNumber(USER_ID, PROFESSION_ID))
                    .thenReturn(2);

            VerificationRequest[] savedRequest = new VerificationRequest[1];
            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> {
                VerificationRequest req = invocation.getArgument(0);
                ReflectionTestUtils.setField(req, "id", 2L);
                savedRequest[0] = req;
                return req;
            });

            // Mock for processVerificationAsync call
            when(repository.findById(2L)).thenAnswer(inv -> {
                if (savedRequest[0] != null) {
                    return Optional.of(savedRequest[0]);
                }
                return Optional.empty();
            });

            // Mock AI result
            when(rekognitionService.verifyDocument(anyString(), anyString()))
                    .thenReturn(AIVerificationResult.success(90.0, "12345", "Test", 88.0, "raw"));

            // When
            VerificationResponse response = service.submitVerification(validRequest, USER_ID);

            // Then
            assertThat(response.getAttemptNumber()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("processVerificationAsync() Tests")
    class ProcessVerificationAsyncTests {

        @Test
        @DisplayName("Should auto-approve when AI confidence >= 85%")
        void shouldAutoApproveWhenHighConfidence() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));

            AIVerificationResult aiResult = AIVerificationResult.success(
                    92.0, "12345678901", "Ahmet Yılmaz", 88.0, "raw response");
            when(rekognitionService.verifyDocument(anyString(), anyString()))
                    .thenReturn(aiResult);

            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            service.processVerificationAsync(1L);

            // Then
            ArgumentCaptor<VerificationRequest> captor = ArgumentCaptor.forClass(VerificationRequest.class);
            verify(repository, times(2)).save(captor.capture());

            VerificationRequest savedRequest = captor.getAllValues().get(1);
            assertThat(savedRequest.getStatus()).isEqualTo(VerificationStatus.AUTO_APPROVED);
        }

        @Test
        @DisplayName("Should auto-reject when AI confidence < 60%")
        void shouldAutoRejectWhenLowConfidence() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));

            AIVerificationResult aiResult = AIVerificationResult.success(
                    45.0, null, null, 40.0, "raw response");
            when(rekognitionService.verifyDocument(anyString(), anyString()))
                    .thenReturn(aiResult);

            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            service.processVerificationAsync(1L);

            // Then
            ArgumentCaptor<VerificationRequest> captor = ArgumentCaptor.forClass(VerificationRequest.class);
            verify(repository, times(2)).save(captor.capture());

            VerificationRequest savedRequest = captor.getAllValues().get(1);
            assertThat(savedRequest.getStatus()).isEqualTo(VerificationStatus.AUTO_REJECTED);
        }

        @Test
        @DisplayName("Should send to manual review when confidence 60-84%")
        void shouldSendToManualReviewWhenMediumConfidence() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));

            AIVerificationResult aiResult = AIVerificationResult.success(
                    75.0, "12345678901", "Ahmet Yılmaz", 72.0, "raw response");
            when(rekognitionService.verifyDocument(anyString(), anyString()))
                    .thenReturn(aiResult);

            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            service.processVerificationAsync(1L);

            // Then
            ArgumentCaptor<VerificationRequest> captor = ArgumentCaptor.forClass(VerificationRequest.class);
            verify(repository, times(2)).save(captor.capture());

            VerificationRequest savedRequest = captor.getAllValues().get(1);
            assertThat(savedRequest.getStatus()).isEqualTo(VerificationStatus.PENDING_MANUAL_REVIEW);
        }

        @Test
        @DisplayName("Should handle AI processing failure")
        void shouldHandleAIProcessingFailure() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));

            AIVerificationResult aiResult = AIVerificationResult.failure("Rekognition API error");
            when(rekognitionService.verifyDocument(anyString(), anyString()))
                    .thenReturn(aiResult);

            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            service.processVerificationAsync(1L);

            // Then
            ArgumentCaptor<VerificationRequest> captor = ArgumentCaptor.forClass(VerificationRequest.class);
            verify(repository, times(2)).save(captor.capture());

            VerificationRequest savedRequest = captor.getAllValues().get(1);
            assertThat(savedRequest.getStatus()).isEqualTo(VerificationStatus.PENDING_MANUAL_REVIEW);
        }

        @Test
        @DisplayName("Should throw when verification not found")
        void shouldThrowWhenVerificationNotFound() {
            // Given
            when(repository.findById(999L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> service.processVerificationAsync(999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Verification not found: 999");
        }
    }

    @Nested
    @DisplayName("Manual Review Tests")
    class ManualReviewTests {

        @Test
        @DisplayName("Should approve verification manually")
        void shouldApproveVerificationManually() {
            // Given
            VerificationRequest verification = createManualReviewVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));
            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            VerificationResponse response = service.approveVerification(1L, ADMIN_ID, "Document verified");

            // Then
            assertThat(response.getStatus()).isEqualTo(VerificationStatus.APPROVED);
            verify(repository).save(any(VerificationRequest.class));
            verify(eventPublisher).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should reject verification manually")
        void shouldRejectVerificationManually() {
            // Given
            VerificationRequest verification = createManualReviewVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));
            when(repository.save(any(VerificationRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            VerificationResponse response = service.rejectVerification(1L, ADMIN_ID, "Document unclear");

            // Then
            assertThat(response.getStatus()).isEqualTo(VerificationStatus.REJECTED);
            verify(repository).save(any(VerificationRequest.class));
            verify(eventPublisher).publishEvents(anyList());
        }

        @Test
        @DisplayName("Should get pending manual reviews")
        void shouldGetPendingManualReviews() {
            // Given
            VerificationRequest verification1 = createManualReviewVerification();
            VerificationRequest verification2 = createManualReviewVerification();
            ReflectionTestUtils.setField(verification2, "id", 2L);

            when(repository.findByStatus(VerificationStatus.PENDING_MANUAL_REVIEW))
                    .thenReturn(List.of(verification1, verification2));

            // When
            List<VerificationResponse> responses = service.getPendingManualReviews();

            // Then
            assertThat(responses).hasSize(2);
        }
    }

    @Nested
    @DisplayName("User Query Tests")
    class UserQueryTests {

        @Test
        @DisplayName("Should get user verifications")
        void shouldGetUserVerifications() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findByUserIdOrderBySubmittedAtDesc(USER_ID))
                    .thenReturn(List.of(verification));

            // When
            List<VerificationResponse> responses = service.getUserVerifications(USER_ID);

            // Then
            assertThat(responses).hasSize(1);
            assertThat(responses.get(0).getUserId()).isEqualTo(USER_ID);
        }

        @Test
        @DisplayName("Should get verification by ID for authorized user")
        void shouldGetVerificationByIdForAuthorizedUser() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));

            // When
            VerificationResponse response = service.getVerificationById(1L, USER_ID);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should throw SecurityException for unauthorized user")
        void shouldThrowSecurityExceptionForUnauthorizedUser() {
            // Given
            VerificationRequest verification = createPendingVerification();
            when(repository.findById(1L)).thenReturn(Optional.of(verification));

            // When/Then
            assertThatThrownBy(() -> service.getVerificationById(1L, 999L))
                    .isInstanceOf(SecurityException.class)
                    .hasMessage("Unauthorized access to verification");
        }

        @Test
        @DisplayName("Should throw when verification not found")
        void shouldThrowWhenVerificationNotFound() {
            // Given
            when(repository.findById(999L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> service.getVerificationById(999L, USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Verification not found: 999");
        }
    }

    @Nested
    @DisplayName("checkEligibility() Tests")
    class CheckEligibilityTests {

        @Test
        @DisplayName("Should return already verified when approved")
        void shouldReturnAlreadyVerifiedWhenApproved() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(true);

            // When
            VerificationEligibilityResponse response = service.checkEligibility(USER_ID, PROFESSION_ID);

            // Then
            assertThat(response.isCanSubmit()).isFalse();
            assertThat(response.getReason()).contains("already have an approved verification");
        }

        @Test
        @DisplayName("Should return eligible when can submit")
        void shouldReturnEligibleWhenCanSubmit() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(false);
            when(attemptPolicy.canSubmitVerification(USER_ID, PROFESSION_ID))
                    .thenReturn(VerificationAttemptPolicy.ValidationResult.success());
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(0);
            when(attemptPolicy.getRemainingAttempts(USER_ID, PROFESSION_ID)).thenReturn(3);

            // When
            VerificationEligibilityResponse response = service.checkEligibility(USER_ID, PROFESSION_ID);

            // Then
            assertThat(response.isCanSubmit()).isTrue();
            assertThat(response.getRemainingAttempts()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("getStatistics() Tests")
    class StatisticsTests {

        @Test
        @DisplayName("Should calculate statistics correctly")
        void shouldCalculateStatisticsCorrectly() {
            // Given
            when(repository.count()).thenReturn(100L);
            when(repository.countByStatus(VerificationStatus.PENDING_MANUAL_REVIEW)).thenReturn(10L);
            when(repository.countByStatusIn(
                    List.of(VerificationStatus.AUTO_APPROVED, VerificationStatus.APPROVED))).thenReturn(70L);
            when(repository.countByStatusIn(
                    List.of(VerificationStatus.AUTO_REJECTED, VerificationStatus.REJECTED))).thenReturn(15L);
            when(repository.countByStatus(VerificationStatus.EXPIRED)).thenReturn(5L);
            when(repository.countByStatus(VerificationStatus.AUTO_APPROVED)).thenReturn(50L);
            when(repository.calculateAverageProcessingTimeMinutes()).thenReturn(2.5);
            when(repository.countBySubmittedAtAfter(any(Instant.class)))
                    .thenReturn(5L, 30L, 90L);

            // When
            VerificationStatisticsResponse stats = service.getStatistics();

            // Then
            assertThat(stats.getTotalRequests()).isEqualTo(100L);
            assertThat(stats.getPendingReviews()).isEqualTo(10L);
            assertThat(stats.getApprovedCount()).isEqualTo(70L);
            assertThat(stats.getRejectedCount()).isEqualTo(15L);
            assertThat(stats.getExpiredCount()).isEqualTo(5L);
            assertThat(stats.getApprovalRate()).isEqualTo(70.0);
            assertThat(stats.getAverageProcessingMinutes()).isEqualTo(2.5);
        }

        @Test
        @DisplayName("Should handle zero total requests")
        void shouldHandleZeroTotalRequests() {
            // Given
            when(repository.count()).thenReturn(0L);
            when(repository.countByStatus(any())).thenReturn(0L);
            when(repository.countByStatusIn(anyList())).thenReturn(0L);
            when(repository.calculateAverageProcessingTimeMinutes()).thenReturn(null);
            when(repository.countBySubmittedAtAfter(any(Instant.class))).thenReturn(0L);

            // When
            VerificationStatisticsResponse stats = service.getStatistics();

            // Then
            assertThat(stats.getTotalRequests()).isEqualTo(0L);
            assertThat(stats.getApprovalRate()).isEqualTo(0.0);
            assertThat(stats.getAverageProcessingMinutes()).isEqualTo(0.0);
        }
    }

    @Nested
    @DisplayName("Helper Method Tests")
    class HelperMethodTests {

        @Test
        @DisplayName("Should check if can submit verification")
        void shouldCheckIfCanSubmitVerification() {
            // Given
            when(attemptPolicy.canSubmitVerification(USER_ID, PROFESSION_ID))
                    .thenReturn(VerificationAttemptPolicy.ValidationResult.success());

            // When
            boolean canSubmit = service.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(canSubmit).isTrue();
        }

        @Test
        @DisplayName("Should get remaining attempts")
        void shouldGetRemainingAttempts() {
            // Given
            when(attemptPolicy.getRemainingAttempts(USER_ID, PROFESSION_ID)).thenReturn(2);

            // When
            int remaining = service.getRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(remaining).isEqualTo(2);
        }
    }

    // ========== Helper Methods ==========

    private VerificationRequest createPendingVerification() {
        DocumentImage documentImage = DocumentImage.of(
                "documents/user1/doc.jpg", "doc.jpg", "image/jpeg", 500000L);
        SelfieImage selfieImage = SelfieImage.of(
                "selfies/user1/selfie.jpg", "selfie.jpg", "image/jpeg", 200000L);

        VerificationRequest request = VerificationRequest.create(
                USER_ID, PROFESSION_ID, documentImage, selfieImage, 1);
        ReflectionTestUtils.setField(request, "id", 1L);
        return request;
    }

    private VerificationRequest createManualReviewVerification() {
        VerificationRequest request = createPendingVerification();
        ReflectionTestUtils.setField(request, "status", VerificationStatus.PENDING_MANUAL_REVIEW);
        return request;
    }
}
