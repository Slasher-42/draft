package com.example.UserManagement.MicroService.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long updateIntervalValue = 42L;

    @Column(nullable = false)
    private String updateIntervalUnit = "HOURS";

    @Column(nullable = false)
    private Double weightFinancialHealth = 25.0;

    @Column(nullable = false)
    private Double weightTeamStrength = 25.0;

    @Column(nullable = false)
    private Double weightMarketPotential = 25.0;

    @Column(nullable = false)
    private Double weightBusinessViability = 25.0;

    @Column(nullable = false)
    private Double minimumPassingScore = 60.0;

    @Column(length = 1024)
    private String heroVideoUrl;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}