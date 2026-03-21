package com.example.StartupApplicationService.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvestorExecutionRequest {

    @NotBlank(message = "Preferred industry is required")
    private String preferredIndustry;

    @NotBlank(message = "Investment reason is required")
    private String investmentReason;

    @NotNull(message = "Investment budget is required")
    @Positive(message = "Investment budget must be greater than zero")
    private Double investmentBudget;

    @NotBlank(message = "Expected return timeline is required")
    private String expectedReturnTimeline;

    private String successCriteria;
}