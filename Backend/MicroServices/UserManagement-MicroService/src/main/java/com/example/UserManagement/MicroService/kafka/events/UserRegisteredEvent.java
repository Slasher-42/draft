package com.example.UserManagement.MicroService.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisteredEvent {
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private LocalDateTime registeredAt;
}