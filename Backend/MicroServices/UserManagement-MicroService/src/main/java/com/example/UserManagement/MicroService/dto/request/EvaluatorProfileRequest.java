package com.example.UserManagement.MicroService.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EvaluatorProfileRequest {

    @NotBlank
    private String department;

    private String specialization;

    private String country;

    private String city;
}