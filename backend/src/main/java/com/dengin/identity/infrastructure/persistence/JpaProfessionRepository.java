package com.dengin.identity.infrastructure.persistence;

import com.dengin.identity.domain.model.Profession;
import com.dengin.identity.domain.model.ProfessionCategory;
import com.dengin.identity.domain.repository.ProfessionRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Implementation of ProfessionRepository
 */
@Repository
public interface JpaProfessionRepository extends JpaRepository<Profession, Long>, ProfessionRepository {

    @Override
    Optional<Profession> findByName(String name);

    @Override
    List<Profession> findByCategory(ProfessionCategory category);

    @Override
    List<Profession> findByRequiresVerification(Boolean requiresVerification);

    @Override
    @Query("SELECT p FROM Profession p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Profession> searchByName(@Param("query") String query);

    @Override
    boolean existsByName(String name);

    /**
     * Custom query: Full-text search using PostgreSQL tsvector
     */
    @Query(value = "SELECT * FROM professions WHERE search_vector @@ to_tsquery('turkish', :query)", 
           nativeQuery = true)
    List<Profession> fullTextSearch(@Param("query") String query);
}
