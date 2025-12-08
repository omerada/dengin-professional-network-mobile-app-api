package com.meslektas.social.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AI Trend Domain Model
 * 
 * Represents an AI-generated trend insight for a specific profession category.
 * Trends are dynamically generated using OpenRouter API based on:
 * - Profession category
 * - Current date/time
 * - Industry news
 * - User interests
 * 
 * Value Object: Immutable once created
 * Lifecycle: Generated on-demand, cached for TTL
 * 
 * Example Trends:
 * - MEDICAL: "Telemedicine ve Uzaktan Hasta Takibi 2025"
 * - LEGAL: "Dijital Sözleşmelerde Blockchain Kullanımı"
 * - ENGINEERING: "Yapay Zeka Destekli Kod İnceleme Araçları"
 * 
 * @see com.meslektas.identity.domain.model.ProfessionCategory
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AITrend {
    
    /**
     * Unique trend ID (generated)
     */
    private String id;
    
    /**
     * Trend title in Turkish (AI-generated)
     * Max length: 100 characters
     */
    private String title;
    
    /**
     * Profession category this trend belongs to
     */
    private String professionCategory;
    
    /**
     * When this trend was generated
     */
    private LocalDateTime generatedAt;
    
    /**
     * Optional description (future enhancement)
     */
    private String description;
    
    /**
     * Relevance score (0.0 - 1.0)
     * Based on: recency, user interests, industry impact
     */
    private double relevanceScore;
    
    /**
     * Create new AI trend
     */
    public static AITrend create(String title, String professionCategory) {
        AITrend trend = new AITrend();
        trend.setId(generateId());
        trend.setTitle(title);
        trend.setProfessionCategory(professionCategory);
        trend.setGeneratedAt(LocalDateTime.now());
        trend.setRelevanceScore(1.0); // Default high relevance
        return trend;
    }
    
    /**
     * Generate unique trend ID
     * Format: trend_<timestamp>_<random>
     */
    private static String generateId() {
        return "trend_" + System.currentTimeMillis() + "_" + 
               (int)(Math.random() * 10000);
    }
    
    /**
     * Check if trend is stale (older than TTL)
     * @param ttlMinutes Cache TTL in minutes
     */
    public boolean isStale(int ttlMinutes) {
        return generatedAt.plusMinutes(ttlMinutes).isBefore(LocalDateTime.now());
    }
}
