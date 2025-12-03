// src/features/verification/hooks/useImageValidation.ts
// Görüntü doğrulama hook'u
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import { useState, useCallback } from 'react';
import { imageProcessor } from '../services';
import type { ImageValidationResult } from '../types';

/**
 * Görüntü doğrulama hook sonucu
 */
interface ImageValidationHookResult {
  isValidating: boolean;
  validationResult: ImageValidationResult | null;
  error: string | null;
  validateImage: (uri: string) => Promise<ImageValidationResult>;
  resetValidation: () => void;
}

/**
 * Görüntü doğrulama hook'u
 */
export function useImageValidation(): ImageValidationHookResult {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  /**
   * Görüntüyü doğrula
   */
  const validateImage = useCallback(
    async (uri: string): Promise<ImageValidationResult> => {
      setIsValidating(true);
      setError(null);

      try {
        const result = await imageProcessor.validate(uri);
        setValidationResult(result);

        if (!result.isValid && result.errors.length > 0) {
          const errorMessage = result.errors
            .map((err) => imageProcessor.getErrorMessage(err))
            .join('\n');
          setError(errorMessage);
        }

        return result;
      } catch (err) {
        const errorMessage = 'Görüntü doğrulanamadı';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  /**
   * Doğrulamayı sıfırla
   */
  const resetValidation = useCallback(() => {
    setValidationResult(null);
    setError(null);
  }, []);

  return {
    isValidating,
    validationResult,
    error,
    validateImage,
    resetValidation,
  };
}

export default useImageValidation;
