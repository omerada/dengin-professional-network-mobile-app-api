// src/features/messaging/components/TypingIndicator/TypingIndicator.types.ts
// TypingIndicator type definitions

import type { StyleProp, ViewStyle } from 'react-native';

/**
 * TypingIndicator Props
 */
export interface TypingIndicatorProps {
  /**
   * Yazan kullanıcıların isimleri
   */
  users: string[];

  /**
   * Görünür mü
   */
  visible?: boolean;

  /**
   * Kompakt mod (sadece noktalar)
   */
  compact?: boolean;

  /**
   * Stil override
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * AnimatedDot Props
 */
export interface AnimatedDotProps {
  /**
   * Animasyon gecikmesi (ms)
   */
  delay: number;

  /**
   * Nokta rengi
   */
  color: string;

  /**
   * Nokta boyutu
   */
  size?: number;
}
