// __tests__/unit/social/socialStore.test.ts
// Unit tests for social Zustand store
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { act, renderHook } from '@testing-library/react-hooks';
import { useSocialStore } from '@features/social/stores';

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useSocialStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSocialStore.setState({
      following: new Map(),
      followers: new Map(),
      pendingRequests: new Map(),
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have empty initial state', () => {
      const { result } = renderHook(() => useSocialStore());

      expect(result.current.following.size).toBe(0);
      expect(result.current.followers.size).toBe(0);
      expect(result.current.pendingRequests.size).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('followUser', () => {
    it('should add user to following list (optimistic)', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-123');
      });

      expect(result.current.following.has('user-123')).toBe(true);
    });

    it('should set isFollowing status correctly', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-123');
      });

      const followData = result.current.following.get('user-123');
      expect(followData?.isFollowing).toBe(true);
    });

    it('should not follow same user twice', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-123');
        result.current.followUser('user-123');
      });

      expect(result.current.following.size).toBe(1);
    });
  });

  describe('unfollowUser', () => {
    it('should remove user from following list', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-123');
      });

      expect(result.current.following.has('user-123')).toBe(true);

      await act(async () => {
        result.current.unfollowUser('user-123');
      });

      // User should still be in map but with isFollowing: false
      const followData = result.current.following.get('user-123');
      expect(followData?.isFollowing).toBe(false);
    });

    it('should handle unfollowing non-followed user', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.unfollowUser('non-existent');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('isFollowing', () => {
    it('should return true for followed user', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-123');
      });

      expect(result.current.isFollowing('user-123')).toBe(true);
    });

    it('should return false for non-followed user', () => {
      const { result } = renderHook(() => useSocialStore());

      expect(result.current.isFollowing('user-456')).toBe(false);
    });
  });

  describe('Optimistic Updates', () => {
    it('should mark follow as pending during API call', async () => {
      const { result } = renderHook(() => useSocialStore());

      let isPendingDuringCall = false;

      await act(async () => {
        const promise = result.current.followUser('user-123');
        isPendingDuringCall = result.current.following.get('user-123')?.isPending ?? false;
        await promise;
      });

      expect(isPendingDuringCall).toBe(true);
    });

    it('should remove pending state after successful follow', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        await result.current.followUser('user-123');
      });

      const followData = result.current.following.get('user-123');
      expect(followData?.isPending).toBe(false);
    });
  });

  describe('Follower Management', () => {
    it('should track followers', async () => {
      const { result } = renderHook(() => useSocialStore());

      act(() => {
        useSocialStore.setState({
          followers: new Map([
            ['user-1', { userId: 'user-1', followedAt: new Date().toISOString() }],
            ['user-2', { userId: 'user-2', followedAt: new Date().toISOString() }],
          ]),
        });
      });

      expect(result.current.followers.size).toBe(2);
    });

    it('should provide follower count', () => {
      const { result } = renderHook(() => useSocialStore());

      act(() => {
        useSocialStore.setState({
          followers: new Map([
            ['user-1', { userId: 'user-1', followedAt: new Date().toISOString() }],
          ]),
        });
      });

      expect(result.current.getFollowerCount()).toBe(1);
    });

    it('should provide following count', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-1');
        result.current.followUser('user-2');
        result.current.followUser('user-3');
      });

      expect(result.current.getFollowingCount()).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle follow errors gracefully', async () => {
      const { result } = renderHook(() => useSocialStore());

      // Mock API error by setting error state
      act(() => {
        useSocialStore.setState({ error: 'Network error' });
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should clear errors', async () => {
      const { result } = renderHook(() => useSocialStore());

      act(() => {
        useSocialStore.setState({ error: 'Some error' });
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should handle fetching followers list', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        await result.current.fetchFollowers('current-user');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetching following list', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        await result.current.fetchFollowing('current-user');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should provide followers list as array', async () => {
      const { result } = renderHook(() => useSocialStore());

      act(() => {
        useSocialStore.setState({
          followers: new Map([
            ['user-1', { userId: 'user-1', followedAt: '2024-01-01' }],
            ['user-2', { userId: 'user-2', followedAt: '2024-01-02' }],
          ]),
        });
      });

      const followersList = result.current.getFollowersList();

      expect(followersList).toHaveLength(2);
    });

    it('should provide following list as array', async () => {
      const { result } = renderHook(() => useSocialStore());

      await act(async () => {
        result.current.followUser('user-1');
        result.current.followUser('user-2');
      });

      const followingList = result.current.getFollowingList();

      expect(followingList).toHaveLength(2);
    });
  });
});
