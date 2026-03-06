package com.dengin.identity.application.mapper;

import com.dengin.identity.application.dto.response.ProfessionResponse;
import com.dengin.identity.domain.model.Profession;
import org.mapstruct.*;

/**
 * MapStruct mapper for Profession entity
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProfessionMapper {

    @Mapping(target = "categoryDisplayName", expression = "java(profession.getCategory().getDisplayName())")
    ProfessionResponse toResponse(Profession profession);
}
