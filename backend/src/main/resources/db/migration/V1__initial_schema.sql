-- Initial schema for Dengin platform
-- Strategic DDD Implementation

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- IDENTITY CONTEXT
-- =====================================================

-- Professions Table
CREATE TABLE professions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    requires_verification BOOLEAN DEFAULT FALSE,
    description TEXT,
    icon_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_professions_category ON professions(category);
CREATE INDEX idx_professions_requires_verification ON professions(requires_verification);

COMMENT ON TABLE professions IS 'Meslek kategorileri - Identity Context';
COMMENT ON COLUMN professions.category IS 'MEDICAL, LEGAL, ENGINEERING, EDUCATION, SERVICE, etc.';
COMMENT ON COLUMN professions.requires_verification IS 'Bu meslek AI doğrulaması gerektiriyor mu?';

-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Profession
    profession_id BIGINT REFERENCES professions(id) ON DELETE SET NULL,
    is_profession_verified BOOLEAN DEFAULT FALSE,
    profession_verified_at TIMESTAMP,
    
    -- Profile Status
    is_profile_complete BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    
    -- OAuth
    oauth_provider VARCHAR(50), -- GOOGLE, INSTAGRAM, null for local
    oauth_provider_id VARCHAR(255),
    
    -- Activity
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, BANNED, DELETED
    ban_reason TEXT,
    banned_until TIMESTAMP,
    banned_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED'))
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profession ON users(profession_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_provider_id);
CREATE INDEX idx_users_is_profession_verified ON users(is_profession_verified);

COMMENT ON TABLE users IS 'Kullanıcılar - Identity Context Aggregate Root';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password (nullable for OAuth users)';
COMMENT ON COLUMN users.status IS 'ACTIVE: Normal kullanım, SUSPENDED: Geçici ban, BANNED: Kalıcı ban, DELETED: Soft delete';

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    device_info VARCHAR(255),
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens - Session management';

-- User Blocks Table (Mutual Blocking)
CREATE TABLE user_blocks (
    id BIGSERIAL PRIMARY KEY,
    blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_not_self_block CHECK (blocker_id != blocked_id),
    CONSTRAINT uk_user_blocks UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

COMMENT ON TABLE user_blocks IS 'Kullanıcı engelleme - Identity Context';

-- =====================================================
-- AUDIT & HISTORY
-- =====================================================

-- User Audit Log
CREATE TABLE user_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, PROFILE_UPDATE, STATUS_CHANGE, etc.
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_audit_user ON user_audit_log(user_id);
CREATE INDEX idx_user_audit_action ON user_audit_log(action);
CREATE INDEX idx_user_audit_created ON user_audit_log(created_at);

COMMENT ON TABLE user_audit_log IS 'Kullanıcı aktivite log - Compliance & Security';

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_professions_updated_at BEFORE UPDATE ON professions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- System user for automated actions
INSERT INTO users (id, email, name, surname, status, is_email_verified) 
VALUES (0, 'system@dengin.com', 'System', 'User', 'ACTIVE', TRUE);
