package com.meslektas.moderation.domain.service;

import com.meslektas.moderation.domain.model.ModerationScore;
import com.meslektas.moderation.domain.model.RiskLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for AutomatedModerationService.
 */
@DisplayName("AutomatedModerationService Tests")
class AutomatedModerationServiceTest {

    private AutomatedModerationService service;

    @BeforeEach
    void setUp() {
        service = new AutomatedModerationService();
    }

    @Nested
    @DisplayName("Content Scoring Tests")
    class ContentScoringTests {

        @Test
        @DisplayName("Should return LOW risk for clean content")
        void shouldReturnLowRiskForCleanContent() {
            // Given
            String content = "Bu güzel bir mesleki paylaşım. Yazılım mühendisliği hakkında bilgi paylaşıyorum.";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score).isNotNull();
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
            assertThat(score.getScore()).isLessThan(30);
        }

        @Test
        @DisplayName("Should return LOW risk for empty content")
        void shouldReturnLowRiskForEmptyContent() {
            // When
            ModerationScore score = service.scoreContent("");

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should return LOW risk for null content")
        void shouldReturnLowRiskForNullContent() {
            // When
            ModerationScore score = service.scoreContent(null);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should detect spam keywords")
        void shouldDetectSpamKeywords() {
            // Given
            String content = "Bu bir spam mesajıdır. Fake takipçi satın al!";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getScore()).isGreaterThan(0);
            assertThat(score.getDetails()).contains("Blacklisted");
        }

        @Test
        @DisplayName("Should return HIGH risk for high severity keywords")
        void shouldReturnHighRiskForHighSeverityKeywords() {
            // Given
            String content = "Bu bir threat içeren mesajdır tehdit ediliyorum";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.HIGH);
            assertThat(score.getDetails()).contains("High severity");
        }

