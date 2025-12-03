package com.meslektas.messaging.domain.model;

import com.meslektas.messaging.domain.event.ConversationCreatedEvent;
import com.meslektas.messaging.domain.event.MessageReadEvent;
import com.meslektas.messaging.domain.event.MessageSentEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests for Conversation Aggregate Root
 */
@DisplayName("Conversation Tests")
class ConversationTest {
    
    private static final Long USER_1_ID = 100L;
    private static final Long USER_2_ID = 200L;
    private static final Long OTHER_USER_ID = 300L;
    
    @Nested
    @DisplayName("Creation")
    class Creation {
        
        @Test
        @DisplayName("Should create conversation between two users")
        void shouldCreateConversationBetweenTwoUsers() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThat(conversation).isNotNull();
            assertThat(conversation.getConversationId()).isNotNull();
            assertThat(conversation.getParticipant1Id()).isNotNull();
            assertThat(conversation.getParticipant2Id()).isNotNull();
            assertThat(conversation.isParticipant(USER_1_ID)).isTrue();
            assertThat(conversation.isParticipant(USER_2_ID)).isTrue();
        }
        
        @Test
        @DisplayName("Should order participants consistently")
        void shouldOrderParticipantsConsistently() {
            Conversation conv1 = Conversation.create(USER_1_ID, USER_2_ID);
            Conversation conv2 = Conversation.create(USER_2_ID, USER_1_ID);
            
            // Both should have same participant order (lower ID first)
            assertThat(conv1.getParticipant1Id()).isEqualTo(conv2.getParticipant1Id());
            assertThat(conv1.getParticipant2Id()).isEqualTo(conv2.getParticipant2Id());
        }
        
        @Test
        @DisplayName("Should publish ConversationCreatedEvent")
        void shouldPublishConversationCreatedEvent() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThat(conversation.getEvents()).hasSize(1);
            assertThat(conversation.getEvents().get(0)).isInstanceOf(ConversationCreatedEvent.class);
            
