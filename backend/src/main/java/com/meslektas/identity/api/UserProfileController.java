package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.common.api.PagedResponse;
import com.meslektas.common.storage.ImageProcessor;
import com.meslektas.common.storage.StorageService;
import com.meslektas.identity.application.dto.request.UpdateProfileRequest;
import com.meslektas.identity.application.dto.response.UserProfileResponse;
import com.meslektas.identity.application.service.UserService;
import com.meslektas.social.application.dto.PostResponse;
import com.meslektas.social.application.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * User Profile REST Controller
 * 
 * Endpoints:
 * - GET /api/users/{userId} - Get user profile
 * - PUT /api/users/{userId} - Update user profile
 * - POST /api/users/{userId}/avatar - Upload profile avatar
 * - GET /api/users/profile - Get current user profile (shortcut)
 * - PUT /api/users/profile - Update current user profile (shortcut)
 * - POST /api/users/profile/avatar - Upload current user avatar (shortcut)
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
    private final PostService postService;
    private final StorageService storageService;
    private final ImageProcessor imageProcessor;

    /**
     * GET /api/users/profile
     * Get current authenticated user's profile
     * 
     * @return UserProfileResponse
     */
    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Returns full profile of the authenticated user", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile retrieved successfully", content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token")
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUserProfile() {
        Long currentUserId = getCurrentUserId();
        log.info("GET /api/users/profile - userId: {}", currentUserId);

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
    @Operation(summary = "Get user profile by ID", description = "Returns user profile. Full profile for own profile, limited for others based on privacy settings.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @Parameter(description = "User ID (Long)", required = true) @PathVariable Long userId) {
        Long currentUserId = getCurrentUserIdOrNull();
        log.info("GET /api/users/{} - requestingUserId: {}", userId, currentUserId);

        UserProfileResponse profile = userService.getUserProfile(userId, currentUserId);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * PUT /api/users/profile
     * Update current user's profile
     * 
     * @param request Update profile request
     * @return Updated UserProfileResponse
     */
    @PutMapping("/profile")
    @Operation(summary = "Update current user profile", description = "Updates authenticated user's profile information", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateCurrentUserProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        Long currentUserId = getCurrentUserId();
        log.info("PUT /api/users/profile - userId: {}", currentUserId);

        UserProfileResponse updatedProfile = userService.updateUserProfile(currentUserId, request);

        return ResponseEntity.ok(
                ApiResponse.success("Profil başarıyla güncellendi", updatedProfile));
    }

    /**
     * PUT /api/users/{userId}
     * Update user profile by ID
     * 
     * Security: Users can only update their own profile
     * 
     * @param userId  User ID (Long)
     * @param request Update profile request
     * @return Updated UserProfileResponse
     */
    @PutMapping("/{userId}")
    @Operation(summary = "Update user profile by ID", description = "Updates user profile. Users can only update their own profile.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Cannot update another user's profile"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserProfile(
            @Parameter(description = "User ID (Long)", required = true) @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long currentUserId = getCurrentUserId();
        log.info("PUT /api/users/{} - requestingUserId: {}", userId, currentUserId);

        // Security check: Users can only update their own profile
        if (!userId.equals(currentUserId)) {
            log.warn("User {} attempted to update profile of user {}", currentUserId, userId);
            return ResponseEntity.status(403).body(
                    ApiResponse.error("Başka bir kullanıcının profilini güncelleyemezsiniz"));
        }

        UserProfileResponse updatedProfile = userService.updateUserProfile(userId, request);

        return ResponseEntity.ok(
                ApiResponse.success("Profil başarıyla güncellendi", updatedProfile));
    }

    /**
     * POST /api/users/profile/avatar
     * Upload avatar for current user
     * 
     * @param file Avatar image file (JPEG, PNG, WEBP, max 5MB)
     * @return Updated UserProfileResponse with new avatar URL
     */
    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile avatar", description = "Uploads new profile avatar for authenticated user. Max 5MB, formats: JPEG, PNG, WEBP", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Avatar uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file format or size"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadCurrentUserAvatar(
            @Parameter(description = "Avatar image file", required = true) @RequestParam("file") MultipartFile file) {
        Long currentUserId = getCurrentUserId();
        log.info("POST /api/users/profile/avatar - userId: {}", currentUserId);

        // Validate image
        imageProcessor.validateImage(file);

        // Upload to storage
        String avatarUrl = storageService.upload(file, "avatars");
        log.info("Avatar uploaded to: {}", avatarUrl);

        // Update user profile
        UserProfileResponse updatedProfile = userService.updateUserAvatar(currentUserId, avatarUrl);

        return ResponseEntity.ok(
                ApiResponse.success("Avatar başarıyla yüklendi", updatedProfile));
    }

    /**
     * POST /api/users/{userId}/avatar
     * Upload avatar for specific user
     * 
     * Security: Users can only upload avatar for their own profile
     * 
     * @param userId User ID (Long)
     * @param file   Avatar image file
     * @return Updated UserProfileResponse
     */
    @PostMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile avatar by user ID", description = "Uploads new profile avatar. Users can only upload for their own profile.", security = @SecurityRequirement(name = "Bearer Authentication"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Avatar uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file format or size"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - Cannot upload avatar for another user"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadUserAvatar(
            @Parameter(description = "User ID (Long)", required = true) @PathVariable Long userId,
            @Parameter(description = "Avatar image file", required = true) @RequestParam("file") MultipartFile file) {
        Long currentUserId = getCurrentUserId();
        log.info("POST /api/users/{}/avatar - requestingUserId: {}", userId, currentUserId);

        // Security check
        if (!userId.equals(currentUserId)) {
            log.warn("User {} attempted to upload avatar for user {}", currentUserId, userId);
            return ResponseEntity.status(403).body(
                    ApiResponse.error("Başka bir kullanıcının avatarını yükleyemezsiniz"));
        }

        // Validate image
        imageProcessor.validateImage(file);

        // Upload to storage
        String avatarUrl = storageService.upload(file, "avatars");
        log.info("Avatar uploaded to: {}", avatarUrl);

        // Update user profile
        UserProfileResponse updatedProfile = userService.updateUserAvatar(userId, avatarUrl);

        return ResponseEntity.ok(
                ApiResponse.success("Avatar başarıyla yüklendi", updatedProfile));
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

    /**
     * GET /api/users/{userId}/posts
     * Get user's posts with pagination
     * 
     * @param userId User ID
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return Paginated list of user posts
     */
    @GetMapping("/{userId}/posts")
    @Operation(
        summary = "Get user posts", 
        description = "Retrieves paginated list of user's posts. Returns public posts for all users, own posts include all visibility levels.",
        security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Posts retrieved successfully"
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
    public ResponseEntity<ApiResponse<PagedResponse<PostResponse>>> getUserPosts(
            @Parameter(description = "User ID", required = true) @PathVariable Long userId,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size (max 50)") @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size
    ) {
        Long currentUserId = getCurrentUserIdOrNull();
        log.info("GET /api/users/{}/posts - requestingUserId: {}, page: {}, size: {}", 
            userId, currentUserId, page, size);

        // Get user posts from PostService
        List<PostResponse> posts = postService.getUserPosts(userId, currentUserId);

        // Convert to paginated response
        int start = page * size;
        int end = Math.min(start + size, posts.size());
        
        List<PostResponse> pagedPosts = start < posts.size() 
            ? posts.subList(start, end) 
            : List.of();

        Page<PostResponse> postPage = new PageImpl<>(
            pagedPosts,
            PageRequest.of(page, size),
            posts.size()
        );

        PagedResponse<PostResponse> response = PagedResponse.<PostResponse>builder()
            .content(postPage.getContent())
            .page(postPage.getNumber())
            .size(postPage.getSize())
            .totalElements(postPage.getTotalElements())
            .totalPages(postPage.getTotalPages())
            .hasNext(postPage.hasNext())
            .build();

        log.info("User posts retrieved - userId: {}, count: {}, hasNext: {}", 
            userId, response.getContent().size(), response.getHasNext());

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
