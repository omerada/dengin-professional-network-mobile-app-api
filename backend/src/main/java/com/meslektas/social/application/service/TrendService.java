package com.meslektas.social.application.service;

import com.meslektas.identity.domain.model.ProfessionCategory;
import com.meslektas.social.application.dto.AITrendResponse;
import com.meslektas.social.domain.model.AITrend;
import com.meslektas.social.domain.service.AITrendGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Trend Application Service
 * 
 * Orchestrates trend-related use cases:
 * - Get AI trends for profession category
 * - Map domain models to DTOs
 * - Cache management
 * 
 * Layer: Application Service (coordinates domain services)
 * Transaction: Read-only (trends are generated, not persisted)
 * Caching: 1 hour per profession category
 * 
 * @see AITrendGenerationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrendService {
    
    private final AITrendGenerationService trendGenerationService;
    
    /**
     * Get AI-generated trends for specific profession category
     * 
     * @param category Profession category
     * @return List of 3 trend responses
     * @throws IllegalArgumentException if category is invalid
     */
    @Cacheable(
        value = "profession-trends",
        key = "#category.name()",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<AITrendResponse> getTrendsByProfession(ProfessionCategory category) {
        log.debug("Getting trends for profession: {}", category);
        
        List<AITrend> trends = trendGenerationService.generateTrends(category);
        
        return trends.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get trends for profession category by name (String)
     * 
     * @param categoryName Category name (e.g., "MEDICAL", "LEGAL")
     * @return List of trend responses
     * @throws IllegalArgumentException if category name is invalid
     */
    public List<AITrendResponse> getTrendsByProfessionName(String categoryName) {
        try {
            ProfessionCategory category = ProfessionCategory.valueOf(categoryName.toUpperCase());
            return getTrendsByProfession(category);
        } catch (IllegalArgumentException ex) {
            log.error("Invalid profession category: {}", categoryName);
            throw new IllegalArgumentException(
                "Invalid profession category: " + categoryName + 
                ". Valid values: " + String.join(", ", getProfessionCategoryNames())
            );
        }
    }
    
    /**
     * Map AITrend domain model to AITrendResponse DTO
     */
    private AITrendResponse mapToResponse(AITrend trend) {
        AITrendResponse response = new AITrendResponse();
        response.setId(trend.getId());
        response.setTitle(trend.getTitle());
        response.setProfessionCategory(trend.getProfessionCategory());
        // Don't send generatedAt to mobile (reduce payload)
        return response;
    }
    
    /**
     * Get all valid profession category names
     */
    private List<String> getProfessionCategoryNames() {
        return List.of(
            "MEDICAL", "LEGAL", "ENGINEERING", "EDUCATION",
            "SERVICE", "CREATIVE", "BUSINESS", "OTHER"
        );
    }
}
