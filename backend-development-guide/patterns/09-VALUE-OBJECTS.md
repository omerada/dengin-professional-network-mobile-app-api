# Value Object Katalog

## 1. Genel Bakış

### 1.1 Value Object Nedir?

Value Object, Domain-Driven Design'da kimliği (identity) olmayan, sadece değeri (value) ile tanımlanan nesnelerdir. İki value object aynı değerlere sahipse eşittirler (value equality).

**Temel Özellikler:**

- **Immutable (Değiştirilemez):** Oluşturulduktan sonra değeri değişmez
- **Value Equality:** Kimlik yerine değer ile karşılaştırılır
- **Self-Validating:** Constructor'da validation yapar
- **Side-Effect-Free:** Method'ları yeni value object döner, mevcut olanı değiştirmez

**Entity vs Value Object:**

```
Entity:
- Kimliği (ID) var
- Yaşam döngüsü boyunca takip edilir
- Mutable (değiştirilebilir)
- Reference equality (id ile karşılaştırma)

Örnek: User, Post, Conversation

Value Object:
- Kimliği (ID) yok
- Sadece değeri önemli
- Immutable (değiştirilemez)
- Value equality (tüm alanlar ile karşılaştırma)

Örnek: Email, Money, Address, DateRange
```

**Meslektaş Projesi Context:**

- 25+ Value Object tanımlandı
- Her value object kendi validation logic'ini içeriyor
- Database'de @Embeddable veya @ElementCollection olarak saklanıyor

### 1.2 Value Object Avantajları

**Type Safety:**

```
❌ Primitive Obsession (Anti-Pattern):
public void sendEmail(String email) {
    // email geçerli mi? Kontrol etmen gerek
}
sendEmail("invalid-email");  // Compile-time error yok!

✅ Value Object:
public void sendEmail(Email email) {
    // Email value object constructor'da validate eder
}
sendEmail(new Email("invalid-email"));  // Runtime'da exception!
```

**Domain Modeling:**

```
❌ Primitive:
class Product {
    private BigDecimal price;  // Hangi para birimi?
    private BigDecimal weight;  // Hangi birim? kg? gram?
}

✅ Value Object:
class Product {
    private Money price;  // Currency bilgisi içerir
    private Weight weight;  // Unit bilgisi içerir
}
```

**Validation Encapsulation:**

```
❌ Validation Service'te:
class UserService {
    public void register(String email, String password) {
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new InvalidEmailException();
        }
        if (password.length() < 8) {
            throw new InvalidPasswordException();
        }
        // ...
    }
}

✅ Validation Value Object'te:
class User {
    private Email email;  // Constructor'da validate eder
    private Password password;  // Constructor'da validate eder
}

Email email = new Email("test@example.com");  // Valid
Email invalid = new Email("invalid");  // Exception!
```

---

## 2. Value Object Tasarım Kuralları

### 2.1 Immutability (Değiştirilemezlik)

**Prensip:** Value object oluşturulduktan sonra değeri değişmemelidir.

**Doğru Implementasyon:**

```java
public final class Email {  // final class - extend edilemez

    private final String value;  // final field - değiştirilemez

    // Constructor
    public Email(String value) {
        this.value = validateAndNormalize(value);
    }

    // Getter - sadece okuma
    public String getValue() {
        return value;
    }

    // Setter YOK!
    // public void setValue(String value) { ... }  // YANLIŞ!

    // Değiştirmek istersen YENİ value object oluştur
    public Email withDomain(String newDomain) {
        String localPart = this.value.split("@")[0];
        return new Email(localPart + "@" + newDomain);
    }
}
```

**Collection Immutability:**

```java
public final class Participants {

    private final Set<UserId> userIds;  // Immutable set

    public Participants(Set<UserId> userIds) {
        // Defensive copy - dışarıdan gelen collection'ı kopyala
        this.userIds = Set.copyOf(userIds);
    }

    public Set<UserId> getUserIds() {
        // Defensive copy - dışarıya kopyasını ver
        return Set.copyOf(userIds);
    }

    // Yeni participant eklemek için YENİ value object döner
    public Participants add(UserId userId) {
        Set<UserId> newSet = new HashSet<>(this.userIds);
        newSet.add(userId);
        return new Participants(newSet);
    }
}
```

### 2.2 Value Equality

**Prensip:** İki value object tüm alanları eşitse eşittir.

**equals() ve hashCode() Override:**

```java
public final class FullName {

    private final String firstName;
    private final String lastName;

    public FullName(String firstName, String lastName) {
        this.firstName = validateName(firstName);
        this.lastName = validateName(lastName);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        FullName fullName = (FullName) o;
        return firstName.equals(fullName.firstName) &&
               lastName.equals(fullName.lastName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName);
    }
}

// Kullanım:
FullName name1 = new FullName("John", "Doe");
FullName name2 = new FullName("John", "Doe");

name1 == name2;  // false (reference equality)
name1.equals(name2);  // true (value equality)

// Set/Map'te kullanım:
Set<FullName> names = new HashSet<>();
names.add(name1);
names.contains(name2);  // true (equals + hashCode sayesinde)
```

