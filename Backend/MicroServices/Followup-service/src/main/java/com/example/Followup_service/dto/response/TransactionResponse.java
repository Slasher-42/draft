package com.example.Followup_service.dto.response;

import com.example.Followup_service.enums.TransactionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionResponse {
    private Long id;
    private Long fromUserId;
    private Long toUserId;
    private Long matchId;
    private Long contractId;
    private BigDecimal amount;
    private String description;
    private TransactionStatus status;
    private LocalDateTime createdAt;
}