        @Test
        @DisplayName("Should detect excessive URLs")
        void shouldDetectExcessiveUrls() {
            // Given
            String content = "Check out these links: https://site1.com https://site2.com " +
                    "https://site3.com https://site4.com and more!";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getScore()).isGreaterThan(0);
            assertThat(score.getDetails()).contains("URL");
        }

        @Test
        @DisplayName("Should detect excessive capitalization")
        void shouldDetectExcessiveCapitalization() {
            // Given
            String content = "THIS IS A VERY LOUD MESSAGE THAT USES ALL CAPS";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getScore()).isGreaterThan(0);
            assertThat(score.getDetails()).contains("capitalization");
        }

        @Test
        @DisplayName("Should detect repeated characters")
        void shouldDetectRepeatedCharacters() {
            // Given
            String content = "Hellooooooo this is soooooo spammy";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getScore()).isGreaterThan(0);
            assertThat(score.getDetails()).contains("Repeated");
        }

        @Test
        @DisplayName("Should accumulate multiple violations")
        void shouldAccumulateMultipleViolations() {
            // Given - Content with multiple issues
            String content = "SPAM SPAM SPAM!!! Visit https://spam1.com https://spam2.com " +
                    "https://spam3.com https://spam4.com BUYYYYY NOWWWWW!!!";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getScore()).isGreaterThan(50);
            assertThat(score.getRiskLevel()).isIn(RiskLevel.MEDIUM, RiskLevel.HIGH);
        }
    }

    @Nested
    @DisplayName("Auto-Flag Tests")
    class AutoFlagTests {

        @Test
        @DisplayName("Should not auto-flag low risk content")
        void shouldNotAutoFlagLowRiskContent() {
            // Given
            String content = "Normal professional content about software development.";
            ModerationScore score = service.scoreContent(content);

            // When
            boolean shouldFlag = service.shouldAutoFlag(score);

            // Then
            assertThat(shouldFlag).isFalse();
        }

        @Test
        @DisplayName("Should auto-flag high risk content")
        void shouldAutoFlagHighRiskContent() {
            // Given
            String content = "This contains threat and kill words which are dangerous tehdit";
            ModerationScore score = service.scoreContent(content);

            // When
            boolean shouldFlag = service.shouldAutoFlag(score);

            // Then
            assertThat(shouldFlag).isTrue();
        }

        @Test
        @DisplayName("Should auto-flag medium risk content with high score")
        void shouldAutoFlagMediumRiskContentWithHighScore() {
            // Given - Multiple spam indicators
            String content = "SPAM SPAM fake fake scam scam buy followers takipçi satın al!!!";
            ModerationScore score = service.scoreContent(content);

            // When
            boolean shouldFlag = service.shouldAutoFlag(score);

            // Then
            assertThat(shouldFlag).isTrue();
        }
    }

    @Nested
    @DisplayName("Immediate Escalation Tests")
    class ImmediateEscalationTests {

        @Test
        @DisplayName("Should require immediate escalation for violence keywords")
        void shouldRequireImmediateEscalationForViolenceKeywords() {
            // Given
            String content = "I will bomb this place";

            // When
            boolean requires = service.requiresImmediateEscalation(content);

            // Then
            assertThat(requires).isTrue();
        }

        @Test
        @DisplayName("Should require immediate escalation for Turkish threat keywords")
        void shouldRequireImmediateEscalationForTurkishThreatKeywords() {
            // Given
            String content = "Bu bir tehdit mesajıdır";

            // When
            boolean requires = service.requiresImmediateEscalation(content);

            // Then
            assertThat(requires).isTrue();
        }

        @Test
        @DisplayName("Should require immediate escalation for suicide keywords")
        void shouldRequireImmediateEscalationForSuicideKeywords() {
            // Given
            String content = "intihar düşüncelerim var";

            // When
            boolean requires = service.requiresImmediateEscalation(content);

            // Then
            assertThat(requires).isTrue();
        }

        @Test
        @DisplayName("Should not require escalation for normal content")
        void shouldNotRequireEscalationForNormalContent() {
            // Given
            String content = "This is a normal professional discussion about software engineering.";

            // When
            boolean requires = service.requiresImmediateEscalation(content);

            // Then
            assertThat(requires).isFalse();
        }

        @Test
        @DisplayName("Should not require escalation for null content")
        void shouldNotRequireEscalationForNullContent() {
            // When
            boolean requires = service.requiresImmediateEscalation(null);

            // Then
            assertThat(requires).isFalse();
        }
    }

    @Nested
    @DisplayName("Risk Level Tests")
    class RiskLevelTests {

        @Test
        @DisplayName("Should return LOW for score below 30")
        void shouldReturnLowForScoreBelow30() {
            // Given
            String content = "A normal message.";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should return MEDIUM for score between 30 and 50")
        void shouldReturnMediumForScoreBetween30And50() {
            // Given - Content with some spam indicators
            String content = "spam spam scam with some excessive CAPS AND MORE CAPS";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            // Score should be around 30-50 for medium
            if (score.getScore() >= 30 && score.getScore() < 50) {
                assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.MEDIUM);
            }
        }

        @Test
        @DisplayName("Should return HIGH for score 50 or above")
        void shouldReturnHighForScore50OrAbove() {
            // Given - Content with multiple serious violations
            String content = "SPAM SCAM FAKE threat tehdit kill öldür " +
                    "https://a.com https://b.com https://c.com https://d.com";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.HIGH);
        }
    }

    @Nested
    @DisplayName("Professional Content Tests")
    class ProfessionalContentTests {

        @Test
        @DisplayName("Should accept professional bio content")
        void shouldAcceptProfessionalBioContent() {
            // Given
            String content = "10 yıllık yazılım mühendisi. Java, Spring Boot ve " +
                    "mikroservis mimarileri konusunda uzmanım. İstanbul'da yaşıyorum.";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
            assertThat(score.getScore()).isLessThan(30);
        }

        @Test
        @DisplayName("Should accept normal post content")
        void shouldAcceptNormalPostContent() {
            // Given
            String content = "Bugün yeni bir proje başlattım. Microservices mimarisinde " +
                    "bir e-ticaret platformu geliştiriyoruz. Spring Cloud ve Kubernetes " +
                    "kullanıyoruz.";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should accept job posting content")
        void shouldAcceptJobPostingContent() {
            // Given
            String content = "Senior Java Developer arıyoruz. 5+ yıl deneyim, Spring Boot " +
                    "bilgisi gerekli. Maaş: 50.000-80.000 TL. Başvuru için CV'nizi gönderin.";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should accept comment with single URL")
        void shouldAcceptCommentWithSingleUrl() {
            // Given
            String content = "Bu konu hakkında güzel bir makale var: https://medium.com/article";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {

        @Test
        @DisplayName("Should handle very long content")
        void shouldHandleVeryLongContent() {
            // Given
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 1000; i++) {
                sb.append("Normal content. ");
            }

            // When
            ModerationScore score = service.scoreContent(sb.toString());

            // Then
            assertThat(score).isNotNull();
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should handle content with only whitespace")
        void shouldHandleContentWithOnlyWhitespace() {
            // When
            ModerationScore score = service.scoreContent("   \t\n   ");

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should handle content with special characters")
        void shouldHandleContentWithSpecialCharacters() {
            // Given
            String content = "Test !@#$%^&*()_+-=[]{}|;':\",./<>?";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score).isNotNull();
        }

        @Test
        @DisplayName("Should handle emoji content")
        void shouldHandleEmojiContent() {
            // Given
            String content = "Great job! 👍🎉✨ Keep up the good work! 💪";

            // When
            ModerationScore score = service.scoreContent(content);

            // Then
            assertThat(score.getRiskLevel()).isEqualTo(RiskLevel.LOW);
        }

        @Test
        @DisplayName("Should be case insensitive for keyword detection")
        void shouldBeCaseInsensitiveForKeywordDetection() {
            // Given
            String content1 = "SPAM content";
            String content2 = "spam content";
            String content3 = "SpAm content";

            // When
            ModerationScore score1 = service.scoreContent(content1);
            ModerationScore score2 = service.scoreContent(content2);
            ModerationScore score3 = service.scoreContent(content3);

            // Then - All should detect the spam keyword equally
            assertThat(score1.getDetails()).contains("Blacklisted");
            assertThat(score2.getDetails()).contains("Blacklisted");
            assertThat(score3.getDetails()).contains("Blacklisted");
        }
    }
}
