# Mobile Architecture

**Version:** 1.0
**Last Updated:** 2024-11-30
**Target:** React Native 0.72+, TypeScript 5.0+

---

## 1. Overview

Meslektaş mobile app, **Clean Architecture** ve **Feature-Based** modular yapıda tasarlanmıştır. Bu doküman app'in mimari kararlarını, klasör yapısını ve design pattern'lerini açıklar.

---

## 2. Architecture Principles

### 2.1 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                  │
│  (Screens, Components, Hooks, ViewModels)               │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                        │
│  (Business Logic, Use Cases, Entities)                  │
├─────────────────────────────────────────────────────────┤
│                     Data Layer                          │
│  (API, Storage, WebSocket, External Services)           │
└─────────────────────────────────────────────────────────┘
```

**Katman Kuralları:**

- **Presentation** → Domain (bağımlı)
- **Domain** → Data (bağımlı)
- **Data** → Hiçbir katmana bağımlı değil
- Her katman kendi sorumluluk alanında bağımsız

---

### 2.2 Feature-Based Organization

Her feature kendi klasöründe, bağımsız ve test edilebilir:

```
src/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── verification/
│   ├── feed/
│   ├── messaging/
│   ├── notifications/
│   └── profile/
```

---

## 3. Project Structure

### 3.1 Complete Folder Structure

```
meslektas-mobile/
├── src/
│   ├── features/                    # Feature modules
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SocialLogin.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── stores/
│   │   │   │   └── authStore.ts
│   │   │   ├── services/
│   │   │   │   ├── authApi.ts
│   │   │   │   └── tokenService.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── verification/
│   │   │   ├── screens/
│   │   │   │   ├── DocumentCaptureScreen.tsx
│   │   │   │   ├── SelfieScreen.tsx
│   │   │   │   └── VerificationStatusScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── CameraView.tsx
│   │   │   │   ├── DocumentGuide.tsx
│   │   │   │   └── UploadProgress.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCamera.ts
│   │   │   │   ├── useDocumentUpload.ts
│   │   │   │   └── useVerificationStatus.ts
│   │   │   ├── stores/
│   │   │   │   └── verificationStore.ts
│   │   │   ├── services/
│   │   │   │   ├── verificationApi.ts
│   │   │   │   ├── imageCompression.ts
│   │   │   │   └── uploadService.ts
│   │   │   └── types/
│   │   │       └── verification.types.ts
│   │   │
│   │   ├── feed/
│   │   │   ├── screens/
│   │   │   │   ├── FeedScreen.tsx
│   │   │   │   ├── PostDetailScreen.tsx
│   │   │   │   └── CreatePostScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── CommentList.tsx
│   │   │   │   └── CreatePostForm.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFeed.ts
│   │   │   │   ├── usePost.ts
│   │   │   │   └── useComments.ts
│   │   │   ├── stores/
│   │   │   │   └── feedStore.ts
│   │   │   └── services/
│   │   │       └── feedApi.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── screens/
│   │   │   │   ├── ConversationListScreen.tsx
│   │   │   │   └── ChatScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useConversations.ts
│   │   │   │   ├── useMessages.ts
│   │   │   │   └── useSocket.ts
│   │   │   ├── stores/
│   │   │   │   └── messagingStore.ts
│   │   │   └── services/
│   │   │       ├── messagingApi.ts
│   │   │       └── socketService.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── screens/
│   │   │   │   └── NotificationsScreen.tsx
│   │   │   ├── components/
│   │   │   │   └── NotificationItem.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useNotifications.ts
│   │   │   │   └── usePushNotifications.ts
│   │   │   ├── stores/
│   │   │   │   └── notificationStore.ts
│   │   │   └── services/
│   │   │       ├── notificationApi.ts
│   │   │       └── fcmService.ts
│   │   │
│   │   └── profile/
│   │       ├── screens/
│   │       │   ├── ProfileScreen.tsx
│   │       │   ├── EditProfileScreen.tsx
│   │       │   └── SettingsScreen.tsx
│   │       ├── components/
│   │       │   ├── ProfileHeader.tsx
│   │       │   └── ProfileStats.tsx
│   │       ├── hooks/
│   │       │   ├── useProfile.ts
│   │       │   └── useUpdateProfile.ts
│   │       ├── stores/
│   │       │   └── profileStore.ts
│   │       └── services/
│   │           └── profileApi.ts
│   │
│   ├── core/                        # Core functionality
│   │   ├── api/
│   │   │   ├── client.ts           # Axios instance
│   │   │   ├── interceptors.ts     # Auth, error handling
│   │   │   └── endpoints.ts        # API endpoints
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx    # Main navigator
│   │   │   ├── AuthNavigator.tsx   # Auth stack
│   │   │   ├── MainNavigator.tsx   # Authenticated stack
│   │   │   └── linking.ts          # Deep linking config
│   │   ├── storage/
│   │   │   ├── asyncStorage.ts     # AsyncStorage wrapper
│   │   │   ├── secureStorage.ts    # Secure storage (tokens)
│   │   │   └── cache.ts            # Cache manager
│   │   ├── socket/
│   │   │   ├── socketClient.ts     # Socket.IO client
│   │   │   └── socketEvents.ts     # Event handlers
│   │   └── permissions/
│   │       ├── camera.ts
│   │       ├── notifications.ts
│   │       └── storage.ts
│   │
│   ├── shared/                      # Shared across features
│   │   ├── components/              # Reusable components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Avatar/
│   │   │   ├── Loading/
│   │   │   └── ErrorBoundary/
│   │   ├── hooks/                   # Shared hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useKeyboard.ts
│   │   │   ├── useAppState.ts
│   │   │   └── useNetworkStatus.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── constants.ts
│   │   └── types/                   # Shared types
│   │       ├── api.types.ts
│   │       ├── navigation.types.ts
│   │       └── common.types.ts
│   │
│   ├── theme/                       # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   │
│   ├── contexts/                    # React Context
│   │   ├── ThemeContext.tsx
│   │   ├── LocaleContext.tsx
│   │   └── AuthContext.tsx
│   │
│   ├── config/                      # Configuration
│   │   ├── env.ts                  # Environment variables
│   │   ├── app.ts                  # App config
│   │   └── firebase.ts             # Firebase config
│   │
│   └── App.tsx                      # Root component
│
├── __tests__/                       # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── assets/                          # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── animations/
│
├── android/                         # Android native
├── ios/                             # iOS native
├── .env                             # Environment variables
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Architecture Patterns

