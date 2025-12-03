// src/core/api/endpoints.ts
// Oku: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

/**
 * API endpoint definitions
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH_TOKEN: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
  },

  // User
  USER: {
    ME: '/api/v1/users/me',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
    UPDATE_PROFILE: '/api/v1/users/me',
    UPDATE_AVATAR: '/api/v1/users/me/avatar',
    DELETE_ACCOUNT: '/api/v1/users/me',
    SEARCH: '/api/v1/users/search',
  },

  // Verification
  VERIFICATION: {
    STATUS: '/api/v1/verification/status',
    SUBMIT: '/api/v1/verification/submit',
    UPLOAD_DOCUMENT: '/api/v1/verification/document',
    UPLOAD_SELFIE: '/api/v1/verification/selfie',
  },

  // Feed
  FEED: {
    LIST: '/api/v1/feed',
    POST_BY_ID: (id: string) => `/api/v1/posts/${id}`,
    CREATE_POST: '/api/v1/posts',
    UPDATE_POST: (id: string) => `/api/v1/posts/${id}`,
    DELETE_POST: (id: string) => `/api/v1/posts/${id}`,
    LIKE_POST: (id: string) => `/api/v1/posts/${id}/like`,
    UNLIKE_POST: (id: string) => `/api/v1/posts/${id}/unlike`,
    BOOKMARK_POST: (id: string) => `/api/v1/posts/${id}/bookmark`,
    REPORT_POST: (id: string) => `/api/v1/posts/${id}/report`,
  },

  // Comments
  COMMENTS: {
    BY_POST: (postId: string) => `/api/v1/posts/${postId}/comments`,
    CREATE: (postId: string) => `/api/v1/posts/${postId}/comments`,
    UPDATE: (id: string) => `/api/v1/comments/${id}`,
    DELETE: (id: string) => `/api/v1/comments/${id}`,
    LIKE: (id: string) => `/api/v1/comments/${id}/like`,
  },

  // Messaging
  MESSAGING: {
    CONVERSATIONS: '/api/v1/conversations',
    CONVERSATION_BY_ID: (id: string) => `/api/v1/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/api/v1/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) => `/api/v1/conversations/${conversationId}/messages`,
    START_CONVERSATION: '/api/v1/conversations',
    MARK_READ: (conversationId: string) => `/api/v1/conversations/${conversationId}/read`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: '/api/v1/notifications/read-all',
    SETTINGS: '/api/v1/notifications/settings',
    REGISTER_DEVICE: '/api/v1/notifications/devices',
  },

  // Media
  MEDIA: {
    UPLOAD: '/api/v1/media/upload',
    UPLOAD_MULTIPLE: '/api/v1/media/upload-multiple',
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
