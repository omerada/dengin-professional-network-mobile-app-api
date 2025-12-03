package com.meslektas.common.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator for Redis connectivity.
 *
 * Checks:
 * - Redis connection is alive
 * - PING-PONG response
 * - Connection latency
 */
@Component
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisConnectionFactory connectionFactory;

    public RedisHealthIndicator(RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public Health health() {
        try {
            long startTime = System.currentTimeMillis();

            // Get connection and ping
            String pong = connectionFactory.getConnection().ping();
            long responseTime = System.currentTimeMillis() - startTime;

            if ("PONG".equals(pong)) {
                return Health.up()
                        .withDetail("cache", "Redis")
                        .withDetail("status", "connected")
                        .withDetail("responseTime", responseTime + "ms")
                        .build();
            } else {
                return Health.down()
                        .withDetail("cache", "Redis")
                        .withDetail("error", "Unexpected ping response: " + pong)
                        .build();
            }

        } catch (Exception e) {
            return Health.down()
                    .withDetail("cache", "Redis")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
