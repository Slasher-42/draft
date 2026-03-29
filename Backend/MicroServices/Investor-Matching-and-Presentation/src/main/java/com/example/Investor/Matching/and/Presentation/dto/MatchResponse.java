package com.example.Investor.Matching.and.Presentation.dto;

import com.example.Investor.Matching.and.Presentation.enums.MatchStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private Long startupExecutionId;
    private Long startupUserId;
    private Long investorExecutionId;
    private Long investorUserId;
    private Double matchScore;
    private String matchReason;
    private MatchStatus status;
    private LocalDateTime matchedAt;
}