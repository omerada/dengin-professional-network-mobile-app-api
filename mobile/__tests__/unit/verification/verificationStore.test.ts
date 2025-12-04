// __tests__/unit/verification/verificationStore.test.ts
// Verification store testleri
// Zustand store'larını test etmek için doğrudan store erişimi kullanıyoruz

// Disable auto-mock for this file - we want to test the real store
jest.unmock('zustand/middleware/immer');

import { act } from '@testing-library/react-native';

describe('Verification Store', () => {
  // Use dynamic import inside tests to get fresh module
  const getStore = () => {
    // Clear require cache for a fresh store
    jest.resetModules();
    return require('../../../src/features/verification/stores').useVerificationStore;
  };

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = getStore();
      const state = store.getState();

      expect(state.currentStep).toBe('intro');
      expect(state.data.documentFront).toBeNull();
      expect(state.data.documentBack).toBeNull();
      expect(state.data.selfie).toBeNull();
      expect(state.isProcessing).toBe(false);
      expect(state.uploadProgress.total).toBe(0);
      expect(state.verificationResponse).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    it('should set current step', () => {
      const store = getStore();

      act(() => {
        store.getState().setStep('document_front');
      });

      expect(store.getState().currentStep).toBe('document_front');
    });

    it('should go to next step', () => {
      const store = getStore();

      act(() => {
        store.getState().goToNextStep();
      });

      expect(store.getState().currentStep).toBe('document_front');

      act(() => {
        store.getState().goToNextStep();
      });

      expect(store.getState().currentStep).toBe('document_back');
    });

    it('should go to previous step', () => {
      const store = getStore();

      act(() => {
        store.getState().setStep('selfie');
      });

      act(() => {
        store.getState().goToPreviousStep();
      });

      expect(store.getState().currentStep).toBe('document_back');
    });

    it('should not go below intro step', () => {
      const store = getStore();

      act(() => {
        store.getState().goToPreviousStep();
      });

      expect(store.getState().currentStep).toBe('intro');
    });
  });

  describe('Image Capture', () => {
    const mockImage = {
      uri: 'file:///mock/image.jpg',
      path: '/mock/image.jpg',
      width: 1920,
      height: 1080,
      type: 'front' as const,
      capturedAt: new Date().toISOString(),
      fileSize: 1024000,
    };

    it('should set document front image', () => {
      const store = getStore();

      act(() => {
        store.getState().setDocumentFront(mockImage);
      });

      expect(store.getState().data.documentFront).toEqual(mockImage);
    });

    it('should set document back image', () => {
      const store = getStore();
      const backImage = { ...mockImage, type: 'back' as const };

      act(() => {
        store.getState().setDocumentBack(backImage);
      });

      expect(store.getState().data.documentBack).toEqual(backImage);
    });

    it('should set selfie image', () => {
      const store = getStore();
      const selfieImage = { ...mockImage, type: 'selfie' as const };

      act(() => {
        store.getState().setSelfie(selfieImage);
      });

      expect(store.getState().data.selfie).toEqual(selfieImage);
    });

    it('should check if all images are captured', () => {
      const store = getStore();
      const backImage = { ...mockImage, type: 'back' as const };
      const selfieImage = { ...mockImage, type: 'selfie' as const };

      const stateBefore = store.getState();
      expect(
        stateBefore.data.documentFront === null ||
          stateBefore.data.documentBack === null ||
          stateBefore.data.selfie === null,
      ).toBe(true);

      act(() => {
        store.getState().setDocumentFront(mockImage);
        store.getState().setDocumentBack(backImage);
        store.getState().setSelfie(selfieImage);
      });

      const stateAfter = store.getState();
      expect(stateAfter.data.documentFront).not.toBeNull();
      expect(stateAfter.data.documentBack).not.toBeNull();
      expect(stateAfter.data.selfie).not.toBeNull();
    });
  });

  describe('Upload State', () => {
    it('should set processing state', () => {
      const store = getStore();

      act(() => {
        store.getState().setProcessing(true);
      });

      expect(store.getState().isProcessing).toBe(true);
    });

    it('should set upload progress', () => {
      const store = getStore();
      const progress = {
        documentFront: 50,
        documentBack: 30,
        selfie: 0,
        status: 'uploading' as const,
      };

      act(() => {
        store.getState().setUploadProgress(progress);
      });

      const uploadProgress = store.getState().uploadProgress;
      expect(uploadProgress.documentFront).toBe(50);
      expect(uploadProgress.documentBack).toBe(30);
      expect(uploadProgress.selfie).toBe(0);
      expect(uploadProgress.status).toBe('uploading');
      // Total is auto-calculated: (50 + 30 + 0) / 3 = 26.67 -> 27
      expect(uploadProgress.total).toBe(27);
    });

    it('should set verification response', () => {
      const store = getStore();
      const response = {
        id: '123',
        status: 'APPROVED' as const,
        message: 'Verification successful',
        confidenceScore: 0.95,
      };

      act(() => {
        store.getState().setVerificationResponse(response);
      });

      expect(store.getState().verificationResponse).toEqual(response);
    });

    it('should set error', () => {
      const store = getStore();
      const error = {
        code: 'INVALID_DOCUMENT',
        message: 'Document is not valid',
      };

      act(() => {
        store.getState().setError(error);
      });

      expect(store.getState().error).toEqual(error);
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      const store = getStore();
      const mockImage = {
        uri: 'file:///mock/image.jpg',
        path: '/mock/image.jpg',
        width: 1920,
        height: 1080,
        type: 'front' as const,
        capturedAt: new Date().toISOString(),
        fileSize: 1024000,
      };

      // Modify state first
      act(() => {
        store.getState().setStep('selfie');
        store.getState().setDocumentFront(mockImage);
        store.getState().setProcessing(true);
      });

      // Reset
      act(() => {
        store.getState().reset();
      });

      const state = store.getState();
      expect(state.currentStep).toBe('intro');
      expect(state.data.documentFront).toBeNull();
      expect(state.isProcessing).toBe(false);
    });
  });
});
