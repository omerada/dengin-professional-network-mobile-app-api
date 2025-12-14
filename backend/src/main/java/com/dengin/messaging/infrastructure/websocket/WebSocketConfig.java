package com.dengin.messaging.infrastructure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration with STOMP protocol.
 * 
 * Message destinations:
 * - Client → Server:
 * /app/chat.send → Send message
 * /app/chat.typing → Typing indicator
 * /app/chat.read → Mark as read
 * 
 * - Server → Client:
 * /user/{userId}/queue/messages → Receive messages
 * /user/{userId}/queue/typing → Typing notifications
 * /user/{userId}/queue/read → Read receipts
 * /user/{userId}/queue/errors → Error notifications
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthenticationInterceptor authenticationInterceptor;

    @Bean
    public TaskScheduler webSocketHeartbeatTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory broker for /topic (broadcast) and /queue
        // (point-to-point)
        // In production, replace with Redis broker for multi-instance support
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[] { 10000, 10000 }) // Heartbeat every 10 seconds
                .setTaskScheduler(webSocketHeartbeatTaskScheduler());

        // Application destination prefix for messages bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");

        // User destination prefix for private messages
        // Messages to /user/{userId}/queue/... will be routed to specific users
        config.setUserDestinationPrefix("/user");

        log.info("WebSocket message broker configured");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Primary WebSocket endpoint with SockJS fallback for older browsers
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        "https://dengin.com",
                        "https://www.dengin.com",
                        "http://localhost:3000", // Development
                        "http://localhost:8080" // Development
                )
                .withSockJS()
                .setHeartbeatTime(25000) // SockJS heartbeat
                .setDisconnectDelay(5000); // Disconnect delay

        // Raw WebSocket endpoint (without SockJS) for mobile clients
        registry.addEndpoint("/ws-raw")
                .setAllowedOrigins(
                        "https://dengin.com",
                        "https://www.dengin.com",
                        "http://localhost:3000",
                        "http://localhost:8080");

        log.info("WebSocket STOMP endpoints registered: /ws (SockJS), /ws-raw");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add authentication interceptor to handle JWT validation on CONNECT
        registration.interceptors(authenticationInterceptor);

        // Configure thread pool for handling incoming messages
        registration.taskExecutor()
                .corePoolSize(4)
                .maxPoolSize(10)
                .queueCapacity(100);
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        // Configure thread pool for sending messages to clients
        registration.taskExecutor()
                .corePoolSize(4)
                .maxPoolSize(10)
                .queueCapacity(100);
    }
}
