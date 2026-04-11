package com.example.Followup_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateContractRequest {

    @NotNull(message = "meetupId is required")
    private Long meetupId;

    @NotBlank(message = "contractDetails are required")
    private String contractDetails;
}
