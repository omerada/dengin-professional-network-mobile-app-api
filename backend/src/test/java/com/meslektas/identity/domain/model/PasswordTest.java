package com.meslektas.identity.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Password Value Object
 */
@DisplayName("Password Value Object Tests")
class PasswordTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {
        
        @Test
        @DisplayName("should create password from valid input")
        void shouldCreatePasswordFromValidInput() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password).isNotNull();
            assertThat(password.getHashedValue()).isNotBlank();
        }
        
        @Test
        @DisplayName("should hash password on creation")
        void shouldHashPasswordOnCreation() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            // BCrypt hashed passwords start with $2a$ or $2b$
            assertThat(password.getHashedValue()).startsWith("$2");
            assertThat(password.getHashedValue()).hasSize(60);
        }
        
        @Test
        @DisplayName("should generate different hashes for same password")
        void shouldGenerateDifferentHashes() {
            Password password1 = Password.fromPlainText("ValidPass123!");
            Password password2 = Password.fromPlainText("ValidPass123!");
            
            // BCrypt generates different salts, so hashes should differ
            assertThat(password1.getHashedValue()).isNotEqualTo(password2.getHashedValue());
        }
    }
    
    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {
        
        @Test
        @DisplayName("should throw exception for null password")
        void shouldThrowForNull() {
            assertThatThrownBy(() -> Password.fromPlainText(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for empty password")
        void shouldThrowForEmpty() {
            assertThatThrownBy(() -> Password.fromPlainText(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for too short password")
        void shouldThrowForTooShort() {
            assertThatThrownBy(() -> Password.fromPlainText("Ab1!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("en az 8 karakter");
        }
        
        @Test
        @DisplayName("should throw exception for too long password")
        void shouldThrowForTooLong() {
            String longPassword = "A1!" + "a".repeat(130);
            
            assertThatThrownBy(() -> Password.fromPlainText(longPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("en fazla 128 karakter");
        }
        
        @Test
        @DisplayName("should throw exception for password without uppercase")
        void shouldThrowWithoutUppercase() {
            assertThatThrownBy(() -> Password.fromPlainText("validpass123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("büyük harf");
        }
        
        @Test
        @DisplayName("should throw exception for password without lowercase")
        void shouldThrowWithoutLowercase() {
            assertThatThrownBy(() -> Password.fromPlainText("VALIDPASS123!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("küçük harf");
        }
        
        @Test
        @DisplayName("should throw exception for password without digit")
        void shouldThrowWithoutDigit() {
            assertThatThrownBy(() -> Password.fromPlainText("ValidPassword!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("rakam");
        }
        
        @Test
        @DisplayName("should throw exception for password without special char")
        void shouldThrowWithoutSpecialChar() {
            assertThatThrownBy(() -> Password.fromPlainText("ValidPassword123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("özel karakter");
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "password123AAA!!!",
            "meslektas123AAA!!!"
        })
        @DisplayName("should throw exception for common passwords")
        void shouldThrowForCommonPasswords(String commonPassword) {
            assertThatThrownBy(() -> Password.fromPlainText(commonPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("yaygın");
        }
    }
    
    @Nested
    @DisplayName("Verification Tests")
    class VerificationTests {
        
        @Test
        @DisplayName("should verify correct password")
        void shouldVerifyCorrectPassword() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.matches("ValidPass123!")).isTrue();
        }
        
        @Test
        @DisplayName("should not verify incorrect password")
        void shouldNotVerifyIncorrectPassword() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.matches("WrongPassword123!")).isFalse();
        }
        
        @Test
        @DisplayName("should be case sensitive")
        void shouldBeCaseSensitive() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.matches("validpass123!")).isFalse();
        }
        
        @Test
        @DisplayName("should return false for null password match")
        void shouldReturnFalseForNullMatch() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.matches(null)).isFalse();
        }
        
        @Test
        @DisplayName("should return false for empty password match")
        void shouldReturnFalseForEmptyMatch() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.matches("")).isFalse();
        }
    }
    
    @Nested
    @DisplayName("Strength Calculation Tests")
    class StrengthTests {
        
        @Test
        @DisplayName("should calculate low strength score for weak password")
        void shouldCalculateLowStrengthScore() {
            // "Abcde123!" = 9 chars * 2 = 18 + 10 (upper) + 10 (lower) + 15 (digit) + 20 (special) = 73
            // This is actually a medium-strong password per algorithm
            int score = Password.calculateStrength("abc");
            
            assertThat(score).isLessThan(50);
        }
        
        @Test
        @DisplayName("should calculate medium strength score")
        void shouldCalculateMediumStrengthScore() {
            int score = Password.calculateStrength("Abcdefgh123!@#");
            
            assertThat(score).isGreaterThan(50);
            assertThat(score).isLessThan(90);
        }
        
        @Test
        @DisplayName("should calculate high strength score for strong password")
        void shouldCalculateHighStrengthScore() {
            int score = Password.calculateStrength("AbCdEfGhIjKl123!@#$%^");
            
            assertThat(score).isGreaterThanOrEqualTo(80);
        }
        
        @Test
        @DisplayName("should return correct strength label")
        void shouldReturnCorrectStrengthLabel() {
            assertThat(Password.getStrengthLabel("a")).isEqualTo("Çok Zayıf");
            assertThat(Password.getStrengthLabel("Abcdefgh123!@#")).isIn("Orta", "Güçlü");
        }
    }
    
    @Nested
    @DisplayName("Hash Creation Tests")
    class HashCreationTests {
        
        @Test
        @DisplayName("should create password from existing hash")
        void shouldCreateFromExistingHash() {
            Password original = Password.fromPlainText("ValidPass123!");
            Password fromHash = Password.fromHashedValue(original.getHashedValue());
            
            assertThat(fromHash.getHashedValue()).isEqualTo(original.getHashedValue());
            assertThat(fromHash.matches("ValidPass123!")).isTrue();
        }
        
        @Test
        @DisplayName("should throw for null hash")
        void shouldThrowForNullHash() {
            assertThatThrownBy(() -> Password.fromHashedValue(null))
                .isInstanceOf(IllegalArgumentException.class);
        }
        
        @Test
        @DisplayName("should throw for empty hash")
        void shouldThrowForEmptyHash() {
            assertThatThrownBy(() -> Password.fromHashedValue(""))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }
    
    @Nested
    @DisplayName("Needs Rehash Tests")
    class NeedsRehashTests {
        
        @Test
        @DisplayName("should not need rehash for new password")
        void shouldNotNeedRehashForNewPassword() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.needsRehash()).isFalse();
        }
    }
    
    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {
        
        @Test
        @DisplayName("should return protected string")
        void shouldReturnProtectedString() {
            Password password = Password.fromPlainText("ValidPass123!");
            
            assertThat(password.toString()).isEqualTo("[PROTECTED]");
            assertThat(password.toString()).doesNotContain("ValidPass123!");
        }
    }
}
