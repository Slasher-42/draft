package com.example.Followup_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdjournMeetupRequest {

    @NotBlank(message = "feedback is required")
    private String feedback;
}
