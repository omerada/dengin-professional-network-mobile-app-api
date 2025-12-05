# 🔍 Mobile App - Backend API Analiz Raporu

**Rapor Tarihi:** 5 Aralık 2025  
**Hazırlayan:** API Analiz Ekibi  
**Durum:** Kritik Uyumsuzluklar Tespit Edildi

---

## 📊 Genel Özet

Bu rapor, mobile uygulama ile backend arasındaki API entegrasyonunu kapsamlı olarak analiz etmektedir. Tespit edilen hatalar, eksiklikler ve uyumsuzluklar aşağıda kategorize edilmiştir.

### Durum Tablosu

| Kategori              | Durum           | Kritik Hata | Orta Hata | Uyarı |
| --------------------- | --------------- | ----------- | --------- | ----- |
| Authentication        | ⚠️ Kısmi Uyumlu | 1           | 2         | 1     |
| User/Profile          | ✅ Uyumlu       | 0           | 1         | 2     |
| Verification          | ✅ Uyumlu       | 0           | 0         | 0     |
| Feed/Posts            | ⚠️ Kısmi Uyumlu | 1           | 3         | 2     |
| Comments              | ✅ Uyumlu       | 0           | 1         | 1     |
| Messaging             | ✅ Uyumlu       | 0           | 1         | 1     |
| Notifications         | ✅ Uyumlu       | 0           | 1         | 2     |
| Social (Follow/Block) | ✅ Uyumlu       | 0           | 0         | 1     |

**Toplam:** 2 Kritik, 9 Orta, 10 Uyarı

> 🎉 **İyileştirme (5 Aralık 2025):** 4 kritik hata düzeltildi! (6 → 2 kritik)

---

## 🚨 KRİTİK HATALAR

### 1. API Version Prefix Uyumsuzluğu

**Dosya:** `docs/08-API-SPECIFICATIONS.md` vs `mobile/src/core/api/endpoints.ts` vs Backend Controllers

| Kaynak             | Endpoint Format      |
| ------------------ | -------------------- |
| API Spec Docs      | `/api/v1/auth/login` |
| Mobile App         | `/api/auth/login`    |
| Backend Controller | `/api/auth/login`    |

**Sorun:** API spesifikasyon dokümanı `/api/v1/` prefix kullanırken, hem backend hem de mobile `/api/` kullanıyor. Doküman güncelliğini kaybetmiş.

**Etki:** Doküman takip eden geliştiriciler yanlış endpoint kullanabilir.

**Çözüm:** `docs/08-API-SPECIFICATIONS.md` dosyasındaki tüm endpoint'leri `/api/v1/` yerine `/api/` olarak güncelleyin.

---

### 2. ~~Chat API Endpoint Uyumsuzluğu (Kritik)~~ ✅ DÜZELTİLDİ

**API Spec (08-API-SPECIFICATIONS.md):**

```
GET /api/v1/chat/rooms
GET /api/v1/chat/rooms/{roomId}/messages
POST /api/v1/chat/rooms/{roomId}/messages
```

**Backend (ConversationController.java):**

```
GET /api/conversations
GET /api/conversations/{conversationId}/messages
POST /api/messages
```

**Mobile (endpoints.ts) - DÜZELTİLDİ:**

```typescript
CONVERSATIONS: '/api/conversations',
MESSAGES: (conversationId) => `/api/conversations/${conversationId}/messages`,
SEND_MESSAGE: '/api/messages',  // ✅ Düzeltildi!
```

**Durum:** ✅ DÜZELTİLDİ (5 Aralık 2025)

---

### 3. ~~Verification API - Document URL vs S3 Key Uyumsuzluğu (Kritik)~~ ✅ DÜZELTİLDİ

**Mobile (verificationApi.ts) yorumlar:**

```typescript
// Backend beklentisi (SubmitVerificationRequest.java):
// - documentS3Key: String (zorunlu)
// - selfieS3Key: String (zorunlu)
// + metadata fields...
```

**Mobile Shared Types (api.types.ts) - DÜZELTİLDİ ✅:**

