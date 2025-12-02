package com.meslektas.identity.application.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for changing user profession
 */
public record ChangeProfessionRequest(
        @NotNull(message = "Profession ID is required")
        Long professionId
) {
}
