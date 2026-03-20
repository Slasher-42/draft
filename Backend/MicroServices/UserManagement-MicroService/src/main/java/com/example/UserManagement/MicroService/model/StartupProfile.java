package com.example.UserManagement.MicroService.model;

import com.example.UserManagement.MicroService.enums.IndustryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "startup_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartupProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IndustryType industry;

    private String description;

    private Integer foundedYear;

    private Integer teamSize;

    private String website;

    private String country;

    private String city;

    @Column(nullable = false)
    private Double fundingNeeded;
}