```typescript
export interface SubmitVerificationRequest {
  professionId: number;
  documentS3Key: string; // ✅ Düzeltildi
  documentFileName: string; // ✅ Eklendi
  documentContentType: string; // ✅ Eklendi
  documentFileSize: number; // ✅ Eklendi
  selfieS3Key: string; // ✅ Düzeltildi
  selfieFileName: string; // ✅ Eklendi
  selfieContentType: string; // ✅ Eklendi
  selfieFileSize: number; // ✅ Eklendi
}
```

**Durum:** ✅ DÜZELTİLDİ (5 Aralık 2025)

---

### 4. Feed API Response Format Uyumsuzluğu (Kritik)

**API Spec (08-API-SPECIFICATIONS.md):**

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {...}
  }
}
```

**Backend FeedController Response:**

```java
PagedResponse<FeedPostResponse> // Wrapped in ApiResponse
// Returns: { content: [...], hasNext, size, lastId }
```

**Mobile feedService.ts:**

```typescript
// Backend artık PagedResponse döndürüyor
interface BackendPagedFeedResponse {
  content: BackendFeedPostResponse[];
  hasNext: boolean;
  lastId?: number;
}
```

**Sorun:**

- API spec `posts` alanı beklerken, backend `content` döndürüyor
- API spec page-based pagination, backend cursor-based pagination kullanıyor

**Etki:** API spec dokümanı güncel değil, yeni geliştiriciler için yanıltıcı.

---

### 5. ~~Post Create - professionId Zorunluluğu (Kritik)~~ ✅ DÜZELTİLDİ

**Backend CreatePostRequest.java:**

```java
@NotNull(message = "Profession ID is required")
private Long professionId;
```

**Mobile CreatePostRequest (feed.types.ts):**

```typescript
export interface CreatePostRequest {
  professionId: number; // ✅ Zorunlu
  content: string;
  images?: PostImageDto[];
}
```

**Mobile Shared Types (api.types.ts) - DÜZELTİLDİ ✅:**

```typescript
export interface CreatePostRequest {
  professionId: number; // ✅ Eklendi
  content: string;
  images?: PostImageDto[]; // ✅ Düzeltildi
}
```

**Durum:** ✅ DÜZELTİLDİ (5 Aralık 2025)

---

### 6. ~~Messaging - Delete Message Endpoint Uyumsuzluğu (Kritik)~~ ✅ DÜZELTİLDİ

**Mobile (messagingService.ts):**

```typescript
async deleteMessage(conversationId: string, messageId: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(
    API_ENDPOINTS.MESSAGING.DELETE_MESSAGE(conversationId, messageId)  // ✅ Sabit kullanılıyor
  );
}
```

**Backend (ConversationController.java):**

```java
@DeleteMapping("/conversations/{conversationId}/messages/{messageId}")
public ResponseEntity<ApiResponse<Void>> deleteMessage(...)
```

**Durum:** ✅ Uyumlu

**endpoints.ts - DÜZELTİLDİ ✅:**

```typescript
MESSAGING: {
  DELETE_MESSAGE: (conversationId: string | number, messageId: string) =>
    `/api/conversations/${conversationId}/messages/${messageId}`,  // ✅ Eklendi
}
```

**Durum:** ✅ DÜZELTİLDİ (5 Aralık 2025)

---

## ⚠️ ORTA SEVİYE HATALAR

### 1. UserController - Update Profile HTTP Method

**Backend:**

```java
@PutMapping("/me")  // PUT method
public ResponseEntity<ApiResponse<UserResponse>> updateProfile(...)
```

**API Spec:**

```
PATCH /api/v1/users/me  // PATCH method
```

**Mobile:**

```typescript
updateProfile: async (data: UpdateProfileRequest): Promise<MyProfileResponse> => {
  const response = await apiClient.put<ApiResponse<MyProfileResponse>>(  // PUT kullanıyor ✅
    API_ENDPOINTS.USER.UPDATE_PROFILE,
    data,
  );
```

**Durum:** Mobile ve backend uyumlu (PUT), ancak API spec PATCH diyor.

---

### 2. Notification - Mark as Read Endpoint

**Backend (NotificationController.java):**

```java
@PostMapping("/{notificationId}/read")  // POST method
```

**Mobile (endpoints.ts):**

```typescript
MARK_READ: (id: string | number) => `/api/notifications/${id}/read`,
```

**API Spec:**

```
PATCH /api/v1/notifications/{notificationId}/read  // PATCH method
```

**Sorun:** Backend POST kullanırken, API spec PATCH diyor.

---

### 3. Mark All Notifications as Read

**Backend:**

```java
@PostMapping("/mark-as-read")
```

**Mobile (endpoints.ts):**

```typescript
MARK_ALL_READ: '/api/notifications/mark-as-read',
```

**API Spec:**

```
POST /api/v1/notifications/read-all
```

**Sorun:** Endpoint isimleri farklı: `mark-as-read` vs `read-all`

---

### 4. Block User - Request Body

**Backend (BlockController.java):**

```java
public ResponseEntity<ApiResponse<BlockResponse>> blockUser(
    @PathVariable Long userId,
    @Valid @RequestBody(required = false) BlockRequest request,  // Optional body
    ...)
```

**Mobile (socialApi.ts):**

```typescript
block: async (userId: number): Promise<BlockResponse> => {
  const response = await apiClient.post<ApiResponse<BlockResponse>>(
    API_ENDPOINTS.SOCIAL.BLOCK(userId),
    // ❌ Body gönderilmiyor, reason eksik
  );
```

**Sorun:** Backend optional `reason` parametresi bekliyor, mobile göndermek istemiyorsa sorun yok ama kullanıcıya sebep sorma özelliği eklenmek istendiğinde hatırlanmalı.

---

### 5. OAuth2 Response Format

**Backend (OAuth2Controller.java):**

```java
return ResponseEntity.ok(OAuth2AuthResponse.from(result));
// OAuth2AuthResponse fields: success, error, accessToken, refreshToken, expiresIn, isNewUser, user
```

**Mobile (api.types.ts):**

```typescript
export interface OAuth2AuthResponse {
  success: boolean;
  error?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer"; // ❌ Backend'de tokenType yok
  expiresIn: number;
  isNewUser: boolean;
  user: User;
}
```

**Sorun:** Mobile `tokenType` bekliyor, backend göndermiyor olabilir.

---

### 6. Comment - PostId Format

**Backend (CommentController.java):**

```java
@PathVariable String postId  // String (UUID)
PostId.of(UUID.fromString(postId))
```

**Mobile (feedService.ts):**

```typescript
async getComments(postId: number, page = 0, size = 20)  // ❌ number
```

**Sorun:** Backend UUID string beklerken, mobile number gönderiyor.

**Çözüm:** Mobile'da postId tipini `string | number` yapın ve string olarak gönderin.

---

### 7. Conversation/Message ID Format

**Backend:** UUID kullanıyor

```java
@PathVariable UUID conversationId
@PathVariable UUID messageId
```

**Mobile:** string kullanıyor (sorun yok)

```typescript
conversationId: string;
messageId: string;
```

---

### 8. Register Response Uyumsuzluğu

**Backend (AuthController.java):**

```java
return ResponseEntity
    .status(HttpStatus.CREATED)
    .body(ApiResponse.success("User registered successfully", user));
// user: UserResponse
```

**API Spec:**

```json
{
  "user": {...},
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 86400
  }
}
```

**Mobile (api.types.ts):**

```typescript
export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  createdAt: string;
  // ❌ Tokens yok
}
```

**Sorun:** API spec register sonrası token döndürüyor, backend sadece user dönüyor. Kullanıcı register sonrası tekrar login mi yapmalı?

---

### 9. Feed - Dislike Endpoint Eksik

**API Spec:**

```
POST /api/v1/posts/{postId}/dislike
```

**Backend PostController:** Dislike endpoint yok!

**Mobile:** Dislike tanımlı değil.

**Sorun:** Spec'te olan dislike özelliği implemente edilmemiş.

---

### 10. Save/Unsave Post Endpoint

**Mobile (endpoints.ts):**

```typescript
SAVE_POST: (id) => `/api/posts/${id}/save`,
UNSAVE_POST: (id) => `/api/posts/${id}/save`,
```

**Backend:** Save/Unsave endpoint'leri PostController'da yok!

**Sorun:** Mobile'da tanımlı endpoint'ler backend'de implemente edilmemiş.

---

### 11. User Search Endpoint

**Mobile (endpoints.ts):**

```typescript
SEARCH: '/api/users/search',
```

**Backend UserController:** Search endpoint yok!

---

## ℹ️ UYARILAR

### 1. Response Wrapper Tutarsızlığı

Backend bazı endpoint'lerde `ApiResponse<T>` wrapper kullanırken, bazılarında doğrudan response dönüyor.

**Wrapper kullananlar:**

- AuthController, UserController, PostController, FeedController, FollowController, BlockController

**Doğrudan dönenler (bazı endpoint'ler):**

- VerificationController (kısmen)
- NotificationController (kısmen)

**Öneri:** Tüm endpoint'ler tutarlı olarak `ApiResponse<T>` dönsün.

---

### 2. Date Format

**Backend:** `LocalDateTime` → ISO 8601 format
**Mobile:** `string` olarak parse ediliyor

**Öneri:** Zaman dilimi (timezone) yönetimi için açık standart belirleyin (UTC önerilir).

---

### 3. WebSocket Destinations

**Mobile (endpoints.ts):**

```typescript
WS_DESTINATIONS = {
  ENDPOINT: '/ws',
  ENDPOINT_RAW: '/ws-raw',
  SUBSCRIBE: {
    MESSAGES: '/queue/messages',
    ...
  }
}
```

**API Spec:**

```
URL: wss://api.meslektas.com/ws
Auth: JWT in query param ?token=<JWT>
```

**Not:** WebSocket auth mekanizması belirtilmiş ama mobile'da implementasyon detayları görünmüyor. Ayrı modülde olabilir.

---

### 4. Rate Limiting Headers

**API Spec:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1638360000
```