**Record Kullanımı (Java 14+):**

```java
// Otomatik equals/hashCode/toString
public record Email(String value) {

    public Email {  // Compact constructor
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank");
        }
        if (!value.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        value = value.toLowerCase();  // Normalize
    }
}

// Kullanım:
Email email1 = new Email("TEST@EXAMPLE.COM");
Email email2 = new Email("test@example.com");
email1.equals(email2);  // true (normalize edildi)
```

### 2.3 Self-Validation

**Prensip:** Value object constructor'da validation yapmalıdır.

**Validation Pattern:**

```java
public final class Password {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 100;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");

    private final String value;

    public Password(String value) {
        this.value = validate(value);
    }

    private String validate(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidPasswordException("Password cannot be blank");
        }

        if (value.length() < MIN_LENGTH) {
            throw new InvalidPasswordException(
                "Password must be at least " + MIN_LENGTH + " characters"
            );
        }

        if (value.length() > MAX_LENGTH) {
            throw new InvalidPasswordException(
                "Password cannot exceed " + MAX_LENGTH + " characters"
            );
        }

        if (!UPPERCASE_PATTERN.matcher(value).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one uppercase letter"
            );
        }

        if (!LOWERCASE_PATTERN.matcher(value).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one lowercase letter"
            );
        }

        if (!DIGIT_PATTERN.matcher(value).matches()) {
            throw new InvalidPasswordException(
                "Password must contain at least one digit"
            );
        }

        return value;
    }

    // BCrypt hash
    public String hash() {
        return BCrypt.hashpw(this.value, BCrypt.gensalt(12));
    }

    public boolean matches(String hashedPassword) {
        return BCrypt.checkpw(this.value, hashedPassword);
    }
}
```

**Multi-Field Validation:**

```java
public final class DateRange {

    private final LocalDate startDate;
    private final LocalDate endDate;

    public DateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Dates cannot be null");
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        this.startDate = startDate;
        this.endDate = endDate;
    }

    public long getDays() {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }

    public boolean contains(LocalDate date) {
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    public boolean overlaps(DateRange other) {
        return !this.endDate.isBefore(other.startDate) &&
               !this.startDate.isAfter(other.endDate);
    }
}
```

### 2.4 Side-Effect-Free Functions

**Prensip:** Value object method'ları mevcut nesneyi değiştirmez, yeni nesne döner.

**Doğru Implementasyon:**

```java
public final class Money {

    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        this.amount = amount;
        this.currency = currency;
    }

    // YENİ Money objesi döner
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new CurrencyMismatchException();
        }
        return new Money(
            this.amount.add(other.amount),
            this.currency
        );
    }

    // YENİ Money objesi döner
    public Money subtract(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new CurrencyMismatchException();
        }
        BigDecimal newAmount = this.amount.subtract(other.amount);
        if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new NegativeAmountException();
        }
        return new Money(newAmount, this.currency);
    }

    // YENİ Money objesi döner
    public Money multiply(BigDecimal factor) {
        return new Money(
            this.amount.multiply(factor),
            this.currency
        );
    }
}

// Kullanım:
Money price = new Money(new BigDecimal("100"), Currency.TRY);
Money tax = new Money(new BigDecimal("18"), Currency.TRY);
Money total = price.add(tax);  // YENİ Money objesi

// price ve tax değişmedi (immutable)
System.out.println(price.getAmount());  // 100
System.out.println(tax.getAmount());    // 18
System.out.println(total.getAmount());  // 118
```

---

## 3. Meslektaş Value Object Katalog

### 3.1 Identity Context Value Objects

#### Email

**Amaç:** Email adresi validation ve normalization

**Validation Rules:**

- Null/blank olamaz
- RFC 5322 regex pattern
- Max 254 karakter
- Lowercase normalize

**Implementasyon:**

```java
public record Email(String value) {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    private static final int MAX_LENGTH = 254;

    public Email {
        if (value == null || value.isBlank()) {
            throw new InvalidEmailException("Email cannot be blank");
        }

        if (value.length() > MAX_LENGTH) {
            throw new InvalidEmailException("Email too long");
        }

        if (!EMAIL_PATTERN.matcher(value).matches()) {
            throw new InvalidEmailException("Invalid email format");
        }

        value = value.toLowerCase();  // Normalize
    }

    public String getDomain() {
        return value.split("@")[1];
    }

    public String getLocalPart() {
        return value.split("@")[0];
    }
}
```

**Database Mapping:**

```java
@Entity
public class User {
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email", unique = true))
    private Email email;
}
```

**Business Rules:**

- BR-ID-001: Email unique olmalı (database constraint)
- Lowercase storage (case-insensitive comparison)

---

#### Password

**Amaç:** Password validation ve BCrypt hashing

**Validation Rules:**

- Min 8 karakter
- Max 100 karakter
- En az 1 büyük harf
- En az 1 küçük harf
- En az 1 rakam

**Implementasyon:**

