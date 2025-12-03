package com.meslektas.notification.infrastructure.push;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for device token management
 */
@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {
    
    /**
     * Find all active tokens for a user
     */
    List<DeviceToken> findByUserIdAndActiveTrue(UUID userId);
    
    /**
     * Find token by token string
     */
    Optional<DeviceToken> findByToken(String token);
    
    /**
     * Check if token exists
     */
    boolean existsByToken(String token);
    
    /**
     * Find all active tokens for multiple users
     */
    @Query("SELECT dt FROM DeviceToken dt WHERE dt.userId IN :userIds AND dt.active = true")
    List<DeviceToken> findActiveByUserIds(@Param("userIds") List<UUID> userIds);
    
    /**
     * Deactivate all tokens for a user
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now WHERE dt.userId = :userId")
    int deactivateAllForUser(@Param("userId") UUID userId, @Param("now") Instant now);
    
    /**
     * Deactivate specific token
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now WHERE dt.token = :token")
    int deactivateByToken(@Param("token") String token, @Param("now") Instant now);
    
    /**
     * Deactivate tokens that haven't been used in specified days
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now " +
           "WHERE dt.active = true AND dt.lastUsedAt < :cutoffDate")
    int deactivateInactiveTokens(@Param("cutoffDate") Instant cutoffDate, @Param("now") Instant now);
    
    /**
     * Count active tokens for a user
     */
    long countByUserIdAndActiveTrue(UUID userId);
    
    /**
     * Delete old inactive tokens
     */
    @Modifying
    @Query("DELETE FROM DeviceToken dt WHERE dt.active = false AND dt.updatedAt < :cutoffDate")
    int deleteOldInactiveTokens(@Param("cutoffDate") Instant cutoffDate);
}