**Mobile:** Rate limit header'larını handle eden kod görünmüyor.

**Öneri:** Rate limit exceeded durumunda kullanıcıya bilgi gösterin.

---

### 5. Profession Endpoint Eksik Tanım

**Mobile (endpoints.ts):**

```typescript
PROFESSIONS: {
  LIST: '/api/professions',
  SEARCH: '/api/professions/search',
  BY_CATEGORY: (category) => `/api/professions/category/${category}`,
  BY_ID: (id) => `/api/professions/${id}`,
}
```

**Backend (ProfessionController.java) ekstra endpoint'ler:**

```java
@GetMapping("/verification-required")  // ❌ Mobile'da yok
@GetMapping("/stats")                   // ❌ Mobile'da yok
```

---

### 6. Blocked Users List Endpoint

**Backend:**

```java
@GetMapping("/me/blocked")  // GET /api/users/me/blocked
```

**Mobile (endpoints.ts):** Bu endpoint tanımlı değil!

---

### 7. Password Reset Token Field İsmi

**Backend (PasswordResetConfirmRequest):**

```java
String resetToken  // "resetToken"
```

**Mobile (authApi.ts):**

```typescript
await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
  resetToken, // ✅ Doğru
  newPassword,
});
```

**API Spec:**

```json
{
  "token": "...", // ❌ "token" olarak belirtilmiş
  "password": "..."
}
```

