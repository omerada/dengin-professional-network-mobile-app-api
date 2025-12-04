// src/features/verification/stores/verificationStore.ts
// Zustand store for verification state management
// Backend API Reference: mobile-development-guide/core/14-BACKEND-API-REFERENCE.md

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  VerificationStore,
  VerificationState,
  VerificationStep,
  DocumentType,
  CapturedImage,
  UploadProgress,
  VerificationResponse,
  VerificationError,
} from '../types';

/**
 * Doğrulama adım sırası
 */
const STEP_ORDER: VerificationStep[] = [
  'intro',
  'document_front',
  'document_back',
  'selfie',
  'review',
  'uploading',
  'status',
];

/**
 * Başlangıç durumu
 */
const initialState: VerificationState = {
  currentStep: 'intro',
  data: {
    documentType: 'DIPLOMA',
    documentFront: null,
    documentBack: null,
    selfie: null,
    profession: undefined,
    professionId: undefined,
  },
  uploadProgress: {
    documentFront: 0,
    documentBack: 0,
    selfie: 0,
    total: 0,
    status: 'idle',
  },
  verificationResponse: null,
  isProcessing: false,
  error: null,
};

/**
 * Doğrulama store'u
 * Verification flow state management
 */
export const useVerificationStore = create<VerificationStore>()(
  immer((set, get) => ({
    ...initialState,

    /**
     * Adımı ayarla
     */
    setStep: (step: VerificationStep) => {
      set((state) => {
        state.currentStep = step;
        state.error = null;
      });
    },

    /**
     * Belge türünü ayarla
     */
    setDocumentType: (type: DocumentType) => {
      set((state) => {
        state.data.documentType = type;
      });
    },

    /**
     * Meslek ID'sini ayarla
     */
    setProfessionId: (professionId: number) => {
      set((state) => {
        state.data.professionId = professionId;
      });
    },

    /**
     * Belge ön yüzünü ayarla
     */
    setDocumentFront: (image: CapturedImage) => {
      set((state) => {
        state.data.documentFront = image;
      });
    },

    /**
     * Belge arka yüzünü ayarla
     */
    setDocumentBack: (image: CapturedImage) => {
      set((state) => {
        state.data.documentBack = image;
      });
    },

    /**
     * Selfie'yi ayarla
     */
    setSelfie: (image: CapturedImage) => {
      set((state) => {
        state.data.selfie = image;
      });
    },

    /**
     * Yükleme ilerleme durumunu güncelle
     */
    setUploadProgress: (progress: Partial<UploadProgress>) => {
      set((state) => {
        state.uploadProgress = {
          ...state.uploadProgress,
          ...progress,
        };

        // Toplam ilerlemeyi hesapla
        const { documentFront, documentBack, selfie } = state.uploadProgress;
        state.uploadProgress.total = Math.round(
          (documentFront + documentBack + selfie) / 3
        );
      });
    },

    /**
     * Doğrulama yanıtını ayarla
     */
    setVerificationResponse: (response: VerificationResponse) => {
      set((state) => {
        state.verificationResponse = response;
        state.isProcessing = false;
      });
    },

    /**
     * Hatayı ayarla
     */
    setError: (error: VerificationError | null) => {
      set((state) => {
        state.error = error;
        state.isProcessing = false;
      });
    },

    /**
     * İşlem durumunu ayarla
     */
    setProcessing: (isProcessing: boolean) => {
      set((state) => {
        state.isProcessing = isProcessing;
      });
    },

    /**
     * Store'u sıfırla
     */
    reset: () => {
      set(initialState);
    },

    /**
     * Sonraki adıma geç
     */
    goToNextStep: () => {
      const { currentStep } = get();
      const currentIndex = STEP_ORDER.indexOf(currentStep);

      if (currentIndex < STEP_ORDER.length - 1) {
        set((state) => {
          state.currentStep = STEP_ORDER[currentIndex + 1];
          state.error = null;
        });
      }
    },

    /**
     * Önceki adıma geç
     */
    goToPreviousStep: () => {
      const { currentStep } = get();
      const currentIndex = STEP_ORDER.indexOf(currentStep);

      if (currentIndex > 0) {
        set((state) => {
          state.currentStep = STEP_ORDER[currentIndex - 1];
          state.error = null;
        });
      }
    },
  }))
);

/**
 * Mevcut adımı getir
 */
export const useCurrentStep = () =>
  useVerificationStore((state) => state.currentStep);

/**
 * Doğrulama verisini getir
 */
export const useVerificationData = () =>
  useVerificationStore((state) => state.data);

/**
 * Yükleme ilerlemesini getir
 */
export const useUploadProgress = () =>
  useVerificationStore((state) => state.uploadProgress);

/**
 * İşlem durumunu getir
 */
export const useIsProcessing = () =>
  useVerificationStore((state) => state.isProcessing);

/**
 * Hatayı getir
 */
export const useVerificationError = () =>
  useVerificationStore((state) => state.error);
