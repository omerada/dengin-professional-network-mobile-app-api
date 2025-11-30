# Code Standards & Best Practices

**Version:** 1.0
**Last Updated:** 2024-01-15
**Target:** Spring Boot 3.2.x, Java 17+

---

## 1. Overview

Bu doküman Meslektaş projesinde kullanılacak kod standartlarını, best practice'leri ve kalite metriklerini tanımlar. Tüm geliştiriciler bu standartlara uymalıdır.

---

## 2. Java Coding Conventions

### 2.1 Naming Conventions

**Classes:**

- PascalCase kullanın
- İsim (noun) olmalı
- Anlamlı ve açıklayıcı olmalı
- Kısaltmalardan kaçının

```java
// ✅ DOĞRU
public class UserRegistrationService {}
public class PostCreatedEvent {}
public class EmailVerificationToken {}

// ❌ YANLIŞ
public class UsrRegSvc {}  // Kısaltma
public class RegisterUser {}  // Verb kullanımı
public class Data {}  // Belirsiz isim
```

**Interfaces:**

- PascalCase kullanın
- Adjective veya Noun olabilir
- "I" prefix kullanmayın

```java
// ✅ DOĞRU
public interface Repository {}
public interface Serializable {}
public interface EventPublisher {}

// ❌ YANLIŞ
public interface IRepository {}  // "I" prefix
public interface repository {}  // Küçük harf
```

**Methods:**

- camelCase kullanın
- Verb ile başlamalı
- Anlamlı ve açıklayıcı olmalı

```java
// ✅ DOĞRU
public void registerUser() {}
public User findById(UserId id) {}
public boolean isVerified() {}
public List<Post> getAllPosts() {}

// ❌ YANLIŞ
public void user() {}  // Verb yok
public User get(UserId id) {}  // Belirsiz
public boolean verified() {}  // "is" yok
```

**Variables:**

- camelCase kullanın
- Noun olmalı
- Kısaltmalardan kaçının
- Boolean için "is", "has", "can" prefix

```java
// ✅ DOĞRU
private String username;
private int totalCount;
private boolean isActive;
private boolean hasVerification;
private List<Post> recentPosts;

// ❌ YANLIŞ
private String un;  // Kısaltma
private int cnt;  // Belirsiz
private boolean active;  // "is" yok
private List<Post> list;  // Generic isim
```

**Constants:**

- UPPER_SNAKE_CASE kullanın
- static final olmalı
- Anlamlı isim

```java
// ✅ DOĞRU
public static final int MAX_LOGIN_ATTEMPTS = 3;
public static final String DEFAULT_LOCALE = "tr-TR";
private static final Duration TOKEN_EXPIRY = Duration.ofMinutes(15);

// ❌ YANLIŞ
public static final int max = 3;  // Küçük harf
private static final String locale = "tr-TR";  // Küçük harf
```

**Packages:**

- lowercase kullanın
- Reverse domain notation
- Anlamlı ve kısa

```java
// ✅ DOĞRU
com.meslektas.domain.identity
com.meslektas.application.user
com.meslektas.infrastructure.persistence

// ❌ YANLIŞ
com.meslektas.Domain  // Büyük harf
com.meslektas.d  // Kısaltma
```

---

### 2.2 Code Formatting

**Indentation:**

- 4 spaces (TAB değil)
- IntelliJ IDEA default settings

**Line Length:**

- Maximum 120 characters
- Uzun satırları böl

```java
// ✅ DOĞRU
public User registerUser(
    String email,
    String password,
    String fullName,
    Profession profession
) {
    // method body
}

// ❌ YANLIŞ
public User registerUser(String email, String password, String fullName, Profession profession) {
    // Çok uzun satır
}
```

**Braces:**

- Opening brace aynı satırda
- Closing brace yeni satırda
- Tek satır bile olsa brace kullan

```java
// ✅ DOĞRU
if (user.isVerified()) {
    sendWelcomeEmail(user);
}

// ❌ YANLIŞ
if (user.isVerified())
    sendWelcomeEmail(user);  // Brace yok
```

