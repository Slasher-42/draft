package com.example.UserManagement.MicroService.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SystemConfigRequest {

    @NotNull(message = "Update interval value is required")
    private Long updateIntervalValue;

    @NotBlank(message = "Update interval unit is required")
    private String updateIntervalUnit;

    @NotNull
    private Double weightFinancialHealth;

    @NotNull
    private Double weightTeamStrength;

    @NotNull
    private Double weightMarketPotential;

    @NotNull
    private Double weightBusinessViability;

    @NotNull
    private Double minimumPassingScore;
}