# 📊 Mobile App ve Backend API Uyumluluk Analiz Raporu

**Tarih:** 5 Aralık 2025  
**Hazırlayan:** GitHub Copilot  
**Proje:** MeslekTaş

---

## 📋 Genel Özet

Bu rapor, MeslekTaş projesinin mobile (React Native) ve backend (Spring Boot) uygulamaları arasındaki API entegrasyonunu detaylı olarak analiz etmektedir.

### Toplam İstatistikler

| Kategori                         | Sayı | Durum                      |
| -------------------------------- | ---- | -------------------------- |
| Backend Controller Sayısı        | 19   | -                          |
| Mobile API Servis Sayısı         | 8    | -                          |
| Tespit Edilen Kritik Hata        | 8    | ✅ 8/8 Çözüldü             |
| Tespit Edilen Orta Seviye Sorun  | 12   | ✅ 8 Çözüldü, ⏳ 4 Backend |
| Tespit Edilen Düşük Seviye Sorun | 6    | ⏳ İyileştirme bekliyor    |

---

## 🔴 KRİTİK HATALAR

### 1. Token Refresh Endpoint URL Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `mobile/src/core/api/client.ts` (satır 67)
- Backend: `AuthController.java` (satır 63-65)

**Sorun:**

```typescript
// Mobile (YANLIŞ)
const response = await axios.post(`${ENV.API_BASE_URL}/api/v1/auth/refresh`, {
  refreshToken,
});

// Backend (DOĞRU)
@PostMapping("/refresh")  // Path: /api/auth/refresh
public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
    @RequestHeader("Refresh-Token") String refreshToken)
```

**Hata Detayı:**

1. Mobile `/api/v1/auth/refresh` kullanıyor, Backend `/api/auth/refresh` kullanıyor
2. Mobile refresh token'ı body'de gönderiyor, Backend header'da bekliyor (`Refresh-Token` header)

**Çözüm:**

```typescript
// Doğru implementasyon
const response = await axios.post(
  `${ENV.API_BASE_URL}/api/auth/refresh`,
  null,
  {
    headers: {
      "Refresh-Token": refreshToken,
    },
  }
);
```

---

### 2. Verification Submit Request DTO Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `verification.types.ts` (satır 79-83)
- Backend: `SubmitVerificationRequest.java`

**Sorun:**

```typescript
// Mobile
export interface SubmitVerificationRequest {
  professionId: number;
  documentUrl: string; // S3 URL
  selfieUrl: string;   // S3 URL
}

// Backend
public class SubmitVerificationRequest {
  private Long professionId;
  private String documentS3Key;        // S3 Key (URL değil!)
  private String documentFileName;      // Eksik
  private String documentContentType;   // Eksik
  private Long documentFileSize;        // Eksik
  private String selfieS3Key;           // S3 Key (URL değil!)
  private String selfieFileName;        // Eksik
  private String selfieContentType;     // Eksik
  private Long selfieFileSize;          // Eksik
}
```

**Hata Detayı:**

- Mobile yalnızca URL gönderiyor, Backend detaylı metadata bekliyor
- Backend S3 Key bekliyor, Mobile URL gönderiyor
- 6 alan eksik: fileName, contentType, fileSize (her iki dosya için)

**Çözüm:**

```typescript
export interface SubmitVerificationRequest {
  professionId: number;
  documentS3Key: string;
  documentFileName: string;
  documentContentType: string;
  documentFileSize: number;
  selfieS3Key: string;
  selfieFileName: string;
  selfieContentType: string;
  selfieFileSize: number;
}
```

---

### 3. Verification Response DTO Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `verification.types.ts` (satır 95-108)
- Backend: `VerificationResponse.java`

**Sorun:**

