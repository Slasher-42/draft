package com.example.Followup_service.dto.response;

import com.example.Followup_service.enums.MeetupStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeetupResponse {
    private Long id;
    private Long matchId;
    private Long investorUserId;
    private Long startupUserId;
    private Long scheduledByAdminId;
    private LocalDateTime scheduledAt;
    private MeetupStatus status;
    private String roomId;
    private String adminNotes;
    private String feedback;
    private Long adjournedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
