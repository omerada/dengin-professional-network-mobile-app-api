package com.dengin.common.domain;

import java.io.Serializable;

/**
 * Marker interface for Value Objects in DDD.
 * 
 * Value Objects:
 * - Immutable
 * - No identity (equality based on attributes)
 * - Side-effect free methods
 * 
 * Pattern: Value Object (DDD)
 */
public interface ValueObject extends Serializable {
}
