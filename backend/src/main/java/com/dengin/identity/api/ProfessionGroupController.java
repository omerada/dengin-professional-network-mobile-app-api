package com.dengin.identity.api;

import com.dengin.common.api.ApiResponse;
import com.dengin.identity.application.dto.response.ProfessionGroupResponse;
import com.dengin.identity.application.service.ProfessionGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Profession Group Management REST Controller
 * 
 * Public endpoints for profession group information within sectors.
 * No authentication required - profession groups are public data.
 * 
 * Endpoints:
 * - GET /api/profession-groups?sectorId={id} - Get groups by sector
 * - GET /api/profession-groups/{id} - Get group by ID
 * - GET /api/profession-groups/search?sectorId={id}&q={query} - Search in sector
 * 
 * @since Sprint 3 - Profession group management
 */
@Slf4j
@RestController
@RequestMapping("/api/profession-groups")
@RequiredArgsConstructor
@Tag(name = "Profession Groups", description = "Profession group management within sectors")
public class ProfessionGroupController {

    private final ProfessionGroupService professionGroupService;

    /**
     * GET /api/profession-groups?sectorId={id}
     * Get all active profession groups in a sector
     * 
     * Used for displaying profession options during profile setup.
     * Returns groups ordered by displayOrder.
     * 
     * @param sectorId sector ID (required)
     * @return list of active profession groups
     */
    @GetMapping
    @Operation(
            summary = "Get profession groups by sector",
            description = "Returns all active profession groups in specified sector. " +
                    "Used for profession selection in user profiles. " +
                    "Groups ordered by displayOrder. " +
                    "Cached for 10 minutes for performance."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Profession groups retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ProfessionGroupResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid sector ID"
            )
    })
    public ResponseEntity<ApiResponse<List<ProfessionGroupResponse>>> getProfessionGroupsBySector(
            @Parameter(description = "Sector ID", required = true, example = "1")
            @RequestParam Long sectorId) {
        
        log.info("GET /api/profession-groups?sectorId={} - Get profession groups", sectorId);

        List<ProfessionGroupResponse> groups = professionGroupService.getActiveBySectorId(sectorId);

        log.info("Retrieved {} profession groups for sector {}", groups.size(), sectorId);

        return ResponseEntity.ok(
                ApiResponse.success("Profession groups retrieved successfully", groups)
        );
    }

    /**
     * GET /api/profession-groups/{id}
     * Get profession group by ID
     * 
     * @param id profession group ID
     * @return profession group response
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Get profession group by ID",
            description = "Returns detailed profession group information including sector details."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Profession group retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ProfessionGroupResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Profession group not found"
            )
    })
    public ResponseEntity<ApiResponse<ProfessionGroupResponse>> getProfessionGroupById(
            @Parameter(description = "Profession group ID", example = "1")
            @PathVariable Long id) {
        
        log.info("GET /api/profession-groups/{} - Get profession group by ID", id);

        ProfessionGroupResponse group = professionGroupService.getById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Profession group retrieved successfully", group)
        );
    }

    /**
     * GET /api/profession-groups/search?sectorId={id}&q={query}
     * Search profession groups within a sector
     * 
     * @param sectorId sector ID
     * @param query search query (optional)
     * @return list of matching profession groups
     */
    @GetMapping("/search")
    @Operation(
            summary = "Search profession groups in sector",
            description = "Search profession groups by name within specified sector. " +
                    "Case-insensitive partial match. " +
                    "Returns all active groups if query is empty."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Search completed successfully",
                    content = @Content(schema = @Schema(implementation = ProfessionGroupResponse.class))
            )
    })
    public ResponseEntity<ApiResponse<List<ProfessionGroupResponse>>> searchProfessionGroups(
            @Parameter(description = "Sector ID", required = true, example = "1")
            @RequestParam Long sectorId,
            @Parameter(description = "Search query", example = "doktor")
            @RequestParam(required = false) String q) {
        
        log.info("GET /api/profession-groups/search?sectorId={}&q={} - Search profession groups", sectorId, q);

        List<ProfessionGroupResponse> groups = professionGroupService.searchInSector(sectorId, q);

        log.info("Found {} profession groups matching query in sector {}", groups.size(), sectorId);

        return ResponseEntity.ok(
                ApiResponse.success("Search completed successfully", groups)
        );
    }
}