```java
public final class Password {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 100;

    private final String value;  // Plain text (sadece constructor'da)

    public Password(String value) {
        validate(value);
        this.value = value;
    }

    private void validate(String value) {
        if (value == null || value.isBlank()) {
            throw new InvalidPasswordException("Password cannot be blank");
        }

        if (value.length() < MIN_LENGTH) {
            throw new InvalidPasswordException(
                "Password must be at least " + MIN_LENGTH + " characters"
            );
        }

        if (value.length() > MAX_LENGTH) {
            throw new InvalidPasswordException("Password too long");
        }

        if (!value.matches(".*[A-Z].*")) {
            throw new InvalidPasswordException("Must contain uppercase letter");
        }

        if (!value.matches(".*[a-z].*")) {
            throw new InvalidPasswordException("Must contain lowercase letter");
        }

        if (!value.matches(".*[0-9].*")) {
            throw new InvalidPasswordException("Must contain digit");
        }
    }

    // BCrypt hash (strength = 12)
    public HashedPassword hash() {
        String hashed = BCrypt.hashpw(this.value, BCrypt.gensalt(12));
        return new HashedPassword(hashed);
    }
}

public record HashedPassword(String value) {

    public boolean matches(Password plainPassword) {
        return BCrypt.checkpw(plainPassword.getValue(), this.value);
    }
}
```

**Database Mapping:**

```java
@Entity
public class User {
    @Column(name = "password_hash")
    private String passwordHash;  // HashedPassword.value

    public void changePassword(Password newPassword) {
        this.passwordHash = newPassword.hash().value();
    }
}
```

**Business Rules:**

- BR-ID-002: Password güvenlik gereksinimleri
- BCrypt strength: 12 (2^12 = 4096 iterations)
- Plain password asla database'e yazılmaz

---

#### FullName

**Amaç:** Kullanıcı adı validation

**Validation Rules:**

- First name 2-50 karakter
- Last name 2-50 karakter
- Sadece harf, boşluk, Türkçe karakterler
- Trim ve capitalize

**Implementasyon:**

```java
public record FullName(String firstName, String lastName) {

    private static final int MIN_LENGTH = 2;
    private static final int MAX_LENGTH = 50;
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$"
    );

    public FullName {
        firstName = validateAndNormalize(firstName, "First name");
        lastName = validateAndNormalize(lastName, "Last name");
    }

    private String validateAndNormalize(String name, String fieldName) {
        if (name == null || name.isBlank()) {
            throw new InvalidNameException(fieldName + " cannot be blank");
        }

        name = name.trim();

        if (name.length() < MIN_LENGTH || name.length() > MAX_LENGTH) {
            throw new InvalidNameException(
                fieldName + " must be between " + MIN_LENGTH + " and " + MAX_LENGTH + " characters"
            );
        }

        if (!NAME_PATTERN.matcher(name).matches()) {
            throw new InvalidNameException(
                fieldName + " can only contain letters and spaces"
            );
        }

        // Capitalize (e.g., "john doe" → "John Doe")
        return Arrays.stream(name.split("\\s+"))
            .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
            .collect(Collectors.joining(" "));
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getInitials() {
        return firstName.substring(0, 1) + lastName.substring(0, 1);
    }
}
```

**Database Mapping:**

```java
@Entity
public class User {
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "firstName", column = @Column(name = "first_name")),
        @AttributeOverride(name = "lastName", column = @Column(name = "last_name"))
    })
    private FullName fullName;
}
```

---

#### Profession

**Amaç:** Meslek enum ve validation

**Allowed Values:**

- DOCTOR (Doktor)
- ENGINEER (Mühendis)
- LAWYER (Avukat)
- ARCHITECT (Mimar)
- TEACHER (Öğretmen)
- NURSE (Hemşire)

**Implementasyon:**

```java
public enum Profession {
    DOCTOR("Doktor"),
    ENGINEER("Mühendis"),
    LAWYER("Avukat"),
    ARCHITECT("Mimar"),
    TEACHER("Öğretmen"),
    NURSE("Hemşire");

    private final String displayName;

    Profession(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Profession fromString(String value) {
        for (Profession profession : values()) {
            if (profession.name().equalsIgnoreCase(value)) {
                return profession;
            }
        }
        throw new InvalidProfessionException("Unknown profession: " + value);
    }
}
```

**Database Mapping:**

```java
@Entity
public class User {
    @Enumerated(EnumType.STRING)  // STRING storage (not ORDINAL)
    @Column(name = "profession")
    private Profession profession;
}
```

**Business Rules:**

- BR-ID-004: Verified user'ın profession'ı değiştirilemez
- Feed filtering: Sadece aynı profession post'ları görür
- Messaging: Sadece aynı profession ile konuşabilir

---

#### PhoneNumber

**Amaç:** Türkiye telefon numarası validation

**Format:** +90 5XX XXX XX XX

**Implementasyon:**

