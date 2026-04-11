package com.example.Followup_service.model;

import com.example.Followup_service.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long meetupId;

    @Column(nullable = false)
    private Long matchId;

    @Column(nullable = false)
    private Long investorUserId;

    @Column(nullable = false)
    private Long startupUserId;

    @Column(columnDefinition = "TEXT")
    private String contractDetails;

    private String investorSignature;
    private String startupSignature;
    private String adminValidationSignature;
    private Long validatedByAdminId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status = ContractStatus.PENDING_SIGNATURES;

    private LocalDateTime investorSignedAt;
    private LocalDateTime startupSignedAt;
    private LocalDateTime validatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
