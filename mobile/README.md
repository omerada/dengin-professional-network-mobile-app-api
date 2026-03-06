# Dengin Mobile

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54-black?logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey" alt="Platform" />
</p>

Dengin platformunun cross-platform mobil uygulaması — React Native, Expo ve TypeScript ile feature-driven modüler mimari.

## İçindekiler

- [Mimari](#mimari)
- [Ön Gereksinimler](#ön-gereksinimler)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Testler](#testler)
- [Proje Yapısı](#proje-yapısı)
- [Özellikler](#özellikler)
- [Navigasyon](#navigasyon)
- [Durum Yönetimi](#durum-yönetimi)
- [Tema Sistemi](#tema-sistemi)
- [Push Bildirimler (FCM)](#push-bildirimler-fcm)
- [Build ve Dağıtım](#build-ve-dağıtım)
- [Yapılandırma](#yapılandırma)

## Mimari

Uygulama, **feature-driven modüler mimari** ile yapılandırılmıştır:

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  (Providers: Theme, Toast, Locale, QueryClient) │
├─────────────────────────────────────────────────┤
│              Core / Navigation                   │
│   AppNavigator ─ AuthNavigator ─ MainNavigator  │
├──────┬──────┬──────┬──────┬──────┬──────────────┤
│ Auth │ Feed │ Msg  │ Vrf  │ Prof │ ...6 modül   │
│      │      │      │      │      │              │
│screen│screen│screen│screen│screen│              │
│hook  │hook  │hook  │hook  │hook  │              │
│store │store │store │store │store │              │
│svc   │svc   │svc   │svc   │svc   │              │
├──────┴──────┴──────┴──────┴──────┴──────────────┤
│                Shared Layer                      │
│  43+ Bileşen │ 22 Hook │ Servisler │ Utils      │
├─────────────────────────────────────────────────┤
│              Core Services                       │
│  API Client │ Storage │ Navigation │ Cache       │
├─────────────────────────────────────────────────┤
│       Theme │ Constants │ Config │ Types         │
└─────────────────────────────────────────────────┘
```

### Mimari Prensipler

- **Feature İzolasyonu** — Her modül kendi ekranları, hook'ları, store'ları ve servislerini içerir
- **Tek Yönlü Veri Akışı** — Zustand store → React component → API service
- **Tip Güvenliği** — Full TypeScript strict mode, tüm path alias'lar
- **Bileşen Yeniden Kullanımı** — Shared katmanında 43+ ortak bileşen

## Ön Gereksinimler

| Araç               | Minimum Versiyon | Açıklama                                                     |
| ------------------ | ---------------- | ------------------------------------------------------------ |
| **Node.js**        | 18+              | JavaScript runtime                                           |
| **npm**            | 9+               | Paket yöneticisi                                             |
| **Expo CLI**       | Son sürüm        | `npx expo` ile otomatik                                      |
| **Android Studio** | Hedgehog+        | Android geliştirme (opsiyonel)                               |
| **Xcode**          | 15+              | iOS geliştirme (sadece macOS)                                |
| **Backend**        | Çalışır durumda  | API servisi (bkz. [backend/README.md](../backend/README.md)) |

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
cd mobile
npm install
```

### 2. Ortam Değişkenlerini Yapılandırın

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

| Değişken                   | Açıklama                       | Varsayılan                 |
| -------------------------- | ------------------------------ | -------------------------- |
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL'i              | (boş — localhost kullanır) |
| `EXPO_PUBLIC_WS_URL`       | WebSocket URL'i                | (API URL'inden türetilir)  |
| `EXPO_PUBLIC_FIREBASE_*`   | Firebase yapılandırması        | (boş)                      |
| `EXPO_PUBLIC_SENTRY_DSN`   | Sentry hata izleme             | (boş)                      |
| `EXPO_PUBLIC_ENVIRONMENT`  | Ortam (development/production) | `development`              |

> **Not:** Android emülatörü `localhost`'u otomatik olarak `10.0.2.2`'ye çevirir. Fiziksel cihazda `EXPO_PUBLIC_API_BASE_URL` olarak makinenizin yerel IP adresini girin.

### 3. Firebase Yapılandırması (Opsiyonel)

Push bildirimler için:

1. [Firebase Console](https://console.firebase.google.com) üzerinden proje oluşturun
2. Android uygulaması ekleyin (paket adı: `com.adalabs.dengin`)
3. `google-services.json` dosyasını `android/app/` dizinine koyun
4. iOS için `GoogleService-Info.plist` dosyasını `ios/` dizinine koyun

> **Not:** Firebase push bildirimleri **Expo Go** ile çalışmaz. Test için EAS Development Build gereklidir. Detaylar: [FCM Kullanım Kılavuzu](FCM_KULLANIM_KILAVUZU.md)

## Çalıştırma

### Expo Go ile Geliştirme

```bash
# Expo dev server başlat
npm start

# Platform belirterek başlat
npm run android    # Android emülatörü
npm run ios        # iOS simülatörü (sadece macOS)
```

### Fiziksel Cihazda Test

1. IP adresini yapılandırın:

```bash
# Otomatik IP algılama ve .env güncelleme
node scripts/get-local-ip.js
```

2. Backend'in aynı ağda çalıştığından emin olun
3. `npm start` ile QR kodu okutun

### EAS Development Build

Native modüller (Firebase, Camera, Biometrics) için:

```bash
# Android development build
npx eas build --profile development --platform android

# Cihaza yükleyip dev server'a bağlanma
npm start -- --dev-client
```

## Testler

```bash
# Birim testleri
npm run test:unit

# Entegrasyon testleri
npm run test:integration

# E2E testleri
npm run test:e2e

# Tüm testler
npm test

# Kapsam raporu ile
npm test -- --coverage

# TypeScript tip kontrolü
npm run typecheck
```

### Test Mimarisi

```
__tests__/
├── unit/              # Birim testleri
│   ├── auth/          # Kimlik doğrulama testleri
│   ├── feed/          # Akış testleri
│   ├── messaging/     # Mesajlaşma testleri
│   ├── hooks/         # Custom hook testleri
│   ├── services/      # Servis testleri
│   ├── utils/         # Yardımcı fonksiyon testleri
│   └── ...
├── integration/       # Entegrasyon testleri
│   ├── auth/
│   ├── feed/
│   ├── messaging/
│   └── offline/
├── e2e/               # Uçtan uca testler
│   ├── auth/
│   ├── feed/
│   └── messaging/
├── utils/
│   └── testUtils.tsx  # Test yardımcı fonksiyonları
└── setup.ts           # Jest global yapılandırma
```

**Kapsam Hedefi:** %70 (dal, fonksiyon, satır, ifade)

## Proje Yapısı

```
mobile/
├── src/
│   ├── App.tsx                    # Kök bileşen (provider zinciri)
│   │
│   ├── config/                    # Uygulama yapılandırması
│   │   ├── app.ts                 # Sabitler (timeout, retry, pagination)
│   │   ├── env.ts                 # Ortam değişkenleri erişimi
│   │   ├── deepLinking.ts         # Deep link şemaları ve yönlendirme
│   │   └── index.ts               # Barrel export
│   │
│   ├── constants/                 # Uygulama sabitleri
│   │   ├── animationPresets.ts    # Animasyon yapılandırmaları
│   │   ├── hapticPresets.ts       # Titreşim geri bildirim
│   │   ├── layoutConstants.ts     # Layout ölçüleri
│   │   ├── unifiedNavigation.ts   # Navigasyon sabitleri
│   │   └── ...
│   │
│   ├── core/                      # Çekirdek altyapı
│   │   ├── api/                   # Axios HTTP istemcisi & endpoint'ler
│   │   │   ├── client.ts          # Axios instance (interceptor'lar)
│   │   │   └── endpoints.ts       # API endpoint tanımları
│   │   ├── navigation/            # React Navigation yapısı
│   │   │   ├── AppNavigator.tsx   # Kök navigator
│   │   │   ├── AuthNavigator.tsx  # Giriş/kayıt akışı
│   │   │   ├── MainNavigator.tsx  # Ana uygulama (tab bar)
│   │   │   └── components/        # Özel tab bar bileşeni
│   │   ├── storage/               # Depolama soyutlaması
│   │   │   ├── secureStorage.ts   # Expo SecureStore (token'lar)
│   │   │   ├── asyncStorage.ts    # AsyncStorage (tercihler)
│   │   │   └── cache.ts           # Önbellek yönetimi
│   │   └── utils/                 # Hata yönetimi araçları
│   │
│   ├── features/                  # Feature modülleri (11 adet)
│   │   ├── auth/                  # Kimlik doğrulama
│   │   │   ├── components/        # Giriş/kayıt form bileşenleri
│   │   │   ├── hooks/             # useAuth, useLogin, useRegister
│   │   │   ├── screens/           # LoginScreen, RegisterScreen
│   │   │   ├── services/          # API çağrıları
│   │   │   ├── stores/            # Zustand auth store
│   │   │   ├── types/             # Tip tanımları
│   │   │   └── validation/        # Form doğrulama kuralları
│   │   │
│   │   ├── feed/                  # Sosyal akış
│   │   │   ├── components/        # PostCard, CreatePost, FeedList
│   │   │   ├── hooks/             # useFeed, useCreatePost
│   │   │   ├── screens/           # FeedScreen, PostDetailScreen
│   │   │   ├── services/          # Feed API servisleri
│   │   │   ├── stores/            # Feed state yönetimi
│   │   │   └── utils/             # Akış yardımcı fonksiyonları
│   │   │
│   │   ├── messaging/             # Gerçek zamanlı mesajlaşma
│   │   │   ├── components/        # ChatBubble, MessageInput
│   │   │   ├── hooks/             # useChat, useConversations
│   │   │   ├── screens/           # ChatScreen, ConversationListScreen
│   │   │   ├── services/          # WebSocket STOMP bağlantısı
│   │   │   └── stores/            # Mesaj state yönetimi
│   │   │
│   │   ├── verification/          # Kimlik doğrulama akışı
│   │   ├── profile/               # Profil yönetimi
│   │   ├── notifications/         # Bildirim yönetimi
│   │   ├── social/                # Sosyal etkileşimler
│   │   ├── moderation/            # İçerik raporlama
│   │   ├── activity/              # Aktivite akışı
│   │   ├── onboarding/            # İlk kullanım rehberi
│   │   └── legal/                 # Yasal sayfalar
│   │
│   ├── shared/                    # Paylaşılan katman
│   │   ├── components/            # 43+ yeniden kullanılabilir bileşen
│   │   │   ├── Avatar/            # Profil fotoğrafı bileşeni
│   │   │   ├── Button/            # Özelleştirilebilir buton
│   │   │   ├── Card/              # Kart container
│   │   │   ├── FormField/         # Form alan bileşeni
│   │   │   ├── Input/             # Metin girişi
│   │   │   ├── Loading/           # Yükleniyor göstergesi
│   │   │   ├── Modal/             # Modal pencere
│   │   │   └── ...                # 36+ diğer bileşenler
│   │   ├── hooks/                 # 22 özel hook
│   │   │   ├── useAnimatedValue   # Reanimated wrapper
│   │   │   ├── useAppState        # Uygulama yaşam döngüsü
│   │   │   ├── useDebounce        # Geciktirilmiş değer
│   │   │   ├── useNetworkStatus   # Ağ durumu izleme
│   │   │   └── ...
│   │   ├── services/              # Analytics, Haptic, Image
│   │   ├── utils/                 # Date, String, Validation
│   │   └── layout/                # Container, ScrollView
│   │
│   ├── theme/                     # Tasarım sistemi
│   │   ├── colors.ts              # Renk paleti (light/dark)
│   │   ├── typography.ts          # Yazı tipi boyutları
│   │   ├── spacing.ts             # Boşluk ölçüleri
│   │   ├── shadows.ts             # Gölge sistemi
│   │   └── animations.ts          # Reanimated preset'leri
│   │
│   ├── contexts/                  # React Context'ler
│   │   ├── ThemeContext.tsx        # Light/Dark tema yönetimi
│   │   ├── LocaleContext.tsx       # Çoklu dil desteği
│   │   └── ToastContext.tsx        # Bildirim toast'ları
│   │
│   └── types/                     # Global tip tanımları
│       ├── react-native-biometrics.d.ts
│       ├── react-native-firebase.d.ts
│       └── ...
│
├── __tests__/                     # Test dosyaları
├── __mocks__/                     # Jest modül mock'ları
├── assets/                        # Statik dosyalar
├── android/                       # Android native konfigürasyon
├── e2e/                           # Detox E2E testleri
├── fastlane/                      # CI/CD otomasyon
├── scripts/                       # Yardımcı scriptler
│
├── app.json                       # Expo yapılandırması
├── babel.config.js                # Babel transpiler yapılandırması
├── metro.config.js                # Metro bundler yapılandırması
├── jest.config.js                 # Jest test yapılandırması
├── tsconfig.json                  # TypeScript yapılandırması
├── package.json                   # npm bağımlılıkları
└── .env.example                   # Ortam değişkenleri şablonu
```

## Özellikler

### Feature Modülleri

Her feature modülü aynı yapıyı takip eder:

```
feature/
├── components/    # Özel UI bileşenleri
├── hooks/         # Veri çekme ve iş mantığı hook'ları
├── screens/       # Ekran bileşenleri
├── services/      # API çağrıları
├── stores/        # Zustand state store'ları
├── types/         # TypeScript tip tanımları
├── utils/         # Yardımcı fonksiyonlar (opsiyonel)
├── validation/    # Form doğrulama (opsiyonel)
└── index.ts       # Barrel export
```

### Bileşen Kütüphanesi (Shared Components)

43+ yeniden kullanılabilir bileşen:

| Bileşen         | Açıklama                               |
| --------------- | -------------------------------------- |
| `Avatar`        | Profil fotoğrafı (doğrulama rozeti)    |
| `Button`        | Birincil, ikincil, outline varyantları |
| `Card`          | İçerik kartı container                 |
| `FormField`     | Label, input, hata mesajı              |
| `Input`         | Metin, şifre, arama girişi             |
| `Loading`       | Skeleton, spinner, progressbar         |
| `Modal`         | Alt sayfa, tam ekran, onay             |
| `ActionSheet`   | iOS/Android native action sheet        |
| `Divider`       | Görsel ayırıcı                         |
| `ErrorBoundary` | Hata yakalama (Sentry)                 |

## Navigasyon

React Navigation 6 ile 3 katmanlı navigasyon yapısı:

```
AppNavigator (Stack)
├── AuthNavigator (Stack)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
├── VerificationNavigator (Stack)
│   ├── VerificationIntroScreen
│   ├── DocumentUploadScreen
│   └── SelfieScreen
│
└── MainNavigator (Bottom Tabs)
    ├── FeedScreen (Home Tab)
    ├── SearchScreen (Discover Tab)
    ├── MessagingScreen (Chat Tab)
    ├── NotificationsScreen (Notifications Tab)
    └── ProfileScreen (Profile Tab)
        ├── EditProfileScreen
        ├── SettingsScreen
        └── ...
```

### Deep Linking

Desteklenen URL şemaları:

| Şema                            | Açıklama            |
| ------------------------------- | ------------------- |
| `dengin://feed`                 | Ana akış            |
| `dengin://post/:postId`         | Gönderi detayı      |
| `dengin://profile/:userId`      | Kullanıcı profili   |
| `dengin://chat/:conversationId` | Sohbet ekranı       |
| `dengin://verification`         | Doğrulama akışı     |
| `https://dengin.app/post/:id`   | Web URL yönlendirme |

## Durum Yönetimi

### Zustand + Immer

Global state yönetimi için Zustand kullanılır:

```typescript
// Örnek: Auth Store
const useAuthStore = create(
  immer(set => ({
    user: null,
    isAuthenticated: false,
    login: user =>
      set(state => {
        state.user = user;
        state.isAuthenticated = true;
      }),
    logout: () =>
      set(state => {
        state.user = null;
        state.isAuthenticated = false;
      }),
  })),
);
```

### React Query

Sunucu verisi yönetimi:

- **Stale Time:** 5 dakika
- **GC Time:** 10 dakika
- **Retry:** 2 deneme
- **Refetch:** Uygulama ön plana geldiğinde otomatik

### Depolama Stratejisi

| Veri Türü            | Depolama          | Kütüphane        |
| -------------------- | ----------------- | ---------------- |
| JWT Token            | Güvenli depolama  | Expo SecureStore |
| Kullanıcı tercihleri | Kalıcı depolama   | AsyncStorage     |
| Sunucu verisi        | Bellekte önbellek | React Query      |
| Feature state        | Bellekte state    | Zustand          |

## Tema Sistemi

Light ve Dark mod desteği ile tasarım sistemi:

```typescript
// Renk kullanımı
const { colors } = useTheme();
<Text style={{ color: colors.text.primary }}>Merhaba</Text>

// Spacing
<View style={{ padding: spacing.md, margin: spacing.lg }} />

// Typography
<Text style={typography.heading.h1}>Başlık</Text>
```

### Tasarım Token'ları

- **Colors** — Primary, secondary, background, text, error, success, warning
- **Typography** — H1-H6, body, caption, button (boyut + ağırlık)
- **Spacing** — xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- **Shadows** — 4 seviye elevation
- **Animations** — Spring, timing, bounce preset'leri

## Push Bildirimler (FCM)

Firebase Cloud Messaging entegrasyonu:

| Özellik              | Expo Go | EAS Build |
| -------------------- | ------- | --------- |
| Mock FCM (test)      | ✅      | ✅        |
| Gerçek push bildirim | ❌      | ✅        |
| Arka plan bildirimi  | ❌      | ✅        |
| Bildirim tıklama     | ❌      | ✅        |

> Detaylı kurulum için: [FCM Kullanım Kılavuzu](FCM_KULLANIM_KILAVUZU.md)

### Geliştirme Akışı

1. **Haftalık geliştirme:** Expo Go + mock FCM
2. **FCM testi:** EAS development build
3. **Üretim:** Full native build

## Build ve Dağıtım

### EAS Build

```bash
# Development build (test)
npx eas build --profile development --platform android

# Preview build (dahili dağıtım)
npx eas build --profile preview --platform android

# Production build (mağaza)
npx eas build --profile production --platform android
npx eas build --profile production --platform ios
```

### Fastlane (Opsiyonel)

```bash
cd mobile

# iOS TestFlight
bundle exec fastlane ios beta

# Android Play Store (iç test)
bundle exec fastlane android beta

# Versiyon güncelleme
bundle exec fastlane bump version:1.1.0
```

### Mağaza Gönderimi

```bash
# Android - Play Store
npx eas submit --platform android

# iOS - App Store
npx eas submit --platform ios
```

## Yapılandırma

### Path Alias'ları

TypeScript path alias'ları ile temiz import'lar:

```typescript
// ❌ Göreceli yol
import { Button } from '../../../shared/components/Button';

// ✅ Alias kullanımı
import { Button } from '@shared/components/Button';
```

| Alias          | Hedef             | Açıklama              |
| -------------- | ----------------- | --------------------- |
| `@features/*`  | `src/features/*`  | Feature modülleri     |
| `@core/*`      | `src/core/*`      | Çekirdek altyapı      |
| `@shared/*`    | `src/shared/*`    | Paylaşılan bileşenler |
| `@theme/*`     | `src/theme/*`     | Tasarım sistemi       |
| `@contexts/*`  | `src/contexts/*`  | React Context'ler     |
| `@config/*`    | `src/config/*`    | Yapılandırma          |
| `@constants/*` | `src/constants/*` | Sabitler              |
| `@assets/*`    | `assets/*`        | Statik dosyalar       |

### Uygulama Sabitleri

[src/config/app.ts](src/config/app.ts) dosyasında merkezi sabitler:

| Sabit               | Değer | Açıklama                   |
| ------------------- | ----- | -------------------------- |
| API Timeout         | 30s   | HTTP istek zaman aşımı     |
| Retry sayısı        | 3     | Başarısız istek tekrarı    |
| Sayfa boyutu        | 20    | Pagination öğe sayısı      |
| Max resim boyutu    | 5MB   | Resim yükleme limiti       |
| Max video boyutu    | 50MB  | Video yükleme limiti       |
| WebSocket reconnect | 3s    | Yeniden bağlanma gecikmesi |
| Token refresh       | 5 dk  | Token yenileme eşiği       |

## Teknoloji Detayları

### Temel Bağımlılıklar

| Kütüphane              | Amaç                |
| ---------------------- | ------------------- |
| React 19.1             | UI framework        |
| React Native 0.81      | Native köprüsü      |
| Expo SDK 54            | Geliştirme araçları |
| React Navigation 6     | Ekran yönlendirme   |
| Zustand + Immer        | State yönetimi      |
| React Query 5          | Sunucu verisi       |
| Axios                  | HTTP istemcisi      |
| @stomp/stompjs         | WebSocket STOMP     |
| @react-native-firebase | Push bildirimler    |
| Reanimated 3           | 60fps animasyonlar  |
| Lottie                 | JSON animasyonlar   |
| Lucide Icons           | İkon kütüphanesi    |
| Expo SecureStore       | Güvenli depolama    |

### Dev Bağımlılıklar

| Kütüphane        | Amaç           |
| ---------------- | -------------- |
| TypeScript 5     | Tip güvenliği  |
| Jest + jest-expo | Test framework |
| Testing Library  | Bileşen testi  |
| ESLint           | Kod kalitesi   |
| Prettier         | Kod formatlama |