```java
public record PhoneNumber(String value) {

    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^\\+905[0-9]{9}$"
    );

    public PhoneNumber {
        if (value == null || value.isBlank()) {
            throw new InvalidPhoneNumberException("Phone number cannot be blank");
        }

        // Normalize (remove spaces, dashes)
        value = value.replaceAll("[\\s-]", "");

        // Add +90 prefix if missing
        if (!value.startsWith("+")) {
            if (value.startsWith("0")) {
                value = "+9" + value;
            } else {
                value = "+90" + value;
            }
        }

        if (!PHONE_PATTERN.matcher(value).matches()) {
            throw new InvalidPhoneNumberException("Invalid Turkish phone number");
        }
    }

    public String getFormattedValue() {
        // +90 5XX XXX XX XX
        return String.format("+90 %s %s %s %s",
            value.substring(3, 6),
            value.substring(6, 9),
            value.substring(9, 11),
            value.substring(11, 13)
        );
    }
}
```

---

### 3.2 Verification Context Value Objects

#### Document

**Amaç:** Kimlik belgesi bilgileri

**Fields:**

- documentType (ID_CARD, DRIVER_LICENSE, PASSPORT)
- documentNumber
- issueDate
- expiryDate
- s3Url (AWS S3 storage)

**Implementasyon:**

```java
public record Document(
    DocumentType documentType,
    String documentNumber,
    LocalDate issueDate,
    LocalDate expiryDate,
    String s3Url
) {

    public Document {
        if (documentType == null) {
            throw new IllegalArgumentException("Document type is required");
        }

        if (documentNumber == null || documentNumber.isBlank()) {
            throw new IllegalArgumentException("Document number is required");
        }

        if (issueDate == null || expiryDate == null) {
            throw new IllegalArgumentException("Issue and expiry dates are required");
        }

        if (issueDate.isAfter(expiryDate)) {
            throw new IllegalArgumentException("Issue date must be before expiry date");
        }

        if (expiryDate.isBefore(LocalDate.now())) {
            throw new ExpiredDocumentException("Document has expired");
        }

        if (s3Url == null || s3Url.isBlank()) {
            throw new IllegalArgumentException("S3 URL is required");
        }
    }

    public boolean isExpired() {
        return expiryDate.isBefore(LocalDate.now());
    }

    public long getDaysUntilExpiry() {
        return ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }
}

public enum DocumentType {
    ID_CARD("Kimlik Kartı"),
    DRIVER_LICENSE("Ehliyet"),
    PASSPORT("Pasaport");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }
}
```

**Database Mapping:**

```java
@Entity
public class VerificationRequest {
    @ElementCollection
    @CollectionTable(name = "verification_documents")
    private List<Document> documents = new ArrayList<>();
}
```

**Business Rules:**

- BR-VER-001: ID document + selfie gerekli
- BR-VER-005: KVKK compliance - 7 gün içinde silinmeli
- Document expired ise verification reject

---

#### ConfidenceScore

**Amaç:** AI verification confidence (0-100)

**Calculation:**

- OCR: 25%
- Face Match: 30%
- Liveness: 25%
- Authenticity: 15%
- Data Validation: 5%

**Implementasyon:**

```java
public record ConfidenceScore(int value) {

    private static final int MIN_VALUE = 0;
    private static final int MAX_VALUE = 100;

    public ConfidenceScore {
        if (value < MIN_VALUE || value > MAX_VALUE) {
            throw new IllegalArgumentException(
                "Confidence score must be between " + MIN_VALUE + " and " + MAX_VALUE
            );
        }
    }

    public VerificationDecision getDecision() {
        if (value >= 85) {
            return VerificationDecision.AUTO_APPROVE;
        } else if (value >= 60) {
            return VerificationDecision.MANUAL_REVIEW;
        } else {
            return VerificationDecision.REJECT;
        }
    }

    public static ConfidenceScore calculate(
        int ocrScore,
        int faceMatchScore,
        int livenessScore,
        int authenticityScore,
        int dataValidationScore
    ) {
        int weighted = (int) (
            ocrScore * 0.25 +
            faceMatchScore * 0.30 +
            livenessScore * 0.25 +
            authenticityScore * 0.15 +
            dataValidationScore * 0.05
        );
        return new ConfidenceScore(weighted);
    }
}

public enum VerificationDecision {
    AUTO_APPROVE,
    MANUAL_REVIEW,
    REJECT
}
```

**Business Rules:**

- BR-VER-003: 85%+ → Auto-approve
- BR-VER-003: 60-85% → Manual review
- BR-VER-003: <60% → Reject

---

#### AIVerificationResult

**Amaç:** 6-stage AI pipeline sonuçları

**Implementasyon:**

