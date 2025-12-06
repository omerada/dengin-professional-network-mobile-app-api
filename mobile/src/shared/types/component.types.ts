// src/shared/types/component.types.ts
// Meslektaş Design System - Component Types
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

import { ViewStyle, TextStyle, ImageStyle, StyleProp } from 'react-native';

// ============================================
// SIZE & VARIANT TYPES
// ============================================

/**
 * Common component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button specific sizes
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Avatar sizes
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;

/**
 * Common component variants
 */
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'text';

/**
 * Status/semantic colors
 */
export type StatusType = 'success' | 'error' | 'warning' | 'info';

/**
 * Badge variants
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

// ============================================
// STYLE PROP TYPES
// ============================================

/**
 * Combined style prop type
 */
export type CombinedStyle = ViewStyle | TextStyle | ImageStyle;

/**
 * Style prop with support for arrays and undefined
 */
export type StylePropType<T> = StyleProp<T>;

/**
 * Container style prop
 */
export type ContainerStyleProp = StyleProp<ViewStyle>;

/**
 * Text style prop
 */
export type TextStyleProp = StyleProp<TextStyle>;

/**
 * Image style prop
 */
export type ImageStyleProp = StyleProp<ImageStyle>;

// ============================================
// ACCESSIBILITY TYPES
// ============================================

/**
 * Accessibility props common to all components
 */
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?:
    | 'none'
    | 'button'
    | 'link'
    | 'search'
    | 'image'
    | 'keyboardkey'
    | 'text'
    | 'adjustable'
    | 'header'
    | 'summary'
    | 'alert'
    | 'checkbox'
    | 'combobox'
    | 'menu'
    | 'menubar'
    | 'menuitem'
    | 'progressbar'
    | 'radio'
    | 'radiogroup'
    | 'scrollbar'
    | 'spinbutton'
    | 'switch'
    | 'tab'
    | 'tablist'
    | 'timer'
    | 'toolbar';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
}

// ============================================
// TESTABILITY TYPES
// ============================================

/**
 * Test ID props
 */
export interface TestableProps {
  testID?: string;
}

// ============================================
// HAPTIC TYPES
// ============================================

/**
 * Haptic feedback configuration
 */
export interface HapticProps {
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
}

// ============================================
// LOADING & DISABLED STATES
// ============================================

/**
 * Loading state props
 */
export interface LoadableProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Disabled state props
 */
export interface DisableableProps {
  disabled?: boolean;
}

/**
 * Combined interaction state props
 */
export interface InteractionStateProps extends LoadableProps, DisableableProps {}

// ============================================
// ICON TYPES
// ============================================

/**
 * Icon configuration
 */
export interface IconConfig {
  name: string;
  size?: number;
  color?: string;
  family?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'Feather';
}

/**
 * Left/right icon props
 */
export interface IconableProps {
  leftIcon?: IconConfig | React.ReactNode;
  rightIcon?: IconConfig | React.ReactNode;
  iconSpacing?: number;
}

// ============================================
// LIST ITEM TYPES
// ============================================

/**
 * List item base props
 */
export interface ListItemBaseProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  showDivider?: boolean;
  showChevron?: boolean;
}

// ============================================
// FORM TYPES
// ============================================

/**
 * Form field base props
 */
export interface FormFieldBaseProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Input value types
 */
export type InputValue = string | number | boolean;

/**
 * Form field with value
 */
export interface FormFieldWithValue<T = string> extends FormFieldBaseProps {
  value: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// ============================================
// MODAL & OVERLAY TYPES
// ============================================

/**
 * Modal base props
 */
export interface ModalBaseProps {
  visible: boolean;
  onClose: () => void;
  onBackdropPress?: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
}

/**
 * Bottom sheet specific props
 */
export interface BottomSheetProps extends ModalBaseProps {
  snapPoints?: (string | number)[];
  initialSnapIndex?: number;
  enablePanDownToClose?: boolean;
  backdropOpacity?: number;
}

// ============================================
// ANIMATION COMPONENT TYPES
// ============================================

/**
 * Animated component props
 */
export interface AnimatedComponentProps {
  entering?: object;
  exiting?: object;
  layout?: object;
}

/**
 * Pressable animation props
 */
export interface PressableAnimationProps {
  pressScale?: number;
  pressOpacity?: number;
  pressDuration?: number;
}

// ============================================
// USER TYPES
// ============================================

/**
 * Minimal user display info
 */
export interface UserDisplayInfo {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string | null;
  isVerified?: boolean;
  isOnline?: boolean;
}

/**
 * User with follow status
 */
export interface UserWithFollowStatus extends UserDisplayInfo {
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

// ============================================
// MEDIA TYPES
// ============================================

/**
 * Image source type
 */
export type ImageSourceType =
  | { uri: string; cache?: 'immutable' | 'web' | 'cacheOnly' }
  | number
  | null
  | undefined;

/**
 * Media type
 */
export type MediaType = 'image' | 'video' | 'gif';

/**
 * Media item
 */
export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // For video
  aspectRatio?: number;
}
