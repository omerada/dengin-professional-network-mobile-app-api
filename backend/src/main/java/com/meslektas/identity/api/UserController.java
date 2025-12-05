package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.common.api.PagedResponse;
import com.meslektas.identity.application.dto.request.ChangeProfessionRequest;
import com.meslektas.identity.application.dto.request.UpdateUserRequest;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.service.UserService;
import com.meslektas.identity.infrastructure.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * User Management REST Controller
 * 
 * Endpoints:
 * - GET /api/users/me - Get current user profile
 * - PUT /api/users/me - Update current user profile
 * - GET /api/users/{id} - Get user by ID
 * - POST /api/users/me/avatar - Upload avatar
 * - PUT /api/users/me/profession - Change profession
 * - DELETE /api/users/me - Delete account
 * - GET /api/users/search - Search users by name
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User profile and management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Get authenticated user's profile information")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse user = userService.getCurrentUser(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by name with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> searchUsers(
            @RequestParam @Parameter(description = "Search query (min 2 characters)") String q,
            @RequestParam(defaultValue = "0") @Parameter(description = "Page number (0-based)") int page,
            @RequestParam(defaultValue = "20") @Parameter(description = "Page size (max 50)") int size
    ) {
        PagedResponse<UserResponse> users = userService.searchUsers(q, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Get public profile of any user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id
    ) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Update current user's profile information")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse user = userService.updateProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload avatar", description = "Upload profile picture (max 5MB, JPEG/PNG/WebP)")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse user = userService.uploadAvatar(userDetails.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Avatar uploaded successfully", user));
    }

    @PutMapping("/me/profession")
    @Operation(
            summary = "Change profession",
            description = "Change user's profession. Note: Verified professions cannot be changed (BR-003)"
    )
    public ResponseEntity<ApiResponse<UserResponse>> changeProfession(
            @Valid @RequestBody ChangeProfessionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse user = userService.changeProfession(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profession changed successfully", user));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete account", description = "Soft delete current user's account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        userService.deleteAccount(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }

    /**
     * DELETE /api/users/me/avatar
     * Delete user's avatar
     */
    @DeleteMapping("/me/avatar")
    @Operation(summary = "Delete avatar", description = "Remove user's profile picture and reset to default")
    public ResponseEntity<ApiResponse<UserResponse>> deleteAvatar(
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse user = userService.deleteAvatar(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Avatar deleted successfully", user));
    }
}
