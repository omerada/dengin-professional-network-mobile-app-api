// src/shared/hooks/useAppState.ts
// App state management hook
// Oku: mobile-development-guide/sprints/28-SPRINT-11-12.md

import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Analytics, AnalyticsEvent } from '@shared/services/analytics';

/**
 * Hook for tracking app state (active, background, inactive)
 */
export function useAppState(): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, []);

  return appState;
}

/**
 * Hook for executing callback when app becomes active
 */
export function useOnAppForeground(callback: () => void, deps: any[] = []): void {
  const appState = useAppState();
  const prevAppState = useRef(appState);

  useEffect(() => {
    if (prevAppState.current.match(/inactive|background/) && appState === 'active') {
      callback();
    }
    prevAppState.current = appState;
  }, [appState, ...deps]);
}

/**
 * Hook for executing callback when app goes to background
 */
export function useOnAppBackground(callback: () => void, deps: any[] = []): void {
  const appState = useAppState();
  const prevAppState = useRef(appState);

  useEffect(() => {
    if (prevAppState.current === 'active' && appState.match(/inactive|background/)) {
      callback();
    }
    prevAppState.current = appState;
  }, [appState, ...deps]);
}

/**
 * Hook for tracking time spent in app
 */
export function useAppUsageTime(): {
  sessionDuration: number;
  totalDuration: number;
} {
  const [sessionStart] = useState(() => Date.now());
  const [backgroundTime, setBackgroundTime] = useState(0);
  const backgroundStartRef = useRef<number | null>(null);

  useOnAppBackground(() => {
    backgroundStartRef.current = Date.now();
  });

  useOnAppForeground(() => {
    if (backgroundStartRef.current) {
      const bgDuration = Date.now() - backgroundStartRef.current;
      setBackgroundTime(prev => prev + bgDuration);
      backgroundStartRef.current = null;
    }
  });

  const sessionDuration = Date.now() - sessionStart - backgroundTime;

  return {
    sessionDuration,
    totalDuration: Date.now() - sessionStart,
  };
}

/**
 * Hook for logging app lifecycle events to analytics
 */
export function useAppLifecycleAnalytics(): void {
  const sessionId = useRef(Date.now().toString());
  const sessionStartRef = useRef(Date.now());

  useOnAppForeground(() => {
    Analytics.logEvent(AnalyticsEvent.APP_OPENED, {
      session_id: sessionId.current,
      timestamp: Date.now(),
    });
  });

  useOnAppBackground(() => {
    const duration = Date.now() - sessionStartRef.current;
    Analytics.logEvent(AnalyticsEvent.APP_BACKGROUNDED, {
      session_id: sessionId.current,
      session_duration_ms: duration,
      timestamp: Date.now(),
    });
  });
}

/**
 * Hook for refreshing data when app comes to foreground
 */
export function useRefreshOnForeground<T>(
  refreshFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    minBackgroundTime?: number; // Minimum time in background before refresh (ms)
  },
): void {
  const { enabled = true, minBackgroundTime = 60000 } = options || {}; // Default: 1 minute
  const backgroundStartRef = useRef<number | null>(null);

  useOnAppBackground(() => {
    if (enabled) {
      backgroundStartRef.current = Date.now();
    }
  });

  useOnAppForeground(() => {
    if (!enabled) return;

    if (backgroundStartRef.current) {
      const bgDuration = Date.now() - backgroundStartRef.current;
      if (bgDuration >= minBackgroundTime) {
        refreshFn();
      }
      backgroundStartRef.current = null;
    }
  });
}

/**
 * Hook for pausing/resuming operations based on app state
 */
export function useAppStatePause(): {
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
} {
  const appState = useAppState();
  const [manualPause, setManualPause] = useState(false);

  const isPaused = appState !== 'active' || manualPause;

  const pause = useCallback(() => setManualPause(true), []);
  const resume = useCallback(() => setManualPause(false), []);

  return {
    isPaused,
    pause,
    resume,
  };
}
