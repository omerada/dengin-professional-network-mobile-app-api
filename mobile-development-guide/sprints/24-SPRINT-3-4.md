# Sprint 3-4: Identity Verification

**Duration:** 2 weeks
**Focus:** Document & selfie capture, image processing, verification upload
**Complexity:** ⭐⭐⭐⭐ (High)

---

## Sprint Goals

- ✅ Camera integration (react-native-vision-camera)
- ✅ Document capture with guide overlay
- ✅ Selfie capture
- ✅ Image validation & compression
- ✅ Multi-step upload with progress

---

## Week 1: Camera & Capture

### Day 1-2: Camera Setup

**Tasks:**

- Install react-native-vision-camera
- Configure iOS/Android permissions
- Create camera service
- Implement camera screen

**Dependencies:**

```bash
npm install react-native-vision-camera
npm install react-native-svg  # For guide overlay

# iOS permissions (Info.plist)
<key>NSCameraUsageDescription</key>
<string>Kimlik doğrulama için kamera erişimi gerekli</string>

# Android permissions (AndroidManifest.xml)
<uses-permission android:name="android.permission.CAMERA" />
```

**Files:**

```
src/features/verification/
├── services/
│   └── cameraService.ts
├── components/
│   ├── CameraView.tsx
│   └── DocumentGuide.tsx
└── screens/
    └── DocumentCaptureScreen.tsx
```

**Validation:**

- [ ] Camera permissions work
- [ ] Camera preview displays
- [ ] Photo capture works
- [ ] Guide overlay renders

---

### Day 3-4: Document Capture

**Tasks:**

- Create document guide overlay (SVG)
- Implement capture button
- Add flash/focus controls
- Save captured image

**Code:**

```typescript
// DocumentGuide.tsx
export const DocumentGuide: React.FC = () => {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <Mask id="guide-mask">
          <Rect width="100%" height="100%" fill="white" />
          <RoundedRect
            x="10%"
            y="25%"
            width="80%"
            height="50%"
            rx="12"
            fill="black"
          />
        </Mask>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.5)"
        mask="url(#guide-mask)"
      />
    </Svg>
  );
};
```

**Validation:**

- [ ] Guide overlay aligns correctly
- [ ] Capture button responsive
- [ ] Flash toggle works
- [ ] Image saved to temp storage

---

### Day 5: Selfie Capture

**Tasks:**

- Create selfie capture screen
- Add face detection guide
- Implement front camera switch
- Handle image rotation

**Files:**

```
src/features/verification/screens/
└── SelfieCaptureScreen.tsx
```

**Validation:**

- [ ] Front camera activates
- [ ] Face guide displays
- [ ] Capture works correctly
- [ ] Image orientation correct

---

## Week 2: Processing & Upload

### Day 1-2: Image Processing

**Tasks:**

- Install react-native-image-resizer
- Implement image compression
- Add image validation (brightness, sharpness, size)
- Create image cropping utility

**Code:**

```typescript
// imageProcessor.ts
export const imageProcessor = {
  async compress(uri: string) {
    return await ImageResizer.createResizedImage(
      uri,
      1920,
      1080,
      "JPEG",
      80,
      0,
      undefined,
      false,
      { mode: "contain" }
    );
  },

  async validate(uri: string) {
    // Check brightness, sharpness, file size
    const validation = {
      brightness: await checkBrightness(uri),
      sharpness: await checkSharpness(uri),
      fileSize: await getFileSize(uri),
    };

    return validation;
  },
};
```

**Validation:**

- [ ] Compression reduces file size
- [ ] Image quality acceptable
- [ ] Validation detects poor images
- [ ] Error messages clear

---

### Day 3-4: Upload System

**Tasks:**

- Create upload service with FormData
- Add progress tracking
- Implement retry logic
- Handle network errors

**Code:**

```typescript
// uploadService.ts
export const uploadService = {
  async uploadVerification(data: VerificationData) {
    const formData = new FormData();
    formData.append("documentFront", {
      uri: data.documentFront,
      type: "image/jpeg",
      name: "document_front.jpg",
    });
    formData.append("documentBack", {
      uri: data.documentBack,
      type: "image/jpeg",
      name: "document_back.jpg",
    });
    formData.append("selfie", {
      uri: data.selfie,
      type: "image/jpeg",
      name: "selfie.jpg",
    });

    return await apiClient.post("/verification/upload", formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
      },
    });
  },
};
```

**Validation:**

- [ ] Upload progress updates
- [ ] Retry on failure works
- [ ] Network errors handled
- [ ] Success response correct

---

### Day 5: Multi-Step Flow

**Tasks:**

- Create verification store (Zustand)
- Implement step navigation
- Add review screen
- Show upload status

**Files:**

```
src/features/verification/
├── stores/
│   └── verificationStore.ts
├── screens/
│   ├── VerificationIntroScreen.tsx
│   ├── ReviewScreen.tsx
│   └── UploadStatusScreen.tsx
└── components/
    └── StepIndicator.tsx
```

**Flow:**

```
Intro → Document Front → Document Back → Selfie → Review → Upload → Status
```

**Validation:**

- [ ] Step navigation works
- [ ] Back button preserves state
- [ ] Review shows all images
- [ ] Status polling works

---

## Testing Checklist

**Unit Tests:**

- [ ] imageProcessor.compress()
- [ ] imageProcessor.validate()
- [ ] uploadService.uploadVerification()
- [ ] uploadService.retry()

**Component Tests:**

- [ ] DocumentGuide renders
- [ ] CameraView permissions
- [ ] ReviewScreen displays images
- [ ] UploadStatusScreen updates

**E2E Tests:**

- [ ] Full verification flow
- [ ] Capture → Review → Upload
- [ ] Retry on upload failure
- [ ] Status polling works

---

## Performance Checklist

- [ ] Image compression reduces size by >70%
- [ ] Upload progress updates smoothly
- [ ] Camera preview 30+ FPS
- [ ] Memory usage <200MB during capture

---

## Sprint Review

**Demo:**

1. Open verification flow
2. Capture document front/back
3. Capture selfie
4. Review images
5. Upload with progress
6. Show verification status

**Metrics:**

- Lines of code: ~3,500
- Files created: ~20
- Test coverage: >75%
- Average upload time: <15s

---

## Sprint Retrospective

**What went well:**

- Camera integration smooth
- Image quality good
- Upload progress clear

**What to improve:**

- Add better lighting guidance
- Improve validation feedback
- Optimize image processing

**Action items:**

- Add document type detection (ID vs Passport)
- Implement face detection for selfie
- Add offline queue for uploads

---

## Next Sprint Preview (Sprint 5-6)

Focus: Social feed & posts

- Infinite scroll feed
- Post creation with images
- Like/comment functionality
- Pull to refresh
