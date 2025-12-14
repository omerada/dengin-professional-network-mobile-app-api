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
export { PullToRefresh, useRefreshControl } from './PullToRefresh';
export { StepSuccess } from './StepSuccess';
export type { StepSuccessProps } from './StepSuccess';

// Display components
export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { Card } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// Skeleton components
export { Skeleton, SkeletonPost, SkeletonMessage } from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';

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
export { Chip, ChipGroup } from './Chip';
export type { ChipProps, ChipGroupProps, ChipVariant, ChipSize, ChipColor } from './Chip';

// ImageViewer component
export { ImageViewer } from './ImageViewer';
export type { ImageViewerProps } from './ImageViewer';

// TabBar component
export { TabBar } from './TabBar';
export type { TabBarProps, TabItem } from './TabBar';

// SwipeableRow component
export { SwipeableRow } from './SwipeableRow';
export type { SwipeableRowProps, SwipeableRowRef, SwipeAction } from './SwipeableRow';
