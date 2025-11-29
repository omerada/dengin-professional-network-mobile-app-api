# 👨‍💻 Geliştirme Standartları ve En İyi Pratikler

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Genel Kurallar](#genel-kurallar)
2. [Backend Standartları](#backend-standartları)
3. [Frontend Standartları](#frontend-standartları)
4. [Git Workflow](#git-workflow)
5. [Code Review](#code-review)
6. [Documentation](#documentation)
7. [Security Best Practices](#security-best-practices)

---

## 🎯 Genel Kurallar

### Code Principles

**SOLID Principles:**

- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

**DRY (Don't Repeat Yourself):**

- Kod tekrarından kaçının
- Ortak fonksiyonları utility'lerde toplayın
- Constants'ları merkezi dosyalarda tanımlayın

**KISS (Keep It Simple, Stupid):**

- Basit ve anlaşılır kod yazın
- Over-engineering yapmayın
- Gereksiz abstraction'dan kaçının

### Naming Conventions

**Genel Kurallar:**

- Açıklayıcı ve anlamlı isimler kullanın
- Kısaltmalardan kaçının (API, URL gibi yaygın olanlar hariç)
- Boolean değişkenler `is`, `has`, `should` ile başlasın
- Functions/methods fiil ile başlasın (get, create, update, delete)

---

## ☕ Backend Standartları (Java/Spring Boot)

### Proje Yapısı

```
src/main/java/com/meslektas/
├── config/              # Configuration classes
│   ├── SecurityConfig.java
│   ├── RedisConfig.java
│   └── S3Config.java
├── controller/          # REST controllers
│   ├── AuthController.java
│   ├── UserController.java
│   └── PostController.java
├── service/             # Business logic
│   ├── UserService.java
│   ├── PostService.java
│   └── impl/
│       ├── UserServiceImpl.java
│       └── PostServiceImpl.java
├── repository/          # Data access
│   ├── UserRepository.java
│   └── PostRepository.java
├── model/               # Entity classes
│   ├── User.java
│   ├── Post.java
│   └── Comment.java
├── dto/                 # Data Transfer Objects
│   ├── request/
│   │   ├── LoginRequest.java
│   │   └── CreatePostRequest.java
│   └── response/
│       ├── UserResponse.java
│       └── PostResponse.java
├── exception/           # Custom exceptions
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   └── ValidationException.java
├── security/            # Security components
│   ├── JwtService.java
│   ├── JwtAuthFilter.java
│   └── UserDetailsServiceImpl.java
└── util/                # Utility classes
    ├── DateUtil.java
    └── ValidationUtil.java
```

### Naming Conventions

**Classes:**

```java
// ✅ Good
public class UserService {}
public class PostController {}
public class AuthenticationFilter {}

// ❌ Bad
public class Users {}
public class PostCont {}
public class Auth {}
```

**Methods:**

```java
// ✅ Good
public User getUserById(Long id) {}
public void createPost(CreatePostRequest request) {}
public boolean isUserVerified(Long userId) {}

// ❌ Bad
public User user(Long id) {}
public void post(CreatePostRequest request) {}
public boolean verified(Long userId) {}
```

**Variables:**

```java
// ✅ Good
private String accessToken;
private List<User> verifiedUsers;
private boolean isEmailVerified;

// ❌ Bad
private String token;
private List<User> users;
private boolean verified;
```

### Code Style

**Controller Example:**

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Getting user by id: {}", id);

        User user = userService.getUserById(id);
        UserResponse response = UserMapper.toResponse(user);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@userService.isCurrentUser(#id, #userDetails)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("Updating user: {}", id);

        User updatedUser = userService.updateUser(id, request);
        UserResponse response = UserMapper.toResponse(updatedUser);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

**Service Example:**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public User registerUser(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        // Validate email doesn't exist
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .surname(request.getSurname())
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(savedUser.getEmail());

        log.info("User registered successfully: {}", savedUser.getId());
        return savedUser;
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
```

### Exception Handling

**Global Exception Handler:**

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex
    ) {
        log.error("Resource not found: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .code("RESOURCE_NOT_FOUND")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(error));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            ValidationException ex
    ) {
        log.error("Validation error: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message(ex.getMessage())
                .errors(ex.getErrors())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex
    ) {
        log.error("Unexpected error", ex);

        ErrorResponse error = ErrorResponse.builder()
                .code("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(error));
    }
}
```

### Testing Standards

**Unit Test Example:**

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    @DisplayName("Register user - Success scenario")
    void testRegisterUser_Success() {
        // Arrange
        RegisterRequest request = createRegisterRequest();
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        User result = userService.registerUser(request);

        // Assert
        assertNotNull(result);
        assertEquals(request.getEmail(), result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    private RegisterRequest createRegisterRequest() {
        return RegisterRequest.builder()
                .email("test@example.com")
                .password("Password123!")
                .name("Ahmet")
                .surname("Yılmaz")
                .build();
    }
}
```

### Logging Standards

```java
@Slf4j
public class UserService {

    public User createUser(CreateUserRequest request) {
        // Info: Normal operations
        log.info("Creating user with email: {}", request.getEmail());

        try {
            User user = userRepository.save(mapToUser(request));

            // Debug: Detailed info for debugging
            log.debug("User created with id: {}", user.getId());

            return user;

        } catch (DataIntegrityViolationException e) {
            // Error: Expected errors with context
            log.error("Failed to create user, email already exists: {}",
                      request.getEmail(), e);
            throw new ConflictException("Email already exists");

        } catch (Exception e) {
            // Error: Unexpected errors with full stack trace
            log.error("Unexpected error while creating user", e);
            throw new InternalServerException("Failed to create user");
        }
    }
}
```

---

## ⚛️ Frontend Standartları (React Native)

### Proje Yapısı

```
src/
├── api/                 # API client
│   ├── client.ts
│   ├── auth.api.ts
│   ├── user.api.ts
│   └── post.api.ts
├── components/          # Reusable components
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   └── PostList.tsx
│   └── user/
│       ├── Avatar.tsx
│       └── UserCard.tsx
├── screens/             # Screen components
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
├── navigation/          # Navigation setup
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   ├── usePosts.ts
│   └── useInfiniteScroll.ts
├── context/             # React Context
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── utils/               # Utility functions
│   ├── validation.ts
│   ├── date.ts
│   └── formatting.ts
├── constants/           # Constants
│   ├── colors.ts
│   ├── api.ts
│   └── config.ts
├── types/               # TypeScript types
│   ├── user.types.ts
│   ├── post.types.ts
│   └── api.types.ts
└── styles/              # Global styles
    ├── theme.ts
    └── typography.ts
```

### Naming Conventions

**Components:**

```typescript
// ✅ Good - PascalCase
export const LoginScreen: React.FC = () => {};
export const PostCard: React.FC<PostCardProps> = () => {};
export const Button: React.FC<ButtonProps> = () => {};

// ❌ Bad
export const loginScreen = () => {};
export const post_card = () => {};
```

**Hooks:**

```typescript
// ✅ Good - camelCase, start with 'use'
export const useAuth = () => {};
export const usePosts = () => {};
export const useInfiniteScroll = () => {};

// ❌ Bad
export const Auth = () => {};
export const getPosts = () => {};
```

**Files:**

```
// ✅ Good
LoginScreen.tsx
PostCard.tsx
useAuth.ts
auth.api.ts

// ❌ Bad
loginscreen.tsx
postCard.tsx
Auth.ts
authAPI.ts
```

### Component Style

**Functional Component with TypeScript:**

```typescript
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing } from "@/styles/theme";

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(post.isLikedByCurrentUser);
  }, [post.isLikedByCurrentUser]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.authorName}>{post.author.name}</Text>
        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          <Text style={[styles.likeButton, isLiked && styles.liked]}>
            👍 {post.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onComment(post.id)}>
          <Text style={styles.commentButton}>💬 {post.commentCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  content: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  likeButton: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  liked: {
    color: colors.primary,
  },
  commentButton: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
```

### Custom Hook Example

```typescript
import { useState, useEffect } from "react";
import { authApi } from "@/api/auth.api";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (token) {
        const user = await authApi.getCurrentUser();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      await AsyncStorage.setItem("accessToken", response.tokens.accessToken);
      await AsyncStorage.setItem("refreshToken", response.tokens.refreshToken);

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
};
```

### API Client

```typescript
import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("accessToken");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            const response = await this.client.post("/auth/refresh", {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            await AsyncStorage.setItem("accessToken", accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            await AsyncStorage.clear();
            // Navigate to login screen
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getInstance();
```

---

## 🔀 Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/user-authentication
│   ├── feature/post-creation
│   ├── bugfix/login-error
│   └── hotfix/security-patch
```

**Branch Types:**

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Branch Naming

```bash
# ✅ Good
feature/user-authentication
feature/ai-verification
bugfix/login-validation
hotfix/security-patch

# ❌ Bad
user-auth
fix-login
patch
```

### Commit Messages

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Dokümantasyon
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test ekleme/düzeltme
- `chore`: Build, dependencies

**Examples:**

```bash
# ✅ Good
feat(auth): add JWT authentication
fix(posts): resolve infinite scroll bug
docs(api): update API documentation

# ❌ Bad
added login
fixed bug
update
```

### Pull Request Process

**1. Create Feature Branch:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-profile
```

**2. Make Changes and Commit:**

```bash
git add .
git commit -m "feat(profile): add user profile screen"
git push origin feature/user-profile
```

**3. Create Pull Request:**

- Title: Clear and descriptive
- Description: What, why, how
- Link related issues
- Add screenshots (for UI changes)
- Request reviewers

**4. Code Review:**

- Address all comments
- Update code based on feedback
- Re-request review

**5. Merge:**

- Squash commits (for feature branches)
- Merge to develop
- Delete feature branch

---

## 👀 Code Review

### Checklist

**Functionality:**

- ✅ Code works as expected
- ✅ Edge cases handled
- ✅ Error handling implemented
- ✅ No regression bugs

**Code Quality:**

- ✅ Follows coding standards
- ✅ No code duplication
- ✅ Proper naming conventions
- ✅ Comments where necessary

**Performance:**

- ✅ No unnecessary re-renders (React)
- ✅ Efficient database queries
- ✅ Proper caching
- ✅ No memory leaks

**Security:**

- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Proper authentication/authorization

**Testing:**

- ✅ Unit tests added
- ✅ Integration tests (if needed)
- ✅ Tests pass
- ✅ Code coverage maintained

### Review Comments

```markdown
# ✅ Good Comments

**Suggestion:** Consider using `useMemo` here to prevent unnecessary re-computations.

**Question:** What happens if the API returns null? Should we add null checking?

**Nitpick:** Variable name `data` is too generic. Consider `userData` for clarity.

# ❌ Bad Comments

This is wrong.
Fix this.
Why did you do it this way?
```

---

## 📚 Documentation

### Code Documentation

**Java (JavaDoc):**

```java
/**
 * Registers a new user in the system.
 *
 * @param request the registration request containing user details
 * @return the created user with generated ID
 * @throws ConflictException if email already exists
 * @throws ValidationException if request validation fails
 */
@Transactional
public User registerUser(RegisterRequest request) {
    // Implementation
}
```

**TypeScript (JSDoc):**

```typescript
/**
 * Custom hook for managing authentication state
 *
 * @returns {Object} Authentication state and methods
 * @returns {User | null} user - Current authenticated user
 * @returns {boolean} isAuthenticated - Authentication status
 * @returns {Function} login - Login function
 * @returns {Function} logout - Logout function
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  // Implementation
};
```

### README Files

Her modül/feature için README.md:

````markdown
# User Authentication Module

## Overview

Handles user registration, login, and JWT token management.

## Features

- Email/password registration
- JWT authentication
- OAuth 2.0 (Google, Apple)
- Token refresh

## API Endpoints

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh

## Usage

```java
@Autowired
private AuthService authService;

User user = authService.registerUser(registerRequest);
```
````

## Testing

```bash
mvn test -Dtest=AuthServiceTest
```

````

---

## 🔒 Security Best Practices

### Input Validation

```java
// ✅ Good - Validate all inputs
@PostMapping("/users")
public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
    // Spring validation will validate automatically
    User user = userService.createUser(request);
    return ResponseEntity.ok(user);
}

// DTO with validation
public class CreateUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 50, message = "Password must be 8-50 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain uppercase, lowercase, and number")
    private String password;
}
````

### SQL Injection Prevention

```java
// ✅ Good - Use parameterized queries
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);

// ❌ Bad - Never concatenate SQL
// String sql = "SELECT * FROM users WHERE email = '" + email + "'";
```

### XSS Prevention

```typescript
// ✅ Good - Sanitize user input
import DOMPurify from "dompurify";

const sanitizedContent = DOMPurify.sanitize(userInput);

// ❌ Bad - Never use dangerouslySetInnerHTML without sanitization
// <div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Sensitive Data

```java
// ✅ Good - Never log sensitive data
log.info("User logged in: {}", user.getEmail());

// ❌ Bad
// log.info("Login attempt - Email: {}, Password: {}", email, password);
```

```typescript
// ✅ Good - Clear sensitive data from memory
const clearSensitiveData = () => {
  password = "";
  token = "";
};

// Never commit secrets to Git
// Use environment variables
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
```

---

**Hazırlayan:** Development Team  
**Onaylayan:** Tech Lead  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