            ConversationCreatedEvent event = (ConversationCreatedEvent) conversation.getEvents().get(0);
            assertThat(event.getConversationId()).isEqualTo(conversation.getConversationId());
        }
        
        @Test
        @DisplayName("Should initialize with zero unread counts")
        void shouldInitializeWithZeroUnreadCounts() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThat(conversation.getUnreadCount(USER_1_ID)).isZero();
            assertThat(conversation.getUnreadCount(USER_2_ID)).isZero();
        }
    }
    
    @Nested
    @DisplayName("Validation")
    class Validation {
        
        @Test
        @DisplayName("Should throw exception for null participant1")
        void shouldThrowExceptionForNullParticipant1() {
            assertThatThrownBy(() -> Conversation.create(null, USER_2_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Participant 1");
        }
        
        @Test
        @DisplayName("Should throw exception for null participant2")
        void shouldThrowExceptionForNullParticipant2() {
            assertThatThrownBy(() -> Conversation.create(USER_1_ID, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Participant 2");
        }
        
        @Test
        @DisplayName("Should throw exception for same participant")
        void shouldThrowExceptionForSameParticipant() {
            assertThatThrownBy(() -> Conversation.create(USER_1_ID, USER_1_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("yourself");
        }
    }
    
    @Nested
    @DisplayName("Send Message")
    class SendMessage {
        
        @Test
        @DisplayName("Should send message successfully")
        void shouldSendMessageSuccessfully() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            conversation.clearEvents();
            MessageContent content = MessageContent.of("Merhaba!");
            
            Message message = conversation.sendMessage(USER_1_ID, content);
            
            assertThat(message).isNotNull();
            assertThat(message.getContent()).isEqualTo(content);
            assertThat(message.getSenderId()).isEqualTo(USER_1_ID);
            assertThat(message.getStatus()).isEqualTo(MessageStatus.SENT);
            assertThat(conversation.getMessages()).contains(message);
        }
        
        @Test
        @DisplayName("Should update last message info")
        void shouldUpdateLastMessageInfo() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            MessageContent content = MessageContent.of("Son mesaj");
            
            conversation.sendMessage(USER_1_ID, content);
            
            assertThat(conversation.getLastMessageAt()).isNotNull();
            assertThat(conversation.getLastMessagePreview()).isNotNull();
            assertThat(conversation.getLastMessageSenderId()).isEqualTo(USER_1_ID);
        }
        
        @Test
        @DisplayName("Should increment recipient unread count")
        void shouldIncrementRecipientUnreadCount() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            conversation.sendMessage(USER_1_ID, MessageContent.of("Mesaj 1"));
            conversation.sendMessage(USER_1_ID, MessageContent.of("Mesaj 2"));
            
            assertThat(conversation.getUnreadCount(USER_2_ID)).isEqualTo(2);
            assertThat(conversation.getUnreadCount(USER_1_ID)).isZero();
        }
        
        @Test
        @DisplayName("Should publish MessageSentEvent")
        void shouldPublishMessageSentEvent() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            conversation.clearEvents();
            
            conversation.sendMessage(USER_1_ID, MessageContent.of("Test"));
            
            assertThat(conversation.getEvents()).hasSize(1);
            assertThat(conversation.getEvents().get(0)).isInstanceOf(MessageSentEvent.class);
            
            MessageSentEvent event = (MessageSentEvent) conversation.getEvents().get(0);
            assertThat(event.getSenderId()).isEqualTo(USER_1_ID);
            assertThat(event.getRecipientId()).isEqualTo(USER_2_ID);
        }
        
        @Test
        @DisplayName("Should throw exception for non-participant sender")
        void shouldThrowExceptionForNonParticipantSender() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThatThrownBy(() -> 
                conversation.sendMessage(OTHER_USER_ID, MessageContent.of("Test")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a participant");
        }
        
        @Test
        @DisplayName("Should send message with attachment")
        void shouldSendMessageWithAttachment() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            MessageAttachment attachment = MessageAttachment.of(
                "messages/photo.jpg",
                "https://s3.amazonaws.com/bucket/messages/photo.jpg",
                "image/jpeg",
                1024L,
                "photo.jpg"
            );
            
            Message message = conversation.sendMessage(
                USER_1_ID, 
                MessageContent.of("Fotoğraf"), 
                attachment
            );
            
            assertThat(message.hasAttachment()).isTrue();
            assertThat(message.getAttachment()).isEqualTo(attachment);
        }
    }
    
    @Nested
    @DisplayName("Mark As Read")
    class MarkAsRead {
        
        @Test
        @DisplayName("Should mark all unread messages as read")
        void shouldMarkAllUnreadMessagesAsRead() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            conversation.sendMessage(USER_1_ID, MessageContent.of("Mesaj 1"));
            conversation.sendMessage(USER_1_ID, MessageContent.of("Mesaj 2"));
            conversation.clearEvents();
            
            conversation.markAsRead(USER_2_ID);
            
            assertThat(conversation.getUnreadCount(USER_2_ID)).isZero();
            conversation.getMessages().forEach(m -> 
                assertThat(m.isRead()).isTrue()
            );
        }
        
        @Test
        @DisplayName("Should not mark own messages as read")
        void shouldNotMarkOwnMessagesAsRead() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            conversation.sendMessage(USER_1_ID, MessageContent.of("Benim mesajım"));
            conversation.clearEvents();
            
            conversation.markAsRead(USER_1_ID);
            
            // Own message should still be SENT, not READ
            Message message = conversation.getMessages().get(0);
            assertThat(message.getStatus()).isEqualTo(MessageStatus.SENT);
        }
        
        @Test
        @DisplayName("Should publish MessageReadEvent for each message")
        void shouldPublishMessageReadEvent() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            conversation.sendMessage(USER_1_ID, MessageContent.of("Test"));
            conversation.clearEvents();
            
            conversation.markAsRead(USER_2_ID);
            
            assertThat(conversation.getEvents()).hasSize(1);
            assertThat(conversation.getEvents().get(0)).isInstanceOf(MessageReadEvent.class);
        }
        
        @Test
        @DisplayName("Should throw exception for non-participant")
        void shouldThrowExceptionForNonParticipant() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThatThrownBy(() -> conversation.markAsRead(OTHER_USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a participant");
        }
    }
    
    @Nested
    @DisplayName("Delete For User")
    class DeleteForUser {
        
        @Test
        @DisplayName("Should soft delete conversation for user")
        void shouldSoftDeleteConversationForUser() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            conversation.deleteForUser(USER_1_ID);
            
            assertThat(conversation.isDeletedFor(USER_1_ID)).isTrue();
            assertThat(conversation.isDeletedFor(USER_2_ID)).isFalse();
        }
        
        @Test
        @DisplayName("Should throw exception for non-participant")
        void shouldThrowExceptionForNonParticipant() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThatThrownBy(() -> conversation.deleteForUser(OTHER_USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a participant");
        }
    }
    
    @Nested
    @DisplayName("Query Methods")
    class QueryMethods {
        
        @Test
        @DisplayName("Should get other participant")
        void shouldGetOtherParticipant() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThat(conversation.getOtherParticipant(USER_1_ID)).isEqualTo(USER_2_ID);
            assertThat(conversation.getOtherParticipant(USER_2_ID)).isEqualTo(USER_1_ID);
        }
        
        @Test
        @DisplayName("Should throw exception for non-participant in getOtherParticipant")
        void shouldThrowExceptionForNonParticipantInGetOtherParticipant() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThatThrownBy(() -> conversation.getOtherParticipant(OTHER_USER_ID))
                .isInstanceOf(IllegalArgumentException.class);
        }
        
        @Test
        @DisplayName("Should check participant correctly")
        void shouldCheckParticipantCorrectly() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            assertThat(conversation.isParticipant(USER_1_ID)).isTrue();
            assertThat(conversation.isParticipant(USER_2_ID)).isTrue();
            assertThat(conversation.isParticipant(OTHER_USER_ID)).isFalse();
        }
        
        @Test
        @DisplayName("Should find message by ID")
        void shouldFindMessageById() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            Message message = conversation.sendMessage(USER_1_ID, MessageContent.of("Test"));
            
            var foundMessage = conversation.findMessage(message.getMessageId());
            
            assertThat(foundMessage).isPresent();
            assertThat(foundMessage.get()).isEqualTo(message);
        }
        
        @Test
        @DisplayName("Should return empty for non-existent message")
        void shouldReturnEmptyForNonExistentMessage() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            var foundMessage = conversation.findMessage(MessageId.generate());
            
            assertThat(foundMessage).isEmpty();
        }
        
        @Test
        @DisplayName("Should get visible messages only")
        void shouldGetVisibleMessagesOnly() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            Message message1 = conversation.sendMessage(USER_1_ID, MessageContent.of("Görünür"));
            Message message2 = conversation.sendMessage(USER_1_ID, MessageContent.of("Silinecek"));
            message2.delete(USER_1_ID);
            
            var visibleMessages = conversation.getVisibleMessages();
            
            assertThat(visibleMessages).hasSize(1);
            assertThat(visibleMessages).contains(message1);
            assertThat(visibleMessages).doesNotContain(message2);
        }
        
        @Test
        @DisplayName("Should return correct message count")
        void shouldReturnCorrectMessageCount() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            conversation.sendMessage(USER_1_ID, MessageContent.of("Mesaj 1"));
            conversation.sendMessage(USER_2_ID, MessageContent.of("Mesaj 2"));
            Message deletedMessage = conversation.sendMessage(USER_1_ID, MessageContent.of("Silinecek"));
            deletedMessage.delete(USER_1_ID);
            
            assertThat(conversation.getMessageCount()).isEqualTo(2);
        }
    }
    
    @Nested
    @DisplayName("Conversation Restoration")
    class ConversationRestoration {
        
        @Test
        @DisplayName("Should restore deleted conversation when new message received")
        void shouldRestoreDeletedConversationWhenNewMessageReceived() {
            Conversation conversation = Conversation.create(USER_1_ID, USER_2_ID);
            
            // User 1 deletes conversation
            conversation.deleteForUser(USER_1_ID);
            assertThat(conversation.isDeletedFor(USER_1_ID)).isTrue();
            
            // User 2 sends a message - should restore for User 1
            conversation.sendMessage(USER_2_ID, MessageContent.of("Yeni mesaj"));
            
            assertThat(conversation.isDeletedFor(USER_1_ID)).isFalse();
        }
    }
}
