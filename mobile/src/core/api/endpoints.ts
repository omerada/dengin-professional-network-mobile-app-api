// src/core/api/endpoints.ts
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

/**
 * API endpoint definitions
 * Backend API Reference ile %100 uyumlu
 */
export const API_ENDPOINTS = {
  // Authentication - Backend: /api/auth/*
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/password-reset/request',
    RESET_PASSWORD: '/api/auth/password-reset/confirm',
    VERIFY_EMAIL: '/api/auth/verify-email',
    CHANGE_PASSWORD: '/api/auth/change-password',
    // OAuth2 endpoints
    OAUTH_GOOGLE: '/api/v1/auth/oauth/google',
    OAUTH_APPLE: '/api/v1/auth/oauth/apple',
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
  PROFESSIONS: {
    LIST: '/api/professions',
    SEARCH: '/api/professions/search',
    BY_CATEGORY: (category: string) => `/api/professions/category/${category}`,
    BY_ID: (id: string | number) => `/api/professions/${id}`,
  },

  // Verification - Backend: /api/verifications/*
  VERIFICATION: {
    // POST /api/verifications - Submit verification
    SUBMIT: '/api/verifications',
    // GET /api/verifications - Get user's verification list
    LIST: '/api/verifications',
    // GET /api/verifications/check/{professionId} - Check eligibility
    CHECK_ELIGIBILITY: (professionId: number) => `/api/verifications/check/${professionId}`,
    // GET /api/verifications/history - Get verification history
    HISTORY: '/api/verifications/history',
  },

  // Feed - Backend: /api/feed/* and /api/posts/*
  FEED: {
    // GET /api/feed - Personalized feed
    PERSONALIZED: '/api/feed',
    // GET /api/feed/trending - Trending posts
    TRENDING: '/api/feed/trending',
    // GET /api/posts - All posts (for search/filter)
    LIST: '/api/posts',
    POST_BY_ID: (id: string | number) => `/api/posts/${id}`,
    CREATE_POST: '/api/posts',
    UPDATE_POST: (id: string | number) => `/api/posts/${id}`,
    DELETE_POST: (id: string | number) => `/api/posts/${id}`,
    LIKE_POST: (id: string | number) => `/api/posts/${id}/like`,
    UNLIKE_POST: (id: string | number) => `/api/posts/${id}/like`,
    // POST /api/posts/{id}/save - Save post
    SAVE_POST: (id: string | number) => `/api/posts/${id}/save`,
    // DELETE /api/posts/{id}/save - Unsave post
    UNSAVE_POST: (id: string | number) => `/api/posts/${id}/save`,
    REPORT_POST: (id: string | number) => `/api/posts/${id}/report`,
    SHARE_POST: (id: string | number) => `/api/posts/${id}/share`,
    // GET /api/posts/saved - Get saved posts
    SAVED: '/api/posts/saved',
    USER_POSTS: (userId: string | number) => `/api/users/${userId}/posts`,
    FOLLOWING: '/api/posts/following',
  },

  // Comments - Backend: /api/posts/{postId}/comments/*
  COMMENTS: {
    BY_POST: (postId: string | number) => `/api/posts/${postId}/comments`,
    CREATE: (postId: string | number) => `/api/posts/${postId}/comments`,
    UPDATE: (id: string | number) => `/api/comments/${id}`,
    DELETE: (id: string | number) => `/api/comments/${id}`,
    LIKE: (id: string | number) => `/api/comments/${id}/like`,
    UNLIKE: (id: string | number) => `/api/comments/${id}/like`,
    REPLIES: (id: string | number) => `/api/comments/${id}/replies`,
  },

  // Messaging - Backend: /api/conversations/*
  MESSAGING: {
    CONVERSATIONS: '/api/conversations',
    CONVERSATION_BY_ID: (id: string | number) => `/api/conversations/${id}`,
    MESSAGES: (conversationId: string | number) => `/api/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string | number) => `/api/conversations/${conversationId}/messages`,
    START_CONVERSATION: '/api/conversations',
    MARK_READ: (conversationId: string | number) => `/api/conversations/${conversationId}/read`,
    ARCHIVE: (conversationId: string | number) => `/api/conversations/${conversationId}/archive`,
    UNARCHIVE: (conversationId: string | number) => `/api/conversations/${conversationId}/unarchive`,
  },

  // Notifications - Backend: /api/notifications/*
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id: string | number) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
    SETTINGS: '/api/notifications/settings',
    UPDATE_SETTINGS: '/api/notifications/settings',
    REGISTER_DEVICE: '/api/notifications/devices',
    UNREGISTER_DEVICE: (deviceId: string) => `/api/notifications/devices/${deviceId}`,
  },

  // Media - Backend: /api/media/*
  MEDIA: {
    UPLOAD: '/api/media/upload',
    UPLOAD_MULTIPLE: '/api/media/upload-multiple',
    PRESIGNED_URL: '/api/media/presigned-url',
    DELETE: (id: string) => `/api/media/${id}`,
  },

  // Social - Backend: /api/users/{userId}/*
  SOCIAL: {
    FOLLOW: (userId: string | number) => `/api/users/${userId}/follow`,
    UNFOLLOW: (userId: string | number) => `/api/users/${userId}/follow`,
    FOLLOWERS: (userId: string | number) => `/api/users/${userId}/followers`,
    FOLLOWING: (userId: string | number) => `/api/users/${userId}/following`,
    BLOCK: (userId: string | number) => `/api/users/${userId}/block`,
    UNBLOCK: (userId: string | number) => `/api/users/${userId}/block`,
    REPORT: (userId: string | number) => `/api/users/${userId}/report`,
  },
} as const;

/**
 * WebSocket STOMP destinations
 */
export const WS_DESTINATIONS = {
  // Subscribe destinations
  SUBSCRIBE: {
    USER_QUEUE: (userId: string) => `/user/${userId}/queue/messages`,
    CONVERSATION: (conversationId: string) => `/topic/conversation/${conversationId}`,
    TYPING: (conversationId: string) => `/topic/conversation/${conversationId}/typing`,
    PRESENCE: '/topic/presence',
    NOTIFICATIONS: (userId: string) => `/user/${userId}/queue/notifications`,
  },

  // Publish destinations
  PUBLISH: {
    SEND_MESSAGE: '/app/chat.send',
    TYPING_START: '/app/chat.typing.start',
    TYPING_STOP: '/app/chat.typing.stop',
    MARK_READ: '/app/chat.read',
    PRESENCE_UPDATE: '/app/presence.update',
  },
} as const;
