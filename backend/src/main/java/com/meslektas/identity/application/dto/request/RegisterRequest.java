package com.meslektas.identity.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for user registration
 */
public record RegisterRequest(
        @NotBlank(message = "E-posta adresi gereklidir")
        @Email(message = "Geçerli bir e-posta adresi giriniz")
        String email,

        @NotBlank(message = "Şifre gereklidir")
        @Size(min = 8, max = 100, message = "Şifre 8 ile 100 karakter arasında olmalıdır")
        String password,

        @NotBlank(message = "Ad gereklidir")
        @Size(min = 2, max = 100, message = "Ad 2 ile 100 karakter arasında olmalıdır")
        String name,

        @NotBlank(message = "Soyad gereklidir")
        @Size(min = 2, max = 100, message = "Soyad 2 ile 100 karakter arasında olmalıdır")
        String surname,

        Long professionId,

        @Size(max = 100, message = "Özel meslek adı en fazla 100 karakter olabilir")
        String customProfession
) {
}
