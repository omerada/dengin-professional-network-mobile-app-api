package com.dengin.identity.domain.model;

import com.dengin.identity.domain.model.FullName;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for FullName Value Object
 */
@DisplayName("FullName Value Object Tests")
class FullNameTest {

    @Nested
    @DisplayName("Creation Tests")
    class CreationTests {
        
        @Test
        @DisplayName("should create full name with first and last name")
        void shouldCreateWithFirstAndLastName() {
            FullName fullName = FullName.of("Ahmet", "Yılmaz");
            
            assertThat(fullName.getFirstName()).isEqualTo("Ahmet");
            assertThat(fullName.getLastName()).isEqualTo("Yılmaz");
        }
        
        @Test
        @DisplayName("should return correct full name")
        void shouldReturnCorrectFullName() {
            FullName fullName = FullName.of("Ahmet", "Yılmaz");
            
            assertThat(fullName.getFullName()).isEqualTo("Ahmet Yılmaz");
        }
        
        @Test
        @DisplayName("should normalize names with proper capitalization")
        void shouldNormalizeCapitalization() {
            FullName fullName = FullName.of("ahmet", "yilmaz");
            
            assertThat(fullName.getFirstName()).isEqualTo("Ahmet");
            assertThat(fullName.getLastName()).isEqualTo("Yilmaz");
        }
        
        @Test
        @DisplayName("should trim whitespace from names")
        void shouldTrimWhitespace() {
            FullName fullName = FullName.of("  Ahmet  ", "  Yılmaz  ");
            
            assertThat(fullName.getFirstName()).isEqualTo("Ahmet");
            assertThat(fullName.getLastName()).isEqualTo("Yılmaz");
        }
        
        @Test
        @DisplayName("should handle middle names")
        void shouldHandleMiddleNames() {
            FullName fullName = FullName.of("Ahmet Can", "Yılmaz");
            
            assertThat(fullName.getFirstName()).isEqualTo("Ahmet Can");
            assertThat(fullName.getLastName()).isEqualTo("Yılmaz");
        }
        
