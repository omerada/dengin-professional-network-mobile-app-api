// src/features/feed/components/index.ts
// Meslektaş Design System - Feed Component Exports
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

// PostCard modular structure - use explicit path to avoid conflict with PostCard.tsx
export { PostCard } from './PostCard/index';
export { PostHeader } from './PostCard/PostHeader';
export { PostContent } from './PostCard/PostContent';
export { PostImages } from './PostCard/PostImages';
export { PostActions } from './PostCard/PostActions';

// Modern interaction components
export { DoubleTapLike } from './DoubleTapLike';

// Loading components
export { FeedSkeleton, PostSkeleton } from './FeedSkeleton';

// FeedHeader modular structure
export { FeedHeader } from './FeedHeader/index';
export type { FeedHeaderProps, ProfessionInfo } from './FeedHeader/FeedHeader.types';
 
// EmptyFeed modular structure
export { EmptyFeed } from './EmptyFeed';

// Other components
export { CommentCard } from './CommentCard';
export { AddCommentForm } from './AddCommentForm';
export { PostTextInput } from './PostTextInput';
export { ImagePreviewGrid } from './ImagePreviewGrid';
