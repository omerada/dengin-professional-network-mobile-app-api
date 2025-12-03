-- V8: Moderation Context Tables
-- Sprint 11: Content moderation, reporting, and user sanctions

-- Content Reports Table (Main aggregate table)
CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('POST', 'COMMENT', 'USER', 'MESSAGE')),
    report_reason VARCHAR(30) NOT NULL CHECK (report_reason IN (
        'SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'ADULT_CONTENT',
        'MISINFORMATION', 'IMPERSONATION', 'FAKE_CREDENTIALS', 'COPYRIGHT_VIOLATION',
        'PRIVACY_VIOLATION', 'OTHER'
    )),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED')),
    priority INTEGER NOT NULL DEFAULT 0,
    assigned_moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    decision VARCHAR(30) CHECK (decision IN (
        'APPROVE_CONTENT', 'REMOVE_CONTENT', 'WARN_USER', 'SUSPEND_USER', 'BAN_USER'
    )),
    content_snapshot JSONB,
    moderation_score INTEGER,
    risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 0,
    
    -- Composite unique constraint: one report per user per content
    CONSTRAINT unique_reporter_content UNIQUE (reporter_id, content_id, content_type)
);

-- User Sanctions Table
CREATE TABLE user_sanctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sanction_type VARCHAR(20) NOT NULL CHECK (sanction_type IN ('WARNING', 'SUSPENSION', 'BAN')),
    reason VARCHAR(30) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    applied_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    related_report_id UUID REFERENCES content_reports(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    appealed_at TIMESTAMP,
    appeal_reason TEXT,
    appeal_result VARCHAR(20) CHECK (appeal_result IN ('PENDING', 'APPROVED', 'REJECTED')),
    appeal_processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    appeal_processed_at TIMESTAMP,
    appeal_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 0
);

-- Moderation Actions Table (Audit log for all moderation actions)
CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES content_reports(id) ON DELETE CASCADE,
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN (
        'ASSIGNED', 'REVIEWED', 'ESCALATED', 'RESOLVED', 'CONTENT_REMOVED',
        'WARNING_ISSUED', 'SUSPENSION_APPLIED', 'BAN_APPLIED', 'CANCELLED'
    )),
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB,
    performed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Content Blacklist Table (Automated moderation keywords)
CREATE TABLE content_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'ADULT', 'VIOLENCE', 'SCAM')),
    severity INTEGER NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 10),
    is_active BOOLEAN NOT NULL DEFAULT true,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_keyword UNIQUE (keyword)
);

-- Moderator Statistics Table (Performance tracking)
CREATE TABLE moderator_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reports_reviewed INTEGER NOT NULL DEFAULT 0,
    reports_escalated INTEGER NOT NULL DEFAULT 0,
    warnings_issued INTEGER NOT NULL DEFAULT 0,
    suspensions_applied INTEGER NOT NULL DEFAULT 0,
    bans_applied INTEGER NOT NULL DEFAULT 0,
    average_resolution_time_minutes INTEGER,
    accuracy_score DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_moderator_date UNIQUE (moderator_id, date)
);

-- =====================
-- INDEXES
-- =====================

-- Content Reports Indexes
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_reported_user ON content_reports(reported_user_id);
CREATE INDEX idx_content_reports_content ON content_reports(content_id, content_type);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_status_priority ON content_reports(status, priority DESC, created_at ASC);
CREATE INDEX idx_content_reports_moderator ON content_reports(assigned_moderator_id) WHERE assigned_moderator_id IS NOT NULL;
CREATE INDEX idx_content_reports_created_at ON content_reports(created_at DESC);
CREATE INDEX idx_content_reports_pending ON content_reports(created_at ASC) WHERE status = 'PENDING';
CREATE INDEX idx_content_reports_escalated ON content_reports(created_at ASC) WHERE status = 'ESCALATED';

-- User Sanctions Indexes
CREATE INDEX idx_user_sanctions_user ON user_sanctions(user_id);
CREATE INDEX idx_user_sanctions_user_active ON user_sanctions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_sanctions_type ON user_sanctions(sanction_type);
CREATE INDEX idx_user_sanctions_applied_by ON user_sanctions(applied_by);
CREATE INDEX idx_user_sanctions_pending_appeals ON user_sanctions(appealed_at) 
    WHERE appealed_at IS NOT NULL AND appeal_result IS NULL;
CREATE INDEX idx_user_sanctions_end_date ON user_sanctions(end_date) WHERE end_date IS NOT NULL AND is_active = true;

-- Moderation Actions Indexes
CREATE INDEX idx_moderation_actions_report ON moderation_actions(report_id);
CREATE INDEX idx_moderation_actions_performed_by ON moderation_actions(performed_by);
CREATE INDEX idx_moderation_actions_type ON moderation_actions(action_type);
CREATE INDEX idx_moderation_actions_performed_at ON moderation_actions(performed_at DESC);

-- Content Blacklist Indexes
CREATE INDEX idx_content_blacklist_category ON content_blacklist(category);
CREATE INDEX idx_content_blacklist_active ON content_blacklist(is_active) WHERE is_active = true;

