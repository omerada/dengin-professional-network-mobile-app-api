# 🧪 Test Senaryoları ve Kabul Kriterleri

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Test Stratejisi](#test-stratejisi)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [Performance Tests](#performance-tests)
6. [Security Tests](#security-tests)
7. [Test Coverage](#test-coverage)
8. [Bug Tracking](#bug-tracking)

---

## 🎯 Test Stratejisi

### Test Piramidi

```
          /\
         /  \        E2E Tests (10%)
        /____\       - UI Automation
       /      \      - User Journeys
      /________\
     /          \    Integration Tests (30%)
    /____________\   - API Tests
   /              \  - Database Tests
  /________________\
 /                  \ Unit Tests (60%)
/____________________\- Component Tests
                       - Function Tests
```

### Test Ortamları

| Ortam          | Amaç              | Data            | Trigger   |
| -------------- | ----------------- | --------------- | --------- |
| **Local**      | Developer testing | Mock/Fixture    | Manuel    |
| **CI**         | Automated testing | In-memory DB    | PR/Commit |
| **Staging**    | Pre-production    | Production-like | Deploy    |
| **Production** | Smoke testing     | Real data       | Release   |

### Test Araçları

**Backend:**

- JUnit 5: Unit testing
- Mockito: Mocking
- TestContainers: Integration testing
- REST Assured: API testing
- JMeter: Performance testing

**Frontend:**

- Jest: Unit testing
- React Testing Library: Component testing
- Detox: E2E testing (React Native)
- Maestro: Mobile UI testing

---

## 🔬 Unit Tests

### Backend Unit Tests

#### 1. Service Layer Tests

**UserService Test:**

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Register user - Success")
    void testRegisterUser_Success() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
            .email("test@example.com")
            .password("Password123!")
            .name("Ahmet")
            .surname("Yılmaz")
            .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        User result = userService.registerUser(request);

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Ahmet", result.getName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Register user - Email already exists")
    void testRegisterUser_EmailExists() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
            .email("existing@example.com")
            .password("Password123!")
            .name("Ahmet")
            .surname("Yılmaz")
            .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(ConflictException.class, () -> {
            userService.registerUser(request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Update profile - Success")
    void testUpdateProfile_Success() {
        // Arrange
        Long userId = 1L;
        UpdateProfileRequest request = UpdateProfileRequest.builder()
            .name("Ahmet Updated")
            .bio("New bio")
            .build();

        User existingUser = User.builder()
            .id(userId)
            .email("test@example.com")
            .name("Ahmet")
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        User result = userService.updateProfile(userId, request);

        // Assert
        assertEquals("Ahmet Updated", result.getName());
        assertEquals("New bio", result.getBio());
    }
}
```

#### 2. Repository Tests

**UserRepository Test:**

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("meslektas_test")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Find by email - User exists")
    void testFindByEmail_UserExists() {
        // Arrange
        User user = User.builder()
            .email("test@example.com")
            .passwordHash("hash")
            .name("Ahmet")
            .surname("Yılmaz")
            .build();
        userRepository.save(user);

        // Act
        Optional<User> result = userRepository.findByEmail("test@example.com");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Ahmet", result.get().getName());
    }

    @Test
    @DisplayName("Find by profession and verified")
    void testFindByProfessionAndVerified() {
        // Arrange
        Profession profession = new Profession();
        profession.setId(1L);

        User user1 = createUser("user1@test.com", profession, true);
        User user2 = createUser("user2@test.com", profession, false);
        User user3 = createUser("user3@test.com", profession, true);

        userRepository.saveAll(Arrays.asList(user1, user2, user3));

        // Act
        List<User> result = userRepository.findByProfessionIdAndIsProfessionVerifiedTrue(1L);

        // Assert
        assertEquals(2, result.size());
    }
}
```

---

### Frontend Unit Tests

#### React Native Component Tests

**LoginScreen Test:**

```javascript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";

describe("LoginScreen", () => {
  it("renders correctly", () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText("E-posta")).toBeTruthy();
    expect(getByPlaceholderText("Şifre")).toBeTruthy();
    expect(getByText("Giriş Yap")).toBeTruthy();
  });

  it("shows validation error for invalid email", async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText("E-posta");
    const submitButton = getByText("Giriş Yap");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText("Geçersiz e-posta formatı")).toBeTruthy();
    });
  });

  it("calls login API on successful validation", async () => {
    const mockLogin = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLogin={mockLogin} />
    );

    fireEvent.changeText(getByPlaceholderText("E-posta"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Şifre"), "Password123!");
    fireEvent.press(getByText("Giriş Yap"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });
    });
  });
});
```

**Custom Hook Test:**

```javascript
import { renderHook, act } from "@testing-library/react-hooks";
import useAuth from "../hooks/useAuth";

describe("useAuth", () => {
  it("initializes with no user", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("logs in user successfully", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "Password123!");
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logs out user", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@example.com", "Password123!");
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## 🔗 Integration Tests

### API Integration Tests

**Authentication API Test:**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthenticationIntegrationTest {

    @LocalServerPort
    private int port;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/v1/auth";
    }

    @Test
    @Order(1)
    @DisplayName("Register new user - Success")
    void testRegister_Success() {
        RegisterRequest request = RegisterRequest.builder()
            .email("integration@test.com")
            .password("Password123!")
            .name("Test")
            .surname("User")
            .build();

        given()
            .contentType(ContentType.JSON)
            .body(request)
        .when()
            .post(baseUrl + "/register")
        .then()
            .statusCode(201)
            .body("success", equalTo(true))
            .body("data.user.email", equalTo("integration@test.com"))
            .body("data.tokens.accessToken", notNullValue());
    }

    @Test
    @Order(2)
    @DisplayName("Login with registered user - Success")
    void testLogin_Success() {
        LoginRequest request = LoginRequest.builder()
            .email("integration@test.com")
            .password("Password123!")
            .build();

        given()
            .contentType(ContentType.JSON)
            .body(request)
        .when()
            .post(baseUrl + "/login")
        .then()
            .statusCode(200)
            .body("success", equalTo(true))
            .body("data.user.email", equalTo("integration@test.com"))
            .body("data.tokens.accessToken", notNullValue());
    }

    @Test
    @Order(3)
    @DisplayName("Login with wrong password - Failure")
    void testLogin_WrongPassword() {
        LoginRequest request = LoginRequest.builder()
            .email("integration@test.com")
            .password("WrongPassword!")
            .build();

        given()
            .contentType(ContentType.JSON)
            .body(request)
        .when()
            .post(baseUrl + "/login")
        .then()
            .statusCode(401)
            .body("success", equalTo(false))
            .body("error.code", equalTo("UNAUTHORIZED"));
    }
}
```

**Post API Test:**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PostIntegrationTest {

    @LocalServerPort
    private int port;

    private String accessToken;

    @BeforeEach
    void setUp() {
        // Login and get token
        accessToken = loginAndGetToken();
    }

    @Test
    @DisplayName("Create post - Success")
    void testCreatePost_Success() {
        CreatePostRequest request = CreatePostRequest.builder()
            .content("Bu bir test gönderisi")
            .build();

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + accessToken)
            .body(request)
        .when()
            .post("http://localhost:" + port + "/api/v1/posts")
        .then()
            .statusCode(201)
            .body("success", equalTo(true))
            .body("data.content", equalTo("Bu bir test gönderisi"));
    }

    @Test
    @DisplayName("Get feed - Returns posts from same profession")
    void testGetFeed_SameProfession() {
        given()
            .header("Authorization", "Bearer " + accessToken)
            .queryParam("page", 0)
            .queryParam("size", 20)
        .when()
            .get("http://localhost:" + port + "/api/v1/posts/feed")
        .then()
            .statusCode(200)
            .body("success", equalTo(true))
            .body("data.posts", notNullValue())
            .body("data.pagination.page", equalTo(0));
    }
}
```

---

## 🎭 E2E Tests

### Mobile E2E Tests (Detox)

**User Journey: Registration to First Post**

```javascript
describe("User Registration to First Post", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it("should complete full user journey", async () => {
    // 1. Navigate to register screen
    await element(by.id("register-button")).tap();

    // 2. Fill registration form
    await element(by.id("email-input")).typeText("e2e@test.com");
    await element(by.id("password-input")).typeText("Password123!");
    await element(by.id("name-input")).typeText("E2E");
    await element(by.id("surname-input")).typeText("Test");
    await element(by.id("register-submit")).tap();

    // 3. Wait for success
    await waitFor(element(by.id("home-screen")))
      .toBeVisible()
      .withTimeout(5000);

    // 4. Select profession
    await element(by.id("profession-select")).tap();
    await element(by.text("Yazılım Geliştirici")).tap();
    await element(by.id("profession-confirm")).tap();

    // 5. Skip verification for now
    await element(by.id("skip-verification")).tap();

    // 6. Navigate to create post
    await element(by.id("create-post-button")).tap();

    // 7. Create first post
    await element(by.id("post-content-input")).typeText("İlk paylaşımım!");
    await element(by.id("post-submit")).tap();

    // 8. Verify post appears in feed
    await waitFor(element(by.text("İlk paylaşımım!")))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

**AI Verification Flow:**

```javascript
describe("AI Verification", () => {
  it("should complete verification successfully", async () => {
    // 1. Login
    await loginAs("test@example.com", "Password123!");

    // 2. Navigate to verification
    await element(by.id("profile-tab")).tap();
    await element(by.id("start-verification")).tap();

    // 3. Upload document
    await element(by.id("upload-document")).tap();
    // Mock camera/gallery selection
    await selectMockImage("diploma.jpg");

    // 4. Upload selfie
    await element(by.id("upload-selfie")).tap();
    await selectMockImage("selfie.jpg");

    // 5. Submit
    await element(by.id("submit-verification")).tap();

    // 6. Wait for processing
    await waitFor(element(by.text("Doğrulama Tamamlandı")))
      .toBeVisible()
      .withTimeout(10000);

    // 7. Verify badge appears
    await expect(element(by.id("verified-badge"))).toBeVisible();
  });
});
```

---

## ⚡ Performance Tests

### Load Testing (JMeter)

**Test Scenario: 1000 Concurrent Users**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan>
      <stringProp name="TestPlan.comments">Meslektaş Load Test</stringProp>
      <stringProp name="TestPlan.user_define_variables"/>
    </TestPlan>

    <hashTree>
      <ThreadGroup>
        <stringProp name="ThreadGroup.num_threads">1000</stringProp>
        <stringProp name="ThreadGroup.ramp_time">60</stringProp>
        <stringProp name="ThreadGroup.duration">300</stringProp>
      </ThreadGroup>

      <hashTree>
        <!-- Login Request -->
        <HTTPSamplerProxy>
          <stringProp name="HTTPSampler.domain">api.meslektas.com</stringProp>
          <stringProp name="HTTPSampler.path">/api/v1/auth/login</stringProp>
          <stringProp name="HTTPSampler.method">POST</stringProp>
        </HTTPSamplerProxy>

        <!-- Get Feed Request -->
        <HTTPSamplerProxy>
          <stringProp name="HTTPSampler.path">/api/v1/posts/feed</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
        </HTTPSamplerProxy>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

**Performance Targets:**

| Metric              | Target     | Acceptable | Critical  |
| ------------------- | ---------- | ---------- | --------- |
| Response Time (p95) | <500ms     | <1000ms    | >2000ms   |
| Throughput          | >100 req/s | >50 req/s  | <20 req/s |
| Error Rate          | <0.1%      | <1%        | >5%       |
| CPU Usage           | <70%       | <85%       | >95%      |
| Memory Usage        | <80%       | <90%       | >95%      |

---

## 🔒 Security Tests

### OWASP ZAP Scan

```bash
#!/bin/bash
# Run OWASP ZAP security scan

docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable \
  zap-full-scan.py \
  -t https://api.meslektas.com \
  -r security_report.html
```

### SQL Injection Test

```java
@Test
@DisplayName("SQL Injection - Should be prevented")
void testSqlInjection() {
    String maliciousEmail = "test@example.com'; DROP TABLE users; --";

    LoginRequest request = LoginRequest.builder()
        .email(maliciousEmail)
        .password("password")
        .build();

    given()
        .contentType(ContentType.JSON)
        .body(request)
    .when()
        .post("/api/v1/auth/login")
    .then()
        .statusCode(401); // Should fail authentication, not cause SQL error

    // Verify users table still exists
    assertTrue(userRepository.count() > 0);
}
```

---

## 📊 Test Coverage

### Coverage Targets

| Component          | Target | Minimum |
| ------------------ | ------ | ------- |
| **Backend**        |        |         |
| - Service Layer    | 90%    | 80%     |
| - Controller Layer | 80%    | 70%     |
| - Repository Layer | 70%    | 60%     |
| - Overall          | 80%    | 70%     |
| **Frontend**       |        |         |
| - Components       | 80%    | 70%     |
| - Hooks            | 90%    | 80%     |
| - Utils            | 95%    | 90%     |
| - Overall          | 80%    | 70%     |

### Coverage Report

```bash
# Backend (JaCoCo)
mvn clean test jacoco:report

# Frontend (Jest)
npm test -- --coverage
```

---

## 🐛 Bug Tracking

### Bug Severity Levels

| Level        | Description              | Response Time | Example                 |
| ------------ | ------------------------ | ------------- | ----------------------- |
| **Critical** | System down, data loss   | Immediate     | Database crash          |
| **High**     | Major feature broken     | <4 hours      | Login not working       |
| **Medium**   | Feature partially broken | <24 hours     | Post images not loading |
| **Low**      | Minor UI issue           | <1 week       | Button alignment        |

### Bug Report Template

```markdown
**Title:** [Brief description]

**Severity:** Critical/High/Medium/Low

**Environment:** Production/Staging/Development

**Steps to Reproduce:**

1. Go to login screen
2. Enter email
3. Enter password
4. Click login

**Expected Result:**
User should be logged in

**Actual Result:**
Error message appears

**Screenshots:**
[Attach screenshots]

**Device Info:**

- Device: iPhone 13
- OS: iOS 16.0
- App Version: 1.0.0

**Additional Notes:**
Happens only on iOS, Android works fine
```

---

**Hazırlayan:** QA Team  
**Onaylayan:** Tech Lead  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
