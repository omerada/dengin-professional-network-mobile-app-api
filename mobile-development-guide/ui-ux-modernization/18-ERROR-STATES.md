# ❌ Error States Tasarımı

**Doküman Versiyonu:** 1.0  
**Son Güncelleme:** 5 Aralık 2025  
**Amaç:** Kullanıcı Dostu Error Handling

---

## 📑 İçindekiler

1. [Error Handling Felsefesi](#error-handling-felsefesi)
2. [Error Types](#error-types)
3. [Error Components](#error-components)
4. [Form Validation Errors](#form-validation-errors)
5. [Network Errors](#network-errors)
6. [Error Boundaries](#error-boundaries)
7. [Error Recovery](#error-recovery)

---

## 🎯 Error Handling Felsefesi

### Temel İlkeler

```
1. Empati: Kullanıcıyı suçlama, yardımcı ol
2. Açıklık: Ne olduğunu ve neden olduğunu açıkla
3. Aksiyon: Çözüm için net adımlar sun
4. Tutarlılık: Tüm hatalarda aynı dili kullan
```

### Error Message Template

```
[What happened] + [Why it happened] + [What to do]

Örnek:
"Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin."
```

---

## 📊 Error Types

### Error Kategorileri

| Tip        | Örnek                | UI                       |
| ---------- | -------------------- | ------------------------ |
| Network    | No internet, timeout | Full screen with retry   |
| Validation | Invalid email        | Inline field error       |
| Auth       | Session expired      | Modal + redirect         |
| Server     | 500 error            | Toast + retry            |
| Permission | Camera denied        | Contextual banner        |
| Not Found  | 404                  | Full screen illustration |
| Rate Limit | Too many requests    | Toast with countdown     |

---

## 🧩 Error Components

### Base Error View

```typescript
// 📁 src/shared/components/error/ErrorView.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { ModernButton } from "@/shared/components/buttons/ModernButton";
import { useTheme } from "@/theme";

export type ErrorType =
  | "network"
  | "server"
  | "notFound"
  | "permission"
  | "auth"
  | "generic";

interface ErrorViewProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  showAnimation?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ERROR_CONFIG: Record<
  ErrorType,
  {
    animation: any;
    defaultTitle: string;
    defaultMessage: string;
  }
> = {
  network: {
    animation: require("@/assets/animations/error-network.json"),
    defaultTitle: "Bağlantı Hatası",
    defaultMessage: "İnternet bağlantınızı kontrol edip tekrar deneyin.",
  },
  server: {
    animation: require("@/assets/animations/error-server.json"),
    defaultTitle: "Sunucu Hatası",
    defaultMessage: "Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
  },
  notFound: {
    animation: require("@/assets/animations/error-404.json"),
    defaultTitle: "Bulunamadı",
    defaultMessage: "Aradığınız içerik bulunamadı.",
  },
  permission: {
    animation: require("@/assets/animations/error-permission.json"),
    defaultTitle: "İzin Gerekli",
    defaultMessage: "Bu özelliği kullanmak için izin vermeniz gerekiyor.",
  },
  auth: {
    animation: require("@/assets/animations/error-auth.json"),
    defaultTitle: "Oturum Süresi Doldu",
    defaultMessage: "Devam etmek için tekrar giriş yapın.",
  },
  generic: {
    animation: require("@/assets/animations/error-generic.json"),
    defaultTitle: "Bir Hata Oluştu",
    defaultMessage: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
  },
};

export const ErrorView: React.FC<ErrorViewProps> = memo(
  ({
    type = "generic",
    title,
    message,
    actionLabel = "Tekrar Dene",
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    showAnimation = true,
    style,
  }) => {
    const { colors } = useTheme();
    const config = ERROR_CONFIG[type];

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={[styles.container, style]}
      >
        {showAnimation && (
          <LottieView
            source={config.animation}
            autoPlay
            loop
            style={styles.animation}
          />
        )}

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {title || config.defaultTitle}
        </Text>

        <Text style={[styles.message, { color: colors.text.secondary }]}>
          {message || config.defaultMessage}
        </Text>

        {onAction && (
          <ModernButton
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            style={styles.button}
          />
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <ModernButton
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="ghost"
            style={styles.secondaryButton}
          />
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    minWidth: 200,
  },
  secondaryButton: {
    marginTop: 12,
  },
});
```

### Inline Error

```typescript
// 📁 src/shared/components/error/InlineError.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import AlertCircleIcon from "@/assets/icons/alert-circle.svg";

interface InlineErrorProps {
  message: string;
  onDismiss?: () => void;
  showIcon?: boolean;
}

export const InlineError: React.FC<InlineErrorProps> = memo(
  ({ message, onDismiss, showIcon = true }) => {
    const { colors } = useTheme();
    const shake = useSharedValue(0);

    // Shake animation on mount
    React.useEffect(() => {
      shake.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }, [message]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shake.value }],
    }));

    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[styles.container, animatedStyle]}
      >
        {showIcon && (
          <AlertCircleIcon
            width={16}
            height={16}
            fill={colors.semantic.error}
          />
        )}
        <Text style={[styles.message, { color: colors.semantic.error }]}>
          {message}
        </Text>
        {onDismiss && (
          <Pressable onPress={onDismiss} style={styles.dismiss}>
            <Text
              style={[styles.dismissText, { color: colors.semantic.error }]}
            >
              ✕
            </Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 6,
  },
  message: {
    fontSize: 13,
    flex: 1,
  },
  dismiss: {
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
```

### Error Toast

```typescript
// 📁 src/shared/components/error/ErrorToast.tsx
import React, { memo, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useTheme } from "@/theme";
import AlertCircleIcon from "@/assets/icons/alert-circle.svg";
import XIcon from "@/assets/icons/x.svg";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = memo(
  ({ message, onDismiss, duration = 4000, actionLabel, onAction }) => {
    const { colors } = useTheme();
    const { error: hapticError } = useHaptic();
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
      // Entry animation
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Haptic feedback
      hapticError();

      // Auto dismiss
      const timeout = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timeout);
    }, []);

    const dismiss = () => {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(onDismiss)();
      });
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          styles.container,
          {
            top: insets.top + 8,
            backgroundColor: colors.semantic.error,
          },
          animatedStyle,
        ]}
      >
        <AlertCircleIcon width={20} height={20} fill="#FFFFFF" />

        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>

        {actionLabel && onAction && (
          <Pressable onPress={onAction} style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        )}

        <Pressable onPress={dismiss} style={styles.close}>
          <XIcon width={16} height={16} fill="#FFFFFF" />
        </Pressable>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  close: {
    padding: 4,
  },
});
```

### Error Banner

```typescript
// 📁 src/shared/components/error/ErrorBanner.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import WifiOffIcon from "@/assets/icons/wifi-off.svg";
import RefreshIcon from "@/assets/icons/refresh.svg";

interface ErrorBannerProps {
  type: "offline" | "error" | "warning";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const BANNER_CONFIG = {
  offline: {
    icon: WifiOffIcon,
    backgroundColor: "#FF9500",
  },
  error: {
    icon: null,
    backgroundColor: "#FF3B30",
  },
  warning: {
    icon: null,
    backgroundColor: "#FFCC00",
  },
};

export const ErrorBanner: React.FC<ErrorBannerProps> = memo(
  ({ type, message, actionLabel, onAction }) => {
    const { colors } = useTheme();
    const config = BANNER_CONFIG[type];
    const Icon = config.icon;

    return (
      <Animated.View
        entering={SlideInUp.springify().damping(15)}
        exiting={SlideOutUp.duration(200)}
        style={[styles.container, { backgroundColor: config.backgroundColor }]}
      >
        {Icon && <Icon width={18} height={18} fill="#FFFFFF" />}

        <Text style={styles.message}>{message}</Text>

        {actionLabel && onAction && (
          <Pressable onPress={onAction} style={styles.action}>
            <RefreshIcon width={16} height={16} fill="#FFFFFF" />
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
```

---

## 📝 Form Validation Errors

### Input with Error

```typescript
// 📁 src/shared/components/inputs/ValidatedInput.tsx
import React, { memo, useState, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";
import { InlineError } from "../error/InlineError";
import { useTheme } from "@/theme";

interface ValidatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const ValidatedInput: React.FC<ValidatedInputProps> = memo(
  ({ label, error, touched, onFocus, onBlur, style, ...props }) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const borderProgress = useSharedValue(0);
    const shakeX = useSharedValue(0);

    const hasError = touched && !!error;

    // Shake on error
    React.useEffect(() => {
      if (hasError) {
        shakeX.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-8, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }, [hasError, error]);

    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        borderProgress.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        borderProgress.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
      },
      [onBlur]
    );

    const animatedContainerStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shakeX.value }],
    }));

    const animatedInputStyle = useAnimatedStyle(() => {
      const borderColor = hasError
        ? colors.semantic.error
        : interpolateColor(
            borderProgress.value,
            [0, 1],
            [colors.neutral[300], colors.primary[500]]
          );

      return {
        borderColor,
        borderWidth: 2,
      };
    });

    return (
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            {label}
          </Text>
        )}

        <AnimatedTextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
            },
            animatedInputStyle,
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {hasError && <InlineError message={error} />}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
```

### Form Error Summary

```typescript
// 📁 src/shared/components/error/FormErrorSummary.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { useTheme } from "@/theme";
import AlertCircleIcon from "@/assets/icons/alert-circle.svg";

interface FormError {
  field: string;
  message: string;
}

interface FormErrorSummaryProps {
  errors: FormError[];
  title?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = memo(
  ({ errors, title = "Lütfen aşağıdaki hataları düzeltin:" }) => {
    const { colors } = useTheme();

    if (errors.length === 0) return null;

    return (
      <Animated.View
        entering={FadeIn.duration(200).delay(100)}
        style={[
          styles.container,
          {
            backgroundColor: colors.semantic.error + "10",
            borderColor: colors.semantic.error,
          },
        ]}
      >
        <View style={styles.header}>
          <AlertCircleIcon
            width={20}
            height={20}
            fill={colors.semantic.error}
          />
          <Text style={[styles.title, { color: colors.semantic.error }]}>
            {title}
          </Text>
        </View>

        <View style={styles.errorList}>
          {errors.map((error, index) => (
            <Animated.View
              key={error.field}
              entering={SlideInUp.delay(index * 50)}
              style={styles.errorItem}
            >
              <Text style={[styles.bullet, { color: colors.semantic.error }]}>
                •
              </Text>
              <Text style={[styles.errorText, { color: colors.text.primary }]}>
                {error.message}
              </Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorList: {
    gap: 8,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
```

---

## 🌐 Network Errors

### Offline Indicator

```typescript
// 📁 src/shared/components/error/OfflineIndicator.tsx
import React, { memo, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import WifiOffIcon from "@/assets/icons/wifi-off.svg";

export const OfflineIndicator: React.FC = memo(() => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    translateY.value = withSpring(isOffline ? 0 : -50, {
      damping: 15,
      stiffness: 150,
    });
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: "#FF9500",
        },
        animatedStyle,
      ]}
    >
      <WifiOffIcon width={18} height={18} fill="#FFFFFF" />
      <Text style={styles.text}>Çevrimdışı</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    gap: 8,
    zIndex: 9998,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
```

### Retry Logic Component

```typescript
// 📁 src/shared/components/error/RetryableError.tsx
import React, { memo, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ErrorView } from "./ErrorView";
import { ModernButton } from "@/shared/components/buttons/ModernButton";
import { Spinner } from "@/shared/components/loading/Spinner";
import { useTheme } from "@/theme";

interface RetryableErrorProps {
  error: Error;
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
}

export const RetryableError: React.FC<RetryableErrorProps> = memo(
  ({ error, onRetry, maxRetries = 3, retryDelay = 1000 }) => {
    const { colors } = useTheme();
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleRetry = useCallback(async () => {
      if (retryCount >= maxRetries) return;

      setIsRetrying(true);

      // Exponential backoff countdown
      const delay = retryDelay * Math.pow(2, retryCount);
      let remaining = Math.ceil(delay / 1000);

      const interval = setInterval(() => {
        remaining--;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      await new Promise((resolve) => setTimeout(resolve, delay));
      clearInterval(interval);

      try {
        await onRetry();
      } catch (e) {
        setRetryCount((prev) => prev + 1);
      } finally {
        setIsRetrying(false);
        setCountdown(0);
      }
    }, [retryCount, maxRetries, retryDelay, onRetry]);

    const canRetry = retryCount < maxRetries;

    return (
      <View style={styles.container}>
        <ErrorView
          type="network"
          title="Bağlantı Hatası"
          message={error.message}
          showAnimation={!isRetrying}
        />

        {isRetrying ? (
          <View style={styles.retrying}>
            <Spinner size={24} />
            {countdown > 0 && (
              <Text
                style={[styles.countdown, { color: colors.text.secondary }]}
              >
                {countdown} saniye içinde tekrar deneniyor...
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.actions}>
            {canRetry ? (
              <ModernButton
                title={`Tekrar Dene (${maxRetries - retryCount} deneme kaldı)`}
                onPress={handleRetry}
                variant="primary"
              />
            ) : (
              <Text
                style={[styles.maxRetries, { color: colors.text.secondary }]}
              >
                Maksimum deneme sayısına ulaşıldı. Lütfen daha sonra tekrar
                deneyin.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  retrying: {
    alignItems: "center",
    gap: 12,
  },
  countdown: {
    fontSize: 14,
  },
  actions: {
    alignItems: "center",
  },
  maxRetries: {
    fontSize: 14,
    textAlign: "center",
  },
});
```

---

## 🛡️ Error Boundaries

### React Error Boundary

```typescript
// 📁 src/shared/components/error/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { ErrorView } from "./ErrorView";
import * as Sentry from "@sentry/react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ErrorView
            type="generic"
            title="Bir Şeyler Ters Gitti"
            message="Beklenmeyen bir hata oluştu. Uygulamayı yeniden başlatmayı deneyin."
            actionLabel="Tekrar Dene"
            onAction={this.handleReset}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Screen Error Boundary

```typescript
// 📁 src/shared/components/error/ScreenErrorBoundary.tsx
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorView } from "./ErrorView";
import { useNavigation } from "@react-navigation/native";

interface ScreenErrorBoundaryProps {
  children: React.ReactNode;
  screenName: string;
}

export const ScreenErrorBoundary: React.FC<ScreenErrorBoundaryProps> = memo(
  ({ children, screenName }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    };

    const fallback = (
      <View style={styles.container}>
        <ErrorView
          type="generic"
          title="Sayfa Yüklenemedi"
          message={`${screenName} sayfası yüklenirken bir hata oluştu.`}
          actionLabel="Geri Dön"
          onAction={handleGoBack}
        />
      </View>
    );

    return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## 🔄 Error Recovery

### Error Recovery Hook

```typescript
// 📁 src/shared/hooks/useErrorRecovery.ts
import { useState, useCallback } from "react";

interface UseErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, attempt: number) => void;
  onMaxRetriesExceeded?: (error: Error) => void;
}

export function useErrorRecovery<T>(
  asyncFn: () => Promise<T>,
  options: UseErrorRecoveryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onMaxRetriesExceeded,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      setRetryCount(0);
      return result;
    } catch (e) {
      const err = e as Error;
      setError(err);
      onError?.(err, retryCount + 1);

      if (retryCount + 1 >= maxRetries) {
        onMaxRetriesExceeded?.(err);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, retryCount, maxRetries, onError, onMaxRetriesExceeded]);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) return;

    setRetryCount((prev) => prev + 1);

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);
    await new Promise((resolve) => setTimeout(resolve, delay));

    return execute();
  }, [retryCount, maxRetries, retryDelay, execute]);

  const reset = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setData(null);
  }, []);

  return {
    execute,
    retry,
    reset,
    isLoading,
    error,
    data,
    retryCount,
    canRetry: retryCount < maxRetries,
  };
}
```

---

Bu error states sistemi uygulandığında:

- ✅ Kullanıcı dostu hata mesajları
- ✅ Animated error transitions
- ✅ Form validation feedback
- ✅ Network error handling
- ✅ Error recovery patterns
- ✅ Error boundary protection
