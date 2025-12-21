package com.dengin.identity.domain.model;

import com.dengin.shared.domain.ValueObject;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.regex.Pattern;

/**
 * PhoneNumber Value Object
 * 
 * Turkish phone number representation and validation.
 * 
 * Supports:
 * - Turkish mobile numbers (5XX XXX XX XX)
 * - Turkish landline numbers (2XX XXX XX XX, 3XX XXX XX XX, 4XX XXX XX XX)
 * - International format storage (+90)
 * 
 * Features:
 * - Normalization from various input formats
 * - Operator detection (Turkcell, Vodafone, Türk Telekom)
 * - Masking for privacy
 */
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA
public class PhoneNumber implements ValueObject {
    
    private static final String TURKEY_COUNTRY_CODE = "+90";
    
    // Turkish mobile prefix pattern (5XX)
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^5[0-9]{9}$");
    
    // Turkish landline pattern (2XX, 3XX, 4XX)
    private static final Pattern LANDLINE_PATTERN = Pattern.compile("^[234][0-9]{9}$");
    
    // Input cleanup pattern - remove all non-digits except leading +
    private static final Pattern CLEANUP_PATTERN = Pattern.compile("[^0-9+]");
    
    // Operator prefixes
    private static final String[] TURKCELL_PREFIXES = {"530", "531", "532", "533", "534", "535", "536", "537", "538", "539"};
    private static final String[] VODAFONE_PREFIXES = {"540", "541", "542", "543", "544", "545", "546", "547", "548", "549"};
    private static final String[] TURK_TELEKOM_PREFIXES = {"500", "501", "502", "503", "504", "505", "506", "507", "508", "509", 
                                                           "551", "552", "553", "554", "555", "556", "557", "558", "559"};
    
    // Stored in international format: +905XXXXXXXXX
    private String value;
    
    /**
     * Private constructor - use factory method
     */
    private PhoneNumber(String value) {
        this.value = value;
    }
    
    /**
     * Create PhoneNumber from any format
     * 
     * Accepts:
     * - 5XXXXXXXXX
     * - 05XXXXXXXXX
     * - 905XXXXXXXXX
     * - +905XXXXXXXXX
     * - +90 5XX XXX XX XX
     * - (0532) 123 45 67
     * 
     * @param input Phone number in any format
     * @return PhoneNumber value object
     * @throws IllegalArgumentException if invalid
     */
    public static PhoneNumber of(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Telefon numarası boş olamaz");
        }
        
        String normalized = normalize(input);
        validate(normalized);
        
        return new PhoneNumber(TURKEY_COUNTRY_CODE + normalized);
    }
    
    /**
     * Create PhoneNumber, returning null if invalid
     */
    public static PhoneNumber ofNullable(String input) {
        if (input == null || input.isBlank()) {
            return null;
        }
        try {
            return of(input);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    /**
     * Normalize input to 10-digit Turkish format (5XXXXXXXXX)
     */
    private static String normalize(String input) {
        // Remove all non-digits and +
        String cleaned = CLEANUP_PATTERN.matcher(input).replaceAll("");
        
        // Handle different formats
        if (cleaned.startsWith("+90")) {
            cleaned = cleaned.substring(3);
        } else if (cleaned.startsWith("90") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        } else if (cleaned.startsWith("0") && cleaned.length() == 11) {
            cleaned = cleaned.substring(1);
        }
        
        return cleaned;
    }
    
    /**
     * Validate normalized number
     */
    private static void validate(String normalized) {
        if (normalized.length() != 10) {
            throw new IllegalArgumentException(
                "Telefon numarası 10 haneli olmalıdır (5XX XXX XX XX)"
            );
        }
        
        if (!MOBILE_PATTERN.matcher(normalized).matches() && 
            !LANDLINE_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                "Geçersiz Türkiye telefon numarası"
            );
        }
    }
    
    /**
     * Check if this is a mobile number
     */
    public boolean isMobile() {
        return getNationalNumber().startsWith("5");
    }
    
    /**
     * Check if this is a landline number
     */
    public boolean isLandline() {
        String national = getNationalNumber();
        return national.startsWith("2") || 
               national.startsWith("3") || 
               national.startsWith("4");
    }
    
    /**
     * Get the national format (without country code)
     * Returns: 5XXXXXXXXX
     */
    public String getNationalNumber() {
        return value.substring(3); // Remove +90
    }
    
    /**
     * Get formatted display: 0532 123 45 67
     */
    public String getFormatted() {
        String national = getNationalNumber();
        return String.format("0%s %s %s %s",
            national.substring(0, 3),
            national.substring(3, 6),
            national.substring(6, 8),
            national.substring(8, 10)
        );
    }
    
    /**
     * Get international format: +90 532 123 45 67
     */
    public String getInternationalFormatted() {
        String national = getNationalNumber();
        return String.format("+90 %s %s %s %s",
            national.substring(0, 3),
            national.substring(3, 6),
            national.substring(6, 8),
            national.substring(8, 10)
        );
    }
    
    /**
     * Get masked version for privacy: +90 532 *** ** 67
     */
    public String getMasked() {
        String national = getNationalNumber();
        return String.format("+90 %s *** ** %s",
            national.substring(0, 3),
            national.substring(8, 10)
        );
    }
    
    /**
     * Detect mobile operator
     */
    public Operator getOperator() {
        if (!isMobile()) {
            return Operator.LANDLINE;
        }
        
        String prefix = getNationalNumber().substring(0, 3);
        
        for (String p : TURKCELL_PREFIXES) {
            if (p.equals(prefix)) return Operator.TURKCELL;
        }
        
        for (String p : VODAFONE_PREFIXES) {
            if (p.equals(prefix)) return Operator.VODAFONE;
        }
        
        for (String p : TURK_TELEKOM_PREFIXES) {
            if (p.equals(prefix)) return Operator.TURK_TELEKOM;
        }
        
        return Operator.OTHER;
    }
    
    /**
     * Get country code
     */
    public String getCountryCode() {
        return TURKEY_COUNTRY_CODE;
    }
    
    @Override
    public String toString() {
        return value;
    }
    
    /**
     * Turkish mobile operators
     */
    public enum Operator {
        TURKCELL("Turkcell"),
        VODAFONE("Vodafone"),
        TURK_TELEKOM("Türk Telekom"),
        LANDLINE("Sabit Hat"),
        OTHER("Diğer");
        
        private final String displayName;
        
        Operator(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
