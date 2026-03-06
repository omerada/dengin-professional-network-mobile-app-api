package com.dengin.social.application.dto;

import com.dengin.identity.domain.model.Profession;

/**
 * Basic user information DTO used in comments, posts, and other contexts.
 * 
 * <p>Contains minimal user data to reduce payload size.
 */
public record UserBasicDto(
    String userId,
    String name,
    Profession profession,
    String profileImageUrl,
    boolean verified
) {
}
