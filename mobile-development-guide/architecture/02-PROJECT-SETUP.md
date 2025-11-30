# Project Setup & Configuration

**Version:** 1.0
**Last Updated:** 2024-11-30
**Target:** React Native 0.72+, TypeScript 5.0+

---

## 1. Overview

Bu doküman Meslektaş mobile app için development environment kurulumu, dependency yönetimi ve platform konfigürasyonlarını açıklar.

---

## 2. Prerequisites

### 2.1 Required Tools

**Node.js & Package Manager:**

```bash
# Node.js 18.x LTS
node --version  # v18.17.0+
npm --version   # 9.6.0+

# Yarn (optional)
npm install -g yarn
yarn --version  # 1.22.0+
```

**React Native CLI:**

```bash
npm install -g react-native-cli
```

**Watchman (macOS/Linux):**

```bash
# macOS
brew install watchman

# Linux
sudo apt-get install watchman
```

---

### 2.2 Platform-Specific Requirements

**iOS Development (macOS only):**

```bash
# Xcode 14.0+
xcode-select --install

# CocoaPods
sudo gem install cocoapods
pod --version  # 1.12.0+

# iOS Simulator
# Install via Xcode → Preferences → Components
```

**Android Development:**

```bash
# Android Studio
# Download from https://developer.android.com/studio

# JDK 17
java -version  # openjdk 17.0.0+

# Android SDK
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## 3. Project Initialization

### 3.1 Create New Project

```bash
# Initialize React Native project with TypeScript
npx react-native@latest init MeslektasApp --template react-native-template-typescript

cd MeslektasApp
```

---

### 3.2 Folder Structure Setup

```bash
# Create folder structure
mkdir -p src/{features,core,shared,theme,contexts,config}
mkdir -p src/features/{auth,verification,feed,messaging,notifications,profile}
mkdir -p src/core/{api,navigation,storage,socket,permissions}
mkdir -p src/shared/{components,hooks,utils,types}
mkdir -p assets/{images,icons,fonts,animations}
mkdir -p __tests__/{unit,integration,e2e}

# Create feature subfolders (example: auth)
mkdir -p src/features/auth/{screens,components,hooks,stores,services,types}
```

---

## 4. Dependencies

### 4.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",

    "// Navigation": "",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native-stack": "^6.9.17",
    "react-native-screens": "^3.27.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-gesture-handler": "^2.14.0",

    "// State Management": "",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.12.2",

    "// API & Networking": "",
    "axios": "^1.6.2",
    "socket.io-client": "^4.5.4",

    "// Storage": "",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-secure-store": "^12.5.0",

    "// Camera & Media": "",
    "react-native-vision-camera": "^3.6.12",
    "react-native-image-picker": "^5.6.1",
    "react-native-image-resizer": "^3.0.7",
    "react-native-fast-image": "^8.6.3",

    "// Push Notifications": "",
    "@react-native-firebase/app": "^18.7.0",
    "@react-native-firebase/messaging": "^18.7.0",
    "@react-native-firebase/analytics": "^18.7.0",
    "@notifee/react-native": "^7.8.2",

    "// UI & Animations": "",
    "react-native-reanimated": "^3.6.0",
    "react-native-svg": "^14.0.0",
    "lottie-react-native": "^6.4.1",

    "// Forms & Validation": "",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",

    "// Date & Time": "",
    "date-fns": "^2.30.0",

    "// Utilities": "",
    "react-native-config": "^1.5.1",
    "react-native-device-info": "^10.12.0",
    "react-native-permissions": "^4.0.3",
    "react-native-keychain": "^8.1.2",
    "react-native-biometrics": "^3.0.1"
  },

  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-native": "^0.72.7",
    "typescript": "^5.3.2",

    "// Testing": "",
    "@testing-library/react-native": "^12.4.1",
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.7.0",
    "detox": "^20.14.8",

    "// Linting & Formatting": "",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-native": "^4.1.0",
    "prettier": "^3.1.0",

    "// Build Tools": "",
    "babel-plugin-module-resolver": "^5.0.0",
    "react-native-svg-transformer": "^1.1.0"
  }
}
```

---

### 4.2 Install Dependencies

```bash
# Install npm packages
npm install

# iOS: Install CocoaPods
cd ios
pod install
cd ..
```

---

## 5. Configuration Files

