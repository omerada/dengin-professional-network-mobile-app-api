package com.meslektas.moderation.api;

import com.meslektas.moderation.application.dto.request.AppealRequest;
import com.meslektas.moderation.application.dto.response.SanctionResponse;
import com.meslektas.moderation.application.service.UserSanctionService;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for user sanction operations.
 * Allows users to view their sanctions and submit appeals.
 */
@RestController
@RequestMapping("/api/sanctions")
@Tag(name = "Sanctions", description = "User sanction operations")
@PreAuthorize("isAuthenticated()")
public class SanctionController {

    private final UserSanctionService sanctionService;

    public SanctionController(UserSanctionService sanctionService) {
        this.sanctionService = sanctionService;
    }

    /**
     * Gets all sanctions for the current user.
     */
    @GetMapping("/my-sanctions")
    @Operation(summary = "Get my sanctions", description = "Get all sanctions for the current user")
    public ResponseEntity<List<SanctionResponse>> getMySanctions(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<SanctionResponse> sanctions = sanctionService.getMySanctions(userDetails.getId());
        return ResponseEntity.ok(sanctions);
    }

    /**
     * Gets active sanctions for the current user.
     */
    @GetMapping("/my-sanctions/active")
    @Operation(summary = "Get my active sanctions", description = "Get currently active sanctions for the current user")
    public ResponseEntity<List<SanctionResponse>> getMyActiveSanctions(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<SanctionResponse> sanctions = sanctionService.getMyActiveSanctions(userDetails.getId());
        return ResponseEntity.ok(sanctions);
    }

    /**
     * Gets a specific sanction by ID.
     */
    @GetMapping("/{sanctionId}")
    @Operation(summary = "Get sanction details", description = "Get details of a specific sanction")
    @ApiResponse(responseCode = "200", description = "Sanction found")
    @ApiResponse(responseCode = "404", description = "Sanction not found")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<SanctionResponse> getSanction(
            @PathVariable UUID sanctionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        SanctionResponse sanction = sanctionService.getSanction(sanctionId, userDetails.getId());
        return ResponseEntity.ok(sanction);
    }

    /**
     * Submits an appeal for a sanction.
     */
    @PostMapping("/appeal")
    @Operation(summary = "Submit appeal", description = "Submit an appeal for a sanction")
    @ApiResponse(responseCode = "200", description = "Appeal submitted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request or already appealed")
    @ApiResponse(responseCode = "404", description = "Sanction not found")
    public ResponseEntity<SanctionResponse> submitAppeal(
            @Valid @RequestBody AppealRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        SanctionResponse sanction = sanctionService.submitAppeal(request, userDetails.getId());
        return ResponseEntity.ok(sanction);
    }

    /**
     * Checks the current user's sanction status.
     */
    @GetMapping("/status")
    @Operation(summary = "Check sanction status", description = "Check if the current user has any active sanctions")
    public ResponseEntity<Map<String, Object>> checkStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long userId = userDetails.getId();
        boolean isBanned = sanctionService.isBanned(userId);
        boolean isSuspended = sanctionService.isSuspended(userId);
        int totalSanctions = sanctionService.getSanctionCount(userId);

        SanctionResponse mostSevere = sanctionService.getMostSevereActiveSanction(userId)
                .orElse(null);

        return ResponseEntity.ok(Map.of(
                "isBanned", isBanned,
                "isSuspended", isSuspended,
                "totalSanctions", totalSanctions,
                "canAct", !isBanned && !isSuspended,
                "activeSanction", mostSevere != null ? mostSevere : Map.of()));
    }

    /**
     * Gets the remaining suspension time (if suspended).
     */
    @GetMapping("/remaining-time")
    @Operation(summary = "Get remaining time", description = "Get remaining suspension time in days")
    public ResponseEntity<Map<String, Object>> getRemainingTime(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return sanctionService.getMostSevereActiveSanction(userDetails.getId())
                .filter(s -> s.remainingDays() > 0)
                .map(s -> ResponseEntity.ok(Map.<String, Object>of(
                        "sanctionType", s.sanctionType().name(),
                        "remainingDays", s.remainingDays(),
                        "expiresAt", s.expiresAt())))
                .orElse(ResponseEntity.ok(Map.of(
                        "message", "No active time-limited sanctions")));
    }
}
