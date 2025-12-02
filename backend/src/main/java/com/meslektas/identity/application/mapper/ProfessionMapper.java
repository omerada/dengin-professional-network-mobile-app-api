package com.meslektas.identity.application.mapper;

import com.meslektas.identity.application.dto.response.ProfessionResponse;
import com.meslektas.identity.domain.model.Profession;
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
