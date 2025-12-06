// src/core/navigation/navigationRef.ts
// Navigation ref - komponent dışından navigasyon için
// Oku: mobile-development-guide/core/09-NAVIGATION.md

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Navigation container ref
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Komponent dışından navigasyon
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

/**
 * Geri git
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Navigation state'i sıfırla
 */
export function reset(
  index: number,
  routes: Array<{ name: keyof RootStackParamList; params?: any }>,
) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index, routes });
  }
}

/**
 * Mevcut route'u al
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

/**
 * Navigation hazır mı?
 */
export function isReady() {
  return navigationRef.isReady();
}