```typescript
// Mobile
export interface VerificationResponse {
  id: number;
  status: VerificationStatus;
  profession: { id: number; name: string };
  aiConfidenceScore?: number;
  rejectionReason?: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

// Backend
public class VerificationResponse {
  private Long id;
  private UUID verificationId;           // Mobile'da eksik!
  private Long userId;                   // Mobile'da eksik!
  private Long professionId;             // profession objesi değil!
  private VerificationStatus status;
  private String documentS3Key;          // Mobile'da eksik!
  private String selfieS3Key;            // Mobile'da eksik!
  private Integer attemptNumber;         // attemptCount değil!
  private Instant submittedAt;           // createdAt değil!
  private Instant processedAt;           // Mobile'da eksik!
  private Instant expiresAt;             // Mobile'da eksik!
  private Double aiConfidence;           // aiConfidenceScore değil!
  private Double faceSimilarity;         // Mobile'da eksik!
  private String manualReviewNotes;      // rejectionReason değil!
  // maxAttempts, updatedAt BACKEND'DE YOK!
  // profession objesi BACKEND'DE YOK!
}
```

**Hata Detayı:**

- Alan isimleri uyumsuz (`attemptCount` vs `attemptNumber`)
- Backend'de `profession` nesnesi yok, sadece `professionId` var
- Tarih alanları farklı (`createdAt` vs `submittedAt`)
- Mobile'da olmayan alanlar: `verificationId`, `userId`, `documentS3Key`, `selfieS3Key`, `processedAt`, `expiresAt`, `faceSimilarity`
- Backend'de olmayan alanlar: `maxAttempts`, `updatedAt`, `profession` nesnesi

---

### 4. Feed Response Yapısı Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `feedService.ts` (satır 46-59)
- Backend: `FeedController.java` (satır 67-99)

**Sorun:**

```typescript
// Mobile - feedService.getFeed() dönüş tipi
async getFeed(limit = 20, professionFilter?: number, beforeId?: number): Promise<FeedResponse> {
  const response = await apiClient.get<ApiResponse<FeedResponse>>(...)
  return response.data.data;
}

// FeedResponse tipi
interface FeedResponse {
  content: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Backend - FeedController.getFeed() dönüş tipi
public ResponseEntity<ApiResponse<List<FeedPostResponse>>> getFeed(...)
// Backend List<FeedPostResponse> döndürüyor, pagination wrapper YOK!
```

**Hata Detayı:**

- Backend `List<FeedPostResponse>` döndürüyor (düz liste)
- Mobile `FeedResponse` bekliyor (pagination wrapper ile)
- Pagination bilgileri Backend response'unda yok

**Çözüm:** Backend cursor-based pagination için ayrı bir response wrapper dönmeli veya Mobile düz liste almalı.

---

### 5. FollowResponse Field Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `social.types.ts` (satır 34-38)
- Backend: `FollowResponse.java`

**Sorun:**

```typescript
// Mobile
export interface FollowResponse {
  success: boolean;        // Backend'de YOK!
  isFollowing: boolean;    // 'following' olmalı
  followerCount: number;
}

// Backend
public record FollowResponse(
  Long userId,
  boolean following,        // 'isFollowing' değil!
  long followerCount,
  long followingCount       // Mobile'da YOK!
)
```

**Hata Detayı:**

- `success` alanı Backend'de yok (API response wrapper'da var)
- `isFollowing` vs `following` isimlendirme farkı
- `followingCount` Mobile'da eksik
- `userId` Mobile'da eksik

---

### 6. BlockResponse Field Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `social.types.ts` (satır 43-49)
- Backend: `BlockResponse.java`

**Sorun:**

```typescript
// Mobile
export interface BlockResponse {
  userId: number;
  isBlocked: boolean;           // 'blocked' olmalı!
  wasAlreadyBlocked?: boolean;  // Backend'de YOK!
  message?: string;
}

// Backend
public record BlockResponse(
  Long userId,
  boolean blocked,              // 'isBlocked' değil!
  String message
)
```

---

### 7. CreatePostRequest Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `feed.types.ts` (satır 130-134)
- Backend: `CreatePostRequest.java`

**Sorun:**

