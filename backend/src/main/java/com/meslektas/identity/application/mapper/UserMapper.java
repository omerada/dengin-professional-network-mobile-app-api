package com.meslektas.identity.application.mapper;

import com.meslektas.identity.application.dto.response.UserResponse;
import com.meslektas.identity.domain.model.User;
import org.mapstruct.*;

/**
 * MapStruct mapper for User entity
 * 
 * Automatically generates mapping code between User and UserResponse.
 */
@Mapper(
        componentModel = "spring",
        uses = {ProfessionMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    UserResponse toResponse(User user);

    @AfterMapping
    default void afterMapping(@MappingTarget UserResponse response, User user) {
        // Additional custom mapping logic if needed
    }
}
