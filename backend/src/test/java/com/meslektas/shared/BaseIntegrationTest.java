package com.dengin.shared;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for Integration Tests
 * 
 * Provides:
 * - Full Spring context with MockMvc
 * - H2 in-memory database (PostgreSQL compatibility mode)
 * - Test profile configuration
 * 
 * Note: Uses H2 database for CI/CD compatibility.
 * For production-like tests with Docker, use BaseDockerIntegrationTest.
 * 
 * Usage:
 * <pre>{@code
 * class MyIntegrationTest extends BaseIntegrationTest {
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
@ActiveProfiles("test")
@Tag("integration")
public abstract class BaseIntegrationTest {
    // Uses H2 database configured in application-test.yml
    // No Testcontainers - works without Docker
}
