package com.meslektas.identity.domain.model;

import com.meslektas.shared.domain.ValueObject;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.regex.Pattern;

/**
 * Email Value Object
 * 
 * Immutable representation of a valid email address.
 * Encapsulates email validation rules and normalization.
 * 
 * Domain Rules:
 * - Must be valid email format
 * - Maximum 254 characters (RFC 5321)
 * - Normalized to lowercase
 * - No leading/trailing whitespace
 */
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA
public class Email implements ValueObject {
    
    /**
     * RFC 5322 compliant email regex pattern
     * Simplified version for practical use
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?" +
        "(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    );
    
    private static final int MAX_LENGTH = 254;
    
    // Known disposable email domains (Turkish and international)
    private static final String[] DISPOSABLE_DOMAINS = {
        "tempmail.com", "throwaway.email", "guerrillamail.com",
        "10minutemail.com", "mailinator.com", "yopmail.com",
        "temp-mail.org", "fakeinbox.com", "getnada.com"
    };
    
    private String value;
    
    /**
     * Private constructor - use factory methods
     */
    private Email(String email) {
        this.value = email.toLowerCase().trim();
    }
    
    /**
     * Create Email from string with validation
     * 
     * @param email Email address string
     * @return Email value object
     * @throws IllegalArgumentException if email is invalid
     */
    public static Email of(String email) {
        validate(email);
        return new Email(email);
    }
    
    /**
     * Create Email from string, returning null if invalid
     * 
     * @param email Email address string
     * @return Email value object or null
     */
    public static Email ofNullable(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        try {
            return of(email);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    /**
     * Validate email format
     */
    private static void validate(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email adresi boş olamaz");
        }
        
        String trimmed = email.trim();
        
        if (trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Email adresi çok uzun (max " + MAX_LENGTH + " karakter)");
        }
        
        if (!EMAIL_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Geçersiz email formatı: " + email);
        }
    }
    
    /**
     * Check if email is from a disposable/temporary email service
     */
    public boolean isDisposable() {
        String domain = getDomain();
        for (String disposable : DISPOSABLE_DOMAINS) {
            if (domain.equalsIgnoreCase(disposable)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get domain part of email
     */
    public String getDomain() {
        int atIndex = value.indexOf('@');
        return value.substring(atIndex + 1);
    }
    
    /**
     * Get local part of email (before @)
     */
    public String getLocalPart() {
        int atIndex = value.indexOf('@');
        return value.substring(0, atIndex);
    }
    
    /**
     * Check if email is from a Turkish domain
     */
    public boolean isTurkishDomain() {
        String domain = getDomain().toLowerCase();
        return domain.endsWith(".tr") ||
               domain.endsWith(".com.tr") ||
               domain.endsWith(".edu.tr") ||
               domain.endsWith(".gov.tr") ||
               domain.endsWith(".org.tr");
    }
    
    /**
     * Mask email for display (privacy)
     * Example: j***@gmail.com
     */
    public String masked() {
        String local = getLocalPart();
        String domain = getDomain();
        
        if (local.length() <= 2) {
            return local.charAt(0) + "***@" + domain;
        }
        
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
    
    @Override
    public String toString() {
        return value;
    }
}
