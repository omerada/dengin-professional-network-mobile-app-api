package com.meslektas.identity.domain.model;

import com.meslektas.common.domain.AggregateRoot;
import com.meslektas.common.exception.BusinessException;
import com.meslektas.identity.domain.event.UserProfessionVerifiedEvent;
import com.meslektas.identity.domain.event.UserRegisteredEvent;
import com.meslektas.identity.domain.event.UserStatusChangedEvent;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User Aggregate Root (Identity Context)
 * 
 * Central aggregate for user identity and authentication.
 * Encapsulates all business rules related to user management.
 * 
 * DDD Pattern: Aggregate Root
 * 
 * Business Rules Enforced:
 * - BR-003: Profession-based access control
 * - BR-004: Verification constraints
 * - BR-011: User status management
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends AggregateRoot {

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "surname", nullable = false, length = 100)
    private String surname;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Setter
    @Column(name = "gender", length = 20)
    private String gender;

    // Profession
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profession_id")
    private Profession profession;

    @Column(name = "is_profession_verified", nullable = false)
    @Builder.Default
    private Boolean isProfessionVerified = false;

    @Column(name = "profession_verified_at")
    private LocalDateTime professionVerifiedAt;

    // Profile Status
    @Column(name = "is_profile_complete", nullable = false)
    @Builder.Default
    private Boolean isProfileComplete = false;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private Boolean isEmailVerified = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    // OAuth
    @Enumerated(EnumType.STRING)
    @Column(name = "oauth_provider", length = 50)
    private OAuthProvider oauthProvider;

    @Column(name = "oauth_provider_id")
    private String oauthProviderId;

    // Activity
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "ban_reason", columnDefinition = "TEXT")
    private String banReason;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;

    @Column(name = "banned_at")
    private LocalDateTime bannedAt;

    // =====================================================
    // Domain Behavior (Business Logic)
    // =====================================================

    /**
     * Factory Method: Create a new user from registration
     */
    public static User createFromRegistration(
            String email,
            String passwordHash,
            String name,
            String surname
    ) {
        User user = User.builder()
                .email(email)
                .passwordHash(passwordHash)
                .name(name)
                .surname(surname)
                .status(UserStatus.ACTIVE)
                .isProfessionVerified(false)
                .isEmailVerified(false)
                .isProfileComplete(false)
                .oauthProvider(OAuthProvider.LOCAL)
                .build();

        user.registerEvent(new UserRegisteredEvent(user.getId(), email));
        return user;
    }

    /**
     * Factory Method: Create from OAuth
     */
    public static User createFromOAuth(
            String email,
            String name,
            String surname,
            String avatarUrl,
            OAuthProvider provider,
            String providerId
    ) {
        User user = User.builder()
                .email(email)
                .name(name)
                .surname(surname)
                .avatarUrl(avatarUrl)
                .status(UserStatus.ACTIVE)
                .isEmailVerified(true)  // OAuth emails are pre-verified
                .emailVerifiedAt(LocalDateTime.now())
                .oauthProvider(provider)
                .oauthProviderId(providerId)
                .isProfessionVerified(false)
                .isProfileComplete(false)
                .build();

        user.registerEvent(new UserRegisteredEvent(user.getId(), email));
        return user;
    }

    /**
     * Update profile information
     */
    public void updateProfile(String name, String surname, String bio, LocalDate dateOfBirth) {
        java.util.List<String> updatedFields = new java.util.ArrayList<>();
        
        if (!this.name.equals(name)) {
            this.name = name;
            updatedFields.add("name");
        }
        if (!this.surname.equals(surname)) {
            this.surname = surname;
            updatedFields.add("surname");
        }
        if ((this.bio == null && bio != null) || (this.bio != null && !this.bio.equals(bio))) {
            this.bio = bio;
            updatedFields.add("bio");
        }
        if ((this.dateOfBirth == null && dateOfBirth != null) || 
            (this.dateOfBirth != null && !this.dateOfBirth.equals(dateOfBirth))) {
            this.dateOfBirth = dateOfBirth;
            updatedFields.add("dateOfBirth");
        }
        
        checkProfileCompleteness();
        
        if (!updatedFields.isEmpty()) {
            registerEvent(new com.meslektas.identity.domain.event.ProfileUpdatedEvent(
                this.getId(),
                String.join(",", updatedFields)
            ));
        }
    }

    /**
     * Update avatar URL
     */
    public void updateAvatar(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        checkProfileCompleteness();
        
        registerEvent(new com.meslektas.identity.domain.event.ProfileUpdatedEvent(
            this.getId(),
            "avatarUrl"
        ));
    }

    /**
     * Select profession (BR-003: Profession-based access)
     * 
     * Business Rule: Verified profession cannot be changed
     */
    public void selectProfession(Profession profession) {
        if (Boolean.TRUE.equals(this.isProfessionVerified) && this.profession != null) {
            if (!this.profession.isGeneralCategory()) {
                throw new BusinessException(
                        "Doğrulanmış meslek değiştirilemez",
                        "PROFESSION_CHANGE_NOT_ALLOWED"
                );
            }
        }

        this.profession = profession;
        this.isProfessionVerified = false;
        this.professionVerifiedAt = null;
        
        checkProfileCompleteness();
    }

    /**
     * Mark profession as verified (called from Verification Context)
     * 
     * Business Rule (BR-004): Only through AI verification
     */
    public void verifyProfession() {
        if (this.profession == null) {
            throw new BusinessException(
                    "Meslek seçilmeden doğrulama yapılamaz",
                    "NO_PROFESSION_SELECTED"
            );
        }

        this.isProfessionVerified = true;
        this.professionVerifiedAt = LocalDateTime.now();
        
        checkProfileCompleteness();
        
        registerEvent(new UserProfessionVerifiedEvent(
                this.getId(),
                this.profession.getId(),
                this.profession.getName()
        ));
    }

    /**
     * Verify email
     */
    public void verifyEmail() {
        this.isEmailVerified = true;
        this.emailVerifiedAt = LocalDateTime.now();
        checkProfileCompleteness();
    }

    /**
     * Check and update profile completeness
     */
    private void checkProfileCompleteness() {
        this.isProfileComplete = this.isEmailVerified
                && this.profession != null
                && this.bio != null && !this.bio.isBlank()
                && this.avatarUrl != null;
    }

    /**
     * Update last login timestamp
     */
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
        this.lastActiveAt = LocalDateTime.now();
    }

    /**
     * Update last activity timestamp
     */
    public void recordActivity() {
        this.lastActiveAt = LocalDateTime.now();
    }

    /**
     * Suspend user (temporary ban)
     * 
     * Business Rule (BR-011): Moderation actions
     */
    public void suspend(String reason, LocalDateTime until) {
        UserStatus oldStatus = this.status;
        this.status = UserStatus.SUSPENDED;
        this.banReason = reason;
        this.bannedUntil = until;
        this.bannedAt = LocalDateTime.now();
        
        registerEvent(new UserStatusChangedEvent(
                this.getId(),
                oldStatus,
                UserStatus.SUSPENDED,
                reason
        ));
    }

    /**
     * Ban user permanently
     */
    public void ban(String reason) {
        UserStatus oldStatus = this.status;
        this.status = UserStatus.BANNED;
        this.banReason = reason;
        this.bannedAt = LocalDateTime.now();
        this.bannedUntil = null;
        
        registerEvent(new UserStatusChangedEvent(
                this.getId(),
                oldStatus,
                UserStatus.BANNED,
                reason
        ));
    }

    /**
     * Activate user (lift ban/suspension)
     */
    public void activate() {
        UserStatus oldStatus = this.status;
        this.status = UserStatus.ACTIVE;
        this.banReason = null;
        this.bannedUntil = null;
        
        registerEvent(new UserStatusChangedEvent(
                this.getId(),
                oldStatus,
                UserStatus.ACTIVE,
                "User activated"
        ));
    }

    /**
     * Soft delete user
     */
    public void delete() {
        UserStatus oldStatus = this.status;
        this.status = UserStatus.DELETED;
        
        registerEvent(new UserStatusChangedEvent(
                this.getId(),
                oldStatus,
                UserStatus.DELETED,
                "User deleted"
        ));
    }
    
    /**
     * Reset password (for password reset flow)
     * 
     * Business Rule: Used by password reset service
     * PasswordChangedEvent will be published by service layer
     * 
     * @param newHashedPassword Hashed password from PasswordEncoder
     */
    public void resetPassword(String newHashedPassword) {
        this.passwordHash = newHashedPassword;
        // Note: PasswordChangedEvent published by service layer
    }

    // =====================================================
    // Query Methods (Domain Logic)
    // =====================================================

    /**
     * Check if user is active and can access the platform
     */
    public boolean isActive() {
        if (this.status == UserStatus.SUSPENDED && this.bannedUntil != null) {
            // Check if suspension period has ended
            if (LocalDateTime.now().isAfter(this.bannedUntil)) {
                activate();
                return true;
            }
        }
        return this.status == UserStatus.ACTIVE;
    }

    /**
     * Check if user is banned
     */
    public boolean isBanned() {
        return this.status == UserStatus.BANNED;
    }

    /**
     * Check if user is suspended
     */
    public boolean isSuspended() {
        return this.status == UserStatus.SUSPENDED;
    }

    /**
     * Check if user is deleted
     */
    public boolean isDeleted() {
        return this.status == UserStatus.DELETED;
    }

    /**
     * Get full name
     */
    public String getFullName() {
        return this.name + " " + this.surname;
    }

    /**
     * Check if profession requires verification
     */
    public boolean needsProfessionVerification() {
        return this.profession != null
                && this.profession.needsVerification()
                && !Boolean.TRUE.equals(this.isProfessionVerified);
    }

    /**
     * Check if user is using OAuth
     */
    public boolean isOAuthUser() {
        return this.oauthProvider != null && this.oauthProvider != OAuthProvider.LOCAL;
    }

    /**
     * Get profession name (safe)
     */
    public String getProfessionName() {
        return this.profession != null ? this.profession.getName() : "Belirtilmemiş";
    }

    /**
     * Check if user can change profession
     */
    public boolean canChangeProfession() {
        if (this.profession == null) {
            return true;
        }
        if (Boolean.TRUE.equals(this.isProfessionVerified)) {
            return this.profession.isGeneralCategory();
        }
        return true;
    }
}
