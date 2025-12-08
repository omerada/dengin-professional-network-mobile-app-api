package com.meslektas.social.domain.service;

import com.meslektas.identity.domain.model.ProfessionCategory;
import com.meslektas.social.domain.model.AITrend;
import com.meslektas.social.infrastructure.ai.OpenRouterClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AI Trend Generation Domain Service
 * 
 * Generates profession-specific trend insights using OpenRouter AI.
 * 
 * Responsibilities:
 * - Generate Turkish trend titles for each profession category
 * - Ensure trends are relevant, current, and professional
 * - Cache results to minimize API costs
 * - Handle AI response parsing and validation
 * 
 * Business Rules:
 * - Always generate 3 trends per profession
 * - Trends must be in Turkish language
 * - Trends must be professional and factual
 * - Trends should reflect 2025 industry developments
 * - Cache for 1 hour per profession category
 * 
 * Example Output:
 * MEDICAL → [
 *   "Telemedicine ve Uzaktan Hasta Takibi 2025",
 *   "Yapay Zeka Destekli Tanı Sistemleri",
 *   "Kişiselleştirilmiş Tedavi Yaklaşımları"
 * ]
 * 
 * @see OpenRouterClient
 * @see ProfessionCategory
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AITrendGenerationService {
    
    private final OpenRouterClient openRouterClient;
    
    private static final int TRENDS_PER_PROFESSION = 3;
    
    /**
     * Generate AI trends for specific profession category
     * 
     * @param category Profession category (MEDICAL, LEGAL, etc.)
     * @return List of 3 AI-generated trends
     * @throws IllegalArgumentException if category is null
     */
    @Cacheable(
        value = "ai-trends",
        key = "#category.name()",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<AITrend> generateTrends(ProfessionCategory category) {
        if (category == null) {
            throw new IllegalArgumentException("Profession category cannot be null");
        }
        
        log.info("Generating AI trends for profession category: {}", category);
        
        try {
            String systemPrompt = buildSystemPrompt();
            String userPrompt = buildUserPrompt(category);
            
            String aiResponse = openRouterClient.chatCompletion(systemPrompt, userPrompt, 200);
            
            List<AITrend> trends = parseAIResponse(aiResponse, category);
            
            log.info("Successfully generated {} trends for {}", trends.size(), category);
            return trends;
            
        } catch (Exception ex) {
            log.error("Failed to generate AI trends for {}", category, ex);
            
            // Fallback to static trends if AI fails
            return generateFallbackTrends(category);
        }
    }
    
    /**
     * Build system prompt for AI
     * Defines AI role, constraints, and output format
     */
    private String buildSystemPrompt() {
        return """
            Sen Türkiye'deki profesyoneller için trend analizleri yapan bir uzmansın.
            
            Görevin: Belirtilen meslek kategorisi için 2025 yılına özgü, güncel ve profesyonel trend başlıkları üretmek.
            
            Kurallar:
            - Tam olarak 3 trend başlığı üret
            - Her başlık Türkçe olmalı
            - Her başlık maksimum 50 karakter olmalı
            - Başlıklar profesyonel ve ciddi olmalı
            - Gerçek dünya trendlerini yansıtmalı (yapay zeka, dijitalleşme, sürdürülebilirlik vb.)
            - Her başlığı yeni satırda ver
            - Sadece başlıkları ver, açıklama veya numara ekleme
            
            Örnek Çıktı:
            Telemedicine ve Uzaktan Hasta Takibi 2025
            Yapay Zeka Destekli Tanı Sistemleri
            Kişiselleştirilmiş Tedavi Yaklaşımları
            """;
    }
    
    /**
     * Build user prompt for specific profession category
     */
    private String buildUserPrompt(ProfessionCategory category) {
        String categoryDescription = getProfessionCategoryDescription(category);
        
        return String.format(
            "%s kategorisi için 3 güncel trend başlığı üret. " +
            "Başlıklar 2025 yılına özgü teknoloji ve sektör gelişmelerini yansıtmalı.",
            categoryDescription
        );
    }
    
    /**
     * Get Turkish description for profession category
     */
    private String getProfessionCategoryDescription(ProfessionCategory category) {
        return switch (category) {
            case MEDICAL -> "Sağlık ve Tıp";
            case LEGAL -> "Hukuk ve Avukatlık";
            case ENGINEERING -> "Mühendislik ve Teknoloji";
            case EDUCATION -> "Eğitim ve Öğretim";
            case SERVICE -> "Hizmet Sektörü";
            case CREATIVE -> "Yaratıcı ve Sanat Sektörü";
            case BUSINESS -> "İş ve Finans";
            case OTHER -> "Diğer Profesyonel Alanlar";
        };
    }
    
    /**
     * Parse AI response into AITrend objects
     * Expected format: One trend title per line
     */
    private List<AITrend> parseAIResponse(String response, ProfessionCategory category) {
        List<AITrend> trends = new ArrayList<>();
        
        String[] lines = response.trim().split("\n");
        
        for (String line : lines) {
            String title = line.trim();
            
            // Skip empty lines or lines with numbers/bullets
            if (title.isEmpty() || title.matches("^[0-9.\\-*]+.*")) {
                title = title.replaceAll("^[0-9.\\-*]+\\s*", "").trim();
            }
            
            if (!title.isEmpty() && title.length() <= 100) {
                AITrend trend = AITrend.create(title, category.name());
                trends.add(trend);
                
                // Limit to 3 trends
                if (trends.size() >= TRENDS_PER_PROFESSION) {
                    break;
                }
            }
        }
        
        // Ensure we have exactly 3 trends
        while (trends.size() < TRENDS_PER_PROFESSION) {
            trends.add(AITrend.create(
                "Profesyonel Gelişim ve İnovasyon",
                category.name()
            ));
        }
        
        return trends;
    }
    
    /**
     * Fallback trends when AI service is unavailable
     * Static but professional Turkish trends per category
     */
    private List<AITrend> generateFallbackTrends(ProfessionCategory category) {
        log.warn("Using fallback trends for {}", category);
        
        List<String> fallbackTitles = switch (category) {
            case MEDICAL -> List.of(
                "Telemedicine ve Dijital Sağlık Hizmetleri",
                "Yapay Zeka ile Erken Tanı Sistemleri",
                "Hasta Merkezli Bakım Modelleri"
            );
            case LEGAL -> List.of(
                "Dijital Hukuk ve Elektronik İmza",
                "Veri Koruma ve KVKK Uygulamaları",
                "Alternatif Uyuşmazlık Çözüm Yöntemleri"
            );
            case ENGINEERING -> List.of(
                "Sürdürülebilir Mühendislik Çözümleri",
                "Yapay Zeka ve Otomasyon Sistemleri",
                "Akıllı Şehir Teknolojileri"
            );
            case EDUCATION -> List.of(
                "Hibrit Öğrenme Modelleri",
                "Eğitimde Yapay Zeka Kullanımı",
                "Kişiselleştirilmiş Öğrenme Yolları"
            );
            case SERVICE -> List.of(
                "Müşteri Deneyimi Dijitalleşmesi",
                "Otomatik Hizmet Sistemleri",
                "Kalite ve Standart Yönetimi"
            );
            case CREATIVE -> List.of(
                "Dijital Sanat ve NFT Pazarı",
                "Yapay Zeka ile İçerik Üretimi",
                "Metaverse ve Sanal Sergiler"
            );
            case BUSINESS -> List.of(
                "Dijital Dönüşüm Stratejileri",
                "Sürdürülebilir İş Modelleri",
                "Veri Odaklı Karar Verme"
            );
            case OTHER -> List.of(
                "Profesyonel Gelişim Programları",
                "Uzaktan Çalışma Teknolojileri",
                "Sektörel İnovasyon Trendleri"
            );
        };
        
        List<AITrend> trends = new ArrayList<>();
        for (String title : fallbackTitles) {
            trends.add(AITrend.create(title, category.name()));
        }
        
        return trends;
    }
}
