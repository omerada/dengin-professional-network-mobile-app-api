package com.meslektas.verification.domain.service;

import com.meslektas.verification.domain.model.VerificationStatus;
import com.meslektas.verification.domain.repository.VerificationRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * VerificationAttemptPolicy Domain Service Unit Tests
 * 
 * Business Rules:
 * - Max 3 verification attempts per profession
 * - 24-hour cooldown between failed attempts
 * - No duplicate pending/approved verifications
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("VerificationAttemptPolicy Tests")
class VerificationAttemptPolicyTest {

    @Mock
    private VerificationRequestRepository repository;

    @InjectMocks
    private VerificationAttemptPolicy policy;

    private static final Long USER_ID = 1L;
    private static final Long PROFESSION_ID = 100L;

    @Nested
    @DisplayName("canSubmitVerification() Tests")
    class CanSubmitVerificationTests {

        @Test
        @DisplayName("Should allow submission when no existing verification")
        void shouldAllowSubmissionWhenNoExistingVerification() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(false);
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(0);
            when(repository.countRecentFailedAttempts(eq(USER_ID), eq(PROFESSION_ID), any(Instant.class)))
                    .thenReturn(0);

            // When
            VerificationAttemptPolicy.ValidationResult result = policy.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(result.isValid()).isTrue();
            assertThat(result.getErrorMessage()).isNull();
        }

        @Test
        @DisplayName("Should reject when pending verification exists")
        void shouldRejectWhenPendingVerificationExists() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(true);

