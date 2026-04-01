package com.example.Audit.and.Compliance.Service.config;

import com.example.Audit.and.Compliance.Service.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AuditLogService auditLogService;

    @KafkaListener(topics = "user.registered", groupId = "audit-service")
    public void onUserRegistered(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("USER_REGISTERED", "user:" + parts[0], "SUCCESS",
                    "User registered with email: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "UserManagementService",
                    parseLong(parts[0]), parts.length > 1 ? parts[1] : null,
                    parts.length > 2 ? parts[2] : null);
        } catch (Exception e) {
            log.error("[Audit] user.registered failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "user.deleted", groupId = "audit-service")
    public void onUserDeleted(String message) {
        try {
            String[] parts = message.split(":", 2);
            auditLogService.save("USER_DELETED", "user:" + parts[0], "SUCCESS",
                    "User deleted: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "UserManagementService",
                    parseLong(parts[0]), parts.length > 1 ? parts[1] : null, null);
        } catch (Exception e) {
            log.error("[Audit] user.deleted failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "user.status.changed", groupId = "audit-service")
    public void onUserStatusChanged(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("USER_STATUS_CHANGED", "user:" + parts[0], "SUCCESS",
                    "Status changed to: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "UserManagementService",
                    parseLong(parts[0]), null, null);
        } catch (Exception e) {
            log.error("[Audit] user.status.changed failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.profile.saved", groupId = "audit-service")
    public void onStartupProfileSaved(String message) {
        try {
            String[] parts = message.split(":", 2);
            auditLogService.save("STARTUP_PROFILE_SAVED", "user:" + parts[0], "SUCCESS",
                    "Startup identity profile saved",
                    "UserManagementService",
                    parseLong(parts[0]), null, "STARTUP");
        } catch (Exception e) {
            log.error("[Audit] startup.profile.saved failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "investor.profile.saved", groupId = "audit-service")
    public void onInvestorProfileSaved(String message) {
        try {
            String[] parts = message.split(":", 2);
            auditLogService.save("INVESTOR_PROFILE_SAVED", "user:" + parts[0], "SUCCESS",
                    "Investor identity profile saved",
                    "UserManagementService",
                    parseLong(parts[0]), null, "INVESTOR");
        } catch (Exception e) {
            log.error("[Audit] investor.profile.saved failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.execution.submitted", groupId = "audit-service")
    public void onStartupExecutionSubmitted(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("STARTUP_EXECUTION_SUBMITTED", "execution:" + parts[0], "SUCCESS",
                    "Startup execution submitted by userId: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "StartupApplicationService",
                    parts.length > 1 ? parseLong(parts[1]) : null, null, "STARTUP");
        } catch (Exception e) {
            log.error("[Audit] startup.execution.submitted failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "investment.execution.submitted", groupId = "audit-service")
    public void onInvestmentExecutionSubmitted(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("INVESTMENT_EXECUTION_SUBMITTED", "execution:" + parts[0], "SUCCESS",
                    "Investment execution submitted by userId: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "StartupApplicationService",
                    parts.length > 1 ? parseLong(parts[1]) : null, null, "INVESTOR");
        } catch (Exception e) {
            log.error("[Audit] investment.execution.submitted failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "execution.status.updated", groupId = "audit-service")
    public void onExecutionStatusUpdated(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("EXECUTION_STATUS_UPDATED", "execution:" + parts[0], "SUCCESS",
                    "Status updated to: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "StartupApplicationService",
                    null, null, null);
        } catch (Exception e) {
            log.error("[Audit] execution.status.updated failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "assessment.completed", groupId = "audit-service")
    public void onAssessmentCompleted(String message) {
        try {
            String[] parts = message.split(":", 2);
            auditLogService.save("ASSESSMENT_COMPLETED", "execution:" + parts[0], "SUCCESS",
                    "AI assessment completed",
                    "AIAssessmentEngine",
                    null, null, null);
        } catch (Exception e) {
            log.error("[Audit] assessment.completed failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "score.generated.full", groupId = "audit-service")
    public void onScoreGenerated(String message) {
        try {
            String[] parts = message.split(":", 14);
            auditLogService.save("SCORE_GENERATED", "execution:" + parts[0], "SUCCESS",
                    "Score generated: " + (parts.length > 6 ? parts[6] : "unknown"),
                    "AIAssessmentEngine",
                    null, null, null);
        } catch (Exception e) {
            log.error("[Audit] score.generated.full failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "classification.assigned", groupId = "audit-service")
    public void onClassificationAssigned(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("CLASSIFICATION_ASSIGNED", "execution:" + parts[0], "SUCCESS",
                    "Classification: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "AIAssessmentEngine",
                    null, null, null);
        } catch (Exception e) {
            log.error("[Audit] classification.assigned failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.approved", groupId = "audit-service")
    public void onStartupApproved(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("STARTUP_APPROVED", "execution:" + parts[0], "SUCCESS",
                    "Startup approved by evaluator. UserId: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "EvaluationAndDecisionService",
                    parts.length > 1 ? parseLong(parts[1]) : null, null, "EVALUATOR");
        } catch (Exception e) {
            log.error("[Audit] startup.approved failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.rejected", groupId = "audit-service")
    public void onStartupRejected(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("STARTUP_REJECTED", "execution:" + parts[0], "SUCCESS",
                    "Startup rejected. Reason: " + (parts.length > 2 ? parts[2] : "unknown"),
                    "EvaluationAndDecisionService",
                    parts.length > 1 ? parseLong(parts[1]) : null, null, "EVALUATOR");
        } catch (Exception e) {
            log.error("[Audit] startup.rejected failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "startup.escalated", groupId = "audit-service")
    public void onStartupEscalated(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("STARTUP_ESCALATED", "execution:" + parts[0], "SUCCESS",
                    "Startup escalated. Reason: " + (parts.length > 2 ? parts[2] : "unknown"),
                    "EvaluationAndDecisionService",
                    parts.length > 1 ? parseLong(parts[1]) : null, null, "EVALUATOR");
        } catch (Exception e) {
            log.error("[Audit] startup.escalated failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "match.found", groupId = "audit-service")
    public void onMatchFound(String message) {
        try {
            String[] parts = message.split(":", 3);
            auditLogService.save("MATCH_FOUND", "execution:" + parts[0], "SUCCESS",
                    "Match found with investor execution: " + (parts.length > 1 ? parts[1] : "unknown"),
                    "InvestorMatchingService",
                    null, null, null);
        } catch (Exception e) {
            log.error("[Audit] match.found failed: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "match.presented", groupId = "audit-service")
    public void onMatchPresented(String message) {
        try {
            String[] parts = message.split(":", 2);
            auditLogService.save("MATCH_PRESENTED", "execution:" + parts[0], "SUCCESS",
                    "Match presented to parties",
                    "InvestorMatchingService",
                    null, null, null);
        } catch (Exception e) {
            log.error("[Audit] match.presented failed: {}", e.getMessage());
        }
    }

    private Long parseLong(String value) {
        try {
            return Long.parseLong(value.trim());
        } catch (Exception e) {
            return null;
        }
    }
}