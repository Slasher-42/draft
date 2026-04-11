package com.example.Followup_service.dto.request;

import com.example.Followup_service.enums.MeetupStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMeetupStatusRequest {

    @NotNull(message = "status is required")
    private MeetupStatus status;

    private String adminNotes;
}
