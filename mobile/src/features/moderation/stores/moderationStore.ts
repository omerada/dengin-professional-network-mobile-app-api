// src/features/moderation/stores/moderationStore.ts
// Moderation state management
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReportResponse, BlockedUser, ReportType, ReportReason } from '../types';

/**
 * Draft report state (for in-progress reports)
 */
interface DraftReport {
  type: ReportType;
  targetId: string | number;
  reason?: ReportReason;
  description?: string;
  createdAt: string;
}

/**
 * Moderation store state
 */
interface ModerationState {
  // Blocked users cache
  blockedUserIds: Set<number>;
  blockedUsers: BlockedUser[];
  blockedUsersLastFetch: number | null;

  // Reports cache
  myReports: ReportResponse[];
  myReportsLastFetch: number | null;

  // Draft report (in-progress)
  draftReport: DraftReport | null;

  // UI state
  isBlockModalVisible: boolean;
  isReportModalVisible: boolean;
  selectedUserId: number | null;
  selectedUserName: string | null;

  // Loading states
  isLoadingBlockedUsers: boolean;
  isLoadingReports: boolean;
}

/**
 * Moderation store actions
 */
interface ModerationActions {
  // Blocked users management
  setBlockedUsers: (users: BlockedUser[]) => void;
  addBlockedUser: (user: BlockedUser) => void;
  removeBlockedUser: (userId: number) => void;
  isUserBlocked: (userId: number) => boolean;
  clearBlockedUsers: () => void;

  // Reports management
  setMyReports: (reports: ReportResponse[]) => void;
  addReport: (report: ReportResponse) => void;
  clearReports: () => void;

  // Draft report management
  setDraftReport: (draft: DraftReport | null) => void;
  updateDraftReport: (updates: Partial<DraftReport>) => void;
  clearDraftReport: () => void;

  // UI actions
  showBlockModal: (userId: number, userName: string) => void;
  hideBlockModal: () => void;
  showReportModal: (type: ReportType, targetId: string | number) => void;
  hideReportModal: () => void;

  // Loading states
  setLoadingBlockedUsers: (loading: boolean) => void;
  setLoadingReports: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

type ModerationStore = ModerationState & ModerationActions;

/**
 * Initial state
 */
const initialState: ModerationState = {
  blockedUserIds: new Set(),
  blockedUsers: [],
  blockedUsersLastFetch: null,
  myReports: [],
  myReportsLastFetch: null,
  draftReport: null,
  isBlockModalVisible: false,
  isReportModalVisible: false,
  selectedUserId: null,
  selectedUserName: null,
  isLoadingBlockedUsers: false,
  isLoadingReports: false,
};

/**
 * Cache duration (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Moderation store
 */
export const useModerationStore = create<ModerationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== Blocked Users Management ==========

      setBlockedUsers: (users: BlockedUser[]) => {
        const blockedUserIds = new Set(users.map(u => u.id));
        set({
          blockedUsers: users,
          blockedUserIds,
          blockedUsersLastFetch: Date.now(),
        });
      },

      addBlockedUser: (user: BlockedUser) => {
        const { blockedUsers, blockedUserIds } = get();
        if (!blockedUserIds.has(user.id)) {
          const newBlockedUserIds = new Set(blockedUserIds);
          newBlockedUserIds.add(user.id);
          set({
            blockedUsers: [...blockedUsers, user],
            blockedUserIds: newBlockedUserIds,
          });
        }
      },

      removeBlockedUser: (userId: number) => {
        const { blockedUsers, blockedUserIds } = get();
        const newBlockedUserIds = new Set(blockedUserIds);
        newBlockedUserIds.delete(userId);
        set({
          blockedUsers: blockedUsers.filter(u => u.id !== userId),
          blockedUserIds: newBlockedUserIds,
        });
      },

      isUserBlocked: (userId: number) => {
        return get().blockedUserIds.has(userId);
      },

      clearBlockedUsers: () => {
        set({
          blockedUsers: [],
          blockedUserIds: new Set(),
          blockedUsersLastFetch: null,
        });
      },

      // ========== Reports Management ==========

      setMyReports: (reports: ReportResponse[]) => {
        set({
          myReports: reports,
          myReportsLastFetch: Date.now(),
        });
      },

      addReport: (report: ReportResponse) => {
        const { myReports } = get();
        // Add to beginning (newest first)
        set({
          myReports: [report, ...myReports],
        });
      },

      clearReports: () => {
        set({
          myReports: [],
          myReportsLastFetch: null,
        });
      },

      // ========== Draft Report Management ==========

      setDraftReport: (draft: DraftReport | null) => {
        set({ draftReport: draft });
      },

      updateDraftReport: (updates: Partial<DraftReport>) => {
        const { draftReport } = get();
        if (draftReport) {
          set({
            draftReport: { ...draftReport, ...updates },
          });
        }
      },

      clearDraftReport: () => {
        set({ draftReport: null });
      },

      // ========== UI Actions ==========

      showBlockModal: (userId: number, userName: string) => {
        set({
          isBlockModalVisible: true,
          selectedUserId: userId,
          selectedUserName: userName,
        });
      },

      hideBlockModal: () => {
        set({
          isBlockModalVisible: false,
          selectedUserId: null,
          selectedUserName: null,
        });
      },

      showReportModal: (type: ReportType, targetId: string | number) => {
        set({
          isReportModalVisible: true,
          draftReport: {
            type,
            targetId,
            createdAt: new Date().toISOString(),
          },
        });
      },

      hideReportModal: () => {
        set({
          isReportModalVisible: false,
          draftReport: null,
        });
      },

      // ========== Loading States ==========

      setLoadingBlockedUsers: (loading: boolean) => {
        set({ isLoadingBlockedUsers: loading });
      },

      setLoadingReports: (loading: boolean) => {
        set({ isLoadingReports: loading });
      },

      // ========== Reset ==========

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'moderation-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        // Only persist blocked user IDs (not full data)
        blockedUserIds: Array.from(state.blockedUserIds),
        // Don't persist UI state or drafts
      }),
      onRehydrateStorage: () => state => {
        // Convert blockedUserIds array back to Set
        if (state && Array.isArray(state.blockedUserIds)) {
          state.blockedUserIds = new Set(state.blockedUserIds as unknown as number[]);
        }
      },
    },
  ),
);

/**
 * Selector: Check if cache is stale
 */
export const useIsBlockedUsersCacheStale = () => {
  const lastFetch = useModerationStore(state => state.blockedUsersLastFetch);
  if (!lastFetch) return true;
  return Date.now() - lastFetch > CACHE_DURATION;
};

/**
 * Selector: Check if reports cache is stale
 */
export const useIsReportsCacheStale = () => {
  const lastFetch = useModerationStore(state => state.myReportsLastFetch);
  if (!lastFetch) return true;
  return Date.now() - lastFetch > CACHE_DURATION;
};

/**
 * Selector: Get blocked user IDs as array
 */
export const useBlockedUserIds = () => {
  return useModerationStore(state => Array.from(state.blockedUserIds));
};

export default useModerationStore;
