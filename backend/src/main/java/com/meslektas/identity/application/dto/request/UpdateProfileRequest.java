package com.meslektas.identity.application.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Update User Profile Request DTO
 * 
 * Used by: PUT /api/users/{userId}
 * 
 * Validation Rules:
 * - Name: 2-100 characters, not blank
 * - Surname: 2-100 characters, not blank
 * - Bio: optional, max 500 characters
 * - Date of birth: optional, must be in the past, min age 13
 * - Gender: optional, predefined values
 * 
 * Business Rules Applied:
 * - Profile completeness recalculated after update
 * - ProfileUpdatedEvent published
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    @NotBlank(message = "Ad boş olamaz")
    @Size(min = 2, max = 100, message = "Ad 2-100 karakter arasında olmalı")
    private String name;
    
    @NotBlank(message = "Soyad boş olamaz")
    @Size(min = 2, max = 100, message = "Soyad 2-100 karakter arasında olmalı")
    private String surname;
    
    @Size(max = 500, message = "Bio maksimum 500 karakter olabilir")
    private String bio;
    
    @Past(message = "Doğum tarihi geçmişte olmalı")
    private LocalDate dateOfBirth;
    
    @Pattern(regexp = "MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY", 
             message = "Geçerli cinsiyet değeri giriniz")
    private String gender;
    
    /**
     * Validate minimum age (13 years)
     */
    public boolean isValidAge() {
        if (dateOfBirth == null) {
            return true; // Optional field
        }
        
        LocalDate minDate = LocalDate.now().minusYears(13);
        return dateOfBirth.isBefore(minDate);
    }
}