### 4.1 Presentation Pattern (MVVM-like)

**Screen → Hooks → Services → API**

```typescript
// Screen (View)
export const LoginScreen = () => {
  const { login, isLoading, error } = useLogin();

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials);
  };

  return (
    <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
  );
};

// Hook (ViewModel)
export const useLogin = () => {
  const navigate = useNavigation();
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      tokenService.saveTokens(data.tokens);
      navigate("Main");
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

// Service (Business Logic)
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
};
```

---

### 4.2 State Management Architecture

**Local State (Zustand) + Server State (React Query)**

```typescript
// Local State - User session
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Server State - Feed data
export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 0 }) => feedApi.getFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

### 4.3 Navigation Architecture

**Type-Safe Navigation with React Navigation**

```typescript
// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Messaging: undefined;
  Notifications: undefined;
  Profile: { userId?: string };
};

// Type-safe navigation hook
export const useAppNavigation = () => {
  return useNavigation<NavigationProp<RootStackParamList>>();
};

// Usage
const navigation = useAppNavigation();
navigation.navigate("Main"); // Type-safe
```

---

## 5. Data Flow

### 5.1 Unidirectional Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                        User Action                       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                     Hook/ViewModel                       │
│  (useLogin, useFeed, useMessages)                        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                    Service/API Call                      │
│  (authApi.login, feedApi.getFeed)                        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                    State Update                          │
│  (Zustand store update / React Query cache)              │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                     UI Re-render                         │
│  (Component receives new state)                          │
└──────────────────────────────────────────────────────────┘
```

---

### 5.2 Real-time Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                   WebSocket Event                        │
│  (New message, notification)                             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                   Socket Service                         │
│  (socketService.on('message'))                           │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                  Store Update                            │
│  (messagingStore.addMessage)                             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│              React Query Cache Invalidation              │
│  (queryClient.invalidateQueries(['messages']))           │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                     UI Update                            │
│  (New message appears instantly)                         │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Module Communication

### 6.1 Feature Independence

Features iletişim için **events** ve **shared services** kullanır:

```typescript
// Event emitter for cross-feature communication
import EventEmitter from "eventemitter3";

export const appEvents = new EventEmitter();

// Feature A: Emit event
appEvents.emit("user:verified", { userId: "123" });

// Feature B: Listen to event
useEffect(() => {
  const handleVerified = (data: { userId: string }) => {
    // Update UI
  };

  appEvents.on("user:verified", handleVerified);

  return () => {
    appEvents.off("user:verified", handleVerified);
  };
}, []);
```

---

### 6.2 Shared Services

