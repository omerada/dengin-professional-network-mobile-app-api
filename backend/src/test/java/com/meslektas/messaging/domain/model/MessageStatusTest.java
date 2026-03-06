package com.dengin.messaging.domain.model;

import com.dengin.messaging.domain.model.MessageStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for MessageStatus Enum
 */
@DisplayName("MessageStatus Tests")
class MessageStatusTest {

    @Nested
    @DisplayName("Status Values")
    class StatusValues {

        @Test
        @DisplayName("Should have all expected status values")
        void shouldHaveAllExpectedStatusValues() {
            assertThat(MessageStatus.values()).containsExactly(
                    MessageStatus.SENDING,
                    MessageStatus.SENT,
                    MessageStatus.DELIVERED,
                    MessageStatus.READ,
                    MessageStatus.FAILED,
                    MessageStatus.DELETED);
        }
    }

    @Nested
    @DisplayName("Can Mark As Read")
    class CanMarkAsRead {

        @Test
        @DisplayName("SENT status can be marked as read")
        void sentStatusCanBeMarkedAsRead() {
            assertThat(MessageStatus.SENT.canMarkAsRead()).isTrue();
        }

        @Test
        @DisplayName("DELIVERED status can be marked as read")
        void deliveredStatusCanBeMarkedAsRead() {
            assertThat(MessageStatus.DELIVERED.canMarkAsRead()).isTrue();
        }

        @Test
        @DisplayName("READ status cannot be marked as read again")
        void readStatusCannotBeMarkedAsReadAgain() {
            assertThat(MessageStatus.READ.canMarkAsRead()).isFalse();
        }

        @Test
        @DisplayName("DELETED status cannot be marked as read")
        void deletedStatusCannotBeMarkedAsRead() {
            assertThat(MessageStatus.DELETED.canMarkAsRead()).isFalse();
        }
    }

    @Nested
    @DisplayName("Visibility")
    class Visibility {

        @Test
        @DisplayName("SENT status is visible")
        void sentStatusIsVisible() {
            assertThat(MessageStatus.SENT.isVisible()).isTrue();
        }

        @Test
        @DisplayName("DELIVERED status is visible")
        void deliveredStatusIsVisible() {
            assertThat(MessageStatus.DELIVERED.isVisible()).isTrue();
        }

        @Test
        @DisplayName("READ status is visible")
        void readStatusIsVisible() {
            assertThat(MessageStatus.READ.isVisible()).isTrue();
        }

        @Test
        @DisplayName("DELETED status is not visible")
        void deletedStatusIsNotVisible() {
            assertThat(MessageStatus.DELETED.isVisible()).isFalse();
        }
    }

    @Nested
    @DisplayName("Is Read")
    class IsRead {

        @Test
        @DisplayName("Only READ status returns true for isRead")
        void onlyReadStatusReturnsTrue() {
            assertThat(MessageStatus.SENT.isRead()).isFalse();
            assertThat(MessageStatus.DELIVERED.isRead()).isFalse();
            assertThat(MessageStatus.READ.isRead()).isTrue();
            assertThat(MessageStatus.DELETED.isRead()).isFalse();
        }
    }
}
