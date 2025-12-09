-- =====================================================
-- V18__create_sector_model.sql
-- Sprint 1: Sector-Based Community Structure
-- Created: 2025-12-09
-- Purpose: Create sector and profession_groups tables, migrate existing data
-- =====================================================

-- =====================================================
-- SECTOR TABLE (Top-level professional category)
-- =====================================================
-- Replaces ProfessionCategory enum with flexible entity model
-- Users select a sector during onboarding
-- Each sector can have multiple profession groups

CREATE TABLE sectors (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT chk_sector_code_uppercase CHECK (code = UPPER(code)),
    CONSTRAINT chk_sector_display_order CHECK (display_order >= 0)
);

-- Indexes for sectors
CREATE INDEX idx_sectors_code ON sectors(code);
CREATE INDEX idx_sectors_active ON sectors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sectors_display_order ON sectors(display_order);

-- Comments
COMMENT ON TABLE sectors IS 'Top-level professional sectors - replaces ProfessionCategory enum';
COMMENT ON COLUMN sectors.code IS 'Sector code: MEDICAL, LEGAL, ENGINEERING, etc. (uppercase)';
COMMENT ON COLUMN sectors.name IS 'Display name in Turkish: Sağlık, Hukuk, Mühendislik, etc.';
COMMENT ON COLUMN sectors.display_order IS 'Display order in UI (lower = shown first)';
COMMENT ON COLUMN sectors.is_active IS 'Whether sector is active and shown to users';

-- =====================================================
-- SEED SECTORS (from existing ProfessionCategory enum)
-- =====================================================
INSERT INTO sectors (code, name, description, display_order, is_active) VALUES
('MEDICAL', 'Sağlık', 'Sağlık sektörü profesyonelleri - doktorlar, hemşireler, eczacılar', 1, TRUE),
('LEGAL', 'Hukuk', 'Hukuk ve adalet sektörü - avukatlar, hakimler, noterler', 2, TRUE),
('ENGINEERING', 'Mühendislik', 'Mühendislik ve teknik sektör - tüm mühendislik branşları', 3, TRUE),
('EDUCATION', 'Eğitim', 'Eğitim ve akademi - öğretmenler, akademisyenler', 4, TRUE),
('SERVICE', 'Hizmet', 'Hizmet sektörü - garsonlar, kuaförler, şoförler', 5, TRUE),
('CREATIVE', 'Yaratıcı', 'Yaratıcı ve sanat sektörü - tasarımcılar, sanatçılar', 6, TRUE),
('BUSINESS', 'İş Dünyası', 'İş ve yönetim - muhasebeciler, mali müşavirler, yöneticiler', 7, TRUE),
('OTHER', 'Diğer', 'Genel kategori - belirtilmemiş veya diğer meslekler', 99, TRUE);

-- =====================================================
-- PROFESSION_GROUPS TABLE (Specific profession within sector)
-- =====================================================
-- Replaces old Profession entity with sector relationship
-- Used for optional verification and profession badges
-- Users can join multiple profession groups (Sprint 3)

