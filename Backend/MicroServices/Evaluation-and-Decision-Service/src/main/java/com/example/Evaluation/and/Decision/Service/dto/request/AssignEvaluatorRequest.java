package com.example.Evaluation.and.Decision.Service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignEvaluatorRequest {

    @NotNull(message = "Evaluator ID is required")
    private Long evaluatorId;
}