### 5.1 TypeScript Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ES2021"],
    "jsx": "react-native",
    "module": "ESNext",
    "moduleResolution": "node",

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    "baseUrl": ".",
    "paths": {
      "@features/*": ["src/features/*"],
      "@core/*": ["src/core/*"],
      "@shared/*": ["src/shared/*"],
      "@theme": ["src/theme"],
      "@contexts/*": ["src/contexts/*"],
      "@config/*": ["src/config/*"],
      "@assets/*": ["assets/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

---

### 5.2 Babel Configuration

**babel.config.js:**

```javascript
module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./src"],
        extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        alias: {
          "@features": "./src/features",
          "@core": "./src/core",
          "@shared": "./src/shared",
          "@theme": "./src/theme",
          "@contexts": "./src/contexts",
          "@config": "./src/config",
          "@assets": "./assets",
        },
      },
    ],
    "react-native-reanimated/plugin",
  ],
};
```

---

### 5.3 Metro Configuration

**metro.config.js:**

```javascript
const { getDefaultConfig } = require("metro-config");

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...sourceExts, "svg"],
    },
  };
})();
```

---

### 5.4 ESLint Configuration

**.eslintrc.js:**

```javascript
module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-native/all",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-native"],
  rules: {
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
```

---

### 5.5 Prettier Configuration

**.prettierrc.js:**

```javascript
module.exports = {
  arrowParens: "avoid",
  bracketSameLine: true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: "none",
  semi: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
};
```

---

## 6. Environment Configuration

### 6.1 Environment Variables

**.env:**

```bash
# API
API_BASE_URL=https://api.meslektas.com
WS_URL=wss://api.meslektas.com

# Firebase
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=meslektas.firebaseapp.com
FIREBASE_PROJECT_ID=meslektas
FIREBASE_STORAGE_BUCKET=meslektas.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:ios:abcd...

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Environment
ENVIRONMENT=development
```

**.env.staging:**

```bash
API_BASE_URL=https://staging-api.meslektas.com
WS_URL=wss://staging-api.meslektas.com
ENVIRONMENT=staging
```

**.env.production:**

```bash
API_BASE_URL=https://api.meslektas.com
WS_URL=wss://api.meslektas.com
ENVIRONMENT=production
```

---

### 6.2 Config File

**src/config/env.ts:**

```typescript
import Config from "react-native-config";

export const ENV = {
  API_BASE_URL: Config.API_BASE_URL || "http://localhost:8080",
  WS_URL: Config.WS_URL || "ws://localhost:8080",

  FIREBASE: {
    apiKey: Config.FIREBASE_API_KEY,
    authDomain: Config.FIREBASE_AUTH_DOMAIN,
    projectId: Config.FIREBASE_PROJECT_ID,
    storageBucket: Config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
    appId: Config.FIREBASE_APP_ID,
  },

  SENTRY_DSN: Config.SENTRY_DSN,
  ENVIRONMENT: Config.ENVIRONMENT || "development",

  isDevelopment: Config.ENVIRONMENT === "development",
  isStaging: Config.ENVIRONMENT === "staging",
  isProduction: Config.ENVIRONMENT === "production",
} as const;
```

---

## 7. iOS Configuration

### 7.1 Info.plist

**ios/MeslektasApp/Info.plist:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- Camera Permission -->
  <key>NSCameraUsageDescription</key>
  <string>Kimlik doğrulaması için kamera erişimi gereklidir.</string>

  <!-- Photo Library Permission -->
  <key>NSPhotoLibraryUsageDescription</key>
  <string>Profil fotoğrafı için galeri erişimi gereklidir.</string>

  <!-- Microphone Permission (for video recording) -->
  <key>NSMicrophoneUsageDescription</key>
  <string>Video kaydı için mikrofon erişimi gereklidir.</string>

  <!-- Face ID Permission -->
  <key>NSFaceIDUsageDescription</key>
  <string>Güvenli giriş için Face ID kullanılır.</string>

  <!-- App Transport Security -->
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
      <key>localhost</key>
      <dict>
        <key>NSExceptionAllowsInsecureHTTPLoads</key>
        <true/>
      </dict>
    </dict>
  </dict>

  <!-- Background Modes -->
  <key>UIBackgroundModes</key>
  <array>
    <string>remote-notification</string>
    <string>fetch</string>
  </array>
</dict>
</plist>
```

---

### 7.2 Podfile

**ios/Podfile:**

```ruby
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.0'
install! 'cocoapods', :deterministic_uuids => false

target 'MeslektasApp' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => false
  )

  # Firebase
  pod 'Firebase', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true

  # Permissions
  permissions_path = '../node_modules/react-native-permissions/ios'
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
  pod 'Permission-PhotoLibrary', :path => "#{permissions_path}/PhotoLibrary"
  pod 'Permission-Notifications', :path => "#{permissions_path}/Notifications"

  post_install do |installer|
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
  end
end
```

---

## 8. Android Configuration

### 8.1 AndroidManifest.xml

**android/app/src/main/AndroidManifest.xml:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

  <!-- Permissions -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.USE_BIOMETRIC" />
  <uses-permission android:name="android.permission.USE_FINGERPRINT" />

  <!-- Camera Features -->
  <uses-feature android:name="android.hardware.camera" android:required="false" />
  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

  <application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="false"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="false">

    <activity
      android:name=".MainActivity"
      android:label="@string/app_name"
      android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
      android:launchMode="singleTask"
      android:windowSoftInputMode="adjustResize"
      android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>

      <!-- Deep Linking -->
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="meslektas" />
      </intent-filter>
    </activity>

    <!-- Firebase Messaging -->
    <service
      android:name=".FCMService"
      android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>
  </application>
</manifest>
```

---

### 8.2 build.gradle (Project)

**android/build.gradle:**

```groovy
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 23
        compileSdkVersion = 33
        targetSdkVersion = 33

        kotlinVersion = "1.8.0"

        ndkVersion = "23.1.7779620"
    }

    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:7.4.2")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        classpath("com.google.gms:google-services:4.3.15")
    }
}
```

---

### 8.3 build.gradle (App)

**android/app/build.gradle:**

```groovy
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: "com.google.gms.google-services"

android {
    namespace "com.meslektas"
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.meslektas"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"

        multiDexEnabled true

        resValue "string", "build_config_package", "com.meslektas"
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])

    implementation "com.facebook.react:react-android"
    implementation "com.facebook.react:hermes-android"

    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-analytics'

    // Multidex
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

---

## 9. Firebase Setup

### 9.1 Firebase Configuration

**src/config/firebase.ts:**

```typescript
import { initializeApp } from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import analytics from "@react-native-firebase/analytics";
import { ENV } from "./env";

// Initialize Firebase
const firebaseConfig = ENV.FIREBASE;

export const initializeFirebase = async () => {
  await initializeApp(firebaseConfig);

  // Request notification permission
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);
  }

  // Get FCM token
  const fcmToken = await messaging().getToken();
  console.log("FCM Token:", fcmToken);

  return fcmToken;
};

