// __tests__/unit/utils/errorHandling.test.ts
// Unit tests for error handling utilities
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

// Mock Analytics service before importing errorHandling
jest.mock('@shared/services/analytics', () => ({
  Analytics: {
    logError: jest.fn(),
    logEvent: jest.fn(),
  },
}));

import {
  AppError,
  ErrorType,
  parseApiError,
  tryCatch,
  retryWithBackoff,
} from '@shared/utils/errorHandling';

describe('Error Handling Utilities', () => {
  describe('AppError', () => {
    it('should create error with type and message', () => {
      const error = new AppError('Test error', ErrorType.NETWORK);

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.name).toBe('AppError');
      expect(error.isRecoverable).toBe(true);
    });

    it('should create error with options', () => {
      const error = new AppError('Test error', ErrorType.AUTH, {
        code: 'AUTH_FAILED',
        context: { userId: '123' },
        isRecoverable: false,
      });

      expect(error.code).toBe('AUTH_FAILED');
      expect(error.context).toEqual({ userId: '123' });
      expect(error.isRecoverable).toBe(false);
    });
  });

  describe('parseApiError', () => {
    it('should parse network error', () => {
      const error = { message: 'Network Error' };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.NETWORK);
      expect(appError.isRecoverable).toBe(true);
    });

    it('should parse timeout error', () => {
      // Error needs response property to bypass network error check
      const error = { code: 'ECONNABORTED', response: {} };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.TIMEOUT);
      expect(appError.isRecoverable).toBe(true);
    });

    it('should parse 401 error', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.AUTH);
      expect(appError.code).toBe('SESSION_EXPIRED');
      expect(appError.isRecoverable).toBe(false);
    });

    it('should parse 403 error', () => {
      const error = {
        response: { status: 403 },
      };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.PERMISSION);
      expect(appError.code).toBe('FORBIDDEN');
    });

    it('should parse 404 error', () => {
      const error = {
        response: { status: 404, data: { message: 'Not Found' } },
      };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.SERVER);
      expect(appError.code).toBe('NOT_FOUND');
    });

    it('should parse 422 validation error', () => {
      const error = {
        response: {
          status: 422,
          data: { message: 'Validation failed', errors: { email: 'Invalid' } },
        },
      };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.VALIDATION);
      expect(appError.context).toEqual({ email: 'Invalid' });
    });

    it('should parse 429 rate limit error', () => {
      const error = {
        response: { status: 429 },
      };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.SERVER);
      expect(appError.code).toBe('RATE_LIMITED');
      expect(appError.isRecoverable).toBe(true);
    });

    it('should parse 5xx server errors', () => {
      const statuses = [500, 502, 503, 504];

      statuses.forEach(status => {
        const error = {
          response: { status },
        };
        const appError = parseApiError(error);

        expect(appError.type).toBe(ErrorType.SERVER);
        expect(appError.code).toBe('SERVER_ERROR');
        expect(appError.isRecoverable).toBe(true);
      });
    });

    it('should handle unknown errors', () => {
      const error = {
        response: { status: 418, data: { message: 'Teapot' } },
      };
      const appError = parseApiError(error);

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.message).toBe('Teapot');
    });
  });

  describe('tryCatch', () => {
    it('should return result on success', async () => {
      const [result, error] = await tryCatch(async () => 'success');

      expect(result).toBe('success');
      expect(error).toBeNull();
    });

    it('should return error on failure', async () => {
      const [result, error] = await tryCatch(async () => {
        throw { message: 'Network Error' };
      });

      expect(result).toBeNull();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('retryWithBackoff', () => {
    it('should return immediately on success', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      const result = await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 10,
        onRetry,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    }, 15000);

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));

      await expect(
        retryWithBackoff(fn, {
          maxRetries: 2,
          initialDelay: 10,
        }),
      ).rejects.toThrow('always fail');

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    }, 15000);
  });
});
