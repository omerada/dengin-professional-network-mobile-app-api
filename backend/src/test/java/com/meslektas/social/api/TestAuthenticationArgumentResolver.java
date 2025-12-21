package com.dengin.social.api;

import com.dengin.identity.infrastructure.security.UserDetailsImpl;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;

/**
 * Test Helper: Resolves @AuthenticationPrincipal in standalone MockMvc tests
 */
public class TestAuthenticationArgumentResolver implements HandlerMethodArgumentResolver {

    private final Long userId;

    public TestAuthenticationArgumentResolver() {
        this.userId = 1L;
    }

    public TestAuthenticationArgumentResolver(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory) {
        return new UserDetailsImpl(
                userId,
                "test@dengin.com",
                "Test",
                "User",
                "password",
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority("ROLE_VERIFIED")));
    }
}
