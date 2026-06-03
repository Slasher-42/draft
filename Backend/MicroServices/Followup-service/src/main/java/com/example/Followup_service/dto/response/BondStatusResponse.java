package com.example.Followup_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BondStatusResponse {
    private Long investorUserId;
    private Long startupUserId;
    private long messageCount;
    private boolean active;
    private LocalDateTime lastMessageAt;
}
