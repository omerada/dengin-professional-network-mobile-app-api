# Backend API Reference

**Version:** 1.0  
**Last Updated:** 2024-12-03  
**Complexity:** ⭐⭐⭐⭐⭐ (Critical - Mobile-Backend Entegrasyonu)

---

## 1. Overview

Bu dokuman, Meslektaş Backend API'sinin production-ready endpoint'lerini ve mobil uygulama entegrasyonu için kritik detaylarını içerir. Tüm endpoint'ler test edilmiş ve çalışır durumdadır.

---

## 2. Base Configuration

```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  // Production
  BASE_URL: "https://api.meslektas.com",
  WS_URL: "wss://api.meslektas.com/ws",

  // Development
  DEV_BASE_URL: "http://localhost:8080",
  DEV_WS_URL: "ws://localhost:8080/ws",

  // Timeout
  TIMEOUT: 30000,

  // Headers
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
```

---

## 3. API Response Format

### 3.1 Standard Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}
```

### 3.2 Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

### 3.3 Paginated Response

```typescript
interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

---

## 4. Authentication Endpoints

### 4.1 Register

```http
POST /api/auth/register
Content-Type: application/json
```

**Request:**

```typescript
interface RegisterRequest {
  email: string; // Required, valid email format
  password: string; // Required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  name: string; // Required, 2-100 chars
  surname: string; // Required, 2-100 chars
}
```

**Response (201):**

```typescript
interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  createdAt: string;
}
```

---

### 4.2 Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Request:**

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response (200):**

```typescript
interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    surname: string;
    verificationStatus: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
    professionId?: number;
    professionName?: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number; // seconds (86400 = 24 hours)
}
```

---

### 4.3 OAuth2 - Google

```http
POST /api/v1/auth/oauth/google
Content-Type: application/json
```

**Request:**

```typescript
interface GoogleAuthRequest {
  idToken: string; // Google ID token from Sign-In SDK
}
```

**Response (200):**

```typescript
interface OAuth2AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  isNewUser: boolean; // true if first-time login
  user: {
    id: number;
    email: string;
    name: string;
    surname: string;
    fullName: string;
    avatarUrl?: string;
    verificationStatus: string;
  };
}
```

---

### 4.4 OAuth2 - Apple

```http
POST /api/v1/auth/oauth/apple
Content-Type: application/json
```

**Request:**

```typescript
interface AppleAuthRequest {
  idToken: string; // Apple ID token
  authorizationCode?: string; // For token refresh
  fullName?: {
    // Only provided on first login!
    givenName?: string;
    familyName?: string;
  };
}
```

**Response:** Same as Google OAuth

**⚠️ Important Apple Notes:**

- Apple only provides user's name on FIRST login
- Store the name locally when received
- Pass stored name on subsequent logins if needed

---

### 4.5 Refresh Token

```http
POST /api/auth/refresh
Headers:
  Refresh-Token: {refreshToken}
```

**Response (200):**