        @Test
        @DisplayName("should create from full name string")
        void shouldCreateFromString() {
            FullName fullName = FullName.fromString("Ahmet Yılmaz");
            
            assertThat(fullName.getFirstName()).isEqualTo("Ahmet");
            assertThat(fullName.getLastName()).isEqualTo("Yılmaz");
        }
    }
    
    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {
        
        @Test
        @DisplayName("should throw exception for null first name")
        void shouldThrowForNullFirstName() {
            assertThatThrownBy(() -> FullName.of(null, "Yılmaz"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for null last name")
        void shouldThrowForNullLastName() {
            assertThatThrownBy(() -> FullName.of("Ahmet", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for empty first name")
        void shouldThrowForEmptyFirstName() {
            assertThatThrownBy(() -> FullName.of("", "Yılmaz"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for empty last name")
        void shouldThrowForEmptyLastName() {
            assertThatThrownBy(() -> FullName.of("Ahmet", ""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("boş olamaz");
        }
        
        @Test
        @DisplayName("should throw exception for too short first name")
        void shouldThrowForTooShortFirstName() {
            assertThatThrownBy(() -> FullName.of("A", "Yılmaz"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("en az 2 karakter");
        }
        
        @Test
        @DisplayName("should throw exception for too short last name")
        void shouldThrowForTooShortLastName() {
            assertThatThrownBy(() -> FullName.of("Ahmet", "Y"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("en az 2 karakter");
        }
        
        @Test
        @DisplayName("should throw exception for too long first name")
        void shouldThrowForTooLongFirstName() {
            String longName = "Aa" + "a".repeat(49);
            
            assertThatThrownBy(() -> FullName.of(longName, "Yılmaz"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("en fazla 50 karakter");
        }
        
        @Test
        @DisplayName("should throw exception for too long last name")
        void shouldThrowForTooLongLastName() {
            String longName = "Aa" + "a".repeat(49);
            
            assertThatThrownBy(() -> FullName.of("Ahmet", longName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("en fazla 50 karakter");
        }
        
        @ParameterizedTest
        @ValueSource(strings = {
            "Ahmet123",
            "Ahmet@@@",
            "Ahmet!!!",
            "Ahmet###",
            "12345"
        })
        @DisplayName("should throw exception for invalid characters in first name")
        void shouldThrowForInvalidFirstName(String invalidName) {
            assertThatThrownBy(() -> FullName.of(invalidName, "Yılmaz"))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }
    
    @Nested
    @DisplayName("Turkish Character Tests")
    class TurkishCharacterTests {
        
        @ParameterizedTest
        @CsvSource({
            "Ahmet, Yılmaz",
            "Şebnem, Öztürk",
            "İsmail, Çelik",
            "Gülşen, Güneş",
            "Ümmühan, Çağlar",
            "Ömer, Şahin"
        })
        @DisplayName("should accept Turkish characters")
        void shouldAcceptTurkishCharacters(String firstName, String lastName) {
            FullName fullName = FullName.of(firstName, lastName);
            
            assertThat(fullName.getFirstName()).isNotNull();
            assertThat(fullName.getLastName()).isNotNull();
        }
        
        @Test
        @DisplayName("should detect Turkish characters")
        void shouldDetectTurkishCharacters() {
            FullName fullName = FullName.of("Gülşen", "Öztürk");
            
            assertThat(fullName.hasTurkishCharacters()).isTrue();
        }
        
        @Test
        @DisplayName("should not detect Turkish characters in ASCII name")
        void shouldNotDetectTurkishInAscii() {
            FullName fullName = FullName.of("Ahmet", "Kaya");
            
            assertThat(fullName.hasTurkishCharacters()).isFalse();
        }
    }
    
    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {
        
        @Test
        @DisplayName("should be equal for same names")
        void shouldBeEqualForSameNames() {
            FullName fullName1 = FullName.of("Ahmet", "Yılmaz");
            FullName fullName2 = FullName.of("Ahmet", "Yılmaz");
            
            assertThat(fullName1).isEqualTo(fullName2);
            assertThat(fullName1.hashCode()).isEqualTo(fullName2.hashCode());
        }
        
        @Test
        @DisplayName("should not be equal for different first names")
        void shouldNotBeEqualForDifferentFirstNames() {
            FullName fullName1 = FullName.of("Ahmet", "Yılmaz");
            FullName fullName2 = FullName.of("Mehmet", "Yılmaz");
            
            assertThat(fullName1).isNotEqualTo(fullName2);
        }
        
        @Test
        @DisplayName("should not be equal for different last names")
        void shouldNotBeEqualForDifferentLastNames() {
            FullName fullName1 = FullName.of("Ahmet", "Yılmaz");
            FullName fullName2 = FullName.of("Ahmet", "Öztürk");
            
            assertThat(fullName1).isNotEqualTo(fullName2);
        }
        
        @Test
        @DisplayName("should be equal with different case input")
        void shouldBeEqualWithDifferentCase() {
            // FullName normalizes names to proper Turkish capitalization
            // So both inputs become "Ahmet Yılmaz" after normalization
            FullName fullName1 = FullName.of("ahmet", "yılmaz");
            FullName fullName2 = FullName.of("AHMET", "YILMAZ");
            
            // Both should have same capitalized output
            assertThat(fullName1.getFirstName()).isEqualTo("Ahmet");
            assertThat(fullName2.getFirstName()).isEqualTo("Ahmet");
            assertThat(fullName1.getLastName()).isEqualTo("Yılmaz");
            assertThat(fullName2.getLastName()).isEqualTo("Yılmaz");
        }
    }
    
    @Nested
    @DisplayName("Initials Tests")
    class InitialsTests {
        
        @Test
        @DisplayName("should return correct initials")
        void shouldReturnCorrectInitials() {
            FullName fullName = FullName.of("Ahmet", "Yılmaz");
            
            assertThat(fullName.getInitials()).isEqualTo("AY");
        }
        
        @Test
        @DisplayName("should return Turkish initials correctly")
        void shouldReturnTurkishInitials() {
            FullName fullName = FullName.of("İsmail", "Öztürk");
            
            assertThat(fullName.getInitials()).isEqualTo("İÖ");
        }
        
        @Test
        @DisplayName("should handle middle name initials")
        void shouldHandleMiddleNameInitials() {
            FullName fullName = FullName.of("Ahmet Can", "Yılmaz");
            
            // Multi-part first names get their initials too
            assertThat(fullName.getInitials()).contains("A");
            assertThat(fullName.getInitials()).contains("Y");
        }
    }
    
    @Nested
    @DisplayName("Display Name Tests")
    class DisplayNameTests {
        
        @Test
        @DisplayName("should return display name with last name initial")
        void shouldReturnDisplayName() {
            FullName fullName = FullName.of("Ahmet", "Yılmaz");
            
            assertThat(fullName.getDisplayName()).isEqualTo("Ahmet Y.");
        }
    }
    
    @Nested
    @DisplayName("ASCII Conversion Tests")
    class AsciiConversionTests {
        
        @Test
        @DisplayName("should convert Turkish characters to ASCII")
        void shouldConvertToAscii() {
            FullName fullName = FullName.of("Gülşen", "Öztürk");
            
            assertThat(fullName.toAscii()).isEqualTo("Gulsen Ozturk");
        }
    }
    
    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {
        
        @Test
        @DisplayName("should handle hyphenated names")
        void shouldHandleHyphenatedNames() {
            FullName fullName = FullName.of("Anne-Marie", "Müller");
            
            assertThat(fullName.getFirstName()).isEqualTo("Anne-Marie");
        }
        
        @Test
        @DisplayName("should handle names with apostrophe")
        void shouldHandleApostrophe() {
            FullName fullName = FullName.of("John", "O'Connor");
            
            assertThat(fullName.getLastName()).isEqualTo("O'Connor");
        }
        
        @Test
        @DisplayName("should handle exactly 2 character names")
        void shouldHandleMinLengthNames() {
            FullName fullName = FullName.of("Al", "Li");
            
            assertThat(fullName.getFirstName()).isEqualTo("Al");
            assertThat(fullName.getLastName()).isEqualTo("Li");
        }
        
        @Test
        @DisplayName("should throw for single word full name")
        void shouldThrowForSingleWordFullName() {
            assertThatThrownBy(() -> FullName.fromString("Ahmet"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("soyad");
        }
    }
    
    @Nested
    @DisplayName("ToString Tests")
    class ToStringTests {
        
        @Test
        @DisplayName("should return full name in toString")
        void shouldReturnFullNameInToString() {
            FullName fullName = FullName.of("Ahmet", "Yılmaz");
            
            assertThat(fullName.toString()).isEqualTo("Ahmet Yılmaz");
        }
    }
}
