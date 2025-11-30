# Test Utilities

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐ (Medium)

---

## 1. Overview

Reusable test utilities, mocks, fixtures ve custom matchers.

---

## 2. Test Wrappers

**src/test-utils/wrapper.tsx:**

```typescript
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "@contexts/ThemeContext";
import { LocalizationProvider } from "@contexts/LocalizationContext";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress errors in tests
    },
  });

export const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <LocalizationProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LocalizationProvider>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

// Custom render
import { render as rtlRender } from "@testing-library/react-native";

export const render = (ui: React.ReactElement, options?: any) => {
  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

// Re-export everything
export * from "@testing-library/react-native";
```

---

## 3. Mock Data

**src/test-utils/fixtures.ts:**

```typescript
import type { User, Post, Conversation, Message } from "@/types";

export const mockUser: User = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  avatar: "https://example.com/avatar.jpg",
  verified: true,
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockPost: Post = {
  id: "1",
  content: "Test post content",
  author: mockUser,
  likesCount: 10,
  commentsCount: 5,
  isLiked: false,
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockConversation: Conversation = {
  id: "1",
  participants: [mockUser],
  lastMessage: {
    id: "1",
    content: "Last message",
    senderId: mockUser.id,
    createdAt: "2024-01-01T00:00:00Z",
  },
  unreadCount: 2,
  updatedAt: "2024-01-01T00:00:00Z",
};

export const mockMessage: Message = {
  id: "1",
  conversationId: "1",
  senderId: mockUser.id,
  content: "Test message",
  status: "delivered",
  createdAt: "2024-01-01T00:00:00Z",
};

// Factory functions
export const createMockUser = (overrides?: Partial<User>): User => ({
  ...mockUser,
  ...overrides,
});

export const createMockPost = (overrides?: Partial<Post>): Post => ({
  ...mockPost,
  ...overrides,
});

export const createMockMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) => ({
    ...mockMessage,
    id: `${i + 1}`,
    content: `Message ${i + 1}`,
  }));
};
```

---

## 4. API Mocks

**src/test-utils/apiMocks.ts:**

```typescript
import { apiClient } from "@core/api/client";
import { mockUser, mockPost } from "./fixtures";

export const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

export const mockAuthApi = () => {
  mockApiClient.post.mockImplementation((url) => {
    if (url === "/auth/login") {
      return Promise.resolve({
        data: {
          user: mockUser,
          accessToken: "access_token",
          refreshToken: "refresh_token",
        },
      });
    }

    if (url === "/auth/register") {
      return Promise.resolve({
        data: { user: mockUser },
      });
    }

    return Promise.reject(new Error("Not found"));
  });
};

export const mockFeedApi = () => {
  mockApiClient.get.mockImplementation((url) => {
    if (url === "/posts") {
      return Promise.resolve({
        data: {
          data: [mockPost],
          nextCursor: null,
        },
      });
    }

    return Promise.reject(new Error("Not found"));
  });
};

export const mockAllApis = () => {
  mockAuthApi();
  mockFeedApi();
};

export const resetApiMocks = () => {
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.put.mockReset();
  mockApiClient.patch.mockReset();
  mockApiClient.delete.mockReset();
};
```

---

## 5. Navigation Mocks

**src/test-utils/navigationMocks.ts:**

```typescript
import { NavigationProp } from "@react-navigation/native";

export const mockNavigation: Partial<NavigationProp<any>> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => "1"),
};

export const createMockNavigation = (
  overrides?: Partial<NavigationProp<any>>
): NavigationProp<any> =>
  ({
    ...mockNavigation,
    ...overrides,
  } as NavigationProp<any>);

// Usage
import { useNavigation } from "@react-navigation/native";
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation,
}));
```

---

## 6. Storage Mocks

**src/test-utils/storageMocks.ts:**

```typescript
export const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
};

export const mockSecureStore = {
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
};

// Setup
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
jest.mock("expo-secure-store", () => mockSecureStore);

// Helper to set stored data
export const setStoredData = (key: string, value: any) => {
  mockAsyncStorage.getItem.mockImplementation((k) =>
    k === key ? Promise.resolve(JSON.stringify(value)) : Promise.resolve(null)
  );
};
```

