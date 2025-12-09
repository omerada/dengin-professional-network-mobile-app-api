# 🎯 Sektör Bazlı Topluluk Yapısına Geçiş - Detaylı Sprint Planı

## 📊 Mevcut Mimari Analizi

### Backend (Spring Boot + PostgreSQL)

#### Mevcut Database Yapısı

```sql
-- Identity Context
professions (id, name, category, requires_verification, description, icon_url)
users (id, email, profession_id, is_profession_verified, ...)

-- Social Context
posts (id, author_id, profession_id, content, status, ...)
comments (id, post_id, commenter_id, content, ...)
follows (id, follower_id, following_id, ...)

-- Messaging Context
conversations (id, participant1_id, participant2_id, ...)
messages (id, conversation_id, sender_id, content, ...)

-- Verification Context
verification_requests (id, user_id, profession_id, status, ...)
```

#### Mevcut Domain Model

- **ProfessionCategory Enum**: MEDICAL, LEGAL, ENGINEERING, EDUCATION, SERVICE, CREATIVE, BUSINESS, OTHER
- **User → Profession** (1:1): Her kullanıcı tek bir meslek seçebiliyor
- **Profession.requiresVerification**: Boolean flag (bazı meslekler doğrulama gerektiriyor)
- **Post → Profession** (1:1): Her post bir mesleğe ait
- **Feed Algorithm**: Aynı profession'daki kullanıcıların postlarını gösteriyor

#### Mevcut API Endpoints

```
GET  /api/professions - Tüm meslekleri listele
GET  /api/professions/{id} - Meslek detayı
GET  /api/professions/category/{category} - Kategoriye göre meslekler
GET  /api/feed - Kullanıcının profession'ına göre feed
POST /api/posts - Post oluştur (profession_id zorunlu)
GET  /api/conversations - Mesajlaşmalar
```

### Mobile (React Native + Expo)

#### Mevcut Yapı

- **Onboarding**: Kullanıcı kayıt sırasında profession seçiyor
- **ProfessionSelector Component**: Dropdown ile meslek seçimi
- **Feed**: Sadece kendi profession'ındaki postları gösteriyor
- **Profile**: Profession bilgisi gösteriliyor
- **Verification**: AI destekli meslek doğrulama sistemi var

#### Mevcut Types

```typescript
interface User {
  professionId?: number;
  professionName?: string;
  profession?: Profession;
}

interface Profession {
  id: number;
  name: string;
  category: ProfessionCategory;
  requiresVerification: boolean;
}

type ProfessionCategory = 'MEDICAL' | 'LEGAL' | 'ENGINEERING' | ...
```

---

## 🎯 Hedef Model: Sektör Bazlı Topluluk Yapısı

### Aşamalı Geçiş Stratejisi

#### **AŞAMA 1: MVP - Sektör Bazlı İşleyiş** (Mevcut profession yapısını genişletme)

- Kullanıcılar **sektör** seçecek (MEDICAL, LEGAL, ENGINEERING, vb.)
- Her sektörde **genel topluluk** olacak (Discord benzeri ana kanal)
- Sektör içinde tüm kullanıcılar birbirini görebilecek
- Meslek doğrulaması **opsiyonel** olacak (rozet sistemi)

#### **AŞAMA 2: Genişleme - Meslek Bazlı Alt Topluluklar**

- Her sektör içinde **meslek grupları** oluşturulacak
- Bazı meslek grupları **doğrulama gerektirecek** (kilitli kanallar)
- Kullanıcı bir sektörde olup, farklı meslek gruplarına katılabilecek
- AI destekli belge doğrulama ile meslek rozetleri

---

## 📋 SPRINT PLANLARI

---

# SPRINT 1: Database & Domain Model Refactoring (Backend)

## Hedef

Mevcut `Profession` yapısını `Sector` ve `ProfessionGroup` olarak ayır. Geriye dönük uyumluluğu koru.

### 🔧 Backend Görevleri

#### Task 1.1: Database Migration - Sector Table Oluştur

**Dosya**: `backend/src/main/resources/db/migration/V18__create_sector_model.sql`

