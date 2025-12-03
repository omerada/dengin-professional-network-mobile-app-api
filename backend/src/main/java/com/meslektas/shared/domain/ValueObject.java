package com.meslektas.shared.domain;

import java.io.Serializable;

/**
 * Marker interface for Value Objects in DDD
 * 
 * Value Objects are:
 * - Immutable
 * - Defined by their attributes (equality by value)
 * - Have no identity
 * - Side-effect free
 * 
 * Examples:
 * - Email, Password, FullName, PhoneNumber
 * - Money, Address, DateRange
 * - VerificationResult, FaceComparisonResult
 */
public interface ValueObject extends Serializable {
    // Marker interface
    
    /**
     * Value Objects should have proper equals/hashCode
     * based on all their attributes
     */
}
