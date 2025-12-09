# Identity Context - User Management & Authentication

## Overview

Kullanıcı yönetimi, kimlik doğrulama ve yetkilendirme işlemlerini yöneten bounded context.

---

## Domain Model

### User (Aggregate Root)

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;  // BCrypt
    private String name;
    private String surname;

    @Enumerated(EnumType.STRING)
    private Profession profession;

    private Boolean verified = false;      // Email verified
    private Boolean profileVerified = false;  // Profession verified

    private String avatarUrl;  // S3/CloudFront URL

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### Profession (Enum)

```java
public enum Profession {
    // Healthcare
    DOCTOR("Doktor"),
    NURSE("Hemşire"),
    PHARMACIST("Eczacı"),
    DENTIST("Diş Hekimi"),
    VETERINARIAN("Veteriner"),

    // Engineering
    SOFTWARE_ENGINEER("Yazılım Mühendisi"),
    MECHANICAL_ENGINEER("Makine Mühendisi"),
    ELECTRICAL_ENGINEER("Elektrik Mühendisi"),
    CIVIL_ENGINEER("İnşaat Mühendisi"),

    // Education
    TEACHER("Öğretmen"),
    ACADEMICIAN("Akademisyen"),

    // Legal
    LAWYER("Avukat"),
    NOTARY("Noter"),

    // Other
    ARCHITECT("Mimar"),
    ACCOUNTANT("Muhasebeci"),
    PSYCHOLOGIST("Psikolog");

    private final String displayName;
}
```

---

## Key Operations

### Authentication

#### Register

```java
POST /api/auth/register
Content-Type: application/json

{
  "email": "ahmet@example.com",
  "password": "SecurePass123",
  "name": "Ahmet",
  "surname": "Yılmaz",
  "profession": "DOCTOR"
}

// Response
{
  "success": true,
  "message": "Registration successful. Check email for verification.",
  "data": {
    "id": 1,
    "email": "ahmet@example.com",
    "name": "Ahmet",
    "verified": false
  }
}
```

**Validation Rules:**

- Email: valid format, unique
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Profession: must be valid enum value

#### Login

```java
POST /api/auth/login

{
  "email": "ahmet@example.com",
  "password": "SecurePass123"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "email": "ahmet@example.com",
      "verified": true,
      "profileVerified": false
    }
  }
}
```

#### OAuth2 (Google)

```java
POST /api/auth/oauth2/google

{
  "idToken": "google_id_token_here"
}

// Auto-creates user if not exists
// Returns same format as login
```

#### OAuth2 (Apple)

```java
POST /api/auth/oauth2/apple

{
  "identityToken": "apple_identity_token",
  "authorizationCode": "apple_auth_code",
  "user": {
    "name": "Ahmet Yılmaz",
    "email": "ahmet@privaterelay.appleid.com"
  }
}
```

---

### Profile Management

#### Get Current User

```java
GET /api/users/me
Authorization: Bearer {token}

// Response
{
  "id": 1,
  "email": "ahmet@example.com",
  "name": "Ahmet",
  "surname": "Yılmaz",
  "profession": "DOCTOR",
  "avatarUrl": "https://cdn.meslektas.com/users/1/avatar.jpg",
  "verified": true,
  "profileVerified": true,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

#### Update Profile

```java
PUT /api/users/me

{
  "name": "Ahmet Mehmet",
  "surname": "Yılmaz",
  "profession": "DOCTOR"
}
```

**Note:** Email cannot be changed after registration.

---

### Avatar Upload (S3 Presigned URL)

#### Step 1: Get Presigned URL

```java
POST /api/users/me/avatar/presigned-url

{
  "contentType": "image/jpeg"  // or image/png, image/webp
}

// Response
{
  "success": true,
  "data": {
    "url": "https://meslektas-prod.s3.eu-central-1.amazonaws.com/users/1/avatar-uuid.jpg?X-Amz-...",
    "key": "users/1/avatar-uuid.jpg",
    "expiresIn": 300,  // 5 minutes
    "contentType": "image/jpeg",
    "maxFileSize": 5242880  // 5MB
  }
}
```

**Constraints:**

- Max file size: 5MB
- Allowed types: jpeg, png, webp
- URL expires in 5 minutes

#### Step 2: Upload to S3 (Client-Side)

```javascript
// Mobile app uploads directly to S3
await fetch(presignedUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "image/jpeg",
  },
  body: imageFile,
});
```

#### Step 3: Confirm Upload

```java
PUT /api/users/me/avatar/confirm

