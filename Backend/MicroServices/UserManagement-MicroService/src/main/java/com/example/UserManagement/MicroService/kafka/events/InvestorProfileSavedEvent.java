package com.example.UserManagement.MicroService.kafka.events;

import com.example.UserManagement.MicroService.enums.IndustryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvestorProfileSavedEvent {
    private Long profileId;
    private Long userId;
    private String organizationName;
    private IndustryType preferredIndustry;
    private Double investmentBudget;
    private String country;
    private String city;
    private LocalDateTime savedAt;
}