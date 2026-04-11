package com.example.Followup_service.dto.response;

import lombok.Data;

@Data
public class TokenValidationResponse {
    private boolean valid;
    private Long userId;
    private String role;
    private String email;
}
