# Testing Strategy

**Version:** 1.0
**Last Updated:** 2024-11-30
**Complexity:** ⭐⭐⭐ (Medium)

---

## 1. Overview

Comprehensive testing strategy: Unit tests (Jest), Component tests (Testing Library), E2E tests (Detox).

---

## 2. Test Setup

**jest.config.js:**

```javascript
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|react-native-reanimated)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/types.ts",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

**jest-setup.ts:**

```typescript
import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
```

---

## 3. Unit Tests

**Service layer test:**

```typescript
// src/features/auth/services/__tests__/authService.test.ts
import { authService } from "../authService";
import { apiClient } from "@core/api/client";

jest.mock("@core/api/client");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const mockResponse = {
        data: {
          user: { id: "1", email: "test@example.com", name: "Test User" },
          accessToken: "access_token",
          refreshToken: "refresh_token",
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error on invalid credentials", async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials")
      );

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrong",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      const mockResponse = {
        data: {
          user: { id: "1", email: "test@example.com", name: "Test User" },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(result).toEqual(mockResponse.data.user);
    });
  });
});
```

**Utility function test:**

```typescript
// src/utils/__tests__/validation.test.ts
import { validateEmail, validatePassword } from "../validation";

describe("validation utils", () => {
  describe("validateEmail", () => {
    it("should validate correct email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user+tag@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should validate strong password", () => {
      expect(validatePassword("Password123!")).toBe(true);
    });

    it("should reject weak password", () => {
      expect(validatePassword("pass")).toBe(false);
      expect(validatePassword("password")).toBe(false);
      expect(validatePassword("12345678")).toBe(false);
    });
  });
});
```

---

## 4. Component Tests

**Button component test:**

```typescript
// src/components/ui/__tests__/Button.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

describe("Button", () => {
  it("should render correctly", () => {
    const { getByText } = render(
      <Button title="Click me" onPress={() => {}} />
    );

    expect(getByText("Click me")).toBeTruthy();
  });

  it("should call onPress when clicked", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);

    fireEvent.press(getByText("Click me"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} disabled />
    );

    const button = getByText("Click me").parent;

    fireEvent.press(button!);

    expect(onPress).not.toHaveBeenCalled();
  });

  it("should show loading indicator", () => {
    const { getByTestId } = render(
      <Button title="Click me" onPress={() => {}} loading />
    );

    expect(getByTestId("loading-indicator")).toBeTruthy();
  });
});
```

**Form component test:**

```typescript
// src/features/auth/components/__tests__/LoginForm.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginForm } from "../LoginForm";

describe("LoginForm", () => {
  it("should render form fields", () => {
    const { getByPlaceholderText } = render(
      <LoginForm onSubmit={() => Promise.resolve()} />
    );

    expect(getByPlaceholderText("E-posta")).toBeTruthy();
    expect(getByPlaceholderText("Şifre")).toBeTruthy();
  });

  it("should show validation errors", async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginForm onSubmit={() => Promise.resolve()} />
    );

    const submitButton = getByText("Giriş Yap");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText("Geçerli bir e-posta girin")).toBeTruthy();
      expect(getByText("Şifre en az 6 karakter olmalı")).toBeTruthy();
    });
  });

  it("should submit valid form", async () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <LoginForm onSubmit={onSubmit} />
    );

    const emailInput = getByPlaceholderText("E-posta");
    const passwordInput = getByPlaceholderText("Şifre");
    const submitButton = getByText("Giriş Yap");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

---

## 5. Hook Tests

**Custom hook test:**

```typescript
// src/features/feed/hooks/__tests__/useFeed.test.ts
import { renderHook, waitFor } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFeed } from "../useFeed";
import { apiClient } from "@core/api/client";

jest.mock("@core/api/client");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useFeed", () => {
  it("should fetch feed successfully", async () => {
    const mockData = {
      data: {
        data: [
          { id: "1", content: "Post 1" },
          { id: "2", content: "Post 2" },
        ],
        nextCursor: "cursor_2",
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].data).toHaveLength(2);
  });

  it("should handle fetch error", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

---

## 6. Store Tests

**Zustand store test:**

```typescript
// src/stores/__tests__/authStore.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { useAuthStore } from "../authStore";

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

  it("should update user", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login({
        id: "1",
        email: "test@example.com",
        name: "Test User",
      });
    });

    act(() => {
      result.current.updateUser({ name: "Updated Name" });
    });

    expect(result.current.user?.name).toBe("Updated Name");
  });
});
```

---

## 7. E2E Tests (Detox)

**.detoxrc.js:**

```javascript
module.exports = {
  testRunner: "jest",
  runnerConfig: "e2e/config.json",
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath:
        "ios/build/Build/Products/Debug-iphonesimulator/Meslektas.app",
      build:
        "xcodebuild -workspace ios/Meslektas.xcworkspace -scheme Meslektas -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build:
        "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 14",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_5_API_31",
      },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
    },
  },
};
```

**E2E test example:**

```typescript
// e2e/login.e2e.ts
describe("Login Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should show login screen", async () => {
    await expect(element(by.text("Giriş Yap"))).toBeVisible();
  });

  it("should login successfully", async () => {
    await element(by.id("email-input")).typeText("test@example.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.id("login-button")).tap();

    await waitFor(element(by.text("Anasayfa")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should show error on invalid credentials", async () => {
    await element(by.id("email-input")).typeText("wrong@example.com");
    await element(by.id("password-input")).typeText("wrongpass");
    await element(by.id("login-button")).tap();

    await expect(
      element(by.text("Geçersiz kullanıcı bilgileri"))
    ).toBeVisible();
  });
});
```

---

## 8. Test Coverage

**Run tests with coverage:**

```bash
# Unit and component tests
npm test -- --coverage

# E2E tests
detox test --configuration ios.sim.debug
```

**Coverage report:**

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.23 |    78.45 |   82.67 |   85.89 |
 src/features/auth    |   92.15 |    88.32 |   90.45 |   92.78 |
 src/features/feed    |   88.67 |    82.11 |   86.23 |   89.01 |
 src/core/api         |   78.34 |    70.45 |   75.89 |   79.12 |
----------------------|---------|----------|---------|---------|
```

---

## 9. Summary

### Test Types:

- ✅ Unit tests (Jest)
- ✅ Component tests (Testing Library)
- ✅ Hook tests (Testing Library Hooks)
- ✅ Store tests (Zustand)
- ✅ E2E tests (Detox)
- ✅ Coverage reports
- ✅ CI/CD integration

**Result:** Comprehensive testing strategy with >70% coverage.