**Whitespace:**

- Operatörler etrafında boşluk
- Comma'dan sonra boşluk
- Parantezler içinde boşluk yok

```java
// ✅ DOĞRU
int total = price * quantity;
List<String> names = List.of("John", "Jane", "Bob");

// ❌ YANLIŞ
int total=price*quantity;
List<String> names=List.of("John","Jane","Bob");
```

**Import Statements:**

- Alfabetik sıralama
- Wildcard (\*) kullanma
- Grup ayırımı: java._, javax._, org._, com._

```java
// ✅ DOĞRU
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.meslektas.domain.user.User;

// ❌ YANLIŞ
import java.util.*;  // Wildcard
import com.meslektas.domain.user.User;
import java.time.LocalDateTime;  // Sıra yanlış
```

---

### 2.3 Class Structure

**Sıralama:**

```java
public class UserService {

    // 1. Static constants
    private static final int MAX_ATTEMPTS = 3;

    // 2. Instance constants
    private final UserRepository userRepository;

    // 3. Static variables
    private static AtomicInteger userCount = new AtomicInteger(0);

    // 4. Instance variables
    private String serviceName;

    // 5. Constructor
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 6. Public methods
    public User registerUser(RegisterUserCommand command) {
        // ...
    }

    // 7. Private methods
    private void validateEmail(String email) {
        // ...
    }

    // 8. Inner classes
    private static class ValidationResult {
        // ...
    }
}
```

**Method Length:**

- Maximum 50 satır
- Daha uzunsa küçük metodlara böl
- Tek sorumluluk prensibi

---

### 2.4 Comments & Documentation

**JavaDoc:**

- Tüm public class, interface, method için zorunlu
- Ne yaptığını açıkla, nasıl yaptığını değil
- @param, @return, @throws kullan

```java
/**
 * Registers a new user in the system.
 *
 * <p>This method validates the email uniqueness, hashes the password,
 * and creates a verification token for email confirmation.
 *
 * @param command the registration command containing user details
 * @return the newly created user with PENDING status
 * @throws DuplicateEmailException if email already exists
 * @throws InvalidPasswordException if password doesn't meet requirements
 */
public User registerUser(RegisterUserCommand command) {
    // implementation
}
```

**Inline Comments:**

- Sadece karmaşık logic için
- "Ne" değil "Neden" açıkla
- Gereksiz yorum yazma

```java
// ✅ DOĞRU - Neden açıklıyor
// We use BCrypt with strength 10 for OWASP compliance
String hashedPassword = passwordEncoder.encode(password);

// Cache for 5 minutes to reduce database load during peak hours
@Cacheable(value = "users", ttl = 300)
public User findById(UserId id) {
    // ...
}

// ❌ YANLIŞ - Gereksiz yorum
// Get user by id
public User findById(UserId id) {
    // ...
}

// Increment counter
counter++;
```

**TODO Comments:**

- TODO: format kullan
- Ticket numarası ekle
- Sorumluluk belirt

```java
// TODO(JIRA-123): Implement rate limiting for registration endpoint
// TODO: Add email verification timeout (Due: Sprint 3, Assigned: John)
```

---

## 3. Package Structure

### 3.1 Multi-Module Structure

