package com.dengin.identity.infrastructure.persistence;

import com.dengin.identity.domain.model.Sector;
import com.dengin.identity.domain.repository.SectorRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Implementation of SectorRepository
 * 
 * Spring Data JPA automatically implements basic CRUD operations.
 * Custom queries are defined using @Query annotation.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Repository
public interface JpaSectorRepository extends JpaRepository<Sector, Long>, SectorRepository {

    @Override
    Optional<Sector> findByCode(String code);

    @Override
    @Query("SELECT s FROM Sector s WHERE s.isActive = true ORDER BY s.displayOrder ASC")
    List<Sector> findAllActive();

    @Override
    boolean existsByCode(String code);

    @Override
    @Query("SELECT COUNT(s) FROM Sector s WHERE s.isActive = true")
    long countActive();

    @Override
    @Query("SELECT COUNT(u) FROM User u WHERE u.sector.id = :sectorId")
    long countUsersBySector(@Param("sectorId") Long sectorId);

    /**
     * Find sectors by name (case-insensitive search)
     * Useful for admin search functionality
     * 
     * @param name sector name
     * @return list of matching sectors
     */
    @Query("SELECT s FROM Sector s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Sector> searchByName(@Param("name") String name);

    /**
     * Find sectors ordered by member count
     * Popular sectors first
     * 
     * @param limit maximum results
     * @return list of sectors with most members
     */
    @Query("""
        SELECT s FROM Sector s
        WHERE s.isActive = true
        ORDER BY (SELECT COUNT(u) FROM User u WHERE u.sector = s) DESC
        """)
    List<Sector> findMostPopular(Pageable pageable);

    @Override
    default List<Sector> findMostPopular(int limit) {
        return findMostPopular(Pageable.ofSize(limit));
    }
}