---

## 7. Custom Matchers

**src/test-utils/matchers.ts:**

```typescript
import { expect } from "@jest/globals";

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },

  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${min} - ${max}`
          : `expected ${received} to be within range ${min} - ${max}`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toBeWithinRange(min: number, max: number): R;
    }
  }
}

// Usage
test("email validation", () => {
  expect("test@example.com").toBeValidEmail();
  expect("invalid").not.toBeValidEmail();
});
```

---

## 8. Wait Utilities

**src/test-utils/waitUtils.ts:**

```typescript
import { waitFor } from "@testing-library/react-native";

export const waitForLoadingToFinish = () =>
  waitFor(
    () => {
      expect(screen.queryByTestId("loading-indicator")).toBeNull();
    },
    { timeout: 5000 }
  );

export const waitForElement = (testId: string, timeout = 3000) =>
  waitFor(
    () => {
      expect(screen.getByTestId(testId)).toBeTruthy();
    },
    { timeout }
  );

export const waitForText = (text: string, timeout = 3000) =>
  waitFor(
    () => {
      expect(screen.getByText(text)).toBeTruthy();
    },
    { timeout }
  );

// Debounce wait
export const waitForDebounce = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

---

## 9. Form Test Helpers

**src/test-utils/formHelpers.ts:**

```typescript
import { fireEvent } from "@testing-library/react-native";

export const fillForm = (
  getByPlaceholderText: any,
  fields: Record<string, string>
) => {
  Object.entries(fields).forEach(([placeholder, value]) => {
    const input = getByPlaceholderText(placeholder);
    fireEvent.changeText(input, value);
  });
};

export const submitForm = (getByText: any, buttonText: string) => {
  const submitButton = getByText(buttonText);
  fireEvent.press(submitButton);
};

// Usage
test("login form", () => {
  const { getByPlaceholderText, getByText } = render(<LoginForm />);

  fillForm(getByPlaceholderText, {
    "E-posta": "test@example.com",
    Şifre: "password123",
  });

  submitForm(getByText, "Giriş Yap");
});
```

---

## 10. Snapshot Testing

**Component snapshot:**

```typescript
import React from "react";
import { render } from "@test-utils/wrapper";
import { Button } from "@components/ui/Button";

describe("Button snapshots", () => {
  it("should match primary button snapshot", () => {
    const { toJSON } = render(
      <Button title="Click me" onPress={() => {}} variant="primary" />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it("should match disabled button snapshot", () => {
    const { toJSON } = render(
      <Button title="Click me" onPress={() => {}} disabled />
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
```

---

## 11. Performance Testing

**src/test-utils/performanceHelpers.ts:**

```typescript
export const measureRenderTime = async (
  Component: React.FC,
  iterations = 100
) => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    render(<Component />);
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return { avg, min, max, times };
};

// Usage
test("Button renders quickly", async () => {
  const { avg } = await measureRenderTime(() => (
    <Button title="Test" onPress={() => {}} />
  ));

  expect(avg).toBeLessThan(10); // ms
});
```

---

## 12. Test Index

**src/test-utils/index.ts:**

```typescript
// Re-export everything
export * from "./wrapper";
export * from "./fixtures";
export * from "./apiMocks";
export * from "./navigationMocks";
export * from "./storageMocks";
export * from "./matchers";
export * from "./waitUtils";
export * from "./formHelpers";
export * from "./performanceHelpers";

// Usage in tests
import {
  render,
  screen,
  fireEvent,
  waitFor,
  mockUser,
  mockPost,
  mockApiClient,
  fillForm,
  submitForm,
} from "@test-utils";
```

---

## 13. Summary

### Utilities:

- ✅ Test wrappers (providers)
- ✅ Mock data (fixtures)
- ✅ API mocks
- ✅ Navigation mocks
- ✅ Storage mocks
- ✅ Custom matchers
- ✅ Wait utilities
- ✅ Form helpers
- ✅ Snapshot testing
- ✅ Performance testing

**Result:** Comprehensive test utilities for efficient testing.
