package com.meslektas.identity.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for PhoneNumber Value Object
 */
@DisplayName("PhoneNumber Value Object Tests")
class PhoneNumberTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {
        
        @Test
        @DisplayName("should create phone number from valid input")
        void shouldCreateFromValidInput() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone).isNotNull();
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
        
        @Test
        @DisplayName("should normalize phone number format")
        void shouldNormalizeFormat() {
            PhoneNumber phone = PhoneNumber.of("0555 123 45 67");
            
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
        
        @Test
        @DisplayName("should add country code if missing")
        void shouldAddCountryCode() {
            PhoneNumber phone = PhoneNumber.of("5551234567");
            
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
        
        @Test
        @DisplayName("should handle format with leading zero")
        void shouldHandleLeadingZero() {
            PhoneNumber phone = PhoneNumber.of("05551234567");
            
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
        
        @Test
        @DisplayName("should create nullable phone number")
        void shouldCreateNullablePhoneNumber() {
            PhoneNumber phone = PhoneNumber.ofNullable("invalid");
            
            assertThat(phone).isNull();
        }
        
        @Test
        @DisplayName("should create nullable phone number for valid input")
        void shouldCreateNullableForValid() {
            PhoneNumber phone = PhoneNumber.ofNullable("+905551234567");
            
            assertThat(phone).isNotNull();
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
    }
    
    @Nested
    @DisplayName("Turkish Mobile Prefixes Tests")
    class TurkishPrefixTests {
        
        @ParameterizedTest
        @ValueSource(strings = {
            "+905301234567",
            "+905321234567",
            "+905331234567",
            "+905341234567",
            "+905351234567",
            "+905361234567",
            "+905371234567",
            "+905381234567",
            "+905391234567"
        })
        @DisplayName("should accept Turkcell numbers")
        void shouldAcceptTurkcellNumbers(String number) {
            PhoneNumber phone = PhoneNumber.of(number);
            
            assertThat(phone.getValue()).isEqualTo(number);
            assertThat(phone.getOperator()).isEqualTo(PhoneNumber.Operator.TURKCELL);
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "+905401234567",
            "+905411234567",
            "+905421234567",
            "+905431234567",
            "+905441234567",
            "+905451234567",
            "+905461234567",
            "+905471234567",
            "+905481234567",
            "+905491234567"
        })
        @DisplayName("should accept Vodafone numbers")
        void shouldAcceptVodafoneNumbers(String number) {
            PhoneNumber phone = PhoneNumber.of(number);
            
            assertThat(phone.getValue()).isEqualTo(number);
            assertThat(phone.getOperator()).isEqualTo(PhoneNumber.Operator.VODAFONE);
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "+905051234567",
            "+905061234567",
            "+905511234567",
            "+905521234567",
            "+905531234567",
            "+905541234567",
            "+905551234567",
            "+905591234567"
        })
        @DisplayName("should accept Turk Telekom numbers")
        void shouldAcceptTurkTelekomNumbers(String number) {
            PhoneNumber phone = PhoneNumber.of(number);
            
            assertThat(phone.getValue()).isEqualTo(number);
            assertThat(phone.getOperator()).isEqualTo(PhoneNumber.Operator.TURK_TELEKOM);
        }
    }
    
    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {
        
        @Test
        @DisplayName("should throw exception for null phone")
        void shouldThrowForNull() {
            assertThatThrownBy(() -> PhoneNumber.of(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for empty phone")
        void shouldThrowForEmpty() {
            assertThatThrownBy(() -> PhoneNumber.of(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for too short number")
        void shouldThrowForTooShort() {
            assertThatThrownBy(() -> PhoneNumber.of("55512345"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10 haneli");
        }
        
        @Test
        @DisplayName("should throw exception for too long number")
        void shouldThrowForTooLong() {
            assertThatThrownBy(() -> PhoneNumber.of("555123456789"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10 haneli");
        }
    }
    
    @Nested
    @DisplayName("Mobile Type Tests")
    class MobileTypeTests {
        
        @Test
        @DisplayName("should identify mobile number")
        void shouldIdentifyMobileNumber() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.isMobile()).isTrue();
            assertThat(phone.isLandline()).isFalse();
        }
        
        @Test
        @DisplayName("should identify landline number")
        void shouldIdentifyLandlineNumber() {
            PhoneNumber phone = PhoneNumber.of("+902121234567");
            
            assertThat(phone.isLandline()).isTrue();
            assertThat(phone.isMobile()).isFalse();
        }
    }
    
    @Nested
    @DisplayName("Formatting Tests")
    class FormattingTests {
        
        @Test
        @DisplayName("should return formatted phone number")
        void shouldReturnFormattedNumber() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.getFormatted()).isEqualTo("0555 123 45 67");
        }
        
        @Test
        @DisplayName("should return international format")
        void shouldReturnInternationalFormat() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.getInternationalFormatted()).isEqualTo("+90 555 123 45 67");
        }
        
        @Test
        @DisplayName("should return masked phone number")
        void shouldReturnMaskedNumber() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.getMasked()).isEqualTo("+90 555 *** ** 67");
        }
    }
    
    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {
        
        @Test
        @DisplayName("should be equal for same number")
        void shouldBeEqualForSameNumber() {
            PhoneNumber phone1 = PhoneNumber.of("+905551234567");
            PhoneNumber phone2 = PhoneNumber.of("+905551234567");
            
            assertThat(phone1).isEqualTo(phone2);
            assertThat(phone1.hashCode()).isEqualTo(phone2.hashCode());
        }
        
        @Test
        @DisplayName("should be equal for same number with different formats")
        void shouldBeEqualForDifferentFormats() {
            PhoneNumber phone1 = PhoneNumber.of("+905551234567");
            PhoneNumber phone2 = PhoneNumber.of("0555 123 45 67");
            
            assertThat(phone1).isEqualTo(phone2);
        }
        
        @Test
        @DisplayName("should not be equal for different numbers")
        void shouldNotBeEqualForDifferentNumbers() {
            PhoneNumber phone1 = PhoneNumber.of("+905551234567");
            PhoneNumber phone2 = PhoneNumber.of("+905559876543");
            
            assertThat(phone1).isNotEqualTo(phone2);
        }
    }
    
    @Nested
    @DisplayName("Country Code Tests")
    class CountryCodeTests {
        
        @Test
        @DisplayName("should return country code")
        void shouldReturnCountryCode() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.getCountryCode()).isEqualTo("+90");
        }
        
        @Test
        @DisplayName("should return national number")
        void shouldReturnNationalNumber() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.getNationalNumber()).isEqualTo("5551234567");
        }
    }
    
    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {
        
        @ParameterizedTest
        @ValueSource(strings = {
            "  +905551234567  ",
            "\t+905551234567",
            "+905551234567\n"
        })
        @DisplayName("should handle whitespace")
        void shouldHandleWhitespace(String number) {
            PhoneNumber phone = PhoneNumber.of(number);
            
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "(0555) 123-4567",
            "0555.123.4567",
            "0555-123-4567",
            "+90 (555) 123 4567"
        })
        @DisplayName("should handle various separator formats")
        void shouldHandleVariousSeparators(String number) {
            PhoneNumber phone = PhoneNumber.of(number);
            
            assertThat(phone.getValue()).isEqualTo("+905551234567");
        }
    }
    
    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {
        
        @Test
        @DisplayName("should return value in toString")
        void shouldReturnValueInToString() {
            PhoneNumber phone = PhoneNumber.of("+905551234567");
            
            assertThat(phone.toString()).isEqualTo("+905551234567");
        }
    }
}
