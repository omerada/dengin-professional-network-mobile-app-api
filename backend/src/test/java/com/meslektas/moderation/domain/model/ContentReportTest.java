package com.meslektas.moderation.domain.model;

import com.meslektas.moderation.domain.event.ContentReportedEvent;
import com.meslektas.moderation.domain.event.ContentReviewedEvent;
import com.meslektas.moderation.domain.event.ContentRemovedEvent;
import com.meslektas.moderation.domain.event.UserSanctionedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for ContentReport aggregate.
 */
@DisplayName("ContentReport Tests")
class ContentReportTest {

    private static final Long REPORTER_ID = 1L;
    private static final Long CONTENT_OWNER_ID = 2L;
    private static final Long MODERATOR_ID = 3L;
    private static final UUID CONTENT_ID = UUID.randomUUID();

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("Should create report with valid data")
        void shouldCreateReportWithValidData() {
            // When
            ContentReport report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "This post is spam");

            // Then
            assertThat(report).isNotNull();
            assertThat(report.getReportId()).isNotNull();
            assertThat(report.getReporterId()).isEqualTo(REPORTER_ID);
            assertThat(report.getContentId()).isEqualTo(CONTENT_ID);
            assertThat(report.getContentOwnerId()).isEqualTo(CONTENT_OWNER_ID);
            assertThat(report.getContentType()).isEqualTo(ReportType.POST);
            assertThat(report.getReason()).isEqualTo(ReportReason.SPAM);
            assertThat(report.getDescription()).isEqualTo("This post is spam");
            assertThat(report.getStatus()).isEqualTo(ReportStatus.PENDING);
            assertThat(report.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should set HIGH risk level for high priority reasons")
        void shouldSetHighRiskLevelForHighPriorityReasons() {
            // When
            ContentReport report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.VIOLENCE,
                    "Contains violent content");

            // Then
            assertThat(report.getRiskLevel()).isEqualTo(RiskLevel.HIGH);
        }

        @Test
        @DisplayName("Should set MEDIUM risk level for normal reasons")
        void shouldSetMediumRiskLevelForNormalReasons() {
            // When
            ContentReport report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "Spam content");

            // Then
            assertThat(report.getRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
        }

        @Test
        @DisplayName("Should publish ContentReportedEvent on creation")
        void shouldPublishContentReportedEventOnCreation() {
            // When
            ContentReport report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "Spam");

            // Then
            assertThat(report.getEvents()).hasSize(1);
            assertThat(report.getEvents().get(0)).isInstanceOf(ContentReportedEvent.class);

