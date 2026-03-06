# 🏗️ Architecture Blueprint

> **Dengin Mobile App - Architectural Overview**

## 📐 Mimari Prensipler

### Design Philosophy

```
✓ Feature-Based Structure    → Modular, scalable
✓ Clean Architecture         → Separation of concerns
✓ Type-Safe                  → TypeScript strict mode
✓ Performance-First          → Memoization, virtualization
✓ Offline-Ready              → React Query caching
```

## 🗂️ Folder Structure

```
mobile/src/
│
├── features/                    # 🎯 FEATURE MODÜLLERI (Ana iş mantığı)
│   ├── auth/                    # Authentication & Authorization
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SocialLoginButtons.tsx
│   │   │   └── AuthHeader.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   └── useAuth.ts
│   │   ├── stores/
│   │   │   └── authStore.ts         # Zustand store (local state)
│   │   ├── services/
│   │   │   └── authApi.ts           # API calls
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── feed/                    # Social Feed & Posts
│   │   ├── screens/
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── PostDetailScreen.tsx
│   │   │   └── CreatePostScreen.tsx
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── CommentList.tsx
│   │   │   ├── CreatePostForm.tsx
│   │   │   └── PostActions.tsx
│   │   ├── hooks/
│   │   │   ├── useFeed.ts           # React Query hook
│   │   │   ├── usePost.ts
│   │   │   └── useComments.ts
│   │   └── services/
│   │       └── feedApi.ts
│   │
│   ├── messaging/               # Real-time Chat
│   │   ├── screens/
│   │   │   ├── ConversationsScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── components/
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── hooks/
│   │   │   ├── useConversations.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useWebSocket.ts      # STOMP WebSocket
│   │   └── services/
│   │       ├── messagingApi.ts
│   │       └── messageSocket.ts
│   │
│   ├── profile/                 # User Profile
│   ├── verification/            # AI Document Verification
│   ├── notifications/           # Push & In-app Notifications
│   ├── onboarding/             # First-time user experience
│   └── legal/                   # Terms, Privacy, KVKK
│
├── core/                        # 🔧 CORE UTILITIES (Infrastructure)
│   ├── api/
│   │   ├── client.ts            # Axios instance
│   │   ├── interceptors.ts      # Auth, error handling
│   │   └── endpoints.ts         # API endpoint constants
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Root navigator
│   │   ├── AuthNavigator.tsx    # Auth stack (Login, Register)
│   │   ├── MainNavigator.tsx    # Main tab navigator
│   │   ├── linking.ts           # Deep linking config
│   │   └── types.ts             # Navigation types
│   │
│   ├── socket/
│   │   ├── WebSocketClient.ts   # STOMP WebSocket client
│   │   └── socketConfig.ts
│   │
│   ├── storage/
│   │   ├── secureStorage.ts     # Expo SecureStore (tokens)
│   │   └── asyncStorage.ts      # AsyncStorage (cache)
│   │
│   └── utils/
│       ├── errorUtils.ts
│       ├── dateUtils.ts
│       └── validationUtils.ts
│
├── shared/                      # 🎨 SHARED UTILITIES (Reusable)
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── hooks/                   # Common hooks
│   │   ├── useDebounce.ts
│   │   ├── useKeyboard.ts
│   │   └── useImagePicker.ts
│   │
│   ├── utils/                   # Helper functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   └── types/                   # Shared TypeScript types
│       └── common.types.ts
│
├── contexts/                    # ⚙️ REACT CONTEXTS (Global state)
│   ├── ThemeContext.tsx         # Theme (light/dark)
│   ├── LocaleContext.tsx        # i18n
│   └── ToastContext.tsx         # Toast notifications
│
├── theme/                       # 🎨 DESIGN SYSTEM
│   ├── colors.ts                # Color palette
│   ├── typography.ts            # Font styles
│   ├── spacing.ts               # Spacing system
│   └── index.ts
│
├── config/                      # ⚙️ CONFIGURATION
│   ├── env.ts                   # Environment variables
│   └── app.ts                   # App constants
│
└── App.tsx                      # 🚀 ROOT COMPONENT
```

## 🔄 Data Flow Architecture

### MVVM-Like Pattern

```
┌─────────────────────────────────────────────────┐
│              USER INTERACTION                   │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│             SCREEN (View)                       │
│  • Renders UI                                   │
│  • Handles user input                           │
│  • Delegates to hooks                           │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          HOOKS (ViewModel)                      │
│  • Business logic                               │
│  • State management                             │
│  • Calls services                               │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          SERVICES (Model)                       │
│  • API calls                                    │
│  • Data transformation                          │
│  • Error handling                               │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          STATE UPDATE                           │
│  • Zustand (local state)                        │
│  • React Query cache (server state)             │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│             UI RE-RENDER                        │
└─────────────────────────────────────────────────┘
```

### Örnek: Login Flow

```typescript
// 1. SCREEN (View)
export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useLogin();  // Hook'u kullan

  const handleLogin = (credentials: LoginCredentials) => {
    login(credentials);  // Hook'a delege et
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
};

// 2. HOOK (ViewModel)
export const useLogin = () => {
  const navigation = useNavigation();
  const setUser = useAuthStore(state => state.setUser);

  const mutation = useMutation({
    mutationFn: authApi.login,  // Service'i çağır
    onSuccess: (data) => {
      setUser(data.user);  // State güncelle
      tokenService.saveTokens(data.tokens);
      navigation.replace('Main');
    }
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending
  };
};

// 3. SERVICE (Model)
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      credentials
    );
    return data;
  }
};
```

## 🗄️ State Management Strategy

### Zustand - Local/Client State

**Ne için kullanılır:**

