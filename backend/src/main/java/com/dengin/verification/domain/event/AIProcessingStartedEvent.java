package com.dengin.verification.domain.event;

import com.dengin.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: AI processing started
 * 
 * Published when verification request transitions to AI_PROCESSING status.
 * Triggers AWS Rekognition face comparison + OCR.
 */
@Getter
@RequiredArgsConstructor
public class AIProcessingStartedEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final String documentS3Key;
    private final String selfieS3Key;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
