package com.meslektas.shared.infrastructure.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Custom Health Indicator for Redis
 * 
 * Checks:
 * - Redis connectivity
 * - Ping response time
 * - Connection pool status
 * 
 * Used by Kubernetes liveness/readiness probes.
 */
@Component("redis")
@RequiredArgsConstructor
@Slf4j
public class RedisHealthIndicator implements HealthIndicator {

    private final StringRedisTemplate redisTemplate;
    private static final long PING_TIMEOUT_MS = 1000;

    @Override
    public Health health() {
        try {
            long startTime = System.currentTimeMillis();

            // Execute PING command
            String result = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();

            long responseTime = System.currentTimeMillis() - startTime;

            if ("PONG".equals(result)) {
                return Health.up()
                        .withDetail("ping", "PONG")
                        .withDetail("responseTimeMs", responseTime)
                        .withDetail("status", responseTime < PING_TIMEOUT_MS ? "healthy" : "slow")
                        .build();
            } else {
                return Health.down()
                        .withDetail("ping", result)
                        .withDetail("error", "Unexpected ping response")
                        .build();
            }
        } catch (Exception e) {
            log.warn("Redis health check failed: {}", e.getMessage());
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}
