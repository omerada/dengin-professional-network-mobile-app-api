// __tests__/unit/moderation/moderationStore.test.ts
// Unit tests for moderation Zustand store
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { act, renderHook } from '@testing-library/react-hooks';
import { useModerationStore } from '@features/moderation/stores';

// Mock the store initial state
const mockInitialState = {
  blockedUsers: new Map(),
  reports: new Map(),
  isLoading: false,
  error: null,
};

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useModerationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useModerationStore.setState({
      blockedUsers: new Map(),
      reports: new Map(),
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have empty initial state', () => {
      const { result } = renderHook(() => useModerationStore());

      expect(result.current.blockedUsers.size).toBe(0);
      expect(result.current.reports.size).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('blockUser', () => {
    it('should add user to blocked list', async () => {
      const { result } = renderHook(() => useModerationStore());

      const blockedUser = {
        userId: 'user-123',
        blockedAt: new Date().toISOString(),
        reason: 'Spam',
      };

      await act(async () => {
        result.current.blockUser(blockedUser.userId, blockedUser.reason);
      });

      expect(result.current.blockedUsers.has(blockedUser.userId)).toBe(true);
    });

    it('should not block same user twice', async () => {
      const { result } = renderHook(() => useModerationStore());

      await act(async () => {
        result.current.blockUser('user-123', 'First block');
        result.current.blockUser('user-123', 'Second block');
      });

      expect(result.current.blockedUsers.size).toBe(1);
    });
  });

  describe('unblockUser', () => {
    it('should remove user from blocked list', async () => {
      const { result } = renderHook(() => useModerationStore());

      await act(async () => {
        result.current.blockUser('user-123', 'Spam');
      });

      expect(result.current.blockedUsers.has('user-123')).toBe(true);

      await act(async () => {
        result.current.unblockUser('user-123');
      });

      expect(result.current.blockedUsers.has('user-123')).toBe(false);
    });

    it('should handle unblocking non-existent user gracefully', async () => {
      const { result } = renderHook(() => useModerationStore());

      await act(async () => {
        result.current.unblockUser('non-existent');
      });

      expect(result.current.blockedUsers.size).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('isUserBlocked', () => {
    it('should return true for blocked user', async () => {
      const { result } = renderHook(() => useModerationStore());

      await act(async () => {
        result.current.blockUser('user-123', 'Spam');
      });

      expect(result.current.isUserBlocked('user-123')).toBe(true);
    });

    it('should return false for non-blocked user', () => {
      const { result } = renderHook(() => useModerationStore());

      expect(result.current.isUserBlocked('user-456')).toBe(false);
    });
  });

  describe('submitReport', () => {
    it('should add report to reports list', async () => {
      const { result } = renderHook(() => useModerationStore());

      const report = {
        targetId: 'post-123',
        targetType: 'post' as const,
        reason: 'spam',
        description: 'This is spam content',
      };

      await act(async () => {
        await result.current.submitReport(report);
      });

      expect(result.current.reports.size).toBe(1);
    });

    it('should set loading state during report submission', async () => {
      const { result } = renderHook(() => useModerationStore());

      const report = {
        targetId: 'post-123',
        targetType: 'post' as const,
        reason: 'spam',
        description: 'Spam',
      };

      let loadingDuringSubmit = false;

      await act(async () => {
        const promise = result.current.submitReport(report);
        loadingDuringSubmit = result.current.isLoading;
        await promise;
      });

      expect(loadingDuringSubmit).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { result } = renderHook(() => useModerationStore());

      // Set an error state
      act(() => {
        useModerationStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchBlockedUsers', () => {
    it('should fetch and populate blocked users', async () => {
      const { result } = renderHook(() => useModerationStore());

      await act(async () => {
        await result.current.fetchBlockedUsers();
      });

      // fetchBlockedUsers should complete without error
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should provide blockedUsersList selector', async () => {
      const { result } = renderHook(() => useModerationStore());

      await act(async () => {
        result.current.blockUser('user-1', 'Reason 1');
        result.current.blockUser('user-2', 'Reason 2');
      });

      const blockedList = result.current.getBlockedUsersList();

      expect(blockedList).toHaveLength(2);
      expect(blockedList.map(u => u.userId)).toContain('user-1');
      expect(blockedList.map(u => u.userId)).toContain('user-2');
    });
  });
});
