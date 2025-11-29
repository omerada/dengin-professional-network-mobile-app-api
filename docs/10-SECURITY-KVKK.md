# 🔒 Güvenlik ve KVKK Uyum Plan

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 29 Kasım 2025  
**Durum:** ✅ Onaylandı

---

## 📑 İçindekiler

1. [Güvenlik Genel Bakış](#güvenlik-genel-bakış)
2. [Application Security](#application-security)
3. [Data Security](#data-security)
4. [KVKK Uyum](#kvkk-uyum)
5. [Veri İşleme Envanteri](#veri-i̇şleme-envanteri)
6. [Kullanıcı Hakları](#kullanıcı-hakları)
7. [Incident Response](#incident-response)
8. [Compliance Checklist](#compliance-checklist)

---

## 🎯 Güvenlik Genel Bakış

Meslektaş platformu, kullanıcı verilerinin korunması ve KVKK (Kişisel Verilerin Korunması Kanunu) uyumluluğu için kapsamlı güvenlik önlemleri içerir.

### Güvenlik Prensipleri

1. **Security by Design:** Tasarımdan itibaren güvenlik
2. **Defense in Depth:** Çok katmanlı koruma
3. **Least Privilege:** Minimum yetki prensibi
4. **Zero Trust:** Hiçbir isteme varsayılan güven yok
5. **Privacy by Default:** Varsayılan gizlilik

### Compliance Standards

✅ KVKK (Türkiye)  
✅ GDPR Principles  
✅ ISO 27001 Alignment  
✅ OWASP Top 10

---

## 🛡️ Application Security

### 1. Authentication & Authorization

#### JWT Token Security

**Access Token:**

```yaml
Algorithm: HS256 (HMAC with SHA-256)
Secret: 256-bit random key (rotated monthly)
Expiry: 24 hours
Payload:
  sub: user_id
  email: user@example.com
  role: USER/ADMIN
  iat: issued_at_timestamp
  exp: expiration_timestamp
```

**Refresh Token:**

```yaml
Expiry: 30 days
Storage: Database (encrypted)
Rotation: On each use
Invalidation: Logout, password change
```

**Implementation:**

```java
@Service
public class JwtService {

    private static final String SECRET_KEY = System.getenv("JWT_SECRET");
    private static final long ACCESS_TOKEN_VALIDITY = 86400000; // 24h

    public String generateAccessToken(User user) {
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
            .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token);
            return !isTokenBlacklisted(token);
        } catch (JwtException e) {
            return false;
        }
    }
}
```

**Token Blacklist (Redis):**

```java
@Service
public class TokenBlacklistService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public void blacklistToken(String token, long expirySeconds) {
        redisTemplate.opsForValue().set(
            "blacklist:" + token,
            "true",
            expirySeconds,
            TimeUnit.SECONDS
        );
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(
            redisTemplate.hasKey("blacklist:" + token)
        );
    }
}
```

---

### 2. Password Security

**Requirements:**

- Minimum 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character (!@#$%^&\*)

**Hashing:**

```java
@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public String hashPassword(String plainPassword) {
        return encoder.encode(plainPassword);
    }

    public boolean matches(String plainPassword, String hashedPassword) {
        return encoder.matches(plainPassword, hashedPassword);
    }
}
```

**Password Strength Validation:**

```java
public class PasswordValidator {

    private static final String PASSWORD_PATTERN =
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    public boolean isValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        Pattern pattern = Pattern.compile(PASSWORD_PATTERN);
        Matcher matcher = pattern.matcher(password);

        return matcher.matches() && !isCommonPassword(password);
    }

    private boolean isCommonPassword(String password) {
        List<String> commonPasswords = Arrays.asList(
            "Password123!", "Qwerty123!", "12345678"
        );
        return commonPasswords.contains(password);
    }
}
```

---

### 3. API Security

#### Rate Limiting

**Configuration:**

```yaml
rate-limit:
  general:
    requests: 100
    window: 60 # seconds
  auth:
    requests: 10
    window: 60
  upload:
    requests: 20
    window: 60
```

**Implementation (Redis):**

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) throws Exception {

        String clientIp = getClientIP(request);
        String endpoint = request.getRequestURI();
        String key = "ratelimit:" + clientIp + ":" + endpoint;

        Long requests = redisTemplate.opsForValue().increment(key);

        if (requests == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }

        RateLimit limit = getRateLimitConfig(endpoint);

        if (requests > limit.getMaxRequests()) {
            response.setStatus(429);
            response.getWriter().write("Too many requests");
            return false;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(limit.getMaxRequests()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(limit.getMaxRequests() - requests));

        return true;
    }
}
```

#### CORS Configuration

```java
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "https://app.meslektas.com",
                        "https://admin.meslektas.com"
                    )
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

#### Input Validation

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @PostMapping("/me")
    public ResponseEntity<?> updateProfile(
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        // Validation automatically applied
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}

public class UpdateProfileRequest {

    @NotBlank(message = "İsim boş olamaz")
    @Size(min = 2, max = 100, message = "İsim 2-100 karakter arası olmalı")
    @Pattern(regexp = "^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$", message = "İsim sadece harf içerebilir")
    private String name;

    @Size(max = 200, message = "Bio maksimum 200 karakter olabilir")
    private String bio;

    // Getters, setters
}
```

#### SQL Injection Prevention

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ SAFE: Using JPQL with parameters
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    // ✅ SAFE: Using method name query
    Optional<User> findByEmailAndStatus(String email, UserStatus status);

    // ❌ UNSAFE: Never use string concatenation
    // @Query("SELECT u FROM User u WHERE u.email = '" + email + "'")
}
```

#### XSS Prevention

```java
@Configuration
public class SecurityHeadersConfig {

    @Bean
    public FilterRegistrationBean<XSSFilter> xssFilterRegistration() {
        FilterRegistrationBean<XSSFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new XSSFilter());
        registration.addUrlPatterns("/api/*");
        return registration;
    }
}

public class XSSFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        XSSRequestWrapper wrappedRequest = new XSSRequestWrapper((HttpServletRequest) request);
        chain.doFilter(wrappedRequest, response);
    }
}

public class XSSRequestWrapper extends HttpServletRequestWrapper {

    @Override
    public String getParameter(String parameter) {
        String value = super.getParameter(parameter);
        return stripXSS(value);
    }

    private String stripXSS(String value) {
        if (value == null) {
            return null;
        }

        // Remove HTML tags
        value = value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

        // Remove script tags
        value = value.replaceAll("<script>(.*?)</script>", "");

        // Remove event handlers
        value = value.replaceAll("javascript:", "");
        value = value.replaceAll("onclick=", "");
        value = value.replaceAll("onerror=", "");

        return value;
    }
}
```

---

## 🔐 Data Security

### 1. Encryption

#### Data at Rest

**Database Encryption:**

```sql
-- PostgreSQL: Enable encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';

-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt credit card (if needed in future)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    card_number BYTEA, -- Encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Encrypt on insert
INSERT INTO payments (user_id, card_number)
VALUES (123, pgp_sym_encrypt('1234567890123456', 'encryption_key'));

-- Decrypt on select
SELECT pgp_sym_decrypt(card_number, 'encryption_key') FROM payments;
```

**File Storage Encryption (S3):**

```yaml
S3 Bucket Policy:
  ServerSideEncryption:
    Algorithm: AES256
  BucketKeyEnabled: true
  VersioningEnabled: true
```

#### Data in Transit

**HTTPS Only:**

```nginx
server {
    listen 80;
    server_name api.meslektas.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.meslektas.com;

    ssl_certificate /etc/ssl/certs/meslektas.crt;
    ssl_certificate_key /etc/ssl/private/meslektas.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

---

### 2. Data Minimization

**Collected Data:**

```yaml
Essential:
  - Email (unique identifier, communication)
  - Name, Surname (identification)
  - Password (authentication)
  - Profession (core feature)

Optional:
  - Bio (user preference)
  - Avatar (user preference)
  - City (user preference)

Temporary (Auto-delete):
  - Verification documents (deleted after verification)
  - Selfie photos (deleted after verification)

Not Collected:
  - Credit card information
  - ID numbers (TC Kimlik)
  - Phone numbers (unless user provides)
  - Location tracking
  - Device fingerprinting
```

---

### 3. Data Retention

**Retention Policy:**

| Data Type              | Retention Period     | Deletion Method                     |
| ---------------------- | -------------------- | ----------------------------------- |
| Verification Documents | 0 days (immediate)   | S3 Lifecycle Policy + Trigger       |
| User Account Data      | Until account active | CASCADE DELETE                      |
| Posts & Comments       | Until user deletes   | Soft delete → Hard delete (30 days) |
| Chat Messages          | Until user deletes   | Hard delete                         |
| Log Files              | 1 year               | Auto-archive to Glacier             |
| Backup Data            | 30 days              | Auto-delete                         |
| Analytics Data         | 2 years (anonymized) | Auto-delete                         |

**Auto-Deletion Implementation:**

```java
@Service
public class DataRetentionService {

    @Scheduled(cron = "0 0 2 * * *") // Every day at 2 AM
    public void cleanupExpiredData() {
        // 1. Delete verification documents older than 24 hours
        verificationService.deleteExpiredDocuments();

        // 2. Hard delete soft-deleted content older than 30 days
        postService.hardDeleteSoftDeletedPosts();

        // 3. Archive old log files
        logService.archiveOldLogs();

        // 4. Delete old notifications (30 days)
        notificationService.deleteOldNotifications();
    }
}

@Service
public class VerificationService {

    public void deleteExpiredDocuments() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);

        List<VerificationRequest> expiredRequests = verificationRepository
            .findByCreatedAtBeforeAndDocumentsNotDeleted(yesterday);

        for (VerificationRequest request : expiredRequests) {
            // Delete from S3
            s3Service.deleteObject(request.getDocumentUrl());
            s3Service.deleteObject(request.getSelfieUrl());

            // Update database
            request.setDocumentUrl(null);
            request.setSelfieUrl(null);
            verificationRepository.save(request);

            log.info("Deleted verification documents for request: {}", request.getId());
        }
    }
}
```

---

## 📜 KVKK Uyum

### KVKK İlkeleri

1. **Hukuka ve Dürüstlük Kuralına Uygun İşleme**
2. **Doğru ve Gerektiğinde Güncel Olma**
3. **Belirli, Açık ve Meşru Amaçlarla İşlenme**
4. **İşlendikleri Amaçla Bağlantılı, Sınırlı ve Ölçülü Olma**
5. **İlgili Mevzuatta Öngörülen Süre Kadar Muhafaza Edilme**

### Veri İşleme Hukuki Dayanakları

**Meslektaş Platform:**

| Veri                   | Hukuki Dayanak    | KVKK Maddesi |
| ---------------------- | ----------------- | ------------ |
| Email, şifre, ad-soyad | Sözleşme İlişkisi | Madde 5/2-c  |
| Meslek bilgisi         | Açık Rıza         | Madde 5/1    |
| Doğrulama belgeleri    | Açık Rıza         | Madde 5/1    |
| Profil fotoğrafı       | Açık Rıza         | Madde 5/1    |
| IP adresi, log         | Meşru Menfaat     | Madde 5/2-f  |
| Post, yorum            | Sözleşme İlişkisi | Madde 5/2-c  |

### Açık Rıza Metni

```markdown
## Kişisel Verilerin İşlenmesi Aydınlatma ve Rıza Metni

Meslektaş platformuna kaydolarak:

✅ Kişisel verilerimin (ad, soyad, e-posta, meslek bilgisi, profil fotoğrafı)
platform üyeliği kapsamında işlenmesini kabul ediyorum.

✅ Meslek doğrulama amacıyla yükleyeceğim diploma/sertifika ve selfie
fotoğrafımın AI sistemleri tarafından analiz edilmesini ve doğrulama
işlemi tamamlandıktan sonra kalıcı olarak silinmesini kabul ediyorum.

✅ Paylaşımlarımın (gönderi, yorum, mesaj) diğer kullanıcılar tarafından
görülebileceğini ve platform üzerinde saklanacağını biliyorum.

✅ İstediğim zaman hesabımı silebileceğimi ve tüm verilerimin kalıcı olarak
silineceğini biliyorum.

✅ KVKK kapsamındaki haklarımı (bilgi talep etme, düzeltme, silme, itiraz)
kullanabileceğimi biliyorum.

**İletişim:** kvkk@meslektas.com
**Veri Sorumlusu:** Meslektaş Teknoloji A.Ş.

□ Okudum, anladım ve kabul ediyorum
```

### Aydınlatma Metni

**Veri Sorumlusu:**

```
Meslektaş Teknoloji A.Ş.
Adres: [Şirket Adresi]
E-posta: kvkk@meslektas.com
Telefon: [Telefon]
```

**İşlenen Kişisel Veriler:**

- Kimlik Bilgileri: Ad, soyad, doğum tarihi
- İletişim Bilgileri: E-posta adresi
- Meslek Bilgisi: Seçilen meslek, doğrulama durumu
- Görsel Veriler: Profil fotoğrafı, diploma/sertifika (geçici)
- Teknik Veriler: IP adresi, çerez bilgileri, log kayıtları

**İşleme Amaçları:**

- Platform üyeliği ve kimlik doğrulama
- Meslek doğrulama işlemleri
- Sosyal ağ hizmetlerinin sunulması
- Güvenlik ve hukuki yükümlülüklerin yerine getirilmesi

**Aktarım:**

- Yurt içi: Bulut hizmet sağlayıcıları (AWS, DigitalOcean)
- Yurt dışı: AWS (AB/ABD - GDPR uyumlu)
- AI Servisleri: AWS Rekognition (geçici işleme)

---

## 👤 Kullanıcı Hakları

### KVKK Madde 11 Hakları

1. **Bilgi Talep Etme:** Hangi verilerim işleniyor?
2. **Düzeltme Talep Etme:** Yanlış bilgimi düzelt
3. **Silme Talep Etme:** Verilerimi sil
4. **İtiraz Etme:** Veri işlemesine itiraz
5. **Aktarım Talep Etme:** Verilerimi başka platforma taşı

### Kullanıcı Hakkı Kullanımı

**Portal:** https://meslektas.com/kvkk-basvuru

**E-posta:** kvkk@meslektas.com

**Başvuru Formu:**

```yaml
Ad Soyad:
E-posta (Kayıtlı):
Talep Türü: [Bilgi/Düzeltme/Silme/İtiraz/Aktarım]
Açıklama:
Kimlik Doğrulama: [TC Kimlik fotokopisi veya e-imza]
```

**Yanıt Süresi:** En geç 30 gün

### Hesap Silme İşlemi

**User-Initiated Deletion:**

```java
@Service
public class AccountDeletionService {

    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        // 1. Delete user data
        postRepository.deleteByUserId(userId);
        commentRepository.deleteByUserId(userId);
        messageRepository.deleteBySenderId(userId);
        notificationRepository.deleteByUserId(userId);
        verificationRepository.deleteByUserId(userId);

        // 2. Delete files from S3
        if (user.getAvatarUrl() != null) {
            s3Service.deleteObject(user.getAvatarUrl());
        }

        // 3. Anonymize data in logs (KVKK compliance)
        logService.anonymizeUserLogs(userId);

        // 4. Delete user
        userRepository.delete(user);

        // 5. Send confirmation email
        emailService.sendAccountDeletionConfirmation(user.getEmail());

        log.info("User account deleted: {}", userId);
    }
}
```

---

## 🚨 Incident Response

### Security Incident Response Plan

**Phases:**

1. **Detection:** Monitoring, alerts
2. **Assessment:** Severity, impact
3. **Containment:** Stop the breach
4. **Eradication:** Remove threat
5. **Recovery:** Restore services
6. **Post-Incident:** Lessons learned

**Incident Categories:**

| Severity     | Examples                                   | Response Time |
| ------------ | ------------------------------------------ | ------------- |
| **Critical** | Data breach, unauthorized access           | Immediate     |
| **High**     | DDoS attack, SQL injection                 | <1 hour       |
| **Medium**   | Malware detected, phishing                 | <4 hours      |
| **Low**      | Failed login attempts, suspicious activity | <24 hours     |

**Data Breach Response:**

```
1. Containment (0-1 hour):
   - Isolate affected systems
   - Block attacker IP
   - Revoke compromised tokens

2. Assessment (1-4 hours):
   - Identify affected users
   - Determine data exposed
   - Document timeline

3. Notification (4-24 hours):
   - Notify affected users
   - Report to KVKK (72 hours)
   - Public disclosure (if required)

4. Remediation (1-7 days):
   - Patch vulnerabilities
   - Reset affected passwords
   - Strengthen security

5. Review (7-30 days):
   - Post-mortem analysis
   - Update procedures
   - Security audit
```

**KVKK Veri İhlali Bildirimi:**

```
Bildirim Süresi: En geç 72 saat
Bildirim Yapılacak Kurum: Kişisel Verileri Koruma Kurumu (KVKK)
İçerik:
  - İhlal tarihi ve saati
  - Etkilenen veri kategorileri
  - Etkilenen kişi sayısı
  - Alınan önlemler
  - İletişim bilgileri
```

---

## ✅ Compliance Checklist

### Pre-Launch Checklist

- [ ] **Security Audit:** Penetration testing completed
- [ ] **KVKK Dokümantasyon:** Aydınlatma metni hazır
- [ ] **Privacy Policy:** Gizlilik politikası yayınlandı
- [ ] **Terms of Service:** Kullanım şartları yayınlandı
- [ ] **Cookie Policy:** Çerez politikası hazır
- [ ] **HTTPS:** SSL sertifikası aktif
- [ ] **Data Encryption:** Encryption enabled
- [ ] **Backup:** Otomatik backup aktif
- [ ] **Monitoring:** Sentry, CloudWatch aktif
- [ ] **Incident Plan:** IR plan dokümante edildi
- [ ] **Staff Training:** Ekip güvenlik eğitimi aldı

### Ongoing Compliance

**Quarterly:**

- [ ] Security patch updates
- [ ] Access control review
- [ ] KVKK compliance audit
- [ ] Backup restoration test

**Annually:**

- [ ] Full security audit
- [ ] Privacy policy update
- [ ] JWT secret rotation
- [ ] SSL certificate renewal

---

**Hazırlayan:** Security & Legal Team  
**Onaylayan:** CEO & Legal Counsel  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
