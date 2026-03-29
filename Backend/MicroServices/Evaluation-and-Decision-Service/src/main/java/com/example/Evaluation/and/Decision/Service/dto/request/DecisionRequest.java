package com.example.Evaluation.and.Decision.Service.dto.request;

import com.example.Evaluation.and.Decision.Service.enums.ReviewDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DecisionRequest {

    @NotNull(message = "Decision is required")
    private ReviewDecision decision;

    @NotBlank(message = "Reason is required")
    private String reason;
}