```java
public record AIVerificationResult(
    OCRResult ocrResult,
    FaceMatchResult faceMatchResult,
    LivenessResult livenessResult,
    AuthenticityResult authenticityResult,
    DataValidationResult dataValidationResult,
    ConfidenceScore finalScore,
    Instant processedAt
) {

    public AIVerificationResult {
        if (ocrResult == null || faceMatchResult == null ||
            livenessResult == null || authenticityResult == null ||
            dataValidationResult == null || finalScore == null) {
            throw new IllegalArgumentException("All AI results are required");
        }

        if (processedAt == null) {
            processedAt = Instant.now();
        }
    }

    public boolean hasPassedAllStages() {
        return ocrResult.isPassed() &&
               faceMatchResult.isPassed() &&
               livenessResult.isPassed() &&
               authenticityResult.isPassed() &&
               dataValidationResult.isPassed();
    }

    public List<String> getFailureReasons() {
        List<String> reasons = new ArrayList<>();
        if (!ocrResult.isPassed()) reasons.add("OCR failed: " + ocrResult.reason());
        if (!faceMatchResult.isPassed()) reasons.add("Face match failed: " + faceMatchResult.reason());
        if (!livenessResult.isPassed()) reasons.add("Liveness failed: " + livenessResult.reason());
        if (!authenticityResult.isPassed()) reasons.add("Authenticity failed: " + authenticityResult.reason());
        if (!dataValidationResult.isPassed()) reasons.add("Data validation failed: " + dataValidationResult.reason());
        return reasons;
    }
}

public record OCRResult(boolean isPassed, int score, String extractedText, String reason) {}
public record FaceMatchResult(boolean isPassed, int score, double similarity, String reason) {}
public record LivenessResult(boolean isPassed, int score, String reason) {}
public record AuthenticityResult(boolean isPassed, int score, String reason) {}
public record DataValidationResult(boolean isPassed, int score, List<String> mismatches, String reason) {}
```

**Database Mapping:**

```java
@Entity
public class VerificationRequest {
    @Embedded
    @AttributeOverride(name = "finalScore.value", column = @Column(name = "confidence_score"))
    private AIVerificationResult aiResult;
}
```

---

### 3.3 Social Context Value Objects

#### PostContent

**Amaç:** Post içerik validation

**Validation Rules:**

- Max 2000 karakter
- HTML tag'leri strip edilir
- URL detection
- Mention detection (@username)

**Implementasyon:**

```java
public record PostContent(String value) {

    private static final int MAX_LENGTH = 2000;
    private static final Pattern URL_PATTERN = Pattern.compile(
        "https?://[\\w\\.-]+(\\.[a-z]{2,})?"
    );
    private static final Pattern MENTION_PATTERN = Pattern.compile("@(\\w+)");

    public PostContent {
        if (value == null || value.isBlank()) {
            throw new InvalidPostContentException("Content cannot be blank");
        }

        // Strip HTML tags
        value = value.replaceAll("<[^>]*>", "");
        value = value.trim();

        if (value.length() > MAX_LENGTH) {
            throw new InvalidPostContentException(
                "Content cannot exceed " + MAX_LENGTH + " characters"
            );
        }
    }

    public List<String> extractUrls() {
        List<String> urls = new ArrayList<>();
        Matcher matcher = URL_PATTERN.matcher(value);
        while (matcher.find()) {
            urls.add(matcher.group());
        }
        return urls;
    }

    public List<String> extractMentions() {
        List<String> mentions = new ArrayList<>();
        Matcher matcher = MENTION_PATTERN.matcher(value);
        while (matcher.find()) {
            mentions.add(matcher.group(1));  // Without @ symbol
        }
        return mentions;
    }

    public int getWordCount() {
        return value.split("\\s+").length;
    }
}
```

**Business Rules:**

- BR-SOC-004: Max 2000 karakter
- HTML injection prevention
- Spam detection (URL shorteners, excessive mentions)

---

#### PostImage

**Amaç:** Post resim bilgileri

**Implementasyon:**

```java
public record PostImage(
    String s3Url,
    String thumbnailUrl,
    int width,
    int height,
    long sizeInBytes
) {

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB
    private static final int MIN_WIDTH = 200;
    private static final int MIN_HEIGHT = 200;

    public PostImage {
        if (s3Url == null || s3Url.isBlank()) {
            throw new IllegalArgumentException("S3 URL is required");
        }

        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
            throw new IllegalArgumentException(
                "Image must be at least " + MIN_WIDTH + "x" + MIN_HEIGHT
            );
        }

        if (sizeInBytes > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException(
                "Image size cannot exceed " + (MAX_SIZE_BYTES / 1024 / 1024) + " MB"
            );
        }
    }

    public double getAspectRatio() {
        return (double) width / height;
    }

    public boolean isPortrait() {
        return height > width;
    }

    public boolean isLandscape() {
        return width > height;
    }
}
```

**Database Mapping:**

```java
@Entity
public class Post {
    @ElementCollection
    @CollectionTable(name = "post_images")
    private List<PostImage> images = new ArrayList<>();  // Max 4
}
```

**Business Rules:**

- BR-SOC-003: Max 4 image per post
- Max 5 MB per image
- Thumbnail auto-generated (AWS Lambda)

---

### 3.4 Messaging Context Value Objects

#### MessageContent

**Amaç:** Mesaj içerik validation

**Validation Rules:**

- Max 1000 karakter
- HTML strip
- Spam detection

**Implementasyon:**

```java
public record MessageContent(String value) {

    private static final int MAX_LENGTH = 1000;

    public MessageContent {
        if (value == null || value.isBlank()) {
            throw new InvalidMessageException("Message cannot be blank");
        }

        // Strip HTML
        value = value.replaceAll("<[^>]*>", "");
        value = value.trim();

        if (value.length() > MAX_LENGTH) {
            throw new InvalidMessageException(
                "Message cannot exceed " + MAX_LENGTH + " characters"
            );
        }
    }

    public boolean isSpam() {
        // Check for URL shorteners
        String lowerValue = value.toLowerCase();
        return lowerValue.contains("bit.ly") ||
               lowerValue.contains("tinyurl.com") ||
               lowerValue.matches(".*https?://[a-z0-9]{6,8}.*");  // Short random URLs
    }
}
```

