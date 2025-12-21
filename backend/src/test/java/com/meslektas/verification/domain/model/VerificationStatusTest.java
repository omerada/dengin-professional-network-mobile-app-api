package com.dengin.verification.domain.model;

import com.dengin.verification.domain.model.VerificationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * VerificationStatus Enum Unit Tests
 * 
 * State Machine Tests:
 * PENDING → AI_PROCESSING → AUTO_APPROVED/AUTO_REJECTED/PENDING_MANUAL_REVIEW
 * PENDING_MANUAL_REVIEW → APPROVED/REJECTED
 */
@DisplayName("VerificationStatus Enum Tests")
class VerificationStatusTest {

    @Nested
    @DisplayName("Final Status Tests")
    class FinalStatusTests {

        @Test
        @DisplayName("AUTO_APPROVED should be final")
        void autoApprovedShouldBeFinal() {
            assertThat(VerificationStatus.AUTO_APPROVED.isFinal()).isTrue();
        }

        @Test
        @DisplayName("AUTO_REJECTED should be final")
        void autoRejectedShouldBeFinal() {
            assertThat(VerificationStatus.AUTO_REJECTED.isFinal()).isTrue();
        }

        @Test
        @DisplayName("APPROVED should be final")
        void approvedShouldBeFinal() {
            assertThat(VerificationStatus.APPROVED.isFinal()).isTrue();
        }

        @Test
        @DisplayName("REJECTED should be final")
        void rejectedShouldBeFinal() {
            assertThat(VerificationStatus.REJECTED.isFinal()).isTrue();
        }

        @Test
        @DisplayName("EXPIRED should be final")
        void expiredShouldBeFinal() {
            assertThat(VerificationStatus.EXPIRED.isFinal()).isTrue();
        }

        @Test
        @DisplayName("PENDING should not be final")
        void pendingShouldNotBeFinal() {
            assertThat(VerificationStatus.PENDING.isFinal()).isFalse();
        }

        @Test
        @DisplayName("AI_PROCESSING should not be final")
        void aiProcessingShouldNotBeFinal() {
            assertThat(VerificationStatus.AI_PROCESSING.isFinal()).isFalse();
        }

        @Test
        @DisplayName("PENDING_MANUAL_REVIEW should not be final")
        void pendingManualReviewShouldNotBeFinal() {
            assertThat(VerificationStatus.PENDING_MANUAL_REVIEW.isFinal()).isFalse();
        }
    }

    @Nested
    @DisplayName("Manual Review Tests")
    class ManualReviewTests {

        @Test
        @DisplayName("PENDING_MANUAL_REVIEW should need manual review")
        void pendingManualReviewShouldNeedManualReview() {
            assertThat(VerificationStatus.PENDING_MANUAL_REVIEW.needsManualReview()).isTrue();
        }

        @Test
        @DisplayName("PENDING should not need manual review")
        void pendingShouldNotNeedManualReview() {
            assertThat(VerificationStatus.PENDING.needsManualReview()).isFalse();
        }

        @Test
        @DisplayName("AI_PROCESSING should not need manual review")
        void aiProcessingShouldNotNeedManualReview() {
            assertThat(VerificationStatus.AI_PROCESSING.needsManualReview()).isFalse();
        }

        @Test
        @DisplayName("AUTO_APPROVED should not need manual review")
        void autoApprovedShouldNotNeedManualReview() {
            assertThat(VerificationStatus.AUTO_APPROVED.needsManualReview()).isFalse();
        }

        @Test
        @DisplayName("APPROVED should not need manual review")
        void approvedShouldNotNeedManualReview() {
            assertThat(VerificationStatus.APPROVED.needsManualReview()).isFalse();
        }
    }

    @Nested
    @DisplayName("Approved Status Tests")
    class ApprovedStatusTests {

        @Test
        @DisplayName("AUTO_APPROVED should be approved")
        void autoApprovedShouldBeApproved() {
            assertThat(VerificationStatus.AUTO_APPROVED.isApproved()).isTrue();
            assertThat(VerificationStatus.AUTO_APPROVED.isRejected()).isFalse();
        }

        @Test
        @DisplayName("APPROVED should be approved")
        void approvedShouldBeApproved() {
            assertThat(VerificationStatus.APPROVED.isApproved()).isTrue();
            assertThat(VerificationStatus.APPROVED.isRejected()).isFalse();
        }

        @Test
        @DisplayName("PENDING should not be approved")
        void pendingShouldNotBeApproved() {
            assertThat(VerificationStatus.PENDING.isApproved()).isFalse();
        }

        @Test
        @DisplayName("AUTO_REJECTED should not be approved")
        void autoRejectedShouldNotBeApproved() {
            assertThat(VerificationStatus.AUTO_REJECTED.isApproved()).isFalse();
        }

        @Test
        @DisplayName("REJECTED should not be approved")
        void rejectedShouldNotBeApproved() {
            assertThat(VerificationStatus.REJECTED.isApproved()).isFalse();
        }
    }

    @Nested
    @DisplayName("Rejected Status Tests")
    class RejectedStatusTests {

        @Test
        @DisplayName("AUTO_REJECTED should be rejected")
        void autoRejectedShouldBeRejected() {
            assertThat(VerificationStatus.AUTO_REJECTED.isRejected()).isTrue();
            assertThat(VerificationStatus.AUTO_REJECTED.isApproved()).isFalse();
        }

        @Test
        @DisplayName("REJECTED should be rejected")
        void rejectedShouldBeRejected() {
            assertThat(VerificationStatus.REJECTED.isRejected()).isTrue();
            assertThat(VerificationStatus.REJECTED.isApproved()).isFalse();
        }

        @Test
        @DisplayName("PENDING should not be rejected")
        void pendingShouldNotBeRejected() {
            assertThat(VerificationStatus.PENDING.isRejected()).isFalse();
        }

        @Test
        @DisplayName("AUTO_APPROVED should not be rejected")
        void autoApprovedShouldNotBeRejected() {
            assertThat(VerificationStatus.AUTO_APPROVED.isRejected()).isFalse();
        }

        @Test
        @DisplayName("EXPIRED should not be rejected")
        void expiredShouldNotBeRejected() {
            assertThat(VerificationStatus.EXPIRED.isRejected()).isFalse();
        }
    }

    @Nested
    @DisplayName("All Status Values Tests")
    class AllStatusValuesTests {

        @Test
        @DisplayName("Should have 8 status values")
        void shouldHave8StatusValues() {
            VerificationStatus[] statuses = VerificationStatus.values();

            assertThat(statuses).hasSize(8);
        }

        @Test
        @DisplayName("Should contain all expected statuses")
        void shouldContainAllExpectedStatuses() {
            assertThat(VerificationStatus.values())
                    .containsExactlyInAnyOrder(
                            VerificationStatus.PENDING,
                            VerificationStatus.AI_PROCESSING,
                            VerificationStatus.AUTO_APPROVED,
                            VerificationStatus.AUTO_REJECTED,
                            VerificationStatus.PENDING_MANUAL_REVIEW,
                            VerificationStatus.APPROVED,
                            VerificationStatus.REJECTED,
                            VerificationStatus.EXPIRED);
        }
    }
}
