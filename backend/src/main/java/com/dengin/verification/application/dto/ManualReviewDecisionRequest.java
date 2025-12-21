package com.dengin.verification.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Manual Review Decision Request DTO
 * 
 * Admin approves or rejects verification after manual review.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualReviewDecisionRequest {
    
    @NotBlank(message = "Review notes are required")
    private String notes;
    
    // Decision is in the endpoint path (approve/reject)
}
