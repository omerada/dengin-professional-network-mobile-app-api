package com.meslektas.social.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AI Trend Response DTO
 * 
 * API response format for AI-generated trends.
 * Maps from AITrend domain model to API contract.
 * 
 * Mobile App Usage:
 * - AITrendInsightCard component
 * - FeedScreen header
 * - Profession-specific trend insights
 * 
 * Example Response:
 * ```json
 * {
 *   "id": "trend_1234567890_5678",
 *   "title": "Telemedicine ve Uzaktan Hasta Takibi 2025",
 *   "professionCategory": "MEDICAL"
 * }
 * ```
 * 
 * @see com.meslektas.social.domain.model.AITrend
 * @see TrendController
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AITrendResponse {
    
    /**
     * Unique trend ID
     */
    private String id;
    
    /**
     * Trend title in Turkish
     */
    private String title;
    
    /**
     * Profession category
     * Values: MEDICAL, LEGAL, ENGINEERING, EDUCATION, SERVICE, CREATIVE, BUSINESS, OTHER
     */
    private String professionCategory;
    
    /**
     * Optional: When trend was generated
     * Not sent to mobile by default (reduces payload)
     */
    private LocalDateTime generatedAt;
}
