package com.dengin.identity.application.dto.response;

import com.dengin.identity.domain.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for User entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private String surname;
    private String fullName;
    private String bio;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String gender;
    
    // Profession
    private ProfessionResponse profession;
    private Boolean isProfessionVerified;
    private LocalDateTime professionVerifiedAt;
    
    // Status
    private Boolean isProfileComplete;
    private Boolean isEmailVerified;
    private UserStatus status;
    
    // Activity
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
