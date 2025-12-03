package com.meslektas.identity.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Password Reset Confirmation DTO
 * 
 * Used by: POST /api/auth/password-reset/confirm
 * 
 * Flow:
 * 1. User clicks reset link with token
 * 2. User enters new password
 * 3. Backend validates token from Redis
 * 4. Password updated, all sessions invalidated
 * 5. Confirmation email sent
 * 
 * Validation:
 * - Token: UUID format
 * - Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetConfirmRequest {

    @NotBlank(message = "Reset token boş olamaz")
    private String resetToken;

    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 8, max = 100, message = "Şifre 8-100 karakter arasında olmalı")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir")
    private String newPassword;

    @NotBlank(message = "Şifre tekrarı boş olamaz")
    private String confirmPassword;

    /**
     * Validate that passwords match
     */
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