```
backend/
├── pom.xml (parent)
├── domain/
│   ├── pom.xml
│   └── src/main/java/com/meslektas/domain/
│       ├── identity/
│       │   ├── User.java
│       │   ├── UserId.java
│       │   ├── Email.java
│       │   ├── Password.java
│       │   ├── UserRepository.java
│       │   └── events/
│       │       └── UserRegisteredEvent.java
│       ├── verification/
│       ├── social/
│       ├── messaging/
│       ├── notification/
│       └── moderation/
│
├── application/
│   ├── pom.xml
│   └── src/main/java/com/meslektas/application/
│       ├── user/
│       │   ├── commands/
│       │   │   ├── RegisterUserCommand.java
│       │   │   └── RegisterUserCommandHandler.java
│       │   ├── queries/
│       │   │   ├── GetUserQuery.java
│       │   │   └── GetUserQueryHandler.java
│       │   └── dto/
│       │       └── UserDto.java
│       ├── verification/
│       ├── social/
│       └── messaging/
│
├── infrastructure/
│   ├── pom.xml
│   └── src/main/java/com/meslektas/infrastructure/
│       ├── persistence/
│       │   ├── jpa/
│       │   │   ├── entities/
│       │   │   │   └── UserEntity.java
│       │   │   └── repositories/
│       │   │       └── JpaUserRepository.java
│       │   └── UserRepositoryImpl.java
│       ├── messaging/
│       │   └── RabbitMqEventPublisher.java
│       ├── security/
│       │   └── JwtTokenProvider.java
│       └── external/
│           └── aws/
│               ├── S3StorageService.java
│               └── RekognitionVerificationService.java
│
└── api/
    ├── pom.xml
    └── src/main/java/com/meslektas/api/
        ├── MeslektasApplication.java
        ├── rest/
        │   ├── user/
        │   │   ├── UserController.java
        │   │   └── dto/
        │   │       ├── RegisterUserRequest.java
        │   │       └── UserResponse.java
        │   ├── verification/
        │   └── social/
        ├── config/
        │   ├── SecurityConfig.java
        │   ├── DatabaseConfig.java
        │   └── RedisConfig.java
        └── exception/
            └── GlobalExceptionHandler.java
```

---

### 3.2 Package Naming Rules

**Domain Package:**

- Bounded context bazlı
- Aggregate per package
- Domain model, repository interface, events

**Application Package:**

- Use case bazlı
- Commands, Queries, DTOs
- Handler'lar ayrı klasörde

**Infrastructure Package:**

- Teknik concern bazlı
- persistence, messaging, security, external
- Implementation detayları

**API Package:**

- Rest controller'lar
- Request/Response DTOs
- Configuration
- Exception handling

---

## 4. Code Quality Rules

### 4.1 SOLID Principles

**Single Responsibility Principle (SRP):**

```java
// ✅ DOĞRU - Her class tek sorumluluk
public class UserRegistrationService {
    public User register(RegisterUserCommand command) {
        // Sadece kayıt işlemi
    }
}

public class EmailService {
    public void sendVerificationEmail(User user, String token) {
        // Sadece email gönderme
    }
}

// ❌ YANLIŞ - Çok sorumluluk
public class UserService {
    public User register(RegisterUserCommand command) {
        // Kayıt
        // Email gönderme
        // SMS gönderme
        // Notification
    }
}
```

**Open/Closed Principle (OCP):**

```java
// ✅ DOĞRU - Extension için açık, modification için kapalı
public interface NotificationSender {
    void send(Notification notification);
}

public class EmailNotificationSender implements NotificationSender {
    @Override
    public void send(Notification notification) {
        // Email implementation
    }
}

public class PushNotificationSender implements NotificationSender {
    @Override
    public void send(Notification notification) {
        // Push implementation
    }
}

// ❌ YANLIŞ - Her yeni tip için modify gerekir
public class NotificationService {
    public void send(Notification notification) {
        if (notification.getType() == NotificationType.EMAIL) {
            // Email logic
        } else if (notification.getType() == NotificationType.PUSH) {
            // Push logic
        }
        // Her yeni tip için yeni if block
    }
}
```

**Liskov Substitution Principle (LSP):**

```java
// ✅ DOĞRU - Subclass parent yerine kullanılabilir
public abstract class User {
    public abstract boolean canPost();
}

public class VerifiedUser extends User {
    @Override
    public boolean canPost() {
        return true;  // Verified user can post
    }
}

public class UnverifiedUser extends User {
    @Override
    public boolean canPost() {
        return false;  // Unverified user cannot post
    }
}

// ❌ YANLIŞ - Subclass parent contract'ı bozuyor
public abstract class Bird {
    public abstract void fly();
}

public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly");
    }
}
```

