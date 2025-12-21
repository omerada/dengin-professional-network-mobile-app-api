package com.dengin.identity.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Password Reset Request DTO
 * 
 * Used by: POST /api/auth/password-reset/request
 * 
 * Flow:
 * 1. User enters email
 * 2. Backend generates reset token (UUID)
 * 3. Token stored in Redis with 1-hour TTL
 * 4. Reset email sent with token link
 * 
 * Security:
 * - Rate limited: max 3 requests per hour per email
 * - Always returns 204 No Content (prevent email enumeration)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequest {

    @NotBlank(message = "Email boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;
}
