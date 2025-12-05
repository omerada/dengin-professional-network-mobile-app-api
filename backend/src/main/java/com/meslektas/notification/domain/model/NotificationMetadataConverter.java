package com.meslektas.notification.domain.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * JPA Converter for NotificationMetadata to JSON.
 */
@Slf4j
@Converter
public class NotificationMetadataConverter implements AttributeConverter<NotificationMetadata, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(NotificationMetadata metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(metadata.getData());
        } catch (JsonProcessingException e) {
            log.error("Error converting NotificationMetadata to JSON", e);
            return "{}";
        }
    }

    @Override
    public NotificationMetadata convertToEntityAttribute(String json) {
        if (json == null || json.isBlank() || json.equals("{}")) {
            return NotificationMetadata.empty();
        }
        try {
            Map<String, String> data = objectMapper.readValue(json, new TypeReference<>() {
            });
            return NotificationMetadata.of(data);
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON to NotificationMetadata", e);
            return NotificationMetadata.empty();
        }
    }
}
