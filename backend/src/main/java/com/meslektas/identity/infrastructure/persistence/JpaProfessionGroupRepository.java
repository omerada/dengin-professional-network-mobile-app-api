package com.meslektas.identity.infrastructure.persistence;

import com.meslektas.identity.domain.model.ProfessionGroup;
import com.meslektas.identity.domain.model.Sector;
import com.meslektas.identity.domain.repository.ProfessionGroupRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Implementation of ProfessionGroupRepository
 * 
 * Spring Data JPA automatically implements basic CRUD operations.
 * Custom queries for sector-based filtering and search.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Repository
public interface JpaProfessionGroupRepository extends JpaRepository<ProfessionGroup, Long>, ProfessionGroupRepository {

    @Override
    @Query("SELECT pg FROM ProfessionGroup pg WHERE pg.sector = :sector ORDER BY pg.displayOrder ASC")
    List<ProfessionGroup> findBySector(@Param("sector") Sector sector);

    @Override
    @Query("SELECT pg FROM ProfessionGroup pg WHERE pg.sector.id = :sectorId ORDER BY pg.displayOrder ASC")
    List<ProfessionGroup> findBySectorId(@Param("sectorId") Long sectorId);

    @Override
    @Query("SELECT pg FROM ProfessionGroup pg WHERE pg.sector.id = :sectorId AND pg.isActive = true ORDER BY pg.displayOrder ASC")
    List<ProfessionGroup> findActiveBySectorId(@Param("sectorId") Long sectorId);

    @Override
    @Query("SELECT pg FROM ProfessionGroup pg WHERE pg.requiresVerification = :requiresVerification")
    List<ProfessionGroup> findByRequiresVerification(@Param("requiresVerification") Boolean requiresVerification);

    @Override
    @Query("SELECT pg FROM ProfessionGroup pg WHERE LOWER(pg.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ProfessionGroup> searchByName(@Param("query") String query);

    @Override
    @Query("""
        SELECT pg FROM ProfessionGroup pg
        WHERE pg.sector.id = :sectorId
        AND LOWER(pg.name) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY pg.displayOrder ASC
        """)
    List<ProfessionGroup> searchByNameInSector(
            @Param("sectorId") Long sectorId,
            @Param("query") String query);

    @Override
    @Query("SELECT CASE WHEN COUNT(pg) > 0 THEN true ELSE false END FROM ProfessionGroup pg WHERE pg.sector.id = :sectorId AND pg.name = :name")
    boolean existsBySectorIdAndName(
            @Param("sectorId") Long sectorId,
            @Param("name") String name);

    @Override
    @Query("SELECT COUNT(pg) FROM ProfessionGroup pg WHERE pg.sector.id = :sectorId")
    long countBySector(@Param("sectorId") Long sectorId);

    @Override
    @Query("SELECT COUNT(pg) FROM ProfessionGroup pg WHERE pg.requiresVerification = true")
    long countRequiringVerification();

    /**
     * Find profession groups with member counts
     * Useful for displaying popularity
     * 
     * @param sectorId sector ID
     * @return list of profession groups (Hibernate will fetch eagerly for count queries)
     */
    @Query("""
        SELECT pg FROM ProfessionGroup pg
        WHERE pg.sector.id = :sectorId
        AND pg.isActive = true
        ORDER BY pg.displayOrder ASC
        """)
    List<ProfessionGroup> findBySectorIdWithMemberCounts(@Param("sectorId") Long sectorId);

    /**
     * Find most popular profession groups in sector
     * Based on number of users
     * 
     * @param sectorId sector ID
     * @param limit maximum results
     * @return list of popular profession groups
     */
    @Query("""
        SELECT pg FROM ProfessionGroup pg
        WHERE pg.sector.id = :sectorId
        AND pg.isActive = true
        ORDER BY pg.displayOrder ASC
        """)
    List<ProfessionGroup> findMostPopularInSector(
            @Param("sectorId") Long sectorId,
            @Param("limit") int limit);
}
