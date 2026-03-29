package com.example.Investor.Matching.and.Presentation.model;

import com.example.Investor.Matching.and.Presentation.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "investor_matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestorMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long startupExecutionId;

    @Column(nullable = false)
    private Long startupUserId;

    @Column(nullable = false)
    private Long investorExecutionId;

    @Column(nullable = false)
    private Long investorUserId;

    @Column(nullable = false)
    private Double matchScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.MATCHED;

    @Column(columnDefinition = "TEXT")
    private String matchReason;

    @CreationTimestamp
    private LocalDateTime matchedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}