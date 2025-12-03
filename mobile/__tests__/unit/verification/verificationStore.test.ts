// __tests__/unit/verification/verificationStore.test.ts
// Verification store testleri

import { renderHook, act } from '@testing-library/react-hooks';
import { useVerificationStore } from '../../../src/features/verification/stores';
import { VerificationStep } from '../../../src/features/verification/types';

// Store'u sıfırla
beforeEach(() => {
  useVerificationStore.getState().reset();
});

describe('Verification Store', () => {
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useVerificationStore());

      expect(result.current.currentStep).toBe(VerificationStep.INTRO);
      expect(result.current.documentFront).toBeNull();
      expect(result.current.documentBack).toBeNull();
      expect(result.current.selfie).toBeNull();
      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadProgress).toBe(0);
      expect(result.current.verificationId).toBeNull();
      expect(result.current.status).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    it('should set current step', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setStep(VerificationStep.DOCUMENT_FRONT);
      });

      expect(result.current.currentStep).toBe(VerificationStep.DOCUMENT_FRONT);
    });

    it('should go to next step', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.goToNextStep();
      });

      expect(result.current.currentStep).toBe(VerificationStep.DOCUMENT_FRONT);

      act(() => {
        result.current.goToNextStep();
      });

      expect(result.current.currentStep).toBe(VerificationStep.DOCUMENT_BACK);
    });

    it('should go to previous step', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setStep(VerificationStep.SELFIE);
      });

      act(() => {
        result.current.goToPreviousStep();
      });

      expect(result.current.currentStep).toBe(VerificationStep.DOCUMENT_BACK);
    });

    it('should not go below INTRO step', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.goToPreviousStep();
      });

      expect(result.current.currentStep).toBe(VerificationStep.INTRO);
    });
  });

  describe('Image Capture', () => {
    const mockImage = {
      uri: 'file:///mock/image.jpg',
      width: 1920,
      height: 1080,
      fileSize: 1024000,
    };

    it('should set document front image', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setDocumentFront(mockImage);
      });

      expect(result.current.documentFront).toEqual(mockImage);
    });

    it('should set document back image', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setDocumentBack(mockImage);
      });

      expect(result.current.documentBack).toEqual(mockImage);
    });

    it('should set selfie image', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setSelfie(mockImage);
      });

      expect(result.current.selfie).toEqual(mockImage);
    });

    it('should check if all images are captured', () => {
      const { result } = renderHook(() => useVerificationStore());

      expect(result.current.hasAllImages()).toBe(false);

      act(() => {
        result.current.setDocumentFront(mockImage);
        result.current.setDocumentBack(mockImage);
        result.current.setSelfie(mockImage);
      });

      expect(result.current.hasAllImages()).toBe(true);
    });
  });

  describe('Upload State', () => {
    it('should set uploading state', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setIsUploading(true);
      });

      expect(result.current.isUploading).toBe(true);
    });

    it('should set upload progress', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setUploadProgress(50);
      });

      expect(result.current.uploadProgress).toBe(50);
    });

    it('should set verification ID', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setVerificationId('ver_123456');
      });

      expect(result.current.verificationId).toBe('ver_123456');
    });

    it('should set verification status', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setStatus('PENDING_REVIEW');
      });

      expect(result.current.status).toBe('PENDING_REVIEW');
    });

    it('should set error', () => {
      const { result } = renderHook(() => useVerificationStore());

      act(() => {
        result.current.setError('Upload failed');
      });

      expect(result.current.error).toBe('Upload failed');
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useVerificationStore());

      const mockImage = {
        uri: 'file:///mock/image.jpg',
        width: 1920,
        height: 1080,
        fileSize: 1024000,
      };

      act(() => {
        result.current.setStep(VerificationStep.SELFIE);
        result.current.setDocumentFront(mockImage);
        result.current.setDocumentBack(mockImage);
        result.current.setSelfie(mockImage);
        result.current.setIsUploading(true);
        result.current.setUploadProgress(75);
        result.current.setError('Some error');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(VerificationStep.INTRO);
      expect(result.current.documentFront).toBeNull();
      expect(result.current.documentBack).toBeNull();
      expect(result.current.selfie).toBeNull();
      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadProgress).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });
});
