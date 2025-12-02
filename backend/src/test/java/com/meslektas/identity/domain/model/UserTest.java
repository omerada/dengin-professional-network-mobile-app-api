package com.meslektas.identity.domain.model;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.identity.domain.model.ProfessionCategory;
import com.meslektas.identity.domain.event.PasswordChangedEvent;
import com.meslektas.identity.domain.event.ProfileUpdatedEvent;
import com.meslektas.identity.domain.event.UserProfessionVerifiedEvent;
import com.meslektas.identity.domain.event.UserRegisteredEvent;
import com.meslektas.identity.domain.event.UserStatusChangedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit Tests for User Aggregate Root
 * 
 * Tests domain logic and business rules:
 * - BR-003: Profession-based access control
 * - BR-004: Verification constraints
 * - BR-011: User status management
 * 
 * Coverage Target: 95%+
 */
@DisplayName("User Aggregate Tests")
class UserTest {

    private Profession testProfession;

    @BeforeEach
    void setUp() {
        testProfession = Profession.builder()
                .name("Doktor")
                .category(ProfessionCategory.MEDICAL)
                .requiresVerification(true)
                .build();
    }

    // =====================================================
    // Factory Method Tests
    // =====================================================

    @Test
    @DisplayName("Should create user from registration with valid data")
    void shouldCreateUserFromRegistration() {
        // Given
        String email = "test@example.com";
        String passwordHash = "$2a$10$hashedpassword";
        String name = "Ahmet";
        String surname = "Yılmaz";

        // When
        User user = User.createFromRegistration(email, passwordHash, name, surname);

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getPasswordHash()).isEqualTo(passwordHash);
        assertThat(user.getName()).isEqualTo(name);
        assertThat(user.getSurname()).isEqualTo(surname);
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getIsProfessionVerified()).isFalse();
        assertThat(user.getIsEmailVerified()).isFalse();
        assertThat(user.getOauthProvider()).isEqualTo(OAuthProvider.LOCAL);
    }

    @Test
    @DisplayName("Should publish UserRegisteredEvent when user created from registration")
    void shouldPublishUserRegisteredEventOnRegistration() {
        // When
        User user = User.createFromRegistration(
            "test@example.com",
            "hashedpassword",
            "Ahmet",
            "Yılmaz"
        );

        // Then
        assertThat(user.getEvents()).hasSize(1);
        assertThat(user.getEvents().get(0)).isInstanceOf(UserRegisteredEvent.class);
        
        UserRegisteredEvent event = (UserRegisteredEvent) user.getEvents().get(0);
        assertThat(event.getAggregateId()).isEqualTo(user.getId());
        assertThat(event.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should create user from OAuth with verified email")
    void shouldCreateUserFromOAuth() {
        // Given
        String email = "oauth@example.com";
        String name = "OAuth";
        String surname = "User";
        String avatarUrl = "https://example.com/avatar.jpg";
        OAuthProvider provider = OAuthProvider.GOOGLE;
        String providerId = "google-123";

        // When
        User user = User.createFromOAuth(email, name, surname, avatarUrl, provider, providerId);

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getIsEmailVerified()).isTrue();
        assertThat(user.getEmailVerifiedAt()).isNotNull();
        assertThat(user.getOauthProvider()).isEqualTo(provider);
        assertThat(user.getOauthProviderId()).isEqualTo(providerId);
        assertThat(user.getAvatarUrl()).isEqualTo(avatarUrl);
    }

    // =====================================================
    // Profile Update Tests
    // =====================================================

    @Test
    @DisplayName("Should update profile and publish ProfileUpdatedEvent")
    void shouldUpdateProfileAndPublishEvent() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Old", "Name");
        user.clearEvents();

        String newName = "New";
        String newSurname = "Name";
        String newBio = "Test bio";
        LocalDate newDob = LocalDate.of(2000, 1, 1);

        // When
        user.updateProfile(newName, newSurname, newBio, newDob);

        // Then
        assertThat(user.getName()).isEqualTo(newName);
        assertThat(user.getSurname()).isEqualTo(newSurname);
        assertThat(user.getBio()).isEqualTo(newBio);
        assertThat(user.getDateOfBirth()).isEqualTo(newDob);

        assertThat(user.getEvents()).hasSize(1);
        assertThat(user.getEvents().get(0)).isInstanceOf(ProfileUpdatedEvent.class);
    }

    @Test
    @DisplayName("Should update avatar and publish ProfileUpdatedEvent")
    void shouldUpdateAvatarAndPublishEvent() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.clearEvents();

        String newAvatarUrl = "https://example.com/new-avatar.jpg";

        // When
        user.updateAvatar(newAvatarUrl);

        // Then
        assertThat(user.getAvatarUrl()).isEqualTo(newAvatarUrl);
        assertThat(user.getEvents()).hasSize(1);
        assertThat(user.getEvents().get(0)).isInstanceOf(ProfileUpdatedEvent.class);
    }

    @Test
    @DisplayName("Should not publish event if profile data unchanged")
    void shouldNotPublishEventIfProfileUnchanged() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.clearEvents();

        // When - update with same values
        user.updateProfile("Test", "User", null, null);

        // Then
        assertThat(user.getEvents()).isEmpty();
    }

    // =====================================================
    // Profession Selection Tests (BR-003)
    // =====================================================

    @Test
    @DisplayName("Should select profession when not verified")
    void shouldSelectProfessionWhenNotVerified() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // When
        user.selectProfession(testProfession);

        // Then
        assertThat(user.getProfession()).isEqualTo(testProfession);
        assertThat(user.getIsProfessionVerified()).isFalse();
    }

    @Test
    @DisplayName("Should throw exception when changing verified non-general profession")
    void shouldThrowExceptionWhenChangingVerifiedProfession() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.selectProfession(testProfession);
        user.verifyProfession();

        Profession newProfession = Profession.builder()
                .name("Avukat")
                .category(ProfessionCategory.LEGAL)
                .requiresVerification(true)
                .build();

        // When & Then
        assertThatThrownBy(() -> user.selectProfession(newProfession))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Doğrulanmış meslek değiştirilemez");
    }

    @Test
    @DisplayName("Should allow changing verified general category profession")
    void shouldAllowChangingVerifiedGeneralProfession() {
        // Given
        Profession generalProfession = Profession.builder()
                .name("Diğer")
                .category(ProfessionCategory.OTHER)
                .requiresVerification(false)
                .build();

        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.selectProfession(generalProfession);
        user.verifyProfession();

        // When
        user.selectProfession(testProfession);

        // Then
        assertThat(user.getProfession()).isEqualTo(testProfession);
        assertThat(user.getIsProfessionVerified()).isFalse(); // Reset verification
    }

    // =====================================================
    // Profession Verification Tests (BR-004)
    // =====================================================

    @Test
    @DisplayName("Should verify profession and publish event")
    void shouldVerifyProfessionAndPublishEvent() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.selectProfession(testProfession);
        user.clearEvents();

        // When
        user.verifyProfession();

        // Then
        assertThat(user.getIsProfessionVerified()).isTrue();
        assertThat(user.getProfessionVerifiedAt()).isNotNull();

        assertThat(user.getEvents()).hasSize(1);
        assertThat(user.getEvents().get(0)).isInstanceOf(UserProfessionVerifiedEvent.class);
    }

    @Test
    @DisplayName("Should throw exception when verifying without profession")
    void shouldThrowExceptionWhenVerifyingWithoutProfession() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // When & Then
        assertThatThrownBy(() -> user.verifyProfession())
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Meslek seçilmeden doğrulama yapılamaz");
    }

    // =====================================================
    // User Status Tests (BR-011)
    // =====================================================

    @Test
    @DisplayName("Should suspend user and publish event")
    void shouldSuspendUserAndPublishEvent() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.clearEvents();

        String reason = "Spam content";
        LocalDateTime until = LocalDateTime.now().plusDays(7);

        // When
        user.suspend(reason, until);

        // Then
        assertThat(user.getStatus()).isEqualTo(UserStatus.SUSPENDED);
        assertThat(user.getBanReason()).isEqualTo(reason);
        assertThat(user.getBannedUntil()).isEqualTo(until);

        assertThat(user.getEvents()).hasSize(1);
        assertThat(user.getEvents().get(0)).isInstanceOf(UserStatusChangedEvent.class);
    }

    @Test
    @DisplayName("Should ban user permanently")
    void shouldBanUserPermanently() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.clearEvents();

        String reason = "Repeated violations";

        // When
        user.ban(reason);

        // Then
        assertThat(user.getStatus()).isEqualTo(UserStatus.BANNED);
        assertThat(user.getBanReason()).isEqualTo(reason);
        assertThat(user.getBannedUntil()).isNull();
        assertThat(user.isBanned()).isTrue();
    }

    @Test
    @DisplayName("Should activate suspended user")
    void shouldActivateSuspendedUser() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.suspend("Test", LocalDateTime.now().plusDays(1));
        user.clearEvents();

        // When
        user.activate();

        // Then
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(user.getBanReason()).isNull();
        assertThat(user.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should soft delete user")
    void shouldSoftDeleteUser() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.clearEvents();

        // When
        user.delete();

        // Then
        assertThat(user.getStatus()).isEqualTo(UserStatus.DELETED);
        assertThat(user.isActive()).isFalse();
    }

    // =====================================================
    // Password Reset Tests
    // =====================================================

    @Test
    @DisplayName("Should reset password")
    void shouldResetPassword() {
        // Given
        User user = User.createFromRegistration("test@example.com", "oldpass", "Test", "User");
        String newHashedPassword = "$2a$10$newhashedpassword";

        // When
        user.resetPassword(newHashedPassword);

        // Then
        assertThat(user.getPasswordHash()).isEqualTo(newHashedPassword);
    }

    // =====================================================
    // Email Verification Tests
    // =====================================================

    @Test
    @DisplayName("Should verify email")
    void shouldVerifyEmail() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // When
        user.verifyEmail();

        // Then
        assertThat(user.getIsEmailVerified()).isTrue();
        assertThat(user.getEmailVerifiedAt()).isNotNull();
    }

    // =====================================================
    // Activity Tracking Tests
    // =====================================================

    @Test
    @DisplayName("Should record login")
    void shouldRecordLogin() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // When
        user.recordLogin();

        // Then
        assertThat(user.getLastLoginAt()).isNotNull();
        assertThat(user.getLastActiveAt()).isNotNull();
    }

    @Test
    @DisplayName("Should record activity")
    void shouldRecordActivity() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // When
        user.recordActivity();

        // Then
        assertThat(user.getLastActiveAt()).isNotNull();
    }

    // =====================================================
    // Profile Completeness Tests
    // =====================================================

    @Test
    @DisplayName("Should calculate profile completeness correctly")
    void shouldCalculateProfileCompleteness() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // Initially incomplete
        assertThat(user.getIsProfileComplete()).isFalse();

        // Add profession
        user.selectProfession(testProfession);
        assertThat(user.getIsProfileComplete()).isFalse();

        // Add bio
        user.updateProfile("Test", "User", "Bio", LocalDate.now());
        assertThat(user.getIsProfileComplete()).isFalse();

        // Add avatar
        user.updateAvatar("https://example.com/avatar.jpg");
        assertThat(user.getIsProfileComplete()).isFalse();

        // Verify email
        user.verifyEmail();

        // Now complete
        assertThat(user.getIsProfileComplete()).isTrue();
    }

    // =====================================================
    // Active User Check Tests
    // =====================================================

    @Test
    @DisplayName("Should return true for active user")
    void shouldReturnTrueForActiveUser() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");

        // Then
        assertThat(user.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should return false for banned user")
    void shouldReturnFalseForBannedUser() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        user.ban("Violation");

        // Then
        assertThat(user.isActive()).isFalse();
        assertThat(user.isBanned()).isTrue();
    }

    @Test
    @DisplayName("Should auto-activate when suspension period ends")
    void shouldAutoActivateWhenSuspensionEnds() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        LocalDateTime pastDate = LocalDateTime.now().minusHours(1);
        user.suspend("Test", pastDate);

        // When
        boolean isActive = user.isActive();

        // Then
        assertThat(isActive).isTrue();
        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should remain suspended when suspension period not ended")
    void shouldRemainSuspendedWhenPeriodNotEnded() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Test", "User");
        LocalDateTime futureDate = LocalDateTime.now().plusDays(1);
        user.suspend("Test", futureDate);

        // When
        boolean isActive = user.isActive();

        // Then
        assertThat(isActive).isFalse();
        assertThat(user.isSuspended()).isTrue();
    }

    // =====================================================
    // Full Name Tests
    // =====================================================

    @Test
    @DisplayName("Should return full name correctly")
    void shouldReturnFullNameCorrectly() {
        // Given
        User user = User.createFromRegistration("test@example.com", "pass", "Ahmet", "Yılmaz");

        // When
        String fullName = user.getFullName();

        // Then
        assertThat(fullName).isEqualTo("Ahmet Yılmaz");
    }
}
