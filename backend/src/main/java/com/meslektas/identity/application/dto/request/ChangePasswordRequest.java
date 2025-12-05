package com.meslektas.identity.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Change Password Request DTO
 * 
 * Used by: POST /api/auth/change-password
 * 
 * Flow:
 * 1. Authenticated user enters current password
 * 2. User enters new password and confirmation
 * 3. Backend validates current password
 * 4. Password updated
 * 5. All other sessions invalidated (optional)
 * 6. Confirmation email sent
 * 
 * Validation:
 * - Current password: required
 * - New password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
 * char
 * - Confirm password: must match new password
 * 
 * Security:
 * - Rate limited: max 5 requests per hour per user
 * - Logs security event for audit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "Mevcut şifre boş olamaz")
    private String currentPassword;

    @NotBlank(message = "Yeni şifre boş olamaz")
    @Size(min = 8, max = 100, message = "Şifre 8-100 karakter arasında olmalı")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir")
    private String newPassword;

    @NotBlank(message = "Şifre tekrarı boş olamaz")
    private String confirmPassword;

    /**
     * Validate that new password and confirmation match
     */
    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }

    /**
     * Validate that new password is different from current password
     */
    public boolean isNewPasswordDifferent() {
        return currentPassword != null && !currentPassword.equals(newPassword);
    }
}
