package com.meslektas.identity.application.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for updating user profile
 */
public record UpdateUserRequest(
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(min = 2, max = 100, message = "Surname must be between 2 and 100 characters")
        String surname,

        @Size(max = 500, message = "Bio must not exceed 500 characters")
        String bio,

        LocalDate dateOfBirth,

        String gender,

        Long professionId
) {
}
