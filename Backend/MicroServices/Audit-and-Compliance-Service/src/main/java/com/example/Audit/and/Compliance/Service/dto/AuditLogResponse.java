package com.example.Audit.and.Compliance.Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userRole;
    private String actionType;
    private String affectedResource;
    private String outcome;
    private String details;
    private String serviceName;
    private LocalDateTime createdAt;
}