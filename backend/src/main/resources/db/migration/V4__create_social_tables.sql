-- Migration: V4__create_social_tables.sql
-- Sprint 5-6: Social Context - Posts, Comments, Follows
-- Created: 2025-12-02
-- Purpose: Create tables for social feed, posts, comments, and follow relationships

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE posts (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Business Identifier (UUID)
    post_id UUID NOT NULL UNIQUE,
    
    -- Author & Profession
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profession_id BIGINT NOT NULL REFERENCES professions(id),
    
    -- Content
    content TEXT NOT NULL,
    -- Constraint: 10-5000 characters (enforced in domain)
    
    -- Engagement Metrics
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    -- PUBLISHED, HIDDEN, DELETED
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Version (for optimistic locking)
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT chk_post_like_count CHECK (like_count >= 0),
    CONSTRAINT chk_post_comment_count CHECK (comment_count >= 0),
    CONSTRAINT chk_post_status CHECK (status IN ('PUBLISHED', 'HIDDEN', 'DELETED'))
);

-- Indexes for posts
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_profession_id ON posts(profession_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC) WHERE status = 'PUBLISHED';

-- Feed query optimization: author + profession + time
CREATE INDEX idx_posts_feed_query ON posts(author_id, profession_id, created_at DESC) 
    WHERE status = 'PUBLISHED';

-- Trending posts: engagement score
CREATE INDEX idx_posts_trending ON posts((like_count * 2 + comment_count * 5) DESC, created_at DESC) 
    WHERE status = 'PUBLISHED';

-- Comments
COMMENT ON TABLE posts IS 'Social feed posts with content and engagement metrics';
COMMENT ON COLUMN posts.post_id IS 'Business identifier (UUID) for external references';
COMMENT ON COLUMN posts.like_count IS 'Denormalized like count for performance';
COMMENT ON COLUMN posts.comment_count IS 'Denormalized comment count for performance';

-- ============================================
-- POST IMAGES TABLE
-- ============================================
CREATE TABLE post_images (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Post Reference
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- S3 Metadata
    s3_key VARCHAR(500) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    
    -- Image Dimensions
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size BIGINT NOT NULL,
    
    -- Display Order (managed by JPA @OrderColumn)
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_image_dimensions CHECK (width > 0 AND height > 0),
    CONSTRAINT chk_image_file_size CHECK (file_size > 0),
    CONSTRAINT chk_image_display_order CHECK (display_order >= 0)
);

-- Indexes for post_images
CREATE INDEX idx_post_images_post_id ON post_images(post_id);
CREATE INDEX idx_post_images_display_order ON post_images(post_id, display_order);

-- Comments
COMMENT ON TABLE post_images IS 'Images attached to posts (max 5 per post, enforced in domain)';
COMMENT ON COLUMN post_images.s3_key IS 'S3 object key for image retrieval';
COMMENT ON COLUMN post_images.display_order IS 'Order of images in post (0-4)';

-- ============================================
-- POST LIKES TABLE
-- ============================================
CREATE TABLE post_likes (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Post Reference
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- User Reference
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Timestamp
    liked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique Constraint: One like per user per post
    CONSTRAINT uq_post_likes_post_user UNIQUE (post_id, user_id)
);

-- Indexes for post_likes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_likes_liked_at ON post_likes(liked_at DESC);

-- Comments
COMMENT ON TABLE post_likes IS 'Post likes (one per user per post)';
COMMENT ON CONSTRAINT uq_post_likes_post_user ON post_likes IS 'Ensures user can only like a post once';

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Business Identifier (UUID)
    comment_id UUID NOT NULL UNIQUE,
    
    -- Post Reference
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Commenter
    commenter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content VARCHAR(500) NOT NULL,
    -- Constraint: 1-500 characters (enforced in domain)
    
    -- Soft Delete Flag
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Version (for optimistic locking)
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT chk_comment_deleted_at CHECK (
        (deleted = TRUE AND deleted_at IS NOT NULL) OR 
        (deleted = FALSE AND deleted_at IS NULL)
    )
);

-- Indexes for comments
CREATE INDEX idx_comments_post_id ON comments(post_id, created_at ASC);
CREATE INDEX idx_comments_commenter_id ON comments(commenter_id);
CREATE INDEX idx_comments_deleted ON comments(deleted) WHERE deleted = FALSE;

-- Comments
COMMENT ON TABLE comments IS 'Comments on posts with soft delete support';
COMMENT ON COLUMN comments.comment_id IS 'Business identifier (UUID) for external references';
COMMENT ON COLUMN comments.deleted IS 'Soft delete flag (keeps comment history)';

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE follows (
    -- Primary Key
    id BIGSERIAL PRIMARY KEY,
    
    -- Follower (user who follows)
    follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Following (user being followed)
    following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Version (for optimistic locking)
    version BIGINT DEFAULT 0,
    
    -- Unique Constraint: One follow relationship per pair
    CONSTRAINT uq_follows_follower_following UNIQUE (follower_id, following_id),
    
    -- Business Rule: Can't follow yourself
    CONSTRAINT chk_follows_no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- Bidirectional lookup optimization
CREATE INDEX idx_follows_bidirectional ON follows(follower_id, following_id);

-- Comments
COMMENT ON TABLE follows IS 'User follow relationships (follower -> following)';
COMMENT ON CONSTRAINT uq_follows_follower_following ON follows IS 'Ensures unique follow relationships';
COMMENT ON CONSTRAINT chk_follows_no_self_follow ON follows IS 'Business rule: users cannot follow themselves';

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for posts table
CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for comments table
CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for follows table
CREATE TRIGGER trg_follows_updated_at
    BEFORE UPDATE ON follows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================

-- Note: Sample data will be added after initial user/profession setup
-- Posts require:
-- - Verified users (from users table)
-- - Professions (from professions table)

-- ============================================
-- INDEXES SUMMARY
-- ============================================
-- posts: 6 indexes (author, profession, time, status, feed, trending)
-- post_images: 2 indexes (post_id, display_order)
-- post_likes: 3 indexes (post_id, user_id, liked_at)
-- comments: 3 indexes (post_id+time, commenter, deleted)
-- follows: 4 indexes (follower, following, time, bidirectional)
-- Total: 18 indexes for optimal query performance

-- ============================================
-- PERFORMANCE NOTES
-- ============================================
-- 1. Feed query uses composite index (author_id, profession_id, created_at)
-- 2. Trending query uses functional index on engagement score
-- 3. Like/unlike operations use unique constraint index
-- 4. Comment count denormalized in posts table (updated via application)
-- 5. Follow lookups optimized with bidirectional index
-- 6. All foreign keys have supporting indexes for JOIN performance
