package com.meslektas.messaging.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Event Listener.
 * Tracks connected users and handles connection lifecycle events.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    // Track active sessions per user
    // Key: userId, Value: Set of sessionIds
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    /**
     * Handle new WebSocket connection
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();
        String sessionId = accessor.getSessionId();

        if (user != null && sessionId != null) {
            String username = user.getName();
            sessionUserMap.put(sessionId, username);

            log.info("WebSocket connected - User: {}, SessionId: {}", username, sessionId);

            // Could broadcast online status here if needed
            // broadcastOnlineStatus(username, true);
        }
    }

    /**
     * Handle WebSocket disconnection
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        if (sessionId != null) {
            String username = sessionUserMap.remove(sessionId);

            if (username != null) {
                log.info("WebSocket disconnected - User: {}, SessionId: {}", username, sessionId);

                // Could broadcast offline status here if needed
                // broadcastOnlineStatus(username, false);
            }
        }
    }

    /**
     * Handle subscription events (for debugging/monitoring)
     */
    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        Principal user = accessor.getUser();

        if (user != null && destination != null) {
            log.debug("User {} subscribed to {}", user.getName(), destination);
        }
    }

    /**
     * Check if a user is currently connected
     */
    public boolean isUserOnline(String username) {
        return sessionUserMap.containsValue(username);
    }

    /**
     * Get the number of active WebSocket connections
     */
    public int getActiveConnectionCount() {
        return sessionUserMap.size();
    }

    /**
     * Get all connected usernames
     */
    public Iterable<String> getConnectedUsers() {
        return sessionUserMap.values();
    }
}
