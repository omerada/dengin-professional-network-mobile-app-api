// src/core/api/endpoints.ts
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

/**
 * API endpoint definitions
 * Backend API Reference ile %100 uyumlu
 */
export const API_ENDPOINTS = {
  // Authentication - Backend: /api/auth/*
  // Backend: com.dengin.identity.api.AuthController
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/password-reset/request',
    RESET_PASSWORD: '/api/auth/password-reset/confirm',
    VERIFY_EMAIL: '/api/auth/verify-email',
    // Şifre değiştirme - authenticated users only
    CHANGE_PASSWORD: '/api/auth/change-password',
    // OAuth2 endpoints - Backend: OAuth2Controller
    OAUTH_GOOGLE: '/api/auth/oauth/google',
    OAUTH_APPLE: '/api/auth/oauth/apple',
    OAUTH2_CALLBACK: '/api/auth/oauth2/callback',
  },

  // User - Backend: /api/users/*
  USER: {
    ME: '/api/users/me',
    PROFILE: '/api/users/profile',
    BY_ID: (id: string | number) => `/api/users/${id}`,
    UPDATE_PROFILE: '/api/users/me',
    UPDATE_AVATAR: '/api/users/me/avatar',
    CHANGE_PROFESSION: '/api/users/me/profession',
    DELETE_ACCOUNT: '/api/users/me',
    SEARCH: '/api/users/search',
  },

  // Professions - Backend: /api/professions/*
  // Backend: com.dengin.identity.api.ProfessionController
  PROFESSIONS: {
    LIST: '/api/professions',
    SEARCH: '/api/professions/search',
    BY_CATEGORY: (category: string) => `/api/professions/category/${category}`,
    BY_ID: (id: string | number) => `/api/professions/${id}`,
    // GET /api/professions/verification-required - Professions requiring AI verification
    VERIFICATION_REQUIRED: '/api/professions/verification-required',
    // GET /api/professions/stats - Profession statistics
    STATS: '/api/professions/stats',
  },

  // Verification - Backend: /api/verifications/*
  // Backend: com.dengin.verification.api.VerificationController
  VERIFICATION: {
    // POST /api/verifications - Submit verification
    SUBMIT: '/api/verifications',
    // GET /api/verifications - Get user's verification list
    LIST: '/api/verifications',
    // GET /api/verifications/{id} - Get verification by ID
    BY_ID: (id: string | number) => `/api/verifications/${id}`,
    // GET /api/verifications/check/{professionId} - Check eligibility
    CHECK_ELIGIBILITY: (professionId: number) => `/api/verifications/check/${professionId}`,
    // GET /api/verifications/history - Get verification history
    HISTORY: '/api/verifications/history',
  },

  // Feed - Backend: /api/feed/* and /api/posts/*
  // NOT: Tüm postId'ler string olarak gönderilmeli (Backend String olarak alıyor)
  FEED: {
    // GET /api/feed - Personalized feed
    PERSONALIZED: '/api/feed',
    // GET /api/feed/trending - Trending posts
    TRENDING: '/api/feed/trending',
    // GET /api/posts - All posts (for search/filter)
    LIST: '/api/posts',
    POST_BY_ID: (id: string | number) => `/api/posts/${String(id)}`,
    CREATE_POST: '/api/posts',
    UPDATE_POST: (id: string | number) => `/api/posts/${String(id)}`,
    DELETE_POST: (id: string | number) => `/api/posts/${String(id)}`,
    LIKE_POST: (id: string | number) => `/api/posts/${String(id)}/like`,
    UNLIKE_POST: (id: string | number) => `/api/posts/${String(id)}/like`,
    // POST /api/posts/{id}/save - Save post
    SAVE_POST: (id: string | number) => `/api/posts/${String(id)}/save`,
    // DELETE /api/posts/{id}/save - Unsave post
    UNSAVE_POST: (id: string | number) => `/api/posts/${String(id)}/save`,
    REPORT_POST: (id: string | number) => `/api/posts/${String(id)}/report`,
    SHARE_POST: (id: string | number) => `/api/posts/${String(id)}/share`,
    // GET /api/posts/saved - Get saved posts
    SAVED: '/api/posts/saved',
    USER_POSTS: (userId: string | number) => `/api/users/${String(userId)}/posts`,
    FOLLOWING: '/api/posts/following',
  },

  // Comments - Backend: /api/posts/{postId}/comments/*
  // Backend CommentController endpoints:
  // - POST /api/posts/{postId}/comments - Yorum ekle
  // - GET /api/posts/{postId}/comments - Yorumları getir
  // - DELETE /api/posts/{postId}/comments/{commentId} - Yorum sil
  // - POST /api/posts/{postId}/comments/{commentId}/like - Yorum beğen
  // - DELETE /api/posts/{postId}/comments/{commentId}/like - Yorum beğenmekten vazgeç
  // NOT: postId string olarak gönderilmeli
  COMMENTS: {
    BY_POST: (postId: string | number) => `/api/posts/${String(postId)}/comments`,
    CREATE: (postId: string | number) => `/api/posts/${String(postId)}/comments`,
    DELETE: (postId: string | number, commentId: string) =>
      `/api/posts/${String(postId)}/comments/${commentId}`,
    LIKE: (postId: string | number, commentId: string) =>
      `/api/posts/${String(postId)}/comments/${commentId}/like`,
    UNLIKE: (postId: string | number, commentId: string) =>
      `/api/posts/${String(postId)}/comments/${commentId}/like`,
  },

  // Messaging - Backend: /api/conversations/* and /api/messages/*
  // Backend: com.dengin.messaging.api.ConversationController
  MESSAGING: {
    // Conversation endpoints
    CONVERSATIONS: '/api/conversations',
    CONVERSATION_BY_ID: (id: string | number) => `/api/conversations/${id}`,
    MESSAGES: (conversationId: string | number) => `/api/conversations/${conversationId}/messages`,
    // POST /api/messages - Backend expects recipientId in body, not in URL
    SEND_MESSAGE: '/api/messages',
    START_CONVERSATION: '/api/conversations',
    MARK_READ: (conversationId: string | number) => `/api/conversations/${conversationId}/read`,
    // DELETE /api/conversations/{conversationId}/messages/{messageId}
    DELETE_MESSAGE: (conversationId: string | number, messageId: string) =>
      `/api/conversations/${conversationId}/messages/${messageId}`,
    // GET /api/conversations/unread-count
    UNREAD_COUNT: '/api/conversations/unread-count',
    // GET /api/messages/search
    SEARCH: '/api/messages/search',
    // POST /api/messages/attachments/upload-url
    ATTACHMENT_UPLOAD_URL: '/api/messages/attachments/upload-url',
    // Archive endpoints (not implemented in backend yet)
    ARCHIVE: (conversationId: string | number) => `/api/conversations/${conversationId}/archive`,
    UNARCHIVE: (conversationId: string | number) =>
      `/api/conversations/${conversationId}/unarchive`,
  },

  // Notifications - Backend: /api/notifications/*
  // Device token işlemleri /api/devices/* altında
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    BY_ID: (id: string | number) => `/api/notifications/${id}`,
    UNREAD_COUNT: '/api/notifications/unread-count',
    MARK_READ: (id: string | number) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-as-read',
    SETTINGS: '/api/notifications/preferences',
    UPDATE_SETTINGS: '/api/notifications/preferences',
    // Device token endpoints - Backend: /api/devices/*
    // NOT: Bu endpoint'ler DeviceTokenController altında, NotificationController'da değil!
    REGISTER_DEVICE: '/api/devices/register',
    UNREGISTER_DEVICE: '/api/devices/unregister',
    UNREGISTER_ALL_DEVICES: '/api/devices/unregister-all',
  },

  // Media - Backend: /api/media/*
  MEDIA: {
    UPLOAD: '/api/media/upload',
    UPLOAD_MULTIPLE: '/api/media/upload-multiple',
    PRESIGNED_URL: '/api/media/presigned-url',
    DELETE: (id: string) => `/api/media/${id}`,
  },

  // Social - Backend: /api/users/{userId}/*
  // Backend: com.dengin.social.api.FollowController, BlockController
  SOCIAL: {
    // Follow endpoints
    FOLLOW: (userId: string | number) => `/api/users/${userId}/follow`,
    UNFOLLOW: (userId: string | number) => `/api/users/${userId}/follow`,
    FOLLOWERS: (userId: string | number) => `/api/users/${userId}/followers`,
    FOLLOWING: (userId: string | number) => `/api/users/${userId}/following`,
    // Block endpoints
    BLOCK: (userId: string | number) => `/api/users/${userId}/block`,
    UNBLOCK: (userId: string | number) => `/api/users/${userId}/block`,
    // GET /api/users/me/blocked - Get list of blocked users
    BLOCKED_USERS: '/api/users/me/blocked',
    // GET /api/users/{userId}/block/status - Check block status
    BLOCK_STATUS: (userId: string | number) => `/api/users/${userId}/block/status`,
    // Report endpoint (not implemented in backend yet)
    REPORT: (userId: string | number) => `/api/users/${userId}/report`,
  },

  // Sanctions - Backend: /api/sanctions/*
  // Backend: com.dengin.moderation.api.SanctionController
  SANCTIONS: {
    // GET /api/sanctions/my-sanctions - Get all my sanctions
    MY_SANCTIONS: '/api/sanctions/my-sanctions',
    // GET /api/sanctions/my-sanctions/active - Get active sanctions only
    MY_ACTIVE_SANCTIONS: '/api/sanctions/my-sanctions/active',
    // GET /api/sanctions/{sanctionId} - Get sanction by ID
    BY_ID: (sanctionId: string) => `/api/sanctions/${sanctionId}`,
    // POST /api/sanctions/appeal - Submit appeal
    APPEAL: '/api/sanctions/appeal',
    // GET /api/sanctions/status - Check sanction status
    STATUS: '/api/sanctions/status',
    // GET /api/sanctions/remaining-time - Get remaining suspension time
    REMAINING_TIME: '/api/sanctions/remaining-time',
  },

  // Trends - Backend: /api/trends/*
  // Backend: com.dengin.social.api.TrendController
  // OpenRouter AI integration for profession-specific trends
  TRENDS: '/api/trends',

  // User Suggestions - Backend: /api/users/suggested
  // Backend: com.dengin.social.api.SuggestionController
  // Algorithm-based user recommendations
  USER_SUGGESTIONS: '/api/users/suggested',
} as const;

