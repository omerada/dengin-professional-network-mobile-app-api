package com.meslektas.messaging.infrastructure.websocket;

import com.meslektas.messaging.infrastructure.websocket.dto.WsMessageResponse;
import com.meslektas.messaging.infrastructure.websocket.dto.WsReadReceipt;
import com.meslektas.messaging.infrastructure.websocket.dto.WsTypingNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

/**
 * Redis Message Publisher
 * 
 * Publishes WebSocket messages to Redis for multi-instance delivery.
 * Messages published here will be received by all connected server instances.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisMessagePublisher {

    private final RedisTemplate<String, Object> messagingRedisTemplate;
    private final ChannelTopic messagingTopic;
    private final ChannelTopic typingTopic;
    private final ChannelTopic readReceiptTopic;
    private final ChannelTopic presenceTopic;

    /**
     * Publish a new message notification to Redis
     * 
     * @param recipientId The user ID who should receive the message
     * @param message     The message response to send
     */
    public void publishMessage(Long recipientId, WsMessageResponse message) {
        RedisMessage<WsMessageResponse> redisMessage = new RedisMessage<>(
                recipientId,
                MessageType.NEW_MESSAGE,
                message);

        log.debug("Publishing message to Redis - recipientId: {}, messageId: {}",
                recipientId, message.getMessageId());

        messagingRedisTemplate.convertAndSend(messagingTopic.getTopic(), redisMessage);
    }

    /**
     * Publish typing notification to Redis
     * 
     * @param recipientId The user ID who should receive the typing notification
     * @param typing      The typing notification
     */
    public void publishTypingNotification(Long recipientId, WsTypingNotification typing) {
        RedisMessage<WsTypingNotification> redisMessage = new RedisMessage<>(
                recipientId,
                MessageType.TYPING,
                typing);

        log.debug("Publishing typing notification to Redis - recipientId: {}, conversationId: {}",
                recipientId, typing.getConversationId());

        messagingRedisTemplate.convertAndSend(typingTopic.getTopic(), redisMessage);
    }

    /**
     * Publish read receipt to Redis
     * 
     * @param recipientId The user ID who should receive the read receipt
     * @param readReceipt The read receipt notification
     */
    public void publishReadReceipt(Long recipientId, WsReadReceipt readReceipt) {
        RedisMessage<WsReadReceipt> redisMessage = new RedisMessage<>(
                recipientId,
                MessageType.READ_RECEIPT,
                readReceipt);

        log.debug("Publishing read receipt to Redis - recipientId: {}, conversationId: {}",
                recipientId, readReceipt.getConversationId());

        messagingRedisTemplate.convertAndSend(readReceiptTopic.getTopic(), redisMessage);
    }

    /**
     * Publish user presence update to Redis
     * 
     * @param userId   The user whose presence changed
     * @param isOnline Whether the user is online
     */
    public void publishPresenceUpdate(Long userId, boolean isOnline) {
        PresenceUpdate presenceUpdate = new PresenceUpdate(userId, isOnline);

        log.debug("Publishing presence update to Redis - userId: {}, isOnline: {}",
                userId, isOnline);

        messagingRedisTemplate.convertAndSend(presenceTopic.getTopic(), presenceUpdate);
    }

    /**
     * Message types for Redis pub/sub
     */
    public enum MessageType {
        NEW_MESSAGE,
        TYPING,
        READ_RECEIPT,
        PRESENCE
    }

    /**
     * Wrapper for Redis messages containing recipient and payload
     */
    public record RedisMessage<T>(
            Long recipientId,
            MessageType type,
            T payload) {
    }

    /**
     * Presence update notification
     */
    public record PresenceUpdate(
            Long userId,
            boolean isOnline) {
    }
}
