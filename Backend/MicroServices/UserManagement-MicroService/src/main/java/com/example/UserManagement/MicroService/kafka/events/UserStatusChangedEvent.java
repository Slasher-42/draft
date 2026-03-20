package com.example.UserManagement.MicroService.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatusChangedEvent {
    private Long userId;
    private String email;
    private boolean enabled;
    private LocalDateTime changedAt;
}