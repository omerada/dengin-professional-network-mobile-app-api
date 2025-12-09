# 🔌 API Integration Guide

> **Backend Communication** - REST API, WebSocket, Authentication, Error Handling

## 🌐 API Overview

**Base URL:** `http://localhost:8080` (development)

**Platform-Specific URLs:**

```typescript
// Android Emulator
http://10.0.2.2:8080

// iOS Simulator
http://localhost:8080

// Real Device (set your machine's local IP)
http://192.168.x.x:8080
```

---

## 🔧 API Client Setup

### Configuration

```typescript
// src/core/api/client.ts

import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { ENV } from '@config/env';
import { secureStorage } from '@core/storage';

// Auto-detect platform-specific URL
const getApiBaseUrl = (): string => {
  let baseUrl = ENV.API_BASE_URL;

  if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
    // Android emulator special IP
    baseUrl = baseUrl.replace('localhost', '10.0.2.2');
  }

  return baseUrl;
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor (Auto-attach JWT)

```typescript
// Automatically add JWT token to all requests
apiClient.interceptors.request.use(
  async config => {
    const token = await secureStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  error => Promise.reject(error),
);
```

### Response Interceptor (Auto-refresh token)

```typescript
// Auto-refresh token on 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.getItem('refreshToken');

        // Call refresh endpoint
        const { data } = await axios.post(`${getApiBaseUrl()}/api/auth/refresh`, { refreshToken });

        // Save new tokens
        await secureStorage.setItem('accessToken', data.accessToken);
        await secureStorage.setItem('refreshToken', data.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await secureStorage.removeItem('accessToken');
        await secureStorage.removeItem('refreshToken');

        // Navigate to login (use navigation ref)
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

---

## 🔐 Authentication API

### Login

```typescript
// features/auth/services/authApi.ts

import { apiClient } from '@core/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },

  // Register
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/users/me');
    return data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh', { refreshToken });
    return data;
  },
};
```

### Login Hook (with React Query)

```typescript
// features/auth/hooks/useLogin.ts

import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { authApi, LoginRequest } from '../services/authApi';
import { useAuthStore } from '../stores/authStore';
import { secureStorage } from '@core/storage';
import { useToast } from '@contexts/ToastContext';

export const useLogin = () => {
  const navigation = useNavigation();
  const setUser = useAuthStore(state => state.setUser);
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),

    onSuccess: async (data) => {
      // Save tokens securely
      await secureStorage.setItem('accessToken', data.accessToken);
      await secureStorage.setItem('refreshToken', data.refreshToken);

      // Update auth store
      setUser(data.user);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

      showToast({
        type: 'success',
        message: `Welcome back, ${data.user.name}!`,
      });
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';

      showToast({
        type: 'error',
        message,
      });
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

// Usage in component
const LoginScreen = () => {
  const { login, isLoading } = useLogin();

  const handleSubmit = (credentials: LoginRequest) => {
    login(credentials);
  };

  return <LoginForm onSubmit={handleSubmit} loading={isLoading} />;
};
```

---

## 📡 REST API Patterns

### GET - Fetch Data

```typescript
// features/feed/services/feedApi.ts

export const feedApi = {
  // Get feed (paginated)
  getFeed: async (page: number = 0): Promise<FeedResponse> => {
    const { data } = await apiClient.get<FeedResponse>(`/api/posts/feed?page=${page}&size=20`);
    return data;
  },

  // Get single post
  getPost: async (postId: string): Promise<Post> => {
    const { data } = await apiClient.get<Post>(`/api/posts/${postId}`);
    return data;
  },
};

// Hook with React Query
export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => feedApi.getFeed(pageParam),
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => feedApi.getPost(postId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

### POST - Create Data

```typescript
export const feedApi = {
  createPost: async (postData: CreatePostRequest): Promise<Post> => {
    const { data } = await apiClient.post<Post>('/api/posts', postData);
    return data;
  },
};

// Hook with optimistic update
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: feedApi.createPost,

    onMutate: async newPost => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(['feed']);

      // Optimistically update
      queryClient.setQueryData(['feed'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any, index: number) =>
          index === 0 ? { ...page, posts: [{ ...newPost, id: 'temp' }, ...page.posts] } : page,
        ),
      }));

      return { previousFeed };
    },

    onError: (err, newPost, context) => {
      // Rollback on error
      queryClient.setQueryData(['feed'], context?.previousFeed);
    },

    onSuccess: () => {
      // Refetch to get server data
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};
```

### PUT/PATCH - Update Data

```typescript
export const profileApi = {
  updateProfile: async (updates: UpdateProfileRequest): Promise<User> => {
    const { data } = await apiClient.patch<User>('/api/users/me', updates);
    return data;
  },
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: updatedUser => {
      // Update cache
      queryClient.setQueryData(['user', 'me'], updatedUser);
    },
  });
};
```

### DELETE - Remove Data

```typescript
export const feedApi = {
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}`);
  },
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: feedApi.deletePost,
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.setQueryData(['feed'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          posts: page.posts.filter((post: Post) => post.id !== postId),
        })),
      }));
    },
  });
};
```

---

## 🔄 WebSocket Integration

### WebSocket Client (STOMP)

