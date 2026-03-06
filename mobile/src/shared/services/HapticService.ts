// src/shared/services/HapticService.ts
// Dengin Design System - Haptic Feedback Service
// Oku: mobile-development-guide/ui-ux-modernization/16-HAPTIC-FEEDBACK.md

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { HapticType } from '@theme/types';

/**
 * Haptic Feedback Service
 * Centralized haptic feedback management for consistent tactile responses
 */
class HapticService {
  private isEnabled: boolean = true;
  private reduceMotion: boolean = false;

  /**
   * Enable or disable haptic feedback globally
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set reduce motion preference (for accessibility)
   */
  setReduceMotion(reduce: boolean): void {
    this.reduceMotion = reduce;
  }

  /**
   * Check if haptics are available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Trigger haptic feedback by type
   */
  trigger(type: HapticType): void {
    if (!this.isEnabled || this.reduceMotion || !this.isAvailable()) {
      return;
    }

    try {
      switch (type) {
        case 'light':
        case 'impactLight':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
        case 'impactMedium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
        case 'impactHeavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
        case 'notificationSuccess':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
        case 'notificationWarning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
        case 'notificationError':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'selection':
          Haptics.selectionAsync();
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silently fail if haptics are not available
      console.debug('Haptic feedback failed:', error);
    }
  }

  /**
   * Light impact - for subtle interactions
   * Use for: Tab switches, toggles, small buttons
   */
  light(): void {
    this.trigger('light');
  }

  /**
   * Medium impact - for standard interactions
   * Use for: Button presses, card selections
   */
  medium(): void {
    this.trigger('medium');
  }

  /**
   * Heavy impact - for significant actions
   * Use for: Like animations, confirmations, delete actions
   */
  heavy(): void {
    this.trigger('heavy');
  }

  /**
   * Success notification - for completed actions
   * Use for: Form submissions, successful uploads
   */
  success(): void {
    this.trigger('success');
  }

  /**
   * Warning notification - for cautionary feedback
   * Use for: Validation errors, limit reached
   */
  warning(): void {
    this.trigger('warning');
  }

  /**
   * Error notification - for failed actions
   * Use for: Failed requests, critical errors
   */
  error(): void {
    this.trigger('error');
  }

  /**
   * Selection change - for list/picker changes
   * Use for: Scroll pickers, segmented controls
   */
  selection(): void {
    this.trigger('selection');
  }

  /**
   * Button press feedback - consistent button haptic
   */
  buttonPress(): void {
    this.light();
  }

  /**
   * Like action feedback - Instagram-style like haptic
   */
  like(): void {
    this.heavy();
  }

  /**
   * Pull to refresh feedback
   */
  pullToRefresh(): void {
    this.medium();
  }

  /**
   * Swipe action feedback
   */
  swipeAction(): void {
    this.light();
  }

  /**
   * Long press feedback
   */
  longPress(): void {
    this.medium();
  }

  /**
   * Navigation feedback
   */
  navigate(): void {
    this.selection();
  }

  /**
   * Custom pattern - sequence of haptics
   */
  async pattern(types: HapticType[], delays: number[]): Promise<void> {
    if (!this.isEnabled || this.reduceMotion) return;

    for (let i = 0; i < types.length; i++) {
      this.trigger(types[i]);
      if (delays[i] && i < types.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  }

  /**
   * Celebration pattern - for achievements/milestones
   */
  async celebration(): Promise<void> {
    await this.pattern(['light', 'medium', 'heavy', 'success'], [100, 100, 100, 0]);
  }
}

// Singleton instance
export const hapticService = new HapticService();

export default hapticService;
