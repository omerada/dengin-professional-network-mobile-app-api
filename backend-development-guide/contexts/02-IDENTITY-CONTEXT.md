# Identity Context - User Management & Authentication

> **Bounded Context:** Identity & Access  
> **Complexity:** ⭐⭐ Medium  
> **Core Domain:** ❌ No (Supporting Domain)

---

## 📚 İçindekiler

1. [Context Overview](#context-overview)
2. [Domain Model](#domain-model)
3. [Aggregates](#aggregates)
4. [Domain Services](#domain-services)
5. [Domain Events](#domain-events)
6. [Business Rules](#business-rules)
7. [Integration Points](#integration-points)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Context Overview

### Responsibility

Kullanıcı kimlik yönetimi, authentication, authorization, profil yönetimi, meslek seçimi ve kullanıcı blocking.

### Ubiquitous Language

```
User: Sistemdeki kullanıcı (Aggregate Root)
Email: Benzersiz email adresi (Value Object)
Password: Hashlenmiş şifre (Value Object)
FullName: Ad ve soyad (Value Object)
Profession: Kullanıcının meslek bilgisi (Value Object)
UserStatus: ACTIVE, SUSPENDED, BANNED, DELETED
AuthenticationToken: JWT access/refresh token
UserBlock: Kullanıcı engelleme
OAuth2Provider: Google, Apple gibi sosyal login
```

### Context Boundaries

```
IN SCOPE:
✅ User registration (email/password)
✅ Social login (Google, Apple OAuth)
✅ Authentication (JWT)
✅ Password management (reset, change)
✅ Profile management
✅ Profession selection
✅ User blocking
✅ Account status (active, suspended, banned)
✅ Session management

OUT OF SCOPE:
❌ Profession verification (Verification Context)
❌ Notification preferences (Notification Context)
❌ Content creation (Social Context)
```

---

## 🏗️ Domain Model

### Aggregate: User

```java
/**
 * User Aggregate Root
 *
 * Business Rules:
 * - Email must be unique
 * - Password must meet security requirements
 * - Profession can be changed ONLY if not verified
 * - User can block other users (mutual blocking)
 * - Suspended/Banned users cannot login
 * - Deleted users cannot be recovered
 */
@Entity
@Table(name = "users")
public class User extends AggregateRoot {

    @EmbeddedId
    private UserId id;

    @Embedded
    private Email email;

    @Embedded
    private Password password;

    @Embedded
    private FullName fullName;

    @Embedded
    private Profession profession;

    @Column(name = "is_profession_verified")
    private boolean isProfessionVerified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Embedded
    private PhoneNumber phoneNumber;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "location")
    private String location;

    @Column(name = "website_url")
    private String websiteUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "oauth_provider")
    private OAuth2Provider oauthProvider;

    @Column(name = "oauth_provider_id")
    private String oauthProviderId;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ElementCollection
    @CollectionTable(
        name = "user_blocks",
        joinColumns = @JoinColumn(name = "blocker_id")
    )
    @Column(name = "blocked_user_id")
    private Set<UserId> blockedUsers = new HashSet<>();

    // ============================================
    // FACTORY METHODS
    // ============================================

    /**
     * Create new user with email/password
     */
    public static User register(
        Email email,
        Password rawPassword,
        FullName fullName,
        Profession profession
    ) {
        User user = new User();
        user.id = UserId.generate();
        user.email = email;
        user.password = Password.hash(rawPassword.value());
        user.fullName = fullName;
        user.profession = profession;
        user.status = UserStatus.ACTIVE;
        user.isProfessionVerified = false;
        user.createdAt = Instant.now();
        user.updatedAt = Instant.now();
        user.failedLoginAttempts = 0;

        user.registerEvent(new UserRegisteredEvent(
            user.id,
            user.email,
            user.fullName,
            user.profession
        ));

        return user;
    }

    /**
     * Create user via OAuth (Google, Apple)
     */
    public static User registerViaOAuth(
        Email email,
        FullName fullName,
        OAuth2Provider provider,
        String providerId,
        Profession profession
    ) {
        User user = new User();
        user.id = UserId.generate();
        user.email = email;
        user.password = null; // No password for OAuth users
        user.fullName = fullName;
        user.profession = profession;
        user.oauthProvider = provider;
        user.oauthProviderId = providerId;
        user.status = UserStatus.ACTIVE;
        user.isProfessionVerified = false;
        user.createdAt = Instant.now();
        user.updatedAt = Instant.now();

        user.registerEvent(new UserRegisteredViaOAuthEvent(
            user.id,
            user.email,
            provider
        ));

        return user;
    }

    // ============================================
    // DOMAIN BEHAVIOR
    // ============================================

    /**
     * Authenticate user (verify password)
     * Business rule: Max 5 failed attempts → lock account
     */
    public void authenticate(Password rawPassword) {
        // Check account lock
        if (isAccountLocked()) {
            throw new AccountLockedException(
                "Account locked until " + lockedUntil
            );
        }

        // Check account status
        if (status != UserStatus.ACTIVE) {
            throw new AccountNotActiveException(
                "Account is " + status
            );
        }

        // Verify password
        if (!password.matches(rawPassword.value())) {
            handleFailedLogin();
            throw new InvalidCredentialsException(
                "Invalid email or password"
            );
        }

        // Success
        handleSuccessfulLogin();
    }

    private void handleFailedLogin() {
        this.failedLoginAttempts++;

        if (failedLoginAttempts >= 5) {
            // Lock account for 15 minutes
            this.lockedUntil = Instant.now().plus(Duration.ofMinutes(15));

            registerEvent(new AccountLockedEvent(
                this.id,
                this.email,
                this.failedLoginAttempts,
                this.lockedUntil
            ));
        }
    }

    private void handleSuccessfulLogin() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
        this.lastLoginAt = Instant.now();

        registerEvent(new UserLoggedInEvent(
            this.id,
            this.email,
            this.lastLoginAt
        ));
    }

    private boolean isAccountLocked() {
        return lockedUntil != null && Instant.now().isBefore(lockedUntil);
    }

    /**
     * Change profession
     * Business rule: Only if NOT verified
     */
    public void changeProfession(Profession newProfession) {
        if (isProfessionVerified && !profession.isGeneralCategory()) {
            throw new ProfessionChangeNotAllowedException(
                "Verified profession cannot be changed"
            );
        }

        Profession oldProfession = this.profession;
        this.profession = newProfession;
        this.updatedAt = Instant.now();

        registerEvent(new ProfessionChangedEvent(
            this.id,
            oldProfession,
            newProfession
        ));
    }

    /**
     * Mark profession as verified
     * Called by Verification Context
     */
    public void verifyProfession() {
        if (this.isProfessionVerified) {
            return; // Already verified
        }

        this.isProfessionVerified = true;
        this.updatedAt = Instant.now();

        registerEvent(new ProfessionVerifiedEvent(
            this.id,
            this.profession
        ));
    }

    /**
     * Update profile
     */
    public void updateProfile(
        FullName fullName,
        String bio,
        String location,
        String websiteUrl,
        String profileImageUrl
    ) {
        // Validation
        if (bio != null && bio.length() > 500) {
            throw new BioTooLongException("Bio max 500 characters");
        }

        this.fullName = fullName;
        this.bio = bio;
        this.location = location;
        this.websiteUrl = websiteUrl;
        this.profileImageUrl = profileImageUrl;
        this.updatedAt = Instant.now();

        registerEvent(new ProfileUpdatedEvent(this.id));
    }

    /**
     * Change password
     */
    public void changePassword(Password currentPassword, Password newPassword) {
        if (!password.matches(currentPassword.value())) {
            throw new InvalidCredentialsException("Current password incorrect");
        }

        this.password = Password.hash(newPassword.value());
        this.updatedAt = Instant.now();

        registerEvent(new PasswordChangedEvent(this.id, this.email));
    }

    /**
     * Block another user
     * Business rule: Mutual blocking (both users blocked from each other)
     */
    public void blockUser(UserId userToBlock) {
        if (this.id.equals(userToBlock)) {
            throw new CannotBlockSelfException("Cannot block yourself");
        }

        boolean added = blockedUsers.add(userToBlock);
        if (added) {
            this.updatedAt = Instant.now();

            registerEvent(new UserBlockedEvent(
                this.id,
                userToBlock
            ));
        }
    }

    /**
     * Unblock user
     */
    public void unblockUser(UserId userToUnblock) {
        boolean removed = blockedUsers.remove(userToUnblock);
        if (removed) {
            this.updatedAt = Instant.now();

            registerEvent(new UserUnblockedEvent(
                this.id,
                userToUnblock
            ));
        }
    }

    /**
     * Check if user has blocked another user
     */
    public boolean hasBlocked(UserId userId) {
        return blockedUsers.contains(userId);
    }

    /**
     * Suspend account (admin action)
     * Business rule: Suspended users cannot login
     */
    public void suspend(AdminId adminId, String reason, Duration duration) {
        if (this.status == UserStatus.BANNED) {
            throw new IllegalStateException("Cannot suspend banned user");
        }

        this.status = UserStatus.SUSPENDED;
        this.updatedAt = Instant.now();

        registerEvent(new UserSuspendedEvent(
            this.id,
            adminId,
            reason,
            duration
        ));
    }

    /**
     * Ban account (admin action)
     * Business rule: Banned users cannot login, permanent
     */
    public void ban(AdminId adminId, String reason) {
        this.status = UserStatus.BANNED;
        this.updatedAt = Instant.now();

        registerEvent(new UserBannedEvent(
            this.id,
            adminId,
            reason
        ));
    }

    /**
     * Reactivate account
     */
    public void reactivate(AdminId adminId) {
        if (this.status == UserStatus.ACTIVE) {
            return; // Already active
        }

        this.status = UserStatus.ACTIVE;
        this.updatedAt = Instant.now();

        registerEvent(new UserReactivatedEvent(
            this.id,
            adminId
        ));
    }

    /**
     * Soft delete account
     * Business rule: Keep data for 30 days, then hard delete
     */
    public void delete() {
        this.status = UserStatus.DELETED;
        this.updatedAt = Instant.now();

        registerEvent(new UserDeletedEvent(
            this.id,
            this.email,
            Instant.now().plus(Duration.ofDays(30)) // Hard delete after 30 days
        ));
    }

    /**
     * Check if user is active
     */
    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    /**
     * Check if user is banned
     */
    public boolean isBanned() {
        return status == UserStatus.BANNED;
    }

    /**
     * Check if user can perform actions
     */
    public boolean canPerformActions() {
        return status == UserStatus.ACTIVE && !isAccountLocked();
    }
}
```

### Value Objects

```java
/**
 * Email Value Object
 * Immutable, self-validating
 */
public record Email(String value) {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@(.+)$"
    );

    public Email {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailException("Email cannot be empty");
        }

        // Normalize: lowercase
        value = value.toLowerCase().trim();

        if (value.length() > 255) {
            throw new InvalidEmailException("Email too long (max 255 chars)");
        }

        if (!EMAIL_PATTERN.matcher(value).matches()) {
            throw new InvalidEmailException("Invalid email format");
        }
    }

    public String domain() {
        return value.substring(value.indexOf('@') + 1);
    }
}

/**
 * Password Value Object
 * Handles hashing and validation
 */
public record Password(String value) {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    private static final Pattern UPPERCASE = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL = Pattern.compile(".*[!@#$%^&*].*");

    /**
     * Validate raw password (before hashing)
     */
    public static Password validate(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new InvalidPasswordException("Password cannot be empty");
        }

        if (rawPassword.length() < MIN_LENGTH) {
            throw new InvalidPasswordException(
                "Password must be at least " + MIN_LENGTH + " characters"
            );
        }

        if (rawPassword.length() > MAX_LENGTH) {
            throw new InvalidPasswordException(
                "Password too long (max " + MAX_LENGTH + " chars)"
            );
        }

        if (!UPPERCASE.matcher(rawPassword).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one uppercase letter"
            );
        }

        if (!LOWERCASE.matcher(rawPassword).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one lowercase letter"
            );
        }

        if (!DIGIT.matcher(rawPassword).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one digit"
            );
        }

        if (!SPECIAL.matcher(rawPassword).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one special character (!@#$%^&*)"
            );
        }

        // Check common passwords
        if (isCommonPassword(rawPassword)) {
            throw new InvalidPasswordException(
                "Password too common, please choose a stronger one"
            );
        }

        return new Password(rawPassword);
    }

    /**
     * Hash password using BCrypt
     */
    public static Password hash(String rawPassword) {
        Password validated = validate(rawPassword);
        String hashed = BCrypt.hashpw(validated.value, BCrypt.gensalt(12));
        return new Password(hashed);
    }

    /**
     * Check if password matches hash
     */
    public boolean matches(String rawPassword) {
        return BCrypt.checkpw(rawPassword, this.value);
    }

    private static boolean isCommonPassword(String password) {
        List<String> commonPasswords = List.of(
            "password", "password123", "12345678", "qwerty123",
            "abc12345", "password1", "welcome123"
        );
        return commonPasswords.contains(password.toLowerCase());
    }
}

/**
 * Full Name Value Object
 */
public record FullName(String firstName, String lastName) {

    private static final Pattern NAME_PATTERN = Pattern.compile(
        "^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$"
    );

    public FullName {
        if (firstName == null || firstName.isBlank()) {
            throw new InvalidNameException("First name cannot be empty");
        }

        if (lastName == null || lastName.isBlank()) {
            throw new InvalidNameException("Last name cannot be empty");
        }

        // Normalize: trim and capitalize
        firstName = capitalizeFirstLetter(firstName.trim());
        lastName = capitalizeFirstLetter(lastName.trim());

        if (firstName.length() < 2 || firstName.length() > 50) {
            throw new InvalidNameException("First name must be 2-50 characters");
        }

        if (lastName.length() < 2 || lastName.length() > 50) {
            throw new InvalidNameException("Last name must be 2-50 characters");
        }

        if (!NAME_PATTERN.matcher(firstName).matches()) {
            throw new InvalidNameException("First name contains invalid characters");
        }

        if (!NAME_PATTERN.matcher(lastName).matches()) {
            throw new InvalidNameException("Last name contains invalid characters");
        }
    }

    public String fullName() {
        return firstName + " " + lastName;
    }

    private static String capitalizeFirstLetter(String str) {
        if (str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}

/**
 * Profession Value Object
 */
public record Profession(String name, ProfessionCategory category, boolean requiresVerification) {

    public boolean isGeneralCategory() {
        return category == ProfessionCategory.GENERAL;
    }

    public boolean needsVerification() {
        return requiresVerification;
    }
}

/**
 * Phone Number Value Object
 */
public record PhoneNumber(String value) {

    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^\\+?[1-9]\\d{10,14}$"
    );

    public PhoneNumber {
        if (value == null || value.isBlank()) {
            throw new InvalidPhoneNumberException("Phone number cannot be empty");
        }

        // Normalize: remove spaces, dashes
        value = value.replaceAll("[\\s-]", "");

        if (!PHONE_PATTERN.matcher(value).matches()) {
            throw new InvalidPhoneNumberException("Invalid phone number format");
        }
    }
}
```

---

## 🛠️ Domain Services

### AuthenticationService

```java
/**
 * Domain Service: Authentication Logic
 */
@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JWTTokenProvider tokenProvider;

    /**
     * Authenticate user and generate tokens
     */
    public AuthenticationResult authenticate(Email email, Password rawPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new InvalidCredentialsException(
                "Invalid email or password"
            ));

        // Authenticate (throws exception on failure)
        user.authenticate(rawPassword);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthenticationResult(
            accessToken,
            refreshToken,
            tokenProvider.getAccessTokenExpiry(),
            user.getId()
        );
    }

    /**
     * Refresh access token
     */
    public AuthenticationResult refreshToken(String refreshToken) {
        UserId userId = tokenProvider.validateRefreshToken(refreshToken);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        if (!user.canPerformActions()) {
            throw new AccountNotActiveException("User account is not active");
        }

        String newAccessToken = tokenProvider.generateAccessToken(userId);
        String newRefreshToken = tokenProvider.generateRefreshToken(userId);

        return new AuthenticationResult(
            newAccessToken,
            newRefreshToken,
            tokenProvider.getAccessTokenExpiry(),
            userId
        );
    }
}
```

### UserBlockingPolicy

```java
/**
 * Domain Service: User Blocking Logic
 */
public class UserBlockingPolicy {

    /**
     * Check if user A can view user B's content
     */
    public static boolean canView(User viewer, User contentOwner) {
        // Mutual blocking check
        if (viewer.hasBlocked(contentOwner.getId())) {
            return false;
        }

        if (contentOwner.hasBlocked(viewer.getId())) {
            return false;
        }

        return true;
    }

    /**
     * Check if user A can interact with user B
     */
    public static boolean canInteract(User userA, User userB) {
        if (!canView(userA, userB)) {
            return false;
        }

        // Both must be active
        if (!userA.isActive() || !userB.isActive()) {
            return false;
        }

        return true;
    }
}
```

---

## 📨 Domain Events

```java
public record UserRegisteredEvent(
    UserId userId,
    Email email,
    FullName fullName,
    Profession profession,
    Instant registeredAt
) implements DomainEvent {}

public record UserLoggedInEvent(
    UserId userId,
    Email email,
    Instant loginAt
) implements DomainEvent {}

public record ProfessionChangedEvent(
    UserId userId,
    Profession oldProfession,
    Profession newProfession,
    Instant changedAt
) implements DomainEvent {}

public record ProfessionVerifiedEvent(
    UserId userId,
    Profession profession,
    Instant verifiedAt
) implements DomainEvent {}

public record UserBlockedEvent(
    UserId blockerId,
    UserId blockedUserId,
    Instant blockedAt
) implements DomainEvent {}

public record UserSuspendedEvent(
    UserId userId,
    AdminId adminId,
    String reason,
    Duration duration,
    Instant suspendedAt
) implements DomainEvent {}

public record UserBannedEvent(
    UserId userId,
    AdminId adminId,
    String reason,
    Instant bannedAt
) implements DomainEvent {}

public record PasswordChangedEvent(
    UserId userId,
    Email email,
    Instant changedAt
) implements DomainEvent {}
```

---

## 📋 Business Rules

### BR-ID-001: Email Uniqueness

```
Rule: Email must be unique across all users
Enforcement: Database unique constraint + Application validation
Exception: EmailAlreadyExistsException
```

### BR-ID-002: Password Security

```
Rule: Password must meet security requirements (8+ chars, uppercase, lowercase, digit, special)
Enforcement: Password.validate()
Exception: InvalidPasswordException
```

### BR-ID-003: Failed Login Attempts

```
Rule: 5 failed attempts → 15 minute lock
Enforcement: User.handleFailedLogin()
Exception: AccountLockedException
```

### BR-ID-004: Profession Change Restriction

```
Rule: Verified profession cannot be changed (except by admin)
Enforcement: User.changeProfession()
Exception: ProfessionChangeNotAllowedException
```

### BR-ID-005: Self-Blocking Prevention

```
Rule: User cannot block themselves
Enforcement: User.blockUser()
Exception: CannotBlockSelfException
```

### BR-ID-006: OAuth User No Password

```
Rule: OAuth users have no password (null)
Enforcement: User.registerViaOAuth()
```

### BR-ID-007: Account Deletion

```
Rule: Deleted accounts kept for 30 days, then hard delete
Enforcement: User.delete() + Scheduled job
```

---

## 🔗 Integration Points

### Downstream Consumers

```java
// Verification Context (Customer)
// Needs: User info for verification request
// Updates: User.isProfessionVerified after approval

// Social Context (Customer)
// Needs: User info for posts, comments
// Uses: User blocking rules

// Messaging Context (Customer)
// Needs: User info for chat
// Uses: User blocking rules

// Notification Context (Customer)
// Needs: User preferences
// Sends: Registration, login, password change notifications
```

---

## 🛠️ Implementation Guide

### Package Structure

```
identity/
├── domain/
│   ├── model/
│   │   ├── User.java (Aggregate Root)
│   │   ├── UserId.java (Value Object)
│   │   ├── Email.java (Value Object)
│   │   ├── Password.java (Value Object)
│   │   ├── FullName.java (Value Object)
│   │   ├── Profession.java (Value Object)
│   │   ├── PhoneNumber.java (Value Object)
│   │   └── UserStatus.java (Enum)
│   ├── service/
│   │   ├── AuthenticationService.java
│   │   └── UserBlockingPolicy.java
│   ├── repository/
│   │   └── UserRepository.java (Interface)
│   └── event/
│       ├── UserRegisteredEvent.java
│       ├── UserLoggedInEvent.java
│       ├── ProfessionChangedEvent.java
│       └── ... (other events)
│
├── application/
│   ├── command/
│   │   ├── RegisterUserCommand.java
│   │   ├── LoginCommand.java
│   │   ├── ChangeProfessionCommand.java
│   │   └── BlockUserCommand.java
│   ├── query/
│   │   ├── GetUserProfileQuery.java
│   │   └── SearchUsersQuery.java
│   ├── service/
│   │   └── UserApplicationService.java
│   └── dto/
│       ├── UserDTO.java
│       └── AuthenticationResponseDTO.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── UserJpaRepository.java
│   │   └── UserRepositoryImpl.java
│   ├── security/
│   │   ├── JWTTokenProvider.java
│   │   ├── SecurityConfig.java
│   │   └── OAuth2Config.java
│   └── event/
│       └── UserEventListener.java
│
└── api/
    ├── AuthController.java
    └── UserController.java
```

---

**Complexity:** ⭐⭐ Medium  
**Lines of Code (estimated):** 1200-1500  
**Implementation Time:** Sprint 1-2 (2-3 weeks)

**Next:** [04-SOCIAL-CONTEXT.md](./04-SOCIAL-CONTEXT.md)