```typescript
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

---

### 4.6 Password Reset

```http
POST /api/auth/password-reset/request
Content-Type: application/json
```

**Request:**

```typescript
interface PasswordResetRequest {
  email: string;
}
```

**Response:** Always 204 No Content (security: prevents email enumeration)

---

```http
POST /api/auth/password-reset/confirm
Content-Type: application/json
```

**Request:**

```typescript
interface PasswordResetConfirmRequest {
  resetToken: string;
  newPassword: string;
}
```

---

## 5. User Endpoints

### 5.1 Get Current User

```http
GET /api/users/me
Authorization: Bearer {accessToken}
```

**Response (200):**

```typescript
interface UserResponse {
  id: number;
  email: string;
  name: string;
  surname: string;
  bio?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  verificationStatus: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  profession?: {
    id: number;
    name: string;
    category: string;
    requiresVerification: boolean;
  };
  stats?: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

### 5.2 Get User Profile (Alternative Endpoint)

```http
GET /api/users/profile
Authorization: Bearer {accessToken}
```

Returns current user's full profile with privacy-aware data.

---

### 5.3 Get User by ID

```http
GET /api/users/{userId}
Authorization: Bearer {accessToken}
```

Returns limited profile for other users based on privacy settings.

---

### 5.4 Update User Profile

```http
PUT /api/users/me
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface UpdateUserRequest {
  name?: string;
  surname?: string;
  bio?: string; // Max 500 chars
  phoneNumber?: string;
}
```

---

### 5.5 Upload Avatar

```http
POST /api/users/me/avatar
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request:**

```
FormData:
  file: <image_file>
```

**Validation:**

- Max size: 5MB
- Formats: JPEG, PNG, WebP
- Auto-resized to 512x512

---

### 5.6 Change Profession

```http
PUT /api/users/me/profession
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface ChangeProfessionRequest {
  professionId: number;
}
```

**⚠️ Business Rule:** Verified professions cannot be changed.

---

### 5.7 Delete Account

```http
DELETE /api/users/me
Authorization: Bearer {accessToken}
```

Soft-deletes the account. User data anonymized after 30 days.

---

## 6. Profession Endpoints

### 6.1 Get All Professions

```http
GET /api/professions
```

**No auth required**

**Response:**

```typescript
interface ProfessionResponse {
  id: number;
  name: string;
  category:
    | "MEDICAL"
    | "LEGAL"
    | "ENGINEERING"
    | "EDUCATION"
    | "FINANCE"
    | "OTHER";
  description?: string;
  requiresVerification: boolean;
  verificationDocuments?: string[];
}
```

---

### 6.2 Search Professions

```http
GET /api/professions/search?q={searchTerm}
```

---

### 6.3 Get by Category

```http
GET /api/professions/category/{category}
```

---

## 7. Verification Endpoints

### 7.1 Submit Verification

```http
POST /api/verifications
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface SubmitVerificationRequest {
  professionId: number;
  documentUrl: string; // S3 URL of uploaded document
  selfieUrl: string; // S3 URL of selfie with document
}
```

**Response (201):**

```typescript
interface VerificationResponse {
  id: number;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "MANUAL_REVIEW";
  profession: {
    id: number;
    name: string;
  };
  aiConfidenceScore?: number;
  rejectionReason?: string;
  attemptCount: number;
  maxAttempts: number; // Usually 3
  createdAt: string;
  updatedAt: string;
}
```

---

### 7.2 Get Verification Status

```http
GET /api/verifications
Authorization: Bearer {accessToken}
```

Returns list of user's verification requests.

---

### 7.3 Check Eligibility

```http
GET /api/verifications/check/{professionId}
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface VerificationEligibilityResponse {
  eligible: boolean;
  reason?: string;
  remainingAttempts: number;
  cooldownEndsAt?: string; // If rejected recently
}
```

---

### 7.4 Get Verification History

```http
GET /api/verifications/history
Authorization: Bearer {accessToken}
```

---

## 8. Feed Endpoints

### 8.1 Get Personalized Feed

```http
GET /api/feed?limit=20&professionFilter={professionId}
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `limit`: Max results (default: 20, max: 50)
- `professionFilter`: Optional profession ID filter

**Response:**

```typescript
interface FeedPostResponse {
  postId: number;
  author: {
    id: number;
    name: string;
    surname: string;
    avatarUrl?: string;
    isVerified: boolean;
    profession?: string;
  };
  content: string;
  images: string[];
  stats: {
    likeCount: number;
    commentCount: number;
    viewCount: number;
  };
  userInteraction: {
    isLiked: boolean;
    isSaved: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

### 8.2 Get Trending Posts

```http
GET /api/feed/trending?limit=20
Authorization: Bearer {accessToken}
```

Returns posts from last 7 days ranked by engagement score.

---

## 9. Post Endpoints

### 9.1 Create Post

```http
POST /api/posts
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface CreatePostRequest {
  content: string; // 1-1000 chars
  images?: string[]; // Max 5 S3 URLs
  professionId?: number; // Optional profession tag
}
```

---

### 9.2 Get Post by ID

```http
GET /api/posts/{postId}
Authorization: Bearer {accessToken}
```

---

### 9.3 Delete Post

```http
DELETE /api/posts/{postId}
Authorization: Bearer {accessToken}
```

Only post author can delete. Returns 204 No Content.

---

### 9.4 Like Post

```http
POST /api/posts/{postId}/like
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}
```

---

### 9.5 Unlike Post

```http
DELETE /api/posts/{postId}/like
Authorization: Bearer {accessToken}
```

---

## 10. Comment Endpoints

### 10.1 Get Post Comments

```http
GET /api/posts/{postId}/comments?page=0&size=20
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface CommentListResponse {
  comments: CommentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface CommentResponse {
  id: string;
  author: {
    id: number;
    name: string;
    surname: string;
    avatarUrl?: string;
  };
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}
```

---

### 10.2 Add Comment

```http
POST /api/posts/{postId}/comments
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface AddCommentRequest {
  content: string; // 1-500 chars
}
```

---

### 10.3 Delete Comment

```http
DELETE /api/posts/{postId}/comments/{commentId}
Authorization: Bearer {accessToken}
```

Only comment author or post author can delete.

---

## 11. Follow Endpoints

### 11.1 Follow User

```http
POST /api/users/{userId}/follow
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface FollowResponse {
  following: boolean;
  followerCount: number;
  followingCount: number;
}
```

---

### 11.2 Unfollow User

```http
DELETE /api/users/{userId}/follow
Authorization: Bearer {accessToken}
```

---

### 11.3 Get Followers

```http
GET /api/users/{userId}/followers
Authorization: Bearer {accessToken}
```

---

### 11.4 Get Following

```http
GET /api/users/{userId}/following
Authorization: Bearer {accessToken}
```

---

## 12. Messaging Endpoints

### 12.1 Get Conversations

```http
GET /api/conversations?page=0&size=20
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface ConversationListResponse {
  conversations: ConversationDto[];
  page: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
}

interface ConversationDto {
  id: string; // UUID
  otherParticipant: {
    id: number;
    name: string;
    surname: string;
    avatarUrl?: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage?: {
    content: string;
    senderId: number;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}
```

---

### 12.2 Get Messages

```http
GET /api/conversations/{conversationId}/messages?page=0&size=30
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface MessageListResponse {
  messages: MessageDto[];
  page: number;
  size: number;
  hasNext: boolean;
}

interface MessageDto {
  id: string; // UUID
  conversationId: string;
  senderId: number;
  content: string;
  attachment?: {
    url: string;
    contentType: string;
    fileName: string;
    fileSize: number;
  };
  status: "SENDING" | "SENT" | "DELIVERED" | "READ";
  sentAt: string;
  readAt?: string;
}
```

---

### 12.3 Send Message

```http
POST /api/messages
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface SendMessageRequest {
  recipientId: number;
  content: string; // 1-2000 chars
  attachment?: {
    s3Key: string;
    url: string;
    contentType: string;
    fileSize: number;
    fileName: string;
  };
}
```

---

### 12.4 Mark as Read

```http
PUT /api/conversations/{conversationId}/read
Authorization: Bearer {accessToken}
```

---

### 12.5 Delete Message

```http
DELETE /api/conversations/{conversationId}/messages/{messageId}
Authorization: Bearer {accessToken}
```

---

### 12.6 Get Unread Count

```http
GET /api/conversations/unread-count
Authorization: Bearer {accessToken}
```

**Response:**

```json
{ "unreadCount": 5 }
```

---

### 12.7 Search Messages

```http
GET /api/messages/search?q={query}&page=0&size=20
Authorization: Bearer {accessToken}
```

---

### 12.8 Get Attachment Upload URL

```http
POST /api/messages/attachments/upload-url
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface AttachmentUploadRequest {
  conversationId?: string;
  fileName: string;
  contentType: string;
  fileSize: number; // Max 10MB
}
```

**Response:**

```typescript
interface AttachmentUploadResponse {
  uploadUrl: string; // Presigned S3 URL
  s3Key: string;
  expiresIn: number; // seconds
  instructions: {
    method: "PUT";
    contentType: string;
    maxFileSize: number;
  };
}
```

---

## 13. Notification Endpoints

### 13.1 Get Notifications

```http
GET /api/notifications?page=0&size=20&unreadOnly=false
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface NotificationListResponse {
  notifications: NotificationDto[];
  unreadCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

interface NotificationDto {
  id: string; // UUID
  type:
    | "NEW_FOLLOWER"
    | "POST_LIKE"
    | "POST_COMMENT"
    | "MENTION"
    | "MESSAGE"
    | "VERIFICATION_APPROVED"
    | "VERIFICATION_REJECTED"
    | "SYSTEM";
  title: string;
  message: string;
  data?: {
    postId?: number;
    userId?: number;
    commentId?: string;
    conversationId?: string;
  };
  isRead: boolean;
  createdAt: string;
}
```

---

### 13.2 Get Unread Count

```http
GET /api/notifications/unread-count
Authorization: Bearer {accessToken}
```

**Response:**

```json
{ "unreadCount": 12 }
```

---

### 13.3 Mark as Read

```http
POST /api/notifications/{notificationId}/read
Authorization: Bearer {accessToken}
```

---

### 13.4 Mark Multiple as Read

```http
POST /api/notifications/mark-as-read
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface MarkAsReadRequest {
  markAll?: boolean;
  notificationIds?: string[];
}
```

---

### 13.5 Get Preferences

```http
GET /api/notifications/preferences
Authorization: Bearer {accessToken}
```

**Response:**

```typescript
interface NotificationPreferencesResponse {
  pushEnabled: boolean;
  emailEnabled: boolean;
  categories: {
    followers: boolean;
    likes: boolean;
    comments: boolean;
    messages: boolean;
    verification: boolean;
    marketing: boolean;
  };
}
```

---

### 13.6 Update Preferences

```http
PUT /api/notifications/preferences
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## 14. Device Token Endpoints (Push Notifications)

### 14.1 Register Device

```http
POST /api/v1/devices/register
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface RegisterDeviceRequest {
  token: string; // FCM token
  platform: "IOS" | "ANDROID";
  deviceName?: string;
}
```

---

### 14.2 Unregister Device

```http
POST /api/v1/devices/unregister
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface UnregisterDeviceRequest {
  token: string;
}
```

---

### 14.3 Unregister All Devices

```http
POST /api/v1/devices/unregister-all
Authorization: Bearer {accessToken}
```

Call on password change or security event.

---

## 15. Report Endpoints (Content Moderation)

### 15.1 Create Report

```http
POST /api/reports
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**

```typescript
interface ReportRequest {
  contentId: string;
  contentType: "POST" | "COMMENT" | "MESSAGE" | "USER";
  reason:
    | "SPAM"
    | "HARASSMENT"
    | "INAPPROPRIATE"
    | "VIOLENCE"
    | "HATE_SPEECH"
    | "OTHER";
  description?: string;
}
```

---

### 15.2 Get My Reports

```http
GET /api/reports/my-reports
Authorization: Bearer {accessToken}
```

---

### 15.3 Cancel Report

```http
DELETE /api/reports/{reportId}
Authorization: Bearer {accessToken}
```

Only pending reports can be cancelled.

---

### 15.4 Check If Reported

```http
GET /api/reports/check?contentId={uuid}&type={POST|COMMENT|MESSAGE|USER}
Authorization: Bearer {accessToken}
```

---

## 16. WebSocket (Real-time Messaging)

### 16.1 Connection

```
URL: ws://localhost:8080/ws (dev)
     wss://api.meslektas.com/ws (prod)

STOMP Protocol with SockJS fallback
```

**Connection with Authentication:**

```typescript
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const client = new Client({
  webSocketFactory: () => new SockJS(`${API_URL}/ws`),
  connectHeaders: {
    Authorization: `Bearer ${accessToken}`,
  },
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
  reconnectDelay: 5000,
});

client.activate();
```

### 16.2 Client → Server Destinations

| Destination        | Purpose          | Payload                |
| ------------------ | ---------------- | ---------------------- |
| `/app/chat.send`   | Send message     | `WsSendMessageRequest` |
| `/app/chat.typing` | Typing indicator | `WsTypingNotification` |
| `/app/chat.read`   | Mark as read     | `WsReadReceipt`        |

### 16.3 Server → Client Destinations

| Destination                 | Purpose             | Payload                |
| --------------------------- | ------------------- | ---------------------- |
| `/user/queue/messages`      | New message         | `WsMessageResponse`    |
| `/user/queue/typing`        | Typing notification | `WsTypingNotification` |
| `/user/queue/read`          | Read receipt        | `WsReadReceipt`        |
| `/user/queue/errors`        | Error notification  | `WsErrorResponse`      |
| `/user/queue/notifications` | Push notification   | `NotificationDto`      |

### 16.4 WebSocket Message Types

```typescript
// Send Message
interface WsSendMessageRequest {
  recipientId: number;
  content: string;
  attachment?: {
    s3Key: string;
    url: string;
    contentType: string;
    fileSize: number;
    fileName: string;
  };
}

// Message Response
interface WsMessageResponse {
  messageId: string;
  conversationId: string;
  senderId: number;
  recipientId: number;
  content: string;
  attachment?: AttachmentData;
  status: "SENT" | "DELIVERED" | "READ";
  sentAt: string;
}

// Typing Notification
interface WsTypingNotification {
  conversationId: string;
  recipientId: number;
  isTyping: boolean;
}

// Read Receipt
interface WsReadReceipt {
  conversationId: string;
  readByUserId: number;
  messagesRead: number;
  readAt: string;
}

// Error Response
interface WsErrorResponse {
  code: "VALIDATION_ERROR" | "FORBIDDEN" | "INTERNAL_ERROR";
  message: string;
  action: string;
}
```

---

## 17. Error Codes Reference

| Code                  | HTTP Status | Description              |
| --------------------- | ----------- | ------------------------ |
| `VALIDATION_ERROR`    | 400/422     | Invalid request data     |
| `UNAUTHORIZED`        | 401         | Missing or invalid token |
| `FORBIDDEN`           | 403         | Insufficient permissions |
| `NOT_FOUND`           | 404         | Resource not found       |
| `CONFLICT`            | 409         | Resource already exists  |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests        |
| `INTERNAL_ERROR`      | 500         | Server error             |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily down |

---

## 18. Rate Limiting

| Endpoint Group        | Limit                        |
| --------------------- | ---------------------------- |
| Auth (login/register) | 10 requests/minute per IP    |
| General API           | 100 requests/minute per user |
| Feed                  | 60 requests/minute per user  |
| Post creation         | 10 posts/hour per user       |
| Like/Unlike           | 100 actions/hour per user    |
| Comment               | 30 comments/hour per user    |
| Follow                | 60 follows/hour per user     |
| Upload                | 20 uploads/hour per user     |

**Response Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1638360000
```

---

## 19. Mobile Integration Tips

### 19.1 Token Management

```typescript
// Always check token expiry before requests
const isTokenExpired = (expiresAt: number) => {
  return Date.now() > expiresAt - 60000; // 1 min buffer
};

// Refresh proactively
if (isTokenExpired(tokenExpiresAt)) {
  await refreshToken();
}
```

### 19.2 Optimistic Updates

```typescript
// Like a post optimistically
const likePost = async (postId: number) => {
  // Update UI immediately
  setPost((prev) => ({
    ...prev,
    isLiked: true,
    likeCount: prev.likeCount + 1,
  }));

  try {
    await apiClient.post(`/posts/${postId}/like`);
  } catch (error) {
    // Revert on failure
    setPost((prev) => ({
      ...prev,
      isLiked: false,
      likeCount: prev.likeCount - 1,
    }));
  }
};
```

### 19.3 WebSocket Reconnection

```typescript
const reconnectWithBackoff = (attempt: number) => {
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
  setTimeout(() => client.activate(), delay);
};
```

### 19.4 Image Upload Flow

```typescript
const uploadImage = async (
  imageUri: string,
  type: "avatar" | "post" | "document"
) => {
  // 1. Get presigned URL
  const { uploadUrl, s3Key } = await getPresignedUrl(fileName, contentType);

  // 2. Upload to S3
  await fetch(uploadUrl, {
    method: "PUT",
    body: await fetch(imageUri).then((r) => r.blob()),
    headers: { "Content-Type": contentType },
  });

  // 3. Use S3 URL in API request
  return s3Key;
};
```

---

## 20. Summary

### Endpoint Counts by Context

| Context      | REST Endpoints | WebSocket Events |
| ------------ | -------------- | ---------------- |
| Auth         | 7              | 0                |
| User         | 8              | 0                |
| Profession   | 6              | 0                |
| Verification | 5              | 0                |
| Feed         | 2              | 0                |
| Posts        | 5              | 0                |
| Comments     | 3              | 0                |
| Follow       | 4              | 0                |
| Messaging    | 8              | 4                |
| Notification | 6              | 1                |
| Device       | 3              | 0                |
| Reports      | 5              | 0                |
| **Total**    | **62**         | **5**            |

### Key Integration Points

- ✅ JWT token with 24h expiry, auto-refresh
- ✅ OAuth2 (Google & Apple) for social login
- ✅ WebSocket STOMP for real-time messaging
- ✅ S3 presigned URLs for secure uploads
- ✅ FCM for push notifications
- ✅ Cursor-based pagination for feeds
- ✅ Rate limiting with clear headers
- ✅ Comprehensive error codes

**Result:** Production-ready API with complete mobile integration support.
