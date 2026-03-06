package com.dengin.identity.domain.model;

import com.dengin.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * ProfessionGroup Entity - Specific profession within a sector
 * 
 * Represents a specific profession group that users can join within a sector.
 * Replaces the old monolithic Profession entity with a sector-aware model.
 * 
 * Users can optionally join profession groups within their sector.
 * Some profession groups require verification (AI-based document validation).
 * Verified profession groups grant special badges and access to locked channels.
 * 
 * DDD Pattern: Entity within Identity Context
 * 
 * Business Rules:
 * - Must belong to a sector (cannot exist independently)
 * - Name must be unique within a sector
 * - Verification requirement is immutable after creation
 * - Inactive groups are hidden but preserve historical data
 * - Display order determines UI sorting within sector
 * 
 * Examples within MEDICAL sector:
 * - Name: Doktor, requiresVerification: true
 * - Name: Hemşire, requiresVerification: true
 * - Name: Eczacı, requiresVerification: true
 * 
 * Examples within SERVICE sector:
 * - Name: Garson, requiresVerification: false
 * - Name: Kuaför, requiresVerification: false
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Entity
@Table(
    name = "profession_groups",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_profession_per_sector",
            columnNames = {"sector_id", "name"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class ProfessionGroup extends BaseEntity {

    /**
     * Parent sector reference
     * Every profession group belongs to exactly one sector
     * Cascade: RESTRICT - cannot delete sector with existing profession groups
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sector_id", nullable = false)
    @EqualsAndHashCode.Include
    private Sector sector;

    /**
     * Profession group name (e.g., Doktor, Avukat, Yazılım Mühendisi)
     * Must be unique within sector
     */
    @Column(name = "name", nullable = false, length = 100)
    @EqualsAndHashCode.Include
    private String name;

    /**
     * Profession group description
     * Explains what this profession does, requirements, etc.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Whether this profession requires verification
     * Immutable after creation - changing would affect existing verified users
     * 
     * Professional groups (doctors, lawyers, engineers) require verification
     * Service groups (waiters, drivers) typically don't require verification
     */
    @Column(name = "requires_verification", nullable = false, updatable = false)
    @Builder.Default
    private Boolean requiresVerification = false;

    /**
     * Icon URL for UI display
     * Profession-specific icon (e.g., stethoscope for doctors)
     */
    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    /**
     * Display order within sector
     * Lower values appear first in UI
     * 0-based ordering
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Whether profession group is active
     * Inactive groups are hidden from new joins
     * Existing memberships are preserved
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // =====================================================
    // Business Logic Methods
    // =====================================================

    /**
     * Check if this profession requires verification
     * Professional groups require AI-based document verification
     * 
     * @return true if verification is required
     */
    public boolean needsVerification() {
        return Boolean.TRUE.equals(requiresVerification);
    }

    /**
     * Check if profession group is available for new joins
     * 
     * @return true if active
     */
    public boolean isAvailable() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Check if this profession group belongs to a specific sector
     * 
     * @param sectorCode sector code to check
     * @return true if belongs to sector
     */
    public boolean belongsToSector(String sectorCode) {
        return sector != null && sector.getCode().equals(sectorCode);
    }

    /**
     * Get full profession name with sector
     * Useful for display and logging
     * 
     * @return formatted name (e.g., "Doktor (Sağlık)")
     */
    public String getFullName() {
        if (sector == null) {
            return name;
        }
        return name + " (" + sector.getName() + ")";
    }

    /**
     * Activate profession group
     * Makes it available for new joins
     */
    public void activate() {
        this.isActive = true;
    }

    /**
     * Deactivate profession group
     * Hides from new joins, preserves existing memberships
     */
    public void deactivate() {
        this.isActive = false;
    }

    /**
     * Update display information
     * Verification requirement cannot be changed (immutable)
     * 
     * @param name new name (optional)
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
     * Update display order within sector
     * 
     * @param displayOrder new display order (must be >= 0)
     */
    public void updateDisplayOrder(Integer displayOrder) {
        if (displayOrder != null && displayOrder >= 0) {
            this.displayOrder = displayOrder;
        }
    }

    // =====================================================
    // Validation Methods
    // =====================================================

    /**
     * Validate profession group state before persistence
     * Called by JPA @PrePersist and @PreUpdate
     */
    @PrePersist
    @PreUpdate
    private void validateProfessionGroup() {
        if (sector == null) {
            throw new IllegalStateException("ProfessionGroup must have a sector");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalStateException("ProfessionGroup must have a name");
        }
        if (requiresVerification == null) {
            throw new IllegalStateException("ProfessionGroup must specify verification requirement");
        }
        if (displayOrder == null || displayOrder < 0) {
            throw new IllegalStateException("ProfessionGroup display order must be >= 0");
        }
    }

    // =====================================================
    // Factory Methods
    // =====================================================

    /**
     * Create a profession group with minimal information
     * 
     * @param sector parent sector
     * @param name profession name
     * @param requiresVerification whether verification is required
     * @return new ProfessionGroup instance
     */
    public static ProfessionGroup create(Sector sector, String name, boolean requiresVerification) {
        if (sector == null) {
            throw new IllegalArgumentException("Sector cannot be null");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Profession name cannot be null or empty");
        }

        return ProfessionGroup.builder()
                .sector(sector)
                .name(name)
                .requiresVerification(requiresVerification)
                .isActive(true)
                .displayOrder(0)
                .build();
    }

    /**
     * Create a profession group with full information
     * 
     * @param sector parent sector
     * @param name profession name
     * @param description profession description
     * @param requiresVerification whether verification is required
     * @param displayOrder display order
     * @return new ProfessionGroup instance
     */
    public static ProfessionGroup create(
            Sector sector,
            String name,
            String description,
            boolean requiresVerification,
            Integer displayOrder) {
        
        ProfessionGroup professionGroup = create(sector, name, requiresVerification);
        professionGroup.setDescription(description);
        professionGroup.setDisplayOrder(displayOrder != null && displayOrder >= 0 ? displayOrder : 0);
        return professionGroup;
    }

    // =====================================================
    // toString for Logging
    // =====================================================

    @Override
    public String toString() {
        return "ProfessionGroup{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", sector=" + (sector != null ? sector.getCode() : "null") +
                ", requiresVerification=" + requiresVerification +
                ", isActive=" + isActive +
                ", displayOrder=" + displayOrder +
                '}';
    }
}
