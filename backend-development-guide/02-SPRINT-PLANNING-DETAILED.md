# 📅 Backend Sprint Detay Planlaması

**Versiyon:** 1.0  
**Tarih:** 30 Kasım 2025  
**Toplam Süre:** 24 hafta (12 sprint)

---

## 📋 İçindekiler

1. [Sprint Genel Bakış](#sprint-genel-bakış)
2. [Sprint 1-2: Temel Altyapı](#sprint-1-2-temel-altyapı)
3. [Sprint 3-4: Verification Context](#sprint-3-4-verification-context)
4. [Sprint 5-6: Social Context](#sprint-5-6-social-context)
5. [Sprint 7-8: Messaging Context](#sprint-7-8-messaging-context)
6. [Sprint 9: Notification Context](#sprint-9-notification-context)
7. [Sprint 10-11: Testing & Optimization](#sprint-10-11-testing--optimization)
8. [Sprint 12: Deployment](#sprint-12-deployment)

---

## 🎯 Sprint Genel Bakış

### Toplam Özet

| Sprint    | Hafta | Story Points | Focus Area            | Deliverable                         |
| --------- | ----- | ------------ | --------------------- | ----------------------------------- |
| Sprint 1  | 1-2   | 40           | Infrastructure        | Project setup, Auth, Database       |
| Sprint 2  | 3-4   | 42           | Identity Context      | User management, OAuth              |
| Sprint 3  | 5-6   | 45           | Verification (Part 1) | Domain model, Submission            |
| Sprint 4  | 7-8   | 48           | Verification (Part 2) | AI integration, Decision logic      |
| Sprint 5  | 9-10  | 43           | Social (Part 1)       | Post, Feed                          |
| Sprint 6  | 11-12 | 40           | Social (Part 2)       | Comment, Like, Follow               |
| Sprint 7  | 13-14 | 50           | Messaging (Part 1)    | Conversation, Group chat, WebSocket |
| Sprint 8  | 15-16 | 45           | Messaging (Part 2)    | Private chat, Read receipts         |
| Sprint 9  | 17-18 | 38           | Notification Context  | Push, Email, In-app                 |
| Sprint 10 | 19-20 | 35           | Testing               | Unit, Integration, E2E              |
| Sprint 11 | 21-22 | 30           | Optimization          | Performance, Security               |
| Sprint 12 | 23-24 | 25           | Deployment            | Production, Monitoring              |

---

## 🔧 Sprint 1-2: Temel Altyapı

### Sprint 1 (Hafta 1-2)

**Hedef:** Backend projesinin temel altyapısını kurmak

#### Story 1.1: Project Setup (8 SP)

**Task Detayları:**

```
□ Spring Boot 3.2 projesi oluştur (Maven)
□ application.yml yapılandırması
  - Dev/Prod profile'ları
  - Database connection
  - Logging configuration
□ pom.xml dependencies
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - PostgreSQL driver
  - Lombok
  - MapStruct
□ Git repository setup
  - .gitignore
  - README.md
  - Branch strategy (main, develop)
□ IDE configuration (IntelliJ IDEA)
```

**Acceptance Criteria:**

- [x] Spring Boot application başarıyla ayağa kalkıyor
- [x] Application context load oluyor
- [x] Health check endpoint çalışıyor (`/actuator/health`)

---

#### Story 1.2: Database Setup (8 SP)

**Task Detayları:**

```
□ PostgreSQL 15 kurulumu (Docker)
□ Database oluşturma (meslektas_dev)
□ Flyway migration setup
  - V1__initial_schema.sql
  - users table
  - professions table
□ JPA configuration
  - Hibernate dialect
  - DDL auto: validate
  - Show SQL: true (dev)
□ Connection pooling (HikariCP)
  - min: 5, max: 20
```

**Migration Script (V1\_\_initial_schema.sql):**

```sql
CREATE TABLE professions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    requires_verification BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    profession_id BIGINT REFERENCES professions(id),
    is_profession_verified BOOLEAN DEFAULT FALSE,
    is_profile_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profession ON users(profession_id);
CREATE INDEX idx_users_status ON users(status);
```

**Acceptance Criteria:**

- [x] Database migration başarıyla çalışıyor
- [x] JPA entities database'e map oluyor
- [x] Connection pool aktif

---

#### Story 1.3: JWT Authentication (12 SP)

**Task Detayları:**

```
□ Common package yapısı
  □ BaseEntity.java
  □ ApiResponse.java
  □ ErrorResponse.java

□ Identity package yapısı
  □ entity/User.java
  □ entity/Profession.java
  □ repository/UserRepository.java
  □ repository/ProfessionRepository.java

□ Security configuration
  □ SecurityConfig.java
  □ JwtAuthenticationFilter.java
  □ JwtTokenProvider.java
  □ UserDetailsServiceImpl.java

□ JWT service
  □ Token generation
  □ Token validation
  □ Expiration handling (1 hour)
  □ Refresh token (7 days)

□ Auth endpoints
  □ POST /api/auth/register
  □ POST /api/auth/login
  □ POST /api/auth/refresh
  □ POST /api/auth/logout
```

**Code Structure:**

```java
// SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// JwtTokenProvider.java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration; // 3600000 (1 hour)

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", ((UserDetailsImpl) userDetails).getId());

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}

// AuthService.java
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate tokens
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = UUID.randomUUID().toString();

        // Save refresh token
        saveRefreshToken(userDetails.getId(), refreshToken);

        return new LoginResponse(
            accessToken,
            refreshToken,
            "Bearer",
            3600
        );
    }

    public void register(RegisterRequest request) {
        // Validate
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException();
        }

        // Create user
        User user = User.builder()
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .name(request.name())
            .surname(request.surname())
            .status(UserStatus.ACTIVE)
            .build();

        userRepository.save(user);
    }
}
```

**Acceptance Criteria:**

- [x] Register endpoint kullanıcı oluşturuyor
- [x] Login endpoint JWT token dönüyor
- [x] Protected endpoint'ler JWT ile erişilebiliyor
- [x] Invalid token 401 dönüyor

---

#### Story 1.4: API Documentation (6 SP)

**Task Detayları:**

```
□ SpringDoc OpenAPI dependency
□ OpenApiConfig.java
  - API info
  - Security scheme (Bearer)
  - Contact info
□ Controller annotations
  - @Tag
  - @Operation
  - @ApiResponse
□ DTO validation annotations
  - @Schema
  - @NotNull, @Email, etc.
```

**Code:**

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Meslektaş API")
                .version("1.0")
                .description("Professional Social Network API")
                .contact(new Contact()
                    .name("Meslektaş Team")
                    .email("dev@meslektas.com")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList("Bearer"))
            .components(new Components()
                .addSecuritySchemes("Bearer", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                )
            );
    }
}
```

**Acceptance Criteria:**

- [x] Swagger UI erişilebilir (`/swagger-ui/index.html`)
- [x] Tüm endpoint'ler dökümante edilmiş
- [x] Try-it-out çalışıyor

---

#### Story 1.5: Error Handling & Logging (6 SP)

**Task Detayları:**

```
□ Global exception handler
  - @RestControllerAdvice
  - ResourceNotFoundException
  - ValidationException
  - UnauthorizedException
□ Logging configuration
  - Logback XML
  - Console appender (dev)
  - File appender (prod)
  - JSON format
□ Request/Response logging
  - MDC (Mapped Diagnostic Context)
  - Correlation ID
```

**Code:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        ValidationException ex
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "An unexpected error occurred",
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

**Acceptance Criteria:**

- [x] Exception'lar tutarlı format ile dönüyor
- [x] Loglama çalışıyor
- [x] Correlation ID ekleniyor

---

### Sprint 1 Deliverables

✅ Çalışan Spring Boot backend  
✅ PostgreSQL database ve migration  
✅ JWT authentication  
✅ API documentation (Swagger)  
✅ Error handling & logging

**Sprint Review Demosu:**

- Health check endpoint
- Register/Login flow
- Swagger UI gösterimi
- Log output

---

## 🔐 Sprint 2 (Hafta 3-4)

**Hedef:** Identity context'i tamamlamak

### Story 2.1: User Management (10 SP)

**Task Detayları:**

```
□ User profile endpoints
  □ GET /api/users/me
  □ PUT /api/users/me
  □ GET /api/users/{id}
  □ POST /api/users/avatar (file upload)

□ UserService implementation
  □ Get current user
  □ Update profile
  □ Upload avatar

□ DTO mapping (MapStruct)
  □ UserMapper interface
  □ User → UserResponse
  □ UpdateUserRequest → User

□ Validation
  □ Name/Surname length (2-100)
  □ Bio max length (500)
  □ Avatar file type/size
```

**Code:**

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getCurrentUser(
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse response = userService.getCurrentUser(userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserResponse> updateProfile(
        @RequestBody @Valid UpdateUserRequest request,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse response = userService.updateProfile(
            userDetails.getId(),
            request
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload avatar")
    public ResponseEntity<UserResponse> uploadAvatar(
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        UserResponse response = userService.uploadAvatar(
            userDetails.getId(),
            file
        );
        return ResponseEntity.ok(response);
    }
}
```

---

### Story 2.2: OAuth Integration (12 SP)

**Task Detayları:**

```
□ OAuth2 client configuration
  □ Google OAuth
  □ Instagram OAuth (Meta API)

□ OAuth2SuccessHandler
  □ Extract user info
  □ Create or update user
  □ Generate JWT

□ OAuth endpoints
  □ GET /api/auth/oauth2/google
  □ GET /api/auth/oauth2/instagram
  □ GET /api/auth/oauth2/callback

□ Frontend redirect handling
```

**Code:**

```java
@Configuration
@EnableWebSecurity
public class OAuth2Config extends SecurityConfig {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);

        http.oauth2Login(oauth2 -> oauth2
            .authorizationEndpoint(authorization -> authorization
                .baseUri("/api/auth/oauth2/authorize")
            )
            .redirectionEndpoint(redirection -> redirection
                .baseUri("/api/auth/oauth2/callback/*")
            )
            .successHandler(oAuth2SuccessHandler())
        );
    }

    @Bean
    public OAuth2SuccessHandler oAuth2SuccessHandler() {
        return new OAuth2SuccessHandler(jwtTokenProvider, userRepository);
    }
}

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
    extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Extract user info
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("given_name");
        String surname = oAuth2User.getAttribute("family_name");
        String avatarUrl = oAuth2User.getAttribute("picture");

        // Find or create user
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> createUserFromOAuth(email, name, surname, avatarUrl));

        // Generate JWT
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String token = jwtTokenProvider.generateToken(userDetails);

        // Redirect to frontend with token
        String redirectUrl = String.format(
            "meslektas://auth/callback?token=%s",
            token
        );

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
```

---

### Story 2.3: Profession Management (10 SP)

**Task Detayları:**

```
□ Profession seeding (Flyway)
  - 20+ meslek kategorisi
  - Kategori mapping
  - Verification flag

□ Profession endpoints
  □ GET /api/professions (list all)
  □ GET /api/professions/{id}
  □ GET /api/professions/search?q=...

□ User profession selection
  □ PUT /api/users/me/profession
```

**Migration (V2\_\_seed_professions.sql):**

```sql
INSERT INTO professions (name, category, requires_verification, description) VALUES
('Doktor', 'MEDICAL', TRUE, 'Tıp fakültesi mezunu, doktor unvanına sahip'),
('Hemşire', 'MEDICAL', TRUE, 'Hemşirelik bölümü mezunu'),
('Avukat', 'LEGAL', TRUE, 'Hukuk fakültesi mezunu, baro kaydı olan'),
('Yazılım Geliştirici', 'ENGINEERING', FALSE, 'Yazılım mühendisi veya benzer'),
('Öğretmen', 'EDUCATION', TRUE, 'Öğretmen sertifikası olan'),
('Garson', 'SERVICE', FALSE, 'Restoran/cafe çalışanı'),
('Barista', 'SERVICE', FALSE, 'Kahve hazırlama uzmanı'),
('Mühendis', 'ENGINEERING', TRUE, 'Mühendislik diploması olan');
```

---

### Story 2.4: File Upload Service (10 SP)

**Task Detayları:**

```
□ Storage service interface
□ S3 implementation (AWS SDK)
  - Bucket configuration
  - Upload method
  - Delete method
  - Generate presigned URL

□ Local storage implementation (Dev)
  - File system storage
  - Public access via /uploads

□ Image processing
  - Resize (max 1024x1024)
  - Compress
  - Format conversion (WebP)
```

**Code:**

```java
public interface StorageService {
    String upload(MultipartFile file, String folder);
    void delete(String fileUrl);
    String getPublicUrl(String key);
}

@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Override
    public String upload(MultipartFile file, String folder) {
        String key = generateKey(folder, file.getOriginalFilename());

        PutObjectRequest putRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(file.getContentType())
            .build();

        s3Client.putObject(putRequest,
            RequestBody.fromBytes(file.getBytes()));

        return getPublicUrl(key);
    }

    @Override
    public String getPublicUrl(String key) {
        return String.format(
            "https://%s.s3.amazonaws.com/%s",
            bucketName,
            key
        );
    }

    private String generateKey(String folder, String filename) {
        String extension = FilenameUtils.getExtension(filename);
        String uuid = UUID.randomUUID().toString();
        return String.format("%s/%s.%s", folder, uuid, extension);
    }
}
```

---

### Sprint 2 Deliverables

✅ User profile management  
✅ OAuth2 integration (Google + Instagram)  
✅ Profession management  
✅ File upload service (S3)

---

## ✅ Sprint 3-4: Verification Context

_(Devam edecek - 8000 token limiti doldu)_

---

**Hazırlayan:** Backend Team  
**Tarih:** 30 Kasım 2025  
**Durum:** In Progress
