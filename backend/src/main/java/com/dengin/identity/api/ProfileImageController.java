package com.dengin.identity.api;

import com.dengin.identity.application.dto.response.UserResponse;
import com.dengin.identity.application.service.UserService;
import com.dengin.common.api.ApiResponse;
import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import com.dengin.identity.infrastructure.storage.ProfileImageS3Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Profile Image Upload Controller - Presigned URL Pattern
 * 
 * Endpoints:
 * - POST /api/users/me/avatar/presigned-url - Generate presigned URL for upload
 * - POST /api/users/me/avatar/confirm - Confirm upload and update profile
 * 
 * Flow:
 * 1. Mobile calls POST /api/users/me/avatar/presigned-url with contentType
 * 2. Backend returns presigned URL + S3 key
 * 3. Mobile uploads image directly to S3 using presigned URL (PUT request)
 * 4. Mobile calls POST /api/users/me/avatar/confirm with S3 key
 * 5. Backend validates S3 upload, updates user.avatarUrl with CloudFront URL
 * 
 * Security:
 * - Presigned URL expires in 5 minutes
 * - S3 key validation: Must match user ID
 * - Content-Type validation: Only image/jpeg, image/png, image/webp
 * - Max file size: 5MB (enforced by presigned URL)
 * 
 * References:
 * - Service: ProfileImageS3Service
 * - Mobile implementation: mobile/src/features/verification/services/uploadService.ts
 */
@RestController
@RequestMapping("/api/users/me/avatar")
@RequiredArgsConstructor
@Tag(name = "Profile Image Upload", description = "Presigned URL-based avatar upload endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ProfileImageController {

    private final ProfileImageS3Service profileImageS3Service;
    private final UserService userService;

    /**
     * POST /api/users/me/avatar/presigned-url
     * 
     * Generate presigned URL for direct S3 upload
     * 
     * @param request Content type (image/jpeg, image/png, image/webp)
     * @param userDetails Authenticated user
     * @return Presigned URL, S3 key, expiration
     */
    @PostMapping("/presigned-url")
    @Operation(
            summary = "Generate presigned URL for avatar upload",
            description = """
                    Step 1 of avatar upload flow.
                    Returns a time-limited presigned URL for direct S3 upload.
                    
                    Mobile should:
                    1. Call this endpoint with contentType
                    2. Upload image to returned URL using PUT request
                    3. Call /confirm endpoint with returned key
                    
                    Security:
                    - URL expires in 5 minutes
                    - Max file size: 5MB
                    - Allowed types: image/jpeg, image/png, image/webp
                    """
    )
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> generatePresignedUrl(
            @Valid @RequestBody GeneratePresignedUrlRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        ProfileImageS3Service.PresignedUrlResponse response = profileImageS3Service
                .generatePresignedUploadUrl(userDetails.getId(), request.getContentType());

        return ResponseEntity.ok(ApiResponse.success(
                "Presigned URL generated successfully",
                PresignedUrlResponse.builder()
                        .url(response.getUrl())
                        .key(response.getKey())
                        .expiresIn(response.getExpiresIn())
                        .contentType(response.getContentType())
                        .maxFileSize(response.getMaxFileSize())
                        .build()
        ));
    }

    /**
     * POST /api/users/me/avatar/confirm
     * 
     * Confirm S3 upload and update user profile
     * 
     * @param request S3 key from presigned URL response
     * @param userDetails Authenticated user
     * @return Updated user profile with CloudFront avatar URL
     */
    @PostMapping("/confirm")
    @Operation(
            summary = "Confirm avatar upload",
            description = """
                    Step 2 of avatar upload flow.
                    Validates S3 upload and updates user profile with CloudFront URL.
                    
                    Mobile should:
                    1. Upload image to presigned URL (from previous step)
                    2. Call this endpoint with S3 key
                    3. Backend validates upload and returns CloudFront URL
                    
                    Validation:
                    - Verifies object exists in S3
                    - Validates S3 key belongs to authenticated user
                    - Checks metadata for security
                    - Deletes old avatar (if exists)
                    """
    )
    public ResponseEntity<ApiResponse<UserResponse>> confirmUpload(
            @Valid @RequestBody ConfirmUploadRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        // Validate S3 upload and get CloudFront URL
        String cloudFrontUrl = profileImageS3Service.confirmUploadAndGetUrl(
                userDetails.getId(),
                request.getKey()
        );

        // Update user profile with new avatar URL
        UserResponse user = userService
                .updateAvatarUrl(userDetails.getId(), cloudFrontUrl);

        return ResponseEntity.ok(ApiResponse.success(
                "Avatar uploaded successfully",
                user
        ));
    }

    // ==================== DTOs ====================

    /**
     * Request: Generate Presigned URL
     */
    @Data
    public static class GeneratePresignedUrlRequest {
        @NotBlank(message = "Content type is required")
        @Pattern(
                regexp = "^(image/jpeg|image/png|image/webp)$",
                message = "Invalid content type. Allowed: image/jpeg, image/png, image/webp"
        )
        @Parameter(
                description = "Image content type",
                example = "image/jpeg",
                required = true
        )
        private String contentType;
    }

    /**
     * Response: Presigned URL
     */
    @Data
    @lombok.Builder
    public static class PresignedUrlResponse {
        @Parameter(description = "Presigned URL for PUT request", example = "https://bucket.s3.amazonaws.com/users/123/avatar-abc123.jpg?X-Amz-...")
        private String url;

        @Parameter(description = "S3 object key (use in /confirm endpoint)", example = "users/123/avatar-abc123.jpg")
        private String key;

        @Parameter(description = "URL expiration in seconds", example = "300")
        private Long expiresIn;

        @Parameter(description = "Expected content type", example = "image/jpeg")
        private String contentType;

        @Parameter(description = "Max file size in bytes", example = "5242880")
        private Long maxFileSize;
    }

    /**
     * Request: Confirm Upload
     */
    @Data
    public static class ConfirmUploadRequest {
        @NotBlank(message = "S3 key is required")
        @Parameter(
                description = "S3 object key from presigned URL response",
                example = "users/123/avatar-abc123.jpg",
                required = true
        )
        private String key;
    }
}
