package com.dengin.moderation.domain.model;

import com.dengin.moderation.domain.model.ReportReason;
import com.dengin.moderation.domain.model.SanctionType;
import com.dengin.moderation.domain.model.UserSanction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for UserSanction entity.
 */
@DisplayName("UserSanction Tests")
class UserSanctionTest {

    private static final Long USER_ID = 1L;
    private static final Long MODERATOR_ID = 2L;
    private static final Long LIFT_MODERATOR_ID = 3L;
    private static final UUID REPORT_ID = UUID.randomUUID();

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("Should apply warning sanction")
        void shouldApplyWarningSanction() {
            // When
            UserSanction sanction = UserSanction.warning(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "First warning for spam");

            // Then
            assertThat(sanction).isNotNull();
            assertThat(sanction.getId()).isNotNull();
            assertThat(sanction.getUserId()).isEqualTo(USER_ID);
            assertThat(sanction.getSanctionType()).isEqualTo(SanctionType.WARNING);
            assertThat(sanction.getReason()).isEqualTo(ReportReason.SPAM);
            assertThat(sanction.getReportId()).isEqualTo(REPORT_ID);
            assertThat(sanction.getModeratorId()).isEqualTo(MODERATOR_ID);
            assertThat(sanction.getNotes()).isEqualTo("First warning for spam");
            assertThat(sanction.isActive()).isTrue();
            assertThat(sanction.getExpiresAt()).isNull(); // Warnings don't expire
            assertThat(sanction.getCreatedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should apply 7-day suspension")
        void shouldApply7DaySuspension() {
            // When
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.HARASSMENT,
                    REPORT_ID,
                    MODERATOR_ID,
                    "7-day suspension for harassment");

            // Then
            assertThat(sanction.getSanctionType()).isEqualTo(SanctionType.SUSPENSION_7_DAYS);
            assertThat(sanction.isActive()).isTrue();
            assertThat(sanction.getExpiresAt()).isNotNull();
            assertThat(sanction.getExpiresAt()).isAfter(LocalDateTime.now());
            assertThat(sanction.getExpiresAt()).isBefore(LocalDateTime.now().plusDays(8));
        }

        @Test
        @DisplayName("Should apply 30-day suspension")
        void shouldApply30DaySuspension() {
            // When
            UserSanction sanction = UserSanction.suspend30Days(
                    USER_ID,
                    ReportReason.HATE_SPEECH,
                    REPORT_ID,
                    MODERATOR_ID,
                    "30-day suspension for hate speech");

            // Then
            assertThat(sanction.getSanctionType()).isEqualTo(SanctionType.SUSPENSION_30_DAYS);
            assertThat(sanction.getExpiresAt()).isNotNull();
            assertThat(sanction.getExpiresAt()).isAfter(LocalDateTime.now().plusDays(29));
            assertThat(sanction.getExpiresAt()).isBefore(LocalDateTime.now().plusDays(31));
        }

        @Test
        @DisplayName("Should apply permanent ban")
        void shouldApplyPermanentBan() {
            // When
            UserSanction sanction = UserSanction.permanentBan(
                    USER_ID,
                    ReportReason.VIOLENCE,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Permanent ban for violence");

            // Then
            assertThat(sanction.getSanctionType()).isEqualTo(SanctionType.PERMANENT_BAN);
            assertThat(sanction.isActive()).isTrue();
            assertThat(sanction.getExpiresAt()).isNull(); // Permanent bans don't expire
        }

        @Test
        @DisplayName("Should apply generic sanction with custom type")
        void shouldApplyGenericSanction() {
            // When
            UserSanction sanction = UserSanction.apply(
                    USER_ID,
                    SanctionType.SUSPENSION_7_DAYS,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Custom sanction");

            // Then
            assertThat(sanction.getSanctionType()).isEqualTo(SanctionType.SUSPENSION_7_DAYS);
            assertThat(sanction.getUserId()).isEqualTo(USER_ID);
        }

        @Test
        @DisplayName("Should throw exception for null user ID")
        void shouldThrowExceptionForNullUserId() {
            assertThatThrownBy(() -> UserSanction.warning(
                    null,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Notes")).isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should throw exception for null sanction type")
        void shouldThrowExceptionForNullSanctionType() {
            assertThatThrownBy(() -> UserSanction.apply(
                    USER_ID,
                    null,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Notes")).isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should throw exception for null reason")
        void shouldThrowExceptionForNullReason() {
            assertThatThrownBy(() -> UserSanction.warning(
                    USER_ID,
                    null,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Notes")).isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Should throw exception for null moderator ID")
        void shouldThrowExceptionForNullModeratorId() {
            assertThatThrownBy(() -> UserSanction.warning(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    null,
                    "Notes")).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Lift Tests")
    class LiftTests {

        @Test
        @DisplayName("Should lift active sanction")
        void shouldLiftActiveSanction() {
            // Given
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Suspended");

            // When
            sanction.lift(LIFT_MODERATOR_ID, "Appeal approved");

            // Then
            assertThat(sanction.isActive()).isFalse();
            assertThat(sanction.getLiftedAt()).isNotNull();
            assertThat(sanction.getLiftedBy()).isEqualTo(LIFT_MODERATOR_ID);
            assertThat(sanction.getLiftReason()).isEqualTo("Appeal approved");
        }

        @Test
        @DisplayName("Should throw exception when lifting inactive sanction")
        void shouldThrowExceptionWhenLiftingInactiveSanction() {
            // Given
            UserSanction sanction = UserSanction.warning(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Warning");
            sanction.lift(LIFT_MODERATOR_ID, "First lift");

            // When/Then
            assertThatThrownBy(() -> sanction.lift(LIFT_MODERATOR_ID, "Second lift"))
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("Should throw exception for null lifted by ID")
        void shouldThrowExceptionForNullLiftedById() {
            // Given
            UserSanction sanction = UserSanction.warning(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Warning");

            // When/Then
            assertThatThrownBy(() -> sanction.lift(null, "Reason"))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Expiration Tests")
    class ExpirationTests {

        @Test
        @DisplayName("Should correctly identify non-expired suspension")
        void shouldCorrectlyIdentifyNonExpiredSuspension() {
            // Given
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Suspended");

            // When/Then
            assertThat(sanction.isExpired()).isFalse();
            assertThat(sanction.isInEffect()).isTrue();
        }

        @Test
        @DisplayName("Should correctly identify permanent ban as non-expiring")
        void shouldCorrectlyIdentifyPermanentBanAsNonExpiring() {
            // Given
            UserSanction sanction = UserSanction.permanentBan(
                    USER_ID,
                    ReportReason.VIOLENCE,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Banned");

            // When/Then
            assertThat(sanction.isExpired()).isFalse();
            assertThat(sanction.isInEffect()).isTrue();
        }

        @Test
        @DisplayName("Should correctly identify warning as non-expiring")
        void shouldCorrectlyIdentifyWarningAsNonExpiring() {
            // Given
            UserSanction sanction = UserSanction.warning(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Warning");

            // When/Then
            assertThat(sanction.isExpired()).isFalse();
        }

        @Test
        @DisplayName("Should return correct remaining days for active suspension")
        void shouldReturnCorrectRemainingDaysForActiveSuspension() {
            // Given
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Suspended");

            // When
            long remainingDays = sanction.getRemainingDays();

            // Then
            assertThat(remainingDays).isGreaterThanOrEqualTo(6);
            assertThat(remainingDays).isLessThanOrEqualTo(7);
        }

        @Test
        @DisplayName("Should return -1 for permanent ban remaining days")
        void shouldReturnNegativeOneForPermanentBanRemainingDays() {
            // Given
            UserSanction sanction = UserSanction.permanentBan(
                    USER_ID,
                    ReportReason.VIOLENCE,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Banned");

            // When
            long remainingDays = sanction.getRemainingDays();

            // Then
            assertThat(remainingDays).isEqualTo(-1);
        }

        @Test
        @DisplayName("Should return 0 for lifted sanction remaining days")
        void shouldReturnZeroForLiftedSanctionRemainingDays() {
            // Given
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Suspended");
            sanction.lift(LIFT_MODERATOR_ID, "Lifted");

            // When
            long remainingDays = sanction.getRemainingDays();

            // Then
            assertThat(remainingDays).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("SanctionType Tests")
    class SanctionTypeTests {

        @Test
        @DisplayName("Should correctly identify suspension types")
        void shouldCorrectlyIdentifySuspensionTypes() {
            assertThat(SanctionType.WARNING.isSuspension()).isFalse();
            assertThat(SanctionType.SUSPENSION_7_DAYS.isSuspension()).isTrue();
            assertThat(SanctionType.SUSPENSION_30_DAYS.isSuspension()).isTrue();
            assertThat(SanctionType.PERMANENT_BAN.isSuspension()).isFalse();
        }

        @Test
        @DisplayName("Should correctly identify permanent types")
        void shouldCorrectlyIdentifyPermanentTypes() {
            assertThat(SanctionType.WARNING.isPermanent()).isFalse();
            assertThat(SanctionType.SUSPENSION_7_DAYS.isPermanent()).isFalse();
            assertThat(SanctionType.SUSPENSION_30_DAYS.isPermanent()).isFalse();
            assertThat(SanctionType.PERMANENT_BAN.isPermanent()).isTrue();
        }

        @Test
        @DisplayName("Should return correct duration days")
        void shouldReturnCorrectDurationDays() {
            assertThat(SanctionType.WARNING.getDurationDays()).isEqualTo(0);
            assertThat(SanctionType.SUSPENSION_7_DAYS.getDurationDays()).isEqualTo(7);
            assertThat(SanctionType.SUSPENSION_30_DAYS.getDurationDays()).isEqualTo(30);
            assertThat(SanctionType.PERMANENT_BAN.getDurationDays()).isEqualTo(-1);
        }
    }

    @Nested
    @DisplayName("In Effect Tests")
    class InEffectTests {

        @Test
        @DisplayName("Should be in effect when active and not expired")
        void shouldBeInEffectWhenActiveAndNotExpired() {
            // Given
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Suspended");

            // When/Then
            assertThat(sanction.isInEffect()).isTrue();
        }

        @Test
        @DisplayName("Should not be in effect when lifted")
        void shouldNotBeInEffectWhenLifted() {
            // Given
            UserSanction sanction = UserSanction.suspend7Days(
                    USER_ID,
                    ReportReason.SPAM,
                    REPORT_ID,
                    MODERATOR_ID,
                    "Suspended");
            sanction.lift(LIFT_MODERATOR_ID, "Lifted");

            // When/Then
            assertThat(sanction.isInEffect()).isFalse();
        }
    }
}
