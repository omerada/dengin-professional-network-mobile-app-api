package com.dengin.messaging.infrastructure.websocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis Pub/Sub Configuration for Multi-Instance WebSocket Messaging
 * 
 * Enables real-time message delivery across multiple server instances.
 * When a user is connected to Instance 1 and receives a message from
 * a user connected to Instance 2, Redis Pub/Sub ensures message delivery.
 * 
 * Message Flow:
 * User A (Instance 1) → Send Message → Redis Pub/Sub →
 * → Instance 1 (User A receives acknowledgment)
 * → Instance 2 (User B receives message)
 */
@Configuration
public class RedisMessageBrokerConfig {

    public static final String MESSAGING_TOPIC = "meslektas:messaging";
    public static final String TYPING_TOPIC = "meslektas:typing";
    public static final String READ_RECEIPT_TOPIC = "meslektas:read-receipts";
    public static final String PRESENCE_TOPIC = "meslektas:presence";

    /**
     * Redis message listener container for handling pub/sub messages
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        return container;
    }

    /**
     * Redis template for publishing messages to topics
     */
    @Bean
    public RedisTemplate<String, Object> messagingRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));
        template.afterPropertiesSet();
        return template;
    }

    /**
     * Topic for new message notifications
     */
    @Bean
    public ChannelTopic messagingTopic() {
        return new ChannelTopic(MESSAGING_TOPIC);
    }

    /**
     * Topic for typing indicator notifications
     */
    @Bean
    public ChannelTopic typingTopic() {
        return new ChannelTopic(TYPING_TOPIC);
    }

    /**
     * Topic for read receipt notifications
     */
    @Bean
    public ChannelTopic readReceiptTopic() {
        return new ChannelTopic(READ_RECEIPT_TOPIC);
    }

    /**
     * Topic for user presence (online/offline) notifications
     */
    @Bean
    public ChannelTopic presenceTopic() {
        return new ChannelTopic(PRESENCE_TOPIC);
    }
}