```sql
-- Sector table (eski ProfessionCategory'nin yeni hali)
CREATE TABLE sectors (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- 'MEDICAL', 'LEGAL', etc.
    name VARCHAR(100) NOT NULL, -- 'Sağlık', 'Hukuk', etc.
    description TEXT,
    icon_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX idx_sectors_code ON sectors(code);
CREATE INDEX idx_sectors_active ON sectors(is_active) WHERE is_active = TRUE;

-- Seed sectors (eski ProfessionCategory'den)
INSERT INTO sectors (code, name, description, display_order) VALUES
('MEDICAL', 'Sağlık', 'Sağlık sektörü profesyonelleri', 1),
('LEGAL', 'Hukuk', 'Hukuk ve adalet sektörü', 2),
('ENGINEERING', 'Mühendislik', 'Mühendislik ve teknik sektör', 3),
('EDUCATION', 'Eğitim', 'Eğitim ve akademi', 4),
('SERVICE', 'Hizmet', 'Hizmet sektörü', 5),
('CREATIVE', 'Yaratıcı', 'Yaratıcı ve sanat sektörü', 6),
('BUSINESS', 'İş Dünyası', 'İş ve yönetim', 7),
('OTHER', 'Diğer', 'Genel kategori', 99);

-- ProfessionGroup table (eski Profession tablosunun devamı)
CREATE TABLE profession_groups (
    id BIGSERIAL PRIMARY KEY,
    sector_id BIGINT NOT NULL REFERENCES sectors(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requires_verification BOOLEAN DEFAULT FALSE,
    icon_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,

    CONSTRAINT unique_profession_per_sector UNIQUE (sector_id, name)
);

CREATE INDEX idx_profession_groups_sector ON profession_groups(sector_id);
CREATE INDEX idx_profession_groups_verification ON profession_groups(requires_verification);
CREATE INDEX idx_profession_groups_active ON profession_groups(is_active) WHERE is_active = TRUE;

-- Migrate existing professions to profession_groups
INSERT INTO profession_groups (sector_id, name, description, requires_verification, icon_url)
SELECT
    s.id,
    p.name,
    p.description,
    p.requires_verification,
    p.icon_url
FROM professions p
JOIN sectors s ON s.code = p.category::text;

-- Add sector_id to users table (MVP için primary sector)
ALTER TABLE users ADD COLUMN sector_id BIGINT REFERENCES sectors(id);

-- Migrate user sectors from profession
UPDATE users u
SET sector_id = s.id
FROM professions p
JOIN sectors s ON s.code = p.category::text
WHERE u.profession_id = p.id;

-- Add sector_id to posts table
ALTER TABLE posts ADD COLUMN sector_id BIGINT REFERENCES sectors(id);

-- Migrate post sectors from profession
UPDATE posts p
SET sector_id = s.id
FROM professions pr
JOIN sectors s ON s.code = pr.category::text
WHERE p.profession_id = pr.id;

COMMENT ON TABLE sectors IS 'Sector categories - top level grouping (eski ProfessionCategory)';
COMMENT ON TABLE profession_groups IS 'Profession groups within sectors - optional verification (eski Profession)';
```

**Süre**: 1 gün

---

#### Task 1.2: Domain Model - Sector Entity Oluştur

**Dosya**: `backend/src/main/java/com/meslektas/identity/domain/model/Sector.java`

```java
package com.meslektas.identity.domain.model;

import com.meslektas.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Sector Entity - Top level professional category
 *
 * Replaces ProfessionCategory enum with a flexible entity model.
 * Users select a sector during onboarding.
 * Each sector can have multiple profession groups.
 *
 * Sprint 1: Sector-based community structure
 */
@Entity
@Table(name = "sectors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sector extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // MEDICAL, LEGAL, etc.

    @Column(name = "name", nullable = false, length = 100)
    private String name; // Sağlık, Hukuk, etc.

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Check if this is the general/other sector
     */
    public boolean isGeneralSector() {
        return "OTHER".equals(code);
    }
}
```

**Süre**: 0.5 gün

---

#### Task 1.3: Domain Model - ProfessionGroup Entity

**Dosya**: `backend/src/main/java/com/meslektas/identity/domain/model/ProfessionGroup.java`

```java
package com.meslektas.identity.domain.model;

import com.meslektas.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * ProfessionGroup Entity - Specific profession within a sector
 *
 * Replaces old Profession entity with sector relationship.
 * Used for optional verification and badges.
 *
 * Sprint 1: Basic structure (optional)
 * Sprint 3: Verification and locked groups
 */
@Entity
@Table(name = "profession_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "requires_verification", nullable = false)
    @Builder.Default
    private Boolean requiresVerification = false;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Check if this profession requires verification
     */
    public boolean needsVerification() {
        return Boolean.TRUE.equals(requiresVerification);
    }
}
```

**Süre**: 0.5 gün

---

#### Task 1.4: User Model Güncelleme - Sector İlişkisi Ekle

**Dosya**: `backend/src/main/java/com/meslektas/identity/domain/model/User.java`

**Değişiklikler**:

```java
// Eski (sakla - geriye dönük uyumluluk):
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "profession_id")
private Profession profession; // Deprecated - backward compatibility

// Yeni (ekle):
@ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "sector_id")
private Sector sector; // Primary sector for user

// Future (Sprint 3 için hazır):
// @ManyToMany - User can join multiple profession groups
// private Set<ProfessionGroup> professionGroups = new HashSet<>();

/**
 * Get user's primary sector
 */
public Sector getSector() {
    if (sector != null) return sector;
    // Fallback to profession's category (migration period)
    if (profession != null) {
        return Sector.builder()
            .code(profession.getCategory().name())
            .name(profession.getCategory().getDisplayName())
            .build();
    }
    return null;
}

/**
 * Select sector (MVP)
 */
public void selectSector(Sector sector) {
    if (sector == null) {
        throw new BusinessException("Sector cannot be null");
    }
    this.sector = sector;
    // Clear old profession if migrating
    if (this.profession != null && this.profession.getCategory().name().equals(sector.getCode())) {
        // Keep profession for backward compatibility
    }
}
```

**Süre**: 1 gün

---

#### Task 1.5: Repository Layer - SectorRepository

**Dosya**: `backend/src/main/java/com/meslektas/identity/domain/repository/SectorRepository.java`

```java
package com.meslektas.identity.domain.repository;

import com.meslektas.identity.domain.model.Sector;
import java.util.List;
import java.util.Optional;

public interface SectorRepository {
    Sector save(Sector sector);
    Optional<Sector> findById(Long id);
    Optional<Sector> findByCode(String code);
    List<Sector> findAll();
    List<Sector> findAllActive();
    boolean existsByCode(String code);
}
```

