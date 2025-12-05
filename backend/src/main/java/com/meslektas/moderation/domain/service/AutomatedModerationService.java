package com.meslektas.moderation.domain.service;

import com.meslektas.moderation.domain.model.ModerationScore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Domain service for automated content moderation.
 *
 * Analyzes content for potential policy violations and assigns risk scores.
 * Used for pre-screening content before human review.
 */
@Service
public class AutomatedModerationService {

    // Blacklisted keywords (can be loaded from database in production)
    private static final List<String> BLACKLIST_KEYWORDS = List.of(
            // Spam indicators
            "spam", "scam", "fake", "buy followers", "takipçi satın al",
            // Professional misconduct
            "sahte diploma", "fake certificate", "sahte belge",
            // Inappropriate content markers
            "xxx", "adult content", "yetişkin içerik");

    // High severity keywords that require immediate escalation
    private static final List<String> HIGH_SEVERITY_KEYWORDS = List.of(
            "bomb", "bomba", "kill", "öldür", "threat", "tehdit",
            "suicide", "intihar", "terror", "terör");

    // URL detection pattern
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[^\\s]+", Pattern.CASE_INSENSITIVE);

    // Repeated character pattern (spam indicator)
    private static final Pattern REPEATED_CHARS_PATTERN = Pattern.compile("([a-zA-Z])\\1{4,}");

    // Email pattern for potential spam
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    // Phone number pattern
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\+?[0-9]{10,15}");

    /**
     * Score content for moderation risk.
     *
     * @param content The content to analyze
     * @return ModerationScore with risk level and details
     */
    public ModerationScore scoreContent(String content) {
        if (content == null || content.isBlank()) {
            return ModerationScore.low("Empty content");
        }

        String normalizedContent = content.toLowerCase().trim();
        int score = 0;
        List<String> flags = new ArrayList<>();

        // Check high severity keywords first (immediate escalation)
        int highSeverityScore = checkHighSeverityKeywords(normalizedContent);
        if (highSeverityScore > 0) {
            score += highSeverityScore;
            flags.add("High severity keyword detected");
        }

        // Check blacklist keywords
        int blacklistScore = checkBlacklistKeywords(normalizedContent);
        if (blacklistScore > 0) {
            score += blacklistScore;
            flags.add("Blacklisted keywords found");
        }

        // Check excessive URLs (spam indicator)
        int urlScore = checkExcessiveUrls(content);
        if (urlScore > 0) {
            score += urlScore;
            flags.add("Excessive URLs detected");
        }

        // Check excessive caps (shouting)
        int capsScore = checkExcessiveCaps(content);
        if (capsScore > 0) {
            score += capsScore;
            flags.add("Excessive capitalization");
        }

        // Check repeated characters (spam indicator)
        int repeatedScore = checkRepeatedCharacters(content);
        if (repeatedScore > 0) {
            score += repeatedScore;
            flags.add("Repeated characters detected");
        }

        // Check for contact information spam
        int contactScore = checkContactSpam(content);
        if (contactScore > 0) {
            score += contactScore;
            flags.add("Contact information spam");
        }

        // Check content length (too short might be spam)
        int lengthScore = checkContentLength(content);
        if (lengthScore > 0) {
            score += lengthScore;
            flags.add("Suspicious content length");
        }

        String details = flags.isEmpty() ? "No issues detected" : String.join(", ", flags);
        return ModerationScore.of(score, details);
    }

    /**
     * Check if content should be auto-flagged for review.
     */
    public boolean shouldAutoFlag(ModerationScore score) {
        return score.shouldAutoFlag();
    }

    /**
     * Check if content should be auto-rejected.
     */
    public boolean shouldAutoReject(ModerationScore score) {
        return score.shouldAutoReject();
    }

    /**
     * Check if content requires immediate escalation.
     */
    public boolean requiresImmediateEscalation(String content) {
        if (content == null) {
            return false;
        }
        String normalizedContent = content.toLowerCase();
        return HIGH_SEVERITY_KEYWORDS.stream()
                .anyMatch(normalizedContent::contains);
    }

