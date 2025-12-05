# 🌐 API Spesifikasyonları ve Endpoint Dokümantasyonu

**Doküman Versiyonu:** 1.1  
**Son Güncelleme:** 5 Aralık 2025  
**Durum:** ✅ Onaylandı  
**Base URL:** `https://api.meslektas.com`

> ⚠️ **Not:** Tüm endpoint'ler `/api/*` prefix'i kullanır (~~`/api/v1/*`~~ değil).

---

## 📑 İçindekiler

1. [API Genel Bakış](#api-genel-bakış)
2. [Authentication APIs](#authentication-apis)
3. [User APIs](#user-apis)
4. [Verification APIs](#verification-apis)
5. [Post APIs](#post-apis)
6. [Comment APIs](#comment-apis)
7. [Messaging APIs](#messaging-apis)
8. [Notification APIs](#notification-apis)
9. [Social APIs](#social-apis)
10. [Profession APIs](#profession-apis)
11. [Sanction APIs](#sanction-apis)
12. [Admin APIs](#admin-apis)
13. [Error Handling](#error-handling)

---

## 🎯 API Genel Bakış

### Base Configuration

```yaml
Protocol: HTTPS (TLS 1.3)
Base URL: https://api.meslektas.com
API Prefix: /api (NOT /api/v1)
Content-Type: application/json
Charset: UTF-8
```

### Authentication

**Header:**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Token Format:**

- Access Token: 24 saat geçerli
- Refresh Token: 30 gün geçerli

### Standard Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata mesajı",
    "details": { ... }
  },
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning               | Usage                    |
| ---- | --------------------- | ------------------------ |
| 200  | OK                    | Başarılı GET, PUT, PATCH |
| 201  | Created               | Başarılı POST            |
| 204  | No Content            | Başarılı DELETE          |
| 400  | Bad Request           | Geçersiz istek           |
| 401  | Unauthorized          | Kimlik doğrulama gerekli |
| 403  | Forbidden             | Yetki yetersiz           |
| 404  | Not Found             | Kaynak bulunamadı        |
| 409  | Conflict              | Veri çakışması           |
| 422  | Unprocessable Entity  | Validasyon hatası        |
| 429  | Too Many Requests     | Rate limit aşıldı        |
| 500  | Internal Server Error | Sunucu hatası            |

### Rate Limiting

```yaml
General Endpoints: 100 requests/minute per IP
Auth Endpoints: 10 requests/minute per IP
Upload Endpoints: 20 requests/minute per user
```

**Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1638360000
```

---

## 🔐 Authentication APIs

### 1. Register

**Endpoint:** `POST /api/auth/register`  
**Auth Required:** No

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "Ahmet",
  "surname": "Yılmaz"
}
```

**Validation Rules:**

- Email: Valid format, max 255 chars, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Name: 2-100 chars, letters only
- Surname: 2-100 chars, letters only

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "fullName": "Ahmet Yılmaz",
    "createdAt": "2025-12-05T10:30:00Z"
  },
  "timestamp": "2025-12-05T10:30:00Z"
}
```

> ⚠️ **Not:** Kayıt sonrası otomatik giriş için ayrıca `/api/auth/login` endpoint'i çağrılmalıdır.

**Errors:**

- `400` - Invalid input
- `409` - Email already exists

---

### 2. Login

**Endpoint:** `POST /api/auth/login`  
**Auth Required:** No

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "fullName": "Ahmet Yılmaz",
      "avatarUrl": "https://cdn.meslektas.com/avatars/123.jpg",
      "professionId": 5,
      "professionName": "Yazılım Geliştirici",
      "verificationStatus": "APPROVED"
    }
  },
  "timestamp": "2025-12-05T10:30:00Z"
}
```

**Errors:**

- `401` - Invalid credentials
- `403` - Account banned

---

### 3. OAuth Login (Google/Apple)

**Endpoint:** `POST /api/auth/oauth/{provider}`  
**Auth Required:** No  
**Providers:** `google`, `apple`

**Google Request:**

```json
{
  "idToken": "google_id_token_from_client"
}
```

**Apple Request:**

```json
{
  "idToken": "apple_id_token",
  "authorizationCode": "apple_auth_code",
  "fullName": {
    "givenName": "Ahmet",
    "familyName": "Yılmaz"
  }
}
```

> ⚠️ **Not:** Apple sadece ilk girişte kullanıcı adını sağlar.

**Response (200):**

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "isNewUser": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "fullName": "Ahmet Yılmaz"
  }
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`  
**Auth Required:** No

**Request Header:**

```http
Refresh-Token: eyJhbGciOiJIUzI1NiIs...
```

> ⚠️ **Önemli:** Refresh token **body'de değil, header'da** gönderilmelidir!

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 86400
  },
  "timestamp": "2025-12-05T10:30:00Z"
}
```

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Çıkış yapıldı"
}
```

---

## 👤 User APIs

### 1. Get Current User

**Endpoint:** `GET /api/users/me`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "Ahmet",
    "surname": "Yılmaz",
    "bio": "Yazılım geliştirici",
    "avatarUrl": "https://cdn.meslektas.com/avatars/123.jpg",
    "profession": {
      "id": 5,
      "name": "Yazılım Geliştirici",
      "category": "ENGINEERING"
    },
    "isProfessionVerified": true,
    "isProfileVerified": false,
    "stats": {
      "postCount": 42,
      "followerCount": 156,
      "followingCount": 89
    },
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 2. Update Profile

**Endpoint:** `PUT /api/users/me`  
**Auth Required:** Yes

**Request:**

```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "bio": "Senior Yazılım Geliştirici"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "bio": "Senior Yazılım Geliştirici",
    "updatedAt": "2025-11-29T10:30:00Z"
  }
}
```

---

### 3. Upload Avatar

**Endpoint:** `POST /api/users/me/avatar`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request:**

```
FormData:
  file: <image_file>
```

**Validation:**

- Max size: 5MB
- Allowed formats: jpg, jpeg, png
- Min dimensions: 200x200px

**Response (200):**

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.meslektas.com/avatars/123.jpg",
    "thumbnailUrl": "https://cdn.meslektas.com/avatars/123_thumb.jpg"
  }
}
```

---

### 4. Get User by ID

**Endpoint:** `GET /api/users/{userId}`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 456,
    "name": "Ayşe",
    "surname": "Demir",
    "bio": "UX Designer",
    "avatarUrl": "https://cdn.meslektas.com/avatars/456.jpg",
    "profession": {
      "id": 8,
      "name": "Grafik Tasarımcı"
    },
    "isProfessionVerified": true,
    "isBlocked": false,
    "stats": {
      "postCount": 28,
      "followerCount": 234
    }
  }
}
```

---

### 5. Block User

**Endpoint:** `POST /api/users/{userId}/block`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Kullanıcı engellendi"
}
```

---

### 6. Unblock User

**Endpoint:** `DELETE /api/users/{userId}/block`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Engel kaldırıldı"
}
```

---

## ✅ Verification APIs

> ⚠️ **Yeni API Yapısı:** Verification API'leri `/api/verifications/*` prefix'i kullanır.

### 1. Submit Verification

**Endpoint:** `POST /api/verifications`  
**Auth Required:** Yes

> Önemli: Belgeler önce S3'e yüklenmeli, ardından S3 key'leri bu endpoint'e gönderilmelidir.

**Request:**

```json
{
  "professionId": 5,
  "documentS3Key": "verifications/123/document.jpg",
  "documentFileName": "diploma.jpg",
  "documentContentType": "image/jpeg",
  "documentFileSize": 1048576,
  "selfieS3Key": "verifications/123/selfie.jpg",
  "selfieFileName": "selfie.jpg",
  "selfieContentType": "image/jpeg",
  "selfieFileSize": 524288
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Verification submitted successfully",
  "data": {
    "id": 789,
    "professionId": 5,
    "status": "PROCESSING",
    "attemptNumber": 1,
    "submittedAt": "2025-12-05T10:30:00Z"
  }
}
```

---

### 2. Get User Verifications

**Endpoint:** `GET /api/verifications`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "professionId": 5,
      "status": "APPROVED",
      "attemptNumber": 1,
      "aiConfidence": 92.5,
      "submittedAt": "2025-12-05T10:30:00Z",
      "processedAt": "2025-12-05T10:32:00Z"
    }
  ]
}
```

---

### 3. Get Verification by ID

**Endpoint:** `GET /api/verifications/{id}`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 789,
    "professionId": 5,
    "status": "APPROVED",
    "attemptNumber": 1,
    "aiConfidence": 92.5,
    "faceSimilarity": 98.2,
    "submittedAt": "2025-12-05T10:30:00Z",
    "processedAt": "2025-12-05T10:32:00Z"
  }
}
```

---

### 4. Check Verification Eligibility

**Endpoint:** `GET /api/verifications/check/{professionId}`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "eligible": true,
    "remainingAttempts": 3,
    "maxAttempts": 3,
    "canRetry": true,
    "cooldownEndsAt": null
  }
}
```

---

### 5. Get Verification History

**Endpoint:** `GET /api/verifications/history`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "professionId": 5,
      "professionName": "Yazılım Geliştirici",
      "status": "APPROVED",
      "attemptNumber": 1,
      "submittedAt": "2025-12-05T10:30:00Z",
      "canRetry": false,
      "isLatest": true
    }
  ]
}
```

**Possible Statuses:**

- `PENDING`: Yüklendi, AI işleniyor
- `PROCESSING`: AI analiz ediyor
- `APPROVED`: Onaylandı
- `REJECTED`: Reddedildi
- `MANUAL_REVIEW`: Manuel inceleme gerekli

**Errors:**

- `403` - Max attempts reached (3)

---

## 📰 Post APIs

### 1. Get Feed

**Endpoint:** `GET /api/feed`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 20, max: 50)
- `cursor`: Cursor for pagination (optional, ISO timestamp)
- `professionId`: Filter by profession (optional)

**Example:** `GET /api/feed?page=0&size=20`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 123,
        "author": {
          "id": 456,
          "name": "Ahmet",
          "surname": "Yılmaz",
          "avatarUrl": "...",
          "isProfessionVerified": true
        },
        "profession": {
          "id": 5,
          "name": "Yazılım Geliştirici"
        },
        "content": "Bugün harika bir proje tamamladık!",
        "images": [
          {
            "url": "https://cdn.meslektas.com/posts/123_1.jpg",
            "width": 1080,
            "height": 1920
          }
        ],
        "stats": {
          "likeCount": 42,
          "dislikeCount": 2,
          "commentCount": 15,
          "viewCount": 234
        },
        "userInteraction": {
          "isLiked": true,
          "isDisliked": false,
          "isSaved": false
        },
        "isCommentEnabled": true,
        "createdAt": "2025-11-29T09:00:00Z",
        "updatedAt": "2025-11-29T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 0,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8,
      "hasNext": true
    }
  }
}
```

---

### 2. Create Post

**Endpoint:** `POST /api/posts`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request:**

```
FormData:
  content: "Bugün harika bir proje tamamladık!"
  images[]: <image_file_1>
  images[]: <image_file_2>
```

**Validation:**

- Content: 1-1000 characters, required
- Images: Max 5 images, each max 10MB, formats: jpg, png

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 124,
    "content": "Bugün harika bir proje tamamladık!",
    "images": [...],
    "createdAt": "2025-11-29T10:30:00Z"
  }
}
```

---

### 3. Get Post by ID

**Endpoint:** `GET /api/posts/{postId}`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "author": { ... },
    "content": "...",
    "images": [...],
    "stats": { ... },
    "userInteraction": { ... },
    "createdAt": "2025-11-29T09:00:00Z"
  }
}
```

---

### 4. Update Post

**Endpoint:** `PUT /api/posts/{postId}`  
**Auth Required:** Yes (Only post owner)

**Request:**

```json
{
  "content": "Güncellenmiş içerik",
  "isCommentEnabled": false
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "content": "Güncellenmiş içerik",
    "isCommentEnabled": false,
    "updatedAt": "2025-11-29T10:40:00Z"
  }
}
```

---

### 5. Delete Post

**Endpoint:** `DELETE /api/posts/{postId}`  
**Auth Required:** Yes (Only post owner)

**Response (204):** No content

---

### 6. Like Post

**Endpoint:** `POST /api/posts/{postId}/like`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 43
  }
}
```

---

### 7. Unlike Post

**Endpoint:** `DELETE /api/posts/{postId}/like`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likeCount": 42
  }
}
```

---

### 8. Save Post

**Endpoint:** `POST /api/posts/{postId}/save`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Post saved"
}
```

---

### 9. Unsave Post

**Endpoint:** `DELETE /api/posts/{postId}/save`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Post unsaved"
}
```

---

### 10. Get Saved Posts

**Endpoint:** `GET /api/posts/saved`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {...}
  }
}
```

---

## 💬 Comment APIs

### 1. Get Comments

**Endpoint:** `GET /api/posts/{postId}/comments`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 20)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 789,
        "author": {
          "id": 456,
          "name": "Ayşe",
          "surname": "Demir",
          "avatarUrl": "..."
        },
        "content": "Harika paylaşım!",
        "likeCount": 5,
        "replyCount": 2,
        "userInteraction": {
          "isLiked": false
        },
        "createdAt": "2025-11-29T09:15:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 2. Create Comment

**Endpoint:** `POST /api/posts/{postId}/comments`  
**Auth Required:** Yes

**Request:**

```json
{
  "content": "Harika paylaşım!",
  "parentCommentId": null
}
```

**Validation:**

- Content: 1-500 characters
- ParentCommentId: Optional (for replies)

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 790,
    "content": "Harika paylaşım!",
    "createdAt": "2025-11-29T10:45:00Z"
  }
}
```

---

### 3. Delete Comment

**Endpoint:** `DELETE /api/posts/{postId}/comments/{commentId}`  
**Auth Required:** Yes (Only comment owner or post owner)

**Response (204):** No content

---

### 4. Like Comment

**Endpoint:** `POST /api/posts/{postId}/comments/{commentId}/like`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 6
  }
}
```

---

### 5. Unlike Comment

**Endpoint:** `DELETE /api/posts/{postId}/comments/{commentId}/like`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likeCount": 5
  }
}
```

---

### 6. Get Comment Replies

**Endpoint:** `GET /api/posts/{postId}/comments/{commentId}/replies`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "replies": [...],
    "pagination": {...}
  }
}
```

---

## 💭 Messaging APIs

### 1. Get Conversations

**Endpoint:** `GET /api/conversations`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 20)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 10,
        "type": "PROFESSION_GROUP",
        "name": "Yazılım Geliştirici Odası",
        "profession": {
          "id": 5,
          "name": "Yazılım Geliştirici"
        },
        "participantCount": 234,
        "unreadCount": 5,
        "lastMessage": {
          "content": "Merhaba arkadaşlar",
          "senderName": "Ahmet",
          "timestamp": "2025-11-29T10:20:00Z"
        }
      },
      {
        "id": 25,
        "type": "PRIVATE",
        "name": null,
        "otherUser": {
          "id": 456,
          "name": "Ayşe",
          "surname": "Demir",
          "avatarUrl": "..."
        },
        "unreadCount": 2,
        "lastMessage": { ... }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 2. Get Conversation by ID

**Endpoint:** `GET /api/conversations/{conversationId}`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "type": "PRIVATE",
    "participants": [...],
    "createdAt": "2025-11-29T10:00:00Z"
  }
}
```

---

### 3. Create Conversation

**Endpoint:** `POST /api/conversations`  
**Auth Required:** Yes

**Request:**

```json
{
  "participantId": 456,
  "type": "PRIVATE"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 26,
    "type": "PRIVATE",
    "participants": [...]
  }
}
```

---

### 4. Get Messages

**Endpoint:** `GET /api/conversations/{conversationId}/messages`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 50)
- `before`: Cursor for older messages (optional, message ID)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1001,
        "sender": {
          "id": 456,
          "name": "Ahmet",
          "avatarUrl": "..."
        },
        "content": "Merhaba!",
        "type": "TEXT",
        "isRead": true,
        "createdAt": "2025-11-29T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 5. Send Message

**Endpoint:** `POST /api/conversations/{conversationId}/messages`  
**Auth Required:** Yes

**Request:**

```json
{
  "content": "Merhaba, nasılsın?",
  "type": "TEXT"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 1002,
    "content": "Merhaba, nasılsın?",
    "type": "TEXT",
    "createdAt": "2025-11-29T10:50:00Z"
  }
}
```

---

### 6. Mark Conversation as Read

**Endpoint:** `POST /api/conversations/{conversationId}/read`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Mesajlar okundu olarak işaretlendi"
}
```

---

### 7. Delete Message

**Endpoint:** `DELETE /api/messages/{messageId}`  
**Auth Required:** Yes

**Response (204):** No content

---

### 8. Get Unread Count

**Endpoint:** `GET /api/conversations/unread-count`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

## 🔔 Notification APIs

### 1. Get Notifications

**Endpoint:** `GET /api/notifications`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 20)
- `isRead`: Filter by read status (optional)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 301,
        "type": "NEW_LIKE",
        "title": "Gönderiniz beğenildi",
        "message": "Ahmet gönderinizi beğendi",
        "data": {
          "postId": 123,
          "userId": 456
        },
        "isRead": false,
        "createdAt": "2025-11-29T10:30:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": { ... }
  }
}
```

---

### 2. Get Unread Count

**Endpoint:** `GET /api/notifications/unread-count`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### 3. Mark as Read

**Endpoint:** `POST /api/notifications/{notificationId}/read`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Bildirim okundu"
}
```

---

### 4. Mark All as Read

**Endpoint:** `POST /api/notifications/read-all`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Tüm bildirimler okundu"
}
```

---

### 5. Register Device Token

**Endpoint:** `POST /api/device-tokens`  
**Auth Required:** Yes

**Request:**

```json
{
  "token": "fcm_device_token_here",
  "platform": "IOS"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Device token registered"
}
```

---

### 6. Delete Device Token

**Endpoint:** `DELETE /api/device-tokens`  
**Auth Required:** Yes

**Request:**

```json
{
  "token": "fcm_device_token_here"
}
```

**Response (204):** No content

---

## 👥 Social APIs

### 1. Follow User

**Endpoint:** `POST /api/users/{userId}/follow`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Kullanıcı takip edildi"
}
```

---

### 2. Unfollow User

**Endpoint:** `DELETE /api/users/{userId}/follow`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Takip bırakıldı"
}
```

---

### 3. Get Followers

**Endpoint:** `GET /api/users/{userId}/followers`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 20)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "id": 123,
        "name": "Ahmet",
        "surname": "Yılmaz",
        "avatarUrl": "...",
        "isProfessionVerified": true
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 4. Get Following

**Endpoint:** `GET /api/users/{userId}/following`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "following": [...],
    "pagination": { ... }
  }
}
```

---

### 5. Check Follow Status

**Endpoint:** `GET /api/users/{userId}/follow-status`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "isFollowing": true,
    "isFollowedBy": false
  }
}
```

---

## 🏢 Profession APIs

### 1. Get All Professions

**Endpoint:** `GET /api/professions`  
**Auth Required:** No

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Yazılım Geliştirici",
      "category": "Teknoloji",
      "memberCount": 1234
    },
    {
      "id": 2,
      "name": "Doktor",
      "category": "Sağlık",
      "memberCount": 567
    }
  ]
}
```

---

### 2. Get Profession by ID

**Endpoint:** `GET /api/professions/{professionId}`  
**Auth Required:** No

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Yazılım Geliştirici",
    "category": "Teknoloji",
    "description": "Yazılım geliştirme ve programlama yapan profesyoneller",
    "memberCount": 1234,
    "verificationRequirements": ["Diploma veya sertifika", "İş yeri belgesi"]
  }
}
```

---

### 3. Search Professions

**Endpoint:** `GET /api/professions/search`  
**Auth Required:** No

**Query Parameters:**

- `q`: Search query (min 2 characters)

**Example:** `GET /api/professions/search?q=yazılım`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Yazılım Geliştirici",
      "category": "Teknoloji"
    }
  ]
}
```

---

## ⚖️ Sanction APIs

### 1. Get User Sanctions

**Endpoint:** `GET /api/users/me/sanctions`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "sanctions": [
      {
        "id": 1,
        "type": "WARNING",
        "reason": "Uygunsuz içerik",
        "createdAt": "2025-11-29T10:00:00Z",
        "expiresAt": null
      }
    ],
    "activeSanctionsCount": 1
  }
}
```

---

### 2. Check Active Restrictions

**Endpoint:** `GET /api/users/me/restrictions`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "canPost": true,
    "canComment": true,
    "canMessage": false,
    "restrictions": [
      {
        "type": "MESSAGING_BAN",
        "expiresAt": "2025-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

## 🛡️ Admin APIs

### 1. Admin Login

**Endpoint:** `POST /api/admin/auth/login`  
**Auth Required:** No

**Request:**

```json
{
  "email": "admin@meslektas.com",
  "password": "AdminPass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "email": "admin@meslektas.com",
      "role": "SUPER_ADMIN"
    },
    "tokens": { ... }
  }
}
```

---

### 2. Get Dashboard Stats

**Endpoint:** `GET /api/admin/dashboard/stats`  
**Auth Required:** Yes (Admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 5234,
      "verified": 3456,
      "active": 4123,
      "newToday": 23
    },
    "posts": {
      "total": 15678,
      "today": 156
    },
    "verificationRequests": {
      "pending": 12,
      "manualReview": 3
    }
  }
}
```

---

### 3. Get Pending Verifications

**Endpoint:** `GET /api/admin/verifications/pending`  
**Auth Required:** Yes (Admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 789,
        "user": {
          "id": 123,
          "name": "Ahmet",
          "email": "ahmet@example.com"
        },
        "profession": {
          "id": 5,
          "name": "Yazılım Geliştirici"
        },
        "documentUrl": "...",
        "selfieUrl": "...",
        "aiConfidenceScore": 75.5,
        "status": "MANUAL_REVIEW",
        "createdAt": "2025-11-29T08:00:00Z"
      }
    ]
  }
}
```

---

### 4. Approve/Reject Verification

**Endpoint:** `POST /api/admin/verifications/{requestId}/review`  
**Auth Required:** Yes (Admin)

**Request:**

```json
{
  "action": "APPROVE",
  "note": "Belgeler uygun"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Doğrulama onaylandı"
}
```

---

### 5. Ban User

**Endpoint:** `POST /api/admin/users/{userId}/ban`  
**Auth Required:** Yes (Admin)

**Request:**

```json
{
  "reason": "Spam içerik paylaşımı",
  "duration": 7
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Kullanıcı yasaklandı"
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri",
    "details": {
      "email": ["Email formatı geçersiz"],
      "password": ["Şifre en az 8 karakter olmalı"]
    }
  },
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### Error Codes

| Code                  | HTTP Status | Description              |
| --------------------- | ----------- | ------------------------ |
| `VALIDATION_ERROR`    | 422         | Input validation failed  |
| `UNAUTHORIZED`        | 401         | Authentication required  |
| `FORBIDDEN`           | 403         | Insufficient permissions |
| `NOT_FOUND`           | 404         | Resource not found       |
| `CONFLICT`            | 409         | Resource already exists  |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests        |
| `INTERNAL_ERROR`      | 500         | Server error             |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily down |

---

## 📚 Postman Collection

**Download:** [Meslektas_API_Collection.json](./postman/collection.json)

**Environment Variables:**

```json
{
  "baseUrl": "https://api.meslektas.com",
  "accessToken": "{{accessToken}}",
  "refreshToken": "{{refreshToken}}"
}
```

---

## 🔄 WebSocket Events

### Connection

**URL:** `wss://api.meslektas.com/ws`  
**Auth:** JWT in query param `?token=<JWT>`

### Events

**Client → Server:**

- `chat.join`: Join chat room
- `chat.send`: Send message
- `chat.typing`: Typing indicator

**Server → Client:**

- `chat.message`: New message
- `chat.typing`: User typing
- `notification.new`: New notification

---

**Hazırlayan:** Backend Team  
**Onaylayan:** Tech Lead  
**Versiyon:** 1.0  
**Son Güncelleme:** 29 Kasım 2025
