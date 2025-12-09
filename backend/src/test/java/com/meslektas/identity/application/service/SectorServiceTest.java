package com.meslektas.identity.application.service;

import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.identity.application.dto.response.SectorResponse;
import com.meslektas.identity.application.dto.response.SectorStatsResponse;
import com.meslektas.identity.application.mapper.SectorMapper;
import com.meslektas.identity.domain.model.Sector;
import com.meslektas.identity.domain.repository.SectorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Tests for SectorService
 * 
 * Tests application service logic with mocked dependencies.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("SectorService Tests")
class SectorServiceTest {

    @Mock
    private SectorRepository sectorRepository;

    @Mock
    private SectorMapper sectorMapper;

    @InjectMocks
    private SectorService sectorService;

    private Sector medicalSector;
    private Sector legalSector;

    @BeforeEach
    void setUp() {
        medicalSector = Sector.create("MEDICAL", "Sağlık");
        legalSector = Sector.create("LEGAL", "Hukuk");
    }

    @Test
    @DisplayName("Should return all active sectors")
    void shouldReturnAllActiveSectors() {
        // Given
        List<Sector> sectors = Arrays.asList(medicalSector, legalSector);
        when(sectorRepository.findAllActive()).thenReturn(sectors);
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response1 = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        SectorResponse response2 = new SectorResponse(2L, "LEGAL", "Hukuk", null, null, 2, true, 50L);
        
        when(sectorMapper.toResponse(eq(medicalSector), anyLong())).thenReturn(response1);
        when(sectorMapper.toResponse(eq(legalSector), anyLong())).thenReturn(response2);

        // When
        List<SectorResponse> result = sectorService.getAllActiveSectors();

        // Then
        assertThat(result).hasSize(2);
        verify(sectorRepository).findAllActive();
    }

    @Test
    @DisplayName("Should return sector by ID")
    void shouldReturnSectorById() {
        // Given
        Long sectorId = 1L;
        when(sectorRepository.findById(sectorId)).thenReturn(Optional.of(medicalSector));
        when(sectorRepository.countUsersBySector(sectorId)).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(eq(medicalSector), anyLong())).thenReturn(response);

        // When
        SectorResponse result = sectorService.getSectorById(sectorId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.code()).isEqualTo("MEDICAL");
        verify(sectorRepository).findById(sectorId);
    }

    @Test
    @DisplayName("Should throw exception when sector not found by ID")
    void shouldThrowExceptionWhenSectorNotFound() {
        // Given
        Long sectorId = 999L;
        when(sectorRepository.findById(sectorId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> sectorService.getSectorById(sectorId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should return sector by code")
    void shouldReturnSectorByCode() {
        // Given
        String code = "MEDICAL";
        when(sectorRepository.findByCode(code)).thenReturn(Optional.of(medicalSector));
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(eq(medicalSector), anyLong())).thenReturn(response);

        // When
        SectorResponse result = sectorService.getSectorByCode(code);

        // Then
        assertThat(result).isNotNull();
        verify(sectorRepository).findByCode(code);
    }

    @Test
    @DisplayName("Should uppercase code before searching")
    void shouldUppercaseCodeBeforeSearching() {
        // Given
        String code = "medical";
        String upperCode = "MEDICAL";
        when(sectorRepository.findByCode(upperCode)).thenReturn(Optional.of(medicalSector));
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, upperCode, "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(eq(medicalSector), anyLong())).thenReturn(response);

        // When
        SectorResponse result = sectorService.getSectorByCode(code);

        // Then
        assertThat(result).isNotNull();
        verify(sectorRepository).findByCode(upperCode);
    }

    @Test
    @DisplayName("Should search sectors by name")
    void shouldSearchSectorsByName() {
        // Given
        String query = "sağ";
        when(sectorRepository.searchByName(query)).thenReturn(List.of(medicalSector));
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(any(), anyLong())).thenReturn(response);

        // When
        List<SectorResponse> result = sectorService.searchSectors(query);

        // Then
        assertThat(result).hasSize(1);
        verify(sectorRepository).searchByName(query);
    }

    @Test
    @DisplayName("Should return all active sectors when query is empty")
    void shouldReturnAllWhenQueryIsEmpty() {
        // Given
        when(sectorRepository.findAllActive()).thenReturn(Arrays.asList(medicalSector, legalSector));
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(any(), anyLong())).thenReturn(response);

        // When
        sectorService.searchSectors("");

        // Then
        verify(sectorRepository).findAllActive();
        verify(sectorRepository, never()).searchByName(anyString());
    }

    @Test
    @DisplayName("Should return statistics")
    void shouldReturnStatistics() {
        // Given
        when(sectorRepository.count()).thenReturn(10L);
        when(sectorRepository.countActive()).thenReturn(8L);

        // When
        SectorStatsResponse result = sectorService.getStatistics();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.totalSectors()).isEqualTo(10L);
        assertThat(result.activeSectors()).isEqualTo(8L);
    }

    @Test
    @DisplayName("Should return most popular sectors")
    void shouldReturnMostPopularSectors() {
        // Given
        int limit = 5;
        when(sectorRepository.findMostPopular(limit)).thenReturn(Arrays.asList(medicalSector, legalSector));
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(any(), anyLong())).thenReturn(response);

        // When
        List<SectorResponse> result = sectorService.getMostPopular(limit);

        // Then
        assertThat(result).isNotEmpty();
        verify(sectorRepository).findMostPopular(limit);
    }

    @Test
    @DisplayName("Should use default limit when limit is zero")
    void shouldUseDefaultLimitWhenZero() {
        // Given
        int defaultLimit = 10;
        when(sectorRepository.findMostPopular(defaultLimit)).thenReturn(List.of(medicalSector));
        when(sectorRepository.countUsersBySector(anyLong())).thenReturn(100L);
        
        SectorResponse response = new SectorResponse(1L, "MEDICAL", "Sağlık", null, null, 1, true, 100L);
        when(sectorMapper.toResponse(eq(medicalSector), anyLong())).thenReturn(response);

        // When
        List<SectorResponse> result = sectorService.getMostPopular(0);

        // Then
        assertThat(result).isNotEmpty();
        verify(sectorRepository).findMostPopular(defaultLimit);
    }

    @Test
    @DisplayName("Should check if sector exists by code")
    void shouldCheckIfSectorExistsByCode() {
        // Given
        String code = "MEDICAL";
        when(sectorRepository.existsByCode(code)).thenReturn(true);

        // When
        boolean result = sectorService.existsByCode(code);

        // Then
        assertThat(result).isTrue();
        verify(sectorRepository).existsByCode(code);
    }
}