```typescript
// src/core/socket/WebSocketClient.ts

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { secureStorage } from '@core/storage';
import { ENV } from '@config/env';

export class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  async connect(userId: string): Promise<void> {
    const token = await secureStorage.getItem('accessToken');

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${ENV.WS_BASE_URL}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        console.log('[WebSocket] Connected');

        // Subscribe to user-specific queue
        this.subscribeToMessages(userId);
        this.subscribeToNotifications(userId);
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
      },

      onStompError: frame => {
        console.error('[WebSocket] Error:', frame);
      },

      // Reconnect
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.activate();
  }

  subscribeToMessages(userId: string): void {
    if (!this.client) return;

    const subscription = this.client.subscribe(`/user/${userId}/queue/messages`, message => {
      const data = JSON.parse(message.body);
      this.handleNewMessage(data);
    });

    this.subscriptions.set('messages', subscription);
  }

  subscribeToNotifications(userId: string): void {
    if (!this.client) return;

    const subscription = this.client.subscribe(
      `/user/${userId}/queue/notifications`,
      notification => {
        const data = JSON.parse(notification.body);
        this.handleNotification(data);
      },
    );

    this.subscriptions.set('notifications', subscription);
  }

  sendMessage(conversationId: string, content: string): void {
    if (!this.client?.connected) {
      console.error('[WebSocket] Not connected');
      return;
    }

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        conversationId,
        content,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  disconnect(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
  }

  private handleNewMessage(message: Message): void {
    // Emit event or update store
    console.log('[WebSocket] New message:', message);
  }

  private handleNotification(notification: Notification): void {
    // Emit event or update store
    console.log('[WebSocket] New notification:', notification);
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
```

### WebSocket Hook

```typescript
// features/messaging/hooks/useWebSocket.ts

import { useEffect } from 'react';
import { useAuthStore } from '@features/auth/stores/authStore';
import { wsClient } from '@core/socket';

export const useWebSocket = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect WebSocket
      wsClient.connect(user.id);

      return () => {
        // Disconnect on unmount
        wsClient.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (conversationId: string, content: string) => {
    wsClient.sendMessage(conversationId, content);
  };

  return { sendMessage };
};

// Usage in component
const ChatScreen = ({ conversationId }: Props) => {
  const { sendMessage } = useWebSocket();

  const handleSend = (text: string) => {
    sendMessage(conversationId, text);
  };

  return <MessageInput onSend={handleSend} />;
};
```

---

## 📤 File Upload

### Image Upload

```typescript
// services/uploadApi.ts

import { apiClient } from '@core/api';

export const uploadApi = {
  uploadImage: async (uri: string, type: 'profile' | 'post'): Promise<string> => {
    const formData = new FormData();

    // Create file object
    const file = {
      uri,
      type: 'image/jpeg',
      name: `${type}-${Date.now()}.jpg`,
    } as any;

    formData.append('file', file);
    formData.append('type', type);

    const { data } = await apiClient.post<{ url: string }>(
      '/api/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data.url;
  },
};

// Hook
export const useUploadImage = () => {
  return useMutation({
    mutationFn: ({ uri, type }: { uri: string; type: 'profile' | 'post' }) =>
      uploadApi.uploadImage(uri, type),
  });
};

// Usage
const ProfileScreen = () => {
  const { mutateAsync: uploadImage, isPending } = useUploadImage();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUrl = await uploadImage({
        uri: result.assets[0].uri,
        type: 'profile',
      });

      // Update profile with new image URL
      updateProfile({ avatarUrl: imageUrl });
    }
  };

  return <Button onPress={handleImagePick} loading={isPending} />;
};
```

---

## 🚨 Error Handling

### Global Error Handler

```typescript
// core/utils/errorUtils.ts

export const getErrorMessage = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'Server error occurred';
  }

  if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  }

  return error.message || 'An unexpected error occurred';
};

export const handleApiError = (error: any): void => {
  const message = getErrorMessage(error);

  // Show toast
  ToastService.show({
    type: 'error',
    message,
  });

  // Log to analytics (if needed)
  if (!__DEV__) {
    Analytics.logError(error);
  }
};
```

### Usage in Hooks

```typescript
export const useFeed = () => {
  const { showToast } = useToast();

  return useQuery({
    queryKey: ['feed'],
    queryFn: feedApi.getFeed,
    onError: error => {
      const message = getErrorMessage(error);
      showToast({
        type: 'error',
        message,
      });
    },
  });
};
```

---

## 📊 API Response Types

### Standard Response

```typescript
// core/api/types/api.types.ts

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
```

---

## 🔑 Environment Variables

```typescript
// src/config/env.ts

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  WS_BASE_URL: process.env.EXPO_PUBLIC_WS_BASE_URL || 'http://localhost:8080',
  ENV: process.env.EXPO_PUBLIC_ENV || 'development',
};
```

**.env file:**

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_WS_BASE_URL=http://localhost:8080
EXPO_PUBLIC_ENV=development
```

---

## 📋 API Checklist

- [ ] API client configured with base URL
- [ ] Request interceptor attaches JWT token
- [ ] Response interceptor handles 401 (refresh token)
- [ ] Error handling with user-friendly messages
- [ ] TypeScript types for all requests/responses
- [ ] React Query for data fetching
- [ ] Optimistic updates for mutations
- [ ] WebSocket client for real-time features
- [ ] File upload support
- [ ] Environment variables configured

---

**Next:** [COMMON-PATTERNS.md](./COMMON-PATTERNS.md) - Sık kullanılan kod patterns
