package com.example.Reporting.and.Notification.Service.dto.response;

import com.example.Reporting.and.Notification.Service.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientUserId;
    private NotificationType type;
    private String message;
    private Long relatedExecutionId;
    private boolean read;
    private LocalDateTime createdAt;
}