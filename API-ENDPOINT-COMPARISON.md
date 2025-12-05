# 📋 API Endpoint Karşılaştırma Tablosu

Bu doküman, backend controller'ları ile mobile endpoint tanımlarını detaylı olarak karşılaştırmaktadır.

---

## 1. Authentication Endpoints

| Endpoint        | Backend                                 | Mobile                                  | API Spec                         | Durum                  |
| --------------- | --------------------------------------- | --------------------------------------- | -------------------------------- | ---------------------- |
| Register        | `POST /api/auth/register`               | `POST /api/auth/register`               | `POST /api/v1/auth/register`     | ✅ Uyumlu (Spec hariç) |
| Login           | `POST /api/auth/login`                  | `POST /api/auth/login`                  | `POST /api/v1/auth/login`        | ✅ Uyumlu              |
| Refresh Token   | `POST /api/auth/refresh`                | `POST /api/auth/refresh`                | `POST /api/v1/auth/refresh`      | ✅ Uyumlu              |
| Logout          | `POST /api/auth/logout`                 | `POST /api/auth/logout`                 | `POST /api/v1/auth/logout`       | ✅ Uyumlu              |
| Forgot Password | `POST /api/auth/password-reset/request` | `POST /api/auth/password-reset/request` | -                                | ✅ Uyumlu              |
| Reset Password  | `POST /api/auth/password-reset/confirm` | `POST /api/auth/password-reset/confirm` | -                                | ✅ Uyumlu              |
| Change Password | `POST /api/auth/change-password`        | `POST /api/auth/change-password`        | -                                | ✅ Uyumlu              |
| Verify Email    | -                                       | `POST /api/auth/verify-email`           | -                                | ❌ Backend'de yok      |
| Google OAuth    | `POST /api/auth/oauth/google`           | `POST /api/auth/oauth/google`           | `POST /api/v1/auth/oauth/google` | ✅ Uyumlu              |
| Apple OAuth     | `POST /api/auth/oauth/apple`            | `POST /api/auth/oauth/apple`            | `POST /api/v1/auth/oauth/apple`  | ✅ Uyumlu              |

### Request/Response Analizi

#### Login

**Request:**

```
Backend:  { email, password }
Mobile:   { email, password }
Status:   ✅ Uyumlu
```

**Response:**

```
Backend:  { accessToken, refreshToken, tokenType, expiresIn, user }
Mobile:   { user, accessToken, refreshToken, tokenType, expiresIn }
Status:   ✅ Uyumlu (field sırası farklı ama sorun değil)
```

#### Register

**Request:**

```
Backend:  { email, password, name, surname }
Mobile:   { email, password, name, surname }
Status:   ✅ Uyumlu
```

**Response:**

```
Backend:  UserResponse { id, email, name, surname, ... }
Mobile:   RegisterResponse { id, email, name, surname, createdAt }
API Spec: { user, tokens }
Status:   ⚠️ Spec ile uyumsuz - backend token dönmüyor
```

---

## 2. User/Profile Endpoints

| Endpoint          | Backend                        | Mobile                         | API Spec                       | Durum                           |
| ----------------- | ------------------------------ | ------------------------------ | ------------------------------ | ------------------------------- |
| Get Current User  | `GET /api/users/me`            | `GET /api/users/me`            | `GET /api/v1/users/me`         | ✅ Uyumlu                       |
| Get User by ID    | `GET /api/users/{id}`          | `GET /api/users/{id}`          | `GET /api/v1/users/{userId}`   | ✅ Uyumlu                       |
| Update Profile    | `PUT /api/users/me`            | `PUT /api/users/me`            | `PATCH /api/v1/users/me`       | ⚠️ Method farklı (PUT vs PATCH) |
| Upload Avatar     | `POST /api/users/me/avatar`    | `POST /api/users/me/avatar`    | `POST /api/v1/users/me/avatar` | ✅ Uyumlu                       |
| Delete Avatar     | -                              | `DELETE /api/users/me/avatar`  | -                              | ❌ Backend'de yok               |
| Change Profession | `PUT /api/users/me/profession` | `PUT /api/users/me/profession` | -                              | ✅ Uyumlu                       |
| Delete Account    | `DELETE /api/users/me`         | `DELETE /api/users/me`         | -                              | ✅ Uyumlu                       |
| Search Users      | -                              | `GET /api/users/search`        | -                              | ❌ Backend'de yok               |

