package com.dengin.identity.domain.model;

import com.dengin.identity.domain.model.Email;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Email Value Object
 */
@DisplayName("Email Value Object Tests")
class EmailTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {
        
        @Test
        @DisplayName("should create email with valid format")
        void shouldCreateEmailWithValidFormat() {
            Email email = Email.of("test@example.com");
            
            assertThat(email.getValue()).isEqualTo("test@example.com");
        }
        
        @Test
        @DisplayName("should normalize email to lowercase")
        void shouldNormalizeToLowercase() {
            Email email = Email.of("TEST@EXAMPLE.COM");
            
            assertThat(email.getValue()).isEqualTo("test@example.com");
        }
        
        @Test
        @DisplayName("should trim whitespace")
        void shouldTrimWhitespace() {
            Email email = Email.of("  test@example.com  ");
            
            assertThat(email.getValue()).isEqualTo("test@example.com");
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "user@domain.com",
            "user.name@domain.com",
            "user+tag@domain.com",
            "user@sub.domain.com",
            "user@domain.co.uk"
        })
        @DisplayName("should accept valid email formats")
        void shouldAcceptValidFormats(String validEmail) {
            Email email = Email.of(validEmail);
            
            assertThat(email.getValue()).isNotBlank();
        }
    }
    
    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {
        
        @Test
        @DisplayName("should throw exception for null email")
        void shouldThrowForNull() {
            assertThatThrownBy(() -> Email.of(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for empty email")
        void shouldThrowForEmpty() {
            assertThatThrownBy(() -> Email.of(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for blank email")
        void shouldThrowForBlank() {
            assertThatThrownBy(() -> Email.of("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "invalid",
            "invalid@",
            "@domain.com",
            "invalid@.com",
            "in valid@domain.com"
        })
        @DisplayName("should throw exception for invalid formats")
        void shouldThrowForInvalidFormats(String invalidEmail) {
            assertThatThrownBy(() -> Email.of(invalidEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Geçersiz email");
        }
        
        @Test
        @DisplayName("should throw exception for too long email")
        void shouldThrowForTooLongEmail() {
            String longEmail = "a".repeat(250) + "@example.com";
            
            assertThatThrownBy(() -> Email.of(longEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("çok uzun");
        }
    }
    
    @Nested
    @DisplayName("Domain Extraction Tests")
    class DomainExtractionTests {
        
        @Test
        @DisplayName("should extract domain correctly")
        void shouldExtractDomain() {
            Email email = Email.of("user@example.com");
            
            assertThat(email.getDomain()).isEqualTo("example.com");
        }
        
        @Test
        @DisplayName("should extract local part correctly")
        void shouldExtractLocalPart() {
            Email email = Email.of("user.name@example.com");
            
            assertThat(email.getLocalPart()).isEqualTo("user.name");
        }
    }
    
    @Nested
    @DisplayName("Turkish Domain Tests")
    class TurkishDomainTests {
        
        @ParameterizedTest
        @ValueSource(strings = {
            "user@company.com.tr",
            "user@university.edu.tr",
            "user@government.gov.tr",
            "user@organization.org.tr"
        })
        @DisplayName("should detect Turkish domains")
        void shouldDetectTurkishDomains(String turkishEmail) {
            Email email = Email.of(turkishEmail);
            
            assertThat(email.isTurkishDomain()).isTrue();
        }
        
        @Test
        @DisplayName("should return false for non-Turkish domains")
        void shouldReturnFalseForNonTurkishDomains() {
            Email email = Email.of("user@example.com");
            
            assertThat(email.isTurkishDomain()).isFalse();
        }
    }
    
    @Nested
    @DisplayName("Disposable Email Tests")
    class DisposableEmailTests {
        
        @ParameterizedTest
        @ValueSource(strings = {
            "user@tempmail.com",
            "user@throwaway.email",
            "user@mailinator.com"
        })
        @DisplayName("should detect disposable emails")
        void shouldDetectDisposableEmails(String disposableEmail) {
            Email email = Email.of(disposableEmail);
            
            assertThat(email.isDisposable()).isTrue();
        }
        
        @Test
        @DisplayName("should return false for regular emails")
        void shouldReturnFalseForRegularEmails() {
            Email email = Email.of("user@gmail.com");
            
            assertThat(email.isDisposable()).isFalse();
        }
    }
    
    @Nested
    @DisplayName("Masking Tests")
    class MaskingTests {
        
        @Test
        @DisplayName("should mask email correctly")
        void shouldMaskEmail() {
            Email email = Email.of("john.doe@example.com");
            
            assertThat(email.masked()).isEqualTo("j***e@example.com");
        }
        
        @Test
        @DisplayName("should handle short local part")
        void shouldHandleShortLocalPart() {
            Email email = Email.of("jo@example.com");
            
            assertThat(email.masked()).isEqualTo("j***@example.com");
        }
    }
    
    @Nested
    @DisplayName("Nullable Factory Tests")
    class NullableFactoryTests {
        
        @Test
        @DisplayName("should return null for null input")
        void shouldReturnNullForNullInput() {
            Email email = Email.ofNullable(null);
            
            assertThat(email).isNull();
        }
        
        @Test
        @DisplayName("should return null for invalid email")
        void shouldReturnNullForInvalidEmail() {
            Email email = Email.ofNullable("invalid");
            
            assertThat(email).isNull();
        }
        
        @Test
        @DisplayName("should return email for valid input")
        void shouldReturnEmailForValidInput() {
            Email email = Email.ofNullable("valid@example.com");
            
            assertThat(email).isNotNull();
            assertThat(email.getValue()).isEqualTo("valid@example.com");
        }
    }
    
    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {
        
        @Test
        @DisplayName("should be equal for same email")
        void shouldBeEqualForSameEmail() {
            Email email1 = Email.of("test@example.com");
            Email email2 = Email.of("TEST@EXAMPLE.COM");
            
            assertThat(email1).isEqualTo(email2);
            assertThat(email1.hashCode()).isEqualTo(email2.hashCode());
        }
        
        @Test
        @DisplayName("should not be equal for different emails")
        void shouldNotBeEqualForDifferentEmails() {
            Email email1 = Email.of("test1@example.com");
            Email email2 = Email.of("test2@example.com");
            
            assertThat(email1).isNotEqualTo(email2);
        }
    }
}
