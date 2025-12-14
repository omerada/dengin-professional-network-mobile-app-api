package com.dengin.social.api;

import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.social.application.dto.SuggestedUserResponse;
import com.dengin.social.application.service.SuggestionService;
import com.dengin.social.domain.service.UserSuggestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User Suggestion REST Controller
 * 
 * Provides personalized user recommendation endpoints.
 * 
 * Endpoints:
 * - GET /api/users/suggested - Get suggested users for current user
 * 
 * Features:
 * - Algorithm-based suggestions (profession + engagement + verified)
 * - 5-minute caching per user
 * - Rate limiting: 60 requests/hour
 * - Authentication: Required
 * 
 * Mobile Integration:
 * - SuggestedExpertsCarousel component
 * - NoFollowingEmptyState component
 * - FeedScreen suggested experts
 * - Replaces mockExperts.ts and NoFollowingEmptyState.types.ts
 * 
 * Algorithm Weights:
 * - Same profession: 50%
 * - High engagement: 30%
 * - Verified users: 20%
 * 
 * @see SuggestionService
 * @see UserSuggestionService
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Suggestions", description = "Personalized user recommendation endpoints")
public class SuggestionController {
    
    private final SuggestionService suggestionService;
    
    /**
     * GET /api/users/suggested
     * Get personalized user suggestions for current user
     * 
     * Returns 8 suggested users by default, scored by:
     * - Same profession (50% weight)
     * - High engagement/followers (30% weight)
     * - Verified users (20% weight)
     * 
     * Business Rules:
     * - Excludes already followed users
     * - Excludes blocked users
     * - Excludes self
     * - Prioritizes verified professionals
     * 
     * @param currentUser Authenticated user (from JWT)
     * @param limit       Optional limit (default: 8, max: 20)
     * @return List of suggested user responses
     */
    @GetMapping("/suggested")
    @Operation(
        summary = "Get suggested users",
        description = "Returns personalized user recommendations based on profession, engagement, and verification status. " +
                     "Algorithm excludes already followed users and prioritizes verified professionals. " +
                     "Replaces mobile mockExperts.ts with dynamic algorithm-based suggestions.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved suggested users",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SuggestedUserResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid limit parameter (must be 1-20)"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - JWT token missing or invalid"
        ),
        @ApiResponse(
            responseCode = "429",
            description = "Rate limit exceeded (60 requests/hour)"
        )
    })
    public ResponseEntity<List<SuggestedUserResponse>> getSuggestedUsers(
        @AuthenticationPrincipal UserDetailsImpl currentUser,
        @Parameter(
            description = "Number of suggestions to return (default: 8, max: 20)",
            example = "8"
        )
        @RequestParam(required = false, defaultValue = "8") int limit
    ) {
        log.info("GET /api/users/suggested - User: {}, Limit: {}", currentUser.getId(), limit);
        
        // Validate limit
        if (limit < 1 || limit > 20) {
            log.warn("Invalid limit parameter: {}", limit);
            return ResponseEntity.badRequest().build();
        }
        
        List<SuggestedUserResponse> suggestions = suggestionService.getSuggestedUsers(
            currentUser.getId(), 
            limit
        );
        
        log.debug("Returning {} suggested users for user {}", suggestions.size(), currentUser.getId());
        return ResponseEntity.ok(suggestions);
    }
}
