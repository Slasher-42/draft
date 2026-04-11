package com.example.Followup_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ScheduleMeetupRequest {

    @NotNull(message = "matchId is required")
    private Long matchId;

    @NotNull(message = "investorUserId is required")
    private Long investorUserId;

    @NotNull(message = "startupUserId is required")
    private Long startupUserId;

    @NotNull(message = "scheduledAt is required")
    @Future(message = "scheduledAt must be a future date/time")
    private LocalDateTime scheduledAt;

    private String adminNotes;
}
