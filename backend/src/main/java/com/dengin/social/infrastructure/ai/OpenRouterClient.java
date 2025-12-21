package com.dengin.social.infrastructure.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * OpenRouter AI HTTP Client
 * 
 * Handles low-level HTTP communication with OpenRouter API:
 * - Request formatting
 * - Authentication
 * - Response parsing
 * - Error handling
 * - Connection pooling
 * 
 * API Documentation: https://openrouter.ai/docs
 * 
 * Thread-safe: Uses OkHttp connection pooling
 * Cached: Responses cached for configured TTL
 * 
 * @see OpenRouterConfig
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OpenRouterClient {
    
    private final OpenRouterConfig config;
    private final ObjectMapper objectMapper;
    
    private OkHttpClient httpClient;
    
    /**
     * Initialize HTTP client with custom timeout and connection pool
     */
    @PostConstruct
    public void init() {
        config.validate();
        
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(config.getTimeout(), TimeUnit.SECONDS)
            .readTimeout(config.getTimeout(), TimeUnit.SECONDS)
            .writeTimeout(config.getTimeout(), TimeUnit.SECONDS)
            .connectionPool(new ConnectionPool(5, 5, TimeUnit.MINUTES))
            .build();
        
        log.info("OpenRouter client initialized - Model: {}, BaseURL: {}", 
                config.getModel(), config.getBaseUrl());
    }
    
    /**
     * Send chat completion request to OpenRouter
     * 
     * @param systemPrompt System-level instructions
     * @param userPrompt   User query
     * @param maxTokens    Maximum response tokens
     * @return AI-generated response text
     * @throws OpenRouterException if API request fails
     */
    @Cacheable(
        value = "openrouter-responses",
        key = "#systemPrompt + ':' + #userPrompt",
        condition = "@openRouterConfig.cacheEnabled"
    )
    public String chatCompletion(String systemPrompt, String userPrompt, int maxTokens) {
        log.debug("OpenRouter request - System: {}, User: {}", 
                systemPrompt.substring(0, Math.min(50, systemPrompt.length())),
                userPrompt.substring(0, Math.min(50, userPrompt.length())));
        
        try {
            // Build request payload
            OpenRouterRequest requestPayload = OpenRouterRequest.builder()
                .model(config.getModel())
                .messages(List.of(
                    new Message("system", systemPrompt),
                    new Message("user", userPrompt)
                ))
                .maxTokens(maxTokens)
                .temperature(config.getTemperature())
                .build();
            
            String jsonPayload = objectMapper.writeValueAsString(requestPayload);
            
            // Build HTTP request
            Request request = new Request.Builder()
                .url(config.getBaseUrl() + "/chat/completions")
                .header("Authorization", "Bearer " + config.getApiKey())
                .header("Content-Type", "application/json")
                .header("HTTP-Referer", "https://dengin.com")
                .header("X-Title", "Dengin Backend")
                .post(RequestBody.create(jsonPayload, MediaType.parse("application/json")))
                .build();
            
            // Execute request
            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No error body";
                    log.error("OpenRouter API error - Status: {}, Body: {}", response.code(), errorBody);
                    throw new OpenRouterException(
                        "OpenRouter API request failed with status " + response.code() + ": " + errorBody
                    );
                }
                
                String responseBody = response.body().string();
                OpenRouterResponse openRouterResponse = objectMapper.readValue(
                    responseBody, 
                    OpenRouterResponse.class
                );
                
                if (openRouterResponse.getChoices() == null || openRouterResponse.getChoices().isEmpty()) {
                    throw new OpenRouterException("OpenRouter response has no choices");
                }
                
                String content = openRouterResponse.getChoices().get(0).getMessage().getContent();
                
                log.debug("OpenRouter response - Tokens: {}, Content length: {}", 
                        openRouterResponse.getUsage().getTotalTokens(), 
                        content.length());
                
                return content;
            }
            
        } catch (IOException ex) {
            log.error("OpenRouter HTTP error", ex);
            throw new OpenRouterException("Failed to communicate with OpenRouter API", ex);
        }
    }
    
    /**
     * Chat completion with default max tokens from config
     */
    public String chatCompletion(String systemPrompt, String userPrompt) {
        return chatCompletion(systemPrompt, userPrompt, config.getMaxTokens());
    }
    
    // ============================================================================
    // DTOs for OpenRouter API
    // ============================================================================
    
    /**
     * OpenRouter chat completion request
     */
    @Data
    @lombok.Builder
    private static class OpenRouterRequest {
        private String model;
        private List<Message> messages;
        @JsonProperty("max_tokens")
        private int maxTokens;
        private double temperature;
    }
    
    /**
     * Chat message
     */
    @Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class Message {
        private String role; // "system", "user", "assistant"
        private String content;
    }
    
    /**
     * OpenRouter chat completion response
     */
    @Data
    @lombok.NoArgsConstructor
    private static class OpenRouterResponse {
        private String id;
        private String model;
        private List<Choice> choices;
        private Usage usage;
    }
    
    /**
     * Response choice
     */
    @Data
    @lombok.NoArgsConstructor
    private static class Choice {
        private Message message;
        @JsonProperty("finish_reason")
        private String finishReason;
    }
    
    /**
     * Token usage statistics
     */
    @Data
    @lombok.NoArgsConstructor
    private static class Usage {
        @JsonProperty("prompt_tokens")
        private int promptTokens;
        @JsonProperty("completion_tokens")
        private int completionTokens;
        @JsonProperty("total_tokens")
        private int totalTokens;
    }
    
    /**
     * Custom exception for OpenRouter errors
     */
    public static class OpenRouterException extends RuntimeException {
        public OpenRouterException(String message) {
            super(message);
        }
        
        public OpenRouterException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
