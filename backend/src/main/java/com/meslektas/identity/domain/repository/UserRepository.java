package com.meslektas.identity.domain.repository;

import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for User Aggregate
 * 
 * DDD Pattern: Repository (defined in domain, implemented in infrastructure)
 * 
 * This interface belongs to the domain layer and defines
 * aggregate-oriented persistence operations.
 */
public interface UserRepository {

    /**
     * Save user (insert or update)
     */
    User save(User user);

    /**
     * Find user by ID (Long - database auto-increment)
     */
    Optional<User> findById(Long id);
    
    /**
     * Find user by UUID (id field in entity)
     */
    Optional<User> findByIdUUID(UUID id);

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by OAuth provider and provider ID
     */
    Optional<User> findByOAuthProviderAndOAuthProviderId(String provider, String providerId);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find all users with specific status
     */
    List<User> findByStatus(UserStatus status);

    /**
     * Find all active users with verified profession
     */
    Page<User> findByStatusAndIsProfessionVerified(
            UserStatus status,
            Boolean isVerified,
            Pageable pageable
    );

    /**
     * Find users by profession ID
     */
    Page<User> findByProfessionId(Long professionId, Pageable pageable);

    /**
     * Delete user (hard delete - use sparingly!)
     */
    void delete(User user);

    /**
     * Count users by status
     */
    long countByStatus(UserStatus status);

    /**
     * Count verified users
     */
    long countByIsProfessionVerified(Boolean isVerified);
}
