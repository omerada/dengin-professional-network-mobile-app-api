package com.meslektas.messaging.application.service;

import com.meslektas.common.infrastructure.DomainEventPublisher;
import com.meslektas.identity.domain.model.Profession;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.messaging.application.command.DeleteMessageCommand;
import com.meslektas.messaging.application.command.MarkMessagesReadCommand;
import com.meslektas.messaging.application.command.SendMessageCommand;
import com.meslektas.messaging.application.dto.*;
import com.meslektas.messaging.application.query.GetConversationsQuery;
import com.meslektas.messaging.application.query.GetMessagesQuery;
import com.meslektas.messaging.domain.model.*;
import com.meslektas.messaging.domain.repository.ConversationRepository;
import com.meslektas.social.domain.repository.BlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ConversationService
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ConversationService Tests")
class ConversationServiceTest {
    
    @Mock
    private ConversationRepository conversationRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private BlockRepository blockRepository;
    
    @Mock
    private DomainEventPublisher eventPublisher;
    
    @InjectMocks
    private ConversationService conversationService;
    
    private static final Long SENDER_ID = 1L;
    private static final Long RECIPIENT_ID = 2L;
    
    private UUID recipientUuid;
    private User senderUser;
    private User recipientUser;
    
    @BeforeEach
    void setUp() {
        recipientUuid = UUID.randomUUID();
        senderUser = createVerifiedUser(SENDER_ID, "sender@test.com", "Sender", "Test");
        recipientUser = createVerifiedUser(RECIPIENT_ID, "recipient@test.com", "Recipient", "Test");
    }
    
    @Nested
    @DisplayName("Send Message")
    class SendMessageTests {
        
        @Test
        @DisplayName("Should send message successfully")
        void shouldSendMessageSuccessfully() {
            // Given
            SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(recipientUuid)
                .content("Merhaba!")
                .build();
            
            // Setup recipient user with ID
            User recipientWithId = createVerifiedUser(RECIPIENT_ID, "recipient@test.com", "Recipient", "Test");
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(senderUser));
            when(userRepository.findByIdUUID(recipientUuid)).thenReturn(Optional.of(recipientWithId));
            when(userRepository.findById(RECIPIENT_ID)).thenReturn(Optional.of(recipientWithId));
            when(blockRepository.existsByBlockerAndBlocked(anyLong(), anyLong())).thenReturn(false);
            when(conversationRepository.findByParticipants(anyLong(), anyLong()))
                .thenReturn(Optional.of(conversation));
            when(conversationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            // When
            SendMessageResponse response = conversationService.sendMessage(command, SENDER_ID);
            
            // Then
            assertThat(response).isNotNull();
            assertThat(response.getMessageId()).isNotNull();
            assertThat(response.getConversationId()).isNotNull();
            assertThat(response.getContent()).isEqualTo("Merhaba!");
            assertThat(response.getStatus()).isEqualTo("SENT");
            
            verify(conversationRepository).save(any(Conversation.class));
            verify(eventPublisher).publishEvents(any());
        }
        
        @Test
        @DisplayName("Should create new conversation when not exists")
        void shouldCreateNewConversationWhenNotExists() {
            // Given
            SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(recipientUuid)
                .content("İlk mesaj")
                .build();
            
            User recipientWithId = createVerifiedUser(RECIPIENT_ID, "recipient@test.com", "Recipient", "Test");
            Conversation newConversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(senderUser));
            when(userRepository.findByIdUUID(recipientUuid)).thenReturn(Optional.of(recipientWithId));
            when(userRepository.findById(RECIPIENT_ID)).thenReturn(Optional.of(recipientWithId));
            when(blockRepository.existsByBlockerAndBlocked(anyLong(), anyLong())).thenReturn(false);
            when(conversationRepository.findByParticipants(anyLong(), anyLong()))
                .thenReturn(Optional.empty());
            when(conversationRepository.save(any())).thenReturn(newConversation);
            
            // When
            SendMessageResponse response = conversationService.sendMessage(command, SENDER_ID);
            
            // Then
            assertThat(response).isNotNull();
            verify(conversationRepository, times(2)).save(any(Conversation.class));
        }
        
        @Test
        @DisplayName("Should throw exception when sender not verified")
        void shouldThrowExceptionWhenSenderNotVerified() {
            // Given
            User unverifiedSender = createUnverifiedUser(SENDER_ID, "unverified@test.com");
            SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(recipientUuid)
                .content("Test")
                .build();
            
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(unverifiedSender));
            