**Interface Segregation Principle (ISP):**

```java
// ✅ DOĞRU - Küçük, spesifik interface'ler
public interface Readable {
    String read();
}

public interface Writable {
    void write(String content);
}

public class TextFile implements Readable, Writable {
    // Both operations
}

public class ReadOnlyFile implements Readable {
    // Only read operation
}

// ❌ YANLIŞ - Fat interface
public interface File {
    String read();
    void write(String content);
    void delete();
    void compress();
}

public class ReadOnlyFile implements File {
    @Override
    public void write(String content) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void delete() {
        throw new UnsupportedOperationException();
    }

    @Override
    public void compress() {
        throw new UnsupportedOperationException();
    }
}
```

**Dependency Inversion Principle (DIP):**

```java
// ✅ DOĞRU - Abstraction'a bağımlı
public class UserService {
    private final UserRepository userRepository;  // Interface
    private final EmailService emailService;      // Interface

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}

// ❌ YANLIŞ - Concrete class'a bağımlı
public class UserService {
    private final JpaUserRepository userRepository;  // Concrete class
    private final SmtpEmailService emailService;     // Concrete class

    public UserService() {
        this.userRepository = new JpaUserRepository();  // Tight coupling
        this.emailService = new SmtpEmailService();
    }
}
```

---

### 4.2 Clean Code Principles

**Meaningful Names:**

```java
// ✅ DOĞRU
public User findUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException(email));
}

// ❌ YANLIŞ
public User get(String e) {
    return repo.find(e).orElseThrow(() -> new Exception());
}
```

**Small Functions:**

```java
// ✅ DOĞRU - Küçük, tek sorumluluk
public void registerUser(RegisterUserCommand command) {
    validateEmail(command.email());
    validatePassword(command.password());

    User user = createUser(command);
    userRepository.save(user);

    sendVerificationEmail(user);
}

private void validateEmail(String email) {
    if (!EmailValidator.isValid(email)) {
        throw new InvalidEmailException(email);
    }
}

// ❌ YANLIŞ - Uzun, çok sorumluluk
public void registerUser(RegisterUserCommand command) {
    // Email validation
    if (!command.email().contains("@")) {
        throw new InvalidEmailException();
    }

    // Password validation
    if (command.password().length() < 8) {
        throw new InvalidPasswordException();
    }

    // Create user
    User user = new User();
    user.setEmail(command.email());
    // ... 30+ satır daha
}
```

**Avoid Deep Nesting:**

```java
// ✅ DOĞRU - Early return
public void processPost(Post post) {
    if (post == null) {
        return;
    }

    if (!post.getAuthor().isVerified()) {
        throw new UnverifiedUserException();
    }

    if (post.getContent().isEmpty()) {
        throw new EmptyContentException();
    }

    publishPost(post);
}

// ❌ YANLIŞ - Deep nesting
public void processPost(Post post) {
    if (post != null) {
        if (post.getAuthor().isVerified()) {
            if (!post.getContent().isEmpty()) {
                publishPost(post);
            } else {
                throw new EmptyContentException();
            }
        } else {
            throw new UnverifiedUserException();
        }
    }
}
```