export { messaging, analytics };
```

---

## 10. Run Scripts

### 10.1 Package.json Scripts

**package.json:**

```json
{
  "scripts": {
    "// Development": "",
    "start": "react-native start",
    "ios": "react-native run-ios",
    "android": "react-native run-android",

    "// Build": "",
    "ios:release": "react-native run-ios --configuration Release",
    "android:release": "cd android && ./gradlew assembleRelease",

    "// Testing": "",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",

    "// Linting": "",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json}\"",

    "// Type Checking": "",
    "typecheck": "tsc --noEmit",

    "// Cleaning": "",
    "clean": "rm -rf node_modules && rm -rf ios/Pods && npm install && cd ios && pod install",
    "clean:android": "cd android && ./gradlew clean",
    "clean:ios": "cd ios && xcodebuild clean"
  }
}
```

---

## 11. Development Workflow

### 11.1 First Time Setup

```bash
# 1. Clone repository
git clone https://github.com/meslektas/mobile-app.git
cd mobile-app

# 2. Install dependencies
npm install

# 3. Install iOS pods
cd ios
pod install
cd ..

# 4. Setup environment
cp .env.example .env
# Edit .env with your values

# 5. Run app
npm run ios
# or
npm run android
```

---

### 11.2 Daily Development

```bash
# Start Metro bundler
npm start

# Run on iOS simulator (separate terminal)
npm run ios

# Run on Android emulator (separate terminal)
npm run android

# Run tests
npm test

# Lint code
npm run lint
```

---

## 12. Troubleshooting

### 12.1 Common Issues

**Metro bundler cache issues:**

```bash
npm start -- --reset-cache
```

**iOS build fails:**

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

**Android build fails:**

```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Permission denied (gradlew):**

```bash
chmod +x android/gradlew
```

---

## 13. Summary

### Setup Checklist:

- ✅ Node.js 18.x, npm/yarn installed
- ✅ React Native CLI installed
- ✅ Xcode (iOS) / Android Studio setup
- ✅ Project initialized with TypeScript
- ✅ All dependencies installed
- ✅ TypeScript, Babel, Metro configured
- ✅ Environment variables configured
- ✅ iOS Info.plist permissions set
- ✅ Android manifest permissions set
- ✅ Firebase configured
- ✅ Scripts ready for development

**Result:** Production-ready React Native project setup complete.
