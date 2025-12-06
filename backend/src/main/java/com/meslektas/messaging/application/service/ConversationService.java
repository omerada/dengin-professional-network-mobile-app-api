package com.meslektas.messaging.application.service;

import com.meslektas.common.infrastructure.DomainEventPublisher;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.messaging.application.command.DeleteMessageCommand;
import com.meslektas.messaging.application.command.MarkMessagesReadCommand;
import com.meslektas.messaging.application.command.SendMessageCommand;
import com.meslektas.messaging.application.dto.*;
import com.meslektas.messaging.application.query.GetConversationsQuery;
import com.meslektas.messaging.application.query.GetMessagesQuery;
import com.meslektas.messaging.application.query.SearchMessagesQuery;
import com.meslektas.messaging.domain.model.*;
import com.meslektas.messaging.domain.repository.ConversationRepository;
import com.meslektas.messaging.infrastructure.persistence.MessageSearchRepository;
import com.meslektas.social.domain.repository.BlockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Conversation Application Service
 * 
 * Orchestrates messaging operations:
 * - Send messages
 * - Get conversations
 * - Get messages
 * - Mark messages as read
 * - Delete messages
 * 
 * Business Rules:
 * - Only verified users can send messages
 * - Users can't message blocked users
 * - Conversation is 1-to-1 (two participants only)
 * - Message content: 1-2000 characters
 * - Max 1 attachment per message (10MB max)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

        private final ConversationRepository conversationRepository;
        private final UserRepository userRepository;
        private final BlockRepository blockRepository;
        private final DomainEventPublisher eventPublisher;
        private final MessageSearchRepository messageSearchRepository;

        // ============================================
        // COMMANDS
        // ============================================

        /**
         * Send a message to another user
         * 
         * Business Rules:
         * - Sender must be verified
         * - Recipient must not have blocked sender
         * - Sender must not have blocked recipient
         * - Creates conversation if not exists
         */
        @Transactional
        public SendMessageResponse sendMessage(SendMessageCommand command, Long senderId) {
                log.info("User {} sending message to {}", senderId, command.getRecipientId());

                command.validate();

                // Validate sender
                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new IllegalArgumentException("Sender not found: " + senderId));

               /* // Check email verification (profession verification is not required for messaging)
                if (!Boolean.TRUE.equals(sender.getIsEmailVerified())) {
                        throw new IllegalStateException("Email doğrulaması yapılmamış. Mesaj göndermek için e-posta adresinizi doğrulayın.");
                }*/

                // Validate recipient exists
                Long recipientId = findUserIdByLong(command.getRecipientId());
                userRepository.findById(recipientId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Recipient not found: " + command.getRecipientId()));

                // Check blocks
                validateNoBlocks(senderId, recipientId);

                // Find or create conversation
                Conversation conversation = findOrCreateConversation(senderId, recipientId);

                // Create message content
                MessageContent content = command.hasContent()
                                ? MessageContent.of(command.getContent())
                                : MessageContent.of("[Attachment]");

                // Create attachment if provided
                MessageAttachment attachment = null;
                if (command.hasAttachment()) {
                        SendMessageCommand.AttachmentData attachmentData = command.getAttachment();
                        attachment = MessageAttachment.of(
                                        attachmentData.getS3Key(),
                                        attachmentData.getUrl(),
                                        attachmentData.getContentType(),
                                        attachmentData.getFileSize(),
                                        attachmentData.getFileName());
                }

                // Send message
                Message message = conversation.sendMessage(senderId, content, attachment);

                // Save conversation
                conversationRepository.save(conversation);

                // Publish events
                eventPublisher.publishEvents(conversation.getEvents());
                conversation.clearEvents();

                log.info("Message {} sent from {} to {}",
                                message.getMessageId(), senderId, recipientId);

                return mapToSendResponse(message, conversation);
        }

        /**
         * Mark messages as read in a conversation
         * 
         * @return the other participant's user ID for sending read receipt notification
         */
        @Transactional
        public Long markMessagesAsRead(MarkMessagesReadCommand command, Long userId) {
                log.info("User {} marking messages as read in conversation {}",
                                userId, command.getConversationId());

                Conversation conversation = findConversationByUuid(command.getConversationId());

                if (!conversation.isParticipant(userId)) {
                        throw new IllegalArgumentException("User is not a participant in this conversation");
                }

                if (command.getLastReadMessageId() != null) {
                        MessageId messageId = MessageId.fromString(command.getLastReadMessageId().toString());
                        conversation.markMessageAsRead(userId, messageId);
                } else {
                        conversation.markAsRead(userId);
                }

                conversationRepository.save(conversation);

                // Publish events
                eventPublisher.publishEvents(conversation.getEvents());
                conversation.clearEvents();

                log.info("Messages marked as read for user {} in conversation {}",
                                userId, command.getConversationId());

                // Return the other participant for read receipt notification
                return conversation.getOtherParticipant(userId);
        }

        /**
         * Delete a message
         */
        @Transactional
        public void deleteMessage(DeleteMessageCommand command, Long userId) {
                log.info("User {} deleting message {}", userId, command.getMessageId());

                Conversation conversation = findConversationByUuid(command.getConversationId());

                if (!conversation.isParticipant(userId)) {
                        throw new IllegalArgumentException("User is not a participant in this conversation");
                }

                MessageId messageId = MessageId.fromString(command.getMessageId().toString());
                Message message = conversation.findMessage(messageId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Message not found: " + command.getMessageId()));

                message.delete(userId);

                conversationRepository.save(conversation);

                // Publish events
                eventPublisher.publishEvents(conversation.getEvents());
                conversation.clearEvents();

                log.info("Message {} deleted by user {}", command.getMessageId(), userId);
        }

        // ============================================
        // QUERIES
        // ============================================

        /**
         * Get user's conversations with pagination
         */
        @Transactional(readOnly = true)
        public ConversationListResponse getConversations(GetConversationsQuery query, Long userId) {
                log.debug("User {} fetching conversations page {}", userId, query.getPage());

                PageRequest pageRequest = PageRequest.of(
                                query.getPage(),
                                query.getSize(),
                                Sort.by(Sort.Direction.DESC, "lastMessageAt"));

                Page<Conversation> conversationPage = conversationRepository
                                .findActiveByUserId(userId, pageRequest);

                List<ConversationDto> conversationDtos = conversationPage.getContent().stream()
                                .filter(c -> !c.isDeletedFor(userId))
                                .map(c -> mapToConversationDto(c, userId))
                                .collect(Collectors.toList());

                return ConversationListResponse.builder()
                                .conversations(conversationDtos)
                                .pageNumber(conversationPage.getNumber())
                                .pageSize(conversationPage.getSize())
                                .totalPages(conversationPage.getTotalPages())
                                .totalElements(conversationPage.getTotalElements())
                                .hasMore(conversationPage.hasNext())
                                .build();
        }

        /**
         * Get messages in a conversation with pagination
         */
        @Transactional(readOnly = true)
        public MessageListResponse getMessages(GetMessagesQuery query, Long userId) {
                log.debug("User {} fetching messages for conversation {}", userId, query.getConversationId());

                Conversation conversation = findConversationByUuid(query.getConversationId());

                if (!conversation.isParticipant(userId)) {
                        throw new IllegalArgumentException("User is not a participant in this conversation");
                }

                // Get visible messages with pagination
                List<Message> allMessages = conversation.getVisibleMessages();

                int start = query.getPage() * query.getSize();
                int end = Math.min(start + query.getSize(), allMessages.size());

                List<MessageDto> messageDtos;
                if (start < allMessages.size()) {
                        UUID conversationUuid = conversation.getConversationId().getValue();
                        messageDtos = allMessages.subList(start, end).stream()
                                        .map(m -> {
                                                MessageDto dto = mapToMessageDto(m, userId);
                                                // Set conversationId from parent conversation
                                                return MessageDto.builder()
                                                        .messageId(dto.getMessageId())
                                                        .conversationId(conversationUuid)
                                                        .senderId(dto.getSenderId())
                                                        .senderName(dto.getSenderName())
                                                        .senderProfileImageUrl(dto.getSenderProfileImageUrl())
                                                        .content(dto.getContent())
                                                        .attachment(dto.getAttachment())
                                                        .status(dto.getStatus())
                                                        .read(dto.isRead())
                                                        .sentByMe(dto.isSentByMe())
                                                        .sentAt(dto.getSentAt())
                                                        .readAt(dto.getReadAt())
                                                        .build();
                                        })
                                        .collect(Collectors.toList());
                } else {
                        messageDtos = List.of();
                }

                return MessageListResponse.builder()
                                .messages(messageDtos)
                                .pageNumber(query.getPage())
                                .pageSize(query.getSize())
                                .hasMore(end < allMessages.size())
                                .totalMessages(allMessages.size())
                                .build();
        }

        /**
         * Get a single conversation by ID
         */
        @Transactional(readOnly = true)
        public Optional<ConversationDto> getConversation(UUID conversationId, Long userId) {
                return conversationRepository.findByConversationId(ConversationId.fromString(conversationId.toString()))
                                .filter(c -> c.isParticipant(userId))
                                .filter(c -> !c.isDeletedFor(userId))
                                .map(c -> mapToConversationDto(c, userId));
        }

        /**
         * Get total unread message count for a user
         */
        @Transactional(readOnly = true)
        public int getTotalUnreadCount(Long userId) {
                return conversationRepository.countTotalUnreadMessages(userId);
        }

        /**
         * Search messages across all conversations for a user.
         * Uses PostgreSQL full-text search with relevance ranking.
         */
        @Transactional(readOnly = true)
        public MessageSearchResponse searchMessages(SearchMessagesQuery query, Long userId) {
                log.debug("User {} searching messages with query: {}", userId, query.getSearchQuery());

                // Get search results
                var results = messageSearchRepository.searchMessages(
                                userId,
                                query.getSearchQuery(),
                                query.getConversationId(),
                                query.getFromDate(),
                                query.getToDate(),
                                query.getSize(),
                                query.getOffset());

                // Get total count for pagination
                long totalResults = messageSearchRepository.countSearchResults(
                                userId,
                                query.getSearchQuery(),
                                query.getConversationId(),
                                query.getFromDate(),
                                query.getToDate());

                // Add content highlights
                var resultsWithHighlights = results.stream()
                                .map(r -> MessageSearchResult.builder()
                                                .messageId(r.getMessageId())
                                                .conversationId(r.getConversationId())
                                                .senderId(r.getSenderId())
                                                .senderName(r.getSenderName())
                                                .content(r.getContent())
                                                .contentHighlight(messageSearchRepository.highlightContent(
                                                                r.getContent(), query.getSearchQuery()))
                                                .sentAt(r.getSentAt())
                                                .relevanceScore(r.getRelevanceScore())
                                                .otherParticipant(r.getOtherParticipant())
                                                .build())
                                .toList();

                log.debug("Found {} messages matching query", totalResults);

                return MessageSearchResponse.of(
                                resultsWithHighlights,
                                totalResults,
                                query.getPage(),
                                query.getSize());
        }

        // ============================================
        // HELPER METHODS
        // ============================================

        private Conversation findOrCreateConversation(Long senderId, Long recipientId) {
                return conversationRepository.findByParticipants(senderId, recipientId)
                                .orElseGet(() -> {
                                        Conversation newConversation = Conversation.create(senderId, recipientId);
                                        return conversationRepository.save(newConversation);
                                });
        }

        private Conversation findConversationByUuid(UUID conversationUuid) {
                ConversationId conversationId = ConversationId.fromString(conversationUuid.toString());
                return conversationRepository.findByConversationId(conversationId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Conversation not found: " + conversationUuid));
        }

        private Long findUserIdByLong(Long userUuid) {
                return userRepository.findById(userUuid)
                                .map(User::getId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userUuid));
        }

        private void validateNoBlocks(Long user1Id, Long user2Id) {
                if (blockRepository.existsByBlockerAndBlocked(user1Id, user2Id)) {
                        throw new IllegalStateException("You have blocked this user");
                }
                if (blockRepository.existsByBlockerAndBlocked(user2Id, user1Id)) {
                        throw new IllegalStateException("This user has blocked you");
                }
        }

        // ============================================
        // MAPPING METHODS
        // ============================================

        private ConversationDto mapToConversationDto(Conversation conversation, Long currentUserId) {
                Long otherParticipantId = conversation.getOtherParticipant(currentUserId);
                User otherUser = userRepository.findById(otherParticipantId).orElse(null);

                ParticipantDto participant = otherUser != null ? ParticipantDto.builder()
                                .userId(otherUser.getId())
                                .fullName(otherUser.getFullName())
                                .profession(otherUser.getProfession() != null ? otherUser.getProfession().getName()
                                                : null)
                                .profileImageUrl(otherUser.getProfileImageUrl())
                                .verified(otherUser.isVerified())
                                .online(false) // Will be set from presence service
                                .build() : null;

                LastMessageDto lastMessage = null;
                if (conversation.getLastMessagePreview() != null) {
                        lastMessage = LastMessageDto.builder()
                                        .content(conversation.getLastMessagePreview())
                                        .sentByMe(conversation.getLastMessageSenderId() != null &&
                                                        conversation.getLastMessageSenderId().equals(currentUserId))
                                        .sentAt(conversation.getLastMessageAt() != null
                                                        ? conversation.getLastMessageAt()
                                                                        .atZone(java.time.ZoneId.systemDefault())
                                                                        .toInstant()
                                                        : null)
                                        .build();
                }

                return ConversationDto.builder()
                                .conversationId(conversation.getConversationId().getValue())
                                .participant(participant)
                                .lastMessage(lastMessage)
                                .unreadCount(conversation.getUnreadCount(currentUserId))
                                .updatedAt(conversation.getLastMessageAt() != null
                                                ? conversation.getLastMessageAt()
                                                                .atZone(java.time.ZoneId.systemDefault()).toInstant()
                                                : null)
                                .createdAt(conversation.getCreatedAt() != null
                                                ? conversation.getCreatedAt().atZone(java.time.ZoneId.systemDefault())
                                                                .toInstant()
                                                : null)
                                .build();
        }

        private MessageDto mapToMessageDto(Message message, Long currentUserId) {
                User sender = userRepository.findById(message.getSenderId()).orElse(null);

                MessageAttachmentDto attachmentDto = null;
                if (message.hasAttachment()) {
                        MessageAttachment attachment = message.getAttachment();
                        attachmentDto = MessageAttachmentDto.builder()
                                        .url(attachment.getUrl())
                                        .contentType(attachment.getContentType())
                                        .fileSize(attachment.getFileSize())
                                        .fileName(attachment.getFileName())
                                        .build();
                }

                return MessageDto.builder()
                                .messageId(message.getMessageId().getValue())
                                .conversationId(null) // ConversationId will be set from parent conversation context
                                .senderId(message.getSenderId()) // Long ID from User entity
                                .senderName(sender != null ? sender.getFullName() : "Unknown")
                                .senderProfileImageUrl(sender != null ? sender.getProfileImageUrl() : null)
                                .content(message.getContent() != null ? message.getContent().getValue() : null)
                                .attachment(attachmentDto)
                                .status(message.getStatus().name())
                                .read(message.isRead())
                                .sentByMe(message.isSentBy(currentUserId))
                                .sentAt(message.getCreatedAt() != null
                                                ? message.getCreatedAt().atZone(java.time.ZoneId.systemDefault())
                                                                .toInstant()
                                                : null)
                                .readAt(message.getReadAt() != null
                                                ? message.getReadAt().atZone(java.time.ZoneId.systemDefault())
                                                                .toInstant()
                                                : null)
                                .build();
        }

        private SendMessageResponse mapToSendResponse(Message message, Conversation conversation) {
                MessageAttachmentDto attachmentDto = null;
                if (message.hasAttachment()) {
                        MessageAttachment attachment = message.getAttachment();
                        attachmentDto = MessageAttachmentDto.builder()
                                        .url(attachment.getUrl())
                                        .contentType(attachment.getContentType())
                                        .fileSize(attachment.getFileSize())
                                        .fileName(attachment.getFileName())
                                        .build();
                }

                return SendMessageResponse.builder()
                                .messageId(message.getMessageId().getValue())
                                .conversationId(conversation.getConversationId().getValue())
                                .content(message.getContent() != null ? message.getContent().getValue() : null)
                                .attachment(attachmentDto)
                                .status(message.getStatus().name())
                                .sentAt(message.getCreatedAt() != null
                                                ? message.getCreatedAt().atZone(java.time.ZoneId.systemDefault())
                                                                .toInstant()
                                                : null)
                                .build();
        }
}