---

## 3. Profession Endpoints

| Endpoint              | Backend                                      | Mobile                                       | API Spec | Durum     |
| --------------------- | -------------------------------------------- | -------------------------------------------- | -------- | --------- |
| List All              | `GET /api/professions`                       | `GET /api/professions`                       | -        | ✅ Uyumlu |
| Get by ID             | `GET /api/professions/{id}`                  | `GET /api/professions/{id}`                  | -        | ✅ Uyumlu |
| Get by Category       | `GET /api/professions/category/{category}`   | `GET /api/professions/category/{category}`   | -        | ✅ Uyumlu |
| Search                | `GET /api/professions/search`                | `GET /api/professions/search`                | -        | ✅ Uyumlu |
| Verification Required | `GET /api/professions/verification-required` | `GET /api/professions/verification-required` | -        | ✅ Uyumlu |
| Stats                 | `GET /api/professions/stats`                 | `GET /api/professions/stats`                 | -        | ✅ Uyumlu |

---

## 4. Verification Endpoints

| Endpoint            | Backend                                       | Mobile                                        | API Spec                                      | Durum             |
| ------------------- | --------------------------------------------- | --------------------------------------------- | --------------------------------------------- | ----------------- |
| Submit Verification | `POST /api/verifications`                     | `POST /api/verifications`                     | `POST /api/v1/verification/upload-documents`  | ⚠️ Spec farklı    |
| Get Verifications   | `GET /api/verifications`                      | `GET /api/verifications`                      | -                                             | ✅ Uyumlu         |
| Get by ID           | `GET /api/verifications/{id}`                 | `GET /api/verifications/{id}`                 | -                                             | ✅ Uyumlu         |
| Check Eligibility   | `GET /api/verifications/check/{professionId}` | `GET /api/verifications/check/{professionId}` | -                                             | ✅ Uyumlu         |
| Get History         | `GET /api/verifications/history`              | `GET /api/verifications/history`              | -                                             | ✅ Uyumlu         |
| Select Profession   | -                                             | -                                             | `POST /api/v1/verification/select-profession` | ❌ Backend'de yok |

### Request Format Analizi

#### Submit Verification

**Backend beklentisi (SubmitVerificationRequest.java):**

```java
- professionId: Long (zorunlu)
- documentS3Key: String (zorunlu)
- documentFileName: String (zorunlu)
- documentContentType: String (zorunlu)
- documentFileSize: Long (zorunlu)
- selfieS3Key: String (zorunlu)
- selfieFileName: String (zorunlu)
- selfieContentType: String (zorunlu)
- selfieFileSize: Long (zorunlu)
```

**Mobile api.types.ts (DÜZELTİLDİ ✅):**

```typescript
{
  professionId: number;
  documentS3Key: string; // ✅ Düzeltildi
  documentFileName: string;
  documentContentType: string;
  documentFileSize: number;
  selfieS3Key: string; // ✅ Düzeltildi
  selfieFileName: string;
  selfieContentType: string;
  selfieFileSize: number;
}
```

**Status:** ✅ DÜZELTİLDİ (5 Aralık 2025)

---

## 5. Feed/Post Endpoints