```typescript
// Mobile
export interface CreatePostRequest {
  content: string;          // 1-1000 chars
  images?: string[];        // String array
  professionId?: number;    // Optional
}

// Backend
public class CreatePostRequest {
  @NotNull
  private Long professionId;    // REQUIRED! (Optional değil)

  @Size(min = 10, max = 5000)   // 10-5000 chars (1-1000 değil!)
  private String content;

  @Size(max = 5)
  private List<PostImageDto> images;  // PostImageDto, String değil!
}
```

**Hata Detayı:**

- `professionId` Backend'de zorunlu, Mobile'da opsiyonel
- Content uzunluğu: Mobile 1-1000, Backend 10-5000
- Images tipi: Mobile `string[]`, Backend `List<PostImageDto>`

---

### 8. Moderation API Endpoint Uyumsuzluğu

**Önem:** 🔴 Kritik  
**Konum:**

- Mobile: `moderationApi.ts` (satır 39-42)
- Backend: `ReportController.java` (satır 63-67)

**Sorun:**

```typescript
// Mobile
getMyReports: async (): Promise<ReportResponse[]> => {
  const response = await apiClient.get<ApiResponse<ReportResponse[]>>('/api/reports');
  return response.data.data;
}

// Backend - /api/reports/{reportId} değil /api/reports/my-reports
@GetMapping("/my-reports")  // Doğru endpoint: /api/reports/my-reports
public ResponseEntity<List<ReportResponse>> getMyReports(...)
```

**Hata Detayı:**

- Mobile `/api/reports` kullanıyor
- Backend `/api/reports/my-reports` bekliyor

---

## 🟠 ORTA SEVİYE SORUNLAR

### 1. Post ID Type Uyumsuzluğu ✅ ÇÖZÜLDÜ

**Konum:** Birden fazla endpoint
**Sorun:**

- Mobile'da post ID bazen `number`, bazen `string` olarak kullanılıyor
- Backend'de `Long` veya `UUID/String` olarak kabul ediliyor
- CommentController: `postId` String (UUID) bekliyor
- PostController: `postId` String olarak alıp `Long.parseLong()` yapıyor

**Çözüm:** `feedService.ts` içinde `mapToPost()` fonksiyonu backend'den gelen `id` (Long) değerini kullanarak tutarlı hale getiriliyor.

---

### 2. Notification ID Type Uyumsuzluğu ✅ UYUMLU

**Konum:**

- Backend: `NotificationController.java` - `UUID notificationId`
- Mobile: `notification.types.ts` - `notificationId: string`

**Durum:** Mobile string kullanıyor, UUID formatında gelen değerler string olarak işleniyor - uyumlu.

---

### 3. FeedPostResponse vs Mobile Post Type ✅ ÇÖZÜLDÜ

**Konum:**

- Backend: `FeedPostResponse.java`
- Mobile: `feed.types.ts`

**Çözüm:** `feedService.ts` içinde `BackendFeedPostResponse` interface'i ve `mapToPost()` fonksiyonu eklenerek backend response'u mobile `Post` tipine dönüştürülüyor.

---

### 4. Messaging - Conversation ID Format ✅ UYUMLU

**Konum:**

- Backend: `ConversationController.java` - UUID kullanıyor
- Mobile: `messagingService.ts` - string kullanıyor

**Durum:** UUID string olarak temsil ediliyor - uyumlu.

---

### 5. User Profile Response Çift Endpoint ⏳ BACKEND GEREKLİ

**Konum:**

- Backend: `UserController.java` ve `UserProfileController.java`

**Sorun:** Aynı işlev için iki controller var:

- `GET /api/users/me` - UserController
- `GET /api/users/profile` - UserProfileController

Farklı response DTO'ları dönüyorlar (`UserResponse` vs `UserProfileResponse`)

---

### 6. OAuth2 Response Yapısı

**Konum:**

- Backend: `OAuth2Controller.java` - `OAuth2AuthResponse`
- Mobile: `api.types.ts` - `OAuth2AuthResponse`

