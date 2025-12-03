// src/features/verification/index.ts
// Verification feature barrel export

// Types
export * from './types';

// Store
export { useVerificationStore } from './stores';

// Services
export { cameraService, imageProcessor, uploadService } from './services';

// Hooks
export {
  useVerificationStatus,
  useIsVerified,
  useUploadVerification,
  useCameraPermission,
  useImageValidation,
  VERIFICATION_STATUS_KEY,
} from './hooks';

// Components
export {
  DocumentGuide,
  SelfieGuide,
  CaptureButton,
  CameraControls,
  StepIndicator,
  ImagePreview,
  UploadProgress,
} from './components';

// Screens
export {
  VerificationIntroScreen,
  DocumentCaptureScreen,
  SelfieCaptureScreen,
  VerificationReviewScreen,
  UploadStatusScreen,
} from './screens';
