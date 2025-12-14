// src/contexts/ToastContext.tsx
// Global toast notification context
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART7.md

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastData, ToastType } from '@shared/components';

/**
 * Toast configuration
 */
export interface ToastConfig {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

/**
 * Toast context value
 */
interface ToastContextValue {
  /**
   * Show a toast with custom configuration
   */
  show: (config: ToastConfig) => void;
  /**
   * Show a success toast
   */
  success: (message: string, title?: string) => void;
  /**
   * Show an error toast
   */
  error: (message: string, title?: string) => void;
  /**
   * Show a warning toast
   */
  warning: (message: string, title?: string) => void;
  /**
   * Show an info toast
   */
  info: (message: string, title?: string) => void;
  /**
   * Hide current toast
   */
  hide: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Generate unique toast ID
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * ToastProvider Component
 *
 * Provides global toast notification functionality.
 * Wrap your app with this provider to use useToast hook anywhere.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <ToastProvider>
 *   <YourApp />
 * </ToastProvider>
 *
 * // In any component
 * const toast = useToast();
 * toast.success('İşlem başarılı!');
 * toast.error('Bir hata oluştu');
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback((config: ToastConfig) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      type: config.type,
      message: config.message,
      duration: config.duration,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hide = useCallback(() => {
    setToasts((prev) => prev.slice(1));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showWithType = useCallback(
    (type: ToastType, message: string, _title?: string) => {
      show({ type, message });
    },
    [show],
  );

  const success = useCallback(
    (message: string, title?: string) => {
      showWithType('success', message, title);
    },
    [showWithType],
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showWithType('error', message, title);
    },
    [showWithType],
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showWithType('warning', message, title);
    },
    [showWithType],
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showWithType('info', message, title);
    },
    [showWithType],
  );

  const contextValue = useMemo(
    () => ({
      show,
      success,
      error,
      warning,
      info,
      hide,
    }),
    [show, success, error, warning, info, hide],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onHide={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999,
  },
});

/**
 * useToast Hook
 *
 * Access toast functionality from any component.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     toast.success('Kaydedildi!');
 *   } catch (error) {
 *     toast.error('Kaydetme başarısız');
 *   }
 * };
 * ```
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