| Endpoint        | Backend                           | Mobile                            | API Spec                              | Durum                   |
| --------------- | --------------------------------- | --------------------------------- | ------------------------------------- | ----------------------- |
| Get Feed        | `GET /api/feed`                   | `GET /api/feed`                   | `GET /api/v1/posts/feed`              | ⚠️ Spec farklı          |
| Get Trending    | `GET /api/feed/trending`          | `GET /api/feed/trending`          | -                                     | ✅ Uyumlu               |
| Create Post     | `POST /api/posts`                 | `POST /api/posts`                 | `POST /api/v1/posts`                  | ✅ Uyumlu               |
| Get Post        | `GET /api/posts/{postId}`         | `GET /api/posts/{postId}`         | `GET /api/v1/posts/{postId}`          | ✅ Uyumlu               |
| Update Post     | -                                 | `PUT /api/posts/{postId}`         | `PATCH /api/v1/posts/{postId}`        | ❌ Backend'de yok       |
| Delete Post     | `DELETE /api/posts/{postId}`      | `DELETE /api/posts/{postId}`      | `DELETE /api/v1/posts/{postId}`       | ✅ Uyumlu               |
| Like Post       | `POST /api/posts/{postId}/like`   | `POST /api/posts/{postId}/like`   | `POST /api/v1/posts/{postId}/like`    | ✅ Uyumlu               |
| Unlike Post     | `DELETE /api/posts/{postId}/like` | `DELETE /api/posts/{postId}/like` | -                                     | ✅ Uyumlu               |
| Dislike Post    | -                                 | -                                 | `POST /api/v1/posts/{postId}/dislike` | ❌ Implemente edilmemiş |
| Save Post       | -                                 | `POST /api/posts/{postId}/save`   | -                                     | ❌ Backend'de yok       |
| Unsave Post     | -                                 | `DELETE /api/posts/{postId}/save` | -                                     | ❌ Backend'de yok       |
| Get Saved Posts | -                                 | `GET /api/posts/saved`            | -                                     | ❌ Backend'de yok       |
| Report Post     | -                                 | `POST /api/posts/{postId}/report` | -                                     | ❌ Backend'de yok       |
| Share Post      | -                                 | `POST /api/posts/{postId}/share`  | -                                     | ❌ Backend'de yok       |
| User Posts      | -                                 | `GET /api/users/{userId}/posts`   | -                                     | ❌ Backend'de yok       |
| Following Posts | -                                 | `GET /api/posts/following`        | -                                     | ❌ Backend'de yok       |

### Response Format Analizi

#### Get Feed

**Backend Response:**

```java
ApiResponse<PagedResponse<FeedPostResponse>>

PagedResponse {
  content: List<FeedPostResponse>
  size: int
  hasNext: boolean
  hasPrevious: boolean
  lastId: Long  // Cursor-based
}

FeedPostResponse {
  id: Long
  postId: String (UUID)
  author: AuthorDto
  content: String
  images: List<PostImageDto>
  likeCount: int
  commentCount: int
  liked: boolean
  createdAt: String
}
```

**Mobile Expected:**

```typescript
{
  posts: Post[]
  hasMore: boolean
  lastId?: number
}
```

**Status:** ⚠️ `posts` vs `content` - Mobile mapping ile düzeltmiş

---

## 6. Comment Endpoints

| Endpoint       | Backend                                                | Mobile                                                 | API Spec                                 | Durum          |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------- | -------------- |
| Get Comments   | `GET /api/posts/{postId}/comments`                     | `GET /api/posts/{postId}/comments`                     | `GET /api/v1/posts/{postId}/comments`    | ✅ Uyumlu      |
| Add Comment    | `POST /api/posts/{postId}/comments`                    | `POST /api/posts/{postId}/comments`                    | `POST /api/v1/posts/{postId}/comments`   | ✅ Uyumlu      |
| Delete Comment | `DELETE /api/posts/{postId}/comments/{commentId}`      | `DELETE /api/posts/{postId}/comments/{commentId}`      | `DELETE /api/v1/comments/{commentId}`    | ⚠️ Spec farklı |
| Like Comment   | `POST /api/posts/{postId}/comments/{commentId}/like`   | `POST /api/posts/{postId}/comments/{commentId}/like`   | `POST /api/v1/comments/{commentId}/like` | ⚠️ Spec farklı |
| Unlike Comment | `DELETE /api/posts/{postId}/comments/{commentId}/like` | `DELETE /api/posts/{postId}/comments/{commentId}/like` | -                                        | ✅ Uyumlu      |

### ID Format Analizi

**Backend:**

```java
@PathVariable String postId  // UUID olarak parse ediliyor
PostId.of(UUID.fromString(postId))
```

**Mobile:**

```typescript
async getComments(postId: number, ...)  // ❌ number tipi
```

**Status:** ⚠️ Tip uyumsuzluğu - number vs UUID string

---

## 7. Messaging Endpoints

