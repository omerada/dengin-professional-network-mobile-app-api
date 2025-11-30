# 📱 Meslektaş Mobile Development Guide

> **Production-Ready React Native Development Guide**  
> Complete documentation for AI-assisted mobile app development

---

## 📚 Dokümantasyon Yapısı

Bu guide, **React Native** ile production-ready mobile app geliştirmek için gereken **TÜM** detayları içerir. Her bölüm bağımsız okunabilir ve AI agent'lar tarafından direkt kullanılabilir.

---

## 🗺️ Navigasyon

### 1️⃣ Architecture & Setup

- **[01-MOBILE-ARCHITECTURE.md](./architecture/01-MOBILE-ARCHITECTURE.md)** - App architecture, folder structure, design patterns
- **[02-PROJECT-SETUP.md](./architecture/02-PROJECT-SETUP.md)** - React Native setup, dependencies, configuration

### 2️⃣ Feature Modules (6 Modules)

- **[03-AUTH-MODULE.md](./features/03-AUTH-MODULE.md)** - Authentication flow, login, register
- **[04-VERIFICATION-MODULE.md](./features/04-VERIFICATION-MODULE.md)** - Document upload, camera, AI verification ⭐ COMPLEX
- **[05-FEED-MODULE.md](./features/05-FEED-MODULE.md)** - Feed rendering, infinite scroll, pull-to-refresh
- **[06-MESSAGING-MODULE.md](./features/06-MESSAGING-MODULE.md)** - Real-time chat, WebSocket ⭐ COMPLEX
- **[07-NOTIFICATIONS-MODULE.md](./features/07-NOTIFICATIONS-MODULE.md)** - Push notifications, FCM ⭐ COMPLEX
- **[08-PROFILE-MODULE.md](./features/08-PROFILE-MODULE.md)** - Profile management, settings

### 3️⃣ Core Components

- **[09-NAVIGATION.md](./core/09-NAVIGATION.md)** - React Navigation setup, deep linking
- **[10-API-CLIENT.md](./core/10-API-CLIENT.md)** - Axios, interceptors, error handling
- **[11-STORAGE.md](./core/11-STORAGE.md)** - AsyncStorage, secure storage, caching
- **[12-MEDIA-HANDLING.md](./core/12-MEDIA-HANDLING.md)** - Camera, image picker, compression
- **[13-REAL-TIME.md](./core/13-REAL-TIME.md)** - WebSocket, Socket.IO, real-time updates

### 4️⃣ State Management

- **[14-ZUSTAND-STORE.md](./state/14-ZUSTAND-STORE.md)** - Zustand setup, stores, persistence
- **[15-REACT-QUERY.md](./state/15-REACT-QUERY.md)** - Server state, caching, optimistic updates
- **[16-CONTEXT-API.md](./state/16-CONTEXT-API.md)** - Theme, locale, global state

### 5️⃣ UI/UX Patterns

- **[17-DESIGN-SYSTEM.md](./ui/17-DESIGN-SYSTEM.md)** - Components, tokens, theming
- **[18-ANIMATIONS.md](./ui/18-ANIMATIONS.md)** - Reanimated, gestures, micro-interactions
- **[19-FORMS.md](./ui/19-FORMS.md)** - Form handling, validation, react-hook-form
- **[20-ACCESSIBILITY.md](./ui/20-ACCESSIBILITY.md)** - A11y, screen readers, keyboard navigation

### 6️⃣ Testing

- **[21-TESTING-STRATEGY.md](./testing/21-TESTING-STRATEGY.md)** - Jest, Testing Library, E2E
- **[22-TEST-UTILS.md](./testing/22-TEST-UTILS.md)** - Test helpers, mocks, fixtures

### 7️⃣ Sprint Implementation

- **[23-SPRINT-01-02.md](./sprints/23-SPRINT-01-02.md)** - Sprint 1-2: Foundation & Auth
- **[24-SPRINT-03-04.md](./sprints/24-SPRINT-03-04.md)** - Sprint 3-4: Verification & Camera
- **[25-SPRINT-05-06.md](./sprints/25-SPRINT-05-06.md)** - Sprint 5-6: Feed & Social
- **[26-SPRINT-07-08.md](./sprints/26-SPRINT-07-08.md)** - Sprint 7-8: Messaging & Real-time
- **[27-SPRINT-09-10.md](./sprints/27-SPRINT-09-10.md)** - Sprint 9-10: Notifications & Push
- **[28-SPRINT-11-12.md](./sprints/28-SPRINT-11-12.md)** - Sprint 11-12: Polish & Release

