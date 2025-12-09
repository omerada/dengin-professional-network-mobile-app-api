package com.meslektas.identity.domain.repository;

import com.meslektas.identity.domain.model.ProfessionGroup;
import com.meslektas.identity.domain.model.Sector;

import java.util.List;
import java.util.Optional;

/**
 * ProfessionGroup Repository Interface (Domain Layer)
 * 
 * DDD Pattern: Repository interface in domain layer
 * Implementation in infrastructure layer (JPA)
 * 
 * Provides profession group persistence and query operations.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
public interface ProfessionGroupRepository {

    /**
     * Save or update a profession group
     * 
     * @param professionGroup the profession group to save
     * @return saved profession group with generated ID
     */
    ProfessionGroup save(ProfessionGroup professionGroup);

    /**
     * Find profession group by ID
     * 
     * @param id profession group ID
     * @return optional profession group
     */
    Optional<ProfessionGroup> findById(Long id);

    /**
     * Find all profession groups in a sector
     * Ordered by display order
     * 
     * @param sector the sector
     * @return list of profession groups
     */
    List<ProfessionGroup> findBySector(Sector sector);

    /**
     * Find all profession groups in a sector by ID
     * Ordered by display order
     * 
     * @param sectorId sector ID
     * @return list of profession groups
     */
    List<ProfessionGroup> findBySectorId(Long sectorId);

    /**
     * Find active profession groups in a sector
     * Only returns groups where isActive = true
     * 
     * @param sectorId sector ID
     * @return list of active profession groups
     */
    List<ProfessionGroup> findActiveBySectorId(Long sectorId);

    /**
     * Find profession groups by verification requirement
     * 
     * @param requiresVerification whether verification is required
     * @return list of profession groups
     */
    List<ProfessionGroup> findByRequiresVerification(Boolean requiresVerification);

    /**
     * Search profession groups by name
     * Case-insensitive partial match
     * 
     * @param query search query
     * @return list of matching profession groups
     */
    List<ProfessionGroup> searchByName(String query);

    /**
     * Search profession groups by name within a sector
     * 
     * @param sectorId sector ID
     * @param query search query
     * @return list of matching profession groups
     */
    List<ProfessionGroup> searchByNameInSector(Long sectorId, String query);

    /**
     * Check if profession group exists by name in sector
     * Used to prevent duplicates
     * 
     * @param sectorId sector ID
     * @param name profession group name
     * @return true if exists
     */
    boolean existsBySectorIdAndName(Long sectorId, String name);

    /**
     * Find all profession groups
     * Includes both active and inactive
     * 
     * @return list of all profession groups
     */
    List<ProfessionGroup> findAll();

    /**
     * Delete profession group by ID
     * Should validate no users are members
     * 
     * @param id profession group ID
     */
    void deleteById(Long id);

    /**
     * Count profession groups in sector
     * 
     * @param sectorId sector ID
     * @return number of profession groups
     */
    long countBySector(Long sectorId);

    /**
     * Count profession groups requiring verification
     * 
     * @return number of profession groups requiring verification
     */
    long countRequiringVerification();
}
