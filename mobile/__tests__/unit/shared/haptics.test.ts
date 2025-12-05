// __tests__/unit/shared/haptics.test.ts
// Unit tests for haptic feedback utilities
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import {
  haptic,
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
  hapticError,
  withHaptic,
  useHaptics,
} from '@shared/utils/haptics';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('Haptics Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('haptic', () => {
    it('should trigger light haptic by default', () => {
      haptic();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactLight',
        expect.any(Object),
      );
    });

    it('should trigger specified haptic type', () => {
      haptic('heavy');

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactHeavy',
        expect.any(Object),
      );
    });

    it('should trigger selection haptic', () => {
      haptic('selection');

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'selection',
        expect.any(Object),
      );
    });

    it('should handle errors gracefully', () => {
      (ReactNativeHapticFeedback.trigger as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Haptic not available');
      });

      // Should not throw
      expect(() => haptic()).not.toThrow();
    });
  });

  describe('hapticLight', () => {
    it('should trigger light impact haptic', () => {
      hapticLight();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactLight',
        expect.any(Object),
      );
    });
  });

  describe('hapticMedium', () => {
    it('should trigger medium impact haptic', () => {
      hapticMedium();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactMedium',
        expect.any(Object),
      );
    });
  });

  describe('hapticHeavy', () => {
    it('should trigger heavy impact haptic', () => {
      hapticHeavy();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactHeavy',
        expect.any(Object),
      );
    });
  });

  describe('hapticSelection', () => {
    it('should trigger selection haptic', () => {
      hapticSelection();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'selection',
        expect.any(Object),
      );
    });
  });

  describe('hapticSuccess', () => {
    it('should trigger success notification haptic', () => {
      hapticSuccess();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationSuccess',
        expect.any(Object),
      );
    });
  });

  describe('hapticWarning', () => {
    it('should trigger warning notification haptic', () => {
      hapticWarning();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationWarning',
        expect.any(Object),
      );
    });
  });

  describe('hapticError', () => {
    it('should trigger error notification haptic', () => {
      hapticError();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationError',
        expect.any(Object),
      );
    });
  });

  describe('withHaptic', () => {
    it('should wrap handler with haptic feedback', () => {
      const handler = jest.fn().mockReturnValue('result');
      const wrappedHandler = withHaptic(handler);

      const result = wrappedHandler('arg1', 'arg2');

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactLight',
        expect.any(Object),
      );
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('result');
    });

    it('should use specified haptic type', () => {
      const handler = jest.fn();
      const wrappedHandler = withHaptic(handler, 'success');

      wrappedHandler();

      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationSuccess',
        expect.any(Object),
      );
    });

    it('should call handler even if haptic fails', () => {
      (ReactNativeHapticFeedback.trigger as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Haptic failed');
      });

      const handler = jest.fn();
      const wrappedHandler = withHaptic(handler);

      wrappedHandler();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('useHaptics', () => {
    it('should return all haptic functions', () => {
      const haptics = useHaptics();

      expect(haptics.trigger).toBeDefined();
      expect(haptics.light).toBeDefined();
      expect(haptics.medium).toBeDefined();
      expect(haptics.heavy).toBeDefined();
      expect(haptics.selection).toBeDefined();
      expect(haptics.success).toBeDefined();
      expect(haptics.warning).toBeDefined();
      expect(haptics.error).toBeDefined();
      expect(haptics.withHaptic).toBeDefined();
    });

    it('should return working functions', () => {
      const haptics = useHaptics();

      haptics.light();
      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'impactLight',
        expect.any(Object),
      );

      jest.clearAllMocks();

      haptics.success();
      expect(ReactNativeHapticFeedback.trigger).toHaveBeenCalledWith(
        'notificationSuccess',
        expect.any(Object),
      );
    });
  });
});
