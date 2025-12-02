package com.meslektas.identity.application.service;

import com.meslektas.common.exception.BusinessException;
import com.meslektas.identity.application.dto.request.LoginRequest;
import com.meslektas.identity.application.dto.request.RegisterRequest;
import com.meslektas.identity.application.dto.response.LoginResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.application.mapper.UserMapper;
import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.identity.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Register a new user
     * 
     * Business Rule: Email must be unique
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.email());

        // Business validation
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(
                    "Email already exists: " + request.email(),
                    "EMAIL_ALREADY_EXISTS"
            );
        }

        // Create user aggregate (domain factory method)
        User user = User.createFromRegistration(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name(),
                request.surname()
        );

        // Save
        User savedUser = userRepository.save(user);

        // Publish domain events
        savedUser.getEvents().forEach(eventPublisher::publishEvent);
        savedUser.clearEvents();

        log.info("User registered successfully: {}", savedUser.getEmail());

        return userMapper.toResponse(savedUser);
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
                        request.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Find user
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(
                        "User not found: " + request.email(),
                        "USER_NOT_FOUND"
                ));

        // Check if user is active
        if (!user.isActive()) {
            String reason = user.isBanned() ? "Account is banned" : "Account is suspended";
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
            throw new BusinessException("Invalid refresh token", "INVALID_REFRESH_TOKEN");
        }

        // Get user ID from token
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        "User not found: " + userId,
                        "USER_NOT_FOUND"
                ));

        // Check if user is active
        if (!user.isActive()) {
            throw new BusinessException("Account is inactive", "ACCOUNT_INACTIVE");
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
     * Verify email (placeholder - implement email verification logic)
     */
    @Transactional
    public void verifyEmail(String token) {
        // TODO: Implement email verification logic
        // 1. Validate token
        // 2. Find user
        // 3. Call user.verifyEmail()
        // 4. Save user
        // 5. Publish event
    }
}
