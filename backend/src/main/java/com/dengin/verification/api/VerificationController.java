package com.dengin.verification.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.verification.application.dto.ManualReviewDecisionRequest;
import com.dengin.verification.application.dto.SubmitVerificationRequest;
import com.dengin.verification.application.dto.VerificationResponse;
import com.dengin.verification.application.dto.VerificationAttemptResponse;
import com.dengin.verification.application.dto.VerificationEligibilityResponse;
import com.dengin.verification.application.dto.VerificationStatisticsResponse;
import com.dengin.verification.application.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Verification REST API Controller
 * 
 * Endpoints:
 * - POST /api/verifications - Submit new verification
 * - GET /api/verifications - Get user's verifications
 * - GET /api/verifications/{id} - Get verification details
 * - GET /api/verifications/check/{professionId} - Check if can submit
 * - GET /api/verifications/history - Get user's verification history
 * 
 * Admin endpoints:
 * - GET /api/admin/verifications/pending - Get pending manual reviews
 * - POST /api/admin/verifications/{id}/approve - Approve verification
 * - POST /api/admin/verifications/{id}/reject - Reject verification
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class VerificationController {

    private final VerificationService verificationService;

    /**
     * Submit new verification request
     * 
     * POST /api/verifications
     * 
     * User uploads document + selfie, then submits verification.
     * Images should already be uploaded to S3 via separate upload endpoint.
     */
    @PostMapping("/verifications")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<VerificationResponse>> submitVerification(
            @Valid @RequestBody SubmitVerificationRequest request,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        log.info("User {} submitting verification request", userId);

        VerificationResponse response = verificationService.submitVerification(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Verification submitted successfully", response));
    }

    /**
     * Get user's verification requests
     * 
     * GET /api/verifications
     */
    @GetMapping("/verifications")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<VerificationResponse>>> getUserVerifications(
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        List<VerificationResponse> verifications = verificationService.getUserVerifications(userId);

        return ResponseEntity.ok(ApiResponse.success(verifications));
    }

    /**
     * Get verification details by ID
     * 
     * GET /api/verifications/{id}
     */
    @GetMapping("/verifications/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<VerificationResponse>> getVerificationById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        VerificationResponse verification = verificationService.getVerificationById(id, userId);

        return ResponseEntity.ok(ApiResponse.success(verification));
    }

    /**
     * Get user's verification history
     * 
     * GET /api/verifications/history
     * 
     * Returns all verification attempts with detailed status
     */
    @GetMapping("/verifications/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<VerificationAttemptResponse>>> getVerificationHistory(
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        List<VerificationAttemptResponse> history = verificationService.getUserVerificationHistory(userId);

        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Check if user can submit verification for profession
     * 
     * GET /api/verifications/check/{professionId}
     * 
     * Returns detailed eligibility information
     */
    @GetMapping("/verifications/check/{professionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<VerificationEligibilityResponse>> checkEligibility(
            @PathVariable Long professionId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        VerificationEligibilityResponse eligibility = verificationService.checkEligibility(userId, professionId);

        return ResponseEntity.ok(ApiResponse.success(eligibility));
    }

    // ========== Admin Endpoints ==========
    // ========== Admin Endpoints ==========

    /**
     * Get pending manual reviews (admin only)
     * 
     * GET /api/admin/verifications/pending
     */
    @GetMapping("/admin/verifications/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VerificationResponse>> getPendingManualReviews() {
        List<VerificationResponse> pending = verificationService.getPendingManualReviews();

        return ResponseEntity.ok(pending);
    }

    /**
     * Approve verification (admin only)
     * 
     * POST /api/admin/verifications/{id}/approve
     */
    @PostMapping("/admin/verifications/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VerificationResponse> approveVerification(
            @PathVariable Long id,
            @Valid @RequestBody ManualReviewDecisionRequest request,
            Authentication authentication) {
        Long adminId = Long.parseLong(authentication.getName());

        log.info("Admin {} approving verification {}", adminId, id);

        VerificationResponse response = verificationService.approveVerification(
                id,
                adminId,
                request.getNotes());

        return ResponseEntity.ok(response);
    }

    /**
     * Reject verification (admin only)
     * 
     * POST /api/admin/verifications/{id}/reject
     */
    @PostMapping("/admin/verifications/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VerificationResponse> rejectVerification(
            @PathVariable Long id,
            @Valid @RequestBody ManualReviewDecisionRequest request,
            Authentication authentication) {
        Long adminId = Long.parseLong(authentication.getName());

        log.info("Admin {} rejecting verification {}", adminId, id);

        VerificationResponse response = verificationService.rejectVerification(
                id,
                adminId,
                request.getNotes());

        return ResponseEntity.ok(response);
    }

    /**
     * Get admin dashboard statistics
     * 
     * Aggregates verification data:
     * - Total requests, pending reviews, approved/rejected counts
     * - Approval rate, auto-approval rate
     * - Average processing time
     * - Today/week/month submission counts
     * 
     * GET /api/admin/verifications/statistics
     */
    @GetMapping("/admin/verifications/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VerificationStatisticsResponse> getStatistics() {
        log.debug("Admin fetching verification statistics");

        VerificationStatisticsResponse statistics = verificationService.getStatistics();

        return ResponseEntity.ok(statistics);
    }
}
