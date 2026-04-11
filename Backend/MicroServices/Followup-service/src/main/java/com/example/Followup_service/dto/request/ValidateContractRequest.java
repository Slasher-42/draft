package com.example.Followup_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ValidateContractRequest {

    @NotBlank(message = "adminValidationSignature is required")
    private String adminValidationSignature;
}