            // When
            VerificationAttemptPolicy.ValidationResult result = policy.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrorMessage())
                    .contains("already have a pending or approved verification");
        }

        @Test
        @DisplayName("Should reject when max 3 attempts reached")
        void shouldRejectWhenMaxAttemptsReached() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(false);
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(3);

            // When
            VerificationAttemptPolicy.ValidationResult result = policy.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrorMessage())
                    .contains("maximum number of verification attempts (3)");
        }

        @Test
        @DisplayName("Should reject when within 24h cooldown after failed attempt")
        void shouldRejectWhenWithin24hCooldown() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(false);
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(1);
            when(repository.countRecentFailedAttempts(eq(USER_ID), eq(PROFESSION_ID), any(Instant.class)))
                    .thenReturn(1);

            // When
            VerificationAttemptPolicy.ValidationResult result = policy.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrorMessage())
                    .contains("wait 24 hours after a failed verification");
        }

        @Test
        @DisplayName("Should allow after 24h cooldown passed")
        void shouldAllowAfter24hCooldownPassed() {
            // Given
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(false);
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(1);
            when(repository.countRecentFailedAttempts(eq(USER_ID), eq(PROFESSION_ID), any(Instant.class)))
                    .thenReturn(0);

            // When
            VerificationAttemptPolicy.ValidationResult result = policy.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(result.isValid()).isTrue();
        }

        @Test
        @DisplayName("Should allow second attempt after first failure and cooldown")
        void shouldAllowSecondAttemptAfterCooldown() {
            // Given - 1 attempt, no recent failures
            when(repository.existsByUserIdAndProfessionIdAndStatusIn(
                    eq(USER_ID), eq(PROFESSION_ID), anyList())).thenReturn(false);
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(1);
            when(repository.countRecentFailedAttempts(eq(USER_ID), eq(PROFESSION_ID), any(Instant.class)))
                    .thenReturn(0);

            // When
            VerificationAttemptPolicy.ValidationResult result = policy.canSubmitVerification(USER_ID, PROFESSION_ID);

            // Then
            assertThat(result.isValid()).isTrue();
        }
    }

    @Nested
    @DisplayName("getNextAttemptNumber() Tests")
    class GetNextAttemptNumberTests {

        @Test
        @DisplayName("Should return 1 for first attempt")
        void shouldReturn1ForFirstAttempt() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(0);

            // When
            int attemptNumber = policy.getNextAttemptNumber(USER_ID, PROFESSION_ID);

            // Then
            assertThat(attemptNumber).isEqualTo(1);
        }

        @Test
        @DisplayName("Should return 2 for second attempt")
        void shouldReturn2ForSecondAttempt() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(1);

            // When
            int attemptNumber = policy.getNextAttemptNumber(USER_ID, PROFESSION_ID);

            // Then
            assertThat(attemptNumber).isEqualTo(2);
        }

        @Test
        @DisplayName("Should return 3 for third attempt")
        void shouldReturn3ForThirdAttempt() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(2);

            // When
            int attemptNumber = policy.getNextAttemptNumber(USER_ID, PROFESSION_ID);

            // Then
            assertThat(attemptNumber).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("hasRemainingAttempts() Tests")
    class HasRemainingAttemptsTests {

        @Test
        @DisplayName("Should return true when 0 attempts made")
        void shouldReturnTrueWhenZeroAttemptsMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(0);

            // When
            boolean hasRemaining = policy.hasRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(hasRemaining).isTrue();
        }

        @Test
        @DisplayName("Should return true when 1 attempt made")
        void shouldReturnTrueWhenOneAttemptMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(1);

            // When
            boolean hasRemaining = policy.hasRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(hasRemaining).isTrue();
        }

        @Test
        @DisplayName("Should return true when 2 attempts made")
        void shouldReturnTrueWhenTwoAttemptsMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(2);

            // When
            boolean hasRemaining = policy.hasRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(hasRemaining).isTrue();
        }

        @Test
        @DisplayName("Should return false when 3 attempts made")
        void shouldReturnFalseWhenThreeAttemptsMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(3);

            // When
            boolean hasRemaining = policy.hasRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(hasRemaining).isFalse();
        }
    }

    @Nested
    @DisplayName("getRemainingAttempts() Tests")
    class GetRemainingAttemptsTests {

        @Test
        @DisplayName("Should return 3 when no attempts made")
        void shouldReturn3WhenNoAttemptsMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(0);

            // When
            int remaining = policy.getRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(remaining).isEqualTo(3);
        }

        @Test
        @DisplayName("Should return 2 when 1 attempt made")
        void shouldReturn2WhenOneAttemptMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(1);

            // When
            int remaining = policy.getRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(remaining).isEqualTo(2);
        }

        @Test
        @DisplayName("Should return 1 when 2 attempts made")
        void shouldReturn1WhenTwoAttemptsMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(2);

            // When
            int remaining = policy.getRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(remaining).isEqualTo(1);
        }

        @Test
        @DisplayName("Should return 0 when 3 attempts made")
        void shouldReturn0WhenThreeAttemptsMade() {
            // Given
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(3);

            // When
            int remaining = policy.getRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then
            assertThat(remaining).isEqualTo(0);
        }

        @Test
        @DisplayName("Should return 0 when more than 3 attempts made (edge case)")
        void shouldReturn0WhenMoreThan3AttemptsMade() {
            // Given - Edge case: somehow more than 3 attempts recorded
            when(repository.countTotalAttempts(USER_ID, PROFESSION_ID)).thenReturn(5);

            // When
            int remaining = policy.getRemainingAttempts(USER_ID, PROFESSION_ID);

            // Then - Should cap at 0, not go negative
            assertThat(remaining).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("ValidationResult Tests")
    class ValidationResultTests {

        @Test
        @DisplayName("Success result should be valid with no error")
        void successResultShouldBeValidWithNoError() {
            // Given
            VerificationAttemptPolicy.ValidationResult result = VerificationAttemptPolicy.ValidationResult.success();

            // Then
            assertThat(result.isValid()).isTrue();
            assertThat(result.getErrorMessage()).isNull();
        }

        @Test
        @DisplayName("Failure result should be invalid with error message")
        void failureResultShouldBeInvalidWithErrorMessage() {
            // Given
            VerificationAttemptPolicy.ValidationResult result = VerificationAttemptPolicy.ValidationResult
                    .failure("Test error");

            // Then
            assertThat(result.isValid()).isFalse();
            assertThat(result.getErrorMessage()).isEqualTo("Test error");
        }
    }
}
