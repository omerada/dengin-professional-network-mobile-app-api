# Deployment Guide

**Purpose:** App Store & Play Store release, CI/CD automation
**Complexity:** ⭐⭐⭐ (Medium)

---

## Overview

Bu doküman, React Native uygulamasını iOS App Store ve Android Play Store'a deploy etme sürecini açıklar.

---

## Version Management

### Semantic Versioning

```
Version format: MAJOR.MINOR.PATCH

1.0.0 - Initial release
1.1.0 - New features (backward compatible)
1.1.1 - Bug fixes
2.0.0 - Breaking changes
```

### iOS (Xcode)

```
1. Open ios/Meslektas.xcworkspace in Xcode
2. Select target > General
3. Update Version (1.0.0)
4. Update Build (1, 2, 3...)
```

### Android

```gradle
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 1        // Integer, increment for each release
        versionName "1.0.0"  // String, semantic version
    }
}
```

---

## iOS Deployment

### Prerequisites

```bash
# 1. Apple Developer Account ($99/year)
# 2. Xcode (latest version)
# 3. App Store Connect app created
```

### App Icons

```
Required sizes:
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro @2x)
- 152x152 (iPad @2x)
- 76x76 (iPad @1x)

# Generate using: https://appicon.co
```

### Code Signing

```
1. Open Xcode
2. Select project > Signing & Capabilities
3. Select Team (Apple Developer account)
4. Enable "Automatically manage signing"
5. Select Provisioning Profile
```

### Build & Archive

```bash
# 1. Clean build
cd ios
rm -rf build
pod install

# 2. Open in Xcode
open Meslektas.xcworkspace

# 3. Select "Any iOS Device (arm64)" scheme
# 4. Product > Archive
# 5. Wait for archive to complete
```

### Upload to App Store Connect

```
1. Window > Organizer
2. Select archive
3. Click "Distribute App"
4. Select "App Store Connect"
5. Upload
6. Wait for processing (~10 min)
```

### App Store Metadata

```
App Name: Meslektaş
Subtitle: Profesyonel Network Platformu
Description:
Meslektaş, profesyonellerin buluştuğu, bilgi paylaştığı ve
kariyer fırsatları keşfettiği bir sosyal network platformudur.

✨ Özellikler:
• Profesyonel profil oluşturma
• Kimlik doğrulama sistemi
• Anlık mesajlaşma
• Gönderi paylaşma ve etkileşim
• Bildirimler

Keywords: networking, kariyer, profesyonel, iş, mesajlaşma
Category: Social Networking
Age Rating: 12+

Screenshots: 6.5" iPhone (1284x2778) - 5 screenshots
Privacy Policy: https://meslektas.com/privacy
Support URL: https://meslektas.com/support
Marketing URL: https://meslektas.com
```

### Submit for Review

```
1. Go to App Store Connect
2. Select app > Version
3. Fill metadata
4. Add screenshots
5. Add app preview video (optional)
6. Submit for review
7. Wait for approval (1-3 days)
```

---

## Android Deployment

### Prerequisites

```bash
# 1. Google Play Console account ($25 one-time)
# 2. Android Studio (optional)
# 3. App created in Play Console
```

### Generate Signing Key

```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore meslektas-release.keystore \
  -alias meslektas \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Enter password and details
# Store keystore safely (NEVER commit to git)
```

### Configure Gradle

```properties
# android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=meslektas-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=meslektas
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

```gradle
// android/app/build.gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build AAB (App Bundle)

```bash
cd android

# Clean
./gradlew clean

# Build release AAB
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Upload to Play Console

```
1. Go to Google Play Console
2. Select app > Release > Production
3. Create new release
4. Upload AAB
5. Fill release notes
6. Review release
7. Submit for review
```

### Play Store Metadata

```
App Name: Meslektaş
Short Description (80 chars):
Profesyonellerin buluştuğu network platformu

Full Description (4000 chars):
Meslektaş, profesyonellerin kariyer hedeflerine ulaşması için
tasarlanmış sosyal network platformudur.

🚀 Özellikler:
✓ Güvenli kimlik doğrulama
✓ Profesyonel profil oluşturma
✓ Anlık mesajlaşma
✓ Gönderi paylaşma
✓ Etkileşim ve yorum
✓ Push bildirimleri

Category: Social
Content Rating: Everyone
Privacy Policy: https://meslektas.com/privacy
```

### Store Assets

```
App Icon: 512x512 PNG

Screenshots (Phone):
- 1080x1920 or 1080x2340 (2-8 screenshots)

Feature Graphic:
- 1024x500 PNG/JPG

Promo Video (optional):
- YouTube link
```

---

## Fastlane (Automation)

### Installation

```bash
# Install Fastlane
sudo gem install fastlane

# Initialize
cd ios
fastlane init

cd ../android
fastlane init
```

### iOS Fastfile

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_app(
      scheme: "Meslektas",
      export_method: "app-store"
    )
    upload_to_testflight
  end

  desc "Release to App Store"
  lane :release do
    increment_build_number
    build_app(
      scheme: "Meslektas",
      export_method: "app-store"
    )
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false
    )
  end
end
```

### Android Fastfile

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Play Store (Internal Testing)"
  lane :beta do
    gradle(
      task: "clean bundleRelease"
    )
    upload_to_play_store(
      track: 'internal',
      aab: 'app/build/outputs/bundle/release/app-release.aab'
    )
  end

  desc "Release to Play Store"
  lane :release do
    gradle(
      task: "clean bundleRelease"
    )
    upload_to_play_store(
      track: 'production',
      aab: 'app/build/outputs/bundle/release/app-release.aab'
    )
  end
