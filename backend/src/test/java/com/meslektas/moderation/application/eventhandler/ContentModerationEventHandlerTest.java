package com.meslektas.moderation.application.eventhandler;

import com.meslektas.moderation.application.service.ReportContentService;
import com.meslektas.moderation.domain.model.ModerationScore;
import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.ReportType;
import com.meslektas.moderation.domain.model.RiskLevel;
import com.meslektas.moderation.domain.service.AutomatedModerationService;
import com.meslektas.social.domain.model.PostCreatedEvent;
import com.meslektas.social.domain.model.PostId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ContentModerationEventHandler.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ContentModerationEventHandler Tests")
class ContentModerationEventHandlerTest {

    @Mock
    private AutomatedModerationService automatedModerationService;

    @Mock
    private ReportContentService reportContentService;

    @InjectMocks
    private ContentModerationEventHandler eventHandler;

    @Captor
    private ArgumentCaptor<ReportType> reportTypeCaptor;

    @Captor
    private ArgumentCaptor<UUID> contentIdCaptor;

    @Captor
    private ArgumentCaptor<ReportReason> reasonCaptor;

    @Captor
    private ArgumentCaptor<String> descriptionCaptor;

    private PostCreatedEvent createPostEvent(String content) {
        return new PostCreatedEvent(
                1L,
                PostId.generate(),
                100L,
                1L,
                content,
                0);
    }

    @Nested
    @DisplayName("Low Risk Content Tests")
    class LowRiskContentTests {

        @Test
        @DisplayName("Should not flag low risk content")
        void shouldNotFlagLowRiskContent() {
            // Given
            PostCreatedEvent event = createPostEvent("Normal professional content about medicine");
            ModerationScore lowScore = ModerationScore.low("No issues detected");

            when(automatedModerationService.scoreContent(any())).thenReturn(lowScore);

            // When
            eventHandler.handlePostCreated(event);

            // Then
            verify(automatedModerationService).scoreContent(event.getContent());
            verify(reportContentService, never()).createAutomatedReport(any(), any(), any(), any());
        }
    }

    @Nested
    @DisplayName("Medium Risk Content Tests")
    class MediumRiskContentTests {

        @Test
        @DisplayName("Should not auto-flag medium risk content")
        void shouldNotAutoFlagMediumRiskContent() {
            // Given
            PostCreatedEvent event = createPostEvent("Content with some suspicious elements");
            ModerationScore mediumScore = ModerationScore.medium(35, "Suspicious content length");

            when(automatedModerationService.scoreContent(any())).thenReturn(mediumScore);

            // When
            eventHandler.handlePostCreated(event);

            // Then
            verify(automatedModerationService).scoreContent(event.getContent());
            verify(reportContentService, never()).createAutomatedReport(any(), any(), any(), any());
        }
    }

    @Nested
    @DisplayName("High Risk Content Tests")
    class HighRiskContentTests {

        @Test
        @DisplayName("Should auto-flag high risk content with spam indicators")
        void shouldAutoFlagSpamContent() {
            // Given
            PostCreatedEvent event = createPostEvent("Buy followers now! spam spam spam");
            ModerationScore highScore = ModerationScore.high(75, "Blacklisted keywords found, Spam indicators");

            when(automatedModerationService.scoreContent(any())).thenReturn(highScore);

            // When
            eventHandler.handlePostCreated(event);

            // Then
            verify(automatedModerationService).scoreContent(event.getContent());
            verify(reportContentService).createAutomatedReport(
                    reportTypeCaptor.capture(),
                    contentIdCaptor.capture(),
                    reasonCaptor.capture(),
                    descriptionCaptor.capture());

            assertThat(reportTypeCaptor.getValue()).isEqualTo(ReportType.POST);
            assertThat(contentIdCaptor.getValue()).isEqualTo(event.getPostId().getValue());
            assertThat(reasonCaptor.getValue()).isEqualTo(ReportReason.SPAM);
            assertThat(descriptionCaptor.getValue()).contains("Otomatik moderasyon");
        }

        @Test
        @DisplayName("Should auto-flag high severity content")
        void shouldAutoFlagHighSeverityContent() {
            // Given
            PostCreatedEvent event = createPostEvent("Threatening content with violence");
            ModerationScore highScore = ModerationScore.high(90, "High severity keyword detected");

            when(automatedModerationService.scoreContent(any())).thenReturn(highScore);

            // When
            eventHandler.handlePostCreated(event);

            // Then
            verify(reportContentService).createAutomatedReport(
                    eq(ReportType.POST),
                    any(UUID.class),
                    eq(ReportReason.VIOLENCE),
                    any(String.class));
        }

        @Test
        @DisplayName("Should auto-flag fake credentials content")
        void shouldAutoFlagFakeCredentialsContent() {
            // Given
            PostCreatedEvent event = createPostEvent("Sahte diploma satılık");
            ModerationScore highScore = ModerationScore.high(80, "Blacklisted keywords, fake credentials");

            when(automatedModerationService.scoreContent(any())).thenReturn(highScore);

            // When
            eventHandler.handlePostCreated(event);

            // Then
            verify(reportContentService).createAutomatedReport(
                    eq(ReportType.POST),
                    any(UUID.class),
                    eq(ReportReason.FAKE_CREDENTIALS),
                    any(String.class));
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should handle scoring exception gracefully")
        void shouldHandleScoringExceptionGracefully() {
            // Given
            PostCreatedEvent event = createPostEvent("Some content");
            when(automatedModerationService.scoreContent(any()))
                    .thenThrow(new RuntimeException("Scoring service unavailable"));

            // When - Should not throw
            eventHandler.handlePostCreated(event);

            // Then
            verify(reportContentService, never()).createAutomatedReport(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Should handle report creation exception gracefully")
        void shouldHandleReportCreationExceptionGracefully() {
            // Given
            PostCreatedEvent event = createPostEvent("High risk content");
            ModerationScore highScore = ModerationScore.high(80, "High severity");

            when(automatedModerationService.scoreContent(any())).thenReturn(highScore);
            doThrow(new RuntimeException("Database error"))
                    .when(reportContentService).createAutomatedReport(any(), any(), any(), any());

            // When - Should not throw
            eventHandler.handlePostCreated(event);

            // Then - Exception should be caught and logged
            verify(reportContentService).createAutomatedReport(any(), any(), any(), any());
        }
    }

    @Nested
    @DisplayName("Report Description Tests")
    class ReportDescriptionTests {

        @Test
        @DisplayName("Should include score and risk level in description")
        void shouldIncludeScoreAndRiskLevelInDescription() {
            // Given
            PostCreatedEvent event = createPostEvent("Spam content");
            ModerationScore highScore = ModerationScore.high(85, "Spam indicators, URL detected");

            when(automatedModerationService.scoreContent(any())).thenReturn(highScore);

            // When
            eventHandler.handlePostCreated(event);

            // Then
            verify(reportContentService).createAutomatedReport(
                    any(), any(), any(), descriptionCaptor.capture());

            String description = descriptionCaptor.getValue();
            assertThat(description).contains("85"); // Score
            assertThat(description).contains("HIGH"); // Risk level
            assertThat(description).contains("Spam indicators"); // Details
        }
    }
}
