// src/shared/hooks/index.ts
// Shared hooks exports
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

// Existing hooks
export { useDebounce } from '../../hooks/useDebounce';

// Sector hooks (Sprint 1)
export {
  useSectors,
  useSector,
  useSectorByCode,
  useSearchSectors,
  usePopularSectors,
  useSectorStats,
  isProfessionalSector,
  isGeneralSector,
  sectorKeys,
} from './useSectors';

// Profession hooks
export {
  useProfessions,
  useProfession,
  useProfessionsByCategory,
  useSearchProfessions,
  useVerificationRequiredProfessions,
  useProfessionStats,
  requiresVerification,
  professionKeys,
} from './useProfessions';

export {
  useNetworkStatus,
  useIsOffline,
  useOnlineEffect,
  useRetryOnReconnect,
} from './useNetworkStatus';
export {
  useBackHandler,
  usePreventBack,
  useDoubleBackToExit,
  useNavigationBackHandler,
  useExitConfirmation,
} from './useBackHandler';
export {
  useKeyboard,
  useDismissKeyboardOnTap,
  useKeyboardScrollAdjustment,
  useInputFocus,
  useKeyboardBottomPadding,
} from './useKeyboardAvoidance';
export {
  useAppState,
  useOnAppForeground,
  useOnAppBackground,
  useAppUsageTime,
  useAppLifecycleAnalytics,
  useRefreshOnForeground,
  useAppStatePause,
} from './useAppState';

// UI/UX Modernization hooks
export { useHaptic, useHapticPress, useHapticLike } from './useHaptic';
export {
  useDebounce as useDebounceValue,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
} from './useDebounce';
export {
  useAnimatedValue,
  useScaleAnimation,
  useFadeAnimation,
  useSlideAnimation,
  usePulseAnimation,
  useShakeAnimation,
  useLikeAnimation,
  useCountAnimation,
  useSharedTransition,
  useEnterAnimation,
} from './useAnimatedValue';

// Lifecycle hooks
export {
  usePrevious,
  useMount,
  useUnmount,
  useUpdateEffect,
  useIsMounted,
  useFirstRender,
  useRenderCount,
} from './useLifecycle';

// Dimension hooks
export {
  useDimensions,
  useWindowSize,
  useOrientation,
  useResponsiveValue,
  useScaledSize,
  normalize,
  getResponsiveSpacing,
} from './useDimensions';
export type { WindowDimensions, ScreenDimensions } from './useDimensions';
