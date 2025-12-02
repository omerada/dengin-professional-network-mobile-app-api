package com.meslektas.identity.application.mapper;

import com.meslektas.identity.application.dto.UserProfileResponse;
import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.domain.model.User;
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
@Mapper(
        componentModel = "spring",
        uses = {ProfessionMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
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

