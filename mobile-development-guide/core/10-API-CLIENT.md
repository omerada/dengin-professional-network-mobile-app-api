# API Client

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

API Client modülü Axios tabanlı HTTP client, interceptors, error handling, retry logic ve token management sağlar.

---

## 2. Module Structure

```
src/core/api/
├── client.ts                # Axios instance
├── interceptors.ts          # Request/Response interceptors
├── endpoints.ts             # API endpoints
├── errorHandler.ts          # Error handling
└── types.ts                 # API types
```

---

## 3. API Client

**src/core/api/client.ts:**

```typescript
import axios from "axios";
import { ENV } from "@config/env";
import { setupInterceptors } from "./interceptors";

// Create axios instance
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Setup interceptors
setupInterceptors(apiClient);

export default apiClient;
```

---

## 4. Interceptors

**src/core/api/interceptors.ts:**

```typescript
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { tokenService } from "@features/auth/services/tokenService";
import { navigationRef } from "@core/navigation/navigationRef";
import { handleApiError } from "./errorHandler";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

export const setupInterceptors = (instance: AxiosInstance) => {
  // Request Interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add auth token
      const token = await tokenService.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add correlation ID for tracing
      const correlationId = generateCorrelationId();
      if (config.headers) {
        config.headers["X-Correlation-ID"] = correlationId;
      }

      // Log request (dev only)
      if (__DEV__) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response (dev only)
      if (__DEV__) {
        console.log(`[API] Response ${response.config.url}`, response.data);
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle network errors
      if (!error.response) {
        handleApiError({
          code: "NETWORK_ERROR",
          message: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
          status: 0,
        });
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue failed requests
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await tokenService.refreshAccessToken();
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Refresh failed, logout user
          await tokenService.clearTokens();
          navigationRef.navigate("Auth");

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        handleApiError({
          code: "FORBIDDEN",
          message: "Bu işlem için yetkiniz bulunmuyor.",
          status: 403,
        });
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        handleApiError({
          code: "NOT_FOUND",
          message: "Kaynak bulunamadı.",
          status: 404,
        });
      }

      // Handle 500 Server Error
      if (error.response.status >= 500) {
        handleApiError({
          code: "SERVER_ERROR",
          message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
          status: error.response.status,
        });
      }

      return Promise.reject(error);
    }
  );
};

const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

---

## 5. Error Handler

**src/core/api/errorHandler.ts:**

```typescript
import { Alert } from "react-native";
import * as Sentry from "@sentry/react-native";

export interface ApiError {
  code: string;
  message: string;
  status: number;
  data?: any;
}

export const handleApiError = (error: ApiError) => {
  // Log to Sentry
  Sentry.captureException(new Error(error.message), {
    tags: {
      errorCode: error.code,
      statusCode: error.status,
    },
    extra: error.data,
  });

  // Show user-friendly error
  if (!__DEV__ && error.status >= 500) {
    Alert.alert(
      "Hata",
      "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.",
      [{ text: "Tamam" }]
    );
  } else {
    Alert.alert("Hata", error.message, [{ text: "Tamam" }]);
  }
};