end
```

### Run Fastlane

```bash
# iOS
cd ios
fastlane beta     # Upload to TestFlight
fastlane release  # Submit to App Store

# Android
cd android
fastlane beta     # Upload to Internal Testing
fastlane release  # Submit to Production
```

---

## CI/CD (GitHub Actions)

### Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main
    tags:
      - "v*"

jobs:
  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install pods
        run: cd ios && pod install

      - name: Build iOS
        run: cd ios && fastlane beta
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          FASTLANE_USER: ${{ secrets.FASTLANE_USER }}
          FASTLANE_PASSWORD: ${{ secrets.FASTLANE_PASSWORD }}

  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: "zulu"
          java-version: "11"

      - name: Install dependencies
        run: npm ci

      - name: Build Android
        run: cd android && fastlane beta
        env:
          MYAPP_UPLOAD_STORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          MYAPP_UPLOAD_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
```

---

## Environment Variables

### .env Files

```bash
# .env.development
API_URL=http://localhost:3000
WS_URL=ws://localhost:3001
ENV=development

# .env.staging
API_URL=https://staging-api.meslektas.com
WS_URL=wss://staging-ws.meslektas.com
ENV=staging

# .env.production
API_URL=https://api.meslektas.com
WS_URL=wss://ws.meslektas.com
ENV=production
```

### Configure

```bash
# Install react-native-config
npm install react-native-config

# iOS: Add to Podfile
pod 'react-native-config', :path => '../node_modules/react-native-config'

# Android: Already configured
```

### Usage

```typescript
import Config from "react-native-config";

export const ENV = {
  API_URL: Config.API_URL,
  WS_URL: Config.WS_URL,
  ENV: Config.ENV,
};
```

---

## Testing Before Release

### Pre-Release Checklist

**Functional:**

- [ ] All features work
- [ ] No critical bugs
- [ ] Navigation flows work
- [ ] Forms submit correctly
- [ ] Images load

**Performance:**

- [ ] App launches <3s
- [ ] Feed scrolls smoothly (60 FPS)
- [ ] Memory usage <200MB
- [ ] No memory leaks

**Security:**

- [ ] Tokens stored securely
- [ ] HTTPS only
- [ ] Input validation
- [ ] No hardcoded secrets

**Platform:**

- [ ] iOS 13.0+ tested
- [ ] Android API 23+ tested
- [ ] Different screen sizes
- [ ] Portrait and landscape

**Analytics:**

- [ ] Events tracking
- [ ] Crash reporting
- [ ] User properties

---

## Beta Testing

### TestFlight (iOS)

```
1. Upload build to App Store Connect
2. Go to TestFlight tab
3. Add internal testers (up to 100)
4. Add external testers (unlimited, requires review)
5. Share TestFlight link
6. Collect feedback
```

### Internal Testing (Android)

```
1. Upload AAB to Play Console
2. Go to Internal Testing track
3. Create release
4. Add testers (email list)
5. Share opt-in link
6. Collect feedback
```

---

## Monitoring Post-Release

### Crash Reporting

```bash
# Install Firebase Crashlytics
npm install @react-native-firebase/app
npm install @react-native-firebase/crashlytics

# Usage
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().log('User logged in');
crashlytics().recordError(new Error('Test error'));
```

### Analytics

```typescript
import analytics from "@react-native-firebase/analytics";

// Track screen view
await analytics().logScreenView({
  screen_name: "Feed",
  screen_class: "FeedScreen",
});

// Track event
await analytics().logEvent("post_created", {
  content_type: "text",
  content_length: 150,
});
```

### App Store Reviews

```
1. Monitor reviews daily
2. Respond to negative reviews
3. Fix critical issues immediately
4. Release updates regularly
```

---

## Deployment Checklist

**Pre-Deployment:**

- [ ] Version bumped
- [ ] Changelog updated
- [ ] Tests passing
- [ ] Beta tested
- [ ] Screenshots updated
- [ ] Store metadata updated

**iOS:**

- [ ] Archive built
- [ ] Uploaded to App Store Connect
- [ ] TestFlight tested
- [ ] Submitted for review

**Android:**

- [ ] AAB built
- [ ] Uploaded to Play Console
- [ ] Internal testing completed
- [ ] Submitted for review

**Post-Deployment:**

- [ ] Monitor crash reports
- [ ] Track analytics
- [ ] Respond to reviews
- [ ] Plan next release

---

## Release Schedule

**Recommended:**

- Major releases: Every 2-3 months
- Minor releases: Every 2-4 weeks
- Patch releases: As needed (critical bugs)

**Example Timeline:**

```
v1.0.0 - Initial release (Week 0)
v1.0.1 - Bug fixes (Week 1)
v1.1.0 - New features (Week 4)
v1.1.1 - Bug fixes (Week 5)
v1.2.0 - New features (Week 8)
v2.0.0 - Major update (Week 12)
```

---

## Summary

✅ **Deployment Process:**

- Version management (semantic versioning)
- iOS deployment (Xcode, App Store Connect, TestFlight)
- Android deployment (Gradle, Play Console, Internal Testing)
- Fastlane automation (beta, release lanes)
- CI/CD pipeline (GitHub Actions)
- Environment variables (development, staging, production)
- Beta testing (TestFlight, Internal Testing)
- Monitoring (Crashlytics, Analytics)

**Result:** Smooth, automated deployment to App Store & Play Store

---

## Resources

**iOS:**

- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight](https://developer.apple.com/testflight/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

**Android:**

- [Google Play Console](https://play.google.com/console)
- [Material Design](https://material.io/design)
- [Android Developer Guide](https://developer.android.com)

**Automation:**

- [Fastlane Documentation](https://docs.fastlane.tools)
- [GitHub Actions](https://github.com/features/actions)

**Monitoring:**

- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