{
  "key": "users/1/avatar-uuid.jpg"
}

// Response
{
  "success": true,
  "data": {
    "avatarUrl": "https://d1234.cloudfront.net/users/1/avatar-uuid.jpg"
  }
}
```

**Security:**

- Backend validates key belongs to authenticated user
- Old avatar is deleted from S3
- CloudFront cache is invalidated

---

## Business Rules

### Registration

1. Email must be unique in system
2. Password must meet complexity requirements
3. Profession must be selected
4. Email verification required to use app features

### Email Verification

1. Token sent to email on registration
2. Token expires after 24 hours
3. Max 3 verification emails per hour

### Profile Verification (Profession)

1. Separate from email verification
2. Requires document submission to Verification Context
3. Only verified profiles can:
   - Create posts
   - Send messages
   - Comment on posts

### Avatar

1. Max 5MB file size
2. Only image formats: jpeg, png, webp
3. Stored in S3, delivered via CloudFront CDN
4. Old avatar deleted when new one uploaded

---

## Repository Methods

```java
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.profession = :profession AND u.verified = true")
    List<User> findVerifiedUsersByProfession(@Param("profession") Profession profession);

    @Query("SELECT u FROM User u WHERE u.profileVerified = true")
    Page<User> findVerifiedProfiles(Pageable pageable);
}
```

---

## Service Layer

### AuthService

```java
@Service
@Transactional
public class AuthService {

    public AuthResponse register(RegisterRequest request);

    public AuthResponse login(LoginRequest request);

    public AuthResponse refreshToken(String refreshToken);

    public void verifyEmail(String token);

    public AuthResponse googleLogin(String idToken);

    public AuthResponse appleLogin(AppleLoginRequest request);
}
```

### UserService

```java
@Service
@Transactional
public class UserService {

    public UserResponse getCurrentUser(Long userId);

    public UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    public PresignedUrlResponse generateAvatarUploadUrl(Long userId, String contentType);

    public AvatarResponse confirmAvatarUpload(Long userId, String s3Key);

    public void deleteAvatar(Long userId);
}
```

---

## Security

### JWT Token

**Structure:**

```json
{
  "sub": "1", // User ID
  "email": "ahmet@example.com",
  "profession": "DOCTOR",
  "verified": true,
  "profileVerified": false,
  "iat": 1704441600,
  "exp": 1704528000
}
```

**Expiration:**

- Access Token: 24 hours
- Refresh Token: 30 days

### Password Hashing

```java
// BCrypt with strength 12
PasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode(rawPassword);
```

### Role-Based Access

```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyMethod() { ... }

@PreAuthorize("@userSecurity.canEditPost(#postId, authentication.principal.id)")
public void editPost(Long postId) { ... }
```

---

## Integration Points

### → Verification Context

- User submits verification request
- Verification approved → `user.profileVerified = true`

### → Social Context

- User creates post (requires `profileVerified = true`)
- User's profession determines feed visibility

### → Messaging Context

- User starts conversation (same profession only)
- User info displayed in chat

### → Notification Context

- User preferences for notifications
- Push token registration

---

## Common Errors

```java
EMAIL_ALREADY_EXISTS (409)
→ Email is already registered

INVALID_CREDENTIALS (401)
→ Wrong email or password

USER_NOT_VERIFIED (403)
→ Email not verified, check inbox

TOKEN_EXPIRED (401)
→ JWT expired, use refresh token

INVALID_FILE_TYPE (400)
→ Only jpeg/png/webp allowed

FILE_TOO_LARGE (400)
→ Max 5MB

INVALID_S3_KEY (403)
→ S3 key doesn't belong to this user
```

---

## Testing

### Unit Test Example

```java
@SpringBootTest
@Transactional
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldUpdateProfile() {
        // Given
        User user = createTestUser();
        userRepository.save(user);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Updated Name");

        // When
        UserResponse response = userService.updateProfile(user.getId(), request);

        // Then
        assertThat(response.getName()).isEqualTo("Updated Name");
    }
}
```

---

## Performance Considerations

1. **Email Uniqueness Check**: Use database unique constraint + index
2. **Password Hashing**: BCrypt is intentionally slow (security vs. performance)
3. **Avatar Upload**: Direct S3 upload avoids backend bottleneck
4. **JWT Validation**: Stateless, no DB lookup needed
5. **Caching**: User profile cached in Redis (TTL: 5 minutes)

---

**Last Updated:** 2025-12-09