| Endpoint            | Backend                                          | Mobile                                           | API Spec                                | Durum              |
| ------------------- | ------------------------------------------------ | ------------------------------------------------ | --------------------------------------- | ------------------ |
| Get Conversations   | `GET /api/conversations`                         | `GET /api/conversations`                         | `GET /api/v1/chat/rooms`                | ❌ Spec farklı     |
| Get Messages        | `GET /api/conversations/{id}/messages`           | `GET /api/conversations/{id}/messages`           | `GET /api/v1/chat/rooms/{id}/messages`  | ❌ Spec farklı     |
| Send Message        | `POST /api/messages`                             | `POST /api/messages`                             | `POST /api/v1/chat/rooms/{id}/messages` | ✅ DÜZELTİLDİ      |
| Mark as Read        | `PUT /api/conversations/{id}/read`               | `PUT /api/conversations/{id}/read`               | `POST /api/v1/chat/rooms/{id}/read`     | ⚠️ Method farklı   |
| Delete Message      | `DELETE /api/conversations/{cId}/messages/{mId}` | `DELETE /api/conversations/{cId}/messages/{mId}` | -                                       | ✅ Uyumlu          |
| Get Unread Count    | `GET /api/conversations/unread-count`            | `GET /api/conversations/unread-count`            | -                                       | ✅ Uyumlu          |
| Search Messages     | `GET /api/messages/search`                       | `GET /api/messages/search`                       | -                                       | ✅ Uyumlu          |
| Get Upload URL      | `POST /api/messages/attachments/upload-url`      | `POST /api/messages/attachments/upload-url`      | -                                       | ✅ Uyumlu          |
| Create Private Chat | -                                                | `POST /api/conversations`                        | `POST /api/v1/chat/rooms/private`       | ❓ Kontrol gerekli |
| Archive             | -                                                | `POST /api/conversations/{id}/archive`           | -                                       | ❌ Backend'de yok  |
| Unarchive           | -                                                | `POST /api/conversations/{id}/unarchive`         | -                                       | ❌ Backend'de yok  |

### Kritik Hata Detayı

**Send Message:**

```
Backend:    POST /api/messages
            Body: { recipientId, content, attachment? }

Mobile:     POST /api/conversations/{conversationId}/messages
            Body: { ... }

Sonuç: ❌ Endpoint tamamen farklı! Mesaj gönderme çalışmaz.
```

---

## 8. Notification Endpoints

| Endpoint              | Backend                                | Mobile                                 | API Spec                                | Durum              |
| --------------------- | -------------------------------------- | -------------------------------------- | --------------------------------------- | ------------------ |
| Get Notifications     | `GET /api/notifications`               | `GET /api/notifications`               | `GET /api/v1/notifications`             | ✅ Uyumlu          |
| Get by ID             | `GET /api/notifications/{id}`          | `GET /api/notifications/{id}`          | -                                       | ✅ Uyumlu          |
| Get Unread Count      | `GET /api/notifications/unread-count`  | `GET /api/notifications/unread-count`  | -                                       | ✅ Uyumlu          |
| Mark as Read          | `POST /api/notifications/{id}/read`    | `POST /api/notifications/{id}/read`    | `PATCH /api/v1/notifications/{id}/read` | ⚠️ Method farklı   |
| Mark Multiple as Read | `POST /api/notifications/mark-as-read` | `POST /api/notifications/mark-as-read` | `POST /api/v1/notifications/read-all`   | ⚠️ Endpoint farklı |
| Get Preferences       | `GET /api/notifications/preferences`   | `GET /api/notifications/preferences`   | -                                       | ✅ Uyumlu          |
| Update Preferences    | `PUT /api/notifications/preferences`   | `PUT /api/notifications/preferences`   | -                                       | ✅ Uyumlu          |

---

## 9. Device Token Endpoints

| Endpoint          | Backend                            | Mobile                             | API Spec                              | Durum     |
| ----------------- | ---------------------------------- | ---------------------------------- | ------------------------------------- | --------- |
| Register Device   | `POST /api/devices/register`       | `POST /api/devices/register`       | `POST /api/v1/devices/register`       | ✅ Uyumlu |
| Unregister Device | `POST /api/devices/unregister`     | `POST /api/devices/unregister`     | `POST /api/v1/devices/unregister`     | ✅ Uyumlu |
| Unregister All    | `POST /api/devices/unregister-all` | `POST /api/devices/unregister-all` | `POST /api/v1/devices/unregister-all` | ✅ Uyumlu |

---

## 10. Social (Follow/Block) Endpoints

