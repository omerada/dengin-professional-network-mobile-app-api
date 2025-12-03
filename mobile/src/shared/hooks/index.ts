// src/shared/hooks/index.ts
// Shared hooks exports
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

export { useDebounce } from '../../hooks/useDebounce';
export { useNetworkStatus, useIsOffline, useOnlineEffect, useRetryOnReconnect } from './useNetworkStatus';
export { useBackHandler, usePreventBack, useDoubleBackToExit, useNavigationBackHandler, useExitConfirmation } from './useBackHandler';
export { useKeyboard, useDismissKeyboardOnTap, useKeyboardScrollAdjustment, useInputFocus, useKeyboardBottomPadding } from './useKeyboardAvoidance';
export { useAppState, useOnAppForeground, useOnAppBackground, useAppUsageTime, useAppLifecycleAnalytics, useRefreshOnForeground, useAppStatePause } from './useAppState';