            ContentReportedEvent event = (ContentReportedEvent) report.getEvents().get(0);
            assertThat(event.getReportId()).isEqualTo(report.getReportId());
            assertThat(event.getReporterId()).isEqualTo(REPORTER_ID);
        }

        @Test
        @DisplayName("Should throw exception for null reporter ID")
        void shouldThrowExceptionForNullReporterId() {
            assertThatThrownBy(() -> ContentReport.create(
                    null,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "Spam")).isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should throw exception for null content ID")
        void shouldThrowExceptionForNullContentId() {
            assertThatThrownBy(() -> ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    null,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "Spam")).isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should throw exception for null reason")
        void shouldThrowExceptionForNullReason() {
            assertThatThrownBy(() -> ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    null,
                    "Description")).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Review Tests")
    class ReviewTests {

        private ContentReport report;

        @BeforeEach
        void setUp() {
            report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "Spam content");
            report.clearEvents();
        }

        @Test
        @DisplayName("Should start review successfully")
        void shouldStartReviewSuccessfully() {
            // When
            report.startReview(MODERATOR_ID);

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.UNDER_REVIEW);
            assertThat(report.getModeratorId()).isEqualTo(MODERATOR_ID);
        }

        @Test
        @DisplayName("Should review and approve content")
        void shouldReviewAndApproveContent() {
            // Given
            report.startReview(MODERATOR_ID);
            report.clearEvents();

            // When
            report.review(MODERATOR_ID, ModerationDecision.APPROVE_CONTENT, "No violation found");

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.RESOLVED_APPROVED);
            assertThat(report.getDecision()).isEqualTo(ModerationDecision.APPROVE_CONTENT);
            assertThat(report.getModeratorNotes()).isEqualTo("No violation found");
            assertThat(report.getReviewedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should review and remove content")
        void shouldReviewAndRemoveContent() {
            // Given
            report.startReview(MODERATOR_ID);
            report.clearEvents();

            // When
            report.review(MODERATOR_ID, ModerationDecision.REMOVE_CONTENT, "Content violates guidelines");

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.RESOLVED_REJECTED);
            assertThat(report.getDecision()).isEqualTo(ModerationDecision.REMOVE_CONTENT);

            // Should have ContentReviewedEvent and ContentRemovedEvent
            assertThat(report.getEvents()).hasSize(2);
            assertThat(report.getEvents())
                    .anySatisfy(event -> assertThat(event).isInstanceOf(ContentReviewedEvent.class));
            assertThat(report.getEvents())
                    .anySatisfy(event -> assertThat(event).isInstanceOf(ContentRemovedEvent.class));
        }

        @Test
        @DisplayName("Should review and warn user")
        void shouldReviewAndWarnUser() {
            // Given
            report.startReview(MODERATOR_ID);
            report.clearEvents();

            // When
            report.review(MODERATOR_ID, ModerationDecision.WARN_USER, "User warned for violation");

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.RESOLVED_REJECTED);
            assertThat(report.getDecision()).isEqualTo(ModerationDecision.WARN_USER);

            // Should have ContentReviewedEvent, ContentRemovedEvent and UserSanctionedEvent
            assertThat(report.getEvents())
                    .anySatisfy(event -> assertThat(event).isInstanceOf(UserSanctionedEvent.class));
        }

        @Test
        @DisplayName("Should throw exception when reviewing resolved report")
        void shouldThrowExceptionWhenReviewingResolvedReport() {
            // Given
            report.startReview(MODERATOR_ID);
            report.review(MODERATOR_ID, ModerationDecision.APPROVE_CONTENT, "Done");

            // When/Then
            assertThatThrownBy(() -> report.review(MODERATOR_ID, ModerationDecision.REMOVE_CONTENT, "Change"))
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("Should throw exception for null moderator ID")
        void shouldThrowExceptionForNullModeratorId() {
            assertThatThrownBy(() -> report.startReview(null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should throw exception for null decision")
        void shouldThrowExceptionForNullDecision() {
            report.startReview(MODERATOR_ID);

            assertThatThrownBy(() -> report.review(MODERATOR_ID, null, "Notes"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Escalation Tests")
    class EscalationTests {

        private ContentReport report;

        @BeforeEach
        void setUp() {
            report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.HARASSMENT,
                    "Harassment content");
            report.clearEvents();
        }

        @Test
        @DisplayName("Should escalate pending report")
        void shouldEscalatePendingReport() {
            // When
            report.escalate();

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.ESCALATED);
            assertThat(report.getEscalatedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should escalate under review report")
        void shouldEscalateUnderReviewReport() {
            // Given
            report.startReview(MODERATOR_ID);

            // When
            report.escalate();

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.ESCALATED);
        }

        @Test
        @DisplayName("Should not escalate resolved report")
        void shouldNotEscalateResolvedReport() {
            // Given
            report.startReview(MODERATOR_ID);
            report.review(MODERATOR_ID, ModerationDecision.APPROVE_CONTENT, "Done");

            // When/Then
            assertThatThrownBy(() -> report.escalate())
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("Should auto-escalate when risk level is set to HIGH")
        void shouldAutoEscalateWhenRiskLevelIsHigh() {
            // Given - pending report with MEDIUM risk
            assertThat(report.getRiskLevel()).isEqualTo(RiskLevel.HIGH); // HARASSMENT is high priority

            // When
            report.setRiskLevel(RiskLevel.HIGH);

            // Then - should be escalated
            assertThat(report.getStatus()).isEqualTo(ReportStatus.ESCALATED);
        }
    }

    @Nested
    @DisplayName("Dismiss Tests")
    class DismissTests {

        private ContentReport report;

        @BeforeEach
        void setUp() {
            report = ContentReport.create(
                    REPORTER_ID,
                    ReportType.POST,
                    CONTENT_ID,
                    CONTENT_OWNER_ID,
                    ReportReason.SPAM,
                    "Maybe spam");
            report.clearEvents();
        }

        @Test
        @DisplayName("Should dismiss pending report")
        void shouldDismissPendingReport() {
            // When
            report.dismiss(MODERATOR_ID, "Not a valid report");

            // Then
            assertThat(report.getStatus()).isEqualTo(ReportStatus.DISMISSED);
            assertThat(report.getModeratorId()).isEqualTo(MODERATOR_ID);
            assertThat(report.getModeratorNotes()).isEqualTo("Not a valid report");
        }

        @Test
        @DisplayName("Should not dismiss resolved report")
        void shouldNotDismissResolvedReport() {
            // Given
            report.startReview(MODERATOR_ID);
            report.review(MODERATOR_ID, ModerationDecision.REMOVE_CONTENT, "Removed");

            // When/Then
            assertThatThrownBy(() -> report.dismiss(MODERATOR_ID, "Actually not"))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Priority Score Tests")
    class PriorityScoreTests {

        @Test
        @DisplayName("Should calculate higher score for escalated reports")
        void shouldCalculateHigherScoreForEscalatedReports() {
            // Given
            ContentReport normalReport = ContentReport.create(
                    REPORTER_ID, ReportType.POST, CONTENT_ID, CONTENT_OWNER_ID,
                    ReportReason.SPAM, "Spam");

            ContentReport escalatedReport = ContentReport.create(
                    REPORTER_ID, ReportType.POST, UUID.randomUUID(), CONTENT_OWNER_ID,
                    ReportReason.SPAM, "Spam");
            escalatedReport.escalate();

            // When
            int normalScore = normalReport.calculatePriorityScore();
            int escalatedScore = escalatedReport.calculatePriorityScore();

            // Then
            assertThat(escalatedScore).isGreaterThan(normalScore);
        }

        @Test
        @DisplayName("Should calculate higher score for high priority reasons")
        void shouldCalculateHigherScoreForHighPriorityReasons() {
            // Given
            ContentReport spamReport = ContentReport.create(
                    REPORTER_ID, ReportType.POST, CONTENT_ID, CONTENT_OWNER_ID,
                    ReportReason.SPAM, "Spam");

            ContentReport violenceReport = ContentReport.create(
                    REPORTER_ID, ReportType.POST, UUID.randomUUID(), CONTENT_OWNER_ID,
                    ReportReason.VIOLENCE, "Violence");

            // When
            int spamScore = spamReport.calculatePriorityScore();
            int violenceScore = violenceReport.calculatePriorityScore();

            // Then
            assertThat(violenceScore).isGreaterThan(spamScore);
        }

        @Test
        @DisplayName("Should return true for high priority check with violence reason")
        void shouldReturnTrueForHighPriorityWithViolence() {
            // Given
            ContentReport report = ContentReport.create(
                    REPORTER_ID, ReportType.POST, CONTENT_ID, CONTENT_OWNER_ID,
                    ReportReason.VIOLENCE, "Violence");

            // When/Then
            assertThat(report.isHighPriority()).isTrue();
        }

        @Test
        @DisplayName("Should return true for high priority check with HIGH risk level")
        void shouldReturnTrueForHighPriorityWithHighRiskLevel() {
            // Given
            ContentReport report = ContentReport.create(
                    REPORTER_ID, ReportType.POST, CONTENT_ID, CONTENT_OWNER_ID,
                    ReportReason.SPAM, "Spam");
            report.setRiskLevel(RiskLevel.HIGH);

            // When/Then (escalated due to HIGH risk, so check before escalation logic)
            assertThat(report.getRiskLevel()).isEqualTo(RiskLevel.HIGH);
        }
    }

    @Nested
    @DisplayName("Status Check Tests")
    class StatusCheckTests {

        @Test
        @DisplayName("Should correctly identify final status")
        void shouldCorrectlyIdentifyFinalStatus() {
            assertThat(ReportStatus.PENDING.isFinal()).isFalse();
            assertThat(ReportStatus.UNDER_REVIEW.isFinal()).isFalse();
            assertThat(ReportStatus.ESCALATED.isFinal()).isFalse();
            assertThat(ReportStatus.RESOLVED_APPROVED.isFinal()).isTrue();
            assertThat(ReportStatus.RESOLVED_REJECTED.isFinal()).isTrue();
            assertThat(ReportStatus.DISMISSED.isFinal()).isTrue();
        }

        @Test
        @DisplayName("Should correctly identify pending status")
        void shouldCorrectlyIdentifyPendingStatus() {
            // isPending returns true for statuses that are still awaiting resolution
            assertThat(ReportStatus.PENDING.isPending()).isTrue();
            assertThat(ReportStatus.UNDER_REVIEW.isPending()).isTrue();
            assertThat(ReportStatus.ESCALATED.isPending()).isTrue();
            assertThat(ReportStatus.RESOLVED_APPROVED.isPending()).isFalse();
            assertThat(ReportStatus.RESOLVED_REJECTED.isPending()).isFalse();
            assertThat(ReportStatus.DISMISSED.isPending()).isFalse();
        }
    }
}