**Business Rules:**

- BR-MSG-004: Max 1000 karakter
- Spam messages auto-detected ve reported

---

#### DeliveryStatus

**Amaç:** Mesaj delivery tracking

**States:**

- SENT: Server'a ulaştı
- DELIVERED: Alıcı client'a ulaştı
- READ: Alıcı okudu

**Implementasyon:**

```java
public record DeliveryStatus(
    DeliveryState state,
    Instant sentAt,
    Instant deliveredAt,
    Instant readAt
) {

    public DeliveryStatus {
        if (state == null) {
            throw new IllegalArgumentException("Delivery state is required");
        }

        if (sentAt == null) {
            throw new IllegalArgumentException("Sent timestamp is required");
        }

        // State validation
        if (state == DeliveryState.DELIVERED && deliveredAt == null) {
            throw new IllegalArgumentException("Delivered timestamp required for DELIVERED state");
        }

        if (state == DeliveryState.READ && (deliveredAt == null || readAt == null)) {
            throw new IllegalArgumentException("Delivered and read timestamps required for READ state");
        }

        // Chronological validation
        if (deliveredAt != null && deliveredAt.isBefore(sentAt)) {
            throw new IllegalArgumentException("Delivered time cannot be before sent time");
        }

        if (readAt != null && (readAt.isBefore(deliveredAt) || readAt.isBefore(sentAt))) {
            throw new IllegalArgumentException("Read time cannot be before delivered/sent time");
        }
    }

    public Duration getDeliveryDuration() {
        if (deliveredAt == null) return null;
        return Duration.between(sentAt, deliveredAt);
    }

    public Duration getReadDuration() {
        if (readAt == null) return null;
        return Duration.between(sentAt, readAt);
    }

    public static DeliveryStatus sent() {
        return new DeliveryStatus(DeliveryState.SENT, Instant.now(), null, null);
    }

    public DeliveryStatus markAsDelivered() {
        return new DeliveryStatus(DeliveryState.DELIVERED, sentAt, Instant.now(), null);
    }

    public DeliveryStatus markAsRead() {
        Instant now = Instant.now();
        Instant delivery = deliveredAt != null ? deliveredAt : now;
        return new DeliveryStatus(DeliveryState.READ, sentAt, delivery, now);
    }
}

public enum DeliveryState {
    SENT,
    DELIVERED,
    READ
}
```

**Business Rules:**

- BR-MSG-007: Sadece alıcı "read" mark edebilir
- Delivery semantics: SENT → DELIVERED → READ (chronological)
- WebSocket real-time delivery tracking

---

#### UnreadCount

**Amaç:** Okunmamış mesaj sayısı

**Implementasyon:**

```java
public record UnreadCount(int value) {

    public UnreadCount {
        if (value < 0) {
            throw new IllegalArgumentException("Unread count cannot be negative");
        }
    }

    public UnreadCount increment() {
        return new UnreadCount(value + 1);
    }

    public UnreadCount reset() {
        return new UnreadCount(0);
    }

    public boolean hasUnread() {
        return value > 0;
    }
}
```

**Database Mapping:**

```java
@Entity
public class Conversation {
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "participant1_unread"))
    private UnreadCount participant1UnreadCount;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "participant2_unread"))
    private UnreadCount participant2UnreadCount;
}
```

**Business Rules:**

- Cache'lenir (Redis)
- Real-time WebSocket update
- Badge notification trigger

---

### 3.5 Notification Context Value Objects

#### NotificationContent

**Amaç:** Notification mesaj şablonu

**Implementasyon:**

```java
public record NotificationContent(
    String title,
    String body,
    Map<String, String> data
) {

    private static final int MAX_TITLE_LENGTH = 100;
    private static final int MAX_BODY_LENGTH = 500;

    public NotificationContent {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (title.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("Title too long");
        }

        if (body != null && body.length() > MAX_BODY_LENGTH) {
            throw new IllegalArgumentException("Body too long");
        }

        if (data == null) {
            data = Map.of();
        } else {
            data = Map.copyOf(data);  // Immutable
        }
    }

    // Template method
    public static NotificationContent fromTemplate(
        NotificationType type,
        Map<String, String> placeholders
    ) {
        return switch (type) {
            case POST_LIKED -> new NotificationContent(
                "Yeni Beğeni",
                placeholders.get("actorName") + " gönderinizi beğendi",
                Map.of("postId", placeholders.get("postId"))
            );
            case COMMENT_ADDED -> new NotificationContent(
                "Yeni Yorum",
                placeholders.get("actorName") + " gönderinize yorum yaptı: " + placeholders.get("commentPreview"),
                Map.of("postId", placeholders.get("postId"), "commentId", placeholders.get("commentId"))
            );
            case MESSAGE_RECEIVED -> new NotificationContent(
                "Yeni Mesaj",
                placeholders.get("actorName") + ": " + placeholders.get("messagePreview"),
                Map.of("conversationId", placeholders.get("conversationId"))
            );
            // ... diğer tipler
        };
    }
}
```

