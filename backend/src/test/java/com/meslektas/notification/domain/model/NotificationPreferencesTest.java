package com.dengin.notification.domain.model;

import com.dengin.notification.domain.model.DeliveryChannel;
import com.dengin.notification.domain.model.NotificationPreferences;
import com.dengin.notification.domain.model.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@DisplayName("NotificationPreferences Entity Tests")
class NotificationPreferencesTest {

    private static final Long USER_ID = 1L;

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("should create default preferences with all enabled")
        void shouldCreateDefaultPreferences() {
            // When
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // Then
            assertThat(preferences).isNotNull();
            assertThat(preferences.getUserId()).isEqualTo(USER_ID);
            assertThat(preferences.isPushEnabled()).isTrue();
            assertThat(preferences.isEmailEnabled()).isTrue();
            assertThat(preferences.isNotificationsEnabled()).isTrue();
        }
    }

    @Nested
    @DisplayName("Channel Enable/Disable Tests")
    class ChannelTests {

        @Test
        @DisplayName("should enable push notifications")
        void shouldEnablePush() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setPushEnabled(false);

            // When
            preferences.setPushEnabled(true);

            // Then
            assertThat(preferences.isPushEnabled()).isTrue();
        }

        @Test
        @DisplayName("should disable push notifications")
        void shouldDisablePush() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            preferences.setPushEnabled(false);

            // Then
            assertThat(preferences.isPushEnabled()).isFalse();
        }

        @Test
        @DisplayName("should enable email notifications")
        void shouldEnableEmail() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setEmailEnabled(false);

            // When
            preferences.setEmailEnabled(true);

            // Then
            assertThat(preferences.isEmailEnabled()).isTrue();
        }

        @Test
        @DisplayName("should disable email notifications")
        void shouldDisableEmail() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            preferences.setEmailEnabled(false);

            // Then
            assertThat(preferences.isEmailEnabled()).isFalse();
        }

        @Test
        @DisplayName("should toggle master notifications switch")
        void shouldToggleMasterSwitch() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            preferences.setNotificationsEnabled(false);

            // Then
            assertThat(preferences.isNotificationsEnabled()).isFalse();
        }
    }

    @Nested
    @DisplayName("Type Enable/Disable Tests")
    class TypeTests {

        @Test
        @DisplayName("should disable specific notification type for push")
        void shouldDisableSpecificTypeForPush() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            preferences.disable(NotificationType.POST_LIKED, DeliveryChannel.PUSH);

            // Then
            assertThat(preferences.isEnabled(NotificationType.POST_LIKED, DeliveryChannel.PUSH)).isFalse();
            assertThat(preferences.isEnabled(NotificationType.POST_LIKED, DeliveryChannel.IN_APP)).isTrue();
        }

        @Test
        @DisplayName("should enable specific notification type for push")
        void shouldEnableSpecificTypeForPush() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.disable(NotificationType.POST_LIKED, DeliveryChannel.PUSH);

            // When
            preferences.enable(NotificationType.POST_LIKED, DeliveryChannel.PUSH);

            // Then
            assertThat(preferences.isEnabled(NotificationType.POST_LIKED, DeliveryChannel.PUSH)).isTrue();
        }

        @Test
        @DisplayName("should disable type for email channel")
        void shouldDisableTypeForEmail() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            preferences.disable(NotificationType.NEW_FOLLOWER, DeliveryChannel.EMAIL);

            // Then
            assertThat(preferences.isEnabled(NotificationType.NEW_FOLLOWER, DeliveryChannel.EMAIL)).isFalse();
        }
    }

    @Nested
    @DisplayName("Quiet Hours Tests")
    class QuietHoursTests {

        @Test
        @DisplayName("should set quiet hours")
        void shouldSetQuietHours() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            preferences.setQuietHours(22, 8);

            // Then
            assertThat(preferences.getQuietHoursStart()).isEqualTo(22);
            assertThat(preferences.getQuietHoursEnd()).isEqualTo(8);
        }

        @Test
        @DisplayName("should clear quiet hours")
        void shouldClearQuietHours() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setQuietHours(22, 8);

            // When
            preferences.setQuietHours(null, null);

            // Then
            assertThat(preferences.getQuietHoursStart()).isNull();
            assertThat(preferences.getQuietHoursEnd()).isNull();
        }

        @Test
        @DisplayName("should fail with invalid quiet hours start")
        void shouldFailWithInvalidQuietHoursStart() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // Then
            assertThatThrownBy(() -> preferences.setQuietHours(25, 8))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("should fail with invalid quiet hours end")
        void shouldFailWithInvalidQuietHoursEnd() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // Then
            assertThatThrownBy(() -> preferences.setQuietHours(22, -1))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("should fail with partial quiet hours")
        void shouldFailWithPartialQuietHours() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // Then
            assertThatThrownBy(() -> preferences.setQuietHours(22, null))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Nested
    @DisplayName("Notification Allowed Tests")
    class NotificationAllowedTests {

        @Test
        @DisplayName("should allow notification for push when enabled")
        void shouldAllowPushWhenEnabled() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // Then
            assertThat(preferences.isEnabled(NotificationType.NEW_FOLLOWER, DeliveryChannel.PUSH)).isTrue();
        }

        @Test
        @DisplayName("should not allow notification for push when disabled")
        void shouldNotAllowPushWhenDisabled() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setPushEnabled(false);

            // Then
            assertThat(preferences.isEnabled(NotificationType.NEW_FOLLOWER, DeliveryChannel.PUSH)).isFalse();
        }

        @Test
        @DisplayName("should not allow notification when type is disabled")
        void shouldNotAllowWhenTypeDisabled() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.disable(NotificationType.POST_LIKED, DeliveryChannel.PUSH);

            // Then
            assertThat(preferences.isEnabled(NotificationType.POST_LIKED, DeliveryChannel.PUSH)).isFalse();
        }

        @Test
        @DisplayName("should not allow any notifications when master switch is off")
        void shouldNotAllowWhenMasterSwitchOff() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setNotificationsEnabled(false);

            // Then - optional types should be disabled
            assertThat(preferences.isEnabled(NotificationType.NEW_FOLLOWER, DeliveryChannel.PUSH)).isFalse();
            assertThat(preferences.isEnabled(NotificationType.POST_LIKED, DeliveryChannel.EMAIL)).isFalse();
        }
    }

    @Nested
    @DisplayName("Get Enabled Channels Tests")
    class GetEnabledChannelsTests {

        @Test
        @DisplayName("should return all channels when all enabled")
        void shouldReturnAllChannelsWhenAllEnabled() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);

            // When
            Set<DeliveryChannel> channels = preferences.getEnabledChannels(NotificationType.NEW_FOLLOWER);

            // Then
            assertThat(channels).containsExactlyInAnyOrder(
                    DeliveryChannel.IN_APP,
                    DeliveryChannel.PUSH,
                    DeliveryChannel.EMAIL);
        }

        @Test
        @DisplayName("should exclude disabled channel")
        void shouldExcludeDisabledChannel() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setPushEnabled(false);

            // When
            Set<DeliveryChannel> channels = preferences.getEnabledChannels(NotificationType.NEW_FOLLOWER);

            // Then
            assertThat(channels).containsExactlyInAnyOrder(
                    DeliveryChannel.IN_APP,
                    DeliveryChannel.EMAIL);
        }
    }

    @Nested
    @DisplayName("Reset Tests")
    class ResetTests {

        @Test
        @DisplayName("should reset to defaults")
        void shouldResetToDefaults() {
            // Given
            NotificationPreferences preferences = NotificationPreferences.createDefault(USER_ID);
            preferences.setPushEnabled(false);
            preferences.setEmailEnabled(false);
            preferences.setQuietHours(22, 8);
            preferences.disable(NotificationType.POST_LIKED, DeliveryChannel.IN_APP);

            // When
            preferences.resetToDefaults();

            // Then
            assertThat(preferences.isPushEnabled()).isTrue();
            assertThat(preferences.isEmailEnabled()).isTrue();
            assertThat(preferences.isNotificationsEnabled()).isTrue();
            assertThat(preferences.getQuietHoursStart()).isNull();
            assertThat(preferences.getQuietHoursEnd()).isNull();
            assertThat(preferences.isEnabled(NotificationType.POST_LIKED, DeliveryChannel.IN_APP)).isTrue();
        }
    }
}
