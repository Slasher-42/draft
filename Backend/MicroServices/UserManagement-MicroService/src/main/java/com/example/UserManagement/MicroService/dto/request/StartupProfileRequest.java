package com.example.UserManagement.MicroService.dto.request;

import com.example.UserManagement.MicroService.enums.IndustryType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StartupProfileRequest {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String companyName;

    @NotNull(message = "Industry is required")
    private IndustryType industry;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Min(value = 1900, message = "Founded year must be 1900 or later")
    @Max(value = 2100, message = "Founded year is not valid")
    private Integer foundedYear;

    @Min(value = 1, message = "Team size must be at least 1")
    @Max(value = 100000, message = "Team size seems too large")
    private Integer teamSize;

    @Pattern(
            regexp = "^(https?://)?([a-zA-Z0-9.-]+)(:\\d+)?(/.*)?$",
            message = "Enter a valid website URL"
    )
    @Size(max = 200, message = "Website URL is too long")
    private String website;

    @Size(max = 100, message = "Country name is too long")
    private String country;

    @Size(max = 100, message = "City name is too long")
    private String city;

    @NotNull(message = "Funding amount is required")
    @DecimalMin(value = "1.0", message = "Funding needed must be greater than 0")
    private Double fundingNeeded;
}