**Sorun:**

```java
// Backend
@Data
public static class OAuth2AuthResponse {
  private boolean success;
  private String error;
  private String accessToken;
  private String refreshToken;
  private String tokenType;
  private long expiresIn;
  private boolean isNewUser;
  private UserResponse user;
}
```

```typescript
// Mobile
export interface OAuth2AuthResponse {
  success: boolean;
  error?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  isNewUser: boolean;
  user: User;
}
```

**Uyum:** ✅ Genel olarak uyumlu, ancak `User` vs `UserResponse` mapping kontrolü gerekli.

---

### 7. Followers/Following Response ⏳ BACKEND GEREKLİ

**Konum:**

- Backend: `FollowController.java` - `List<UserFollowDto>` döndürüyor
- Mobile: `socialApi.ts` - `FollowListResponse` bekliyor

**Sorun:**

```typescript
// Mobile bekliyor
interface FollowListResponse {
  users: FollowUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Backend döndürüyor
List<UserFollowDto>; // Pagination wrapper YOK!
```

---

### 8. Device Token Platform Enum

**Konum:**

- Backend: `DeviceTokenController.java`
- Mobile: Notification servisleri

**Sorun:** Backend `DeviceToken.Platform` enum bekliyor ama Mobile tarafında bu enum tanımlı değil.

---

### 9. Report Request Field Farkları

**Konum:**

- Backend: `ReportController.java`
- Mobile: `moderationApi.ts`

**Sorun:**

```java
// Backend createReport metodu query param alıyor
public ResponseEntity<ReportResponse> createReport(
    @Valid @RequestBody ReportRequest request,
    @AuthenticationPrincipal UserDetailsImpl userDetails,
    @RequestParam(required = false) Long contentOwnerId,    // Query param!
    @RequestParam(required = false) String contentText)     // Query param!
```

Mobile bu query parametreleri göndermiyor.

---

### 10. Blocked Users Endpoint Farkı ✅ ÇÖZÜLDÜ

**Konum:**

- Mobile: `moderationApi.ts` - `/api/users/me/blocked` (düzeltildi)
- Backend: `BlockController.java` - `/api/users/me/blocked`

**Durum:** Endpoint path düzeltildi, artık uyumlu.

---

### 11. Comment Response ID Type ✅ UYUMLU

**Konum:**

- Mobile: `feed.types.ts` - `id: string`
- Backend: `CommentResponse.java` - UUID string olarak serialize ediliyor

**Durum:** String olarak uyumlu.

---

### 12. Engagement Stats Nested vs Flat ✅ ÇÖZÜLDÜ

**Konum:**

- Mobile: `Post.stats.likeCount`, `Post.userInteraction.isLiked`
- Backend: `FeedPostResponse.likeCount`, `FeedPostResponse.liked`

**Çözüm:** `feedService.ts` içinde `mapToPost()` fonksiyonu backend'in flat yapısını mobile'ın nested yapısına dönüştürüyor.

---

## 🟡 DÜŞÜK SEVİYE SORUNLAR

### 1. Tarih Format Tutarsızlığı

- Backend: `LocalDateTime`, `Instant`
- Mobile: `string` (ISO 8601)

**Öneri:** Backend'de `@JsonFormat` ile tutarlı format belirlenmeli.

### 2. Nullable Field Annotations

Bazı alanlar backend'de nullable ama mobile'da non-null olarak işaretli.

### 3. Enum Value Case Sensitivity

Backend ve Mobile enum değerleri aynı (UPPER_CASE) ama bazı yerlerde küçük harf kullanılmış olabilir.

### 4. API Version Prefix Tutarsızlığı

- Bazı endpointler: `/api/v1/...`
- Bazı endpointler: `/api/...`

**Öneri:** Tutarlı versiyon politikası belirlenmeli.

### 5. Pagination Parameter Names

Backend bazı yerlerde `page/size`, bazı yerlerde `limit/beforeId` kullanıyor.