```typescript
// Shared analytics service
export const analyticsService = {
  logEvent: (eventName: string, params?: Record<string, any>) => {
    analytics().logEvent(eventName, params);
  },

  setUserId: (userId: string) => {
    analytics().setUserId(userId);
  },
};

// Usage in any feature
analyticsService.logEvent("post_created", {
  postId: post.id,
  hasImage: !!post.imageUrl,
});
```

---

## 7. Dependency Injection

### 7.1 Service Factory Pattern

```typescript
// Service container
class ServiceContainer {
  private services = new Map();

  register<T>(key: string, factory: () => T) {
    this.services.set(key, factory);
  }

  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not found`);
    }
    return factory();
  }
}

export const container = new ServiceContainer();

// Register services
container.register("apiClient", () => createApiClient());
container.register("socketClient", () => createSocketClient());

// Use in features
const apiClient = container.get<AxiosInstance>("apiClient");
```

---

## 8. Error Handling Architecture

### 8.1 Error Boundaries

```typescript
// Global error boundary
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: { react: errorInfo },
    });

    // Show error screen
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

### 8.2 API Error Handling

```typescript
// API error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, refresh
      await tokenService.refreshToken();
      return apiClient(error.config);
    }

    if (error.response?.status === 403) {
      // Unauthorized, navigate to login
      navigationRef.navigate("Login");
    }

    return Promise.reject(error);
  }
);
```

---

## 9. Performance Architecture

### 9.1 Component Optimization

```typescript
// Memoize expensive components
export const PostCard = React.memo(
  ({ post }: Props) => {
    return (
      <Card>
        <PostHeader author={post.author} />
        <PostContent content={post.content} />
        <PostActions post={post} />
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.likeCount === nextProps.post.likeCount
    );
  }
);
```

---

### 9.2 List Virtualization

```typescript
// FlatList with optimizations
<FlatList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} />}
  keyExtractor={(item) => item.id}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  // Infinite scroll
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  // Pull to refresh
  refreshControl={
    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
  }
/>
```

---

## 10. Testing Architecture

### 10.1 Testing Layers

```
┌─────────────────────────────────────────────────────────┐
│                    E2E Tests (Detox)                    │
│  Full user flows, critical paths                       │
├─────────────────────────────────────────────────────────┤
│              Integration Tests (Jest)                   │
│  Feature workflows, API integration                     │
├─────────────────────────────────────────────────────────┤
│                 Unit Tests (Jest)                       │
│  Hooks, utils, components, services                    │
└─────────────────────────────────────────────────────────┘
```

**Coverage Targets:**

- Unit Tests: 80%+
- Integration Tests: 60%+
- E2E Tests: Critical flows only

---

## 11. Security Architecture

### 11.1 Secure Storage

```typescript
// Token storage (Keychain/Keystore)
export const secureStorage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  },

  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// Usage
await secureStorage.setItem("accessToken", token.accessToken);
```

---

### 11.2 Biometric Authentication

```typescript
export const biometricAuth = {
  isAvailable: async (): Promise<boolean> => {
    const result = await LocalAuthentication.hasHardwareAsync();
    return result && (await LocalAuthentication.isEnrolledAsync());
  },

  authenticate: async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
      fallbackLabel: "Use passcode",
    });
    return result.success;
  },
};
```

---

## 12. Scalability Considerations

### 12.1 Code Splitting

```typescript
// Lazy load feature modules
const FeedScreen = React.lazy(
  () => import("./features/feed/screens/FeedScreen")
);
const MessagingScreen = React.lazy(
  () => import("./features/messaging/screens/MessagingScreen")
);

// Use with Suspense
<Suspense fallback={<Loading />}>
  <FeedScreen />
</Suspense>;
```

---

### 12.2 Feature Flags

```typescript
export const featureFlags = {
  isEnabled: (flag: string): boolean => {
    const config = remoteConfig().getValue(flag);
    return config.asBoolean();
  },
};

// Usage
{
  featureFlags.isEnabled("new_feed_algorithm") && <NewFeedComponent />;
}
```

---

## 13. Summary

### Architecture Decisions:

- ✅ **Clean Architecture** - Separation of concerns
- ✅ **Feature-Based** - Modular, scalable structure
- ✅ **TypeScript** - Type safety
- ✅ **Zustand + React Query** - Optimal state management
- ✅ **React Navigation** - Type-safe routing
- ✅ **Socket.IO** - Real-time communication
- ✅ **Secure Storage** - Token/credential protection

### Key Patterns:

- MVVM-like (Screen → Hook → Service)
- Unidirectional data flow
- Dependency injection
- Error boundaries
- Component memoization
- List virtualization

### Performance:

- Code splitting
- Lazy loading
- Image optimization
- List virtualization
- Memoization

**Result:** Scalable, maintainable, performant mobile app architecture ready for production.
