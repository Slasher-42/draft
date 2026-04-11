package com.example.Followup_service.dto.response;

import com.example.Followup_service.enums.ContractStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContractResponse {
    private Long id;
    private Long meetupId;
    private Long matchId;
    private Long investorUserId;
    private Long startupUserId;
    private String contractDetails;
    private String investorSignature;
    private String startupSignature;
    private String adminValidationSignature;
    private Long validatedByAdminId;
    private ContractStatus status;
    private LocalDateTime investorSignedAt;
    private LocalDateTime startupSignedAt;
    private LocalDateTime validatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
