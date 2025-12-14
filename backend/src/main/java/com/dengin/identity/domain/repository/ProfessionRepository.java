package com.dengin.identity.domain.repository;

import com.dengin.identity.domain.model.Profession;
import com.dengin.identity.domain.model.ProfessionCategory;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Profession Entity
 * 
 * DDD Pattern: Repository
 */
public interface ProfessionRepository {

    /**
     * Save profession
     */
    Profession save(Profession profession);

    /**
     * Find profession by ID
     */
    Optional<Profession> findById(Long id);

    /**
     * Find profession by name
     */
    Optional<Profession> findByName(String name);

    /**
     * Find all professions
     */
    List<Profession> findAll();

    /**
     * Find professions by category
     */
    List<Profession> findByCategory(ProfessionCategory category);

    /**
     * Find professions that require verification
     */
    List<Profession> findByRequiresVerification(Boolean requiresVerification);

    /**
     * Search professions by name (case-insensitive, partial match)
     */
    List<Profession> searchByName(String query);

    /**
     * Check if profession exists by name
     */
    boolean existsByName(String name);

    /**
     * Count professions
     */
    long count();

    /**
     * Delete profession
     */
    void delete(Profession profession);
}
