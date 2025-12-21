package com.dengin.identity.domain.model;

import com.dengin.identity.domain.model.ProfessionCategory;
import com.dengin.identity.domain.model.Sector;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit Tests for Sector Entity
 * 
 * Tests domain logic and business rules without database.
 * Focuses on factory methods, state changes, and validation.
 */
@DisplayName("Sector Entity Tests")
class SectorTest {

    @Nested
    @DisplayName("Factory Methods")
    class FactoryMethodTests {

        @Test
        @DisplayName("Should create sector with code and name")
        void shouldCreateSectorWithCodeAndName() {
            // When
            Sector sector = Sector.create("MEDICAL", "Sağlık");

            // Then
            assertThat(sector).isNotNull();
            assertThat(sector.getCode()).isEqualTo("MEDICAL");
            assertThat(sector.getName()).isEqualTo("Sağlık");
            assertThat(sector.getIsActive()).isTrue();
            assertThat(sector.getDisplayOrder()).isEqualTo(0);
        }

        @Test
        @DisplayName("Should uppercase sector code automatically")
        void shouldUppercaseSectorCode() {
            // When
            Sector sector = Sector.create("medical", "Sağlık");

            // Then
            assertThat(sector.getCode()).isEqualTo("MEDICAL");
        }

        @Test
        @DisplayName("Should create sector with full information")
        void shouldCreateSectorWithFullInfo() {
            // When
            Sector sector = Sector.create("LEGAL", "Hukuk", "Hukuk sektörü", 2);

            // Then
            assertThat(sector.getCode()).isEqualTo("LEGAL");
            assertThat(sector.getName()).isEqualTo("Hukuk");
            assertThat(sector.getDescription()).isEqualTo("Hukuk sektörü");
            assertThat(sector.getDisplayOrder()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should throw exception when code is null")
        void shouldThrowExceptionWhenCodeIsNull() {
            // When & Then
            assertThatThrownBy(() -> Sector.create(null, "Test"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("code cannot be null");
        }

        @Test
        @DisplayName("Should throw exception when name is null")
        void shouldThrowExceptionWhenNameIsNull() {
            // When & Then
            assertThatThrownBy(() -> Sector.create("TEST", null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("name cannot be null");
        }
    }

    @Nested
    @DisplayName("Business Logic")
    class BusinessLogicTests {

        @Test
        @DisplayName("Should identify general sector (OTHER)")
        void shouldIdentifyGeneralSector() {
            // Given
            Sector generalSector = Sector.create("OTHER", "Diğer");
            Sector medicalSector = Sector.create("MEDICAL", "Sağlık");

            // Then
            assertThat(generalSector.isGeneralSector()).isTrue();
            assertThat(medicalSector.isGeneralSector()).isFalse();
        }

        @Test
        @DisplayName("Should identify professional sectors")
        void shouldIdentifyProfessionalSectors() {
            // Given
            Sector medical = Sector.create("MEDICAL", "Sağlık");
            Sector legal = Sector.create("LEGAL", "Hukuk");
            Sector engineering = Sector.create("ENGINEERING", "Mühendislik");
            Sector education = Sector.create("EDUCATION", "Eğitim");
            Sector service = Sector.create("SERVICE", "Hizmet");

            // Then
            assertThat(medical.isProfessionalSector()).isTrue();
            assertThat(legal.isProfessionalSector()).isTrue();
            assertThat(engineering.isProfessionalSector()).isTrue();
            assertThat(education.isProfessionalSector()).isTrue();
            assertThat(service.isProfessionalSector()).isFalse();
        }

        @Test
        @DisplayName("Should check if sector is available")
        void shouldCheckIfSectorIsAvailable() {
            // Given
            Sector sector = Sector.create("TECH", "Teknoloji");

            // Then
            assertThat(sector.isAvailable()).isTrue();

            // When deactivated
            sector.deactivate();

            // Then
            assertThat(sector.isAvailable()).isFalse();
        }
    }

    @Nested
    @DisplayName("State Changes")
    class StateChangeTests {

        @Test
        @DisplayName("Should activate sector")
        void shouldActivateSector() {
            // Given
            Sector sector = Sector.create("TEST", "Test");
            sector.deactivate();

            // When
            sector.activate();

            // Then
            assertThat(sector.getIsActive()).isTrue();
            assertThat(sector.isAvailable()).isTrue();
        }

        @Test
        @DisplayName("Should deactivate sector")
        void shouldDeactivateSector() {
            // Given
            Sector sector = Sector.create("TEST", "Test");

            // When
            sector.deactivate();

            // Then
            assertThat(sector.getIsActive()).isFalse();
            assertThat(sector.isAvailable()).isFalse();
        }

        @Test
        @DisplayName("Should update display info")
        void shouldUpdateDisplayInfo() {
            // Given
            Sector sector = Sector.create("TEST", "Original");

            // When
            sector.updateDisplayInfo("Updated Name", "New description", "http://icon.url");

            // Then
            assertThat(sector.getName()).isEqualTo("Updated Name");
            assertThat(sector.getDescription()).isEqualTo("New description");
            assertThat(sector.getIconUrl()).isEqualTo("http://icon.url");
        }

        @Test
        @DisplayName("Should not update name if blank")
        void shouldNotUpdateNameIfBlank() {
            // Given
            Sector sector = Sector.create("TEST", "Original");

            // When
            sector.updateDisplayInfo("", "New desc", null);

            // Then
            assertThat(sector.getName()).isEqualTo("Original");
            assertThat(sector.getDescription()).isEqualTo("New desc");
        }

        @Test
        @DisplayName("Should update display order")
        void shouldUpdateDisplayOrder() {
            // Given
            Sector sector = Sector.create("TEST", "Test");

            // When
            sector.updateDisplayOrder(5);

            // Then
            assertThat(sector.getDisplayOrder()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should not update display order if negative")
        void shouldNotUpdateDisplayOrderIfNegative() {
            // Given
            Sector sector = Sector.create("TEST", "Test");
            sector.setDisplayOrder(3);

            // When
            sector.updateDisplayOrder(-1);

            // Then
            assertThat(sector.getDisplayOrder()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Migration Helpers")
    class MigrationHelperTests {

        @Test
        @DisplayName("Should convert from ProfessionCategory enum")
        void shouldConvertFromProfessionCategory() {
            // When
            Sector sector = Sector.fromProfessionCategory(ProfessionCategory.MEDICAL);

            // Then
            assertThat(sector).isNotNull();
            assertThat(sector.getCode()).isEqualTo("MEDICAL");
            assertThat(sector.getName()).isEqualTo(ProfessionCategory.MEDICAL.getDisplayName());
            assertThat(sector.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("Should return null for null category")
        void shouldReturnNullForNullCategory() {
            // When
            Sector sector = Sector.fromProfessionCategory(null);

            // Then
            assertThat(sector).isNull();
        }

        @Test
        @DisplayName("Should convert all profession categories")
        void shouldConvertAllProfessionCategories() {
            // Test all enum values
            for (ProfessionCategory category : ProfessionCategory.values()) {
                // When
                Sector sector = Sector.fromProfessionCategory(category);

                // Then
                assertThat(sector).isNotNull();
                assertThat(sector.getCode()).isEqualTo(category.name());
                assertThat(sector.getIsActive()).isTrue();
            }
        }
    }

    @Nested
    @DisplayName("ToString and Logging")
    class ToStringTests {

        @Test
        @DisplayName("Should generate proper toString")
        void shouldGenerateProperToString() {
            // Given
            Sector sector = Sector.create("MEDICAL", "Sağlık");

            // When
            String result = sector.toString();

            // Then
            assertThat(result).contains("Sector");
            assertThat(result).contains("MEDICAL");
            assertThat(result).contains("Sağlık");
        }
    }
}