export const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return "Bilinmeyen bir hata oluştu";
};
```

---

## 6. API Endpoints

**src/core/api/endpoints.ts:**

```typescript
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    PASSWORD_RESET_REQUEST: "/api/auth/password-reset/request",
    PASSWORD_RESET_CONFIRM: "/api/auth/password-reset/confirm",
    // OAuth2
    GOOGLE: "/api/v1/auth/oauth/google",
    APPLE: "/api/v1/auth/oauth/apple",
  },

  // User
  USER: {
    ME: "/api/users/me",
    PROFILE: "/api/users/profile",
    BY_ID: (id: number) => `/api/users/${id}`,
    AVATAR: "/api/users/me/avatar",
    PROFESSION: "/api/users/me/profession",
    DELETE: "/api/users/me",
  },

  // Professions
  PROFESSION: {
    LIST: "/api/professions",
    BY_ID: (id: number) => `/api/professions/${id}`,
    BY_CATEGORY: (category: string) => `/api/professions/category/${category}`,
    SEARCH: "/api/professions/search",
    VERIFICATION_REQUIRED: "/api/professions/verification-required",
  },

  // Verification
  VERIFICATION: {
    SUBMIT: "/api/verifications",
    LIST: "/api/verifications",
    BY_ID: (id: number) => `/api/verifications/${id}`,
    HISTORY: "/api/verifications/history",
    CHECK: (professionId: number) => `/api/verifications/check/${professionId}`,
  },

  // Feed
  FEED: {
    GET: "/api/feed",
    TRENDING: "/api/feed/trending",
  },

  // Posts
  POST: {
    CREATE: "/api/posts",
    BY_ID: (id: number) => `/api/posts/${id}`,
    DELETE: (id: number) => `/api/posts/${id}`,
    LIKE: (id: number) => `/api/posts/${id}/like`,
    UNLIKE: (id: number) => `/api/posts/${id}/like`,
    COMMENTS: (id: number) => `/api/posts/${id}/comments`,
    ADD_COMMENT: (id: number) => `/api/posts/${id}/comments`,
    DELETE_COMMENT: (postId: number, commentId: string) =>
      `/api/posts/${postId}/comments/${commentId}`,
  },

  // Follow
  FOLLOW: {
    FOLLOW: (userId: number) => `/api/users/${userId}/follow`,
    UNFOLLOW: (userId: number) => `/api/users/${userId}/follow`,
    FOLLOWERS: (userId: number) => `/api/users/${userId}/followers`,
    FOLLOWING: (userId: number) => `/api/users/${userId}/following`,
  },

  // Messaging
  MESSAGING: {
    CONVERSATIONS: "/api/conversations",
    MESSAGES: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,
    SEND: "/api/messages",
    MARK_READ: (conversationId: string) =>
      `/api/conversations/${conversationId}/read`,
    DELETE_MESSAGE: (conversationId: string, messageId: string) =>
      `/api/conversations/${conversationId}/messages/${messageId}`,
    UNREAD_COUNT: "/api/conversations/unread-count",
    SEARCH: "/api/messages/search",
    ATTACHMENT_UPLOAD_URL: "/api/messages/attachments/upload-url",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    BY_ID: (id: string) => `/api/notifications/${id}`,
    UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_AS_READ: "/api/notifications/mark-as-read",
    PREFERENCES: "/api/notifications/preferences",
  },

  // Device Tokens (Push Notifications)
  DEVICE: {
    REGISTER: "/api/v1/devices/register",
    UNREGISTER: "/api/v1/devices/unregister",
    UNREGISTER_ALL: "/api/v1/devices/unregister-all",
  },

  // Reports (Content Moderation)
  REPORT: {
    CREATE: "/api/reports",
    MY_REPORTS: "/api/reports/my-reports",
    BY_ID: (id: string) => `/api/reports/${id}`,
    CANCEL: (id: string) => `/api/reports/${id}`,
    CHECK: "/api/reports/check",
  },
} as const;
```

---

## 7. API Types

**src/core/api/types.ts:**

```typescript
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## 8. Retry Logic

**src/core/api/retry.ts:**

```typescript
import type { AxiosInstance, AxiosRequestConfig } from "axios";

export const retryRequest = async <T>(
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
};
```

---

## 9. Usage Examples

**Basic GET request:**

```typescript
import { apiClient } from "@core/api/client";

const fetchPosts = async () => {
  const response = await apiClient.get("/feed");
  return response.data;
};
```

**POST request with data:**

```typescript
const createPost = async (content: string) => {
  const response = await apiClient.post("/posts", { content });
  return response.data;
};
```

**Upload file:**

```typescript
const uploadImage = async (uri: string) => {
  const formData = new FormData();
  formData.append("image", {
    uri,
    type: "image/jpeg",
    name: "photo.jpg",
  });

  const response = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
```

**With retry:**

```typescript
import { retryRequest } from "@core/api/retry";

const fetchWithRetry = async () => {
  return await retryRequest(
    apiClient,
    {
      method: "GET",
      url: "/important-data",
    },
    3,
    1000
  );
};
```

---

## 10. Summary

### Features:

- ✅ Axios-based HTTP client
- ✅ Auto token injection
- ✅ Auto token refresh on 401
- ✅ Request/Response logging (dev)
- ✅ Error handling with user-friendly messages
- ✅ Correlation ID for tracing
- ✅ Retry logic for network errors
- ✅ Sentry error tracking

**Result:** Production-ready API client with comprehensive error handling.