    // ==================== Private Scoring Methods ====================

    private int checkHighSeverityKeywords(String content) {
        int score = 0;
        for (String keyword : HIGH_SEVERITY_KEYWORDS) {
            if (content.contains(keyword)) {
                score += 50; // Immediate high score
            }
        }
        return Math.min(score, 100);
    }

    private int checkBlacklistKeywords(String content) {
        int score = 0;
        for (String keyword : BLACKLIST_KEYWORDS) {
            if (content.contains(keyword)) {
                score += 30;
            }
        }
        return Math.min(score, 60);
    }

    private int checkExcessiveUrls(String content) {
        Matcher matcher = URL_PATTERN.matcher(content);
        int urlCount = 0;
        while (matcher.find()) {
            urlCount++;
        }

        if (urlCount > 5) {
            return 30;
        } else if (urlCount > 3) {
            return 20;
        } else if (urlCount > 1) {
            return 10;
        }
        return 0;
    }

    private int checkExcessiveCaps(String content) {
        if (content.length() < 10) {
            return 0;
        }

        long capsCount = content.chars()
                .filter(Character::isUpperCase)
                .count();

        double capsRatio = (double) capsCount / content.length();

        if (capsRatio > 0.7) {
            return 20;
        } else if (capsRatio > 0.5) {
            return 15;
        }
        return 0;
    }

    private int checkRepeatedCharacters(String content) {
        Matcher matcher = REPEATED_CHARS_PATTERN.matcher(content);
        int count = 0;
        while (matcher.find()) {
            count++;
        }

        if (count >= 3) {
            return 15;
        } else if (count >= 1) {
            return 10;
        }
        return 0;
    }

    private int checkContactSpam(String content) {
        int score = 0;

        // Count emails
        Matcher emailMatcher = EMAIL_PATTERN.matcher(content);
        int emailCount = 0;
        while (emailMatcher.find()) {
            emailCount++;
        }
        if (emailCount > 2) {
            score += 20;
        } else if (emailCount > 0) {
            score += 10;
        }

        // Count phone numbers
        Matcher phoneMatcher = PHONE_PATTERN.matcher(content);
        int phoneCount = 0;
        while (phoneMatcher.find()) {
            phoneCount++;
        }
        if (phoneCount > 2) {
            score += 20;
        } else if (phoneCount > 0) {
            score += 10;
        }

        return Math.min(score, 30);
    }

    private int checkContentLength(String content) {
        int length = content.length();

        // Very short content might be spam or low quality
        if (length < 10) {
            return 10;
        }
        // Extremely long content might be spam
        if (length > 10000) {
            return 15;
        }
        return 0;
    }

    /**
     * Analyze content for specific violations.
     *
     * @param content The content to analyze
     * @return List of detected violation types
     */
    public List<String> detectViolations(String content) {
        List<String> violations = new ArrayList<>();

        if (content == null || content.isBlank()) {
            return violations;
        }

        String normalizedContent = content.toLowerCase();

        // Check each violation type
        if (HIGH_SEVERITY_KEYWORDS.stream().anyMatch(normalizedContent::contains)) {
            violations.add("VIOLENCE_OR_THREAT");
        }

        if (BLACKLIST_KEYWORDS.stream().anyMatch(normalizedContent::contains)) {
            violations.add("SPAM_OR_SCAM");
        }

        Matcher urlMatcher = URL_PATTERN.matcher(content);
        int urlCount = 0;
        while (urlMatcher.find()) {
            urlCount++;
        }
        if (urlCount > 3) {
            violations.add("EXCESSIVE_LINKS");
        }

        double capsRatio = (double) content.chars()
                .filter(Character::isUpperCase)
                .count() / content.length();
        if (capsRatio > 0.5 && content.length() > 20) {
            violations.add("EXCESSIVE_CAPS");
        }

        return violations;
    }
}
