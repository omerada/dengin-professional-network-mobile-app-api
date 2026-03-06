package com.dengin.identity.domain.model;

/**
 * User Status Enum
 * 
 * Business Rules:
 * - ACTIVE: Normal user, full access
 * - SUSPENDED: Temporary ban, limited access
 * - BANNED: Permanent ban, no access
 * - DELETED: Soft deleted, no access
 */
public enum UserStatus {
    ACTIVE,
    SUSPENDED,
    BANNED,
    DELETED
}
