package com.dengin.verification.domain.model;

import com.dengin.verification.domain.model.ConfidenceScore;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.dengin.verification.domain.model.ConfidenceScore.VerificationDecision;

import static org.assertj.core.api.Assertions.*;

/**
 * ConfidenceScore Value Object Unit Tests
 * 
 * Business Rules:
 * - >= 85%: Auto-approve
 * - 60-84%: Manual review
 * - < 60%: Auto-reject
 */
@DisplayName("ConfidenceScore Value Object Tests")
class ConfidenceScoreTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("Should create with valid score 0")
        void shouldCreateWithScoreZero() {
            ConfidenceScore score = ConfidenceScore.of(0.0);

            assertThat(score.getValue()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("Should create with valid score 100")
        void shouldCreateWithScoreHundred() {
            ConfidenceScore score = ConfidenceScore.of(100.0);

            assertThat(score.getValue()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("Should create with valid score 75.5")
        void shouldCreateWithDecimalScore() {
            ConfidenceScore score = ConfidenceScore.of(75.5);

            assertThat(score.getValue()).isEqualTo(75.5);
        }

        @Test
        @DisplayName("Should throw exception for null score")
        void shouldThrowExceptionForNullScore() {
            assertThatThrownBy(() -> ConfidenceScore.of(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Confidence score cannot be null");
        }

        @Test
        @DisplayName("Should throw exception for negative score")
        void shouldThrowExceptionForNegativeScore() {
            assertThatThrownBy(() -> ConfidenceScore.of(-1.0))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("must be between 0 and 100");
        }

        @Test
        @DisplayName("Should throw exception for score over 100")
        void shouldThrowExceptionForScoreOverHundred() {
            assertThatThrownBy(() -> ConfidenceScore.of(100.1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("must be between 0 and 100");
        }
    }

    @Nested
    @DisplayName("Auto-Approval Threshold Tests (>= 85%)")
    class AutoApprovalTests {

        @Test
        @DisplayName("Score 85 should be auto-approval threshold")
        void score85ShouldBeAutoApprovalThreshold() {
            ConfidenceScore score = ConfidenceScore.of(85.0);

            assertThat(score.isAutoApprovalThreshold()).isTrue();
            assertThat(score.needsManualReview()).isFalse();
            assertThat(score.isAutoRejectThreshold()).isFalse();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.AUTO_APPROVE);
        }

        @Test
        @DisplayName("Score 100 should be auto-approval threshold")
        void score100ShouldBeAutoApprovalThreshold() {
            ConfidenceScore score = ConfidenceScore.of(100.0);

            assertThat(score.isAutoApprovalThreshold()).isTrue();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.AUTO_APPROVE);
        }

        @Test
        @DisplayName("Score 90.5 should be auto-approval threshold")
        void score90_5ShouldBeAutoApprovalThreshold() {
            ConfidenceScore score = ConfidenceScore.of(90.5);

            assertThat(score.isAutoApprovalThreshold()).isTrue();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.AUTO_APPROVE);
        }
    }

    @Nested
    @DisplayName("Manual Review Threshold Tests (60-84%)")
    class ManualReviewTests {

        @Test
        @DisplayName("Score 60 should need manual review")
        void score60ShouldNeedManualReview() {
            ConfidenceScore score = ConfidenceScore.of(60.0);

            assertThat(score.needsManualReview()).isTrue();
            assertThat(score.isAutoApprovalThreshold()).isFalse();
            assertThat(score.isAutoRejectThreshold()).isFalse();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.MANUAL_REVIEW);
        }

        @Test
        @DisplayName("Score 84.9 should need manual review")
        void score84_9ShouldNeedManualReview() {
            ConfidenceScore score = ConfidenceScore.of(84.9);

            assertThat(score.needsManualReview()).isTrue();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.MANUAL_REVIEW);
        }

        @Test
        @DisplayName("Score 72 should need manual review")
        void score72ShouldNeedManualReview() {
            ConfidenceScore score = ConfidenceScore.of(72.0);

            assertThat(score.needsManualReview()).isTrue();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.MANUAL_REVIEW);
        }
    }

    @Nested
    @DisplayName("Auto-Reject Threshold Tests (< 60%)")
    class AutoRejectTests {

        @Test
        @DisplayName("Score 59.9 should be auto-reject threshold")
        void score59_9ShouldBeAutoRejectThreshold() {
            ConfidenceScore score = ConfidenceScore.of(59.9);

            assertThat(score.isAutoRejectThreshold()).isTrue();
            assertThat(score.needsManualReview()).isFalse();
            assertThat(score.isAutoApprovalThreshold()).isFalse();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.AUTO_REJECT);
        }

        @Test
        @DisplayName("Score 0 should be auto-reject threshold")
        void score0ShouldBeAutoRejectThreshold() {
            ConfidenceScore score = ConfidenceScore.of(0.0);

            assertThat(score.isAutoRejectThreshold()).isTrue();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.AUTO_REJECT);
        }

        @Test
        @DisplayName("Score 30 should be auto-reject threshold")
        void score30ShouldBeAutoRejectThreshold() {
            ConfidenceScore score = ConfidenceScore.of(30.0);

            assertThat(score.isAutoRejectThreshold()).isTrue();
            assertThat(score.getDecision()).isEqualTo(VerificationDecision.AUTO_REJECT);
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Same scores should be equal")
        void sameScoresShouldBeEqual() {
            ConfidenceScore score1 = ConfidenceScore.of(75.0);
            ConfidenceScore score2 = ConfidenceScore.of(75.0);

            assertThat(score1).isEqualTo(score2);
            assertThat(score1.hashCode()).isEqualTo(score2.hashCode());
        }

        @Test
        @DisplayName("Different scores should not be equal")
        void differentScoresShouldNotBeEqual() {
            ConfidenceScore score1 = ConfidenceScore.of(75.0);
            ConfidenceScore score2 = ConfidenceScore.of(80.0);

            assertThat(score1).isNotEqualTo(score2);
        }
    }
}