-- Moderator Statistics Indexes
CREATE INDEX idx_moderator_statistics_moderator ON moderator_statistics(moderator_id);
CREATE INDEX idx_moderator_statistics_date ON moderator_statistics(date DESC);

-- =====================
-- TRIGGER FUNCTIONS
-- =====================

-- Auto-update updated_at for content_reports
CREATE TRIGGER tr_content_reports_updated_at
    BEFORE UPDATE ON content_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for user_sanctions
CREATE TRIGGER tr_user_sanctions_updated_at
    BEFORE UPDATE ON user_sanctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for content_blacklist
CREATE TRIGGER tr_content_blacklist_updated_at
    BEFORE UPDATE ON content_blacklist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for moderator_statistics
CREATE TRIGGER tr_moderator_statistics_updated_at
    BEFORE UPDATE ON moderator_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- INITIAL DATA
-- =====================

-- Insert common spam keywords (Turkish & English)
INSERT INTO content_blacklist (keyword, category, severity) VALUES
    ('reklam', 'SPAM', 5),
    ('kazanç', 'SCAM', 6),
    ('kolay para', 'SCAM', 8),
    ('hızlı para', 'SCAM', 8),
    ('yatırım fırsatı', 'SCAM', 7),
    ('kripto fırsatı', 'SCAM', 7),
    ('bedava', 'SPAM', 3),
    ('ücretsiz hediye', 'SCAM', 6),
    ('tıkla kazan', 'SCAM', 9),
    ('free money', 'SCAM', 9),
    ('click here', 'SPAM', 4),
    ('easy money', 'SCAM', 8),
    ('investment opportunity', 'SCAM', 7),
    ('crypto opportunity', 'SCAM', 7),
    ('telegram grub', 'SPAM', 5),
    ('whatsapp grub', 'SPAM', 5);

-- =====================
-- VIEWS
-- =====================

-- Moderation Queue View (pending and escalated reports with priority)
CREATE VIEW v_moderation_queue AS
SELECT 
    cr.id,
    cr.reporter_id,
    cr.reported_user_id,
    cr.content_id,
    cr.content_type,
    cr.report_reason,
    cr.description,
    cr.status,
    cr.priority,
    cr.assigned_moderator_id,
    cr.moderation_score,
    cr.risk_level,
    cr.created_at,
    cr.assigned_at,
    report_count.total_reports_on_content,
    reporter.email as reporter_email,
    reported.email as reported_email
FROM content_reports cr
LEFT JOIN (
    SELECT content_id, content_type, COUNT(*) as total_reports_on_content
    FROM content_reports
    GROUP BY content_id, content_type
) report_count ON cr.content_id = report_count.content_id 
    AND cr.content_type = report_count.content_type
LEFT JOIN users reporter ON cr.reporter_id = reporter.id
LEFT JOIN users reported ON cr.reported_user_id = reported.id
WHERE cr.status IN ('PENDING', 'ESCALATED', 'UNDER_REVIEW')
ORDER BY 
    CASE cr.status 
        WHEN 'ESCALATED' THEN 0 
        WHEN 'PENDING' THEN 1 
        WHEN 'UNDER_REVIEW' THEN 2 
    END,
    cr.priority DESC,
    cr.created_at ASC;

-- Active Sanctions View
CREATE VIEW v_active_sanctions AS
SELECT 
    us.id,
    us.user_id,
    u.email as user_email,
    us.sanction_type,
    us.reason,
    us.description,
    us.start_date,
    us.end_date,
    us.applied_by,
    admin.email as applied_by_email,
    us.appealed_at,
    us.appeal_result,
    CASE 
        WHEN us.end_date IS NULL THEN NULL
        ELSE EXTRACT(EPOCH FROM (us.end_date - NOW())) / 86400 
    END as remaining_days
FROM user_sanctions us
JOIN users u ON us.user_id = u.id
LEFT JOIN users admin ON us.applied_by = admin.id
WHERE us.is_active = true
    AND (us.end_date IS NULL OR us.end_date > NOW());

-- Moderation Statistics Summary View
CREATE VIEW v_moderation_summary AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_reports,
    COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW') as under_review_reports,
    COUNT(*) FILTER (WHERE status = 'ESCALATED') as escalated_reports,
    COUNT(*) FILTER (WHERE status = 'RESOLVED' AND resolved_at > NOW() - INTERVAL '24 hours') as resolved_today,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) 
        FILTER (WHERE status = 'RESOLVED' AND resolved_at > NOW() - INTERVAL '7 days') 
        as avg_resolution_hours_7d
FROM content_reports;

COMMENT ON TABLE content_reports IS 'Stores user reports about content violations';
COMMENT ON TABLE user_sanctions IS 'Stores user sanctions (warnings, suspensions, bans)';
COMMENT ON TABLE moderation_actions IS 'Audit log for all moderation actions';
COMMENT ON TABLE content_blacklist IS 'Keywords for automated content filtering';
COMMENT ON TABLE moderator_statistics IS 'Daily performance statistics for moderators';
