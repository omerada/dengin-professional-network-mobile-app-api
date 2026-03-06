package com.dengin.identity.domain.model;

import com.dengin.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Profession Entity (Identity Context)
 * 
 * Represents a professional category in the system.
 * Users can select one profession and optionally verify it.
 * 
 * DDD: Entity (not an Aggregate Root, belongs to User aggregate)
 */
@Entity
@Table(name = "professions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profession extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ProfessionCategory category;

    @Column(name = "requires_verification", nullable = false)
    private Boolean requiresVerification;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    /**
     * Check if this profession requires verification
     */
    public boolean needsVerification() {
        return Boolean.TRUE.equals(requiresVerification);
    }

    /**
     * Check if this is the general/default category
     */
    public boolean isGeneralCategory() {
        return category == ProfessionCategory.OTHER;
    }
}
