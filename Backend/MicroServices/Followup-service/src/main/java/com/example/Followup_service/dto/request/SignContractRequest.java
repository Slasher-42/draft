package com.example.Followup_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignContractRequest {

    @NotBlank(message = "signature (full name) is required")
    private String signature;
}
