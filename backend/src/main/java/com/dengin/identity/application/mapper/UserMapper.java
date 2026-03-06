package com.dengin.identity.application.mapper;

import com.dengin.identity.application.dto.response.UserProfileResponse;
import com.dengin.identity.application.dto.response.UserResponse;
import com.dengin.identity.domain.model.User;
import org.mapstruct.*;

/**
 * MapStruct mapper for User entity
 * 
 * Automatically generates mapping code between User and DTOs.
 * 
 * Mappings:
 * - User -> UserResponse (for auth responses)
 * - User -> UserProfileResponse (for profile endpoints)
 */
@Mapper(componentModel = "spring", uses = { ProfessionMapper.class, SectorMapper.class }, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "sector", source = "sector")
    UserResponse toResponse(User user);

    /**
     * Map User entity to UserProfileResponse
     * 
     * Custom mappings:
     * - fullName: Computed from name + surname
     * - professionId: Extracted from profession.id
     * - professionName: Extracted from profession.name
     * - professionCategory: Extracted from profession.category
     * - status: Mapped from UserStatus enum to string
     * - oauthProvider: Mapped from OAuthProvider enum to string
     */
    @Mapping(target = "userId", source = "id")
    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    @Mapping(target = "professionId", source = "profession.id")
    @Mapping(target = "professionName", source = "profession.name")
    @Mapping(target = "professionCategory", source = "profession.category")
    @Mapping(target = "status", expression = "java(user.getStatus().name())")
    @Mapping(target = "oauthProvider", expression = "java(user.getOauthProvider() != null ? user.getOauthProvider().name() : null)")
    UserProfileResponse toProfileResponse(User user);

    @AfterMapping
    default void afterMapping(@MappingTarget UserResponse response, User user) {
        // Additional custom mapping logic if needed
    }
}