            // When/Then
            assertThatThrownBy(() -> conversationService.sendMessage(command, SENDER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("verified");
        }
        
        @Test
        @DisplayName("Should throw exception when blocked by recipient")
        void shouldThrowExceptionWhenBlockedByRecipient() {
            // Given
            SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(recipientUuid)
                .content("Test")
                .build();
            
            User recipientWithId = createVerifiedUser(RECIPIENT_ID, "recipient@test.com", "Recipient", "Test");
            
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(senderUser));
            when(userRepository.findByIdUUID(any(UUID.class))).thenReturn(Optional.of(recipientWithId));
            when(userRepository.findById(RECIPIENT_ID)).thenReturn(Optional.of(recipientWithId));
            when(blockRepository.existsByBlockerAndBlocked(SENDER_ID, RECIPIENT_ID)).thenReturn(false);
            when(blockRepository.existsByBlockerAndBlocked(RECIPIENT_ID, SENDER_ID)).thenReturn(true);
            
            // When/Then
            assertThatThrownBy(() -> conversationService.sendMessage(command, SENDER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("blocked");
        }
        
        @Test
        @DisplayName("Should throw exception when sender blocked recipient")
        void shouldThrowExceptionWhenSenderBlockedRecipient() {
            // Given
            SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(recipientUuid)
                .content("Test")
                .build();
            
            User recipientWithId = createVerifiedUser(RECIPIENT_ID, "recipient@test.com", "Recipient", "Test");
            
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(senderUser));
            when(userRepository.findByIdUUID(any(UUID.class))).thenReturn(Optional.of(recipientWithId));
            when(userRepository.findById(RECIPIENT_ID)).thenReturn(Optional.of(recipientWithId));
            when(blockRepository.existsByBlockerAndBlocked(SENDER_ID, RECIPIENT_ID)).thenReturn(true);
            
            // When/Then
            assertThatThrownBy(() -> conversationService.sendMessage(command, SENDER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("blocked");
        }
        
        @Test
        @DisplayName("Should throw exception when recipient not found")
        void shouldThrowExceptionWhenRecipientNotFound() {
            // Given
            SendMessageCommand command = SendMessageCommand.builder()
                .recipientId(recipientUuid)
                .content("Test")
                .build();
            
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(senderUser));
            when(userRepository.findByIdUUID(recipientUuid)).thenReturn(Optional.empty());
            
            // When/Then
            assertThatThrownBy(() -> conversationService.sendMessage(command, SENDER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
        }
    }
    
    @Nested
    @DisplayName("Mark Messages Read")
    class MarkMessagesReadTests {
        
        @Test
        @DisplayName("Should mark messages as read")
        void shouldMarkMessagesAsRead() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            conversation.sendMessage(SENDER_ID, MessageContent.of("Test message"));
            UUID conversationUuid = conversation.getConversationId().getValue();
            
            MarkMessagesReadCommand command = MarkMessagesReadCommand.builder()
                .conversationId(conversationUuid)
                .build();
            
            when(conversationRepository.findByConversationId(any(ConversationId.class)))
                .thenReturn(Optional.of(conversation));
            when(conversationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            // When
            conversationService.markMessagesAsRead(command, RECIPIENT_ID);
            
            // Then
            verify(conversationRepository).save(any(Conversation.class));
            verify(eventPublisher).publishEvents(any());
        }
        
        @Test
        @DisplayName("Should throw exception when user not participant")
        void shouldThrowExceptionWhenUserNotParticipant() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            UUID conversationUuid = conversation.getConversationId().getValue();
            
            MarkMessagesReadCommand command = MarkMessagesReadCommand.builder()
                .conversationId(conversationUuid)
                .build();
            
            Long nonParticipantId = 999L;
            
            when(conversationRepository.findByConversationId(any(ConversationId.class)))
                .thenReturn(Optional.of(conversation));
            
            // When/Then
            assertThatThrownBy(() -> conversationService.markMessagesAsRead(command, nonParticipantId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a participant");
        }
    }
    
    @Nested
    @DisplayName("Get Conversations")
    class GetConversationsTests {
        
        @Test
        @DisplayName("Should return paginated conversations")
        void shouldReturnPaginatedConversations() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            conversation.sendMessage(SENDER_ID, MessageContent.of("Test"));
            
            Page<Conversation> page = new PageImpl<>(
                List.of(conversation),
                PageRequest.of(0, 20),
                1
            );
            
            GetConversationsQuery query = GetConversationsQuery.builder()
                .page(0)
                .size(20)
                .build();
            
            when(conversationRepository.findActiveByUserId(eq(SENDER_ID), any()))
                .thenReturn(page);
            when(userRepository.findById(RECIPIENT_ID)).thenReturn(Optional.of(recipientUser));
            
            // When
            ConversationListResponse response = conversationService.getConversations(query, SENDER_ID);
            
            // Then
            assertThat(response).isNotNull();
            assertThat(response.getConversations()).hasSize(1);
            assertThat(response.getPageNumber()).isEqualTo(0);
            assertThat(response.getTotalElements()).isEqualTo(1);
        }
        
        @Test
        @DisplayName("Should return empty list when no conversations")
        void shouldReturnEmptyListWhenNoConversations() {
            // Given
            Page<Conversation> emptyPage = new PageImpl<>(
                List.of(),
                PageRequest.of(0, 20),
                0
            );
            
            GetConversationsQuery query = GetConversationsQuery.builder().build();
            
            when(conversationRepository.findActiveByUserId(eq(SENDER_ID), any()))
                .thenReturn(emptyPage);
            
            // When
            ConversationListResponse response = conversationService.getConversations(query, SENDER_ID);
            
            // Then
            assertThat(response.getConversations()).isEmpty();
            assertThat(response.getTotalElements()).isEqualTo(0);
        }
    }
    
    @Nested
    @DisplayName("Get Messages")
    class GetMessagesTests {
        
        @Test
        @DisplayName("Should return paginated messages")
        void shouldReturnPaginatedMessages() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            conversation.sendMessage(SENDER_ID, MessageContent.of("Mesaj 1"));
            conversation.sendMessage(RECIPIENT_ID, MessageContent.of("Mesaj 2"));
            UUID conversationUuid = conversation.getConversationId().getValue();
            
            GetMessagesQuery query = GetMessagesQuery.builder()
                .conversationId(conversationUuid)
                .page(0)
                .size(30)
                .build();
            
            when(conversationRepository.findByConversationId(any(ConversationId.class)))
                .thenReturn(Optional.of(conversation));
            when(userRepository.findById(SENDER_ID)).thenReturn(Optional.of(senderUser));
            when(userRepository.findById(RECIPIENT_ID)).thenReturn(Optional.of(recipientUser));
            
            // When
            MessageListResponse response = conversationService.getMessages(query, SENDER_ID);
            
            // Then
            assertThat(response).isNotNull();
            assertThat(response.getMessages()).hasSize(2);
            assertThat(response.getPageNumber()).isEqualTo(0);
        }
        
        @Test
        @DisplayName("Should throw exception when user not participant")
        void shouldThrowExceptionWhenUserNotParticipant() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            UUID conversationUuid = conversation.getConversationId().getValue();
            
            GetMessagesQuery query = GetMessagesQuery.builder()
                .conversationId(conversationUuid)
                .build();
            
            Long nonParticipantId = 999L;
            
            when(conversationRepository.findByConversationId(any(ConversationId.class)))
                .thenReturn(Optional.of(conversation));
            
            // When/Then
            assertThatThrownBy(() -> conversationService.getMessages(query, nonParticipantId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a participant");
        }
    }
    
    @Nested
    @DisplayName("Delete Message")
    class DeleteMessageTests {
        
        @Test
        @DisplayName("Should delete message successfully")
        void shouldDeleteMessageSuccessfully() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            Message message = conversation.sendMessage(SENDER_ID, MessageContent.of("To delete"));
            UUID conversationUuid = conversation.getConversationId().getValue();
            UUID messageUuid = message.getMessageId().getValue();
            
            DeleteMessageCommand command = DeleteMessageCommand.builder()
                .conversationId(conversationUuid)
                .messageId(messageUuid)
                .build();
            
            when(conversationRepository.findByConversationId(any(ConversationId.class)))
                .thenReturn(Optional.of(conversation));
            when(conversationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            
            // When
            conversationService.deleteMessage(command, SENDER_ID);
            
            // Then
            assertThat(message.getStatus()).isEqualTo(MessageStatus.DELETED);
            verify(conversationRepository).save(any(Conversation.class));
        }
        
        @Test
        @DisplayName("Should throw exception when message not found")
        void shouldThrowExceptionWhenMessageNotFound() {
            // Given
            Conversation conversation = Conversation.create(SENDER_ID, RECIPIENT_ID);
            UUID conversationUuid = conversation.getConversationId().getValue();
            UUID nonExistentMessageId = UUID.randomUUID();
            
            DeleteMessageCommand command = DeleteMessageCommand.builder()
                .conversationId(conversationUuid)
                .messageId(nonExistentMessageId)
                .build();
            
            when(conversationRepository.findByConversationId(any(ConversationId.class)))
                .thenReturn(Optional.of(conversation));
            
            // When/Then
            assertThatThrownBy(() -> conversationService.deleteMessage(command, SENDER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Message not found");
        }
    }
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    private User createVerifiedUser(Long id, String email, String name, String surname) {
        User user = User.builder()
            .email(email)
            .name(name)
            .surname(surname)
            .isProfessionVerified(true)
            .isEmailVerified(true)
            .build();
        setId(user, id);
        return user;
    }
    
    private User createUnverifiedUser(Long id, String email) {
        User user = User.builder()
            .email(email)
            .name("Unverified")
            .surname("User")
            .isProfessionVerified(false)
            .isEmailVerified(false)
            .build();
        setId(user, id);
        return user;
    }
    
    private void setId(Object entity, Long id) {
        try {
            // BaseEntity has the id field
            Class<?> clazz = entity.getClass();
            while (clazz != null) {
                try {
                    Field idField = clazz.getDeclaredField("id");
                    idField.setAccessible(true);
                    idField.set(entity, id);
                    return;
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
            throw new RuntimeException("No id field found");
        } catch (Exception e) {
            throw new RuntimeException("Failed to set ID", e);
        }
    }
}
