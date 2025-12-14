package com.dengin.shared;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Base class for Docker-based Integration Tests
 * 
 * Provides:
 * - PostgreSQL container for database tests
 * - Redis container for caching/rate limiting tests
 * - Full Spring context with MockMvc
 * - Test profile configuration
 * 
 * REQUIRES Docker to be running!
 * 
 * Usage:
 * <pre>{@code
 * @Tag("docker")
 * class MyDockerIntegrationTest extends BaseDockerIntegrationTest {
 *     @Autowired
 *     private MockMvc mockMvc;
 *     
 *     @Test
 *     void testEndpoint() {
 *         mockMvc.perform(get("/api/v1/resource"))
 *             .andExpect(status().isOk());
 *     }
 * }
 * }</pre>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("docker-test")
@Tag("docker")
public abstract class BaseDockerIntegrationTest {

    /**
     * PostgreSQL 15 container - shared across all tests in the class
     */
    @Container
    protected static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
        DockerImageName.parse("postgres:15-alpine")
    )
        .withDatabaseName("dengin_test")
        .withUsername("test")
        .withPassword("test")
        .withReuse(true);

    /**
     * Redis container for caching and rate limiting tests
     */
    @Container
    protected static final GenericContainer<?> redis = new GenericContainer<>(
        DockerImageName.parse("redis:7-alpine")
    )
        .withExposedPorts(6379)
        .withReuse(true);

    /**
     * Configure dynamic properties from containers
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // Database properties
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        
        // Flyway
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.flyway.clean-disabled", () -> false);
        
        // JPA
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.show-sql", () -> false);
        
        // Redis properties
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        
        // JWT test secret
        registry.add("app.jwt.secret", () -> 
            "test-secret-key-for-integration-tests-must-be-256-bits-or-more");
        registry.add("app.jwt.expiration", () -> 3600000);
        registry.add("app.jwt.refresh-expiration", () -> 86400000);
        
        // Disable external services in tests
        registry.add("app.aws.enabled", () -> false);
        registry.add("app.firebase.enabled", () -> false);
        registry.add("sentry.dsn", () -> "");
    }
}
