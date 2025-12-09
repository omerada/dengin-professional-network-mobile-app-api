package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.identity.application.dto.response.SectorResponse;
import com.meslektas.identity.application.dto.response.SectorStatsResponse;
import com.meslektas.identity.application.service.SectorService;
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
 * Sector Management REST Controller
 * 
 * Public endpoints for sector information.
 * No authentication required - sectors are public data.
 * 
 * Endpoints:
 * - GET /api/sectors - Get all active sectors
 * - GET /api/sectors/{id} - Get sector by ID
 * - GET /api/sectors/code/{code} - Get sector by code
 * - GET /api/sectors/search - Search sectors
 * - GET /api/sectors/popular - Get popular sectors
 * - GET /api/sectors/stats - Get sector statistics
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Slf4j
@RestController
@RequestMapping("/api/sectors")
@RequiredArgsConstructor
@Tag(name = "Sectors", description = "Sector management endpoints for community organization")
public class SectorController {

    private final SectorService sectorService;

    /**
     * GET /api/sectors
     * Get all active sectors for onboarding
     * 
     * Returns active sectors ordered by display order.
     * Used in mobile onboarding for sector selection.
     * 
     * Response includes member count for each sector.
     * 
     * @return list of active sectors
     */
    @GetMapping
    @Operation(
            summary = "Get all active sectors",
            description = "Returns all active sectors ordered by display order. " +
                    "Used for sector selection during onboarding. " +
                    "Includes member count for each sector. " +
                    "Cached for 10 minutes for performance."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Sectors retrieved successfully",
                    content = @Content(schema = @Schema(implementation = SectorResponse.class))
            )
    })
    public ResponseEntity<ApiResponse<List<SectorResponse>>> getAllSectors() {
        log.info("GET /api/sectors - Get all active sectors");

        List<SectorResponse> sectors = sectorService.getAllActiveSectors();

        log.info("Retrieved {} active sectors", sectors.size());

        return ResponseEntity.ok(
                ApiResponse.success("Sectors retrieved successfully", sectors)
        );
    }

    /**
     * GET /api/sectors/{id}
     * Get sector by ID
     * 
     * @param id sector ID
     * @return sector response
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Get sector by ID",
            description = "Returns detailed sector information including member count."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Sector retrieved successfully",
                    content = @Content(schema = @Schema(implementation = SectorResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Sector not found"
            )
    })
    public ResponseEntity<ApiResponse<SectorResponse>> getSectorById(
            @Parameter(description = "Sector ID", example = "1")
            @PathVariable Long id) {
        
        log.info("GET /api/sectors/{} - Get sector by ID", id);

        SectorResponse sector = sectorService.getSectorById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Sector retrieved successfully", sector)
        );
    }

    /**
     * GET /api/sectors/code/{code}
     * Get sector by code
     * 
     * @param code sector code (e.g., MEDICAL, LEGAL)
     * @return sector response
     */
    @GetMapping("/code/{code}")
    @Operation(
            summary = "Get sector by code",
            description = "Returns sector information by unique code (e.g., MEDICAL, LEGAL). " +
                    "Code is case-insensitive."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Sector retrieved successfully",
                    content = @Content(schema = @Schema(implementation = SectorResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Sector not found"
            )
    })
    public ResponseEntity<ApiResponse<SectorResponse>> getSectorByCode(
            @Parameter(description = "Sector code", example = "MEDICAL")
            @PathVariable String code) {
        
        log.info("GET /api/sectors/code/{} - Get sector by code", code);

        SectorResponse sector = sectorService.getSectorByCode(code);

        return ResponseEntity.ok(
                ApiResponse.success("Sector retrieved successfully", sector)
        );
    }

    /**
     * GET /api/sectors/search
     * Search sectors by name
     * 
     * @param q search query
     * @return list of matching sectors
     */
    @GetMapping("/search")
    @Operation(
            summary = "Search sectors",
            description = "Search sectors by name (case-insensitive partial match). " +
                    "Returns only active sectors. " +
                    "If query is empty, returns all active sectors."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Search completed successfully",
                    content = @Content(schema = @Schema(implementation = SectorResponse.class))
            )
    })
    public ResponseEntity<ApiResponse<List<SectorResponse>>> searchSectors(
            @Parameter(description = "Search query", example = "sağlık")
            @RequestParam(required = false) String q) {
        
        log.info("GET /api/sectors/search?q={} - Search sectors", q);

        List<SectorResponse> sectors = sectorService.searchSectors(q);

        log.info("Found {} sectors matching query: {}", sectors.size(), q);

        return ResponseEntity.ok(
                ApiResponse.success("Search completed successfully", sectors)
        );
    }

    /**
     * GET /api/sectors/popular
     * Get most popular sectors
     * 
     * @param limit maximum results (default 10)
     * @return list of popular sectors
     */
    @GetMapping("/popular")
    @Operation(
            summary = "Get popular sectors",
            description = "Returns sectors ordered by member count (most popular first). " +
                    "Useful for showing trending sectors."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Popular sectors retrieved successfully",
                    content = @Content(schema = @Schema(implementation = SectorResponse.class))
            )
    })
    public ResponseEntity<ApiResponse<List<SectorResponse>>> getPopularSectors(
            @Parameter(description = "Maximum results", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /api/sectors/popular?limit={} - Get popular sectors", limit);

        List<SectorResponse> sectors = sectorService.getMostPopular(limit);

        return ResponseEntity.ok(
                ApiResponse.success("Popular sectors retrieved successfully", sectors)
        );
    }

    /**
     * GET /api/sectors/stats
     * Get sector statistics
     * 
     * @return sector statistics
     */
    @GetMapping("/stats")
    @Operation(
            summary = "Get sector statistics",
            description = "Returns overview statistics about the sector system. " +
                    "Includes total sectors, active sectors, etc. " +
                    "Useful for admin dashboards and analytics."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Statistics retrieved successfully",
                    content = @Content(schema = @Schema(implementation = SectorStatsResponse.class))
            )
    })
    public ResponseEntity<ApiResponse<SectorStatsResponse>> getSectorStats() {
        log.info("GET /api/sectors/stats - Get sector statistics");

        SectorStatsResponse stats = sectorService.getStatistics();

        return ResponseEntity.ok(
                ApiResponse.success("Statistics retrieved successfully", stats)
        );
    }
}