---

#### UserSnapshot

**Amaç:** Notification'daki actor bilgisi (snapshot pattern)

**Implementasyon:**

```java
public record UserSnapshot(
    UserId userId,
    String fullName,
    Profession profession,
    String profileImageUrl
) {

    public UserSnapshot {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }

        if (profession == null) {
            throw new IllegalArgumentException("Profession is required");
        }
    }

    public static UserSnapshot from(User user) {
        return new UserSnapshot(
            user.getId(),
            user.getFullName().getFullName(),
            user.getProfession(),
            user.getProfileImageUrl()
        );
    }
}
```

**Database Mapping:**

```java
@Entity
public class Notification {
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "userId.value", column = @Column(name = "actor_id")),
        @AttributeOverride(name = "fullName", column = @Column(name = "actor_name")),
        @AttributeOverride(name = "profession", column = @Column(name = "actor_profession")),
        @AttributeOverride(name = "profileImageUrl", column = @Column(name = "actor_image_url"))
    })
    private UserSnapshot actor;
}
```

**Neden Snapshot?**

- User silindi/banned olsa bile notification korunur
- Historical record (o andaki user bilgisi)
- Performans (User aggregate load etmeden gösterilir)

---

### 3.6 Moderation Context Value Objects

#### ViolationHistory

**Amaç:** Kullanıcı ihlal geçmişi

**Implementasyon:**

```java
public record ViolationHistory(
    List<ViolationRecord> violations
) {

    public ViolationHistory {
        if (violations == null) {
            violations = List.of();
        } else {
            violations = List.copyOf(violations);  // Immutable
        }
    }

    public int getTotalViolationCount() {
        return violations.size();
    }

    public long getViolationCountInLast30Days() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        return violations.stream()
            .filter(v -> v.occurredAt().isAfter(thirtyDaysAgo))
            .count();
    }

    public SuspensionDuration getNextSuspensionDuration() {
        long recentCount = getViolationCountInLast30Days();

        if (recentCount == 1) return SuspensionDuration.ONE_DAY;
        if (recentCount == 2) return SuspensionDuration.SEVEN_DAYS;
        if (recentCount == 3) return SuspensionDuration.THIRTY_DAYS;
        return SuspensionDuration.PERMANENT;
    }
}

public record ViolationRecord(
    ViolationType type,
    String reason,
    Instant occurredAt
) {}

public enum ViolationType {
    SPAM,
    HARASSMENT,
    HATE_SPEECH,
    INAPPROPRIATE_CONTENT,
    IMPERSONATION
}

public enum SuspensionDuration {
    ONE_DAY(Duration.ofDays(1)),
    SEVEN_DAYS(Duration.ofDays(7)),
    THIRTY_DAYS(Duration.ofDays(30)),
    PERMANENT(null);

    private final Duration duration;

    SuspensionDuration(Duration duration) {
        this.duration = duration;
    }

    public Instant calculateEndDate() {
        if (this == PERMANENT) return null;
        return Instant.now().plus(duration);
    }
}
```

**Business Rules:**

- BR-MOD-003: Escalating bans (1d → 7d → 30d → permanent)
- Violation count son 30 gün içinde
- 4th violation → permanent ban

---

#### SpamScore

**Amaç:** Otomatik spam detection

**Indicators:**

- Emoji ratio
- URL shorteners
- Excessive caps
- Repeated characters

**Implementasyon:**

```java
public record SpamScore(int value) {

    private static final int SPAM_THRESHOLD = 70;

    public SpamScore {
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException("Spam score must be 0-100");
        }
    }

    public boolean isSpam() {
        return value >= SPAM_THRESHOLD;
    }

    public static SpamScore calculate(String content) {
        int score = 0;

        // Emoji ratio (>30% → +30 points)
        long emojiCount = content.codePoints()
            .filter(cp -> cp >= 0x1F600 && cp <= 0x1F64F)
            .count();
        double emojiRatio = (double) emojiCount / content.length();
        if (emojiRatio > 0.3) score += 30;

        // URL shorteners (+40 points)
        if (content.contains("bit.ly") || content.contains("tinyurl.com")) {
            score += 40;
        }

        // Excessive caps (>50% → +20 points)
        long capsCount = content.chars().filter(Character::isUpperCase).count();
        long letterCount = content.chars().filter(Character::isLetter).count();
        if (letterCount > 0 && (double) capsCount / letterCount > 0.5) {
            score += 20;
        }

        // Repeated characters (e.g., "!!!!!" → +10 points)
        if (content.matches(".*([!?.]){5,}.*")) {
            score += 10;
        }

        return new SpamScore(Math.min(score, 100));
    }
}
```

**Business Rules:**

- SpamScore ≥70 → Auto-hide content
- 3 spam content → User auto-suspended
- Spam keywords configurable (database)

---

## 4. Value Object JPA Mapping

### 4.1 @Embeddable (Single Value Object)

