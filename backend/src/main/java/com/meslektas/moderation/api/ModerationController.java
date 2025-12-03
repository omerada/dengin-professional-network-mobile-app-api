package com.meslektas.moderation.api;

import com.meslektas.moderation.application.dto.request.ProcessAppealRequest;
import com.meslektas.moderation.application.dto.request.ReviewRequest;
import com.meslektas.moderation.application.dto.response.ModerationQueueResponse;
import com.meslektas.moderation.application.dto.response.ModerationStatsResponse;
import com.meslektas.moderation.application.dto.response.ReportResponse;
import com.meslektas.moderation.application.dto.response.SanctionResponse;
import com.meslektas.moderation.application.service.ModerationService;
import com.meslektas.moderation.domain.model.ReportStatus;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for moderator/admin moderation operations.
 */
@RestController
@RequestMapping("/api/admin/moderation")
@Tag(name = "Moderation (Admin)", description = "Admin moderation operations")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    // ================== Queue Management ==================

    /**
     * Gets the moderation queue.
     */
    @GetMapping("/queue")
    @Operation(summary = "Get moderation queue", description = "Get pending and escalated reports for moderation")
    public ResponseEntity<List<ModerationQueueResponse>> getQueue(
            @RequestParam(defaultValue = "50") int limit) {

        List<ModerationQueueResponse> queue = moderationService.getQueue(limit);
        return ResponseEntity.ok(queue);
    }

    /**
     * Gets escalated reports.
     */
    @GetMapping("/escalated")
    @Operation(summary = "Get escalated reports", description = "Get reports that have been escalated for senior review")
    public ResponseEntity<List<ReportResponse>> getEscalatedReports() {
        List<ReportResponse> reports = moderationService.getEscalatedReports();
        return ResponseEntity.ok(reports);
    }

    /**
     * Gets reports assigned to the current moderator.
     */
    @GetMapping("/my-assignments")
    @Operation(summary = "Get my assignments", description = "Get reports assigned to the current moderator")
    public ResponseEntity<List<ReportResponse>> getMyAssignments(
            @RequestParam(required = false) ReportStatus status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<ReportResponse> reports = moderationService.getAssignedReports(userDetails.getId(), status);
        return ResponseEntity.ok(reports);
    }

    // ================== Report Operations ==================

    /**
     * Gets a report by ID.
     */
    @GetMapping("/reports/{reportId}")
    @Operation(summary = "Get report details", description = "Get detailed information about a report")
    @ApiResponse(responseCode = "200", description = "Report found")
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<ReportResponse> getReport(@PathVariable UUID reportId) {
        ReportResponse report = moderationService.getReport(reportId);
        return ResponseEntity.ok(report);
    }

    /**
     * Assigns a report to a moderator.
     */
    @PostMapping("/reports/{reportId}/assign")
    @Operation(summary = "Assign report", description = "Assign a report to a moderator")
    public ResponseEntity<ReportResponse> assignReport(
            @PathVariable UUID reportId,
            @RequestParam(required = false) Long moderatorId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long assignTo = moderatorId != null ? moderatorId : userDetails.getId();
        ReportResponse report = moderationService.assignReport(reportId, assignTo);
        return ResponseEntity.ok(report);
    }

    /**
     * Reviews and takes action on a report.
     */
    @PostMapping("/reports/review")
    @Operation(summary = "Review report", description = "Review a report and take action")
    @ApiResponse(responseCode = "200", description = "Report reviewed successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    public ResponseEntity<ReportResponse> reviewReport(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ReportResponse report = moderationService.reviewReport(request, userDetails.getId());
        return ResponseEntity.ok(report);
    }

    /**
     * Escalates a report.
     */
    @PostMapping("/reports/{reportId}/escalate")
    @Operation(summary = "Escalate report", description = "Escalate a report for senior review")
    public ResponseEntity<ReportResponse> escalateReport(
            @PathVariable UUID reportId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ReportResponse report = moderationService.escalateReport(reportId, userDetails.getId());
        return ResponseEntity.ok(report);
    }

    /**
     * Gets reports by date range.
     */
    @GetMapping("/reports/by-date")
    @Operation(summary = "Get reports by date", description = "Get reports within a date range")
    public ResponseEntity<List<ReportResponse>> getReportsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<ReportResponse> reports = moderationService.getReportsByDateRange(startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    /**
     * Gets reports against a specific user.
     */
    @GetMapping("/reports/by-user/{userId}")
    @Operation(summary = "Get reports against user", description = "Get all reports filed against a specific user")
    public ResponseEntity<List<ReportResponse>> getReportsAgainstUser(@PathVariable UUID userId) {
        List<ReportResponse> reports = moderationService.getReportsAgainstUser(userId);
        return ResponseEntity.ok(reports);
    }

    // ================== Sanction Management ==================

    /**
     * Gets all sanctions for a user.
     */
    @GetMapping("/sanctions/user/{userId}")
    @Operation(summary = "Get user sanctions", description = "Get all sanctions for a specific user")
    public ResponseEntity<List<SanctionResponse>> getUserSanctions(@PathVariable UUID userId) {
        List<SanctionResponse> sanctions = moderationService.getUserSanctions(userId);
        return ResponseEntity.ok(sanctions);
    }

    /**
     * Gets active sanctions for a user.
     */
    @GetMapping("/sanctions/user/{userId}/active")
    @Operation(summary = "Get active sanctions", description = "Get currently active sanctions for a user")
    public ResponseEntity<List<SanctionResponse>> getActiveSanctions(@PathVariable UUID userId) {
        List<SanctionResponse> sanctions = moderationService.getActiveSanctions(userId);
        return ResponseEntity.ok(sanctions);
    }

    /**
     * Gets pending appeals.
     */
    @GetMapping("/appeals/pending")
    @Operation(summary = "Get pending appeals", description = "Get sanctions with pending appeals")
    public ResponseEntity<List<SanctionResponse>> getPendingAppeals() {
        List<SanctionResponse> appeals = moderationService.getPendingAppeals();
        return ResponseEntity.ok(appeals);
    }

    /**
     * Processes an appeal.
     */
    @PostMapping("/appeals/process")
    @Operation(summary = "Process appeal", description = "Approve or reject a sanction appeal")
    @ApiResponse(responseCode = "200", description = "Appeal processed successfully")
    public ResponseEntity<SanctionResponse> processAppeal(
            @Valid @RequestBody ProcessAppealRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        SanctionResponse sanction = moderationService.processAppeal(request, userDetails.getId());
        return ResponseEntity.ok(sanction);
    }

    /**
     * Revokes a sanction.
     */
    @DeleteMapping("/sanctions/{sanctionId}")
    @PreAuthorize("hasRole('ADMIN')") // Only admins can revoke
    @Operation(summary = "Revoke sanction", description = "Revoke an active sanction (admin only)")
    public ResponseEntity<Void> revokeSanction(
            @PathVariable UUID sanctionId,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        moderationService.revokeSanction(sanctionId, userDetails.getId(), reason);
        return ResponseEntity.noContent().build();
    }

    // ================== Statistics ==================

    /**
     * Gets moderation statistics.
     */
    @GetMapping("/stats")
    @Operation(summary = "Get moderation stats", description = "Get moderation statistics for the dashboard")
    public ResponseEntity<ModerationStatsResponse> getStatistics() {
        ModerationStatsResponse stats = moderationService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Checks if a user is sanctioned.
     */
    @GetMapping("/sanctions/check/{userId}")
    @Operation(summary = "Check user sanction status", description = "Check if a user has any active sanctions")
    public ResponseEntity<Boolean> isUserSanctioned(@PathVariable UUID userId) {
        boolean isSanctioned = moderationService.isUserSanctioned(userId);
        return ResponseEntity.ok(isSanctioned);
    }
}
