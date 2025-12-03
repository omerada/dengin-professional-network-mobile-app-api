package com.meslektas.identity.domain.model;

import com.meslektas.shared.domain.ValueObject;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * FullName Value Object
 * 
 * Represents a user's full name with Turkish language support.
 * 
 * Features:
 * - Turkish character normalization
 * - Proper capitalization (Turkish rules)
 * - Name component extraction
 * - Display formatting
 * 
 * Business Rules:
 * - First name and last name required
 * - Each name 2-50 characters
 * - Only letters, hyphens, apostrophes, spaces allowed
 * - Turkish characters fully supported (ğ, ü, ş, ı, ö, ç)
 */
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA
public class FullName implements ValueObject {
    
    private static final int MIN_NAME_LENGTH = 2;
    private static final int MAX_NAME_LENGTH = 50;
    
    // Pattern for valid name characters (including Turkish)
    private static final Pattern VALID_NAME_PATTERN = Pattern.compile(
        "^[a-zA-ZğüşıöçĞÜŞİÖÇ][a-zA-ZğüşıöçĞÜŞİÖÇ'\\-\\s]*[a-zA-ZğüşıöçĞÜŞİÖÇ]$"
    );
    
    // Pattern to detect multiple spaces
    private static final Pattern MULTIPLE_SPACES = Pattern.compile("\\s{2,}");
    
    private String firstName;
    private String lastName;
    
    /**
     * Private constructor - use factory method
     */
    private FullName(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
    
    /**
     * Create FullName from first and last name
     * 
     * @param firstName First name
     * @param lastName Last name
     * @return FullName value object
     * @throws IllegalArgumentException if names are invalid
     */
    public static FullName of(String firstName, String lastName) {
        String normalizedFirst = normalizeAndValidate(firstName, "Ad");
        String normalizedLast = normalizeAndValidate(lastName, "Soyad");
        
        return new FullName(normalizedFirst, normalizedLast);
    }
    
    /**
     * Create FullName from a single full name string
     * Splits on last space (handles multi-part first names)
     * 
     * @param fullName Full name string
     * @return FullName value object
     */
    public static FullName fromString(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("İsim boş olamaz");
        }
        
        String trimmed = fullName.trim();
        String normalized = MULTIPLE_SPACES.matcher(trimmed).replaceAll(" ");
        
        int lastSpace = normalized.lastIndexOf(' ');
        if (lastSpace == -1) {
            throw new IllegalArgumentException("Ad ve soyad girilmelidir");
        }
        
        String firstName = normalized.substring(0, lastSpace);
        String lastName = normalized.substring(lastSpace + 1);
        
        return of(firstName, lastName);
    }
    
    /**
     * Normalize and validate a name component
     */
    private static String normalizeAndValidate(String name, String fieldName) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(fieldName + " boş olamaz");
        }
        
        // Normalize and trim
        String normalized = normalizeText(name.trim());
        normalized = MULTIPLE_SPACES.matcher(normalized).replaceAll(" ");
        
        // Length validation
        if (normalized.length() < MIN_NAME_LENGTH) {
            throw new IllegalArgumentException(
                fieldName + " en az " + MIN_NAME_LENGTH + " karakter olmalıdır"
            );
        }
        
        if (normalized.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(
                fieldName + " en fazla " + MAX_NAME_LENGTH + " karakter olabilir"
            );
        }
        
        // Pattern validation
        if (!VALID_NAME_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                fieldName + " sadece harf, tire ve apostrof içerebilir"
            );
        }
        
        // Apply Turkish capitalization
        return capitalizeTurkish(normalized);
    }
    
    /**
     * Normalize Unicode text (handle combining characters)
     */
    private static String normalizeText(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFC);
    }
    
    /**
     * Capitalize name with Turkish rules
     * Handles: İ/i, I/ı special cases
     */
    private static String capitalizeTurkish(String name) {
        if (name == null || name.isEmpty()) {
            return name;
        }
        
        StringBuilder result = new StringBuilder();
        boolean capitalizeNext = true;
        
        for (int i = 0; i < name.length(); i++) {
            char c = name.charAt(i);
            
            if (Character.isWhitespace(c) || c == '-' || c == '\'') {
                result.append(c);
                capitalizeNext = true;
            } else if (capitalizeNext) {
                result.append(toUpperCaseTurkish(c));
                capitalizeNext = false;
            } else {
                result.append(toLowerCaseTurkish(c));
            }
        }
        
        return result.toString();
    }
    
    /**
     * Turkish uppercase conversion
     */
    private static char toUpperCaseTurkish(char c) {
        return switch (c) {
            case 'i' -> 'İ';  // Turkish i -> İ
            case 'ı' -> 'I';  // Turkish ı -> I
            default -> Character.toUpperCase(c);
        };
    }
    
    /**
     * Turkish lowercase conversion
     */
    private static char toLowerCaseTurkish(char c) {
        return switch (c) {
            case 'I' -> 'ı';  // Turkish I -> ı
            case 'İ' -> 'i';  // Turkish İ -> i
            default -> Character.toLowerCase(c);
        };
    }
    
    /**
     * Get full name as single string
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    /**
     * Get display name (first name + last name initial)
     * For privacy-conscious displays
     */
    public String getDisplayName() {
        return firstName + " " + lastName.charAt(0) + ".";
    }
    
    /**
     * Get initials (e.g., "AK" for "Ahmet Kaya")
     */
    public String getInitials() {
        StringBuilder initials = new StringBuilder();
        
        // First name initials (handle multi-part first names)
        String[] firstParts = firstName.split("[\\s\\-]");
        for (String part : firstParts) {
            if (!part.isEmpty()) {
                initials.append(toUpperCaseTurkish(part.charAt(0)));
            }
        }
        
        // Last name initial
        initials.append(toUpperCaseTurkish(lastName.charAt(0)));
        
        // Limit to 3 characters
        if (initials.length() > 3) {
            return initials.substring(0, 1) + initials.substring(initials.length() - 1);
        }
        
        return initials.toString();
    }
    
    /**
     * Check if name contains Turkish-specific characters
     */
    public boolean hasTurkishCharacters() {
        String fullName = getFullName();
        return fullName.matches(".*[ğüşıöçĞÜŞİÖÇ].*");
    }
    
    /**
     * Get ASCII-safe version (for systems that don't support Turkish)
     */
    public String toAscii() {
        String fullName = getFullName();
        return fullName
            .replace("ğ", "g").replace("Ğ", "G")
            .replace("ü", "u").replace("Ü", "U")
            .replace("ş", "s").replace("Ş", "S")
            .replace("ı", "i").replace("I", "I")
            .replace("ö", "o").replace("Ö", "O")
            .replace("ç", "c").replace("Ç", "C")
            .replace("İ", "I");
    }
    
    @Override
    public String toString() {
        return getFullName();
    }
}
