package com.example.UserManagement.MicroService.kafka.events;

import com.example.UserManagement.MicroService.enums.IndustryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartupProfileSavedEvent {
    private Long profileId;
    private Long userId;
    private String companyName;
    private IndustryType industry;
    private String description;
    private Integer foundedYear;
    private Integer teamSize;
    private String website;
    private String country;
    private String city;
    private Double fundingNeeded;
    private LocalDateTime savedAt;
}