```java
@Embeddable
public class Email {
    private String value;

    protected Email() {}  // JPA requires no-arg constructor

    public Email(String value) {
        // validation...
        this.value = value;
    }
}

@Entity
public class User {
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email", unique = true))
    private Email email;
}
```

### 4.2 @ElementCollection (Collection of Value Objects)

```java
@Entity
public class Post {
    @ElementCollection
    @CollectionTable(
        name = "post_images",
        joinColumns = @JoinColumn(name = "post_id")
    )
    private List<PostImage> images = new ArrayList<>();
}
```

### 4.3 @Embedded with Multiple Fields

```java
@Embeddable
public class FullName {
    private String firstName;
    private String lastName;
}

@Entity
public class User {
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "firstName", column = @Column(name = "first_name")),
        @AttributeOverride(name = "lastName", column = @Column(name = "last_name"))
    })
    private FullName fullName;
}
```

### 4.4 @Convert (Custom Converter)

```java
@Converter
public class EmailConverter implements AttributeConverter<Email, String> {

    @Override
    public String convertToDatabaseColumn(Email email) {
        return email != null ? email.getValue() : null;
    }

    @Override
    public Email convertToEntityAttribute(String dbData) {
        return dbData != null ? new Email(dbData) : null;
    }
}

@Entity
public class User {
    @Convert(converter = EmailConverter.class)
    @Column(name = "email", unique = true)
    private Email email;
}
```

---

## 5. Value Object Testing

### 5.1 Validation Testing

```java
class EmailTest {

    @Test
    void should_create_valid_email() {
        Email email = new Email("test@example.com");
        assertThat(email.getValue()).isEqualTo("test@example.com");
    }

    @Test
    void should_normalize_to_lowercase() {
        Email email = new Email("TEST@EXAMPLE.COM");
        assertThat(email.getValue()).isEqualTo("test@example.com");
    }

    @Test
    void should_throw_exception_for_invalid_format() {
        assertThatThrownBy(() -> new Email("invalid-email"))
            .isInstanceOf(InvalidEmailException.class);
    }

    @Test
    void should_throw_exception_for_null() {
        assertThatThrownBy(() -> new Email(null))
            .isInstanceOf(InvalidEmailException.class);
    }
}
```

### 5.2 Equality Testing

```java
class FullNameTest {

    @Test
    void should_be_equal_when_values_are_same() {
        FullName name1 = new FullName("John", "Doe");
        FullName name2 = new FullName("John", "Doe");

        assertThat(name1).isEqualTo(name2);
        assertThat(name1.hashCode()).isEqualTo(name2.hashCode());
    }

    @Test
    void should_not_be_equal_when_values_differ() {
        FullName name1 = new FullName("John", "Doe");
        FullName name2 = new FullName("Jane", "Doe");

        assertThat(name1).isNotEqualTo(name2);
    }
}
```

### 5.3 Immutability Testing

```java
class MoneyTest {

    @Test
    void should_return_new_instance_when_adding() {
        Money price = new Money(new BigDecimal("100"), Currency.TRY);
        Money tax = new Money(new BigDecimal("18"), Currency.TRY);

        Money total = price.add(tax);

        // Original values unchanged
        assertThat(price.getAmount()).isEqualByComparingTo("100");
        assertThat(tax.getAmount()).isEqualByComparingTo("18");
        assertThat(total.getAmount()).isEqualByComparingTo("118");
    }
}
```

---

## 6. Value Object Anti-Patterns

### 6.1 Primitive Obsession

```
❌ Yanlış:
public void sendEmail(String email) {
    // email validation burada mı? service'te mi? controller'da mı?
}

✅ Doğru:
public void sendEmail(Email email) {
    // Email value object zaten validate edilmiş
}
```

### 6.2 Mutable Value Object

```
❌ Yanlış:
public class Email {
    private String value;

    public void setValue(String value) {  // Setter VAR - YANLIŞ!
        this.value = value;
    }
}

✅ Doğru:
public record Email(String value) {
    // Immutable - setter yok
}
```

### 6.3 Missing Validation

```
❌ Yanlış:
public record Email(String value) {
    // Validation YOK - YANLIŞ!
}

✅ Doğru:
public record Email(String value) {
    public Email {
        if (value == null || !value.matches("...")) {
            throw new InvalidEmailException();
        }
    }
}
```

---

## 7. Özet

### Value Object Prensipleri:

1. **Immutable:** Final fields, no setters
2. **Value Equality:** Override equals/hashCode (veya record kullan)
3. **Self-Validating:** Constructor'da validation
4. **Side-Effect-Free:** Method'lar yeni instance döner

### Meslektaş Value Object Summary:

- **25+ Value Object:** Email, Password, FullName, Profession, Document, ConfidenceScore, vb.
- **Type Safety:** Primitive obsession elimine edildi
- **Domain Modeling:** Her value object domain concept'ini temsil ediyor
- **Validation Encapsulation:** Business rules value object içinde

### Next Steps:

- **Domain Services:** 10-DOMAIN-SERVICES.md (Aggregate'e sığmayan logic)
- **Domain Events:** 11-DOMAIN-EVENTS.md (Event catalog + handlers)
- **Repositories:** 12-REPOSITORIES.md (Aggregate persistence)
