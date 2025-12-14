package com.dengin.identity.infrastructure.security;

import com.dengin.identity.domain.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * UserDetails implementation for Spring Security
 * 
 * Adapts our User domain model to Spring Security's UserDetails interface.
 */
@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String email;
    private String name;
    private String surname;
    
    @JsonIgnore
    private String password;
    
    private boolean isActive;
    private boolean isProfessionVerified;
    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Build UserDetails from User domain model
     */
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER")
        );

        // Add VERIFIED role if profession is verified
        if (Boolean.TRUE.equals(user.getIsProfessionVerified())) {
            authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_USER"),
                    new SimpleGrantedAuthority("ROLE_VERIFIED")
            );
        }

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname(),
                user.getPasswordHash(),
                user.isActive(),
                Boolean.TRUE.equals(user.getIsProfessionVerified()),
                authorities
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public String getFullName() {
        return name + " " + surname;
    }
}
