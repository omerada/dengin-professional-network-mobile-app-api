package com.meslektas.verification.infrastructure.aws;

import com.meslektas.verification.domain.model.DataMatchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Data Matching Service
 * 
 * Matches extracted document data with user profile information.
 * Verifies that the document belongs to the person claiming verification.
 * 
 * Matching Strategies:
 * 1. Name matching (fuzzy with Turkish character support)
 * 2. Document number validation
 * 3. Profession/title extraction and matching
 * 
 * Business Rules:
 * - Name match >= 80%: Valid
 * - Turkish character normalization
 * - Fuzzy matching for OCR errors
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataMatchingService {
    
    private final RekognitionClient rekognitionClient;
    
    @Value("${aws.rekognition.bucket-name:meslektas-verifications}")
    private String bucketName;
    
    // Patterns for data extraction
    private static final Pattern TC_KIMLIK_PATTERN = Pattern.compile("\\b(\\d{11})\\b");
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "(?:ADI?|İSİM|NAME)[:\\s]*([A-ZÇĞİÖŞÜa-zçğıöşü\\s]+?)(?:\\s*SOYADI?|\\s*SURNAME|\\n|$)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    private static final Pattern SURNAME_PATTERN = Pattern.compile(
        "(?:SOYADI?|SURNAME)[:\\s]*([A-ZÇĞİÖŞÜa-zçğıöşü\\s]+?)(?:\\n|$)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    private static final Pattern FULLNAME_PATTERN = Pattern.compile(
        "(?:ADI SOYADI|AD SOYAD|İSİM|NAME)[:\\s]*([A-ZÇĞİÖŞÜa-zçğıöşü\\s]+?)(?:\\n|$)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    
    // Profession keywords
    private static final Map<String, List<String>> PROFESSION_KEYWORDS = Map.of(
        "DOCTOR", List.of("DOKTOR", "DR.", "HEKİM", "TIP", "MEDICINE", "MEDICAL"),
        "ENGINEER", List.of("MÜHENDİS", "ENGINEER", "MÜHENDİSLİK", "ENGINEERING"),
        "LAWYER", List.of("AVUKAT", "HUKUK", "LAWYER", "LAW", "ATTORNEY"),
        "NURSE", List.of("HEMŞİRE", "NURSE", "NURSING"),
        "PHARMACIST", List.of("ECZACI", "PHARMACIST", "PHARMACY"),
        "ARCHITECT", List.of("MİMAR", "ARCHITECT", "ARCHITECTURE"),
        "TEACHER", List.of("ÖĞRETMEN", "TEACHER", "EĞİTİM", "EDUCATION"),
        "ACCOUNTANT", List.of("MUHASEBECİ", "ACCOUNTANT", "MALI MÜŞAVİR")
    );
    
    /**
     * Match document data with user profile
     * 
     * @param documentS3Key S3 key of the document
     * @param profileName User's full name from profile
     * @param profileProfession User's selected profession
     * @return DataMatchResult with matching details
     */
    public DataMatchResult matchData(
        String documentS3Key,
        String profileName,
        String profileProfession
    ) {
        try {
            log.info("Starting data matching for document: {}", documentS3Key);
            
            // Extract text from document
            DetectTextResponse textResponse = detectText(documentS3Key);
            
            if (textResponse.textDetections().isEmpty()) {
                log.warn("No text detected in document: {}", documentS3Key);
                return DataMatchResult.noMatch("No text could be extracted from document");
            }
            
            // Extract all text as string
            String fullText = buildFullText(textResponse);
            log.debug("Extracted text: {}", fullText.substring(0, Math.min(500, fullText.length())));
            
            // Extract document number
            String extractedDocNumber = extractDocumentNumber(fullText);
            boolean docNumberValid = extractedDocNumber != null && !extractedDocNumber.isEmpty();
            
            // Extract name from document
            String extractedName = extractName(textResponse, fullText);
            
            // Calculate name match score
            double nameMatchScore = 0.0;
            if (extractedName != null && profileName != null) {
                nameMatchScore = DataMatchResult.calculateNameSimilarity(extractedName, profileName);
            }
            
            // Extract and match profession
            String extractedProfession = extractProfession(fullText);
            double professionMatchScore = 0.0;
            if (extractedProfession != null && profileProfession != null) {
                professionMatchScore = calculateProfessionMatch(extractedProfession, profileProfession);
            }
            
            // Calculate overall match score
            double overallScore = calculateOverallScore(
                nameMatchScore,
                professionMatchScore,
                docNumberValid
            );
            
            log.info("Data matching results - Name: {:.2f}%, Profession: {:.2f}%, Overall: {:.2f}%",
                nameMatchScore, professionMatchScore, overallScore);
            
            String matchDetails = buildMatchDetails(
                extractedName, profileName, nameMatchScore,
                extractedProfession, profileProfession, professionMatchScore,
                extractedDocNumber
            );
            
            return DataMatchResult.matched(
                overallScore,
                nameMatchScore,
                extractedName,
                profileName,
                professionMatchScore,
                extractedProfession,
                extractedDocNumber,
                docNumberValid,
                matchDetails
            );
            
        } catch (RekognitionException e) {
            log.error("AWS Rekognition error during data matching: {}", 
                e.awsErrorDetails().errorMessage(), e);
            return DataMatchResult.noMatch("Rekognition error: " + e.awsErrorDetails().errorMessage());
        } catch (Exception e) {
            log.error("Data matching failed for document: {}", documentS3Key, e);
            return DataMatchResult.noMatch("Data matching failed: " + e.getMessage());
        }
    }
    
    /**
     * Detect text in document
     */
    private DetectTextResponse detectText(String documentS3Key) {
        DetectTextRequest request = DetectTextRequest.builder()
            .image(Image.builder()
                .s3Object(S3Object.builder()
                    .bucket(bucketName)
                    .name(documentS3Key)
                    .build())
                .build())
            .build();
        
        return rekognitionClient.detectText(request);
    }
    
    /**
     * Build full text from detections
     */
    private String buildFullText(DetectTextResponse response) {
        StringBuilder sb = new StringBuilder();
        
        response.textDetections().stream()
            .filter(t -> t.type() == TextTypes.LINE)
            .sorted((a, b) -> {
                // Sort by vertical position first, then horizontal
                float aTop = a.geometry().boundingBox().top();
                float bTop = b.geometry().boundingBox().top();
                if (Math.abs(aTop - bTop) < 0.02) { // Same line
                    return Float.compare(
                        a.geometry().boundingBox().left(),
                        b.geometry().boundingBox().left()
                    );
                }
                return Float.compare(aTop, bTop);
            })
            .forEach(t -> {
                sb.append(t.detectedText()).append("\n");
            });
        
        return sb.toString();
    }
    
    /**
     * Extract document number (TC Kimlik, etc.)
     */
    private String extractDocumentNumber(String text) {
        Matcher tcMatcher = TC_KIMLIK_PATTERN.matcher(text);
        if (tcMatcher.find()) {
            String tcNo = tcMatcher.group(1);
            // Validate TC Kimlik checksum
            if (isValidTCKimlik(tcNo)) {
                return tcNo;
            }
        }
        return null;
    }
    
    /**
     * Validate Turkish ID number (TC Kimlik) checksum
     */
    private boolean isValidTCKimlik(String tcNo) {
        if (tcNo == null || tcNo.length() != 11) return false;
        if (tcNo.charAt(0) == '0') return false;
        
        try {
            int[] digits = new int[11];
            for (int i = 0; i < 11; i++) {
                digits[i] = Character.getNumericValue(tcNo.charAt(i));
            }
            
            // 10th digit validation
            int sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
            int sum2 = digits[1] + digits[3] + digits[5] + digits[7];
            int digit10 = (sum1 - sum2) % 10;
            if (digit10 < 0) digit10 += 10;
            
            if (digits[9] != digit10) return false;
            
            // 11th digit validation
            int sum = 0;
            for (int i = 0; i < 10; i++) {
                sum += digits[i];
            }
            
            return digits[10] == sum % 10;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Extract name from document using multiple strategies
     */
    private String extractName(DetectTextResponse response, String fullText) {
        // Strategy 1: Look for labeled name field
        Matcher fullNameMatcher = FULLNAME_PATTERN.matcher(fullText);
        if (fullNameMatcher.find()) {
            String name = fullNameMatcher.group(1).trim();
            if (name.length() >= 3) {
                return cleanName(name);
            }
        }
        
        // Strategy 2: Look for separate name and surname
        Matcher nameMatcher = NAME_PATTERN.matcher(fullText);
        Matcher surnameMatcher = SURNAME_PATTERN.matcher(fullText);
        
        if (nameMatcher.find() && surnameMatcher.find()) {
            String firstName = nameMatcher.group(1).trim();
            String surname = surnameMatcher.group(1).trim();
            return cleanName(firstName + " " + surname);
        }
        
        // Strategy 3: Look for capitalized name-like text at top of document
        List<TextDetection> topTexts = response.textDetections().stream()
            .filter(t -> t.type() == TextTypes.LINE)
            .filter(t -> t.geometry().boundingBox().top() < 0.4) // Top 40% of document
            .filter(t -> t.confidence() > 80)
            .toList();
        
        for (TextDetection text : topTexts) {
            String detected = text.detectedText();
            // Check if it looks like a name (2-4 words, all letters)
            if (detected.matches("^[A-ZÇĞİÖŞÜa-zçğıöşü\\s]{4,50}$")) {
                String[] words = detected.trim().split("\\s+");
                if (words.length >= 2 && words.length <= 4) {
                    boolean allNameLike = Arrays.stream(words)
                        .allMatch(w -> w.matches("^[A-ZÇĞİÖŞÜ][a-zçğıöşü]+$"));
                    if (allNameLike) {
                        return detected.trim();
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Clean extracted name
     */
    private String cleanName(String name) {
        return name
            .replaceAll("\\s+", " ")
            .replaceAll("[^A-ZÇĞİÖŞÜa-zçğıöşü\\s]", "")
            .trim();
    }
    
    /**
     * Extract profession from document text
     */
    private String extractProfession(String fullText) {
        String upperText = fullText.toUpperCase(new Locale("tr", "TR"));
        
        for (Map.Entry<String, List<String>> entry : PROFESSION_KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (upperText.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }
        
        return null;
    }
    
    /**
     * Calculate profession match score
     */
    private double calculateProfessionMatch(String extractedProfession, String profileProfession) {
        if (extractedProfession == null || profileProfession == null) {
            return 0.0;
        }
        
        // Normalize both
        String normalizedExtracted = DataMatchResult.normalizeTurkish(extractedProfession);
        String normalizedProfile = DataMatchResult.normalizeTurkish(profileProfession);
        
        // Direct match
        if (normalizedExtracted.equals(normalizedProfile)) {
            return 100.0;
        }
        
        // Check if profile profession is in our keyword map
        for (Map.Entry<String, List<String>> entry : PROFESSION_KEYWORDS.entrySet()) {
            List<String> keywords = entry.getValue();
            
            boolean extractedMatch = entry.getKey().equals(normalizedExtracted) ||
                keywords.stream().anyMatch(k -> normalizedExtracted.contains(k.toUpperCase()));
            
            boolean profileMatch = keywords.stream()
                .anyMatch(k -> normalizedProfile.contains(k.toUpperCase()));
            
            if (extractedMatch && profileMatch) {
                return 90.0; // Same profession category
            }
        }
        
        // Fuzzy match
        return DataMatchResult.calculateNameSimilarity(extractedProfession, profileProfession);
    }
    
    /**
     * Calculate overall match score
     */
    private double calculateOverallScore(
        double nameMatchScore,
        double professionMatchScore,
        boolean docNumberValid
    ) {
        double score = 0.0;
        
        // Name match (50% weight)
        score += nameMatchScore * 0.50;
        
        // Profession match (35% weight)
        score += professionMatchScore * 0.35;
        
        // Document number validity (15% weight)
        if (docNumberValid) {
            score += 15.0;
        }
        
        return Math.min(100.0, score);
    }
    
    /**
     * Build detailed match information for audit
     */
    private String buildMatchDetails(
        String extractedName, String profileName, double nameMatch,
        String extractedProfession, String profileProfession, double professionMatch,
        String docNumber
    ) {
        return String.format(
            "{\"nameMatch\":{\"extracted\":\"%s\",\"profile\":\"%s\",\"score\":%.2f}," +
            "\"professionMatch\":{\"extracted\":\"%s\",\"profile\":\"%s\",\"score\":%.2f}," +
            "\"documentNumber\":\"%s\",\"timestamp\":\"%s\"}",
            extractedName != null ? extractedName : "",
            profileName != null ? profileName : "",
            nameMatch,
            extractedProfession != null ? extractedProfession : "",
            profileProfession != null ? profileProfession : "",
            professionMatch,
            docNumber != null ? docNumber : "",
            java.time.Instant.now()
        );
    }
}
