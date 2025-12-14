package com.dengin.messaging.infrastructure.websocket;

import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.messaging.application.command.MarkMessagesReadCommand;
import com.dengin.messaging.application.command.SendMessageCommand;
import com.dengin.messaging.application.dto.SendMessageResponse;
import com.dengin.messaging.application.service.ConversationService;
import com.dengin.messaging.infrastructure.websocket.dto.*;
import com.dengin.messaging.infrastructure.websocket.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.security.Principal;
import java.time.LocalDateTime;

/**
 * WebSocket Controller for real-time messaging.
 * 
 * Message destinations:
 * - Client → Server:
 * /app/chat.send → Send message
 * /app/chat.typing → Typing indicator
 * /app/chat.read → Mark as read
 * 
 * - Server → Client:
 * /user/queue/messages → Receive messages
 * /user/queue/typing → Typing notifications
 * /user/queue/read → Read receipts
 * /user/queue/errors → Error notifications
 */
@Slf4j
@Controller
@RequiredArgsConstructor
@Validated
public class MessageWebSocketController {

    private final ConversationService conversationService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle sending a message via WebSocket.
     * 
     * Client sends to: /app/chat.send
     * Response sent to: sender's /user/queue/messages (confirmation)
     * recipient's /user/queue/messages (new message)
     */
    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload WsSendMessageRequest request,
            Principal principal) {
        UserDetailsImpl userDetails = getUserDetails(principal);
        Long senderId = userDetails.getId();

        log.info("WS: User {} sending message to {}", senderId, request.getRecipientId());

        try {
            // Build command from WebSocket request
            SendMessageCommand command = buildSendMessageCommand(request);

            // Send message through service
            SendMessageResponse response = conversationService.sendMessage(command, senderId);

            // Build WebSocket response
            WsMessageResponse wsResponse = buildWsMessageResponse(response, senderId, request);

            // Send to recipient
            String recipientDestination = String.format("/queue/messages");
            messagingTemplate.convertAndSendToUser(
                    request.getRecipientId().toString(),
                    recipientDestination,
                    wsResponse);

            // Send confirmation to sender
            messagingTemplate.convertAndSendToUser(
                    userDetails.getUsername(),
                    "/queue/messages",
                    wsResponse);

            log.info("WS: Message {} delivered to conversation {}",
                    response.getMessageId(), response.getConversationId());

        } catch (Exception e) {
            log.error("WS: Error sending message from user {}: {}", senderId, e.getMessage());
            sendError(principal, WsErrorResponse.CODE_INTERNAL_ERROR, e.getMessage(), "chat.send");
        }
    }

    /**
     * Handle typing indicator.
     * 
     * Client sends to: /app/chat.typing
     * Response sent to: recipient's /user/queue/typing
     */
    @MessageMapping("/chat.typing")
    public void notifyTyping(
            @Payload WsTypingNotification notification,
            Principal principal) {
        UserDetailsImpl userDetails = getUserDetails(principal);
        Long senderId = userDetails.getId();

        log.debug("WS: User {} typing in conversation {}: {}",
                senderId, notification.getConversationId(), notification.isTyping());

        // Forward typing notification to recipient (using Long ID)
        messagingTemplate.convertAndSendToUser(
                notification.getRecipientId().toString(),
                "/queue/typing",
                WsTypingNotification.builder()
                        .conversationId(notification.getConversationId())
                        .recipientId(senderId) // Sender's Long ID
                        .isTyping(notification.isTyping())
                        .build());
    }

    /**
     * Handle mark messages as read.
     * 
     * Client sends to: /app/chat.read
     * Response sent to: sender of messages /user/queue/read (read receipt)
     */
    @MessageMapping("/chat.read")
    public void markAsRead(
            @Payload WsReadReceipt readReceipt,
            Principal principal) {
        UserDetailsImpl userDetails = getUserDetails(principal);
        Long userId = userDetails.getId();

        log.info("WS: User {} marking messages as read in conversation {}",
                userId, readReceipt.getConversationId());

        try {
            // Mark messages as read
            MarkMessagesReadCommand command = MarkMessagesReadCommand.builder()
                    .conversationId(readReceipt.getConversationId())
                    .build();

            Long otherParticipantId = conversationService.markMessagesAsRead(command, userId);

            // Send read receipt to the other participant
            if (otherParticipantId != null) {
                WsReadReceipt receiptNotification = WsReadReceipt.builder()
                        .conversationId(readReceipt.getConversationId())
                        .readerId(userId)
                        .readAt(LocalDateTime.now())
                        .build();

                messagingTemplate.convertAndSendToUser(
                        otherParticipantId.toString(),
                        "/queue/read",
                        receiptNotification);

                log.debug("WS: Read receipt sent to user {} for conversation {}",
                        otherParticipantId, readReceipt.getConversationId());
            }

            log.info("WS: Messages marked as read in conversation {}",
                    readReceipt.getConversationId());

        } catch (Exception e) {
            log.error("WS: Error marking messages as read: {}", e.getMessage());
            sendError(principal, WsErrorResponse.CODE_INTERNAL_ERROR, e.getMessage(), "chat.read");
        }
    }

    /**
     * Handle exceptions in message processing
     */
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public WsErrorResponse handleException(Exception e, Principal principal) {
        log.error("WS: Message handling error for user {}: {}",
                principal.getName(), e.getMessage(), e);

        String code = WsErrorResponse.CODE_INTERNAL_ERROR;

        if (e instanceof IllegalArgumentException) {
            code = WsErrorResponse.CODE_VALIDATION_ERROR;
        } else if (e instanceof SecurityException) {
            code = WsErrorResponse.CODE_FORBIDDEN;
        }

        return WsErrorResponse.of(code, e.getMessage(), "unknown");
    }

    // ==================== Private Helper Methods ====================

    private UserDetailsImpl getUserDetails(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            return (UserDetailsImpl) auth.getPrincipal();
        }
        throw new IllegalStateException("Invalid principal type");
    }

    private SendMessageCommand buildSendMessageCommand(WsSendMessageRequest request) {
        SendMessageCommand.AttachmentData attachment = null;

        if (request.getAttachment() != null) {
            attachment = SendMessageCommand.AttachmentData.builder()
                    .s3Key(request.getAttachment().getS3Key())
                    .url(request.getAttachment().getUrl())
                    .contentType(request.getAttachment().getContentType())
                    .fileSize(request.getAttachment().getFileSize())
                    .fileName(request.getAttachment().getFileName())
                    .build();
        }

        return SendMessageCommand.builder()
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .attachment(attachment)
                .build();
    }

    private WsMessageResponse buildWsMessageResponse(
            SendMessageResponse response,
            Long senderId,
            WsSendMessageRequest request) {

        WsMessageResponse.AttachmentData attachment = null;
        if (request.getAttachment() != null) {
            attachment = WsMessageResponse.AttachmentData.builder()
                    .s3Key(request.getAttachment().getS3Key())
                    .url(request.getAttachment().getUrl())
                    .contentType(request.getAttachment().getContentType())
                    .fileSize(request.getAttachment().getFileSize())
                    .fileName(request.getAttachment().getFileName())
                    .build();
        }

        return WsMessageResponse.builder()
                .messageId(response.getMessageId())
                .conversationId(response.getConversationId())
                .senderId(senderId) // Current user's ID
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .attachment(attachment)
                .status(response.getStatus())
                .sentByMe(true) // Gönderen için her zaman true
                .sentAt(response.getSentAt())
                .build();
    }

    private void sendError(Principal principal, String code, String message, String action) {
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                WsErrorResponse.of(code, message, action));
    }
}
