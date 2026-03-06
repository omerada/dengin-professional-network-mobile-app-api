package com.dengin.messaging.domain.model;

import com.dengin.messaging.domain.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for Message Entity
 */
@DisplayName("Message Tests")
class MessageTest {

    private static final ConversationId CONVERSATION_ID = ConversationId.generate();
    private static final Long SENDER_ID = 100L;
    private static final Long RECIPIENT_ID = 200L;

    @Nested
    @DisplayName("Creation")
    class Creation {

        @Test
        @DisplayName("Should create message with content only")
        void shouldCreateMessageWithContentOnly() {
            MessageContent content = MessageContent.of("Merhaba!");

            Message message = Message.create(CONVERSATION_ID, SENDER_ID, content);

            assertThat(message).isNotNull();
            assertThat(message.getMessageId()).isNotNull();
            assertThat(message.getConversationId()).isEqualTo(CONVERSATION_ID);
            assertThat(message.getSenderId()).isEqualTo(SENDER_ID);
            assertThat(message.getContent()).isEqualTo(content);
            assertThat(message.getAttachment()).isNull();
            assertThat(message.getStatus()).isEqualTo(MessageStatus.SENT);
            assertThat(message.getReadAt()).isNull();
            assertThat(message.getDeletedAt()).isNull();
        }

        @Test
        @DisplayName("Should create message with attachment")
        void shouldCreateMessageWithAttachment() {
            MessageContent content = MessageContent.of("Fotoğraf gönderiyorum");
            MessageAttachment attachment = MessageAttachment.of(
                    "messages/photo.jpg",
                    "https://s3.amazonaws.com/bucket/messages/photo.jpg",
                    "image/jpeg",
                    1024L,
                    "photo.jpg");

            Message message = Message.create(CONVERSATION_ID, SENDER_ID, content, attachment);

            assertThat(message.hasAttachment()).isTrue();
            assertThat(message.getAttachment()).isEqualTo(attachment);
        }

        @Test
        @DisplayName("Should generate unique message IDs")
        void shouldGenerateUniqueMessageIds() {
            MessageContent content = MessageContent.of("Test");

            Message message1 = Message.create(CONVERSATION_ID, SENDER_ID, content);
            Message message2 = Message.create(CONVERSATION_ID, SENDER_ID, content);

            assertThat(message1.getMessageId()).isNotEqualTo(message2.getMessageId());
        }
    }

    @Nested
    @DisplayName("Validation")
    class Validation {

