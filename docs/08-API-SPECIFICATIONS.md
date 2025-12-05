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
7. [Chat APIs](#chat-apis)
8. [Notification APIs](#notification-apis)
9. [Admin APIs](#admin-apis)
10. [Error Handling](#error-handling)

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
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "isVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

**Errors:**

- `400` - Invalid input
- `409` - Email already exists

---

### 2. Login

**Endpoint:** `POST /api/v1/auth/login`  
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
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "Ahmet",
      "surname": "Yılmaz",
      "profession": {
        "id": 5,
        "name": "Yazılım Geliştirici"
      },
      "isVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 86400
    }
  }
}
```

**Errors:**

- `401` - Invalid credentials
- `403` - Account banned

---

### 3. OAuth Login (Google/Instagram)

**Endpoint:** `POST /api/v1/auth/oauth/{provider}`  
**Auth Required:** No  
**Providers:** `google`, `instagram`

**Request:**

```json
{
  "token": "oauth_provider_token"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... },
    "isNewUser": true
  }
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Auth Required:** No

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

---

### 5. Logout

**Endpoint:** `POST /api/v1/auth/logout`  
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

**Endpoint:** `GET /api/v1/users/me`  
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

**Endpoint:** `PATCH /api/v1/users/me`  
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

**Endpoint:** `POST /api/v1/users/me/avatar`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request:**

```
FormData:
  avatar: <image_file>
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

**Endpoint:** `GET /api/v1/users/{userId}`  
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

**Endpoint:** `POST /api/v1/users/{userId}/block`  
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

**Endpoint:** `DELETE /api/v1/users/{userId}/block`  
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

### 1. Select Profession

**Endpoint:** `POST /api/v1/verification/select-profession`  
**Auth Required:** Yes

**Request:**

```json
{
  "professionId": 5
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "profession": {
      "id": 5,
      "name": "Yazılım Geliştirici",
      "requiresVerification": true
    },
    "nextStep": "UPLOAD_DOCUMENTS"
  }
}
```

---

### 2. Upload Verification Documents

**Endpoint:** `POST /api/v1/verification/upload-documents`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request:**

```
FormData:
  document: <diploma/certificate_file>
  selfie: <selfie_with_document_file>
  professionId: 5
```

**Validation:**

- Document: Max 5MB, formats: jpg, png, pdf
- Selfie: Max 5MB, formats: jpg, png
- Both required if profession requires verification

**Response (200):**

```json
{
  "success": true,
  "data": {
    "verificationRequestId": 789,
    "status": "PROCESSING",
    "estimatedTime": "2-5 minutes",
    "message": "Doğrulama işlemi başlatıldı"
  }
}
```

---

### 3. Get Verification Status

**Endpoint:** `GET /api/v1/verification/status`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "APPROVED",
    "profession": {
      "id": 5,
      "name": "Yazılım Geliştirici"
    },
    "aiConfidenceScore": 92.5,
    "reviewedAt": "2025-11-29T10:35:00Z",
    "attempts": 1,
    "maxAttempts": 3
  }
}
```

**Possible Statuses:**

- `PENDING`: Yüklendi, AI işleniyor
- `PROCESSING`: AI analiz ediyor
- `APPROVED`: Onaylandı
- `REJECTED`: Reddedildi
- `MANUAL_REVIEW`: Manuel inceleme gerekli

---

### 4. Retry Verification

**Endpoint:** `POST /api/v1/verification/retry`  
**Auth Required:** Yes

**Request:** (Same as Upload Documents)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "verificationRequestId": 790,
    "status": "PROCESSING",
    "remainingAttempts": 2
  }
}
```

**Errors:**

- `403` - Max attempts reached (3)

---

## 📰 Post APIs

### 1. Get Feed

**Endpoint:** `GET /api/v1/posts/feed`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 20, max: 50)
- `professionId`: Filter by profession (optional)

**Example:** `GET /api/v1/posts/feed?page=0&size=20`

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

**Endpoint:** `POST /api/v1/posts`  
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

**Endpoint:** `GET /api/v1/posts/{postId}`  
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

**Endpoint:** `PATCH /api/v1/posts/{postId}`  
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

**Endpoint:** `DELETE /api/v1/posts/{postId}`  
**Auth Required:** Yes (Only post owner)

**Response (204):** No content

---

### 6. Like/Unlike Post

**Endpoint:** `POST /api/v1/posts/{postId}/like`  
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

**Note:** Toggle behavior - calling again removes like

---

### 7. Dislike/Un-dislike Post

**Endpoint:** `POST /api/v1/posts/{postId}/dislike`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "isDisliked": true,
    "dislikeCount": 3
  }
}
```

---

## 💬 Comment APIs

### 1. Get Comments

**Endpoint:** `GET /api/v1/posts/{postId}/comments`  
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

**Endpoint:** `POST /api/v1/posts/{postId}/comments`  
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

**Endpoint:** `DELETE /api/v1/comments/{commentId}`  
**Auth Required:** Yes (Only comment owner or post owner)

**Response (204):** No content

---

### 4. Like/Unlike Comment

**Endpoint:** `POST /api/v1/comments/{commentId}/like`  
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

## 💭 Chat APIs

### 1. Get Chat Rooms

**Endpoint:** `GET /api/v1/chat/rooms`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "rooms": [
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
    ]
  }
}
```

---

### 2. Get Messages

**Endpoint:** `GET /api/v1/chat/rooms/{roomId}/messages`  
**Auth Required:** Yes

**Query Parameters:**

- `page`: Page number (default: 0)
- `size`: Items per page (default: 50)

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

### 3. Send Message

**Endpoint:** `POST /api/v1/chat/rooms/{roomId}/messages`  
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

### 4. Mark as Read

**Endpoint:** `POST /api/v1/chat/rooms/{roomId}/read`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Mesajlar okundu olarak işaretlendi"
}
```

---

### 5. Create Private Chat

**Endpoint:** `POST /api/v1/chat/rooms/private`  
**Auth Required:** Yes

**Request:**

```json
{
  "userId": 456
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "roomId": 26,
    "type": "PRIVATE",
    "otherUser": { ... }
  }
}
```

---

## 🔔 Notification APIs

### 1. Get Notifications

**Endpoint:** `GET /api/v1/notifications`  
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

### 2. Mark as Read

**Endpoint:** `PATCH /api/v1/notifications/{notificationId}/read`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Bildirim okundu"
}
```

---

### 3. Mark All as Read

**Endpoint:** `POST /api/v1/notifications/read-all`  
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "message": "Tüm bildirimler okundu"
}
```

---

## 🛡️ Admin APIs

### 1. Admin Login

**Endpoint:** `POST /api/v1/admin/auth/login`  
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

**Endpoint:** `GET /api/v1/admin/dashboard/stats`  
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

**Endpoint:** `GET /api/v1/admin/verifications/pending`  
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

**Endpoint:** `POST /api/v1/admin/verifications/{requestId}/review`  
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

**Endpoint:** `POST /api/v1/admin/users/{userId}/ban`  
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
