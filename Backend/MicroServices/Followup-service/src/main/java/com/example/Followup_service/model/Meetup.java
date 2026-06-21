package com.example.Followup_service.model;

import com.example.Followup_service.enums.MeetupStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meetup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long matchId;

    @Column(nullable = false)
    private Long investorUserId;

    @Column(nullable = false)
    private Long startupUserId;

    @Column(nullable = false)
    private Long scheduledByAdminId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetupStatus status = MeetupStatus.SCHEDULED;

    @Column(nullable = false, unique = true)
    private String roomId;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    private Boolean reminderSent = false;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Long adjournedByUserId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
