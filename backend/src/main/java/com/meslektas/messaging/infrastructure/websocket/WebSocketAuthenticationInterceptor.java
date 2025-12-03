package com.meslektas.messaging.infrastructure.websocket;

import com.meslektas.identity.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

/**
 * WebSocket Authentication Interceptor.
 * Validates JWT token on STOMP CONNECT command and sets user principal.
 * 
 * Client must send Authorization header with Bearer token:
 * CONNECT
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthenticationInterceptor implements ChannelInterceptor {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            // Handle CONNECT - authenticate user
            handleConnect(accessor);
        } else if (StompCommand.DISCONNECT.equals(command)) {
            // Handle DISCONNECT - log user leaving
            handleDisconnect(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command)) {
            // Validate subscription permissions
            handleSubscribe(accessor);
        } else if (StompCommand.SEND.equals(command)) {
            // Validate send permissions
            handleSend(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("WebSocket CONNECT without valid Authorization header");
            throw new WebSocketAuthenticationException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            if (!jwtTokenProvider.validateToken(token)) {
                log.warn("WebSocket CONNECT with invalid JWT token");
                throw new WebSocketAuthenticationException("Invalid or expired token");
            }

            String username = jwtTokenProvider.getEmailFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities());

            // Set user in accessor for subsequent messages
            accessor.setUser(authentication);

            // Also set in security context for current thread
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("WebSocket user authenticated: {}", username);

        } catch (Exception e) {
            log.error("WebSocket authentication failed: {}", e.getMessage());
            throw new WebSocketAuthenticationException("Authentication failed: " + e.getMessage());
        }
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        if (accessor.getUser() != null) {
            String username = accessor.getUser().getName();
            log.info("WebSocket user disconnected: {}", username);
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();

        if (destination == null) {
            return;
        }

        // Validate user can only subscribe to their own queue
        if (destination.startsWith("/user/")) {
            // /user/{userId}/queue/messages format
            // Spring automatically converts /user/queue/messages to
            // /user/{username}/queue/messages
            // So we just need to verify they're authenticated
            if (accessor.getUser() == null) {
                log.warn("Unauthenticated subscription attempt to: {}", destination);
                throw new WebSocketAuthenticationException("Authentication required for subscription");
            }

            log.debug("User {} subscribed to: {}", accessor.getUser().getName(), destination);
        }
    }

    private void handleSend(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            log.warn("Unauthenticated send attempt");
            throw new WebSocketAuthenticationException("Authentication required to send messages");
        }
    }

    /**
     * Custom exception for WebSocket authentication failures
     */
    public static class WebSocketAuthenticationException extends RuntimeException {
        public WebSocketAuthenticationException(String message) {
            super(message);
        }
    }
}