**DRY (Don't Repeat Yourself):**

```java
// ✅ DOĞRU - Ortak logic extract edilmiş
public void approveVerification(VerificationRequest request) {
    request.approve();
    userRepository.save(request.getUser());
    notifyUser(request.getUser(), "Verification approved");
}

public void rejectVerification(VerificationRequest request) {
    request.reject();
    userRepository.save(request.getUser());
    notifyUser(request.getUser(), "Verification rejected");
}

private void notifyUser(User user, String message) {
    notificationService.send(user, message);
}

// ❌ YANLIŞ - Duplicate code
public void approveVerification(VerificationRequest request) {
    request.approve();
    userRepository.save(request.getUser());
    Notification notification = new Notification();
    notification.setUser(request.getUser());
    notification.setMessage("Verification approved");
    notificationService.send(notification);
}

public void rejectVerification(VerificationRequest request) {
    request.reject();
    userRepository.save(request.getUser());
    Notification notification = new Notification();
    notification.setUser(request.getUser());
    notification.setMessage("Verification rejected");
    notificationService.send(notification);
}
```

---

### 4.3 Null Safety

**Optional Usage:**

```java
// ✅ DOĞRU - Optional kullan
public Optional<User> findByEmail(String email) {
    return userRepository.findByEmail(email);
}

public User getUser(String email) {
    return findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException(email));
}

// Chain operations
String userName = findByEmail(email)
    .map(User::getFullName)
    .map(FullName::getValue)
    .orElse("Unknown");

// ❌ YANLIŞ - Null döndürme
public User findByEmail(String email) {
    User user = userRepository.findByEmail(email);
    return user;  // null olabilir
}

public String getUserName(String email) {
    User user = findByEmail(email);
    if (user != null) {
        if (user.getFullName() != null) {
            return user.getFullName().getValue();
        }
    }
    return "Unknown";
}
```

**Null Checks:**

```java
// ✅ DOĞRU - Objects.requireNonNull
public class User {
    private final Email email;

    public User(Email email) {
        this.email = Objects.requireNonNull(email, "Email cannot be null");
    }
}

// ✅ Spring @NonNull annotation
@Service
public class UserService {

    public User registerUser(@NonNull RegisterUserCommand command) {
        // command garantili non-null
    }
}

// ❌ YANLIŞ - Null check yapılmamış
public User(Email email) {
    this.email = email;  // null olabilir
}
```

---

### 4.4 Exception Handling

**Custom Exceptions:**

```java
// ✅ DOĞRU - Domain-specific exception
public class UserNotFoundException extends RuntimeException {
    private final String email;

    public UserNotFoundException(String email) {
        super(String.format("User not found with email: %s", email));
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}

// ❌ YANLIŞ - Generic exception
public void getUser(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
        throw new RuntimeException("User not found");
    }
}
```

**Exception Hierarchy:**

```java
// Domain exceptions
public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) {
        super(message);
    }
}

public class UserNotFoundException extends DomainException {
    public UserNotFoundException(String email) {
        super("User not found: " + email);
    }
}

public class InvalidPasswordException extends DomainException {
    public InvalidPasswordException(String reason) {
        super("Invalid password: " + reason);
    }
}

// Infrastructure exceptions
public abstract class InfrastructureException extends RuntimeException {
    protected InfrastructureException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class DatabaseException extends InfrastructureException {
    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

---

## 5. Spring Boot Best Practices

### 5.1 Dependency Injection

**Constructor Injection:**

```java
// ✅ DOĞRU - Constructor injection (immutable)
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public UserService(
        UserRepository userRepository,
        EmailService emailService,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }
}

// ✅ Lombok ile
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
}

// ❌ YANLIŞ - Field injection
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;
}
```

---

### 5.2 Configuration

**Externalized Configuration:**

```java
// ✅ DOĞRU - @ConfigurationProperties
@ConfigurationProperties(prefix = "jwt")
@Validated
public class JwtProperties {

    @NotBlank
    private String secret;

    @Min(60000)
    private long accessTokenExpiration;

    @Min(3600000)
    private long refreshTokenExpiration;

    // Getters and setters
}

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    private final JwtProperties jwtProperties;

    public SecurityConfig(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }
}

// ❌ YANLIŞ - Hardcoded values
@Service
public class JwtService {
    private static final String SECRET = "my-secret-key";
    private static final long EXPIRATION = 900000;
}
```

---

### 5.3 Transaction Management

**Declarative Transactions:**

```java
// ✅ DOĞRU - Service layer'da transaction
@Service
@Transactional(readOnly = true)
public class UserService {

    @Transactional
    public User registerUser(RegisterUserCommand command) {
        User user = User.create(command);
        userRepository.save(user);

        VerificationToken token = VerificationToken.create(user);
        tokenRepository.save(token);

        emailService.sendVerificationEmail(user, token);

        return user;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}

// ❌ YANLIŞ - Repository'de transaction
@Repository
public class JpaUserRepository {