### 8️⃣ Best Practices

- **[29-CODE-STANDARDS.md](./best-practices/29-CODE-STANDARDS.md)** - React Native conventions
- **[30-PERFORMANCE.md](./best-practices/30-PERFORMANCE.md)** - Optimization, memory management
- **[31-SECURITY.md](./best-practices/31-SECURITY.md)** - Secure storage, SSL pinning, code obfuscation
- **[32-DEPLOYMENT.md](./best-practices/32-DEPLOYMENT.md)** - App Store, Play Store, CI/CD

---

## 🎯 Hızlı Başlangıç

### Yeni Geliştiriciler İçin

1. ✅ **[01-MOBILE-ARCHITECTURE.md](./architecture/01-MOBILE-ARCHITECTURE.md)** okuyun (App yapısı)
2. ✅ **[02-PROJECT-SETUP.md](./architecture/02-PROJECT-SETUP.md)** ile setup yapın
3. ✅ **[03-AUTH-MODULE.md](./features/03-AUTH-MODULE.md)** ile başlayın
4. ✅ **[29-CODE-STANDARDS.md](./best-practices/29-CODE-STANDARDS.md)** standardları öğrenin

### AI Agents İçin

1. Feature bazlı development: İlgili `features/*.md` dosyasını oku
2. Component ihtiyacı: `core/*.md` dosyalarına bak
3. State management: `state/*.md` kullan
4. Testing: `testing/*.md` stratejisini uygula

---

## 📋 Proje Bilgileri

### Tech Stack

```yaml
Framework: React Native 0.72+
Language: TypeScript 5.0+
Navigation: React Navigation 6.x
State Management: Zustand + React Query
UI Library: React Native Paper / Custom
HTTP Client: Axios
Real-time: Socket.IO Client
Storage: AsyncStorage + SecureStore
Image Handling: react-native-image-picker
Camera: react-native-vision-camera
Push Notifications: @react-native-firebase/messaging
Analytics: Firebase Analytics
Error Tracking: Sentry
Testing: Jest + React Native Testing Library
E2E: Detox
Build: Fastlane
CI/CD: GitHub Actions
```

### Module Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MESLEKTAŞ MOBILE APP                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────────┐                 │
│  │     Auth     │───→│   Verification   │ (CORE FEATURE)  │
│  │    Module    │    │      Module      │                 │
│  └──────────────┘    └────────┬─────────┘                 │
│         │                     │                            │
│         ↓                     ↓                            │
│  ┌──────────────┐    ┌──────────────┐                     │
│  │     Feed     │    │  Messaging   │                     │
│  │    Module    │    │    Module    │                     │
│  └──────┬───────┘    └──────┬───────┘                     │
│         │                   │                              │
│         └────────┬──────────┘                              │
│                  ↓                                          │
│         ┌─────────────────┐      ┌──────────────┐         │
│         │  Notifications  │      │   Profile    │         │
│         │     Module      │      │    Module    │         │
│         └─────────────────┘      └──────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### App Features

```
✅ Authentication:
  - Email/Password login
  - JWT token management
  - Biometric authentication
  - Secure token storage

✅ Verification:
  - Camera integration
  - Document capture
  - Image upload
  - Real-time progress
  - AI status tracking

✅ Feed:
  - Infinite scroll
  - Pull-to-refresh
  - Image lazy loading
  - Like/Comment
  - Share functionality

✅ Messaging:
  - Real-time chat
  - WebSocket connection
  - Typing indicators
  - Read receipts
  - Image sharing
  - Message search

✅ Notifications:
  - Push notifications (FCM)
  - In-app notifications
  - Badge management
  - Deep linking
  - Notification settings

✅ Profile:
  - Profile editing
  - Image upload
  - Settings
  - Privacy controls
  - Logout
```

---

## 🛠️ Development Workflow

### Feature Development

