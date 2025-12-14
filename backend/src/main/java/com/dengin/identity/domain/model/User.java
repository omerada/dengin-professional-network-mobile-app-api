package com.dengin.identity.domain.model;

import com.dengin.identity.domain.event.*;
import com.dengin.common.domain.AggregateRoot;
import com.dengin.common.exception.BusinessException;
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

    // Profession (DEPRECATED - kept for backward compatibility)
    // Use sector instead for new features
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profession_id")
    private Profession profession;

    @Column(name = "is_profession_verified", nullable = false)
    @Builder.Default
    private Boolean isProfessionVerified = false;

    @Column(name = "profession_verified_at")
    private LocalDateTime professionVerifiedAt;

    // Sector (NEW - Sprint 1: Sector-based community)
    /**
     * User's primary sector
     * Determines which sector feed and community user belongs to
     * Required for posting and accessing sector-based features
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sector_id")
    private Sector sector;

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
            String surname) {
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
            String providerId) {
        User user = User.builder()
                .email(email)
                .name(name)
                .surname(surname)
                .avatarUrl(avatarUrl)
                .status(UserStatus.ACTIVE)
                .isEmailVerified(true) // OAuth emails are pre-verified
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
            registerEvent(new ProfileUpdatedEvent(
                    this.getId(),
                    String.join(",", updatedFields)));
        }
    }

    /**
     * Update avatar URL
     */
    public void updateAvatar(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        checkProfileCompleteness();

        registerEvent(new ProfileUpdatedEvent(
                this.getId(),
                "avatarUrl"));
    }

    /**
     * Select profession (BR-003: Profession-based access)
     * 
     * DEPRECATED: Use selectSector() instead
     * Kept for backward compatibility during migration
     * 
     * Business Rule: Verified profession cannot be changed
     */
    /**
     * Select profession with sector
     * 
     * @param profession the profession to select
     * @param sector the sector (must be from DB, not transient)
     */
    public void selectProfession(Profession profession, Sector sector) {
        if (Boolean.TRUE.equals(this.isProfessionVerified) && this.profession != null) {
            if (!this.profession.isGeneralCategory()) {
                throw new BusinessException(
                        "Doğrulanmış meslek değiştirilemez",
                        "PROFESSION_CHANGE_NOT_ALLOWED");
            }
        }

        this.profession = profession;
        this.isProfessionVerified = false;
        this.professionVerifiedAt = null;

        // Set sector if provided
        if (sector != null) {
            this.sector = sector;
        }

        checkProfileCompleteness();
    }

    /**
     * Select profession without changing sector (backward compatibility)
     * 
     * @deprecated Use selectProfession(Profession, Sector) instead
     */
    @Deprecated(since = "Sprint 1", forRemoval = false)
    public void selectProfession(Profession profession) {
        if (Boolean.TRUE.equals(this.isProfessionVerified) && this.profession != null) {
            if (!this.profession.isGeneralCategory()) {
                throw new BusinessException(
                        "Doğrulanmış meslek değiştirilemez",
                        "PROFESSION_CHANGE_NOT_ALLOWED");
            }
        }

        this.profession = profession;
        this.isProfessionVerified = false;
        this.professionVerifiedAt = null;

        checkProfileCompleteness();
    }

    /**
     * Select sector (NEW - Sprint 1)
     * 
     * Users select a primary sector during onboarding
     * Sector determines which community feed and channels user can access
     * 
     * Business Rules:
     * - Sector cannot be null
     * - Once selected, can be changed only if no profession verified
     * - Auto-clears old profession if sector changes
     * 
     * @param sector the sector to select
     */
    public void selectSector(Sector sector) {
        if (sector == null) {
            throw new BusinessException(
                    "Sektör seçimi zorunludur",
                    "SECTOR_REQUIRED");
        }

        // Check if user has verified profession in different sector
        if (this.sector != null && !this.sector.equals(sector)) {
            if (Boolean.TRUE.equals(this.isProfessionVerified)) {
                throw new BusinessException(
                        "Doğrulanmış mesleğiniz olduğu için sektör değiştiremezsiniz",
                        "SECTOR_CHANGE_NOT_ALLOWED_VERIFIED");
            }
            // Clear old profession when changing sectors
            this.profession = null;
            this.isProfessionVerified = false;
            this.professionVerifiedAt = null;
        }

        this.sector = sector;
        checkProfileCompleteness();

        registerEvent(new SectorSelectedEvent(
                this.getId(),
                sector.getId(),
                sector.getCode()));
    }

    /**
     * Get user's sector (with fallback to profession category)
     * 
     * During migration period, if sector is null, derive from profession
     * 
     * @return user's sector, or null if neither sector nor profession is set
     */
    public Sector getSector() {
        if (sector != null) {
            return sector;
        }

        // Fallback for migration period
        if (profession != null) {
            return Sector.fromProfessionCategory(profession.getCategory());
        }

        return null;
    }

    /**
     * Get sector code safely
     * 
     * @return sector code or null
     */
    public String getSectorCode() {
        Sector userSector = getSector();
        return userSector != null ? userSector.getCode() : null;
    }

    /**
     * Check if user belongs to a specific sector
     * 
     * @param sectorCode sector code to check
     * @return true if user's sector matches
     */
    public boolean isInSector(String sectorCode) {
        Sector userSector = getSector();
        return userSector != null && userSector.getCode().equals(sectorCode);
    }

    /**
     * Check if user can post
     * User must have a sector selected to post
     * 
     * @return true if user can post
     */
    public boolean canPost() {
        return getSector() != null && isActive();
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
                    "NO_PROFESSION_SELECTED");
        }

        this.isProfessionVerified = true;
        this.professionVerifiedAt = LocalDateTime.now();

        checkProfileCompleteness();

        registerEvent(new UserProfessionVerifiedEvent(
                this.getId(),
                this.profession.getId(),
                this.profession.getName()));
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
                reason));
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
                reason));
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
                "User activated"));
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
                "User deleted"));
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

    /**
     * Update password (for authenticated password change)
     * 
     * Business Rule: Used by authenticated users changing their own password
     * Different from resetPassword as it's a user-initiated action vs system reset
     * 
     * @param newHashedPassword Hashed password from PasswordEncoder
     */
    public void updatePassword(String newHashedPassword) {
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
     * Link OAuth provider to existing account
     * 
     * Used when a user with email/password account
     * signs in with OAuth for the first time.
     */
    public void linkOAuthProvider(OAuthProvider provider, String providerId) {
        if (this.oauthProvider != null && this.oauthProvider != OAuthProvider.LOCAL) {
            throw new BusinessException(
                    "Bu hesap zaten " + this.oauthProvider.getDisplayName() + " ile bağlantılı",
                    "OAUTH_ALREADY_LINKED");
        }

        this.oauthProvider = provider;
        this.oauthProviderId = providerId;

        // OAuth emails are considered verified
        if (!Boolean.TRUE.equals(this.isEmailVerified)) {
            this.isEmailVerified = true;
            this.emailVerifiedAt = LocalDateTime.now();
        }
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

    /**
     * Check if user is verified (profession verified)
     */
    public boolean isVerified() {
        return Boolean.TRUE.equals(this.isProfessionVerified);
    }

    /**
     * Get profile image URL (alias for avatarUrl)
     */
    public String getProfileImageUrl() {
        return this.avatarUrl;
    }
}
