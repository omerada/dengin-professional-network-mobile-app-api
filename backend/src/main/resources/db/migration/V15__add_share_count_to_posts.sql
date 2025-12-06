-- Migration: V15__add_share_count_to_posts.sql
-- Purpose: Add share_count column to posts table
-- Created: 2025-12-06
-- Issue: share_count exists in domain model but missing from database schema

-- Add share_count column to posts table
ALTER TABLE posts 
ADD COLUMN share_count INTEGER NOT NULL DEFAULT 0;

-- Add constraint to ensure share_count is non-negative
ALTER TABLE posts
ADD CONSTRAINT chk_post_share_count CHECK (share_count >= 0);

-- Add index for potential trending/viral post queries
CREATE INDEX idx_posts_share_count ON posts(share_count DESC) WHERE status = 'PUBLISHED';

-- Update trending posts index to include share_count in score calculation
DROP INDEX IF EXISTS idx_posts_trending;
CREATE INDEX idx_posts_trending ON posts(
    (like_count * 2 + comment_count * 5 + share_count * 3) DESC, 
    created_at DESC
) WHERE status = 'PUBLISHED';

-- Add comment
COMMENT ON COLUMN posts.share_count IS 'Denormalized share count for performance and viral detection';
