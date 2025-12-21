package com.dengin.messaging.infrastructure.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.dengin.messaging.infrastructure.websocket.dto.WsMessageResponse;
import com.dengin.messaging.infrastructure.websocket.dto.WsReadReceipt;
import com.dengin.messaging.infrastructure.websocket.dto.WsTypingNotification;
import com.dengin.messaging.infrastructure.websocket.RedisMessagePublisher.MessageType;
import com.dengin.messaging.infrastructure.websocket.RedisMessagePublisher.PresenceUpdate;
import com.dengin.messaging.infrastructure.websocket.RedisMessagePublisher.RedisMessage;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Redis Message Subscriber
 * 
 * Listens to Redis pub/sub channels and forwards messages to connected
 * WebSocket clients.
 * Each server instance has its own subscriber that delivers messages to clients
 * connected to that instance.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisMessageSubscriber implements MessageListener {

    private final RedisMessageListenerContainer container;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChannelTopic messagingTopic;
    private final ChannelTopic typingTopic;
    private final ChannelTopic readReceiptTopic;
    private final ChannelTopic presenceTopic;
    private final ObjectMapper objectMapper;

    /**
     * Register this subscriber to listen to all messaging topics
     */
    @PostConstruct
    public void init() {
        container.addMessageListener(this, messagingTopic);
        container.addMessageListener(this, typingTopic);
        container.addMessageListener(this, readReceiptTopic);
        container.addMessageListener(this, presenceTopic);

        log.info("Redis message subscriber initialized for topics: {}, {}, {}, {}",
                messagingTopic.getTopic(), typingTopic.getTopic(),
                readReceiptTopic.getTopic(), presenceTopic.getTopic());
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());
            String body = new String(message.getBody());

            log.debug("Received Redis message on channel: {}", channel);

            if (channel.equals(messagingTopic.getTopic())) {
                handleNewMessage(body);
            } else if (channel.equals(typingTopic.getTopic())) {
                handleTypingNotification(body);
            } else if (channel.equals(readReceiptTopic.getTopic())) {
                handleReadReceipt(body);
            } else if (channel.equals(presenceTopic.getTopic())) {
                handlePresenceUpdate(body);
            } else {
                log.warn("Unknown Redis channel: {}", channel);
            }
        } catch (Exception e) {
            log.error("Error processing Redis message", e);
        }
    }

    /**
     * Handle new message notification from Redis
     */
    private void handleNewMessage(String body) {
        try {
            @SuppressWarnings("unchecked")
            RedisMessage<WsMessageResponse> redisMessage = objectMapper.readValue(
                    body,
                    objectMapper.getTypeFactory().constructParametricType(
                            RedisMessage.class,
                            WsMessageResponse.class));

            if (redisMessage.type() == MessageType.NEW_MESSAGE) {
                Long recipientId = redisMessage.recipientId();
                WsMessageResponse payload = redisMessage.payload();

                log.debug("Delivering message to user {} via WebSocket", recipientId);

                messagingTemplate.convertAndSendToUser(
                        recipientId.toString(),
                        "/queue/messages",
                        payload);
            }
        } catch (Exception e) {
            log.error("Error handling new message from Redis", e);
        }
    }

    /**
     * Handle typing notification from Redis
     */
    private void handleTypingNotification(String body) {
        try {
            @SuppressWarnings("unchecked")
            RedisMessage<WsTypingNotification> redisMessage = objectMapper.readValue(
                    body,
                    objectMapper.getTypeFactory().constructParametricType(
                            RedisMessage.class,
                            WsTypingNotification.class));

            if (redisMessage.type() == MessageType.TYPING) {
                Long recipientId = redisMessage.recipientId();
                WsTypingNotification payload = redisMessage.payload();

                messagingTemplate.convertAndSendToUser(
                        recipientId.toString(),
                        "/queue/typing",
                        payload);
            }
        } catch (Exception e) {
            log.error("Error handling typing notification from Redis", e);
        }
    }

    /**
     * Handle read receipt from Redis
     */
    private void handleReadReceipt(String body) {
        try {
            @SuppressWarnings("unchecked")
            RedisMessage<WsReadReceipt> redisMessage = objectMapper.readValue(
                    body,
                    objectMapper.getTypeFactory().constructParametricType(
                            RedisMessage.class,
                            WsReadReceipt.class));

            if (redisMessage.type() == MessageType.READ_RECEIPT) {
                Long recipientId = redisMessage.recipientId();
                WsReadReceipt payload = redisMessage.payload();

                messagingTemplate.convertAndSendToUser(
                        recipientId.toString(),
                        "/queue/read",
                        payload);
            }
        } catch (Exception e) {
            log.error("Error handling read receipt from Redis", e);
        }
    }

    /**
     * Handle presence update from Redis
     */
    private void handlePresenceUpdate(String body) {
        try {
            PresenceUpdate presenceUpdate = objectMapper.readValue(body, PresenceUpdate.class);

            log.debug("User {} is now {}",
                    presenceUpdate.userId(),
                    presenceUpdate.isOnline() ? "online" : "offline");

            // Broadcast presence to all subscribers of this user's status
            // This could be used to show online/offline indicators
            messagingTemplate.convertAndSend(
                    "/topic/presence/" + presenceUpdate.userId(),
                    presenceUpdate);
        } catch (Exception e) {
            log.error("Error handling presence update from Redis", e);
        }
    }
}