    @Transactional
    public void save(User user) {
        // Repository sadece data access
    }
}
```

---

### 5.4 Validation

**Bean Validation:**

```java
// ✅ DOĞRU - DTO validation
public record RegisterUserRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain lowercase, uppercase and digit")
    String password,

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    String fullName,

    @NotNull(message = "Profession is required")
    Profession profession
) {}

@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
        @Valid @RequestBody RegisterUserRequest request
    ) {
        // Validation otomatik yapılır
    }
}
```

---

## 6. Testing Standards

### 6.1 Test Naming

**Convention:**

```java
// Pattern: methodName_StateUnderTest_ExpectedBehavior

// ✅ DOĞRU
@Test
void registerUser_WithValidData_ShouldCreateUser() {}

@Test
void registerUser_WithDuplicateEmail_ShouldThrowException() {}

@Test
void findByEmail_WhenUserExists_ShouldReturnUser() {}

@Test
void findByEmail_WhenUserNotExists_ShouldReturnEmpty() {}

// ❌ YANLIŞ
@Test
void test1() {}

@Test
void testRegister() {}

@Test
void shouldRegisterUser() {}
```

---

### 6.2 Test Structure

**AAA Pattern:**

```java
@Test
void approveVerification_WithValidRequest_ShouldApproveAndNotifyUser() {
    // Arrange - Test verisi hazırla
    User user = UserTestBuilder.aUser()
        .withEmail("test@example.com")
        .withStatus(UserStatus.PENDING_VERIFICATION)
        .build();

    VerificationRequest request = VerificationRequestTestBuilder.aRequest()
        .withUser(user)
        .withStatus(VerificationStatus.PENDING)
        .build();

    when(verificationRepository.findById(request.getId()))
        .thenReturn(Optional.of(request));

    // Act - Test et
    verificationService.approve(request.getId());

    // Assert - Doğrula
    assertThat(request.getStatus()).isEqualTo(VerificationStatus.APPROVED);
    assertThat(user.getStatus()).isEqualTo(UserStatus.VERIFIED);

    verify(userRepository).save(user);
    verify(notificationService).sendVerificationApprovedNotification(user);
}
```

---

### 6.3 Test Coverage

**Minimum Coverage:**

- Domain Layer: 95%+
- Application Layer: 90%+
- Infrastructure Layer: 80%+
- API Layer: 75%+

**Coverage Check:**

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>PACKAGE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.90</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

## 7. Code Quality Tools

### 7.1 Static Analysis

**Checkstyle:**

```xml
<!-- checkstyle.xml -->
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
    "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
    "https://checkstyle.org/dtds/configuration_1_3.dtd">

<module name="Checker">
    <property name="charset" value="UTF-8"/>

    <module name="TreeWalker">
        <!-- Naming -->
        <module name="TypeName"/>
        <module name="MethodName"/>
        <module name="ConstantName"/>
        <module name="LocalVariableName"/>

        <!-- Imports -->
        <module name="AvoidStarImport"/>
        <module name="UnusedImports"/>
        <module name="RedundantImport"/>

        <!-- Size -->
        <module name="LineLength">
            <property name="max" value="120"/>
        </module>
        <module name="MethodLength">
            <property name="max" value="50"/>
        </module>

        <!-- Whitespace -->
        <module name="WhitespaceAfter"/>
        <module name="WhitespaceAround"/>

        <!-- Code quality -->
        <module name="SimplifyBooleanExpression"/>
        <module name="SimplifyBooleanReturn"/>
        <module name="EqualsHashCode"/>
    </module>
</module>
```

**SonarQube:**

```yaml
# sonar-project.properties
sonar.projectKey=meslektas-backend
sonar.projectName=Meslektas Backend
sonar.sources=src/main/java
sonar.tests=src/test/java
sonar.java.binaries=target/classes

# Coverage
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# Quality gates
sonar.qualitygate.wait=true

