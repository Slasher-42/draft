package com.example.Reporting.and.Notification.Service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private long totalExecutions = 0;

    @Column(nullable = false)
    private long totalApproved = 0;

    @Column(nullable = false)
    private long totalRejected = 0;

    @Column(nullable = false)
    private long totalMatched = 0;

    @Column(nullable = false)
    private long totalEscalated = 0;


    @Column(nullable = false)
    private long highlyReady = 0;

    @Column(nullable = false)
    private long moderatelyReady = 0;

    @Column(nullable = false)
    private long notReady = 0;

    @Column(columnDefinition = "TEXT")
    private String scoreDataJson;

    @Column(nullable = false)
    private LocalDateTime lastUpdatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastUpdatedAt = LocalDateTime.now();
    }
}