// src/shared/components/index.ts
// Dengin Design System - Component Exports
// Oku: mobile-development-guide/ui-ux-modernization/04-COMPONENT-LIBRARY.md

// Core components
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputProps, InputVariant, InputSize, InputRef } from './Input';

export { SearchBar } from './SearchBar';
export type { SearchBarProps, SearchBarSize } from './SearchBar';

// Loading & Feedback components
export { Loading, LoadingOverlay, Spinner, DotsLoading } from './Loading';
export { ErrorFallback } from './ErrorFallback';
export { OfflineNotice } from './OfflineNotice';
export { ErrorBoundary } from './ErrorBoundary';
export { NetworkErrorBoundary } from './NetworkErrorBoundary';
export { PullToRefresh, useRefreshControl } from './PullToRefresh';
export { StepSuccess } from './StepSuccess';
export type { StepSuccessProps } from './StepSuccess';

// Unified Loading State System - PRODUCTION STANDARD
export { UnifiedLoadingState } from './LoadingState/UnifiedLoadingState';
export type {
  UnifiedLoadingStateProps,
  LoadingStrategy,
  LoadingVariant,
} from './LoadingState/UnifiedLoadingState';

// Skeleton Components
export { MessageListSkeleton } from './Skeleton/MessageListSkeleton';
export { NotificationListSkeleton } from './Skeleton/NotificationListSkeleton';
export { ActivityScreenSkeleton } from './Skeleton/ActivityScreenSkeleton';

// Animated Components
export { AnimatedListItem } from './AnimatedListItem';
export { AnimatedCounter } from './AnimatedCounter';
export { AnimatedBadge } from './AnimatedBadge';
export { AnimatedCheckmark } from './AnimatedCheckmark';
export { SuccessCelebration } from './SuccessCelebration';
export { ShakeAnimation } from './ShakeAnimation';

// Display components
export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

// Unified Empty State (PRODUCTION READY)
export { UnifiedEmptyState } from './UnifiedEmptyState/UnifiedEmptyState';

export { ProgressiveImage } from './ProgressiveImage';

export { HeroImage } from './HeroImage';
export type { HeroImageProps } from './HeroImage';

export { SwipeableCard } from './SwipeableCard';
export type { SwipeableCardProps } from './SwipeableCard';

export { ActionFeedback } from './ActionFeedback';
export type { ActionFeedbackProps, ActionFeedbackType } from './ActionFeedback';

export { CustomRefreshControl } from './CustomRefreshControl';

export { PulseLoader } from './PulseLoader';

// ScreenHeader component
export { ScreenHeader } from './ScreenHeader';
export type { ScreenHeaderProps, ScreenHeaderVariant } from './ScreenHeader';

// Skeleton components
export { Skeleton, SkeletonPost, SkeletonMessage } from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';

// Skeleton Presets - Production UX Enhancement
export {
  SkeletonPostCard,
  SkeletonProfileHeader,
  SkeletonConversationItem,
  SkeletonNotificationItem,
  SkeletonCommentItem,
  SkeletonUserListItem,
  SkeletonList,
} from './Skeleton';

// Modal & Overlay components
export { Modal, BottomSheet } from './Modal';
export type { ModalProps, BottomSheetProps } from './Modal';

export { Toast } from './Toast';
export type { ToastType, ToastData, ToastProps } from './Toast';

export { ActionSheet } from './ActionSheet';
export type { ActionSheetProps, ActionSheetOption } from './ActionSheet';

// Layout components
export {
  Typography,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Subtitle1,
  Subtitle2,
  Body1,
  Body2,
  Caption,
  Overline,
} from './Typography';
export type {
  TypographyVariant,
  TypographyColor,
  TypographyAlign,
  TypographyWeight,
} from './Typography';

export { Divider } from './Divider';
export type { DividerOrientation, DividerVariant } from './Divider';

export { Screen } from './Screen';
export type { ScreenPadding, ScreenProps } from './Screen';

// Pressable components
export { PressableScale, PressableOpacity, PressableHighlight, PressableBounce } from './Pressable';
export type {
  PressableScaleProps,
  PressableOpacityProps,
  PressableHighlightProps,
  PressableBounceProps,
} from './Pressable';

// ListItem components
export { ListItem, ListItemSeparator, ListItemGroup } from './ListItem';
export type { ListItemProps, ListItemSize, ListItemGroupProps } from './ListItem';
export type { SwipeAction as ListItemSwipeAction } from './ListItem';

// Chip components
export { Chip, ChipGroup, FilterChips } from './Chip';
export type {
  ChipProps,
  ChipGroupProps,
  ChipVariant,
  ChipSize,
  ChipColor,
  FilterChip,
  FilterChipsProps,
} from './Chip';

// ImageViewer component
export { ImageViewer } from './ImageViewer';
export type { ImageViewerProps } from './ImageViewer';

// TabBar component
export { TabBar } from './TabBar';
export type { TabBarProps, TabItem } from './TabBar';

// SwipeableRow component
export { SwipeableRow } from './SwipeableRow';
export type { SwipeableRowProps, SwipeableRowRef, SwipeAction } from './SwipeableRow';

// LoadingStateWrapper component - DEPRECATED: Use UnifiedLoadingState instead
/** @deprecated Use UnifiedLoadingState component instead */
export { LoadingStateWrapper } from './LoadingStateWrapper';
/** @deprecated Use UnifiedLoadingState component instead */
export type { LoadingStateWrapperProps } from './LoadingStateWrapper';

// FormField component - Real-time validation UX
export { FormField, ValidationHelpers } from './FormField';
export type { FormFieldProps, ValidationRule } from './FormField';

// Upload & Network feedback components
export { UploadProgress, type UploadProgressProps } from './UploadProgress';
export { OfflineBanner } from './OfflineBanner';