# Exclusions
sonar.exclusions=**/*Entity.java,**/*Dto.java
```

**Quality Gate Rules:**

- Code Coverage: > 85%
- Duplicated Lines: < 3%
- Maintainability Rating: A
- Reliability Rating: A
- Security Rating: A
- Code Smells: < 10 per 1000 lines
- Bugs: 0
- Vulnerabilities: 0

---

### 7.2 Code Review Checklist

**Pre-Commit:**

```bash
# Run before commit
mvn clean verify
mvn checkstyle:check
mvn spotbugs:check
```

**Pull Request Checklist:**

```
✅ Code Quality:
  - [ ] Follows naming conventions
  - [ ] No code smells (SonarQube)
  - [ ] No duplicated code
  - [ ] SOLID principles applied
  - [ ] Clean Code principles applied

✅ Testing:
  - [ ] Unit tests added
  - [ ] Integration tests added (if needed)
  - [ ] Test coverage > 90%
  - [ ] All tests passing
  - [ ] Edge cases covered

✅ Documentation:
  - [ ] JavaDoc added for public methods
  - [ ] README updated (if needed)
  - [ ] API documentation updated
  - [ ] Comments explain "why" not "what"

✅ Security:
  - [ ] No hardcoded secrets
  - [ ] Input validation added
  - [ ] Authorization checks added
  - [ ] SQL injection safe
  - [ ] XSS safe

✅ Performance:
  - [ ] No N+1 queries
  - [ ] Caching considered
  - [ ] Database indexes added
  - [ ] Async processing considered

✅ Git:
  - [ ] Meaningful commit messages
  - [ ] Small, focused commits
  - [ ] No merge conflicts
  - [ ] Branch up-to-date with main
```

---

## 8. Git Workflow

### 8.1 Branch Strategy

**Git Flow:**

```
main (production)
  ├── develop (integration)
      ├── feature/USER-123-user-registration
      ├── feature/USER-124-email-verification
      ├── bugfix/USER-125-password-validation
      └── hotfix/USER-126-security-patch
```

**Branch Naming:**

- `feature/<JIRA-ID>-<short-description>`
- `bugfix/<JIRA-ID>-<short-description>`
- `hotfix/<JIRA-ID>-<short-description>`
- `release/<version>`

---

### 8.2 Commit Messages

**Convention:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: Yeni feature
- `fix`: Bug fix
- `docs`: Dokümantasyon
- `refactor`: Kod refactoring
- `test`: Test ekleme/düzeltme
- `chore`: Build, dependencies

**Examples:**

```bash
# ✅ DOĞRU
feat(user): add email verification flow

Implement email verification with token generation and expiry.
- Create VerificationToken entity
- Add email service integration
- Add verification endpoint

Closes USER-123

# fix(auth): prevent JWT token replay attack

Add token blacklist with Redis to invalidate used tokens.

Fixes USER-124

# refactor(post): extract feed algorithm to separate service

Improve testability and maintainability of feed generation logic.

# ❌ YANLIŞ
"fixed bug"
"updates"
"wip"
```

---

## 9. Performance Best Practices

### 9.1 Database

**N+1 Query Prevention:**

```java
// ✅ DOĞRU - Fetch join
@Query("SELECT p FROM PostEntity p " +
       "LEFT JOIN FETCH p.author " +
       "WHERE p.id = :id")
Optional<PostEntity> findByIdWithAuthor(@Param("id") UUID id);

// EntityGraph kullanımı
@EntityGraph(attributePaths = {"author", "comments"})
List<PostEntity> findAll();

// ❌ YANLIŞ - N+1 query
List<Post> posts = postRepository.findAll();
for (Post post : posts) {
    User author = post.getAuthor();  // Her post için ayrı query
    String name = author.getFullName();
}
```

**Batch Processing:**

```java
// ✅ DOĞRU - Batch insert
@Transactional
public void saveAll(List<User> users) {
    int batchSize = 20;
    for (int i = 0; i < users.size(); i++) {
        entityManager.persist(users.get(i));

        if (i % batchSize == 0 && i > 0) {
            entityManager.flush();
            entityManager.clear();
        }
    }
}

