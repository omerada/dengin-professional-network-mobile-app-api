package com.meslektas.notification.infrastructure.push;

import com.meslektas.notification.domain.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for device token management
 */
@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
    
    /**
     * Find all active tokens for a user
     */
    List<DeviceToken> findByUserIdAndActiveTrue(Long userId);
    
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
    List<DeviceToken> findActiveByUserIds(@Param("userIds") List<Long> userIds);
    
    /**
     * Deactivate all tokens for a user
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now WHERE dt.userId = :userId")
    int deactivateAllForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    /**
     * Deactivate specific token
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now WHERE dt.token = :token")
    int deactivateByToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    /**
     * Deactivate tokens that haven't been used in specified days
     */
    @Modifying
    @Query("UPDATE DeviceToken dt SET dt.active = false, dt.updatedAt = :now " +
           "WHERE dt.active = true AND dt.lastUsedAt < :cutoffDate")
    int deactivateInactiveTokens(@Param("cutoffDate") LocalDateTime cutoffDate, @Param("now") LocalDateTime now);
    
    /**
     * Count active tokens for a user
     */
    long countByUserIdAndActiveTrue(Long userId);
    
    /**
     * Delete old inactive tokens
     */
    @Modifying
    @Query("DELETE FROM DeviceToken dt WHERE dt.active = false AND dt.updatedAt < :cutoffDate")
    int deleteOldInactiveTokens(@Param("cutoffDate") LocalDateTime cutoffDate);
}