---

### 8. Admin Endpoints

**Backend'de mevcut:**

- `POST /api/admin/verifications/{id}/approve`
- `POST /api/admin/verifications/{id}/reject`
- `GET /api/admin/verifications/pending`

**Mobile:** Admin endpoint'leri tanımlı değil (muhtemelen ayrı admin paneli için).

---

### 9. Device Token Platform Enum

**Backend:**

```java
public enum Platform {
    IOS, ANDROID, WEB
}
```

**Mobile:** Platform enum kontrolü yapılıyor mu kontrol edilmeli.

---

### 10. Comment Reply (parentCommentId)

**API Spec:**

```json
{
  "content": "...",
  "parentCommentId": null // Optional for replies
}
```

**Backend (AddCommentRequest):**

```java
// parentCommentId field görünmüyor
```

**Sorun:** Reply özelliği spec'te var ama backend'de implemente edilmemiş olabilir.

---

## ✅ UYUMLU ALANLAR

Aşağıdaki alanlar backend ve mobile arasında tam uyumlu:

1. **Login/Logout Flow** - Endpoint ve request/response uyumlu
2. **Refresh Token** - Header'da Refresh-Token kullanımı uyumlu
3. **Password Reset Flow** - Endpoint ve akış uyumlu
4. **Change Password** - Endpoint uyumlu
5. **Get Current User** - `/api/users/me` uyumlu
6. **Get User by ID** - `/api/users/{id}` uyumlu
7. **Avatar Upload** - Multipart form-data uyumlu
8. **Follow/Unfollow** - Endpoint ve response uyumlu
9. **Block/Unblock** - Endpoint uyumlu
10. **Like/Unlike Post** - Endpoint uyumlu
11. **Comment CRUD** - Endpoint'ler uyumlu
12. **Notification List/Read** - Endpoint'ler çoğunlukla uyumlu

