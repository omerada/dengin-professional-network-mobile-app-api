package com.meslektas.social.infrastructure.ai;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * OpenRouter AI Configuration
 * 
 * Manages OpenRouter API integration settings for AI-powered features:
 * - Trend generation
 * - Content analysis
 * - Recommendation insights
 * 
 * Configuration Properties (application.yml):
 * - openrouter.api-key: API key for authentication
 * - openrouter.base-url: API base URL
 * - openrouter.model: AI model to use (default: openai/gpt-4o-mini)
 * - openrouter.max-tokens: Maximum response tokens
 * - openrouter.timeout: Request timeout in seconds
 * 
 * @see OpenRouterClient
 */
@Configuration
@ConfigurationProperties(prefix = "openrouter")
@Getter
@Setter
public class OpenRouterConfig {
    
    /**
     * OpenRouter API key - loaded from environment variable
     * Set via: OPENROUTER_API_KEY
     */
    private String apiKey;
    
    /**
     * OpenRouter API base URL
     * Default: https://openrouter.ai/api/v1
     */
    private String baseUrl = "https://openrouter.ai/api/v1";
    
    /**
     * AI model to use for generation
     * Recommended models:
     * - openai/gpt-4o-mini (fast, cost-effective, quality)
     * - anthropic/claude-3-haiku (fast, good for Turkish)
     * - meta-llama/llama-3.1-8b-instruct (open-source, free)
     */
    private String model = "openai/gpt-4o-mini";
    
    /**
     * Maximum tokens in AI response
     * Default: 200 (sufficient for trend titles)
     */
    private int maxTokens = 200;
    
    /**
     * Request timeout in seconds
     * Default: 30 seconds
     */
    private int timeout = 30;
    
    /**
     * Temperature for response creativity (0.0 - 1.0)
     * - 0.0-0.3: More deterministic, factual
     * - 0.7-1.0: More creative, varied
     * Default: 0.7 for diverse trend titles
     */
    private double temperature = 0.7;
    
    /**
     * Enable caching of AI responses
     * Default: true (reduces API costs)
     */
    private boolean cacheEnabled = true;
    
    /**
     * Cache TTL in minutes
     * Default: 60 minutes for trends
     */
    private int cacheTtlMinutes = 60;
    
    /**
     * Validate configuration on startup
     */
    public void validate() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "OpenRouter API key not configured. " +
                "Set OPENROUTER_API_KEY environment variable or openrouter.api-key in application.yml"
            );
        }
        
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("OpenRouter base URL not configured");
        }
        
        if (model == null || model.isBlank()) {
            throw new IllegalStateException("OpenRouter model not configured");
        }
        
        if (maxTokens <= 0 || maxTokens > 4000) {
            throw new IllegalStateException("OpenRouter maxTokens must be between 1 and 4000");
        }
        
        if (timeout <= 0 || timeout > 300) {
            throw new IllegalStateException("OpenRouter timeout must be between 1 and 300 seconds");
        }
    }
}