// application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
```

**Indexes:**

```sql
-- ✅ DOĞRU - Frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Composite index for common queries
CREATE INDEX idx_users_profession_verified ON users(profession, is_verified)
WHERE is_verified = true;
```

---

### 9.2 Caching

**Redis Caching:**

```java
// ✅ DOĞRU - Cache frequently accessed data
@Cacheable(value = "users", key = "#id", unless = "#result == null")
public Optional<User> findById(UserId id) {
    return userRepository.findById(id);
}

@CacheEvict(value = "users", key = "#user.id")
public void update(User user) {
    userRepository.save(user);
}

@CachePut(value = "users", key = "#result.id")
public User create(User user) {
    return userRepository.save(user);
}

// Cache configuration
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .disableCachingNullValues()
            .serializeValuesWith(
                SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
            );
    }
}
```

---

### 9.3 Async Processing

**@Async Methods:**

```java
// ✅ DOĞRU - Non-critical işlemler async
@Service
public class NotificationService {

    @Async
    public CompletableFuture<Void> sendEmailAsync(User user, String message) {
        emailService.send(user.getEmail(), message);
        return CompletableFuture.completedFuture(null);
    }
}

// Configuration
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
```

---

## 10. Security Best Practices

### 10.1 Input Validation

**Always Validate:**

```java
// ✅ DOĞRU - Comprehensive validation
public class Email {
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final String value;

    public Email(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailException("Email cannot be empty");
        }

        if (value.length() > 255) {
            throw new InvalidEmailException("Email too long");
        }

        if (!EMAIL_PATTERN.matcher(value).matches()) {
            throw new InvalidEmailException("Invalid email format");
        }

        this.value = value.toLowerCase().trim();
    }
}
```

---

### 10.2 SQL Injection Prevention

**Prepared Statements:**

```java
// ✅ DOĞRU - Parameterized query
@Query("SELECT u FROM UserEntity u WHERE u.email = :email")
Optional<UserEntity> findByEmail(@Param("email") String email);

// ❌ YANLIŞ - String concatenation
@Query("SELECT u FROM UserEntity u WHERE u.email = '" + email + "'")
Optional<UserEntity> findByEmail(String email);
```

---

### 10.3 Authentication

**JWT Security:**

```java
// ✅ DOĞRU - Secure JWT configuration
public class JwtTokenProvider {

    private static final Algorithm ALGORITHM = Algorithm.HMAC256(secret);

    public String createAccessToken(UserId userId) {
        return JWT.create()
            .withSubject(userId.getValue().toString())
            .withIssuedAt(new Date())
            .withExpiresAt(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .withIssuer("meslektas-api")
            .sign(ALGORITHM);
    }

    public boolean validateToken(String token) {
        try {
            JWTVerifier verifier = JWT.require(ALGORITHM)
                .withIssuer("meslektas-api")
                .build();

            verifier.verify(token);
            return !isTokenBlacklisted(token);  // Check blacklist
        } catch (JWTVerificationException e) {
            return false;
        }
    }
}
```

---

## 11. Summary

### Key Principles:

- ✅ **SOLID** - Her zaman SOLID principles uygula
- ✅ **Clean Code** - Okunabilir, maintainable kod yaz
- ✅ **DRY** - Tekrar etme
- ✅ **KISS** - Basit tut
- ✅ **YAGNI** - İhtiyaç olmayan özellik ekleme

### Quality Metrics:

- Test Coverage: > 90%
- Code Duplication: < 3%
- Cyclomatic Complexity: < 10
- Method Length: < 50 lines
- Class Length: < 300 lines

### Tools:

- **Checkstyle** - Coding standards
- **SpotBugs** - Bug detection
- **SonarQube** - Code quality
- **JaCoCo** - Code coverage
- **ArchUnit** - Architecture testing

**Sonuç:** Bu standartlara uyarak yüksek kaliteli, maintainable, güvenli kod yazılır.
