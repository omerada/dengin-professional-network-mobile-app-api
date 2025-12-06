package com.meslektas.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Participant DTO for conversation view
 * 
 * Shows the other participant in a conversation.
 * Note: userId uses Long (database ID) for compatibility
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    
    private Long userId;
    private String fullName;
    private String profession;
    private String profileImageUrl;
    private boolean verified;
    private boolean online;
    private String lastSeenAt;
}
