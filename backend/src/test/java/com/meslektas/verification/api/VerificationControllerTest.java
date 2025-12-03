package com.meslektas.verification.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meslektas.verification.application.dto.*;
import com.meslektas.verification.application.service.VerificationService;
import com.meslektas.verification.domain.model.VerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * VerificationController Unit Tests
 * 
 * Tests API endpoints:
 * - POST /api/verifications - Submit verification
 * - GET /api/verifications - Get user's verifications
 * - GET /api/verifications/{id} - Get verification by ID
 * - GET /api/verifications/check/{professionId} - Check eligibility
 * - GET /api/verifications/history - Get verification history
 * - Admin endpoints: pending reviews, approve, reject, statistics
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("VerificationController Tests")
class VerificationControllerTest {

    @Mock
    private VerificationService verificationService;

    @InjectMocks
    private VerificationController verificationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final Long USER_ID = 1L;
    private static final Long ADMIN_ID = 999L;
    private static final Long PROFESSION_ID = 100L;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(verificationController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Nested
    @DisplayName("POST /api/verifications - Submit Verification")
    class SubmitVerificationTests {

        @Test
        @DisplayName("Should submit verification successfully")
        void shouldSubmitVerificationSuccessfully() throws Exception {
            // Given
            setUserAuthentication();

            SubmitVerificationRequest request = SubmitVerificationRequest.builder()
                    .professionId(PROFESSION_ID)
                    .documentS3Key("documents/user1/doc.jpg")
                    .documentFileName("diploma.jpg")
                    .documentContentType("image/jpeg")
                    .documentFileSize(500000L)
                    .selfieS3Key("selfies/user1/selfie.jpg")
                    .selfieFileName("selfie.jpg")
                    .selfieContentType("image/jpeg")
                    .selfieFileSize(200000L)
                    .build();

            VerificationResponse response = createVerificationResponse(1L);

            when(verificationService.submitVerification(any(), eq(USER_ID)))
                    .thenReturn(response);

            // When/Then
            mockMvc.perform(post("/api/verifications")
                    .principal(createUserPrincipal())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.professionId").value(PROFESSION_ID));

            verify(verificationService).submitVerification(any(), eq(USER_ID));
        }

        @Test
        @DisplayName("Should reject when validation fails")
        void shouldRejectWhenValidationFails() throws Exception {
            // Given
            setUserAuthentication();

            // Missing required fields
            SubmitVerificationRequest invalidRequest = SubmitVerificationRequest.builder()
                    .professionId(null) // Required field missing
                    .build();

            // When/Then
            mockMvc.perform(post("/api/verifications")
                    .principal(createUserPrincipal())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());

            verify(verificationService, never()).submitVerification(any(), anyLong());
        }
    }

    @Nested
    @DisplayName("GET /api/verifications - Get User's Verifications")
    class GetUserVerificationsTests {

        @Test
        @DisplayName("Should get user's verifications")
        void shouldGetUserVerifications() throws Exception {
            // Given
            setUserAuthentication();

            List<VerificationResponse> responses = List.of(
                    createVerificationResponse(1L),
                    createVerificationResponse(2L));

            when(verificationService.getUserVerifications(USER_ID))
                    .thenReturn(responses);

            // When/Then
            mockMvc.perform(get("/api/verifications")
                    .principal(createUserPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].id").value(1L))
                    .andExpect(jsonPath("$[1].id").value(2L));
        }

        @Test
        @DisplayName("Should return empty list when no verifications")
        void shouldReturnEmptyListWhenNoVerifications() throws Exception {
            // Given
            setUserAuthentication();

            when(verificationService.getUserVerifications(USER_ID))
                    .thenReturn(List.of());

            // When/Then
            mockMvc.perform(get("/api/verifications")
                    .principal(createUserPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/verifications/{id} - Get Verification by ID")
    class GetVerificationByIdTests {

        @Test
        @DisplayName("Should get verification by ID")
        void shouldGetVerificationById() throws Exception {
            // Given
            setUserAuthentication();

            VerificationResponse response = createVerificationResponse(1L);

            when(verificationService.getVerificationById(1L, USER_ID))
                    .thenReturn(response);

            // When/Then
            mockMvc.perform(get("/api/verifications/1")
                    .principal(createUserPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1L))
                    .andExpect(jsonPath("$.userId").value(USER_ID));
        }
    }

    @Nested
    @DisplayName("GET /api/verifications/check/{professionId} - Check Eligibility")
    class CheckEligibilityTests {

        @Test
        @DisplayName("Should return eligible when can submit")
        void shouldReturnEligibleWhenCanSubmit() throws Exception {
            // Given
            setUserAuthentication();

            VerificationEligibilityResponse response = VerificationEligibilityResponse.eligible(3, 0);

            when(verificationService.checkEligibility(USER_ID, PROFESSION_ID))
                    .thenReturn(response);

            // When/Then
            mockMvc.perform(get("/api/verifications/check/" + PROFESSION_ID)
                    .principal(createUserPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.canSubmit").value(true))
                    .andExpect(jsonPath("$.remainingAttempts").value(3));
        }

        @Test
        @DisplayName("Should return not eligible when already verified")
        void shouldReturnNotEligibleWhenAlreadyVerified() throws Exception {
            // Given
            setUserAuthentication();

            VerificationEligibilityResponse response = VerificationEligibilityResponse.alreadyVerified();

            when(verificationService.checkEligibility(USER_ID, PROFESSION_ID))
                    .thenReturn(response);

            // When/Then
            mockMvc.perform(get("/api/verifications/check/" + PROFESSION_ID)
                    .principal(createUserPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.canSubmit").value(false));
        }
    }

    @Nested
    @DisplayName("GET /api/verifications/history - Get Verification History")
    class GetVerificationHistoryTests {

        @Test
        @DisplayName("Should get verification history")
        void shouldGetVerificationHistory() throws Exception {
            // Given
            setUserAuthentication();

            List<VerificationAttemptResponse> history = List.of(
                    createAttemptResponse(1L, 1),
                    createAttemptResponse(2L, 2));

            when(verificationService.getUserVerificationHistory(USER_ID))
                    .thenReturn(history);

            // When/Then
            mockMvc.perform(get("/api/verifications/history")
                    .principal(createUserPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].attemptNumber").value(1))
                    .andExpect(jsonPath("$[1].attemptNumber").value(2));
        }
    }

    @Nested
    @DisplayName("Admin Endpoints")
    class AdminEndpointTests {

        @Test
        @DisplayName("Should get pending manual reviews")
        void shouldGetPendingManualReviews() throws Exception {
            // Given
            setAdminAuthentication();

            List<VerificationResponse> pending = List.of(
                    createPendingManualReviewResponse(1L),
                    createPendingManualReviewResponse(2L));

            when(verificationService.getPendingManualReviews()).thenReturn(pending);

            // When/Then
            mockMvc.perform(get("/api/admin/verifications/pending")
                    .principal(createAdminPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].status").value("PENDING_MANUAL_REVIEW"));
        }

        @Test
        @DisplayName("Should approve verification")
        void shouldApproveVerification() throws Exception {
            // Given
            setAdminAuthentication();

            ManualReviewDecisionRequest request = new ManualReviewDecisionRequest();
            request.setNotes("Document verified successfully");

            VerificationResponse response = createApprovedResponse(1L);

            when(verificationService.approveVerification(eq(1L), eq(ADMIN_ID), anyString()))
                    .thenReturn(response);

            // When/Then
            mockMvc.perform(post("/api/admin/verifications/1/approve")
                    .principal(createAdminPrincipal())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("APPROVED"));

            verify(verificationService).approveVerification(1L, ADMIN_ID, "Document verified successfully");
        }

        @Test
        @DisplayName("Should reject verification")
        void shouldRejectVerification() throws Exception {
            // Given
            setAdminAuthentication();

            ManualReviewDecisionRequest request = new ManualReviewDecisionRequest();
            request.setNotes("Document unclear, cannot verify");

            VerificationResponse response = createRejectedResponse(1L);

            when(verificationService.rejectVerification(eq(1L), eq(ADMIN_ID), anyString()))
                    .thenReturn(response);

            // When/Then
            mockMvc.perform(post("/api/admin/verifications/1/reject")
                    .principal(createAdminPrincipal())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REJECTED"));

            verify(verificationService).rejectVerification(1L, ADMIN_ID, "Document unclear, cannot verify");
        }

        @Test
        @DisplayName("Should get statistics")
        void shouldGetStatistics() throws Exception {
            // Given
            setAdminAuthentication();

            VerificationStatisticsResponse statistics = VerificationStatisticsResponse.builder()
                    .totalRequests(100L)
                    .pendingReviews(10L)
                    .approvedCount(70L)
                    .rejectedCount(15L)
                    .expiredCount(5L)
                    .approvalRate(70.0)
                    .autoApprovalRate(71.4)
                    .averageProcessingMinutes(2.5)
                    .todaySubmissions(5L)
                    .thisWeekSubmissions(30L)
                    .thisMonthSubmissions(90L)
                    .build();

            when(verificationService.getStatistics()).thenReturn(statistics);

            // When/Then
            mockMvc.perform(get("/api/admin/verifications/statistics")
                    .principal(createAdminPrincipal()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalRequests").value(100L))
                    .andExpect(jsonPath("$.pendingReviews").value(10L))
                    .andExpect(jsonPath("$.approvedCount").value(70L))
                    .andExpect(jsonPath("$.approvalRate").value(70.0));
        }
    }

    // ========== Helper Methods ==========

    private void setUserAuthentication() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        USER_ID.toString(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    }

    private void setAdminAuthentication() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        ADMIN_ID.toString(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private UsernamePasswordAuthenticationToken createUserPrincipal() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID.toString(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private UsernamePasswordAuthenticationToken createAdminPrincipal() {
        return new UsernamePasswordAuthenticationToken(
                ADMIN_ID.toString(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private VerificationResponse createVerificationResponse(Long id) {
        return VerificationResponse.builder()
                .id(id)
                .verificationId(UUID.randomUUID())
                .userId(USER_ID)
                .professionId(PROFESSION_ID)
                .status(VerificationStatus.PENDING)
                .documentS3Key("documents/user1/doc.jpg")
                .selfieS3Key("selfies/user1/selfie.jpg")
                .attemptNumber(1)
                .submittedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(604800))
                .build();
    }

    private VerificationResponse createPendingManualReviewResponse(Long id) {
        return VerificationResponse.builder()
                .id(id)
                .verificationId(UUID.randomUUID())
                .userId(USER_ID)
                .professionId(PROFESSION_ID)
                .status(VerificationStatus.PENDING_MANUAL_REVIEW)
                .documentS3Key("documents/user1/doc.jpg")
                .selfieS3Key("selfies/user1/selfie.jpg")
                .attemptNumber(1)
                .submittedAt(Instant.now())
                .aiConfidence(72.0)
                .faceSimilarity(75.0)
                .build();
    }

    private VerificationResponse createApprovedResponse(Long id) {
        return VerificationResponse.builder()
                .id(id)
                .verificationId(UUID.randomUUID())
                .userId(USER_ID)
                .professionId(PROFESSION_ID)
                .status(VerificationStatus.APPROVED)
                .documentS3Key("documents/user1/doc.jpg")
                .selfieS3Key("selfies/user1/selfie.jpg")
                .attemptNumber(1)
                .submittedAt(Instant.now())
                .processedAt(Instant.now())
                .manualReviewNotes("Document verified successfully")
                .build();
    }

    private VerificationResponse createRejectedResponse(Long id) {
        return VerificationResponse.builder()
                .id(id)
                .verificationId(UUID.randomUUID())
                .userId(USER_ID)
                .professionId(PROFESSION_ID)
                .status(VerificationStatus.REJECTED)
                .documentS3Key("documents/user1/doc.jpg")
                .selfieS3Key("selfies/user1/selfie.jpg")
                .attemptNumber(1)
                .submittedAt(Instant.now())
                .processedAt(Instant.now())
                .manualReviewNotes("Document unclear")
                .build();
    }

    private VerificationAttemptResponse createAttemptResponse(Long id, int attemptNumber) {
        return VerificationAttemptResponse.builder()
                .id(id)
                .verificationId(UUID.randomUUID())
                .professionId(PROFESSION_ID)
                .status(VerificationStatus.PENDING)
                .attemptNumber(attemptNumber)
                .submittedAt(Instant.now())
                .isApproved(false)
                .isRejected(false)
                .isPending(true)
                .build();
    }
}
