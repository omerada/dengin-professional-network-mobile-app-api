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
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('Haptics Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('haptic', () => {
    it('should trigger light haptic by default', () => {
      haptic();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should trigger specified haptic type', () => {
      haptic('heavy');

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('should trigger selection haptic', () => {
      haptic('selection');

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      (Haptics.impactAsync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Haptic not available');
      });

      // Should not throw
      expect(() => haptic()).not.toThrow();
    });
  });

  describe('hapticLight', () => {
    it('should trigger light impact haptic', () => {
      hapticLight();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });
  });

  describe('hapticMedium', () => {
    it('should trigger medium impact haptic', () => {
      hapticMedium();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });
  });

  describe('hapticHeavy', () => {
    it('should trigger heavy impact haptic', () => {
      hapticHeavy();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });
  });

  describe('hapticSelection', () => {
    it('should trigger selection haptic', () => {
      hapticSelection();

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('hapticSuccess', () => {
    it('should trigger success notification haptic', () => {
      hapticSuccess();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });
  });

  describe('hapticWarning', () => {
    it('should trigger warning notification haptic', () => {
      hapticWarning();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning,
      );
    });
  });

  describe('hapticError', () => {
    it('should trigger error notification haptic', () => {
      hapticError();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });
  });

  describe('withHaptic', () => {
    it('should wrap handler with haptic feedback', () => {
      const handler = jest.fn().mockReturnValue('result');
      const wrappedHandler = withHaptic(handler);

      const result = wrappedHandler('arg1', 'arg2');

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe('result');
    });

    it('should use specified haptic type', () => {
      const handler = jest.fn();
      const wrappedHandler = withHaptic(handler, 'success');

      wrappedHandler();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it('should call handler even if haptic fails', () => {
      (Haptics.impactAsync as jest.Mock).mockImplementationOnce(() => {
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
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

      jest.clearAllMocks();

      haptics.success();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });
  });
});
