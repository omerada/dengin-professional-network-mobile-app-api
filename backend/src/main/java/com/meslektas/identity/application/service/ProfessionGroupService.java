package com.meslektas.identity.application.service;

import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.identity.application.dto.response.ProfessionGroupResponse;
import com.meslektas.identity.application.mapper.ProfessionGroupMapper;
import com.meslektas.identity.domain.model.ProfessionGroup;
import com.meslektas.identity.domain.repository.ProfessionGroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Profession Group Management Application Service
 * 
 * DDD Pattern: Application Service
 * Orchestrates domain logic for profession groups within sectors
 * 
 * Responsibilities:
 * - Profession group queries
 * - Sector-based filtering
 * - Search operations
 * - Caching for performance
 * 
 * Business Rules:
 * - Only active profession groups shown to users
 * - Groups ordered by displayOrder
 * - Member counts included in responses
 * 
 * @since Sprint 3 - Profession group management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfessionGroupService {

    private final ProfessionGroupRepository professionGroupRepository;
    private final ProfessionGroupMapper professionGroupMapper;

    /**
     * Get all active profession groups in a sector
     * 
     * Cached for 10 minutes - profession groups rarely change
     * 
     * @param sectorId sector ID
     * @return list of active profession groups ordered by display order
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "professionGroups", key = "'sector:' + #sectorId")
    public List<ProfessionGroupResponse> getActiveBySectorId(Long sectorId) {
        log.info("Fetching active profession groups for sector: {}", sectorId);
        
        List<ProfessionGroup> groups = professionGroupRepository.findActiveBySectorId(sectorId);
        
        log.debug("Found {} active profession groups in sector {}", groups.size(), sectorId);
        
        return groups.stream()
                .map(professionGroupMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get profession group by ID
     * 
     * @param id profession group ID
     * @return profession group response
     * @throws ResourceNotFoundException if profession group not found
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "professionGroups", key = "#id")
    public ProfessionGroupResponse getById(Long id) {
        log.info("Fetching profession group by id: {}", id);
        
        ProfessionGroup group = professionGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProfessionGroup", id));
        
        return professionGroupMapper.toResponse(group);
    }

    /**
     * Search profession groups within a sector
     * Case-insensitive partial match
     * 
     * @param sectorId sector ID
     * @param query search query
     * @return list of matching profession groups
     */
    @Transactional(readOnly = true)
    public List<ProfessionGroupResponse> searchInSector(Long sectorId, String query) {
        log.info("Searching profession groups in sector {} with query: {}", sectorId, query);
        
        if (query == null || query.isBlank()) {
            return getActiveBySectorId(sectorId);
        }
        
        List<ProfessionGroup> groups = professionGroupRepository.searchByNameInSector(sectorId, query);
        
        return groups.stream()
                .filter(ProfessionGroup::isAvailable)
                .map(professionGroupMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Check if profession group exists in sector
     * 
     * @param sectorId sector ID
     * @param name profession group name
     * @return true if exists
     */
    @Transactional(readOnly = true)
    public boolean existsInSector(Long sectorId, String name) {
        return professionGroupRepository.existsBySectorIdAndName(sectorId, name);
    }

    /**
     * Count profession groups in sector
     * 
     * @param sectorId sector ID
     * @return number of profession groups
     */
    @Transactional(readOnly = true)
    public long countBySector(Long sectorId) {
        return professionGroupRepository.countBySector(sectorId);
    }
}
