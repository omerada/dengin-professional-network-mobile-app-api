# Zustand State Management

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Medium)

---

## 1. Overview

Zustand ile local state management, store slices, persistence ve devtools integration.

---

## 2. Store Structure

```
src/stores/
├── authStore.ts             # Auth state
├── uiStore.ts               # UI state (theme, modals)
├── verificationStore.ts     # Verification state
└── index.ts                 # Combined store
```

---

## 3. Auth Store

**src/stores/authStore.ts:**

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@features/auth/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setBiometric: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      biometricEnabled: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setBiometric: (enabled) => set({ biometricEnabled: enabled }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
);
```

---

## 4. UI Store

**src/stores/uiStore.ts:**

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";
type Language = "tr" | "en";

interface Modal {
  id: string;
  type: string;
  props?: any;
}

interface UIState {
  theme: Theme;
  language: Language;
  modals: Modal[];
  isLoading: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  showModal: (modal: Modal) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "tr",
      modals: [],
      isLoading: false,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      showModal: (modal) =>
        set((state) => ({
          modals: [...state.modals, modal],
        })),

      hideModal: (id) =>
        set((state) => ({
          modals: state.modals.filter((m) => m.id !== id),
        })),

      hideAllModals: () => set({ modals: [] }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
```

---

## 5. Verification Store

**src/stores/verificationStore.ts:**

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type VerificationStep =
  | "intro"
  | "document"
  | "selfie"
  | "review"
  | "upload"
  | "status";

interface DocumentData {
  frontImage: string | null;
  backImage: string | null;
}

interface SelfieData {
  image: string | null;
}

interface VerificationState {
  currentStep: VerificationStep;
  documentData: DocumentData;
  selfieData: SelfieData;
  uploadProgress: number;

  // Actions
  setStep: (step: VerificationStep) => void;
  setDocumentFront: (uri: string) => void;
  setDocumentBack: (uri: string) => void;
  setSelfie: (uri: string) => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "intro" as VerificationStep,
  documentData: {
    frontImage: null,
    backImage: null,
  },
  selfieData: {
    image: null,
  },
  uploadProgress: 0,
};

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      setDocumentFront: (uri) =>
        set((state) => ({
          documentData: { ...state.documentData, frontImage: uri },
        })),

      setDocumentBack: (uri) =>
        set((state) => ({
          documentData: { ...state.documentData, backImage: uri },
        })),

      setSelfie: (uri) =>
        set({
          selfieData: { image: uri },
        }),

      setUploadProgress: (progress) => set({ uploadProgress: progress }),

      reset: () => set(initialState),
    }),
    {
      name: "verification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 6. Advanced Store Patterns

**Slices Pattern:**

```typescript
import { create } from "zustand";

// Auth slice
interface AuthSlice {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const createAuthSlice = (set: any): AuthSlice => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
});

// UI slice
interface UISlice {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const createUISlice = (set: any): UISlice => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
});

// Combined store
type StoreState = AuthSlice & UISlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createUISlice(...a),
}));
```

**Computed Values:**

```typescript
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Computed selector
export const useIsEven = () =>
  useCounterStore((state) => state.count % 2 === 0);
```

**Async Actions:**

```typescript
import { create } from "zustand";
import { apiClient } from "@core/api/client";

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,

  fetchTodos: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/todos");
      set({ todos: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addTodo: async (text) => {
    const response = await apiClient.post("/todos", { text });
    set((state) => ({
      todos: [...state.todos, response.data],
    }));
  },
}));
```

---

## 7. Devtools Integration

**src/stores/index.ts:**

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StoreState {
  count: number;
  increment: () => void;
}

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: "MyStore",
      enabled: __DEV__,
    }
  )
);
```

---

## 8. Selectors

**Optimized selectors:**

```typescript
import { useAuthStore } from "@stores/authStore";
import { shallow } from "zustand/shallow";

// Bad: Re-renders on any auth state change
const Component1 = () => {
  const authState = useAuthStore();
  return <Text>{authState.user?.name}</Text>;
};

// Good: Only re-renders when user.name changes
const Component2 = () => {
  const userName = useAuthStore((state) => state.user?.name);
  return <Text>{userName}</Text>;
};

// Multiple values with shallow comparison
const Component3 = () => {
  const { user, isAuthenticated } = useAuthStore(
    (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
    shallow
  );

  return <Text>{user?.name}</Text>;
};
```

---

## 9. Usage Examples

**Auth store:**

```typescript
import { useAuthStore } from "@stores/authStore";

const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (credentials: Credentials) => {
    const user = await authService.login(credentials);
    login(user);
  };

  return <LoginForm onSubmit={handleLogin} />;
};
```

**UI store:**

```typescript
import { useUIStore } from "@stores/uiStore";

const SettingsScreen = () => {
  const { theme, setTheme } = useUIStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));

  return (
    <Picker selectedValue={theme} onValueChange={setTheme}>
      <Picker.Item label="Light" value="light" />
      <Picker.Item label="Dark" value="dark" />
      <Picker.Item label="System" value="system" />
    </Picker>
  );
};
```

**Verification store:**

```typescript
import { useVerificationStore } from "@stores/verificationStore";

const VerificationFlow = () => {
  const { currentStep, setStep } = useVerificationStore((state) => ({
    currentStep: state.currentStep,
    setStep: state.setStep,
  }));

  const handleNext = () => {
    if (currentStep === "intro") setStep("document");
    if (currentStep === "document") setStep("selfie");
    // ...
  };

  return <Button onPress={handleNext} title="Next" />;
};
```

---

## 10. Testing

**Store testing:**

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useAuthStore } from "@stores/authStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it("should login user", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({
        id: "1",
        email: "test@example.com",
        name: "Test User",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("should logout user", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({
        id: "1",
        email: "test@example.com",
        name: "Test User",
      });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

---

## 11. Summary

### Features:

- ✅ Zustand store with TypeScript
- ✅ Persistence with AsyncStorage
- ✅ Devtools integration
- ✅ Optimized selectors
- ✅ Slice pattern for modular stores
- ✅ Async actions support
- ✅ Computed values
- ✅ Testing utilities

**Result:** Type-safe, performant local state management with persistence.