---

## 🔧 ÖNCELİKLİ ÇÖZÜM PLANI

### ✅ Tamamlanan Düzeltmeler (5 Aralık 2025)

| #   | Hata                        | Çözüm                                     | Dosya              |
| --- | --------------------------- | ----------------------------------------- | ------------------ |
| 1   | ~~Chat API endpoint~~       | ✅ SEND_MESSAGE → `/api/messages`         | `endpoints.ts`     |
| 2   | ~~Verification request~~    | ✅ S3Key + metadata formatına güncellendi | `api.types.ts`     |
| 3   | ~~CreatePostRequest~~       | ✅ professionId + PostImageDto eklendi    | `api.types.ts`     |
| 4   | ~~Delete message endpoint~~ | ✅ DELETE_MESSAGE eklendi                 | `endpoints.ts`     |
| 5   | ~~Blocked users endpoint~~  | ✅ BLOCKED_USERS, BLOCK_STATUS eklendi    | `endpoints.ts`     |
| 6   | ~~Profession endpoints~~    | ✅ professionApi.ts oluşturuldu           | `professionApi.ts` |
| 7   | ~~Notification endpoints~~  | ✅ BY_ID, UNREAD_COUNT eklendi            | `endpoints.ts`     |
| 8   | ~~Hardcoded endpoints~~     | ✅ Tüm servisler API_ENDPOINTS kullanıyor | `*Service.ts`      |

### 🟡 Orta Öncelik (Devam Eden)

| #   | Hata                    | Çözüm                    | Sorumlu | Dosya                      |
| --- | ----------------------- | ------------------------ | ------- | -------------------------- |
| 1   | Comment postId tipi     | number → string          | Mobile  | `feedService.ts`           |
| 2   | Save/Unsave post        | Backend'e implemente et  | Backend | `PostController.java`      |
| 3   | User search             | Backend'e implemente et  | Backend | `UserController.java`      |
| 4   | API Spec version prefix | v1 → api olarak güncelle | Docs    | `08-API-SPECIFICATIONS.md` |

### 🟢 Düşük Öncelik

| #   | Hata                | Çözüm                              | Sorumlu |
| --- | ------------------- | ---------------------------------- | ------- |
| 1   | Rate limit handling | Mobile'da UI göster                | Mobile  |
| 2   | Dislike feature     | Backend'e ekle veya spec'ten çıkar | Team    |
| 3   | Archive/Unarchive   | Backend'e ekle                     | Backend |

---

## 📝 SONUÇ

### İyileştirme Özeti (5 Aralık 2025)

**Önceki Durum:** 6 Kritik, 11 Orta, 10 Uyarı  
**Güncel Durum:** 2 Kritik, 9 Orta, 10 Uyarı

✅ **Düzeltilen Kritik Hatalar:**

1. Mesajlaşma API endpoint uyumsuzluğu (SEND_MESSAGE)
2. Verification API request format (S3Key + metadata)
3. CreatePostRequest tip uyumsuzluğu
4. Delete message endpoint eksikliği

✅ **Yapılan İyileştirmeler:**

- 8+ endpoint sabiti eklendi
- professionApi.ts servisi oluşturuldu
- Tüm servisler API_ENDPOINTS sabitlerini kullanacak şekilde güncellendi
- Tip tanımları backend ile uyumlu hale getirildi

**Kalan Öneriler:**

1. Comment postId tipi number → string dönüştürülmeli
2. Backend'de Save/Unsave Post implemente edilmeli
3. API dokümanları (08-API-SPECIFICATIONS.md) güncellenip tek kaynak haline getirilmeli

---

**Rapor Sonu**
**Son Güncelleme:** 5 Aralık 2025
