package com.meslektas.identity.application.service;

import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.identity.application.dto.response.SectorResponse;
import com.meslektas.identity.application.dto.response.SectorStatsResponse;
import com.meslektas.identity.application.mapper.SectorMapper;
import com.meslektas.identity.domain.model.Sector;
import com.meslektas.identity.domain.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Sector Management Application Service
 * 
 * DDD Pattern: Application Service
 * Orchestrates domain logic and cross-cutting concerns (caching, transactions)
 * 
 * Responsibilities:
 * - Sector queries and retrieval
 * - Search and filtering
 * - Statistics and analytics
 * - Caching for performance
 * 
 * Business Rules:
 * - Only active sectors shown to users
 * - Sectors ordered by displayOrder
 * - Member counts included in responses
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SectorService {

    private final SectorRepository sectorRepository;
    private final SectorMapper sectorMapper;

    /**
     * Get all active sectors for onboarding
     * 
     * Cached for 10 minutes as sectors rarely change
     * Cache key: "sectors:active"
     * 
     * @return list of active sectors ordered by display order
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "sectors", key = "'active'", unless = "#result.isEmpty()")
    public List<SectorResponse> getAllActiveSectors() {
        log.info("Fetching all active sectors");
        
        List<Sector> sectors = sectorRepository.findAllActive();
        
        log.debug("Found {} active sectors", sectors.size());
        
        return sectors.stream()
                .map(this::toResponseWithMemberCount)
                .collect(Collectors.toList());
    }

    /**
     * Get all sectors (including inactive)
     * Admin only - for management purposes
     * 
     * @return list of all sectors
     */
    @Transactional(readOnly = true)
    public List<SectorResponse> getAllSectors() {
        log.info("Fetching all sectors (including inactive)");
        
        List<Sector> sectors = sectorRepository.findAll();
        
        return sectors.stream()
                .sorted((a, b) -> a.getDisplayOrder().compareTo(b.getDisplayOrder()))
                .map(this::toResponseWithMemberCount)
                .collect(Collectors.toList());
    }

    /**
     * Get sector by ID
     * 
     * @param id sector ID
     * @return sector response with member count
     * @throws ResourceNotFoundException if sector not found
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "sectors", key = "#id")
    public SectorResponse getSectorById(Long id) {
        log.info("Fetching sector by id: {}", id);
        
        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sector", id));
        
        return toResponseWithMemberCount(sector);
    }

    /**
     * Get sector by code
     * 
     * @param code sector code (e.g., MEDICAL, LEGAL)
     * @return sector response with member count
     * @throws ResourceNotFoundException if sector not found
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "sectors", key = "'code:' + #code")
    public SectorResponse getSectorByCode(String code) {
        log.info("Fetching sector by code: {}", code);
        
        String upperCode = code != null ? code.toUpperCase(Locale.ENGLISH) : null;
        
        Sector sector = sectorRepository.findByCode(upperCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Sector code '%s' bulunamad\u0131", upperCode)));
        
        return toResponseWithMemberCount(sector);
    }

    /**
     * Search sectors by name
     * Case-insensitive partial match
     * 
     * @param query search query
     * @return list of matching sectors
     */
    @Transactional(readOnly = true)
    public List<SectorResponse> searchSectors(String query) {
        log.info("Searching sectors with query: {}", query);
        
        if (query == null || query.isBlank()) {
            return getAllActiveSectors();
        }
        
        List<Sector> sectors = sectorRepository.searchByName(query);
        
        return sectors.stream()
                .filter(Sector::isAvailable)
                .map(this::toResponseWithMemberCount)
                .collect(Collectors.toList());
    }

    /**
     * Get sector statistics
     * 
     * Provides overview of sector system:
     * - Total sectors
     * - Active sectors
     * - Total users across all sectors
     * 
     * @return sector statistics
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "sectors", key = "'stats'")
    public SectorStatsResponse getStatistics() {
        log.info("Fetching sector statistics");
        
        long totalSectors = sectorRepository.count();
        long activeSectors = sectorRepository.countActive();
        
        log.debug("Statistics: total={}, active={}", totalSectors, activeSectors);
        
        return SectorStatsResponse.builder()
                .totalSectors(totalSectors)
                .activeSectors(activeSectors)
                .build();
    }

    /**
     * Get most popular sectors
     * Ordered by member count descending
     * 
     * @param limit maximum results (default 10)
     * @return list of popular sectors
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "sectors", key = "'popular:' + #limit")
    public List<SectorResponse> getMostPopular(int limit) {
        log.info("Fetching {} most popular sectors", limit);
        
        if (limit <= 0) {
            limit = 10;
        }
        
        List<Sector> sectors = sectorRepository.findMostPopular(limit);
        
        return sectors.stream()
                .map(this::toResponseWithMemberCount)
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Check if sector exists by code
     * 
     * @param code sector code
     * @return true if exists
     */
    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        String upperCode = code != null ? code.toUpperCase(Locale.ENGLISH) : null;
        return sectorRepository.existsByCode(upperCode);
    }

    // =====================================================
    // Private Helper Methods
    // =====================================================

    /**
     * Convert Sector entity to SectorResponse with member count
     * 
     * @param sector the sector entity
     * @return sector response DTO
     */
    private SectorResponse toResponseWithMemberCount(Sector sector) {
        long memberCount = sectorRepository.countUsersBySector(sector.getId());
        return sectorMapper.toResponse(sector, memberCount);
    }
}
