package com.meslektas.common.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Cache Configuration
 * 
 * Configures Redis for:
 * - User profile caching
 * - Session management
 * - Rate limiting
 * - Feed caching
 */
@Slf4j
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Redis Template for custom operations
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Use JSON serializer for values with JSR310 support
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.findAndRegisterModules(); // Register all available modules including JSR310
        objectMapper.activateDefaultTyping(
            LaissezFaireSubTypeValidator.instance,
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(objectMapper);
        
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        log.info("Redis template configured successfully with JSR310 support");
        
        return template;
    }

    /**
     * Cache Manager with different TTL configurations
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Configure ObjectMapper with JSR310 support for cache serialization
        ObjectMapper cacheObjectMapper = new ObjectMapper();
        cacheObjectMapper.registerModule(new JavaTimeModule());
        cacheObjectMapper.findAndRegisterModules();
        cacheObjectMapper.activateDefaultTyping(
            LaissezFaireSubTypeValidator.instance,
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        
        GenericJackson2JsonRedisSerializer cacheSerializer = 
            new GenericJackson2JsonRedisSerializer(cacheObjectMapper);
        
        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(cacheSerializer)
            )
            .disableCachingNullValues();

        // Cache-specific configurations
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // User profiles - 5 minutes TTL
        cacheConfigurations.put("userProfiles", 
            defaultConfig.entryTtl(Duration.ofMinutes(5)));
        
        // Professions - 1 hour TTL (rarely changes)
        cacheConfigurations.put("professions", 
            defaultConfig.entryTtl(Duration.ofHours(1)));
        
        // Feed - 2 minutes TTL (frequently updated)
        cacheConfigurations.put("feed", 
            defaultConfig.entryTtl(Duration.ofMinutes(2)));
        
        // Verification status - 10 minutes TTL
        cacheConfigurations.put("verificationStatus", 
            defaultConfig.entryTtl(Duration.ofMinutes(10)));
        
        // Notification preferences - 30 minutes TTL
        cacheConfigurations.put("notificationPreferences", 
            defaultConfig.entryTtl(Duration.ofMinutes(30)));
        
        // Rate limiting - 1 minute window
        cacheConfigurations.put("rateLimit", 
            defaultConfig.entryTtl(Duration.ofMinutes(1)));
        
        // User sessions - 24 hours TTL
        cacheConfigurations.put("sessions", 
            defaultConfig.entryTtl(Duration.ofHours(24)));

        log.info("Cache manager configured with {} cache regions", cacheConfigurations.size());

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigurations)
            .transactionAware()
            .build();
    }
}
