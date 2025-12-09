package com.meslektas.identity.domain.repository;

import com.meslektas.identity.domain.model.Sector;

import java.util.List;
import java.util.Optional;

/**
 * Sector Repository Interface (Domain Layer)
 * 
 * DDD Pattern: Repository interface in domain layer
 * Implementation in infrastructure layer (JPA)
 * 
 * Provides sector persistence and query operations.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
public interface SectorRepository {

    /**
     * Save or update a sector
     * 
     * @param sector the sector to save
     * @return saved sector with generated ID
     */
    Sector save(Sector sector);

    /**
     * Find sector by ID
     * 
     * @param id sector ID
     * @return optional sector
     */
    Optional<Sector> findById(Long id);

    /**
     * Find sector by code
     * Code is unique across all sectors
     * 
     * @param code sector code (e.g., MEDICAL, LEGAL)
     * @return optional sector
     */
    Optional<Sector> findByCode(String code);

    /**
     * Find all sectors
     * Includes both active and inactive sectors
     * 
     * @return list of all sectors
     */
    List<Sector> findAll();

    /**
     * Find all active sectors
     * Only returns sectors where isActive = true
     * Sorted by display order
     * 
     * @return list of active sectors
     */
    List<Sector> findAllActive();

    /**
     * Check if sector exists by code
     * 
     * @param code sector code
     * @return true if sector exists
     */
    boolean existsByCode(String code);

    /**
     * Delete sector by ID
     * Should validate no users/posts reference this sector
     * 
     * @param id sector ID
     */
    void deleteById(Long id);

    /**
     * Count total sectors
     * 
     * @return total number of sectors
     */
    long count();

    /**
     * Count active sectors
     * 
     * @return number of active sectors
     */
    long countActive();

    /**
     * Count users in sector
     * 
     * @param sectorId sector ID
     * @return number of users in this sector
     */
    long countUsersBySector(Long sectorId);

    /**
     * Search sectors by name (case-insensitive partial match)
     * 
     * @param query search query
     * @return matching sectors
     */
    List<Sector> searchByName(String query);

    /**
     * Find most popular sectors by user count
     * 
     * @param limit maximum results
     * @return sectors ordered by user count descending
     */
    List<Sector> findMostPopular(int limit);
}
