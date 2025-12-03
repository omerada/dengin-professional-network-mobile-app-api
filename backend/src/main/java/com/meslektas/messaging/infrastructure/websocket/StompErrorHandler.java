package com.meslektas.messaging.infrastructure.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

/**
 * STOMP Error Handler.
 * Handles errors during STOMP message processing and sends appropriate error
 * frames to clients.
 */
@Slf4j
@Component
public class StompErrorHandler extends StompSubProtocolErrorHandler {

    @Override
    public Message<byte[]> handleClientMessageProcessingError(
            Message<byte[]> clientMessage,
            Throwable ex) {

        log.error("Client message processing error: {}", ex.getMessage(), ex);

        // Determine error message based on exception type
        String errorMessage = determineErrorMessage(ex);

        // Create error frame to send back to client
        return createErrorMessage(errorMessage);
    }

    @Override
    public Message<byte[]> handleErrorMessageToClient(
            Message<byte[]> errorMessage) {

        log.warn("Sending error to client: {}",
                new String(errorMessage.getPayload()));

        return super.handleErrorMessageToClient(errorMessage);
    }

    private String determineErrorMessage(Throwable ex) {
        if (ex instanceof WebSocketAuthenticationInterceptor.WebSocketAuthenticationException) {
            return "Authentication failed: " + ex.getMessage();
        }

        if (ex instanceof IllegalArgumentException) {
            return "Invalid request: " + ex.getMessage();
        }

        if (ex instanceof SecurityException) {
            return "Access denied: " + ex.getMessage();
        }

        // Don't expose internal errors to clients
        return "An error occurred processing your request";
    }

    private Message<byte[]> createErrorMessage(String errorMessage) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
        accessor.setMessage(errorMessage);
        accessor.setLeaveMutable(true);

        return MessageBuilder.createMessage(
                errorMessage.getBytes(),
                accessor.getMessageHeaders());
    }
}
