package com.dengin.identity.application.service;

import com.dengin.common.exception.BusinessException;
import com.dengin.common.exception.ResourceNotFoundException;
import com.dengin.common.storage.ImageProcessor;
import com.dengin.common.storage.StorageService;
import com.dengin.identity.application.dto.request.UpdateProfileRequest;
import com.dengin.identity.application.dto.response.UserProfileResponse;
import com.dengin.identity.application.dto.request.ChangeProfessionRequest;
import com.dengin.identity.application.dto.response.UserResponse;
import com.dengin.identity.application.mapper.UserMapper;
import com.dengin.identity.application.service.UserService;
import com.dengin.identity.domain.model.Profession;
import com.dengin.identity.domain.model.ProfessionCategory;
import com.dengin.identity.domain.model.User;
import com.dengin.identity.domain.model.UserStatus;
import com.dengin.identity.domain.repository.ProfessionRepository;
import com.dengin.identity.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;

/**
 * Unit Tests for UserService
 * 
 * Tests user management application service:
 * - Get current user
 * - Update profile
 * - Upload avatar
 * - Change profession
 * - Delete account
 * 
 * Coverage Target: 90%+
 * 
 * Sprint 2 Implementation
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfessionRepository professionRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private StorageService storageService;

    @Mock
    private ImageProcessor imageProcessor;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserResponse testUserResponse;
    private UserProfileResponse testProfileResponse;
    private Profession testProfession;

    @BeforeEach
    void setUp() {
        testProfession = Profession.builder()
                .name("Doktor")
                .category(ProfessionCategory.MEDICAL)
                .requiresVerification(true)
                .build();

        testUser = User.builder()
                .email("test@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .name("Ahmet")
                .surname("Yılmaz")
                .bio("Test bio")
                .avatarUrl("https://example.com/avatar.jpg")
                .status(UserStatus.ACTIVE)
                .profession(testProfession)
                .isProfessionVerified(false)
                .isEmailVerified(true)
                .isProfileComplete(false)
                .build();

        // Set ID via reflection (simulating database assignment)
        ReflectionTestUtils.setField(testUser, "id", 1L);
        ReflectionTestUtils.setField(testProfession, "id", 1L);

        testUserResponse = UserResponse.builder()
                .id(1L)
                .email("test@example.com")
                .name("Ahmet")
                .surname("Yılmaz")
                .bio("Test bio")
                .avatarUrl("https://example.com/avatar.jpg")
                .build();

        testProfileResponse = UserProfileResponse.builder()
                .userId(1L)
                .email("test@example.com")
                .name("Ahmet")
                .surname("Yılmaz")
                .fullName("Ahmet Yılmaz")
                .bio("Test bio")
                .avatarUrl("https://example.com/avatar.jpg")
                .professionId(1L)
                .professionName("Doktor")
                .professionCategory("MEDICAL")
                .isProfessionVerified(false)
                .status("ACTIVE")
                .build();
    }

    // =====================================================
    // Get Current User Tests
    // =====================================================

    @Nested
    @DisplayName("Get Current User Tests")
    class GetCurrentUserTests {

        @Test
        @DisplayName("Should return current user successfully")
        void shouldReturnCurrentUser() {
            // Given
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userMapper.toResponse(testUser)).thenReturn(testUserResponse);

            // When
            UserResponse result = userService.getCurrentUser(userId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo("test@example.com");
            assertThat(result.getName()).isEqualTo("Ahmet");
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            // Given
            Long userId = 999L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> userService.getCurrentUser(userId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // =====================================================
    // Get User Profile Tests
    // =====================================================

    @Nested
    @DisplayName("Get User Profile Tests")
    class GetUserProfileTests {

        @Test
        @DisplayName("Should return full profile when viewing own profile")
        void shouldReturnFullProfileWhenViewingOwnProfile() {
            // Given
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userMapper.toProfileResponse(testUser)).thenReturn(testProfileResponse);

            // When
            UserProfileResponse result = userService.getUserProfile(userId, userId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo("test@example.com");
            verify(userMapper).toProfileResponse(testUser);
        }

        @Test
        @DisplayName("Should return limited profile when viewing other user's profile")
        void shouldReturnLimitedProfileWhenViewingOtherProfile() {
            // Given
            Long userId = 1L;
            Long requestingUserId = 2L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userMapper.toProfileResponse(testUser)).thenReturn(testProfileResponse);

            // When
            UserProfileResponse result = userService.getUserProfile(userId, requestingUserId);

            // Then
            assertThat(result).isNotNull();
            // Email should not be included in limited profile
            assertThat(result.getEmail()).isNull();
        }

        @Test
        @DisplayName("Should throw exception for inactive user")
        void shouldThrowExceptionForInactiveUser() {
            // Given
            User bannedUser = User.builder()
                    .email("banned@example.com")
                    .status(UserStatus.BANNED)
                    .build();

            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(bannedUser));

            // When & Then
            assertThatThrownBy(() -> userService.getUserProfile(userId, 2L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("kullanıcının hesabı aktif değil");
        }
    }

    // =====================================================
    // Update Profile Tests
    // =====================================================

    @Nested
    @DisplayName("Update Profile Tests")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should update profile successfully")
        void shouldUpdateProfileSuccessfully() {
            // Given
            Long userId = 1L;
            UpdateProfileRequest request = UpdateProfileRequest.builder()
                    .name("Yeni Ad")
                    .surname("Yeni Soyad")
                    .bio("Yeni biyografi")
                    .dateOfBirth(LocalDate.of(1990, 1, 1))
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toProfileResponse(any(User.class))).thenReturn(testProfileResponse);

            // When
            UserProfileResponse result = userService.updateUserProfile(userId, request);

            // Then
            assertThat(result).isNotNull();
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception for invalid age")
        void shouldThrowExceptionForInvalidAge() {
            // Given
            Long userId = 1L;
            UpdateProfileRequest request = UpdateProfileRequest.builder()
                    .name("Test")
                    .surname("User")
                    .dateOfBirth(LocalDate.now().minusYears(10)) // 10 years old
                    .build();

            // When & Then
            assertThatThrownBy(() -> userService.updateUserProfile(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("en az 13 yaşında");
        }

        @Test
        @DisplayName("Should publish ProfileUpdatedEvent")
        void shouldPublishProfileUpdatedEvent() {
            // Given
            Long userId = 1L;
            UpdateProfileRequest request = UpdateProfileRequest.builder()
                    .name("Yeni Ad")
                    .surname("Yeni Soyad")
                    .bio("Yeni biyografi")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toProfileResponse(any(User.class))).thenReturn(testProfileResponse);

            // When
            userService.updateUserProfile(userId, request);

            // Then
            verify(eventPublisher, atLeastOnce()).publishEvent(any(Object.class));
        }
    }

    // =====================================================
    // Upload Avatar Tests
    // =====================================================

    @Nested
    @DisplayName("Upload Avatar Tests")
    class UploadAvatarTests {

        @Test
        @DisplayName("Should upload avatar successfully")
        void shouldUploadAvatarSuccessfully() {
            // Given
            Long userId = 1L;
            MultipartFile file = new MockMultipartFile(
                    "avatar",
                    "avatar.jpg",
                    "image/jpeg",
                    "test image content".getBytes());

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            doNothing().when(imageProcessor).validateImage(any());
            when(storageService.upload(any(), anyString())).thenReturn("https://s3.../new-avatar.jpg");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            UserResponse result = userService.uploadAvatar(userId, file);

            // Then
            assertThat(result).isNotNull();
            verify(storageService).upload(any(), contains("avatars"));
        }

        @Test
        @DisplayName("Should validate file type")
        void shouldValidateFileType() {
            // Given
            Long userId = 1L;
            MultipartFile invalidFile = new MockMultipartFile(
                    "avatar",
                    "document.pdf",
                    "application/pdf",
                    "pdf content".getBytes());

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            doThrow(new BusinessException("Invalid file type", "INVALID_FILE_TYPE"))
                    .when(imageProcessor).validateImage(any());

            // When & Then
            assertThatThrownBy(() -> userService.uploadAvatar(userId, invalidFile))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Should delete old avatar before uploading new one")
        void shouldDeleteOldAvatarBeforeUploadingNew() {
            // Given
            Long userId = 1L;
            MultipartFile file = new MockMultipartFile(
                    "avatar",
                    "avatar.jpg",
                    "image/jpeg",
                    "test image content".getBytes());

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            doNothing().when(imageProcessor).validateImage(any());
            when(storageService.upload(any(), anyString())).thenReturn("https://s3.../new-avatar.jpg");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            userService.uploadAvatar(userId, file);

            // Then
            verify(storageService).delete(anyString());
        }
    }

    // =====================================================
    // Change Profession Tests
    // =====================================================

    @Nested
    @DisplayName("Change Profession Tests")
    class ChangeProfessionTests {

        @Test
        @DisplayName("Should change profession successfully for unverified user")
        void shouldChangeProfessionForUnverifiedUser() {
            // Given
            Long userId = 1L;
            Long newProfessionId = 2L;

            Profession newProfession = Profession.builder()
                    .name("Avukat")
                    .category(ProfessionCategory.LEGAL)
                    .requiresVerification(true)
                    .build();

            ChangeProfessionRequest request = new ChangeProfessionRequest(newProfessionId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(professionRepository.findById(newProfessionId)).thenReturn(Optional.of(newProfession));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userMapper.toResponse(any(User.class))).thenReturn(testUserResponse);

            // When
            UserResponse result = userService.changeProfession(userId, request);

            // Then
            assertThat(result).isNotNull();
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when changing verified profession")
        void shouldThrowExceptionWhenChangingVerifiedProfession() {
            // Given
            Long userId = 1L;
            Long newProfessionId = 2L;

            User verifiedUser = User.builder()
                    .email("test@example.com")
                    .profession(testProfession)
                    .isProfessionVerified(true)
                    .status(UserStatus.ACTIVE)
                    .build();

            Profession newProfession = Profession.builder()
                    .name("Avukat")
                    .category(ProfessionCategory.LEGAL)
                    .requiresVerification(true)
                    .build();

            ChangeProfessionRequest request = new ChangeProfessionRequest(newProfessionId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));
            when(professionRepository.findById(newProfessionId)).thenReturn(Optional.of(newProfession));

            // When & Then
            assertThatThrownBy(() -> userService.changeProfession(userId, request))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Should throw exception when profession not found")
        void shouldThrowExceptionWhenProfessionNotFound() {
            // Given
            Long userId = 1L;
            Long invalidProfessionId = 999L;

            ChangeProfessionRequest request = new ChangeProfessionRequest(invalidProfessionId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(professionRepository.findById(invalidProfessionId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> userService.changeProfession(userId, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // =====================================================
    // Delete Account Tests
    // =====================================================

    @Nested
    @DisplayName("Delete Account Tests")
    class DeleteAccountTests {

        @Test
        @DisplayName("Should soft delete account successfully")
        void shouldSoftDeleteAccountSuccessfully() {
            // Given
            Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            // When
            assertThatCode(() -> userService.deleteAccount(userId))
                    .doesNotThrowAnyException();

            // Then
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFoundForDelete() {
            // Given
            Long userId = 999L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> userService.deleteAccount(userId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
