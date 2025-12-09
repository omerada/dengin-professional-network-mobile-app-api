package com.meslektas.identity.domain.model;

import com.meslektas.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.Locale;

/**
 * Sector Entity - Top-level professional category
 * 
 * Represents a professional sector in the system.
 * Replaces the rigid ProfessionCategory enum with a flexible entity model.
 * 
 * Users select a primary sector during onboarding.
 * Each sector can contain multiple profession groups.
 * Sectors enable community-based features (sector-wide feed, channels, etc.)
 * 
 * DDD Pattern: Entity within Identity Context
 * 
 * Business Rules:
 * - Sector code must be uppercase (enforced in database)
 * - Display order determines UI sorting
 * - Inactive sectors are hidden from users but data preserved
 * - Code is immutable once created (system reference)
 * 
 * Examples:
 * - Code: MEDICAL, Name: Sağlık
 * - Code: LEGAL, Name: Hukuk
 * - Code: ENGINEERING, Name: Mühendislik
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Entity
@Table(name = "sectors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Sector extends BaseEntity {

    /**
     * Sector code - unique identifier (e.g., MEDICAL, LEGAL)
     * Must be uppercase, immutable after creation
     * Used for system references and API consistency
     */
    @Column(name = "code", nullable = false, unique = true, length = 50, updatable = false)
    @EqualsAndHashCode.Include
    private String code;

    /**
     * Display name in Turkish (e.g., Sağlık, Hukuk)
     * Shown to users in UI
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Sector description
     * Helps users understand what professions belong to this sector
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Icon URL for UI display
     * Can be S3 URL or external CDN
     */
    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    /**
     * Display order in UI
     * Lower values appear first
     * 0-based ordering
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Whether sector is active
     * Inactive sectors are hidden from new selections
     * but existing user data is preserved
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // =====================================================
    // Business Logic Methods
    // =====================================================

    /**
     * Check if this is the general/other sector
     * The OTHER sector is special - doesn't require specific profession
     * 
     * @return true if sector code is OTHER
     */
    public boolean isGeneralSector() {
        return "OTHER".equals(code);
    }

    /**
     * Check if this is a professional sector requiring verification
     * Professional sectors: MEDICAL, LEGAL, ENGINEERING, EDUCATION
     * Service sectors: SERVICE, CREATIVE, BUSINESS, OTHER (no verification required)
     * 
     * @return true if sector typically requires professional verification
     */
    public boolean isProfessionalSector() {
        return code != null && (
                code.equals("MEDICAL") ||
                code.equals("LEGAL") ||
                code.equals("ENGINEERING") ||
                code.equals("EDUCATION")
        );
    }

    /**
     * Check if sector is available for user selection
     * 
     * @return true if sector is active
     */
    public boolean isAvailable() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Activate sector
     * Makes sector visible to users
     */
    public void activate() {
        this.isActive = true;
    }

    /**
     * Deactivate sector
     * Hides sector from new selections, preserves existing data
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * Update display information
     * 
     * @param name new display name
     * @param description new description
     * @param iconUrl new icon URL
     */
    public void updateDisplayInfo(String name, String description, String iconUrl) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        this.description = description;
        this.iconUrl = iconUrl;
    }

    /**
     * Update display order
     * 
     * @param displayOrder new display order (must be >= 0)
     */
    public void updateDisplayOrder(Integer displayOrder) {
        if (displayOrder != null && displayOrder >= 0) {
            this.displayOrder = displayOrder;
        }
    }

    // =====================================================
    // Factory Methods
    // =====================================================

    /**
     * Create a new sector with minimal information
     * Code is automatically uppercased
     * 
     * @param code sector code
     * @param name sector display name
     * @return new Sector instance
     */
    public static Sector create(String code, String name) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Sector code cannot be null or empty");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Sector name cannot be null or empty");
        }

        return Sector.builder()
                .code(code.toUpperCase(Locale.ENGLISH))
                .name(name)
                .isActive(true)
                .displayOrder(0)
                .build();
    }

    /**
     * Create a new sector with full information
     * 
     * @param code sector code
     * @param name sector display name
     * @param description sector description
     * @param displayOrder display order
     * @return new Sector instance
     */
    public static Sector create(String code, String name, String description, Integer displayOrder) {
        Sector sector = create(code, name);
        sector.setDescription(description);
        sector.setDisplayOrder(displayOrder != null && displayOrder >= 0 ? displayOrder : 0);
        return sector;
    }

    // =====================================================
    // Migration Helpers
    // =====================================================

    /**
     * Convert from old ProfessionCategory enum to Sector
     * Used during migration period for backward compatibility
     * 
     * @param category old profession category
     * @return equivalent Sector instance
     */
    public static Sector fromProfessionCategory(ProfessionCategory category) {
        if (category == null) {
            return null;
        }

        return Sector.builder()
                .code(category.name())
                .name(category.getDisplayName())
                .isActive(true)
                .build();
    }

    // =====================================================
    // toString for Logging
    // =====================================================

    @Override
    public String toString() {
        return "Sector{" +
                "id=" + getId() +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", isActive=" + isActive +
                ", displayOrder=" + displayOrder +
                '}';
    }
}
