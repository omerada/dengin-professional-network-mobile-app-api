package com.meslektas.identity.domain.model;

import com.meslektas.shared.domain.ValueObject;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.regex.Pattern;

/**
 * Password Value Object
 * 
 * Secure password handling with:
 * - Strong validation rules
 * - BCrypt hashing
 * - Never exposes plain text
 * 
 * Password Rules (Turkish market standards):
 * - Minimum 8 characters
 * - Maximum 128 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 * - No whitespace
 * - No common passwords
 */
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA
public class Password implements ValueObject {
    
    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder(12);
    
    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;
    
    // Validation patterns
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s");
    
    // Common weak passwords (Turkish context)
    private static final String[] COMMON_PASSWORDS = {
        "password", "123456789", "12345678", "qwerty123", "abc123456",
        "password123", "admin123", "letmein123", "welcome123",
        "sifre123", "parola123", "turkiye123", "istanbul123",
        "meslektas123", "ankara123", "izmir123"
    };
    
    @Getter
    private String hashedValue;
    
    /**
     * Private constructor - use factory methods
     */
    private Password(String hashedValue) {
        this.hashedValue = hashedValue;
    }
    
    /**
     * Create Password from plain text with validation and hashing
     * 
     * @param plainPassword Plain text password
     * @return Password value object with hashed value
     * @throws IllegalArgumentException if password doesn't meet requirements
     */
    public static Password fromPlainText(String plainPassword) {
        validate(plainPassword);
        String hashed = ENCODER.encode(plainPassword);
        return new Password(hashed);
    }
    
    /**
     * Create Password from already hashed value (for loading from DB)
     * 
     * @param hashedPassword BCrypt hashed password
     * @return Password value object
     */
    public static Password fromHashedValue(String hashedPassword) {
        if (hashedPassword == null || hashedPassword.isBlank()) {
            throw new IllegalArgumentException("Hashed password cannot be empty");
        }
        return new Password(hashedPassword);
    }
    
    /**
     * Validate password strength
     */
    private static void validate(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Şifre boş olamaz");
        }
        
        if (password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Şifre en az " + MIN_LENGTH + " karakter olmalıdır");
        }
        
        if (password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Şifre en fazla " + MAX_LENGTH + " karakter olabilir");
        }
        
        if (WHITESPACE_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("Şifre boşluk içeremez");
        }
        
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("Şifre en az bir büyük harf içermelidir");
        }
        
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("Şifre en az bir küçük harf içermelidir");
        }
        
        if (!DIGIT_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("Şifre en az bir rakam içermelidir");
        }
        
        if (!SPECIAL_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("Şifre en az bir özel karakter içermelidir (!@#$%^&*...)");
        }
        
        // Check common passwords
        String lowerPassword = password.toLowerCase();
        for (String common : COMMON_PASSWORDS) {
            if (lowerPassword.contains(common)) {
                throw new IllegalArgumentException("Bu şifre çok yaygın ve güvensiz");
            }
        }
    }
    
    /**
     * Verify if plain text password matches this password
     * 
     * @param plainPassword Plain text password to check
     * @return true if matches
     */
    public boolean matches(String plainPassword) {
        if (plainPassword == null || plainPassword.isBlank()) {
            return false;
        }
        return ENCODER.matches(plainPassword, hashedValue);
    }
    
    /**
     * Check if password needs rehashing (e.g., after algorithm upgrade)
     */
    public boolean needsRehash() {
        // BCrypt passwords start with $2a$, $2b$, or $2y$
        // Check if current hash uses recommended strength
        if (hashedValue == null) {
            return true;
        }
        
        // Check for BCrypt format and strength (cost factor 12)
        return !hashedValue.startsWith("$2") || 
               !hashedValue.contains("$12$");
    }
    
    /**
     * Calculate password strength score (0-100)
     * Used for UI feedback
     */
    public static int calculateStrength(String plainPassword) {
        if (plainPassword == null || plainPassword.isBlank()) {
            return 0;
        }
        
        int score = 0;
        
        // Length score (up to 30 points)
        score += Math.min(plainPassword.length() * 2, 30);
        
        // Uppercase (10 points)
        if (UPPERCASE_PATTERN.matcher(plainPassword).find()) {
            score += 10;
        }
        
        // Lowercase (10 points)
        if (LOWERCASE_PATTERN.matcher(plainPassword).find()) {
            score += 10;
        }
        
        // Digits (15 points)
        if (DIGIT_PATTERN.matcher(plainPassword).find()) {
            score += 15;
        }
        
        // Special characters (20 points)
        if (SPECIAL_PATTERN.matcher(plainPassword).find()) {
            score += 20;
        }
        
        // Multiple special characters (5 bonus)
        long specialCount = plainPassword.chars()
            .filter(c -> "!@#$%^&*()_+-=[]{}|;':\",./<>?".indexOf(c) >= 0)
            .count();
        if (specialCount >= 2) {
            score += 5;
        }
        
        // Length bonus for very long passwords (10 points)
        if (plainPassword.length() >= 16) {
            score += 10;
        }
        
        return Math.min(score, 100);
    }
    
    /**
     * Get strength label for UI
     */
    public static String getStrengthLabel(String plainPassword) {
        int score = calculateStrength(plainPassword);
        
        if (score < 30) return "Çok Zayıf";
        if (score < 50) return "Zayıf";
        if (score < 70) return "Orta";
        if (score < 90) return "Güçlü";
        return "Çok Güçlü";
    }
    
    @Override
    public String toString() {
        // Never expose password, even hashed
        return "[PROTECTED]";
    }
}
