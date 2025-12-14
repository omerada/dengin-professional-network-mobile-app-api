package com.dengin.identity.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.identity.application.dto.response.ProfessionResponse;
import com.dengin.identity.application.service.ProfessionService;
import com.dengin.identity.domain.model.ProfessionCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Profession Management REST Controller
 * 
 * Public endpoints (no authentication required for read operations)
 * 
 * Endpoints:
 * - GET /api/professions - Get all professions
 * - GET /api/professions/{id} - Get profession by ID
 * - GET /api/professions/category/{category} - Get by category
 * - GET /api/professions/search - Search professions
 * - GET /api/professions/verification-required - Get verification required professions
 * - GET /api/professions/stats - Get statistics
 */
@RestController
@RequestMapping("/api/professions")
@RequiredArgsConstructor
@Tag(name = "Professions", description = "Profession management endpoints")
public class ProfessionController {

    private final ProfessionService professionService;

    @GetMapping
    @Operation(summary = "Get all professions", description = "Get list of all available professions")
    public ResponseEntity<ApiResponse<List<ProfessionResponse>>> getAllProfessions() {
        List<ProfessionResponse> professions = professionService.getAllProfessions();
        return ResponseEntity.ok(ApiResponse.success(professions));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get profession by ID", description = "Get detailed information about a profession")
    public ResponseEntity<ApiResponse<ProfessionResponse>> getProfessionById(
            @PathVariable Long id
    ) {
        ProfessionResponse profession = professionService.getProfessionById(id);
        return ResponseEntity.ok(ApiResponse.success(profession));
    }

    @GetMapping("/category/{category}")
    @Operation(
            summary = "Get professions by category",
            description = "Get professions filtered by category (MEDICAL, LEGAL, ENGINEERING, etc.)"
    )
    public ResponseEntity<ApiResponse<List<ProfessionResponse>>> getProfessionsByCategory(
            @PathVariable ProfessionCategory category
    ) {
        List<ProfessionResponse> professions = professionService.getProfessionsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(professions));
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search professions",
            description = "Search professions by name (case-insensitive, partial match)"
    )
    public ResponseEntity<ApiResponse<List<ProfessionResponse>>> searchProfessions(
            @RequestParam(required = false) String q
    ) {
        List<ProfessionResponse> professions = professionService.searchProfessions(q);
        return ResponseEntity.ok(ApiResponse.success(professions));
    }

    @GetMapping("/verification-required")
    @Operation(
            summary = "Get verification required professions",
            description = "Get list of professions that require AI verification"
    )
    public ResponseEntity<ApiResponse<List<ProfessionResponse>>> getVerificationRequiredProfessions() {
        List<ProfessionResponse> professions = professionService.getVerificationRequiredProfessions();
        return ResponseEntity.ok(ApiResponse.success(professions));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get statistics", description = "Get profession statistics")
    public ResponseEntity<ApiResponse<ProfessionService.ProfessionStatsResponse>> getStatistics() {
        ProfessionService.ProfessionStatsResponse stats = professionService.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
