package com.dengin.identity.application.dto.response;

import com.dengin.identity.domain.model.ProfessionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Profession entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionResponse {
    private Long id;
    private String name;
    private ProfessionCategory category;
    private String categoryDisplayName;
    private Boolean requiresVerification;
    private String description;
    private String iconUrl;
}