- ✅ Authentication state (user, isAuthenticated)
- ✅ UI state (theme, modals, bottom sheets)
- ✅ Form state (temporary, not persisted)
- ✅ Navigation state

**Özellikler:**

- Persist to AsyncStorage
- TypeScript support
- Devtools integration

```typescript
// Example: authStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      setUser: user => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

### React Query - Server State

**Ne için kullanılır:**

- ✅ API data fetching
- ✅ Caching & invalidation
- ✅ Optimistic updates
- ✅ Infinite scrolling (feed, messages)

**Özellikler:**

- Auto refetch
- Background updates
- Offline support
- Pagination

```typescript
// Example: useFeed hook
export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => feedApi.getFeed(pageParam),
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## 🧩 Design Patterns

### 1. Feature Slice Pattern

Her feature kendi içinde self-contained:

```
features/messaging/
├── screens/       → UI (View)
├── components/    → Feature-specific UI
├── hooks/         → Business logic (ViewModel)
├── services/      → API calls (Model)
├── stores/        → Local state (Zustand)
└── types/         → TypeScript types
```

### 2. Compound Component Pattern

```typescript
// Örnek: Card component
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Actions>
    <Button>Action</Button>
  </Card.Actions>
</Card>
```

### 3. Render Props Pattern

```typescript
<InfiniteScroll
  onEndReached={fetchMore}
  renderItem={(item) => <PostCard post={item} />}
  renderEmpty={() => <EmptyState />}
  renderLoading={() => <LoadingSpinner />}
/>
```

### 4. HOC Pattern (Higher-Order Component)

```typescript
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
      return <Navigate to="Login" />;
    }

    return <Component {...props} />;
  };
};

// Usage
export const ProfileScreen = withAuth(ProfileScreenComponent);
```

## 🚦 Navigation Architecture

```
AppNavigator (Root)
│
├── AuthNavigator (Stack)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
│
└── MainNavigator (Tab)
    ├── FeedTab (Stack)
    │   ├── FeedScreen
    │   ├── PostDetailScreen
    │   └── CreatePostScreen
    │
    ├── MessagingTab (Stack)
    │   ├── ConversationsScreen
    │   └── ChatScreen
    │
    ├── NotificationsTab
    │
    └── ProfileTab (Stack)
        ├── ProfileScreen
        └── EditProfileScreen
```

**Type-Safe Navigation:**

```typescript
// types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Messaging: undefined;
  Notifications: undefined;
  Profile: { userId?: string };
};

// Usage
const navigation = useNavigation<NavigationProp<MainTabParamList>>();
navigation.navigate('Profile', { userId: '123' }); // Type-safe!
```

## ⚡ Performance Architecture

### 1. Component Memoization

```typescript
// ✅ Memoize component
export const PostCard = React.memo(
  ({ post }: Props) => { ... },
  (prev, next) => prev.post.id === next.post.id
);

// ✅ Memoize callbacks
const handlePress = useCallback(() => {
  navigate('PostDetail', { postId: post.id });
}, [post.id]);

// ✅ Memoize expensive calculations
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}, [posts]);
```

### 2. List Virtualization

```typescript
<FlatList
  data={posts}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  // Performance props
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  // Optimizations
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 3. Image Optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"  // Cache strategy
  placeholder={blurhash}     // Blurhash placeholder
/>
```

## 🔐 Security Architecture

### Token Management

```typescript
// Secure storage (JWT tokens)
import * as SecureStore from 'expo-secure-store';

export const tokenService = {
  saveTokens: async (tokens: Tokens) => {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
  },

  getAccessToken: async () => {
    return await SecureStore.getItemAsync('accessToken');
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },
};
```

### API Interceptors

```typescript
// Auto-attach JWT token
apiClient.interceptors.request.use(async config => {
  const token = await tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await tokenService.refreshToken();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  },
);
```

## 📡 Real-time Architecture (WebSocket)

```typescript
// WebSocket client (STOMP)
import { Client } from '@stomp/stompjs';

export class WebSocketClient {
  private client: Client;

  connect(userId: string) {
    this.client = new Client({
      brokerURL: `${WS_BASE_URL}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        // Subscribe to user-specific topics
        this.client.subscribe(`/user/${userId}/queue/messages`, message => {
          this.handleMessage(JSON.parse(message.body));
        });
      },
    });

    this.client.activate();
  }

  sendMessage(message: Message) {
    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message),
    });
  }
}
```

## 🧪 Testing Architecture

```
__tests__/
├── unit/              # Unit tests (utils, hooks)
├── integration/       # Integration tests (API, components)
└── e2e/              # E2E tests (user flows)
```

**Test Pattern:**

```typescript
// Component test
describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholder, getByText } = render(
      <LoginForm onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholder('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholder('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

## 📊 Monitoring & Debugging

### React Query Devtools

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  {__DEV__ && <ReactQueryDevtools />}
</QueryClientProvider>
```

### Flipper Integration

- Network inspector
- Async storage viewer
- Redux/Zustand devtools
- Performance monitor

---

## 🎯 Key Takeaways

| Aspect          | Decision                     | Rationale               |
| --------------- | ---------------------------- | ----------------------- |
| **Structure**   | Feature-based                | Modularity, scalability |
| **State**       | Zustand + React Query        | Simple + powerful       |
| **Types**       | TypeScript strict            | Type safety, DX         |
| **Navigation**  | React Navigation 6           | Type-safe, flexible     |
| **Performance** | Memoization + Virtualization | 60fps guarantee         |
| **Real-time**   | STOMP WebSocket              | Bidirectional, reliable |
| **Testing**     | Jest + RTL                   | Fast, reliable          |

---

**Next:** [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) - Kod yazma standartları ve patterns
