package com.meslektas.common.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.InstantDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.InstantSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Jackson configuration for consistent JSON serialization/deserialization.
 * 
 * Date Format Standards:
 * - All dates are serialized as ISO 8601 strings
 * - LocalDate: "2025-12-05"
 * - LocalDateTime: "2025-12-05T14:30:00"
 * - Instant: "2025-12-05T14:30:00.000Z"
 * 
 * This ensures consistent date format between backend and mobile.
 */
@Configuration
public class JacksonConfig {

    /**
     * Standard date format for LocalDate
     */
    public static final String DATE_FORMAT = "yyyy-MM-dd";

    /**
     * Standard datetime format for LocalDateTime
     */
    public static final String DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

    /**
     * Standard datetime format with milliseconds for Instant
     */
    public static final String INSTANT_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

    /**
     * DateTimeFormatter for LocalDate
     */
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_FORMAT);

    /**
     * DateTimeFormatter for LocalDateTime
     */
    public static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern(DATETIME_FORMAT);

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // LocalDate serializers/deserializers
        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DATE_FORMATTER));
        javaTimeModule.addDeserializer(LocalDate.class, new LocalDateDeserializer(DATE_FORMATTER));

        // LocalDateTime serializers/deserializers
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DATETIME_FORMATTER));
        javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DATETIME_FORMATTER));

        // Instant uses default ISO format with milliseconds
        javaTimeModule.addSerializer(Instant.class, InstantSerializer.INSTANCE);
        javaTimeModule.addDeserializer(Instant.class, InstantDeserializer.INSTANT);

        return builder
                .modules(javaTimeModule)
                // Don't serialize null values
                .serializationInclusion(JsonInclude.Include.NON_NULL)
                // Don't fail on unknown properties (forward compatibility)
                .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                // Don't write dates as timestamps
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                // Pretty print in development (can be disabled in production)
                .featuresToEnable(SerializationFeature.INDENT_OUTPUT)
                .build();
    }
}
