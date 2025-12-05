package com.meslektas.moderation.api;

import com.meslektas.moderation.application.dto.request.ReportRequest;
import com.meslektas.moderation.application.dto.response.ReportResponse;
import com.meslektas.moderation.application.service.ReportContentService;
import com.meslektas.moderation.domain.model.ReportType;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for user content reporting operations.
 */
@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Content reporting operations")
@PreAuthorize("isAuthenticated()")
public class ReportController {

    private final ReportContentService reportService;

    public ReportController(ReportContentService reportService) {
        this.reportService = reportService;
    }

    /**
     * Creates a new content report.
     */
    @PostMapping
    @Operation(summary = "Create a report", description = "Report inappropriate content")
    @ApiResponse(responseCode = "201", description = "Report created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    @ApiResponse(responseCode = "409", description = "Duplicate report")
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Long contentOwnerId,
            @RequestParam(required = false) String contentText) {

        Long userId = userDetails.getId();

        // In a real implementation, contentOwnerId would be looked up from the content
        if (contentOwnerId == null) {
            contentOwnerId = 0L; // Placeholder - should be resolved from content
        }

        ReportResponse response = reportService.createReport(
                request, userId, contentOwnerId, contentText);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Gets reports submitted by the current user.
     */
    @GetMapping("/my-reports")
    @Operation(summary = "Get my reports", description = "Get reports submitted by the current user")
    public ResponseEntity<List<ReportResponse>> getMyReports(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<ReportResponse> reports = reportService.getMyReports(userDetails.getId());
        return ResponseEntity.ok(reports);
    }

    /**
     * Gets a specific report by ID.
     */
    @GetMapping("/{reportId}")
    @Operation(summary = "Get a report", description = "Get details of a specific report")
    @ApiResponse(responseCode = "200", description = "Report found")
    @ApiResponse(responseCode = "404", description = "Report not found")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<ReportResponse> getReport(
            @PathVariable UUID reportId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ReportResponse response = reportService.getReport(reportId, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Cancels a pending report.
     */
    @DeleteMapping("/{reportId}")
    @Operation(summary = "Cancel a report", description = "Cancel a pending report")
    @ApiResponse(responseCode = "204", description = "Report cancelled")
    @ApiResponse(responseCode = "400", description = "Cannot cancel - report not pending")
    @ApiResponse(responseCode = "404", description = "Report not found")
    public ResponseEntity<Void> cancelReport(
            @PathVariable UUID reportId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        reportService.cancelReport(reportId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Checks if the user has already reported specific content.
     */
    @GetMapping("/check")
    @Operation(summary = "Check if reported", description = "Check if the current user has already reported specific content")
    public ResponseEntity<Map<String, Boolean>> checkIfReported(
            @RequestParam UUID contentId,
            @RequestParam ReportType type,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        boolean hasReported = reportService.hasReported(userDetails.getId(), contentId, type);
        return ResponseEntity.ok(Map.of("hasReported", hasReported));
    }

    /**
     * Gets the report count for specific content.
     */
    @GetMapping("/count")
    @Operation(summary = "Get report count", description = "Get the number of reports for specific content")
    public ResponseEntity<Map<String, Integer>> getReportCount(
            @RequestParam UUID contentId,
            @RequestParam ReportType type) {

        int count = reportService.getReportCount(contentId, type);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