```bash
# 1. Module seç
Hangi feature? → features/{MODULE}.md oku

# 2. UI tasarla
ui/17-DESIGN-SYSTEM.md → Components
ui/19-FORMS.md → Form handling

# 3. State management
state/14-ZUSTAND-STORE.md → Local state
state/15-REACT-QUERY.md → Server state

# 4. API integration
core/10-API-CLIENT.md → HTTP client
core/13-REAL-TIME.md → WebSocket

# 5. Navigation
core/09-NAVIGATION.md → Screens, routes

# 6. Testing
testing/21-TESTING-STRATEGY.md → Test strategy
testing/22-TEST-UTILS.md → Test helpers

# 7. Code standards check
best-practices/29-CODE-STANDARDS.md → Conventions
best-practices/30-PERFORMANCE.md → Optimization
```

---

## 📊 Complexity Indicators

### Module Complexity Levels

```
Auth Module:           ⭐⭐ (Medium)
Feed Module:           ⭐⭐ (Medium)
Profile Module:        ⭐⭐ (Medium)
Messaging Module:      ⭐⭐⭐ (High) - Real-time
Notifications Module:  ⭐⭐⭐ (High) - Push, Deep linking
Verification Module:   ⭐⭐⭐⭐ (Very High) - Camera, Upload
```

### Implementation Priority

```
Sprint 1-2:  Foundation + Auth (Setup, Login, Register)
Sprint 3-4:  Verification (Camera, Upload, Status)
Sprint 5-6:  Feed + Social (Posts, Comments, Likes)
Sprint 7-8:  Messaging (Real-time chat, WebSocket)
Sprint 9-10: Notifications (FCM, Deep linking)
Sprint 11-12: Polish + Release (Performance, Store)
```

---

## 🔍 Önemli Notlar

### ⚠️ Performance Considerations

**Memory Management:**

- Image optimization (max 1MB)
- List virtualization (FlatList)
- Memo components
- Lazy loading

**Detaylar:** **[30-PERFORMANCE.md](./best-practices/30-PERFORMANCE.md)**

### 🎯 Camera Integration

**react-native-vision-camera:**

- High-quality capture
- Real-time preview
- Format support
- Permission handling

**Detaylar:** **[04-VERIFICATION-MODULE.md](./features/04-VERIFICATION-MODULE.md)** + **[12-MEDIA-HANDLING.md](./core/12-MEDIA-HANDLING.md)**

### 📨 Real-time Requirements

**Socket.IO Client:**

- Auto-reconnection
- Message queuing
- Typing indicators
- Read receipts

**Detaylar:** **[06-MESSAGING-MODULE.md](./features/06-MESSAGING-MODULE.md)** + **[13-REAL-TIME.md](./core/13-REAL-TIME.md)**

### 🔐 Security

**Secure Storage:**

- Keychain (iOS)
- Keystore (Android)
- Token encryption
- Biometric auth

**Detaylar:** **[31-SECURITY.md](./best-practices/31-SECURITY.md)**

---

## 🚀 Deployment

Production deployment guide:

- **[32-DEPLOYMENT.md](./best-practices/32-DEPLOYMENT.md)** (App Store, Play Store)
- **[31-SECURITY.md](./best-practices/31-SECURITY.md)** (Security setup)
- **[30-PERFORMANCE.md](./best-practices/30-PERFORMANCE.md)** (Optimization)

---

## 📞 Yardım

Her dosya bağımsız ve eksiksiz. Takıldığınız noktada:

1. İlgili feature dosyasını okuyun
2. Core component dosyalarına bakın
3. Best practices kontrol edin
4. Sprint implementation'da örnek bulun

**Her şey production-ready olacak şekilde tasarlandı. Hiçbir detay atlanmadı.** 🎯

---

## 📱 Platform Support

```
iOS: 13.0+
Android: API 23+ (Android 6.0)
```

### Platform-Specific Features

```
iOS:
  - Face ID / Touch ID
  - Push notifications (APNs)
  - Deep linking (Universal Links)
  - App Clips (future)

Android:
  - Fingerprint / Face unlock
  - Push notifications (FCM)
  - Deep linking (App Links)
  - App Bundles
```

---

**Son Güncelleme:** 30 Kasım 2025  
**Versiyon:** 1.0  
**Hazırlayan:** Senior Mobile Architect
