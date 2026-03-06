package com.dengin.verification.application.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * Admin dashboard statistics response
 */
@Getter
@Builder
public class VerificationStatisticsResponse {
    private final long totalRequests;
    private final long pendingReviews;
    private final long approvedCount;
    private final long rejectedCount;
    private final long expiredCount;
    
    private final double approvalRate;        // Percentage of approved requests
    private final double autoApprovalRate;   // Percentage of auto-approved requests
    private final double averageProcessingMinutes;
    
    private final long todaySubmissions;
    private final long thisWeekSubmissions;
    private final long thisMonthSubmissions;
}