**JPA Implementation**: `JpaSectorRepository.java`

**Süre**: 0.5 gün

---

#### Task 1.6: Repository Layer - ProfessionGroupRepository

**Dosya**: `backend/src/main/java/com/meslektas/identity/domain/repository/ProfessionGroupRepository.java`

```java
package com.meslektas.identity.domain.repository;

import com.meslektas.identity.domain.model.ProfessionGroup;
import com.meslektas.identity.domain.model.Sector;
import java.util.List;
import java.util.Optional;

public interface ProfessionGroupRepository {
    ProfessionGroup save(ProfessionGroup professionGroup);
    Optional<ProfessionGroup> findById(Long id);
    List<ProfessionGroup> findBySector(Sector sector);
    List<ProfessionGroup> findBySectorId(Long sectorId);
    List<ProfessionGroup> findByRequiresVerification(Boolean requiresVerification);
    List<ProfessionGroup> searchByName(String query);
    boolean existsByName(String name);
}
```

**Süre**: 0.5 gün

---

#### Task 1.7: Application Service - SectorService

**Dosya**: `backend/src/main/java/com/meslektas/identity/application/service/SectorService.java`

```java
package com.meslektas.identity.application.service;

import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.identity.application.dto.response.SectorResponse;
import com.meslektas.identity.application.mapper.SectorMapper;
import com.meslektas.identity.domain.model.Sector;
import com.meslektas.identity.domain.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Sector Management Application Service
 *
 * Responsibilities:
 * - Sector queries
 * - Sector statistics
 * - Active sector list for onboarding
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SectorService {

    private final SectorRepository sectorRepository;
    private final SectorMapper sectorMapper;

    /**
     * Get all active sectors for onboarding
     */
    @Transactional(readOnly = true)
    public List<SectorResponse> getAllActiveSectors() {
        log.info("Fetching all active sectors");

        List<Sector> sectors = sectorRepository.findAllActive();

        return sectors.stream()
                .sorted((a, b) -> a.getDisplayOrder().compareTo(b.getDisplayOrder()))
                .map(sectorMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get sector by ID
     */
    @Transactional(readOnly = true)
    public SectorResponse getSectorById(Long id) {
        log.info("Fetching sector by id: {}", id);

        Sector sector = sectorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sector", id));

        return sectorMapper.toResponse(sector);
    }

    /**
     * Get sector by code
     */
    @Transactional(readOnly = true)
    public SectorResponse getSectorByCode(String code) {
        log.info("Fetching sector by code: {}", code);

        Sector sector = sectorRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Sector", "code", code));

        return sectorMapper.toResponse(sector);
    }

    /**
     * Get sector statistics
     */
    @Transactional(readOnly = true)
    public SectorStatsResponse getStatistics() {
        long totalSectors = sectorRepository.findAll().size();
        long activeSectors = sectorRepository.findAllActive().size();

        return new SectorStatsResponse(totalSectors, activeSectors);
    }

    public record SectorStatsResponse(
            long totalSectors,
            long activeSectors
    ) {}
}
```

**Süre**: 1 gün

---

#### Task 1.8: DTOs & Mappers

**Dosyalar**:

- `SectorResponse.java`
- `ProfessionGroupResponse.java`
- `SectorMapper.java`
- `ProfessionGroupMapper.java`

```java
// SectorResponse.java
public record SectorResponse(
    Long id,
    String code,
    String name,
    String description,
    String iconUrl,
    Integer displayOrder,
    Boolean isActive,
    Long memberCount // Opsiyonel - kaç kullanıcı bu sektörde
) {}

// ProfessionGroupResponse.java
public record ProfessionGroupResponse(
    Long id,
    Long sectorId,
    String sectorCode,
    String name,
    String description,
    Boolean requiresVerification,
    String iconUrl,
    Integer displayOrder,
    Long memberCount // Opsiyonel
) {}
```

**Süre**: 1 gün

---

#### Task 1.9: REST API - SectorController

**Dosya**: `backend/src/main/java/com/meslektas/identity/api/SectorController.java`

```java
package com.meslektas.identity.api;

import com.meslektas.common.api.ApiResponse;
import com.meslektas.identity.application.dto.response.SectorResponse;
import com.meslektas.identity.application.service.SectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Sector Management REST Controller
 *
 * Endpoints:
 * - GET /api/sectors - Get all active sectors
 * - GET /api/sectors/{id} - Get sector by ID
 * - GET /api/sectors/code/{code} - Get sector by code
 *
 * Public endpoints (no authentication for sector list)
 */
@RestController
@RequestMapping("/api/sectors")
@RequiredArgsConstructor
@Tag(name = "Sectors", description = "Sector management endpoints")
public class SectorController {

    private final SectorService sectorService;

    @GetMapping
    @Operation(summary = "Get all active sectors",
               description = "Returns all active sectors for onboarding")
    public ResponseEntity<ApiResponse<List<SectorResponse>>> getAllSectors() {
        List<SectorResponse> sectors = sectorService.getAllActiveSectors();
        return ResponseEntity.ok(ApiResponse.success(sectors));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sector by ID")
    public ResponseEntity<ApiResponse<SectorResponse>> getSectorById(@PathVariable Long id) {
        SectorResponse sector = sectorService.getSectorById(id);
        return ResponseEntity.ok(ApiResponse.success(sector));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get sector by code")
    public ResponseEntity<ApiResponse<SectorResponse>> getSectorByCode(@PathVariable String code) {
        SectorResponse sector = sectorService.getSectorByCode(code);
        return ResponseEntity.ok(ApiResponse.success(sector));
    }
}
```

