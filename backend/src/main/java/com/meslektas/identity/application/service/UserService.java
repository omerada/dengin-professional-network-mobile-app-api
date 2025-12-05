package com.meslektas.identity.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.common.storage.ImageProcessor;
import com.meslektas.common.storage.StorageService;
import com.meslektas.identity.application.dto.request.UpdateProfileRequest;
import com.meslektas.identity.application.dto.response.UserProfileResponse;
import com.meslektas.identity.application.dto.request.ChangeProfessionRequest;
import com.meslektas.identity.application.dto.request.UpdateUserRequest;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.mapper.UserMapper;
import com.meslektas.identity.domain.model.Profession;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.ProfessionRepository;
import com.meslektas.identity.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * User Management Application Service
 * 
 * DDD Pattern: Application Service (orchestrates domain operations)
 * 
 * Responsibilities:
 * - User profile operations
 * - Avatar upload
 * - Profession management
 * - Publish domain events
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfessionRepository professionRepository;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final StorageService storageService;
    private final ImageProcessor imageProcessor;

    /**
     * Get current user profile
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        log.info("Fetching user profile: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        return userMapper.toResponse(user);
    }

    /**
     * Get user profile by ID (Long)
     * 
     * Returns full profile if requesting user is viewing their own profile,
     * otherwise returns limited profile based on privacy settings.
     * 
     * @param userId           User ID to fetch
     * @param requestingUserId ID of the user making the request (null for public
     *                         access)
     * @return UserProfileResponse
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId, Long requestingUserId) {
        log.info("Fetching user profile: userId={}, requestingUserId={}", userId, requestingUserId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Check if user is active
        if (!user.isActive()) {
            throw new BusinessException(
                    "Bu kullanıcının hesabı aktif değil",
                    "USER_NOT_ACTIVE");
        }

        // Map to full profile response
        UserProfileResponse profile = userMapper.toProfileResponse(user);

        // If requesting user is viewing another user's profile, apply privacy rules
        if (requestingUserId != null && !userId.equals(requestingUserId)) {
            // Return limited profile (hide sensitive fields)
            profile = UserProfileResponse.createLimitedProfile(profile);
            log.debug("Returning limited profile for user: {}", userId);
        }

        return profile;
    }

    /**
     * Update user profile with new DTO
     * 
     * Business Rules:
     * - Users can only update their own profile
     * - Profile completeness is recalculated
     * - ProfileUpdatedEvent is published
     * 
     * @param userId  User ID
     * @param request Update profile request
     * @return Updated user profile
     */
    @Transactional
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating user profile: userId={}", userId);

        // Validate age if date of birth provided
        if (request.getDateOfBirth() != null && !request.isValidAge()) {
            throw new BusinessException(
                    "Kullanıcı en az 13 yaşında olmalıdır",
                    "INVALID_AGE");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Update profile using domain behavior
        user.updateProfile(
                request.getName(),
                request.getSurname(),
                request.getBio(),
                request.getDateOfBirth());

        // Update gender if provided
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        // Save
        User updatedUser = userRepository.save(user);

        // Publish domain events
        updatedUser.getEvents().forEach(eventPublisher::publishEvent);
        updatedUser.clearEvents();

        log.info("User profile updated successfully: userId={}", userId);

        return userMapper.toProfileResponse(updatedUser);
    }

    /**
     * Update user avatar
     * 
     * Business Rules:
     * - Old avatar is deleted from storage
     * - ProfileUpdatedEvent is published
     * - Profile completeness is recalculated
     * 
     * @param userId    User ID
     * @param avatarUrl New avatar URL from storage
     * @return Updated user profile
     */
    @Transactional
    public UserProfileResponse updateUserAvatar(Long userId, String avatarUrl) {
        log.info("Updating user avatar: userId={}, avatarUrl={}", userId, avatarUrl);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                storageService.delete(user.getAvatarUrl());
                log.info("Old avatar deleted: {}", user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Failed to delete old avatar: {}", e.getMessage());
                // Continue even if deletion fails
            }
        }

        // Update avatar using domain behavior
        user.updateAvatar(avatarUrl);

        // Save
        User updatedUser = userRepository.save(user);

        // Publish domain events
        updatedUser.getEvents().forEach(eventPublisher::publishEvent);
        updatedUser.clearEvents();

        log.info("User avatar updated successfully: userId={}", userId);

        return userMapper.toProfileResponse(updatedUser);
    }

    /**
     * Get user by ID (public profile)
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        log.info("Fetching public user profile: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Check if user is active
        if (!user.isActive()) {
            throw new BusinessException(
                    "Bu kullanıcının hesabı aktif değil",
                    "USER_NOT_ACTIVE");
        }

        return userMapper.toResponse(user);
    }

    /**
     * Update user profile
     * 
     * Business Rule: Users can update their basic information
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateUserRequest request) {
        log.info("Updating user profile: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Update basic info
        if (request.name() != null || request.surname() != null ||
                request.bio() != null || request.dateOfBirth() != null) {
            user.updateProfile(
                    request.name() != null ? request.name() : user.getName(),
                    request.surname() != null ? request.surname() : user.getSurname(),
                    request.bio(),
                    request.dateOfBirth());
        }

        // Update gender if provided
        if (request.gender() != null) {
            user.setGender(request.gender());
        }

        // Update profession if provided
        if (request.professionId() != null) {
            Profession profession = professionRepository.findById(request.professionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Profession", request.professionId()));

            user.selectProfession(profession);
        }

        // Save
        User updatedUser = userRepository.save(user);

        // Publish events
        updatedUser.getEvents().forEach(eventPublisher::publishEvent);
        updatedUser.clearEvents();

        log.info("User profile updated successfully: {}", userId);

        return userMapper.toResponse(updatedUser);
    }

    /**
     * Change user profession
     * 
     * Business Rule (BR-003):
     * - Verified profession cannot be changed (except general category)
     * - Unverified users can change freely
     */
    @Transactional
    public UserResponse changeProfession(Long userId, ChangeProfessionRequest request) {
        log.info("Changing profession for user {}: new profession {}", userId, request.professionId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Profession newProfession = professionRepository.findById(request.professionId())
                .orElseThrow(() -> new ResourceNotFoundException("Profession", request.professionId()));

        // Domain logic handles the business rules
        user.selectProfession(newProfession);

        // Save
        User updatedUser = userRepository.save(user);

        // Publish events
        updatedUser.getEvents().forEach(eventPublisher::publishEvent);
        updatedUser.clearEvents();

        log.info("Profession changed successfully for user: {}", userId);

        return userMapper.toResponse(updatedUser);
    }

    /**
     * Upload user avatar
     */
    @Transactional
    public UserResponse uploadAvatar(Long userId, MultipartFile file) {
        log.info("Uploading avatar for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Validate and process image
        imageProcessor.validateImage(file);

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                storageService.delete(user.getAvatarUrl());
                log.info("Old avatar deleted: {}", user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Failed to delete old avatar: {}", e.getMessage());
            }
        }

        // Upload to storage
        String avatarUrl = storageService.upload(file, "avatars");
        log.info("Avatar uploaded to storage: {}", avatarUrl);

        // Update user
        user.updateAvatar(avatarUrl);
        User updatedUser = userRepository.save(user);

        log.info("Avatar uploaded successfully for user: {}", userId);

        return userMapper.toResponse(updatedUser);
    }

    /**
     * Delete user account (soft delete)
     * 
     * Business Rule: Users can delete their own accounts
     */
    @Transactional
    public void deleteAccount(Long userId) {
        log.info("Deleting account: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Delete avatar from storage
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                storageService.delete(user.getAvatarUrl());
                log.info("Avatar deleted from storage: {}", user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Failed to delete avatar: {}", e.getMessage());
            }
        }

        // Soft delete (domain behavior)
        user.delete();

        // Save
        userRepository.save(user);

        // Publish events
        user.getEvents().forEach(eventPublisher::publishEvent);
        user.clearEvents();

        log.info("Account deleted successfully: {}", userId);
    }

    /**
     * Delete user avatar
     * 
     * Business Rule: Users can remove their avatar
     */
    @Transactional
    public UserResponse deleteAvatar(Long userId) {
        log.info("Deleting avatar for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Delete avatar from storage if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                storageService.delete(user.getAvatarUrl());
                log.info("Avatar deleted from storage: {}", user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Failed to delete avatar from storage: {}", e.getMessage());
            }
        }

        // Clear avatar in domain
        user.updateAvatar(null);
        User updatedUser = userRepository.save(user);

        // Publish events
        updatedUser.getEvents().forEach(eventPublisher::publishEvent);
        updatedUser.clearEvents();

        log.info("Avatar deleted successfully for user: {}", userId);

        return userMapper.toResponse(updatedUser);
    }
}
