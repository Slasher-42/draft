package com.example.UserManagement.MicroService.dto.request;

import com.example.UserManagement.MicroService.enums.RoleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminCreateUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Temporary password is required")
    private String temporaryPassword;

    @NotNull(message = "Role is required")
    private RoleType role;
}