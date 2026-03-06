package com.dengin.shared.security;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

/**
 * Annotation to inject the current authenticated user
 * 
 * Usage:
 * <pre>
 * @GetMapping("/profile")
 * public ResponseEntity<UserProfile> getProfile(@CurrentUser Principal principal) {
 *     UUID userId = UUID.fromString(principal.getName());
 *     // ...
 * }
 * </pre>
 */
@Target({ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@AuthenticationPrincipal
public @interface CurrentUser {
}
