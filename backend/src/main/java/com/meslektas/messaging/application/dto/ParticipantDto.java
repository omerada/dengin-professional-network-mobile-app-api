package com.meslektas.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Participant DTO for conversation view
 * 
 * Shows the other participant in a conversation.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    
    private UUID userId;
    private String fullName;
    private String profession;
    private String profileImageUrl;
    private boolean verified;
    private boolean online;
    private String lastSeenAt;
}
