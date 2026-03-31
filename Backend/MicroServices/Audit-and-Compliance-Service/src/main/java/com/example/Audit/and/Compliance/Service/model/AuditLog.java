package com.example.Audit.and.Compliance.Service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_role")
    private String userRole;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "affected_resource")
    private String affectedResource;

    @Column(name = "outcome", nullable = false)
    private String outcome;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "service_name")
    private String serviceName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}