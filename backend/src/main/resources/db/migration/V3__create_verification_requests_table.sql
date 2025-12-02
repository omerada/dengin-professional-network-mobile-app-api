-- V3__create_verification_requests_table.sql
-- Sprint 3: Verification Context - AI-powered professional verification
-- Creates table for verification requests with embedded value objects

CREATE TABLE verification_requests (
    -- Primary key (auto-increment Long ID)
    id BIGSERIAL PRIMARY KEY,
    
    -- Business ID (UUID)
    verification_id UUID NOT NULL UNIQUE,
    
    -- User and profession
    user_id BIGINT NOT NULL,
    profession_id BIGINT NOT NULL,
    
    -- Status state machine
    status VARCHAR(50) NOT NULL,
    
    -- Document Image (Value Object)
    document_s3_key VARCHAR(500),
    document_file_name VARCHAR(255),
    document_content_type VARCHAR(100),
    document_file_size BIGINT,
    
    -- Selfie Image (Value Object)
    selfie_s3_key VARCHAR(500),
    selfie_file_name VARCHAR(255),
    selfie_content_type VARCHAR(100),
    selfie_file_size BIGINT,
    
    -- AI Verification Result (Value Object)
    face_similarity DOUBLE PRECISION,
    extracted_document_number VARCHAR(100),
    extracted_name VARCHAR(255),
    ai_confidence_score DOUBLE PRECISION,
    rekognition_raw_response TEXT,
    ai_error_message VARCHAR(500),
    
    -- Manual Review Result (Value Object)
    reviewed_by_admin_id BIGINT,
    manual_review_approved BOOLEAN,
    manual_review_notes TEXT,
    reviewed_at TIMESTAMP,
    
    -- Attempt tracking
    attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 3),
    
    -- Timestamps
    submitted_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Audit fields (from BaseEntity)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Foreign keys
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_verification_profession FOREIGN KEY (profession_id) REFERENCES professions(id),
    CONSTRAINT fk_verification_admin FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id)
);

-- Indexes for query performance
CREATE INDEX idx_verification_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_profession_id ON verification_requests(profession_id);
CREATE INDEX idx_verification_status ON verification_requests(status);
CREATE INDEX idx_verification_submitted_at ON verification_requests(submitted_at DESC);
CREATE INDEX idx_verification_expires_at ON verification_requests(expires_at) WHERE status NOT IN ('AUTO_APPROVED', 'AUTO_REJECTED', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE INDEX idx_verification_user_profession ON verification_requests(user_id, profession_id);

-- Partial index for pending manual reviews (admin dashboard)
CREATE INDEX idx_verification_manual_review ON verification_requests(submitted_at DESC) 
    WHERE status = 'PENDING_MANUAL_REVIEW';

-- Comments
COMMENT ON TABLE verification_requests IS 'Professional verification requests with AI processing and manual review';
COMMENT ON COLUMN verification_requests.verification_id IS 'UUID business identifier';
COMMENT ON COLUMN verification_requests.status IS 'PENDING, AI_PROCESSING, AUTO_APPROVED, AUTO_REJECTED, PENDING_MANUAL_REVIEW, APPROVED, REJECTED, EXPIRED';
COMMENT ON COLUMN verification_requests.face_similarity IS 'AWS Rekognition face comparison similarity (0-100%)';
COMMENT ON COLUMN verification_requests.ai_confidence_score IS 'Overall AI confidence (0-100%): >=85% auto-approve, 60-84% manual review, <60% auto-reject';
COMMENT ON COLUMN verification_requests.attempt_number IS 'Attempt number (1-3), enforces max 3 attempts rule';
COMMENT ON COLUMN verification_requests.expires_at IS 'Request expires after 7 days if not processed';
