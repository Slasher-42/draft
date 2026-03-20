package com.example.UserManagement.MicroService.dto.request;

import com.example.UserManagement.MicroService.enums.IndustryType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InvestorProfileRequest {

    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Organization name must be between 2 and 100 characters")
    private String organizationName;

    @NotNull(message = "Preferred industry is required")
    private IndustryType preferredIndustry;

    @NotNull(message = "Investment budget is required")
    @DecimalMin(value = "1.0", message = "Investment budget must be greater than 0")
    private Double investmentBudget;

    @Size(max = 100, message = "Country name is too long")
    private String country;

    @Size(max = 100, message = "City name is too long")
    private String city;
}