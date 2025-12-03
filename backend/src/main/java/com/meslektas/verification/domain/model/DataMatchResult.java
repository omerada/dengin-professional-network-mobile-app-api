package com.meslektas.verification.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Data Match Result - Value Object
 * 
 * Represents the result of matching extracted document data with user profile.
 * Verifies that the document belongs to the person claiming verification.
 * 
 * Matching Checks:
 * - Name matching (fuzzy match for Turkish characters)
 * - Date of birth matching
 * - Profession/title matching
 * - Document number validation
 * 
 * Business Rules:
 * - Name match score >= 80%: Valid
 * - Turkish character normalization (ı→i, ğ→g, etc.)
 * - Fuzzy matching for typos and OCR errors
 */
@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DataMatchResult {
    
    /**
     * Overall data match score (0-100%)
     */
    @Column(name = "data_match_score")
    private Double overallMatchScore;
    
    /**
     * Name match score (0-100%)
     */
    @Column(name = "name_match_score")
    private Double nameMatchScore;
    
    /**
     * Whether name matched
     */
    @Column(name = "name_matched")
    private Boolean nameMatched;
    
    /**
     * Name extracted from document
     */
    @Column(name = "extracted_name", length = 200)
    private String extractedName;
    
    /**
     * Name from user profile
     */
    @Column(name = "profile_name", length = 200)
    private String profileName;
    
    /**
     * Profession/title match score (0-100%)
     */
    @Column(name = "profession_match_score")
    private Double professionMatchScore;
    
    /**
     * Whether profession matched
     */
    @Column(name = "profession_matched")
    private Boolean professionMatched;
    
    /**
     * Title/profession extracted from document
     */
    @Column(name = "extracted_profession", length = 200)
    private String extractedProfession;
    
    /**
     * Document number extracted
     */
    @Column(name = "extracted_doc_number", length = 100)
    private String extractedDocumentNumber;
    
    /**
     * Whether document number is valid format
     */
    @Column(name = "doc_number_valid")
    private Boolean documentNumberValid;
    
    /**
     * Matching details for audit
     */
    @Column(name = "match_details", columnDefinition = "TEXT")
    private String matchDetails;
    
    // Thresholds
    private static final double MIN_NAME_MATCH = 80.0;
    private static final double MIN_PROFESSION_MATCH = 70.0;
    private static final double MIN_OVERALL_MATCH = 75.0;
    
    private DataMatchResult(
        Double overallMatchScore,
        Double nameMatchScore,
        Boolean nameMatched,
        String extractedName,
        String profileName,
        Double professionMatchScore,
        Boolean professionMatched,
        String extractedProfession,
        String extractedDocumentNumber,
        Boolean documentNumberValid,
        String matchDetails
    ) {
        this.overallMatchScore = overallMatchScore;
        this.nameMatchScore = nameMatchScore;
        this.nameMatched = nameMatched;
        this.extractedName = extractedName;
        this.profileName = profileName;
        this.professionMatchScore = professionMatchScore;
        this.professionMatched = professionMatched;
        this.extractedProfession = extractedProfession;
        this.extractedDocumentNumber = extractedDocumentNumber;
        this.documentNumberValid = documentNumberValid;
        this.matchDetails = matchDetails;
    }
    
    /**
     * Create successful match result
     */
    public static DataMatchResult matched(
        double overallMatchScore,
        double nameMatchScore,
        String extractedName,
        String profileName,
        double professionMatchScore,
        String extractedProfession,
        String extractedDocumentNumber,
        boolean documentNumberValid,
        String matchDetails
    ) {
        return new DataMatchResult(
            overallMatchScore,
            nameMatchScore,
            nameMatchScore >= MIN_NAME_MATCH,
            extractedName,
            profileName,
            professionMatchScore,
            professionMatchScore >= MIN_PROFESSION_MATCH,
            extractedProfession,
            extractedDocumentNumber,
            documentNumberValid,
            matchDetails
        );
    }
    
    /**
     * Create partial match result
     */
    public static DataMatchResult partialMatch(
        double overallMatchScore,
        String extractedName,
        String profileName,
        String extractedDocumentNumber,
        String matchDetails
    ) {
        return new DataMatchResult(
            overallMatchScore,
            null,
            false,
            extractedName,
            profileName,
            null,
            false,
            null,
            extractedDocumentNumber,
            true,
            matchDetails
        );
    }
    
    /**
     * Create no match result
     */
    public static DataMatchResult noMatch(String reason) {
        return new DataMatchResult(
            0.0,
            0.0,
            false,
            null,
            null,
            0.0,
            false,
            null,
            null,
            false,
            reason
        );
    }
    
    /**
     * Check if data matches sufficiently
     */
    public boolean isMatched() {
        return overallMatchScore != null && 
               overallMatchScore >= MIN_OVERALL_MATCH;
    }
    
    /**
     * Check if name specifically matched
     */
    public boolean isNameMatched() {
        return nameMatched != null && nameMatched &&
               nameMatchScore != null && nameMatchScore >= MIN_NAME_MATCH;
    }
    
    /**
     * Check if profession matched
     */
    public boolean isProfessionMatched() {
        return professionMatched != null && professionMatched &&
               professionMatchScore != null && professionMatchScore >= MIN_PROFESSION_MATCH;
    }
    
    /**
     * Get data match score for confidence calculation (0-100)
     */
    public double getMatchScore() {
        if (overallMatchScore != null) {
            return overallMatchScore;
        }
        return 0.0;
    }
    
    /**
     * Check if requires manual review (partial match)
     */
    public boolean requiresManualReview() {
        if (overallMatchScore == null) return true;
        
        // Partial match - needs review
        return overallMatchScore >= 50.0 && overallMatchScore < MIN_OVERALL_MATCH;
    }
    
    /**
     * Normalize Turkish characters for comparison
     * ı → i, İ → I, ğ → g, Ğ → G, ü → u, Ü → U, ş → s, Ş → S, ö → o, Ö → O, ç → c, Ç → C
     */
    public static String normalizeTurkish(String text) {
        if (text == null) return null;
        
        return text
            .replace('ı', 'i')
            .replace('İ', 'I')
            .replace('ğ', 'g')
            .replace('Ğ', 'G')
            .replace('ü', 'u')
            .replace('Ü', 'U')
            .replace('ş', 's')
            .replace('Ş', 'S')
            .replace('ö', 'o')
            .replace('Ö', 'O')
            .replace('ç', 'c')
            .replace('Ç', 'C')
            .toUpperCase()
            .trim();
    }
    
    /**
     * Calculate Levenshtein distance-based similarity
     */
    public static double calculateNameSimilarity(String name1, String name2) {
        if (name1 == null || name2 == null) return 0.0;
        
        String normalized1 = normalizeTurkish(name1);
        String normalized2 = normalizeTurkish(name2);
        
        if (normalized1.equals(normalized2)) return 100.0;
        
        int distance = levenshteinDistance(normalized1, normalized2);
        int maxLength = Math.max(normalized1.length(), normalized2.length());
        
        if (maxLength == 0) return 100.0;
        
        double similarity = (1.0 - (double) distance / maxLength) * 100;
        return Math.max(0.0, similarity);
    }
    
    /**
     * Levenshtein distance calculation
     */
    private static int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }
        
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
    
    @Override
    public String toString() {
        return String.format(
            "DataMatchResult{overall=%.2f%%, name=%s, profession=%s}",
            overallMatchScore != null ? overallMatchScore : 0.0,
            nameMatched != null && nameMatched ? "MATCHED" : "NO MATCH",
            professionMatched != null && professionMatched ? "MATCHED" : "NO MATCH"
        );
    }
}
