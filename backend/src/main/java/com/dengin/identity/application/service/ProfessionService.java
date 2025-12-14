package com.dengin.identity.application.service;

import com.dengin.common.exception.ResourceNotFoundException;
import com.dengin.identity.application.dto.response.ProfessionResponse;
import com.dengin.identity.application.mapper.ProfessionMapper;
import com.dengin.identity.domain.model.Profession;
import com.dengin.identity.domain.model.ProfessionCategory;
import com.dengin.identity.domain.repository.ProfessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Profession Management Application Service
 * 
 * DDD Pattern: Application Service
 * 
 * Responsibilities:
 * - Profession queries
 * - Search and filtering
 * - Category management
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfessionService {

    private final ProfessionRepository professionRepository;
    private final ProfessionMapper professionMapper;

    /**
     * Get all professions
     */
    @Transactional(readOnly = true)
    public List<ProfessionResponse> getAllProfessions() {
        log.info("Fetching all professions");

        List<Profession> professions = professionRepository.findAll();

        return professions.stream()
                .map(professionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get profession by ID
     */
    @Transactional(readOnly = true)
    public ProfessionResponse getProfessionById(Long id) {
        log.info("Fetching profession: {}", id);

        Profession profession = professionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profession", id));

        return professionMapper.toResponse(profession);
    }

    /**
     * Get professions by category
     */
    @Transactional(readOnly = true)
    public List<ProfessionResponse> getProfessionsByCategory(ProfessionCategory category) {
        log.info("Fetching professions by category: {}", category);

        List<Profession> professions = professionRepository.findByCategory(category);

        return professions.stream()
                .map(professionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get professions that require verification
     */
    @Transactional(readOnly = true)
    public List<ProfessionResponse> getVerificationRequiredProfessions() {
        log.info("Fetching professions that require verification");

        List<Profession> professions = professionRepository.findByRequiresVerification(true);

        return professions.stream()
                .map(professionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search professions by name
     * 
     * Case-insensitive partial match
     */
    @Transactional(readOnly = true)
    public List<ProfessionResponse> searchProfessions(String query) {
        log.info("Searching professions with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return getAllProfessions();
        }

        List<Profession> professions = professionRepository.searchByName(query.trim());

        return professions.stream()
                .map(professionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get profession statistics
     */
    @Transactional(readOnly = true)
    public ProfessionStatsResponse getStatistics() {
        log.info("Fetching profession statistics");

        long totalProfessions = professionRepository.count();
        long verificationRequired = professionRepository.findByRequiresVerification(true).size();
        long optionalVerification = professionRepository.findByRequiresVerification(false).size();

        return new ProfessionStatsResponse(
                totalProfessions,
                verificationRequired,
                optionalVerification
        );
    }

    /**
     * Get profession name by ID
     * Returns null if profession not found
     * Used by other bounded contexts
     */
    @Transactional(readOnly = true)
    public String getProfessionNameById(Long professionId) {
        if (professionId == null) {
            return null;
        }
        return professionRepository.findById(professionId)
                .map(Profession::getName)
                .orElse(null);
    }

    /**
     * Inner DTO for statistics
     */
    public record ProfessionStatsResponse(
            long totalProfessions,
            long verificationRequired,
            long optionalVerification
    ) {
    }
}