**Süre**: 1 gün

---

#### Task 1.10: Backend Tests

- `SectorServiceTest.java`
- `SectorControllerTest.java`
- `SectorRepositoryTest.java`

**Süre**: 2 gün

---

### 📱 Mobile Görevleri (Sprint 1)

#### Task 1.11: Types - Sector Types Ekle

**Dosya**: `mobile/src/shared/types/api.types.ts`

```typescript
/**
 * Sector Response - Backend SectorResponse
 */
export interface Sector {
  id: number;
  code: string;
  name: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
  memberCount?: number;
}

/**
 * Profession Group Response - Backend ProfessionGroupResponse
 */
export interface ProfessionGroup {
  id: number;
  sectorId: number;
  sectorCode: string;
  name: string;
  description?: string;
  requiresVerification: boolean;
  iconUrl?: string;
  displayOrder: number;
  memberCount?: number;
}

/**
 * User with sector (yeni)
 */
export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  // Old (deprecated - backward compatibility)
  professionId?: number;
  professionName?: string;
  profession?: Profession;
  // New
  sectorId?: number;
  sectorCode?: string;
  sector?: Sector;
  professionGroups?: ProfessionGroup[]; // Sprint 3
}
```

**Süre**: 0.5 gün

---

#### Task 1.12: API Client - Sector API

**Dosya**: `mobile/src/core/api/sectorApi.ts`

```typescript
import { apiClient, API_ENDPOINTS } from "@core/api";
import type { Sector, ProfessionGroup } from "@shared/types/api.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const sectorApi = {
  /**
   * Get all active sectors
   * GET /api/sectors
   */
  getAllSectors: async (): Promise<Sector[]> => {
    const response = await apiClient.get<ApiResponse<Sector[]>>("/api/sectors");
    return response.data.data;
  },

  /**
   * Get sector by ID
   * GET /api/sectors/{id}
   */
  getSectorById: async (id: number): Promise<Sector> => {
    const response = await apiClient.get<ApiResponse<Sector>>(
      `/api/sectors/${id}`
    );
    return response.data.data;
  },

  /**
   * Get sector by code
   * GET /api/sectors/code/{code}
   */
  getSectorByCode: async (code: string): Promise<Sector> => {
    const response = await apiClient.get<ApiResponse<Sector>>(
      `/api/sectors/code/${code}`
    );
    return response.data.data;
  },

  /**
   * Get profession groups for a sector
   * GET /api/sectors/{sectorId}/profession-groups
   */
  getProfessionGroups: async (sectorId: number): Promise<ProfessionGroup[]> => {
    const response = await apiClient.get<ApiResponse<ProfessionGroup[]>>(
      `/api/sectors/${sectorId}/profession-groups`
    );
    return response.data.data;
  },
};
```

**Süre**: 1 gün

---

#### Task 1.13: Onboarding - SectorSelectionScreen

**Dosya**: `mobile/src/features/onboarding/screens/SectorSelectionScreen.tsx`

```typescript
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useColors } from "@contexts/ThemeContext";
import { sectorApi } from "@core/api/sectorApi";
import type { Sector } from "@shared/types/api.types";

interface SectorSelectionScreenProps {
  onSectorSelect: (sector: Sector) => void;
}

export const SectorSelectionScreen: React.FC<SectorSelectionScreenProps> = ({
  onSectorSelect,
}) => {
  const colors = useColors();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      setLoading(true);
      const data = await sectorApi.getAllSectors();
      setSectors(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error("Failed to load sectors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorSelect = (sector: Sector) => {
    setSelectedSector(sector);
    onSectorSelect(sector);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.interactive.default} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Sektörler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Sektörünüzü Seçin
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        Hangi sektörde çalışıyorsunuz?
      </Text>

      <FlatList
        data={sectors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.sectorCard,
              {
                backgroundColor:
                  selectedSector?.id === item.id
                    ? colors.interactive.subtle
                    : colors.background.secondary,
                borderColor:
                  selectedSector?.id === item.id
                    ? colors.interactive.default
                    : colors.border.default,
              },
            ]}
            onPress={() => handleSectorSelect(item)}
          >
            {item.iconUrl && (
              <Image source={{ uri: item.iconUrl }} style={styles.icon} />
            )}
            <View style={styles.sectorInfo}>
              <Text style={[styles.sectorName, { color: colors.text.primary }]}>
                {item.name}
              </Text>
              {item.description && (
                <Text
                  style={[styles.sectorDesc, { color: colors.text.secondary }]}
                >
                  {item.description}
                </Text>
              )}
              {item.memberCount && item.memberCount > 0 && (
                <Text
                  style={[styles.memberCount, { color: colors.text.tertiary }]}
                >
                  {item.memberCount} üye
                </Text>
              )}
            </View>
            {selectedSector?.id === item.id && (
              <Text
                style={[
                  styles.checkmark,
                  { color: colors.interactive.default },
                ]}
              >
                ✓
              </Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  icon: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  sectorInfo: {
    flex: 1,
  },
  sectorName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectorDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 12,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
```

**Süre**: 2 gün