CREATE TABLE profession_groups (
    id BIGSERIAL PRIMARY KEY,
    sector_id BIGINT NOT NULL REFERENCES sectors(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_verification BOOLEAN NOT NULL DEFAULT FALSE,
    icon_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT unique_profession_per_sector UNIQUE (sector_id, name),
    CONSTRAINT chk_profession_display_order CHECK (display_order >= 0)
);

-- Indexes for profession_groups
CREATE INDEX idx_profession_groups_sector ON profession_groups(sector_id);
CREATE INDEX idx_profession_groups_verification ON profession_groups(requires_verification);
CREATE INDEX idx_profession_groups_active ON profession_groups(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_profession_groups_sector_display ON profession_groups(sector_id, display_order);

-- Comments
COMMENT ON TABLE profession_groups IS 'Profession groups within sectors - specific professions for verification and badges';
COMMENT ON COLUMN profession_groups.sector_id IS 'Parent sector reference';
COMMENT ON COLUMN profession_groups.requires_verification IS 'Whether this profession requires AI verification to join';
COMMENT ON COLUMN profession_groups.display_order IS 'Display order within sector (lower = shown first)';
COMMENT ON COLUMN profession_groups.is_active IS 'Whether profession group is active and available';

-- =====================================================
-- DATA MIGRATION: professions → profession_groups
-- =====================================================
-- Migrate existing professions to profession_groups table
-- Maps old category (enum) to new sector_id (foreign key)

INSERT INTO profession_groups (sector_id, name, description, requires_verification, icon_url, display_order, created_at, updated_at, version)
SELECT 
    s.id AS sector_id,
    p.name,
    p.description,
    p.requires_verification,
    p.icon_url,
    ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY p.id) AS display_order,
    p.created_at,
    p.updated_at,
    p.version
FROM professions p
JOIN sectors s ON s.code = p.category::text;

-- Log migration results
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count FROM profession_groups;
    RAISE NOTICE 'Migrated % professions to profession_groups', migrated_count;
END $$;

-- =====================================================
-- ADD SECTOR_ID TO USERS TABLE (Primary Sector)
-- =====================================================
-- Users will have a primary sector (MVP)
-- Keep profession_id for backward compatibility during migration period

ALTER TABLE users ADD COLUMN sector_id BIGINT REFERENCES sectors(id) ON DELETE SET NULL;

CREATE INDEX idx_users_sector ON users(sector_id);

COMMENT ON COLUMN users.sector_id IS 'User primary sector (MVP). NULL allowed during migration period.';

-- =====================================================
-- MIGRATE USER SECTORS FROM PROFESSION
-- =====================================================
-- Automatically set user sector based on their current profession
-- Users without profession will have NULL sector (can select during next login)

UPDATE users u
SET sector_id = s.id
FROM professions p
JOIN sectors s ON s.code = p.category::text
WHERE u.profession_id = p.id
  AND u.sector_id IS NULL;

-- Log migration results
DO $$
DECLARE
    migrated_users INTEGER;
    total_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users WHERE profession_id IS NOT NULL;
    SELECT COUNT(*) INTO migrated_users FROM users WHERE sector_id IS NOT NULL;
    RAISE NOTICE 'Migrated % out of % users to sectors', migrated_users, total_users;
END $$;

-- =====================================================
-- ADD SECTOR_ID TO POSTS TABLE
-- =====================================================
-- Posts will belong to a sector (not just profession)
-- Keep profession_id for backward compatibility

ALTER TABLE posts ADD COLUMN sector_id BIGINT REFERENCES sectors(id) ON DELETE SET NULL;

CREATE INDEX idx_posts_sector ON posts(sector_id);
CREATE INDEX idx_posts_sector_created ON posts(sector_id, created_at DESC) WHERE status = 'PUBLISHED';

COMMENT ON COLUMN posts.sector_id IS 'Post sector (visible to all sector members). NULL during migration.';

-- =====================================================
-- MIGRATE POST SECTORS FROM PROFESSION
-- =====================================================
-- Set post sector based on profession

UPDATE posts p
SET sector_id = s.id
FROM professions pr
JOIN sectors s ON s.code = pr.category::text
WHERE p.profession_id = pr.id
  AND p.sector_id IS NULL;

-- Log migration results
DO $$
DECLARE
    migrated_posts INTEGER;
    total_posts INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_posts FROM posts;
    SELECT COUNT(*) INTO migrated_posts FROM posts WHERE sector_id IS NOT NULL;
    RAISE NOTICE 'Migrated % out of % posts to sectors', migrated_posts, total_posts;
END $$;

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
-- Apply updated_at trigger to new tables

CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profession_groups_updated_at BEFORE UPDATE ON profession_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VALIDATION & STATISTICS
-- =====================================================

-- Validate migration
DO $$
DECLARE
    sector_count INTEGER;
    profession_group_count INTEGER;
    users_with_sector INTEGER;
    posts_with_sector INTEGER;
BEGIN
    SELECT COUNT(*) INTO sector_count FROM sectors WHERE is_active = TRUE;
    SELECT COUNT(*) INTO profession_group_count FROM profession_groups WHERE is_active = TRUE;
    SELECT COUNT(*) INTO users_with_sector FROM users WHERE sector_id IS NOT NULL;
    SELECT COUNT(*) INTO posts_with_sector FROM posts WHERE sector_id IS NOT NULL;
    
    RAISE NOTICE '=== Migration Statistics ===';
    RAISE NOTICE 'Active Sectors: %', sector_count;
    RAISE NOTICE 'Active Profession Groups: %', profession_group_count;
    RAISE NOTICE 'Users with Sector: %', users_with_sector;
    RAISE NOTICE 'Posts with Sector: %', posts_with_sector;
    
    -- Validation assertions
    IF sector_count < 8 THEN
        RAISE EXCEPTION 'Expected at least 8 sectors, found %', sector_count;
    END IF;
    
    IF profession_group_count = 0 THEN
        RAISE EXCEPTION 'No profession groups created - migration failed';
    END IF;
END $$;

-- =====================================================
-- NOTES FOR DEVELOPERS
-- =====================================================
-- 1. Old 'professions' table is NOT dropped - kept for backward compatibility
-- 2. Users can still have profession_id - will be deprecated in Sprint 2
-- 3. API should support both old (profession_id) and new (sector_id) fields during transition
-- 4. Migration is safe to rollback - new columns allow NULL values
-- 5. Next sprint will enforce sector_id NOT NULL constraint after full migration
