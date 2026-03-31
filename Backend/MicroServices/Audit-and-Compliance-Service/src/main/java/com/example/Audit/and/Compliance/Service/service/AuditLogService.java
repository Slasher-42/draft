package com.example.Audit.and.Compliance.Service.service;

import com.example.Audit.and.Compliance.Service.dto.AuditLogResponse;
import com.example.Audit.and.Compliance.Service.model.AuditLog;
import com.example.Audit.and.Compliance.Service.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void save(String actionType, String affectedResource, String outcome,
                     String details, String serviceName,
                     Long userId, String userEmail, String userRole) {
        AuditLog log = AuditLog.builder()
                .actionType(actionType)
                .affectedResource(affectedResource)
                .outcome(outcome)
                .details(details)
                .serviceName(serviceName)
                .userId(userId)
                .userEmail(userEmail)
                .userRole(userRole)
                .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLogResponse> findAll(Long userId, String actionType, String serviceName,
                                          String outcome, String search,
                                          LocalDateTime startDate, LocalDateTime endDate,
                                          int page, int size) {
        Page<AuditLog> results = auditLogRepository.findWithFilters(
                userId, actionType, serviceName, outcome,
                search, startDate, endDate,
                PageRequest.of(page, size)
        );
        return results.map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userEmail(log.getUserEmail())
                .userRole(log.getUserRole())
                .actionType(log.getActionType())
                .affectedResource(log.getAffectedResource())
                .outcome(log.getOutcome())
                .details(log.getDetails())
                .serviceName(log.getServiceName())
                .createdAt(log.getCreatedAt())
                .build();
    }
}