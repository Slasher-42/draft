package com.example.UserManagement.MicroService.dto.request;

import com.example.UserManagement.MicroService.enums.RoleType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Pattern(
            regexp = "^\\+?[0-9\\s\\-]{7,20}$",
            message = "Phone number must contain only digits, spaces, hyphens, or a leading +"
    )
    private String phoneNumber;

    @NotNull(message = "Role is required")
    private RoleType role;
}