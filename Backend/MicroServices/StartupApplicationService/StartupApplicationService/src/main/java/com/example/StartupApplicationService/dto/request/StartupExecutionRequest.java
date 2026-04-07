package com.example.StartupApplicationService.dto.request;

import com.example.StartupApplicationService.enums.CompanySize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartupExecutionRequest {

    @NotNull(message = "Target company size is required")
    private CompanySize targetCompanySize;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotBlank(message = "Problem statement is required")
    private String problemStatement;

    @NotBlank(message = "Business model is required")
    private String businessModel;

    @NotBlank(message = "Target market is required")
    private String targetMarket;

    @NotBlank(message = "Team details are required")
    private String teamDetails;

    @NotNull(message = "Annual revenue is required")
    @PositiveOrZero(message = "Annual revenue must be zero or greater")
    private Double annualRevenue;

    @NotNull(message = "Monthly burn rate is required")
    @PositiveOrZero(message = "Monthly burn rate must be zero or greater")
    private Double monthlyBurnRate;

    @NotNull(message = "Funding needed is required")
    @PositiveOrZero(message = "Funding needed must be zero or greater")
    private Double fundingNeeded;
}