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
 * Doğrulama isteği - Backend SubmitVerificationRequest ile %100 uyumlu
 * POST /api/verifications
 *
 * Backend beklentileri:
 * - professionId: Meslek ID'si (zorunlu)
 * - documentS3Key: S3'e yüklenmiş belge dosyasının key'i (URL değil!)
 * - documentFileName: Belge dosya adı
 * - documentContentType: MIME type (image/jpeg, image/png, application/pdf)
 * - documentFileSize: Dosya boyutu (bytes)
 * - selfieS3Key: S3'e yüklenmiş selfie dosyasının key'i
 * - selfieFileName: Selfie dosya adı
 * - selfieContentType: MIME type
 * - selfieFileSize: Dosya boyutu (bytes)
 */
export interface SubmitVerificationRequest {
  professionId: number;
  // Document metadata (already uploaded to S3)
  documentS3Key: string;
  documentFileName: string;
  documentContentType: string;
  documentFileSize: number;
  // Selfie metadata (already uploaded to S3)
  selfieS3Key: string;
  selfieFileName: string;
  selfieContentType: string;
  selfieFileSize: number;
}

/**
 * @deprecated Use SubmitVerificationRequest - Bu eski format artık kullanılmıyor
 * S3 URL'leri yerine S3 key'leri ve metadata kullanılmalı
 */
export interface LegacySubmitVerificationRequest {
  professionId: number;
  documentUrl: string;
  selfieUrl: string;
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
 * Doğrulama yanıtı - Backend VerificationResponse ile %100 uyumlu
 * Response from POST /api/verifications and GET /api/verifications
 *
 * NOT: Backend farklı alan isimleri kullanıyor, bu interface backend'e göre düzenlendi
 */
export interface VerificationResponse {
  /** Backend: id (Long) */
  id: number;
  /** Backend: verificationId (UUID) - Opsiyonel, bazı endpoint'lerde döner */
  verificationId?: string;
  /** Backend: userId (Long) - Doğrulama isteğini yapan kullanıcı */
  userId?: number;
  /** Backend: professionId (Long) - Sadece ID döner, nested object değil */
  professionId: number;
  /** Backend: status (VerificationStatus enum) */
  status: VerificationStatus;
  /** Backend: documentS3Key - S3 key for document */
  documentS3Key?: string;
  /** Backend: selfieS3Key - S3 key for selfie */
  selfieS3Key?: string;
  /** Backend: attemptNumber (Integer) - NOT: attemptCount değil! */
  attemptNumber: number;
  /** Backend: submittedAt (Instant) - NOT: createdAt değil! */
  submittedAt: string;
  /** Backend: processedAt (Instant) - İşlenme zamanı */
  processedAt?: string;
  /** Backend: expiresAt (Instant) - Son geçerlilik tarihi */
  expiresAt?: string;
  /** Backend: aiConfidence (Double) - AI güven skoru */
  aiConfidence?: number;
  /** Backend: faceSimilarity (Double) - Yüz benzerlik skoru */
  faceSimilarity?: number;
  /** Backend: manualReviewNotes (String) - Manuel inceleme notları */
  manualReviewNotes?: string;
}

/**
 * Mobile-friendly Verification Response
 * Backend response'u client için daha kullanışlı formata dönüştürür
 */
export interface VerificationDisplayResponse {
  id: number;
  status: VerificationStatus;
  profession: {
    id: number;
    name: string;
  };
  aiConfidenceScore?: number;
  rejectionReason?: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Backend response'u display response'a dönüştürme helper'ı
 */
export function mapToDisplayResponse(
  response: VerificationResponse,
  professionName: string,
  maxAttempts: number = 3,
): VerificationDisplayResponse {
  return {
    id: response.id,
    status: response.status,
    profession: {
      id: response.professionId,
      name: professionName,
    },
    aiConfidenceScore: response.aiConfidence,
    rejectionReason: response.manualReviewNotes,
    attemptCount: response.attemptNumber,
    maxAttempts,
    createdAt: response.submittedAt,
    updatedAt: response.processedAt,
  };
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
 * Doğrulama geçmişi yanıtı - Backend VerificationAttemptResponse ile %100 uyumlu
 * GET /api/verifications/history endpoint'i için
 *
 * NOT: Bu tip VerificationResponse'dan farklı! History endpoint'i daha detaylı bilgi döner.
 */
export interface VerificationAttemptResponse {
  /** Backend: id (Long) */
  id: number;
  /** Backend: verificationId (UUID) */
  verificationId: string;
  /** Backend: professionId (Long) */
  professionId: number;
  /** Backend: professionName (String) - Joined from profession table */
  professionName: string;
  /** Backend: status (VerificationStatus enum) */
  status: VerificationStatus;
  /** Backend: attemptNumber (Integer) */
  attemptNumber: number;
  /** Backend: submittedAt (Instant) */
  submittedAt: string;
  /** Backend: processedAt (Instant) */
  processedAt?: string;
  /** Backend: aiConfidence (Double) */
  aiConfidence?: number;
  /** Backend: faceSimilarity (Double) */
  faceSimilarity?: number;
  /** Backend: reviewNotes (String) */
  reviewNotes?: string;
  /** Backend: isApproved (boolean) - Helper flag */
  isApproved: boolean;
  /** Backend: isRejected (boolean) - Helper flag */
  isRejected: boolean;
  /** Backend: isPending (boolean) - Helper flag */
  isPending: boolean;
  /** Backend: daysSinceSubmission (long) - Calculated field */
  daysSinceSubmission?: number;
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
