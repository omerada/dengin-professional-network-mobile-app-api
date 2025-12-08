package com.meslektas.identity.infrastructure.persistence;

import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.model.UserStatus;
import com.meslektas.identity.domain.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA Implementation of UserRepository
 * 
 * Spring Data JPA automatically implements this interface.
 * Additional custom queries can be added here.
 */
@Repository
public interface JpaUserRepository extends JpaRepository<User, Long>, UserRepository {

    @Override
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by UUID (id field)
     * 
     * Note: Spring Data JPA automatically generates this query.
     * The method name follows naming convention: findBy + PropertyName
     */
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdUUID(@Param("id") UUID id);

    @Override
    @Query("SELECT u FROM User u WHERE u.oauthProvider = :provider AND u.oauthProviderId = :providerId")
    Optional<User> findByOAuthProviderAndOAuthProviderId(
            @Param("provider") String provider,
            @Param("providerId") String providerId
    );

    @Override
    boolean existsByEmail(String email);

    @Override
    List<User> findByStatus(UserStatus status);

    @Override
    Page<User> findByStatusAndIsProfessionVerified(
            UserStatus status,
            Boolean isVerified,
            Pageable pageable
    );

    @Override
    @Query("SELECT u FROM User u WHERE u.profession.id = :professionId")
    Page<User> findByProfessionId(@Param("professionId") Long professionId, Pageable pageable);

    @Override
    long countByStatus(UserStatus status);

    @Override
    long countByIsProfessionVerified(Boolean isVerified);

    /**
     * Custom query: Find users who need to complete their profile
     */
    @Query("SELECT u FROM User u WHERE u.isProfileComplete = false AND u.status = 'ACTIVE'")
    List<User> findUsersWithIncompleteProfile();

    /**
     * Custom query: Find users who registered recently (last N days)
     */
    @Query("SELECT u FROM User u WHERE u.createdAt >= CURRENT_TIMESTAMP - :days DAY")
    List<User> findRecentUsers(@Param("days") int days);
    
    /**
     * Count users who logged in after a specific time
     */
    @Override
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLoginAt >= :dateTime")
    long countByLastLoginAfter(@Param("dateTime") LocalDateTime dateTime);
    
    /**
     * Search users by name, surname or full name (case-insensitive)
     * Only returns active users
     * 
     * @param query Search query
     * @param pageable Pagination info
     * @return Page of matching users
     */
    @Override
    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE' AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.surname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.name, ' ', u.surname)) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchByNameContaining(@Param("query") String query, Pageable pageable);
    
    /**
     * Find active users not in excluded list
     * Used for user suggestions - returns up to 100 candidates
     * 
     * @param excludedIds List of user IDs to exclude
     * @return List of active users not in excluded list
     */
    @Override
    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE' AND u.id NOT IN :excludedIds ORDER BY RAND()")
    List<User> findActiveUsersNotIn(@Param("excludedIds") List<Long> excludedIds);
}