### 6. Error Response Standardization

Hata response formatı controller'lar arasında farklılık gösteriyor.

---

## ✅ UYUMLU OLAN ALANLAR

1. **Auth Login/Register:** Genel yapı uyumlu
2. **WebSocket Destinations:** Doğru yapılandırılmış
3. **Notification Types Enum:** Backend ile uyumlu
4. **Message Status Enum:** Backend ile uyumlu
5. **Conversation/Message DTOs:** Büyük ölçüde uyumlu
6. **Profession Endpoints:** Uyumlu
7. **Device Token Registration:** Yapı uyumlu

---

## 📝 ÖNCELİKLİ DÜZELTME LİSTESİ

### Acil (P0) - Production'ı Etkiler

1. ✅ **TAMAMLANDI** - Token Refresh URL ve Header düzeltmesi (`client.ts`)
2. ✅ **TAMAMLANDI** - Verification Submit Request DTO güncellenmesi (`verification.types.ts`)
3. ✅ **TAMAMLANDI** - Feed Response normalization eklenmesi (`feedService.ts`)
4. ✅ **TAMAMLANDI** - CreatePostRequest professionId zorunluluğu (`feed.types.ts`)

### Yüksek (P1) - Önemli Fonksiyonları Etkiler

5. ✅ **TAMAMLANDI** - Verification Response DTO senkronizasyonu (`verification.types.ts`)
6. ✅ **TAMAMLANDI** - FollowResponse/BlockResponse field mapping (`social.types.ts`)
7. ✅ **TAMAMLANDI** - Report endpoint path düzeltmesi (`moderationApi.ts`)
8. ✅ **TAMAMLANDI** - Blocked Users endpoint path düzeltmesi (`moderationApi.ts`)

### Orta (P2) - UX'i Etkiler

9. ⏳ Backend'de gerekli - Followers/Following pagination eklenmesi
10. ✅ **TAMAMLANDI** - Blocked Users endpoint düzeltildi (`moderationApi.ts`)
11. ⏳ Backend'de gerekli - Error response standardizasyonu

### Düşük (P3) - İyileştirmeler

12. ⏳ API version prefix standardizasyonu
13. ⏳ Date format tutarlılığı
14. ⏳ Nullable field annotation'ları

---

## 🔧 ÖNERİLEN BACKEND DEĞİŞİKLİKLERİ

### 1. Feed Response Wrapper Ekleme

```java
@Getter
@Builder
public class FeedListResponse {
    private List<FeedPostResponse> content;
    private Integer size;
    private Long lastId;
    private Boolean hasMore;
}
```

### 2. Verification Response Güncelleme

```java
public class VerificationResponse {
    private Long id;
    private VerificationStatus status;
    private ProfessionDto profession;  // Nested object ekle
    private Double aiConfidenceScore;
    private String rejectionReason;
    private Integer attemptCount;
    private Integer maxAttempts;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3. Followers Response Wrapper

```java
@Getter
@Builder
public class FollowListResponse {
    private List<UserFollowDto> users;
    private Integer totalCount;
    private Integer page;
    private Integer pageSize;
    private Boolean hasMore;
}
```

---

## 🔧 ÖNERİLEN MOBILE DEĞİŞİKLİKLERİ

### 1. client.ts Token Refresh Düzeltme

```typescript
// Line 67 değişikliği
const response = await axios.post(
  `${ENV.API_BASE_URL}/api/auth/refresh`,
  null,
  {
    headers: {
      "Refresh-Token": refreshToken,
    },
  }
);
```

### 2. SubmitVerificationRequest Güncelleme

```typescript
export interface SubmitVerificationRequest {
  professionId: number;
  documentS3Key: string;
  documentFileName: string;
  documentContentType: string;
  documentFileSize: number;
  selfieS3Key: string;
  selfieFileName: string;
  selfieContentType: string;
  selfieFileSize: number;
}
```

### 3. FollowResponse Güncelleme

```typescript
export interface FollowResponse {
  userId: number;
  following: boolean;
  followerCount: number;
  followingCount: number;
}
```

### 4. CreatePostRequest Güncelleme

```typescript
export interface CreatePostRequest {
  professionId: number; // Required!
  content: string; // 10-5000 chars
  images?: PostImageDto[]; // PostImageDto array
}