---

#### Task 1.14: Update Registration Flow

**Dosya**: `mobile/src/features/auth/screens/RegisterScreen.tsx`

Kayıt akışını güncelle:

1. Email/Password + Profil bilgileri
2. **Sektör seçimi** (yeni) ← SectorSelectionScreen
3. Meslek seçimi (opsiyonel, Sprint 3'e ertele)
4. Doğrulama (opsiyonel, Sprint 3'e ertele)

**Süre**: 1 gün

---

### ⏱️ Sprint 1 Toplam Süre: **12-14 gün**

---

# SPRINT 2: Feed & Social Context - Sektör Bazlı İçerik (Backend)

## Hedef

Post, Feed ve Social özelliklerini sektör bazlı çalışacak şekilde güncelle.

### 🔧 Backend Görevleri

#### Task 2.1: Post Model Güncelleme

**Dosya**: `backend/src/main/java/com/meslektas/social/domain/model/Post.java`

```java
// Eski (sakla):
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "profession_id", nullable = false)
private Profession profession; // Deprecated

// Yeni (ekle):
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "sector_id", nullable = false)
private Sector sector; // Primary sector for post

/**
 * Get post's sector
 */
public Sector getSector() {
    if (sector != null) return sector;
    // Fallback for migration
    if (profession != null) {
        return Sector.fromProfessionCategory(profession.getCategory());
    }
    return null;
}
```

**Süre**: 0.5 gün

---

#### Task 2.2: Feed Service - Sector-Based Feed

**Dosya**: `backend/src/main/java/com/meslektas/social/application/service/FeedService.java`

```java
/**
 * Get sector-based feed
 *
 * Business Rules:
 * - Show posts from user's sector
 * - Respect blocking
 * - Hide deleted posts
 */
public PagedResponse<FeedPostResponse> getSectorFeed(
        Long sectorId,
        Long userId,
        int limit,
        Long beforeId) {

    // Get user's sector
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

    Sector userSector = user.getSector();
    if (userSector == null) {
        throw new BusinessException("User has no sector selected");
    }

    // Get blocked user IDs
    Set<Long> blockedUserIds = blockRepository.findBlockedUserIds(userId);

    // Fetch posts from same sector
    List<Post> posts = postRepository.findBySectorAndNotInBlockedUsers(
            userSector,
            blockedUserIds,
            beforeId,
            limit
    );

    // Map to response DTOs
    List<FeedPostResponse> feedPosts = posts.stream()
            .map(post -> mapToFeedPost(post, userId))
            .collect(Collectors.toList());

    boolean hasNext = posts.size() == limit;
    Long lastId = posts.isEmpty() ? null : posts.get(posts.size() - 1).getId();

    return PagedResponse.<FeedPostResponse>builder()
            .content(feedPosts)
            .size(feedPosts.size())
            .hasNext(hasNext)
            .lastId(lastId)
            .build();
}
```

**Süre**: 2 gün

---

#### Task 2.3: Post Repository - Sector Queries

**Dosya**: `backend/src/main/java/com/meslektas/social/domain/repository/PostRepository.java`

```java
public interface PostRepository {
    // Yeni sector-based queries
    List<Post> findBySectorAndNotInBlockedUsers(
        Sector sector,
        Set<Long> blockedUserIds,
        Long beforeId,
        int limit
    );

    List<Post> findBySectorOrderByCreatedAtDesc(
        Sector sector,
        Pageable pageable
    );

    long countBySector(Sector sector);

    // Trending posts in sector
    List<Post> findTrendingBySector(
        Sector sector,
        LocalDateTime since,
        int limit
    );
}
```

**JPA Implementation**: Native query ile optimize et

**Süre**: 1 gün

---

#### Task 2.4: FeedController Güncelleme

**Dosya**: `backend/src/main/java/com/meslektas/social/api/FeedController.java`

```java
@GetMapping
@Operation(summary = "Get sector-based feed")
public ResponseEntity<ApiResponse<PagedResponse<FeedPostResponse>>> getFeed(
        @RequestParam(required = false) Long sectorId, // Opsiyonel filter
        @RequestParam(defaultValue = "20") int limit,
        @RequestParam(required = false) Long beforeId,
        @AuthenticationPrincipal UserDetailsImpl currentUser) {

    Long userId = currentUser.getId();

    PagedResponse<FeedPostResponse> feed = feedService.getSectorFeed(
            sectorId,
            userId,
            limit,
            beforeId
    );

    return ResponseEntity.ok(ApiResponse.success("Feed retrieved successfully", feed));
}
```

**Süre**: 1 gün

---

#### Task 2.5: Post Creation - Sector Validation

**Dosya**: `backend/src/main/java/com/meslektas/social/application/service/PostService.java`

```java
/**
 * Create post with sector validation
 */
public PostResponse createPost(CreatePostRequest request, Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

    // Validate user has sector
    if (user.getSector() == null) {
        throw new BusinessException("User must select a sector to post");
    }

    // Post is created in user's sector
    Post post = Post.builder()
            .author(user)
            .sector(user.getSector()) // Auto-assign user's sector
            .content(request.content())
            .status(PostStatus.PUBLISHED)
            .build();

    post = postRepository.save(post);

    return postMapper.toResponse(post);
}
```

**Süre**: 1 gün

---

#### Task 2.6: Backend Tests

- `FeedServiceTest.java` - sector-based feed
- `PostServiceTest.java` - sector validation

**Süre**: 2 gün

---

### 📱 Mobile Görevleri (Sprint 2)

#### Task 2.7: Feed Screen - Sector Feed

**Dosya**: `mobile/src/features/feed/screens/FeedScreen.tsx`

```typescript
const FeedScreen = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.sectorId) {
      loadSectorFeed(user.sectorId);
    }
  }, [user?.sectorId]);

  const loadSectorFeed = async (sectorId: number) => {
    try {
      setLoading(true);
      const response = await feedApi.getSectorFeed({
        sectorId,
        limit: 20,
      });
      setPosts(response.content);
    } catch (error) {
      console.error("Failed to load sector feed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectorHeader}>{user?.sector?.name} Toplulu ğu</Text>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
```

**Süre**: 2 gün

---

#### Task 2.8: Post Creation - Sector Auto-assign

**Dosya**: `mobile/src/features/feed/screens/CreatePostScreen.tsx`

Post oluştururken `sectorId` otomatik kullanıcının sector'ından alınır.

**Süre**: 1 gün

---

### ⏱️ Sprint 2 Toplam Süre: **10-12 gün**

---

# SPRINT 3: Meslek Grupları & Doğrulama Sistemi (MVP+)

## Hedef

Kullanıcılar sektör içinde meslek gruplarına katılabilsin. Bazı gruplar doğrulama gerektirsin.

### 🔧 Backend Görevleri

#### Task 3.1: Database - User-ProfessionGroup Many-to-Many

**Dosya**: `V19__user_profession_groups.sql`

```sql
-- User to ProfessionGroup mapping (many-to-many)
CREATE TABLE user_profession_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profession_group_id BIGINT NOT NULL REFERENCES profession_groups(id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_profession_group UNIQUE (user_id, profession_group_id)
);

CREATE INDEX idx_user_profession_groups_user ON user_profession_groups(user_id);
CREATE INDEX idx_user_profession_groups_profession ON user_profession_groups(profession_group_id);
CREATE INDEX idx_user_profession_groups_verified ON user_profession_groups(is_verified);
```

**Süre**: 0.5 gün

---

#### Task 3.2: Domain Model - UserProfessionGroup

**Dosya**: `backend/src/main/java/com/meslektas/identity/domain/model/UserProfessionGroup.java`

```java
@Entity
@Table(name = "user_profession_groups")
public class UserProfessionGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profession_group_id", nullable = false)
    private ProfessionGroup professionGroup;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    /**
     * Verify this profession group membership
     */
    public void verify() {
        this.isVerified = true;
        this.verifiedAt = LocalDateTime.now();
    }
}
```

**Süre**: 1 gün

---

#### Task 3.3: User Model - ProfessionGroups İlişkisi

**Dosya**: `User.java`

```java
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private Set<UserProfessionGroup> professionGroups = new HashSet<>();

/**
 * Join a profession group
 */
public void joinProfessionGroup(ProfessionGroup professionGroup) {
    // Check if already member
    boolean alreadyMember = professionGroups.stream()
            .anyMatch(upg -> upg.getProfessionGroup().equals(professionGroup));

    if (alreadyMember) {
        throw new BusinessException("Already member of this profession group");
    }

    // Check if profession group belongs to user's sector
    if (!professionGroup.getSector().equals(this.sector)) {
        throw new BusinessException("Profession group must be in user's sector");
    }

    UserProfessionGroup membership = UserProfessionGroup.builder()
            .user(this)
            .professionGroup(professionGroup)
            .isVerified(false)
            .joinedAt(LocalDateTime.now())
            .build();

    professionGroups.add(membership);
}

/**
 * Check if user is verified in a profession group
 */
public boolean isVerifiedInProfessionGroup(ProfessionGroup professionGroup) {
    return professionGroups.stream()
            .filter(upg -> upg.getProfessionGroup().equals(professionGroup))
            .anyMatch(UserProfessionGroup::getIsVerified);
}
```

**Süre**: 1 gün

---

#### Task 3.4: ProfessionGroupService - Join/Leave Logic

**Dosya**: `backend/src/main/java/com/meslektas/identity/application/service/ProfessionGroupService.java`

```java
/**
 * User joins a profession group
 */
public void joinProfessionGroup(Long userId, Long professionGroupId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

    ProfessionGroup professionGroup = professionGroupRepository.findById(professionGroupId)
            .orElseThrow(() -> new ResourceNotFoundException("ProfessionGroup", professionGroupId));

    // Validation
    if (professionGroup.needsVerification()) {
        throw new BusinessException("This profession group requires verification. Please submit verification request.");
    }

    user.joinProfessionGroup(professionGroup);
    userRepository.save(user);
}

/**
 * User leaves a profession group
 */
public void leaveProfessionGroup(Long userId, Long professionGroupId) {
    // Implementation
}

/**
 * Get user's profession groups
 */
public List<ProfessionGroupResponse> getUserProfessionGroups(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

    return user.getProfessionGroups().stream()
            .map(upg -> professionGroupMapper.toResponse(upg.getProfessionGroup()))
            .collect(Collectors.toList());
}
```

**Süre**: 2 gün

---

#### Task 3.5: Verification Integration

Mevcut `VerificationService`'i güncelle:

- Verification success → User'ın ilgili ProfessionGroup'u verify et
- Rozet sistemi ekle

**Süre**: 2 gün

---

#### Task 3.6: Feed Filtering - Profession Group Posts

Gelecekte meslek gruplarına özel postlar için:

```java
/**
 * Get posts from a specific profession group
 * Only verified members can see
 */
public PagedResponse<FeedPostResponse> getProfessionGroupFeed(
        Long professionGroupId,
        Long userId,
        int limit,
        Long beforeId) {

    // Check user is verified member
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

    ProfessionGroup professionGroup = professionGroupRepository.findById(professionGroupId)
            .orElseThrow(() -> new ResourceNotFoundException("ProfessionGroup", professionGroupId));

    if (!user.isVerifiedInProfessionGroup(professionGroup)) {
        throw new BusinessException("You must be a verified member to view this feed");
    }

    // Fetch posts...
}
```

**Süre**: 2 gün (opsiyonel, Sprint 4'e ertelenebilir)

---

### 📱 Mobile Görevleri (Sprint 3)

#### Task 3.7: ProfessionGroupListScreen

**Dosya**: `mobile/src/features/profile/screens/ProfessionGroupListScreen.tsx`

Kullanıcı sektörü içindeki meslek gruplarını görebilir ve katılabilir.

**Süre**: 2 gün

---

#### Task 3.8: Verification Flow

Meslek doğrulama akışını profession group'a bağla.

**Süre**: 2 gün

---

### ⏱️ Sprint 3 Toplam Süre: **12-14 gün**

---

# SPRINT 4: Discord Benzeri Kanal Yapısı (Gelecek)

## Hedef

Her sektör ve meslek grubu için Discord benzeri kanallar.

### Özellikler

- **Sektör kanalları**: Genel sohbet, duyurular, etkinlikler
- **Meslek grup kanalları**: Sadece doğrulanmış üyeler erişebilir
- **Real-time messaging**: WebSocket ile
- **Kanal moderasyonu**: Admin tools

**Süre**: 3-4 hafta (Ayrı epic olarak planlanacak)

---

# SPRINT 5: Kullanıcı Rozetleri & Gamification

## Hedef

Meslek doğrulaması yapan kullanıcılara rozet ve seviye sistemi.

### Özellikler

- ✅ **Doğrulanmış rozeti**: Verified badge
- 🏆 **Seviye rozetleri**: Bronze, Silver, Gold (tecrübe, yayın, patent bazlı)
- 📊 **Sektör liderleri**: Leaderboard
- 🎯 **Başarım sistemi**: Achievements

**Süre**: 2-3 hafta

---

# SPRINT 6: Meslek Haritası & İstatistikler

## Hedef

Türkiye genelinde sektör ve meslek dağılımını harita üzerinde göster.

### Özellikler

- 🗺️ **Bölgesel yoğunluk haritası**
- 📈 **Sektör büyüme grafikleri**
- 👥 **En aktif bölgeler**
- 🔥 **Trend sektörler**

**Süre**: 2 hafta

---

# SPRINT 7: Meslek IQ Testi & Profil Analizi

## Hedef

AI destekli kişilik ve meslek profili analizi.

### Özellikler

- 🧠 **3 soruluk mini test**
- 🎭 **Kişilik profili**: "Usta Pratik", "Analiz Odaklı Mühendis"
- 🎨 **Özelleştirilmiş avatar rozetleri**
- 📊 **Meslek uyumluluk skoru**

**Süre**: 2 hafta

---

# SPRINT 8: Meslek Radyosu & AI İçerik

## Hedef

Her sektör için günlük AI üretimli içerik.

### Özellikler

- 🎙️ **2 dakikalık günlük özet**: Sektörel haberler
- 📰 **Gündem özeti**: AI ile derlenmiş
- 💬 **Meslek sözleri & hikayeler**
- 😄 **Sektör içi mizah**: AI generated

**Süre**: 3 hafta

---

## 📊 Toplam Zaman Tahmini

### MVP (Sprint 1-3)

- **Sprint 1**: 12-14 gün (Backend + Mobile) - Sektör modeli
- **Sprint 2**: 10-12 gün (Backend + Mobile) - Sektör bazlı feed
- **Sprint 3**: 12-14 gün (Backend + Mobile) - Meslek grupları

**MVP Toplam**: **5-6 hafta** (1-1.5 ay)

### MVP+ Özellikler (Sprint 4-8)

- **Sprint 4**: 3-4 hafta - Discord benzeri kanallar
- **Sprint 5**: 2-3 hafta - Rozet sistemi
- **Sprint 6**: 2 hafta - Meslek haritası
- **Sprint 7**: 2 hafta - Meslek IQ
- **Sprint 8**: 3 hafta - AI içerik

**MVP+ Toplam**: **12-16 hafta** (3-4 ay)

---

## 🎯 Öncelik Sırası

### Yüksek Öncelik (MVP)

1. ✅ Sprint 1: Sektör modeli ve database refactoring
2. ✅ Sprint 2: Sektör bazlı feed ve post sistemi
3. ✅ Sprint 3: Meslek grupları ve doğrulama

### Orta Öncelik (MVP+)

4. Sprint 4: Kanal yapısı
5. Sprint 5: Rozet sistemi

### Düşük Öncelik (Viral Özellikler)

6. Sprint 6: Meslek haritası
7. Sprint 7: Meslek IQ
8. Sprint 8: AI radyo

---

## 🚨 Riskler ve Çözümler

### Risk 1: Mevcut Kullanıcı Datası Migrasyon

**Sorun**: Profession → Sector geçişi mevcut kullanıcıları etkileyebilir

**Çözüm**:

- Migration script ile otomatik `profession.category` → `sector` mapping
- Geriye dönük uyumluluk için `profession_id` kolonunu sakla
- API'de hem eski hem yeni alanları destekle (dual-mode)
- Mobile'da progressive migration: Yeni kayıtlar sector seçsin, eskileri otomatik migrate et

**Süre**: Migration script + test → 2 gün

---

### Risk 2: Feed Performance

**Sorun**: Sektör bazlı feed büyük veri setlerinde yavaşlayabilir

**Çözüm**:

- Database indexler: `idx_posts_sector_created`
- Redis caching: Sector feed'leri 5 dakika cache'le
- Pagination optimize et: Cursor-based paging
- Feed caching strategy: Background job ile pre-generate

**Süre**: Optimization → 2 gün

---

### Risk 3: Meslek Doğrulama Karmaşıklığı

**Sorun**: ProfessionGroup verification karmaşık logic

**Çözüm**:

- Mevcut verification sistemini re-use et
- Verification → ProfessionGroup mapping tablosu
- AI verification service'i extend et

**Süre**: Integration → 3 gün

---

## 📝 API Endpoints Özeti

### Yeni Endpoints (Sprint 1)

```
GET  /api/sectors                      - Tüm sektörler
GET  /api/sectors/{id}                 - Sektör detayı
GET  /api/sectors/code/{code}          - Code ile sektör
GET  /api/sectors/{id}/profession-groups - Sektördeki meslek grupları
```

### Güncellenen Endpoints (Sprint 2)

```
GET  /api/feed?sectorId={id}           - Sektör bazlı feed
POST /api/posts                        - Post oluştur (sector auto-assign)
```

### Yeni Endpoints (Sprint 3)

```
POST /api/profession-groups/{id}/join  - Meslek grubuna katıl
POST /api/profession-groups/{id}/leave - Meslek grubundan ayrıl
GET  /api/users/me/profession-groups   - Kullanıcının grupları
GET  /api/profession-groups/{id}/feed  - Grup feed (doğrulanmış üyeler)
```

---

## 🎨 Mobil UI/UX Değişiklikleri

### Onboarding Akışı (Yeni)

```
1. Email/Password
2. Profil Bilgileri (Ad, Soyad, Bio)
3. 🆕 SEKTÖR SEÇİMİ (büyük kartlar, görselli)
4. (Opsiyonel) Meslek grubu seçimi
5. (Opsiyonel) Doğrulama
6. Hoşgeldiniz!
```

### Ana Ekran (Feed)

```
📊 [Sektör Adı] Topluluğu
   ↓
🔥 Trending Posts
   ↓
📝 Recent Posts (sector-based)
```

### Profil Ekranı

```
👤 [Kullanıcı Adı]
🏢 Sektör: [Sağlık]
✅ Doğrulanmış Meslek Grupları:
   • Doktor ✓ (Verified Badge)
   • Hemşire ✓
```

---

## ✅ Başarı Kriterleri

### Sprint 1

- [ ] Sector tablosu oluşturuldu
- [ ] User-Sector ilişkisi kuruldu
- [ ] Sector API çalışıyor
- [ ] Mobile onboarding sector seçimi var
- [ ] Migration başarıyla tamamlandı

### Sprint 2

- [ ] Post-Sector ilişkisi kuruldu
- [ ] Sector-based feed çalışıyor
- [ ] Feed performans testleri geçti
- [ ] Mobile feed sector filtreli gösteriyor

### Sprint 3

- [ ] ProfessionGroup many-to-many ilişkisi var
- [ ] Kullanıcı meslek grubuna katılabiliyor
- [ ] Verification ProfessionGroup'a bağlandı
- [ ] Rozet sistemi basic hali çalışıyor

---

## 📚 Teknik Dokümantasyon Güncellemeleri

### Güncellenmesi Gereken Dökümanlar

1. `backend-development-guide/contexts/01-IDENTITY-CONTEXT.md`

   - Sector ve ProfessionGroup entity'lerini ekle

2. `backend-development-guide/database/01-DATABASE-SCHEMA.md`

   - Yeni tablolar: sectors, profession_groups, user_profession_groups

3. `mobile-development-guide/core/14-BACKEND-API-REFERENCE.md`

   - Yeni API endpoints

4. `docs/08-API-SPECIFICATIONS.md`

   - Sector APIs
   - ProfessionGroup APIs

5. `README.md`
   - Yeni yapıyı yansıt

---

## 🎯 Sonuç

Bu plan ile:

✅ **MVP (5-6 hafta)**: Sektör bazlı topluluk yapısı tamamen çalışır halde
✅ **Geriye dönük uyumluluk**: Mevcut profession sistemi korunur
✅ **Ölçeklenebilir**: Meslek grupları ve doğrulama sistemi hazır
✅ **Viral özellikler**: Rozet, harita, AI içerik eklenmeye hazır
✅ **DDD uyumlu**: Clean architecture korunur
✅ **Test edilebilir**: Her sprint için test görevleri var

**Önerilen Başlangıç**: Sprint 1'den başla, MVP'yi tamamla, ardından kullanıcı geri bildirimlerine göre MVP+ özelliklerini önceliklendir.
