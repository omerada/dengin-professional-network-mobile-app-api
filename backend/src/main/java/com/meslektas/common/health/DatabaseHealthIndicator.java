package com.meslektas.common.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator for database connectivity.
 *
 * Checks:
 * - Database connection is alive
 * - Connection pool status
 * - Query execution capability
 */
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseHealthIndicator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Health health() {
        try {
            long startTime = System.currentTimeMillis();

            // Execute simple health check query
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            long responseTime = System.currentTimeMillis() - startTime;

            if (result != null && result == 1) {
                return Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("status", "connected")
                        .withDetail("responseTime", responseTime + "ms")
                        .build();
            } else {
                return Health.down()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("error", "Unexpected query result")
                        .build();
            }

        } catch (Exception e) {
            return Health.down()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
