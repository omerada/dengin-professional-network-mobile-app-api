package com.meslektas.verification.domain.model;

import com.meslektas.common.domain.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Verification Request ID (Value Object)
 * 
 * Unique identifier for verification requests.
 * Immutable, equality by value.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VerificationId implements ValueObject {
    
    @Column(name = "verification_id", nullable = false, unique = true)
    private UUID value;
    
    private VerificationId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Verification ID cannot be null");
        }
        this.value = value;
    }
    
    /**
     * Generate new verification ID
     */
    public static VerificationId generate() {
        return new VerificationId(UUID.randomUUID());
    }
    
    /**
     * Create from existing UUID
     */
    public static VerificationId of(UUID value) {
        return new VerificationId(value);
    }
    
    /**
     * Create from string UUID
     */
    public static VerificationId of(String value) {
        return new VerificationId(UUID.fromString(value));
    }
    
    @Override
    public String toString() {
        return value.toString();
    }
}
