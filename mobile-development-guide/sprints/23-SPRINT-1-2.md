# Sprint 1-2: Foundation & Authentication

**Duration:** 2 weeks
**Focus:** Project setup, auth module, navigation
**Complexity:** ⭐⭐ (Medium)

---

## Sprint Goals

- ✅ Project initialization
- ✅ Navigation setup
- ✅ Authentication (Login/Register)
- ✅ Biometric authentication
- ✅ Storage setup

---

## Week 1: Foundation

### Day 1-2: Project Setup

**Tasks:**

- Initialize React Native project with TypeScript
- Setup folder structure
- Install dependencies (Navigation, State, UI)
- Configure TypeScript, ESLint, Prettier
- Setup environment variables

**Deliverables:**

```bash
# Initialize project
npx react-native init Meslektas --template react-native-template-typescript

# Install core dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install axios socket.io-client

# Dev dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev eslint prettier
```

**Validation:**

- [ ] Project builds successfully
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured
- [ ] All imports resolve correctly

---

### Day 3-4: Navigation Structure

**Tasks:**

- Implement AppNavigator (Root stack)
- Create AuthNavigator (Login, Register)
- Setup MainNavigator (Bottom tabs)
- Configure deep linking
- Add type-safe navigation

**Files:**

```
src/navigation/
├── AppNavigator.tsx
├── AuthNavigator.tsx
├── MainNavigator.tsx
└── types.ts
```

**Code:**

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
```

**Validation:**

- [ ] Navigation works without errors
- [ ] Deep linking configured
- [ ] Type safety verified
- [ ] Screen transitions smooth

---

### Day 5: Storage Setup

**Tasks:**

- Implement AsyncStorage wrapper
- Setup SecureStore for tokens
- Create cache manager
- Add migration system

**Files:**

```
src/core/storage/
├── asyncStorage.ts
├── secureStorage.ts
├── cache.ts
└── keys.ts
```

**Validation:**

- [ ] AsyncStorage read/write works
- [ ] SecureStore encrypts data
- [ ] Cache TTL works correctly
- [ ] Migration system tested

---

## Week 2: Authentication

### Day 1-2: Auth Service

**Tasks:**

- Implement auth API client
- Create login/register services
- Add token management
- Setup token refresh logic

**Files:**

```
src/features/auth/
├── services/
│   ├── authService.ts
│   └── tokenService.ts
├── types.ts
└── hooks/
```

**Code:**

```typescript
// authService.ts
export const authService = {
  async login(credentials: LoginDto) {
    const response = await apiClient.post("/auth/login", credentials);
    await tokenService.saveTokens(response.data);
    return response.data.user;
  },

  async register(data: RegisterDto) {
    const response = await apiClient.post("/auth/register", data);
    return response.data.user;
  },
};
```

**Validation:**

- [ ] Login API call works
- [ ] Register API call works
- [ ] Tokens saved securely
- [ ] Token refresh works

---

### Day 3-4: Auth UI

**Tasks:**

- Create LoginForm component
- Create RegisterForm component
- Add form validation (Zod)
- Implement error handling

**Files:**

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── AuthButton.tsx
└── screens/
    ├── LoginScreen.tsx
    └── RegisterScreen.tsx
```

**Validation:**

- [ ] Forms render correctly
- [ ] Validation works (email, password)
- [ ] Error messages display
- [ ] Loading states work

---

### Day 5: Biometric Auth

**Tasks:**

- Integrate react-native-biometrics
- Add Face ID / Touch ID support
- Implement biometric login flow
- Store biometric preference

**Code:**

```typescript
// biometricService.ts
export const biometricService = {
  async authenticate() {
    const { success } = await Biometrics.simplePrompt({
      promptMessage: "Kimliğinizi doğrulayın",
    });
    return success;
  },

  async enableBiometric() {
    // Implementation
  },
};
```

**Validation:**

- [ ] Biometric prompt shows
- [ ] Authentication works
- [ ] Fallback to password works
- [ ] Settings save correctly

---

## Testing Checklist

**Unit Tests:**

- [ ] authService.login()
- [ ] authService.register()
- [ ] tokenService.saveTokens()
- [ ] tokenService.refreshToken()

**Component Tests:**

- [ ] LoginForm validation
- [ ] RegisterForm validation
- [ ] Error display
- [ ] Loading states

**E2E Tests:**

- [ ] Login flow (email + password)
- [ ] Register flow
- [ ] Biometric login flow
- [ ] Token refresh on 401

---

## Sprint Review

**Demo:**

1. Show login screen
2. Login with email/password
3. Show token storage
4. Enable biometric auth
5. Logout and login with biometric

**Metrics:**

- Lines of code: ~2,000
- Files created: ~25
- Test coverage: >70%
- Build time: <2 min

---

## Sprint Retrospective

**What went well:**

- TypeScript setup smooth
- Navigation structure solid
- Auth flow complete

**What to improve:**

- Add more input validations
- Better error messages
- Loading state improvements

**Action items:**

- Document biometric setup for iOS/Android
- Add forgot password flow (Sprint 3)
- Create design system components

---

## Next Sprint Preview (Sprint 3-4)

Focus: Identity verification module

- Camera integration
- Document capture
- Image validation
- Upload with progress