/**
 * WebSocket STOMP destinations
 *
 * Backend: WebSocketConfig.java, MessageWebSocketController.java
 *
 * Endpoint: /ws (SockJS), /ws-raw (Raw WebSocket for mobile)
 *
 * Akış:
 * - Client → Server: /app/* prefix'i ile @MessageMapping metodlarına
 * - Server → Client: /user/queue/* veya /topic/* ile subscribe edilen kanallara
 */
export const WS_DESTINATIONS = {
  // WebSocket endpoint (SockJS veya raw)
  ENDPOINT: '/ws',
  ENDPOINT_RAW: '/ws-raw', // Mobile için tercih edilir

  // Subscribe destinations (Server → Client)
  // NOT: Spring /user/ prefix'ini otomatik ekler, client sadece /queue/* subscribe eder
  SUBSCRIBE: {
    // Mesajlar için - "/user/queue/messages" olarak gelir
    MESSAGES: '/queue/messages',
    // Typing indicator - "/user/queue/typing" olarak gelir
    TYPING: '/queue/typing',
    // Okundu bildirimleri - "/user/queue/read" olarak gelir
    READ_RECEIPTS: '/queue/read',
    // Hatalar - "/user/queue/errors" olarak gelir
    ERRORS: '/queue/errors',
    // Bildirimler için - "/user/queue/notifications" olarak gelir
    NOTIFICATIONS: '/queue/notifications',
    // Presence (online/offline) - topic broadcast
    PRESENCE: '/topic/presence',
  },

  // Publish destinations (Client → Server)
  // Prefix: /app
  PUBLISH: {
    // Mesaj gönder - MessageWebSocketController.sendMessage()
    SEND_MESSAGE: '/app/chat.send',
    // Typing indicator - MessageWebSocketController.notifyTyping()
    TYPING: '/app/chat.typing',
    // Okundu işaretle - MessageWebSocketController.markAsRead()
    MARK_READ: '/app/chat.read',
    // Bildirim işlemleri - NotificationWebSocketController
    NOTIFICATIONS: {
      SUBSCRIBE: '/app/notifications/subscribe',
      MARK_READ: '/app/notifications/mark-read',
      MARK_ALL_READ: '/app/notifications/mark-all-read',
      UNREAD_COUNT: '/app/notifications/unread-count',
    },
  },
} as const;
