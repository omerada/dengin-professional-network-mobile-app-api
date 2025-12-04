// __tests__/unit/utils/performance.test.ts
// Unit tests for performance utilities
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { renderHook, act } from '@testing-library/react-native';
import {
  createMemoComparator,
  useDebouncedCallback,
  useThrottledCallback,
  getItemLayout,
  calculateWindowSize,
  chunkArray,
  getListOptimizations,
} from '@shared/utils/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createMemoComparator', () => {
    it('should return true when specified keys are equal', () => {
      const comparator = createMemoComparator(['id', 'name']);
      const prevProps = { id: 1, name: 'Test', value: 'old' };
      const nextProps = { id: 1, name: 'Test', value: 'new' };

      expect(comparator(prevProps, nextProps)).toBe(true);
    });

    it('should return false when any specified key differs', () => {
      const comparator = createMemoComparator(['id', 'name']);
      const prevProps = { id: 1, name: 'Test' };
      const nextProps = { id: 1, name: 'Different' };

      expect(comparator(prevProps, nextProps)).toBe(false);
    });

    it('should ignore keys not in the list', () => {
      const comparator = createMemoComparator(['id']);
      const prevProps = { id: 1, name: 'Test', extra: 'a' };
      const nextProps = { id: 1, name: 'Different', extra: 'b' };

      expect(comparator(prevProps, nextProps)).toBe(true);
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('arg1');
        result.current('arg2');
        result.current('arg3');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('should cancel previous call when called again', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('first');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        result.current('second');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });
  });

  describe('useThrottledCallback', () => {
    it('should throttle callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 300));

      act(() => {
        result.current('arg1');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg1');

      act(() => {
        result.current('arg2');
        result.current('arg3');
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      act(() => {
        result.current('arg4');
      });

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('arg4');
    });
  });

  describe('getItemLayout', () => {
    it('should return correct layout for given index', () => {
      const getLayout = getItemLayout(100);

      expect(getLayout(null, 0)).toEqual({
        length: 100,
        offset: 0,
        index: 0,
      });

      expect(getLayout(null, 5)).toEqual({
        length: 100,
        offset: 500,
        index: 5,
      });

      expect(getLayout(null, 10)).toEqual({
        length: 100,
        offset: 1000,
        index: 10,
      });
    });
  });

  describe('calculateWindowSize', () => {
    it('should calculate minimum window size of 5', () => {
      const windowSize = calculateWindowSize(100, 200);
      expect(windowSize).toBeGreaterThanOrEqual(5);
    });

    it('should scale with screen height', () => {
      const smallScreen = calculateWindowSize(100, 600);
      const largeScreen = calculateWindowSize(100, 1200);

      expect(largeScreen).toBeGreaterThan(smallScreen);
    });
  });

  describe('chunkArray', () => {
    it('should split array into chunks', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = chunkArray(array, 3);

      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });

    it('should handle empty array', () => {
      const chunks = chunkArray([], 3);
      expect(chunks).toEqual([]);
    });

    it('should handle array smaller than chunk size', () => {
      const chunks = chunkArray([1, 2], 5);
      expect(chunks).toEqual([[1, 2]]);
    });
  });

  describe('getListOptimizations', () => {
    it('should return platform-specific optimizations', () => {
      const optimizations = getListOptimizations();

      expect(optimizations).toHaveProperty('initialNumToRender');
      expect(optimizations).toHaveProperty('maxToRenderPerBatch');
      expect(optimizations).toHaveProperty('windowSize');
    });
  });
});
