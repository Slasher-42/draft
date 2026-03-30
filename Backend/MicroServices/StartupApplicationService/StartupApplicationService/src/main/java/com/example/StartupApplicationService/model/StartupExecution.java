package com.example.StartupApplicationService.model;

import com.example.StartupApplicationService.enums.CompanySize;
import com.example.StartupApplicationService.enums.ExecutionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "startup_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartupExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanySize targetCompanySize;

    @Column(nullable = false)
    private String suggestedFundingRange;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String problemStatement;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String businessModel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetMarket;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String teamDetails;

    @Column(nullable = false)
    private Double annualRevenue;

    @Column(nullable = false)
    private Double monthlyBurnRate;

    @Column(nullable = false)
    private Double fundingNeeded;

    @Column(unique = true)
    private String aiSessionId;

    @Column(columnDefinition = "TEXT")
    private String additionalConsiderations;

    @Column
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String statusReason;

    private LocalDateTime statusUpdatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}