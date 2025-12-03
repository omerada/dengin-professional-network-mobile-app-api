package com.meslektas.messaging.infrastructure.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * WebSocket error response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "WebSocket error notification")
public class WsErrorResponse {

    @Schema(description = "Error code")
    private String code;

    @Schema(description = "Error message")
    private String message;

    @Schema(description = "Original action that caused the error")
    private String action;

    @Schema(description = "When the error occurred")
    private LocalDateTime timestamp;

    public static WsErrorResponse of(String code, String message, String action) {
        return WsErrorResponse.builder()
                .code(code)
                .message(message)
                .action(action)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // Common error codes
    public static final String CODE_UNAUTHORIZED = "UNAUTHORIZED";
    public static final String CODE_FORBIDDEN = "FORBIDDEN";
    public static final String CODE_NOT_FOUND = "NOT_FOUND";
    public static final String CODE_VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String CODE_BLOCKED = "BLOCKED";
    public static final String CODE_RATE_LIMITED = "RATE_LIMITED";
    public static final String CODE_INTERNAL_ERROR = "INTERNAL_ERROR";
}
