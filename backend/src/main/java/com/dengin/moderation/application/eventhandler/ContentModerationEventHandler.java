package com.dengin.moderation.application.eventhandler;

import com.dengin.moderation.application.service.ReportContentService;
import com.dengin.moderation.domain.model.ModerationScore;
import com.dengin.moderation.domain.model.ReportReason;
import com.dengin.moderation.domain.model.ReportType;
import com.dengin.moderation.domain.model.RiskLevel;
import com.dengin.moderation.domain.service.AutomatedModerationService;
import com.dengin.social.domain.model.PostCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event handler for automated content moderation.
 *
 * Listens to content creation events and automatically scores content
 * for potential policy violations. High-risk content is auto-flagged
 * for moderator review.
 *
 * Events handled:
 * - PostCreatedEvent: New posts
 * - CommentCreatedEvent: New comments (future)
 * - MessageSentEvent: Direct messages (future - privacy considerations)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ContentModerationEventHandler {

    private final AutomatedModerationService automatedModerationService;
    private final ReportContentService reportContentService;

    /**
     * Handle post creation event.
     * Automatically scores content and flags high-risk posts for review.
     */
    @EventListener
    @Async
    public void handlePostCreated(PostCreatedEvent event) {
        log.debug("Scoring content for post {} by user {}",
                event.getPostId(), event.getAuthorId());

        try {
            // Score the content
            ModerationScore score = automatedModerationService.scoreContent(event.getContent());

            log.info("Post {} scored: {} (risk level: {})",
                    event.getPostId(),
                    score.getScore(),
                    score.getRiskLevel());

            // Auto-flag high-risk content
            if (score.getRiskLevel() == RiskLevel.HIGH) {
                autoFlagContent(event, score);
            }

            // Log for analytics
            logModerationMetrics(event, score);

        } catch (Exception e) {
            log.error("Failed to moderate post {}: {}",
                    event.getPostId(), e.getMessage(), e);
            // Don't throw - moderation failure shouldn't block content creation
        }
    }

    /**
     * Auto-flag high-risk content for moderator review.
     */
    private void autoFlagContent(PostCreatedEvent event, ModerationScore score) {
        try {
            // Determine the most likely violation reason based on details
            ReportReason reason = determineReportReason(score);

            // Create automatic report using system user ID (0 for system)
            reportContentService.createAutomatedReport(
                    ReportType.POST,
                    event.getPostId().getValue(),
                    reason,
                    buildAutomatedReportDescription(score));

            log.warn("Auto-flagged high-risk post {} (score: {}, reason: {})",
                    event.getPostId(), score.getScore(), reason);

        } catch (Exception e) {
            log.error("Failed to auto-flag post {}: {}",
                    event.getPostId(), e.getMessage(), e);
        }
    }

    /**
     * Determine the most likely report reason based on moderation details.
     */
    private ReportReason determineReportReason(ModerationScore score) {
        String detailsLower = score.getDetails().toLowerCase();

        if (detailsLower.contains("high severity") || detailsLower.contains("violence")) {
            return ReportReason.VIOLENCE;
        }
        if (detailsLower.contains("spam") || detailsLower.contains("url") ||
                detailsLower.contains("repeated") || detailsLower.contains("contact")) {
            return ReportReason.SPAM;
        }
        if (detailsLower.contains("fake") || detailsLower.contains("sahte") ||
                detailsLower.contains("credential") || detailsLower.contains("blacklist")) {
            return ReportReason.FAKE_CREDENTIALS;
        }
        if (detailsLower.contains("adult") || detailsLower.contains("inappropriate")) {
            return ReportReason.ADULT_CONTENT;
        }
        if (detailsLower.contains("harassment") || detailsLower.contains("hate")) {
            return ReportReason.HARASSMENT;
        }

        return ReportReason.OTHER;
    }

    /**
     * Build description for automated report.
     */
    private String buildAutomatedReportDescription(ModerationScore score) {
        StringBuilder description = new StringBuilder();
        description.append("Otomatik moderasyon sistemi tarafından tespit edildi.\n");
        description.append("Risk skoru: ").append(score.getScore()).append("\n");
        description.append("Risk seviyesi: ").append(score.getRiskLevel()).append("\n");
        description.append("Tespit detayları: ").append(score.getDetails());

        return description.toString();
    }

    /**
     * Log moderation metrics for analytics.
     */
    private void logModerationMetrics(PostCreatedEvent event, ModerationScore score) {
        // This can be extended to push metrics to CloudWatch, Prometheus, etc.
        if (score.getRiskLevel() == RiskLevel.HIGH) {
            log.info("METRIC:moderation.high_risk post={} user={} score={}",
                    event.getPostId(), event.getAuthorId(), score.getScore());
        } else if (score.getRiskLevel() == RiskLevel.MEDIUM) {
            log.debug("METRIC:moderation.medium_risk post={} user={} score={}",
                    event.getPostId(), event.getAuthorId(), score.getScore());
        }
    }
}