        @Test
        @DisplayName("Should throw exception for null conversation ID")
        void shouldThrowExceptionForNullConversationId() {
            MessageContent content = MessageContent.of("Test");

            assertThatThrownBy(() -> Message.create(null, SENDER_ID, content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Conversation ID");
        }

        @Test
        @DisplayName("Should throw exception for null sender ID")
        void shouldThrowExceptionForNullSenderId() {
            MessageContent content = MessageContent.of("Test");

            assertThatThrownBy(() -> Message.create(CONVERSATION_ID, null, content))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Sender ID");
        }

        @Test
        @DisplayName("Should throw exception for null content")
        void shouldThrowExceptionForNullContent() {
            assertThatThrownBy(() -> Message.create(CONVERSATION_ID, SENDER_ID, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("content");
        }
    }

    @Nested
    @DisplayName("Mark As Delivered")
    class MarkAsDelivered {

        @Test
        @DisplayName("Should mark SENT message as delivered")
        void shouldMarkSentMessageAsDelivered() {
            Message message = createMessage();

            message.markAsDelivered();

            assertThat(message.getStatus()).isEqualTo(MessageStatus.DELIVERED);
        }

        @Test
        @DisplayName("Should not change status if already delivered")
        void shouldNotChangeStatusIfAlreadyDelivered() {
            Message message = createMessage();
            message.markAsDelivered();
            message.markAsRead(RECIPIENT_ID);

            message.markAsDelivered();

            assertThat(message.getStatus()).isEqualTo(MessageStatus.READ);
        }
    }

    @Nested
    @DisplayName("Mark As Read")
    class MarkAsRead {

        @Test
        @DisplayName("Should mark message as read by recipient")
        void shouldMarkMessageAsReadByRecipient() {
            Message message = createMessage();

            message.markAsRead(RECIPIENT_ID);

            assertThat(message.getStatus()).isEqualTo(MessageStatus.READ);
            assertThat(message.getReadAt()).isNotNull();
            assertThat(message.isRead()).isTrue();
        }

        @Test
        @DisplayName("Should not mark own message as read")
        void shouldNotMarkOwnMessageAsRead() {
            Message message = createMessage();

            message.markAsRead(SENDER_ID);

            assertThat(message.getStatus()).isEqualTo(MessageStatus.SENT);
            assertThat(message.getReadAt()).isNull();
        }

        @Test
        @DisplayName("Should throw exception for null reader ID")
        void shouldThrowExceptionForNullReaderId() {
            Message message = createMessage();

            assertThatThrownBy(() -> message.markAsRead(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Reader ID");
        }

        @Test
        @DisplayName("Should not change if already read")
        void shouldNotChangeIfAlreadyRead() {
            Message message = createMessage();
            message.markAsRead(RECIPIENT_ID);
            var firstReadAt = message.getReadAt();

            message.markAsRead(RECIPIENT_ID);

            assertThat(message.getReadAt()).isEqualTo(firstReadAt);
        }
    }

    @Nested
    @DisplayName("Delete")
    class Delete {

        @Test
        @DisplayName("Should soft delete message")
        void shouldSoftDeleteMessage() {
            Message message = createMessage();

            message.delete(SENDER_ID);

            assertThat(message.getStatus()).isEqualTo(MessageStatus.DELETED);
            assertThat(message.getDeletedAt()).isNotNull();
            assertThat(message.getDeletedBy()).isEqualTo(SENDER_ID);
            assertThat(message.isVisible()).isFalse();
        }

        @Test
        @DisplayName("Should throw exception for null deleter ID")
        void shouldThrowExceptionForNullDeleterId() {
            Message message = createMessage();

            assertThatThrownBy(() -> message.delete(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Deleter ID");
        }

        @Test
        @DisplayName("Should not change if already deleted")
        void shouldNotChangeIfAlreadyDeleted() {
            Message message = createMessage();
            message.delete(SENDER_ID);
            var firstDeletedAt = message.getDeletedAt();

            message.delete(SENDER_ID);

            assertThat(message.getDeletedAt()).isEqualTo(firstDeletedAt);
        }
    }

    @Nested
    @DisplayName("Query Methods")
    class QueryMethods {

        @Test
        @DisplayName("Should check if sent by user")
        void shouldCheckIfSentByUser() {
            Message message = createMessage();

            assertThat(message.isSentBy(SENDER_ID)).isTrue();
            assertThat(message.isSentBy(RECIPIENT_ID)).isFalse();
        }

        @Test
        @DisplayName("Should check visibility")
        void shouldCheckVisibility() {
            Message message = createMessage();

            assertThat(message.isVisible()).isTrue();

            message.delete(SENDER_ID);

            assertThat(message.isVisible()).isFalse();
        }

        @Test
        @DisplayName("Should check attachment existence")
        void shouldCheckAttachmentExistence() {
            Message messageWithoutAttachment = createMessage();
            assertThat(messageWithoutAttachment.hasAttachment()).isFalse();

            MessageAttachment attachment = MessageAttachment.of(
                    "messages/photo.jpg",
                    "https://s3.amazonaws.com/bucket/messages/photo.jpg",
                    "image/jpeg",
                    1024L,
                    "photo.jpg");
            Message messageWithAttachment = Message.create(
                    CONVERSATION_ID, SENDER_ID, MessageContent.of("Photo"), attachment);
            assertThat(messageWithAttachment.hasAttachment()).isTrue();
        }

        @Test
        @DisplayName("Should return content preview")
        void shouldReturnContentPreview() {
            Message message = Message.create(
                    CONVERSATION_ID,
                    SENDER_ID,
                    MessageContent.of("Bu uzun bir mesaj içeriğidir ve preview için kısaltılmalıdır"));

            String preview = message.getContentPreview();

            assertThat(preview.length()).isLessThanOrEqualTo(53); // 50 + "..."
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private Message createMessage() {
        return Message.create(CONVERSATION_ID, SENDER_ID, MessageContent.of("Test mesajı"));
    }
}
