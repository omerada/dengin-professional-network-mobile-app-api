// src/features/verification/types/verification.types.ts
// Doğrulama tipi tanımlamaları
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md
// Oku: docs/09-AI-VERIFICATION-DESIGN.md

/**
 * Doğrulama durumları - Backend ile uyumlu
 * Backend: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "MANUAL_REVIEW"
 */
export type VerificationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'MANUAL_REVIEW';

/**
 * Doğrulama adımları
 */
export type VerificationStep =
  | 'intro'
  | 'document_front'
  | 'document_back'
  | 'selfie'
  | 'review'
  | 'uploading'
  | 'status';

/**
 * Belge türleri
 */
export type DocumentType = 'DIPLOMA' | 'CERTIFICATE' | 'LICENSE' | 'ID_CARD';

/**
 * Görüntü doğrulama sonucu
 */
export interface ImageValidationResult {
  isValid: boolean;
  brightness: number;
  sharpness: number;
  fileSize: number;
  resolution: {
    width: number;
    height: number;
  };
  errors: ImageValidationError[];
}

/**
 * Görüntü doğrulama hataları
 */
export type ImageValidationError =
  | 'TOO_DARK'
  | 'TOO_BRIGHT'
  | 'BLURRY'
  | 'TOO_SMALL'
  | 'TOO_LARGE'
  | 'WRONG_FORMAT'
  | 'NO_FACE_DETECTED'
  | 'MULTIPLE_FACES';

/**
 * Yakalanan görüntü verisi
 */
export interface CapturedImage {
  uri: string;
  path: string;
  width: number;
  height: number;
  type: 'front' | 'back' | 'selfie';
  capturedAt: string;
  fileSize?: number;
  base64?: string;
}

/**
 * Doğrulama verisi - Lokal state için
 */
export interface VerificationData {
  documentType: DocumentType;
  documentFront: CapturedImage | null;
  documentBack: CapturedImage | null;
  selfie: CapturedImage | null;
  profession?: string;
  professionId?: number;
}

/**
 * Doğrulama isteği - Backend API uyumlu
 * POST /api/verifications
 */
export interface SubmitVerificationRequest {
  professionId: number;
  documentUrl: string; // S3 URL of uploaded document
  selfieUrl: string;   // S3 URL of selfie with document
}

/**
 * @deprecated Use SubmitVerificationRequest
 */
export interface VerificationRequest {
  documentType: DocumentType;
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
  professionId: string;
}

/**
 * Doğrulama yanıtı - Backend API uyumlu
 * Response from POST /api/verifications and GET /api/verifications
 */
export interface VerificationResponse {
  id: number;
  status: VerificationStatus;
  profession: {
    id: number;
    name: string;
  };
  aiConfidenceScore?: number;
  rejectionReason?: string;
  attemptCount: number;
  maxAttempts: number; // Usually 3
  createdAt: string;
  updatedAt: string;
}

/**
 * Doğrulama uygunluk kontrolü yanıtı
 * GET /api/verifications/check/{professionId}
 */
export interface VerificationEligibilityResponse {
  eligible: boolean;
  reason?: string;
  remainingAttempts: number;
  cooldownEndsAt?: string; // If rejected recently
}

/**
 * AI Doğrulama sonucu - Internal
 */
export interface VerificationResult {
  ocrConfidence: number;
  faceMatchSimilarity: number;
  livenessConfidence: number;
  documentAuthenticity: number;
  dataMatchScore: number;
  totalScore: number;
  decision: VerificationStatus;
  extractedData?: ExtractedDocumentData;
  errors?: VerificationError[];
}

/**
 * Belgeden çıkarılan veri
 */
export interface ExtractedDocumentData {
  name?: string;
  surname?: string;
  profession?: string;
  institution?: string;
  issueDate?: string;
  expiryDate?: string;
}

/**
 * Doğrulama hatası
 */
export interface VerificationError {
  code: VerificationErrorCode;
  message: string;
  suggestions?: string[];
}

/**
 * Doğrulama hata kodları
 */
export type VerificationErrorCode =
  | 'LOW_QUALITY_IMAGE'
  | 'NO_FACE_DETECTED'
  | 'FACE_MISMATCH'
  | 'SPOOFING_DETECTED'
  | 'DATA_MISMATCH'
  | 'INVALID_DOCUMENT'
  | 'EXPIRED_DOCUMENT'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

/**
 * Yükleme ilerleme durumu
 */
export interface UploadProgress {
  documentFront: number;
  documentBack: number;
  selfie: number;
  total: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
}

/**
 * Kamera ayarları
 */
export interface CameraSettings {
  flash: 'on' | 'off' | 'auto';
  focus: 'auto' | 'manual';
  zoom: number;
  position: 'back' | 'front';
}

/**
 * Doğrulama store durumu
 */
export interface VerificationState {
  currentStep: VerificationStep;
  data: VerificationData;
  uploadProgress: UploadProgress;
  verificationResponse: VerificationResponse | null;
  isProcessing: boolean;
  error: VerificationError | null;
}

/**
 * Doğrulama store aksiyonları
 */
export interface VerificationActions {
  setStep: (step: VerificationStep) => void;
  setDocumentType: (type: DocumentType) => void;
  setProfessionId: (professionId: number) => void;
  setDocumentFront: (image: CapturedImage) => void;
  setDocumentBack: (image: CapturedImage) => void;
  setSelfie: (image: CapturedImage) => void;
  setUploadProgress: (progress: Partial<UploadProgress>) => void;
  setVerificationResponse: (response: VerificationResponse) => void;
  setError: (error: VerificationError | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  reset: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

/**
 * Doğrulama store tipi
 */
export type VerificationStore = VerificationState & VerificationActions;
