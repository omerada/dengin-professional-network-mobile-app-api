package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.common.storage.ImageProcessor;
import com.meslektas.common.storage.StorageService;
import com.meslektas.identity.application.dto.UpdateProfileRequest;
import com.meslektas.identity.application.dto.UserProfileResponse;
import com.meslektas.identity.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * User Profile REST Controller
 * 
 * Endpoints:
 * - GET /api/users/{userId} - Get user profile
 * - PUT /api/users/{userId} - Update user profile
 * - POST /api/users/{userId}/avatar - Upload profile avatar
 * - GET /api/users/me - Get current user profile (shortcut)
 * - PUT /api/users/me - Update current user profile (shortcut)
 * - POST /api/users/me/avatar - Upload current user avatar (shortcut)
 * 
 * Security:
 * - All endpoints require authentication (Bearer JWT)
 * - Users can only update their own profile
 * - Profile visibility respects privacy settings
 * 
 * Sprint 2 Implementation
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile management endpoints")
public class UserProfileController {

    private final UserService userService;
    private final StorageService storageService;
    private final ImageProcessor imageProcessor;

    /**
     * GET /api/users/me
     * Get current authenticated user's profile
     * 
     * @return UserProfileResponse
     */
    @GetMapping("/me")
    @Operation(
        summary = "Get current user profile",
        description = "Returns full profile of the authenticated user",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Profile retrieved successfully",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Invalid or missing token"
        )
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUserProfile() {
        Long currentUserId = getCurrentUserId();
        log.info("GET /api/users/me - userId: {}", currentUserId);
        
        UserProfileResponse profile = userService.getUserProfile(currentUserId, currentUserId);
        
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * GET /api/users/{userId}
     * Get user profile by ID
     * 
     * @param userId User ID (Long)
     * @return UserProfileResponse (limited if not own profile)
     */
    @GetMapping("/{userId}")
    @Operation(
        summary = "Get user profile by ID",
        description = "Returns user profile. Full profile for own profile, limited for others based on privacy settings.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Profile retrieved successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @Parameter(description = "User ID (Long)", required = true)
            @PathVariable Long userId
    ) {
        Long currentUserId = getCurrentUserIdOrNull();
        log.info("GET /api/users/{} - requestingUserId: {}", userId, currentUserId);
        
        UserProfileResponse profile = userService.getUserProfile(userId, currentUserId);
        
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * PUT /api/users/me
     * Update current user's profile
     * 
     * @param request Update profile request
     * @return Updated UserProfileResponse
     */
    @PutMapping("/me")
    @Operation(
        summary = "Update current user profile",
        description = "Updates authenticated user's profile information",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Profile updated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request data"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateCurrentUserProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long currentUserId = getCurrentUserId();
        log.info("PUT /api/users/me - userId: {}", currentUserId);
        
        UserProfileResponse updatedProfile = userService.updateUserProfile(currentUserId, request);
        
        return ResponseEntity.ok(
            ApiResponse.success("Profil başarıyla güncellendi", updatedProfile)
        );
    }

    /**
     * PUT /api/users/{userId}
     * Update user profile by ID
     * 
     * Security: Users can only update their own profile
     * 
     * @param userId User ID (Long)
     * @param request Update profile request
     * @return Updated UserProfileResponse
     */
    @PutMapping("/{userId}")
    @Operation(
        summary = "Update user profile by ID",
        description = "Updates user profile. Users can only update their own profile.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Profile updated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request data"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - Cannot update another user's profile"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserProfile(
            @Parameter(description = "User ID (Long)", required = true)
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long currentUserId = getCurrentUserId();
        log.info("PUT /api/users/{} - requestingUserId: {}", userId, currentUserId);
        
        // Security check: Users can only update their own profile
        if (!userId.equals(currentUserId)) {
            log.warn("User {} attempted to update profile of user {}", currentUserId, userId);
            return ResponseEntity.status(403).body(
                ApiResponse.error("Başka bir kullanıcının profilini güncelleyemezsiniz")
            );
        }
        
        UserProfileResponse updatedProfile = userService.updateUserProfile(userId, request);
        
        return ResponseEntity.ok(
            ApiResponse.success("Profil başarıyla güncellendi", updatedProfile)
        );
    }
    
    /**
     * POST /api/users/me/avatar
     * Upload avatar for current user
     * 
     * @param file Avatar image file (JPEG, PNG, WEBP, max 5MB)
     * @return Updated UserProfileResponse with new avatar URL
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload profile avatar",
        description = "Uploads new profile avatar for authenticated user. Max 5MB, formats: JPEG, PNG, WEBP",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Avatar uploaded successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid file format or size"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        )
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadCurrentUserAvatar(
            @Parameter(description = "Avatar image file", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        Long currentUserId = getCurrentUserId();
        log.info("POST /api/users/me/avatar - userId: {}", currentUserId);
        
        // Validate image
        imageProcessor.validateImage(file);
        
        // Upload to storage
        String avatarUrl = storageService.upload(file, "avatars");
        log.info("Avatar uploaded to: {}", avatarUrl);
        
        // Update user profile
        UserProfileResponse updatedProfile = userService.updateUserAvatar(currentUserId, avatarUrl);
        
        return ResponseEntity.ok(
            ApiResponse.success("Avatar başarıyla yüklendi", updatedProfile)
        );
    }
    
    /**
     * POST /api/users/{userId}/avatar
     * Upload avatar for specific user
     * 
     * Security: Users can only upload avatar for their own profile
     * 
     * @param userId User ID (Long)
     * @param file Avatar image file
     * @return Updated UserProfileResponse
     */
    @PostMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload profile avatar by user ID",
        description = "Uploads new profile avatar. Users can only upload for their own profile.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Avatar uploaded successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid file format or size"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - Cannot upload avatar for another user"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadUserAvatar(
            @Parameter(description = "User ID (Long)", required = true)
            @PathVariable Long userId,
            @Parameter(description = "Avatar image file", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        Long currentUserId = getCurrentUserId();
        log.info("POST /api/users/{}/avatar - requestingUserId: {}", userId, currentUserId);
        
        // Security check
        if (!userId.equals(currentUserId)) {
            log.warn("User {} attempted to upload avatar for user {}", currentUserId, userId);
            return ResponseEntity.status(403).body(
                ApiResponse.error("Başka bir kullanıcının avatarını yükleyemezsiniz")
            );
        }
        
        // Validate image
        imageProcessor.validateImage(file);
        
        // Upload to storage
        String avatarUrl = storageService.upload(file, "avatars");
        log.info("Avatar uploaded to: {}", avatarUrl);
        
        // Update user profile
        UserProfileResponse updatedProfile = userService.updateUserAvatar(userId, avatarUrl);
        
        return ResponseEntity.ok(
            ApiResponse.success("Avatar başarıyla yüklendi", updatedProfile)
        );
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Get current authenticated user's ID from SecurityContext
     * 
     * @return Long ID of current user
     * @throws IllegalStateException if user not authenticated
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof com.meslektas.identity.infrastructure.security.UserDetailsImpl userDetails) {
            return userDetails.getId();
        }
        
        throw new IllegalStateException("Invalid principal type");
    }

    /**
     * Get current user ID or null if not authenticated
     * 
     * @return Long ID or null
     */
    private Long getCurrentUserIdOrNull() {
        try {
            return getCurrentUserId();
        } catch (Exception e) {
            return null;
        }
    }
}
