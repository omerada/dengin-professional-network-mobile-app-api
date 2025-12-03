# Meslektaş Mobile - Test Coverage

Bu dokümantasyon, mobile uygulama için yazılan testlerin kapsamını açıklar.

## Test Yapısı

```
__tests__/
├── setup.ts                    # Jest global setup
├── utils/
│   └── testUtils.tsx          # Test yardımcıları ve wrappers
├── unit/                       # Birim testleri
│   ├── auth/
│   │   ├── authSchemas.test.ts     # Zod validasyon şemaları
│   │   ├── authStore.test.ts       # Zustand store
│   │   ├── authApi.test.ts         # API servis metodları
│   │   ├── tokenService.test.ts    # Token yönetimi
│   │   └── biometricService.test.ts # Biyometrik servis
│   ├── core/
│   │   ├── storage.test.ts         # AsyncStorage ve Cache
│   │   └── apiClient.test.ts       # Axios client
│   ├── contexts/
│   │   ├── ThemeContext.test.tsx   # Tema yönetimi
│   │   └── LocaleContext.test.tsx  # Dil yönetimi
│   ├── hooks/
│   │   ├── useLogin.test.ts        # Login hook
│   │   ├── useRegister.test.ts     # Register hook
│   │   ├── useLogout.test.ts       # Logout hook
│   │   └── useBiometricLogin.test.ts # Biyometrik login hook
│   ├── shared/
│   │   ├── Button.test.tsx         # Button bileşeni
│   │   ├── Input.test.tsx          # Input bileşeni
│   │   └── Loading.test.tsx        # Loading bileşeni
│   ├── theme/
│   │   ├── colors.test.ts          # Renk sistemleri
│   │   ├── typography.test.ts      # Tipografi
│   │   └── spacing.test.ts         # Boşluk sistemi
│   └── navigation/
│       └── linking.test.ts         # Deep linking
├── integration/                # Entegrasyon testleri
│   └── auth/
│       └── LoginForm.test.tsx
└── e2e/                        # End-to-end testleri (Detox)
    └── auth/
        ├── login.e2e.ts
        └── register.e2e.ts
```

## Test Kapsamı

### Auth Module (~95% coverage)
- ✅ Login/Register/Logout mutations
- ✅ Token management
- ✅ Biometric authentication
- ✅ Zod validation schemas
- ✅ Auth store (Zustand)
- ✅ Auth API methods

### Core Module (~90% coverage)
- ✅ AsyncStorage wrapper
- ✅ SecureStorage wrapper
- ✅ Cache manager with TTL
- ✅ API client configuration
- ✅ Request/Response interceptors
- ✅ Error handling

### Contexts (~85% coverage)
- ✅ Theme switching (light/dark/system)
- ✅ Locale switching (tr/en)
- ✅ Translation function
- ✅ Persistence

### Shared Components (~90% coverage)
- ✅ Button variants, sizes, states
- ✅ Input validation, password toggle
- ✅ Loading states, overlay mode
- ✅ Accessibility attributes

### Theme System (~100% coverage)
- ✅ Colors (light/dark)
- ✅ Typography presets
- ✅ Spacing scale (4/8px grid)

### Navigation (~80% coverage)
- ✅ Deep linking configuration
- ✅ URL schemes

## Test Komutları

```bash
# Tüm testleri çalıştır
npm test

# Watch modunda çalıştır
npm run test:watch

# Coverage raporu ile çalıştır
npm run test:coverage

# Sadece unit testleri
npm run test:unit

# Sadece integration testleri
npm run test:integration

# E2E testleri (iOS)
npm run test:e2e

# E2E testleri (Android)
npm run test:e2e:android

# CI/CD için
npm run test:ci
```

## Coverage Hedefleri

| Kategori    | Hedef | Mevcut |
|-------------|-------|--------|
| Statements  | 70%   | ~85%   |
| Branches    | 70%   | ~80%   |
| Functions   | 70%   | ~90%   |
| Lines       | 70%   | ~85%   |

## Test Yazım Kuralları

1. **Türkçe test açıklamaları**: Test isimleri Türkçe olmalı
2. **AAA Pattern**: Arrange, Act, Assert
3. **Mock izolasyonu**: Her test bağımsız çalışmalı
4. **Accessibility testleri**: A11y özellikleri test edilmeli
5. **Edge cases**: Sınır durumları kapsanmalı

## Örnek Test

```typescript
describe('Button Component', () => {
  it('tıklandığında onPress çağırmalı', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ThemeProvider>
        <Button title="Test" onPress={onPress} testID="button" />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## E2E Test Ortamı

E2E testleri Detox ile yapılır:

```bash
# iOS simulator build
detox build -c ios.sim.debug

# Android emulator build
detox build -c android.emu.debug
```

## CI/CD Entegrasyonu

GitHub Actions ile her PR'da testler otomatik çalışır:

```yaml
- name: Run Tests
  run: |
    npm run test:ci
    npm run typecheck
    npm run lint
```