| Endpoint           | Backend                            | Mobile                             | API Spec                          | Durum             |
| ------------------ | ---------------------------------- | ---------------------------------- | --------------------------------- | ----------------- |
| Follow User        | `POST /api/users/{id}/follow`      | `POST /api/users/{id}/follow`      | -                                 | ✅ Uyumlu         |
| Unfollow User      | `DELETE /api/users/{id}/follow`    | `DELETE /api/users/{id}/follow`    | -                                 | ✅ Uyumlu         |
| Get Followers      | `GET /api/users/{id}/followers`    | `GET /api/users/{id}/followers`    | -                                 | ✅ Uyumlu         |
| Get Following      | `GET /api/users/{id}/following`    | `GET /api/users/{id}/following`    | -                                 | ✅ Uyumlu         |
| Block User         | `POST /api/users/{id}/block`       | `POST /api/users/{id}/block`       | `POST /api/v1/users/{id}/block`   | ✅ Uyumlu         |
| Unblock User       | `DELETE /api/users/{id}/block`     | `DELETE /api/users/{id}/block`     | `DELETE /api/v1/users/{id}/block` | ✅ Uyumlu         |
| Get Blocked Users  | `GET /api/users/me/blocked`        | `GET /api/users/me/blocked`        | -                                 | ✅ Uyumlu         |
| Check Block Status | `GET /api/users/{id}/block/status` | `GET /api/users/{id}/block/status` | -                                 | ✅ Uyumlu         |
| Report User        | -                                  | `POST /api/users/{id}/report`      | -                                 | ❌ Backend'de yok |

---

## 11. Media Endpoints

| Endpoint          | Backend | Mobile                            | API Spec | Durum                       |
| ----------------- | ------- | --------------------------------- | -------- | --------------------------- |
| Upload            | -       | `POST /api/media/upload`          | -        | ❓ Backend kontrolü gerekli |
| Upload Multiple   | -       | `POST /api/media/upload-multiple` | -        | ❓ Backend kontrolü gerekli |
| Get Presigned URL | -       | `GET /api/media/presigned-url`    | -        | ❓ Backend kontrolü gerekli |
| Delete Media      | -       | `DELETE /api/media/{id}`          | -        | ❓ Backend kontrolü gerekli |

---

## Özet Tablo

| Kategori      | Toplam | Uyumlu | Kısmi  | Uyumsuz |
| ------------- | ------ | ------ | ------ | ------- |
| Auth          | 10     | 9      | 0      | 1       |
| User/Profile  | 8      | 6      | 1      | 1       |
| Profession    | 6      | 6      | 0      | 0       |
| Verification  | 6      | 5      | 1      | 0       |
| Feed/Posts    | 17     | 6      | 2      | 9       |
| Comments      | 5      | 3      | 2      | 0       |
| Messaging     | 11     | 7      | 2      | 2       |
| Notifications | 7      | 5      | 2      | 0       |
| Device Tokens | 3      | 3      | 0      | 0       |
| Social        | 10     | 8      | 0      | 2       |
| **TOPLAM**    | **83** | **58** | **10** | **15**  |

> 🎉 **İyileştirme:** 8 uyumsuzluk düzeltildi! (50 → 58 uyumlu, 23 → 15 uyumsuz)

---

## Öncelikli Düzeltme Listesi

### ✅ Tamamlanan Düzeltmeler (5 Aralık 2025)

1. **~~Messaging: Send Message endpoint~~** - ✅ Mobile `/api/messages` kullanacak şekilde düzeltildi
2. **~~Verification: Request format~~** - ✅ S3Key + metadata formatına güncellendi
3. **~~endpoints.ts: Eksik tanımlar~~** - ✅ DELETE_MESSAGE, BLOCKED_USERS, BLOCK_STATUS, BY_ID eklendi
4. **~~Profession endpoints~~** - ✅ VERIFICATION_REQUIRED, STATS eklendi, professionApi.ts oluşturuldu
5. **~~Notification endpoints~~** - ✅ BY_ID, UNREAD_COUNT eklendi
6. **~~Hardcoded endpoints~~** - ✅ Tüm servisler API_ENDPOINTS sabitlerini kullanıyor

### 🟡 Orta (Sprint içinde düzeltilmeli)

1. **Comment: postId tipi** - number → string (Backend UUID bekliyor)
2. **Backend: Save/Unsave Post** - İmplemente edilmeli
3. **Backend: Report Post/User** - İmplemente edilmeli
4. **API Spec: Güncellemeler** - v1 prefix kaldırılmalı

### 🟢 Düşük (Backlog)

1. **Backend: User Search** - İmplemente edilmeli
2. **Backend: Archive/Unarchive** - İmplemente edilmeli

---

**Doküman Sonu**
