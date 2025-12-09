package com.meslektas.identity.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.common.exception.ResourceNotFoundException;
import com.meslektas.identity.application.dto.request.LoginRequest;
import com.meslektas.identity.application.dto.request.RegisterRequest;
import com.meslektas.identity.application.dto.response.LoginResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.mapper.UserMapper;
import com.meslektas.identity.domain.model.Profession;
import com.meslektas.identity.domain.model.ProfessionCategory;
import com.meslektas.identity.domain.model.Sector;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.ProfessionRepository;
import com.meslektas.identity.domain.repository.SectorRepository;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.identity.infrastructure.security.JwtTokenProvider;
import com.meslektas.notification.domain.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

/**
 * Authentication Application Service
 * 
 * DDD Pattern: Application Service (orchestrates domain operations)
 * 
 * Responsibilities:
 * - Coordinate authentication operations
 * - Publish domain events
 * - Handle transactions
 * - Map between DTOs and domain models
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfessionRepository professionRepository;
    private final SectorRepository sectorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenProvider jwtService; // Alias for token generation
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${app.frontend-url:https://meslektas.com}")
    private String frontendUrl;

    private static final String EMAIL_VERIFICATION_PREFIX = "email_verification:";
    private static final long VERIFICATION_TOKEN_TTL_HOURS = 24;

    /**
     * Register a new user
     * 
     * Business Rule: Email must be unique
     * Returns LoginResponse with tokens for auto-login after registration
     * Sprint 1: Added sector-based community structure support
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.email());

        // Business validation
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(
                    "Bu e-posta adresi zaten kullanılıyor: " + request.email(),
                    "EMAIL_ALREADY_EXISTS");
        }

        // Create user aggregate (domain factory method)
        User user = User.createFromRegistration(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name(),
                request.surname());

        // Sprint 1: Set sector if provided (new community structure)
        if (request.sectorId() != null) {
            Sector sector = sectorRepository.findById(request.sectorId())
                    .orElseThrow(() -> new BusinessException(
                            "Geçersiz sektör seçimi",
                            "INVALID_SECTOR"));
            user.selectSector(sector);
            log.info("User registered with sector: {} ({})", sector.getName(), sector.getCode());
        }
        // Backward compatibility: profession still works
        else if (request.professionId() != null) {
            Profession profession = professionRepository.findById(request.professionId())
                    .orElseThrow(() -> new BusinessException(
                            "Geçersiz meslek seçimi",
                            "INVALID_PROFESSION"));
            user.selectProfession(profession);
            log.info("User registered with profession (deprecated): {}", profession.getName());
        } else if (request.customProfession() != null && !request.customProfession().isBlank()) {
            // Custom profession - validate and find OTHER category profession
            if (containsProfanity(request.customProfession())) {
                throw new BusinessException(
                        "Geçersiz meslek adı",
                        "INVALID_PROFESSION_NAME");
            }
            // Find or create 'OTHER' category profession
            Profession otherProfession = professionRepository.findByCategory(ProfessionCategory.OTHER)
                    .stream()
                    .findFirst()
                    .orElseGet(() -> {
                        Profession newProf = Profession.builder()
                                .name("Diğer")
                                .category(ProfessionCategory.OTHER)
                                .requiresVerification(false)
                                .build();
                        return professionRepository.save(newProf);
                    });
            user.selectProfession(otherProfession);
        }

        // Save
        User savedUser = userRepository.save(user);

        // Publish domain events
        savedUser.getEvents().forEach(eventPublisher::publishEvent);
        savedUser.clearEvents();

        log.info("User registered successfully: {}", savedUser.getEmail());

        // Send verification email
        sendVerificationEmail(savedUser);

        // Generate tokens for auto-login
        String accessToken = jwtTokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(userMapper.toResponse(savedUser))
                .build();
    }

    /**
     * Simple profanity check for custom profession
     */
    private boolean containsProfanity(String text) {
        String[] profanityWords = {"amk", "orospu", "piç", "s1k", "sik", "göt", "yarak", "am", "aq", "mk"};
        String lowerText = text.toLowerCase();
        for (String word : profanityWords) {
            if (lowerText.contains(word)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Login with email and password
     * 
     * Returns JWT access token and refresh token
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.email());

        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Find user
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(
                        "Kullanıcı bulunamadı: " + request.email(),
                        "USER_NOT_FOUND"));

        // Check if user is active
        if (!user.isActive()) {
            String reason = user.isBanned() ? "Hesabınız yasaklanmıştır" : "Hesabınız askıya alınmıştır";
            throw new BusinessException(reason, "ACCOUNT_INACTIVE");
        }

        // Record login (domain behavior)
        user.recordLogin();
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtTokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        log.info("User logged in successfully: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationInSeconds())
                .user(userMapper.toResponse(user))
                .build();
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional(readOnly = true)
    public LoginResponse refreshToken(String refreshToken) {
        log.info("Refreshing access token");

        // Validate refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Geçersiz yenileme tokeni", "INVALID_REFRESH_TOKEN");
        }

        // Get user ID from token
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        "Kullanıcı bulunamadı: " + userId,
                        "USER_NOT_FOUND"));

        // Check if user is active
        if (!user.isActive()) {
            throw new BusinessException("Hesabınız aktif değil", "ACCOUNT_INACTIVE");
        }

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateTokenFromUserId(userId, email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId, email);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationInSeconds())
                .build();
    }

    /**
     * Logout (client-side token deletion)
     * 
     * Note: Since we're using stateless JWT, logout is handled client-side.
     * For token blacklisting, implement Redis-based token store.
     */
    public void logout() {
        SecurityContextHolder.clearContext();
        log.info("User logged out");
    }

    /**
     * Verify email with token
     */
    @Transactional
    public void verifyEmail(String token) {
        log.info("Verifying email with token: {}", token);

        // Validate token from Redis
        String redisKey = EMAIL_VERIFICATION_PREFIX + token;
        String userIdStr = redisTemplate.opsForValue().get(redisKey);

        if (userIdStr == null) {
            throw new BusinessException("Geçersiz veya süresi dolmuş doğrulama linki", "INVALID_VERIFICATION_TOKEN");
        }

        // Find user
        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Verify email (domain behavior)
        user.verifyEmail();
        userRepository.save(user);

        // Delete token from Redis
        redisTemplate.delete(redisKey);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    /**
     * Resend verification email
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "'" + email + "' e-posta adresine sahip kullanıcı bulunamadı"));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BusinessException("E-posta zaten doğrulanmış", "EMAIL_ALREADY_VERIFIED");
        }

        sendVerificationEmail(user);
    }

    /**
     * Send verification email to user
     */
    private void sendVerificationEmail(User user) {
        // Generate verification token
        String token = java.util.UUID.randomUUID().toString();

        // Store in Redis
        String redisKey = EMAIL_VERIFICATION_PREFIX + token;
        redisTemplate.opsForValue().set(
                redisKey,
                user.getId().toString(),
                VERIFICATION_TOKEN_TTL_HOURS,
                TimeUnit.HOURS);

        // Build verification link
        String verificationLink = frontendUrl + "/verify-email?token=" + token;

        // Send email
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationLink);

        log.info("Verification email sent to: {}", user.getEmail());
    }

    /**
     * Change password for authenticated user
     * 
     * Business Rules:
     * - Current password must be verified
     * - New password must be different from current
     * - New password must meet strength requirements
     * 
     * Security:
     * - Rate limited: max 5 requests per hour per user
     * - Logs security event for audit trail
     * - Optionally invalidates all other sessions
     * 
     * @param userId          User ID
     * @param currentPassword Current password for verification
     * @param newPassword     New password
     * @throws BusinessException if current password is incorrect or new password is
     *                           same as current
     */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        log.info("Changing password for user: {}", userId);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            log.warn("Password change failed for user {}: incorrect current password", userId);
            throw new BusinessException("Mevcut şifreniz hatalı", "INCORRECT_CURRENT_PASSWORD");
        }

        // Verify new password is different
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BusinessException("Yeni şifre mevcut şifrenizden farklı olmalıdır", "PASSWORD_SAME_AS_CURRENT");
        }

        // Update password (domain behavior)
        user.updatePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Publish password changed event
        user.getEvents().forEach(eventPublisher::publishEvent);
        user.clearEvents();

        // Send confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getName());

        log.info("Password changed successfully for user: {}", userId);
    }
}
