package com.meslektas.notification.domain.model;

import com.meslektas.notification.domain.event.NotificationCreatedEvent;
import com.meslektas.notification.domain.event.NotificationDeliveredEvent;
import com.meslektas.notification.domain.event.NotificationReadEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Notification Entity Tests")
class NotificationTest {

    private static final Long RECIPIENT_ID = 1L;

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {

        @Test
        @DisplayName("should create notification with valid data")
        void shouldCreateNotificationWithValidData() {
            // Given
            NotificationContent content = NotificationContent.of(
                    "Yeni Takipçi",
                    "Ahmet sizi takip etmeye başladı",
                    "/users/2");
            NotificationMetadata metadata = NotificationMetadata.of("followerId", "2");

            // When
            Notification notification = Notification.create(
                    RECIPIENT_ID,
                    NotificationType.NEW_FOLLOWER,
                    content,
                    metadata);

            // Then
            assertThat(notification).isNotNull();
            assertThat(notification.getNotificationId()).isNotNull();
            assertThat(notification.getRecipientId()).isEqualTo(RECIPIENT_ID);
            assertThat(notification.getType()).isEqualTo(NotificationType.NEW_FOLLOWER);
            assertThat(notification.getContent().getTitle()).isEqualTo("Yeni Takipçi");
            assertThat(notification.getContent().getBody()).isEqualTo("Ahmet sizi takip etmeye başladı");
            assertThat(notification.getStatus()).isEqualTo(NotificationStatus.PENDING);
            assertThat(notification.isRead()).isFalse();
        }

        @Test
        @DisplayName("should create notification with null metadata")
        void shouldCreateNotificationWithNullMetadata() {
            // Given
            NotificationContent content = NotificationContent.of(
                    "Doğrulama Onaylandı",
                    "Hesabınız doğrulandı",
                    "/profile");

            // When
            Notification notification = Notification.create(
                    RECIPIENT_ID,
                    NotificationType.VERIFICATION_APPROVED,
                    content,
                    null);

            // Then
            assertThat(notification.getMetadata()).isNotNull();
            assertThat(notification.getType()).isEqualTo(NotificationType.VERIFICATION_APPROVED);
        }

        @Test
        @DisplayName("should raise NotificationCreatedEvent on creation")
        void shouldRaiseNotificationCreatedEvent() {
            // Given
            NotificationContent content = NotificationContent.of(
                    "Beğeni",
                    "Paylaşımınız beğenildi",
                    "/posts/1");

            // When
            Notification notification = Notification.create(
                    RECIPIENT_ID,
                    NotificationType.POST_LIKED,
                    content,
                    null);

            // Then
            assertThat(notification.getEvents())
                    .hasSize(1)
                    .first()
                    .isInstanceOf(NotificationCreatedEvent.class);

            NotificationCreatedEvent event = (NotificationCreatedEvent) notification.getEvents().get(0);
            assertThat(event.getRecipientId()).isEqualTo(RECIPIENT_ID);
            assertThat(event.getType()).isEqualTo(NotificationType.POST_LIKED);
        }

        @Test
        @DisplayName("should fail with null recipient ID")
        void shouldFailWithNullRecipientId() {
            NotificationContent content = NotificationContent.of("Title", "Body", "/url");

            assertThatThrownBy(() -> Notification.create(
                    null, NotificationType.NEW_FOLLOWER, content, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Recipient ID");
        }

        @Test
        @DisplayName("should fail with null content")
        void shouldFailWithNullContent() {
            assertThatThrownBy(() -> Notification.create(
                    RECIPIENT_ID, NotificationType.NEW_FOLLOWER, null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("content");
        }
    }

    @Nested
    @DisplayName("Status Transition Tests")
    class StatusTransitionTests {

        @Test
        @DisplayName("should record delivery to channel")
        void shouldRecordDelivery() {
            // Given
            Notification notification = createTestNotification();
            notification.clearEvents();

            // When
            notification.recordDelivery(DeliveryChannel.IN_APP);

            // Then
            assertThat(notification.getStatus()).isEqualTo(NotificationStatus.DELIVERED);
            assertThat(notification.getDeliveredChannels()).contains(DeliveryChannel.IN_APP);
        }

        @Test
        @DisplayName("should raise NotificationDeliveredEvent on delivery")
        void shouldRaiseDeliveredEvent() {
            // Given
            Notification notification = createTestNotification();
            notification.clearEvents();

            // When
            notification.recordDelivery(DeliveryChannel.PUSH);

            // Then
            assertThat(notification.getEvents())
                    .hasSize(1)
                    .first()
                    .isInstanceOf(NotificationDeliveredEvent.class);

            NotificationDeliveredEvent event = (NotificationDeliveredEvent) notification.getEvents().get(0);
            assertThat(event.getChannel()).isEqualTo(DeliveryChannel.PUSH);
        }

        @Test
        @DisplayName("should mark notification as read")
        void shouldMarkAsRead() {
            // Given
            Notification notification = createTestNotification();
            notification.recordDelivery(DeliveryChannel.IN_APP);
            notification.clearEvents();

            // When
            notification.markAsRead();

            // Then
            assertThat(notification.getStatus()).isEqualTo(NotificationStatus.READ);
            assertThat(notification.isRead()).isTrue();
            assertThat(notification.getReadAt()).isNotNull();
        }

        @Test
        @DisplayName("should raise NotificationReadEvent on read")
        void shouldRaiseReadEvent() {
            // Given
            Notification notification = createTestNotification();
            notification.recordDelivery(DeliveryChannel.IN_APP);
            notification.clearEvents();

            // When
            notification.markAsRead();

            // Then
            assertThat(notification.getEvents())
                    .hasSize(1)
                    .first()
                    .isInstanceOf(NotificationReadEvent.class);
        }

        @Test
        @DisplayName("should mark as failed")
        void shouldMarkAsFailed() {
            // Given
            Notification notification = createTestNotification();
            notification.clearEvents();

            // When
            notification.markAsFailed();

            // Then
            assertThat(notification.getStatus()).isEqualTo(NotificationStatus.FAILED);
        }

        @Test
        @DisplayName("should not mark already read notification as read again")
        void shouldNotMarkAlreadyReadNotificationAsReadAgain() {
            // Given
            Notification notification = createTestNotification();
            notification.recordDelivery(DeliveryChannel.IN_APP);
            notification.markAsRead();
            notification.clearEvents();

            // When
            notification.markAsRead();

            // Then
            assertThat(notification.getEvents()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Delivery Channel Tests")
    class DeliveryChannelTests {

        @Test
        @DisplayName("should add multiple delivery channels")
        void shouldAddMultipleDeliveryChannels() {
            // Given
            Notification notification = createTestNotification();

            // When
            notification.recordDelivery(DeliveryChannel.IN_APP);
            notification.recordDelivery(DeliveryChannel.PUSH);
            notification.recordDelivery(DeliveryChannel.EMAIL);

            // Then
            assertThat(notification.getDeliveredChannels())
                    .hasSize(3)
                    .containsExactlyInAnyOrder(
                            DeliveryChannel.IN_APP,
                            DeliveryChannel.PUSH,
                            DeliveryChannel.EMAIL);
        }

        @Test
        @DisplayName("should check if delivered to specific channel")
        void shouldCheckIfDeliveredToChannel() {
            // Given
            Notification notification = createTestNotification();
            notification.recordDelivery(DeliveryChannel.IN_APP);

            // Then
            assertThat(notification.wasDeliveredVia(DeliveryChannel.IN_APP)).isTrue();
            assertThat(notification.wasDeliveredVia(DeliveryChannel.PUSH)).isFalse();
        }
    }

    @Nested
    @DisplayName("Query Methods Tests")
    class QueryMethodsTests {

        @Test
        @DisplayName("should return correct read status")
        void shouldReturnCorrectReadStatus() {
            // Given
            Notification notification = createTestNotification();

            // Initially unread
            assertThat(notification.isUnread()).isTrue();
            assertThat(notification.isRead()).isFalse();

            // After marking as read
            notification.recordDelivery(DeliveryChannel.IN_APP);
            notification.markAsRead();
            assertThat(notification.isRead()).isTrue();
            assertThat(notification.isUnread()).isFalse();
        }

        @Test
        @DisplayName("should return relative time")
        void shouldReturnRelativeTime() {
            // Given
            Notification notification = createTestNotification();

            // Then
            String relativeTime = notification.getRelativeTime();
            assertThat(relativeTime).isNotBlank();
            assertThat(relativeTime).isEqualTo("Az önce");
        }

        @Test
        @DisplayName("should return notification UUID")
        void shouldReturnNotificationUUID() {
            // Given
            Notification notification = createTestNotification();

            // Then
            assertThat(notification.getNotificationUUID()).isNotNull();
            assertThat(notification.getNotificationUUID())
                    .isEqualTo(notification.getNotificationId().getValue());
        }
    }

    // ==================== Helper Methods ====================

    private Notification createTestNotification() {
        NotificationContent content = NotificationContent.of(
                "Yeni Takipçi",
                "Ahmet sizi takip etmeye başladı",
                "/users/2");

        return Notification.create(
                RECIPIENT_ID,
                NotificationType.NEW_FOLLOWER,
                content,
                null);
    }
}
