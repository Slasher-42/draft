package com.example.UserManagement.MicroService.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(
            regexp = "^\\+?[0-9\\s\\-]{7,20}$",
            message = "Phone number must contain only digits, spaces, hyphens, or a leading +"
    )
    private String phoneNumber;
}