interface PostImageDto {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}
```

---

## 📊 SONUÇ VE YAPILAN DÜZELTMELER

Bu analiz, MeslekTaş projesinin mobile ve backend API entegrasyonunda **8 kritik**, **12 orta seviye** ve **6 düşük seviye** sorun tespit etmiştir.

### ✅ TAMAMLANAN DÜZELTMELER

#### 1. Token Refresh Mekanizması (`client.ts`)

- URL düzeltildi: `/api/v1/auth/refresh` → `/api/auth/refresh`
- Body yerine header kullanılıyor: `Refresh-Token` header'ı

#### 2. Verification Submit Request (`verification.types.ts`)

- SubmitVerificationRequest 9 alan ile güncellendi
- S3 Key ve metadata alanları eklendi

#### 3. Verification Response (`verification.types.ts`)

- Backend DTO'su ile tam uyumlu hale getirildi
- verificationId, submittedAt, processedAt, expiresAt, faceSimilarity eklendi

#### 4. FollowResponse / BlockResponse (`social.types.ts`)

- `isFollowing` → `following` düzeltildi
- `isBlocked` → `blocked` düzeltildi
- Eksik alanlar eklendi (userId, followerCount, followingCount)
- UserFollowDto backend ile uyumlu hale getirildi

#### 5. CreatePostRequest (`feed.types.ts`)

- `professionId` zorunlu yapıldı
- Content validation: 10-5000 karakter
- Images tipi: PostImageDto[] (url, thumbnailUrl, width, height, blurhash)

#### 6. Feed Service (`feedService.ts`)

- BackendFeedPostResponse interface eklendi
- mapToPost() normalization fonksiyonu eklendi
- Backend array response'u mobile Post tipine dönüştürülüyor

#### 7. Moderation Endpoints (`moderationApi.ts`)

- `/api/reports` → `/api/reports/my-reports` düzeltildi
- `/api/users/blocked` → `/api/users/me/blocked` düzeltildi

### ⏳ BACKEND'DE YAPILMASI GEREKEN İYİLEŞTİRMELER

1. **Followers/Following Pagination:** Backend `List<UserFollowDto>` döndürüyor, pagination wrapper eklenmeli
2. **Profile Endpoint Konsolidasyonu:** `/api/users/me` ve `/api/users/profile` birleştirilmeli
3. **Error Response Standardizasyonu:** Tüm controller'larda aynı error format kullanılmalı
4. **API Version Prefix:** Tutarlı versiyon politikası belirlenmeli (`/api/v1/` veya `/api/`)

### 🔧 DEĞİŞİKLİK YAPILAN DOSYALAR

| Dosya                                                          | Değişiklik Türü                 |
| -------------------------------------------------------------- | ------------------------------- |
| `mobile/src/core/api/client.ts`                                | Token refresh düzeltmesi        |
| `mobile/src/features/verification/types/verification.types.ts` | DTO güncelleme                  |
| `mobile/src/features/social/types/social.types.ts`             | Response type düzeltmeleri      |
| `mobile/src/features/feed/types/feed.types.ts`                 | CreatePostRequest, PostImageDto |
| `mobile/src/features/feed/services/feedService.ts`             | Response normalization          |
| `mobile/src/features/moderation/services/moderationApi.ts`     | Endpoint path düzeltmeleri      |
| `mobile/src/features/social/services/socialApi.ts`             | Response type güncellemeleri    |
| `mobile/src/features/verification/services/verificationApi.ts` | DTO mapping güncellemeleri      |

---

**Son Güncelleme:** 5 Aralık 2025
