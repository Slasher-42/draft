package com.example.Reporting.and.Notification.Service.repository;

import com.example.Reporting.and.Notification.Service.enums.NotificationType;
import com.example.Reporting.and.Notification.Service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);

    List<Notification> findByRecipientUserIdAndReadFalse(Long recipientUserId);

    boolean existsByRecipientUserIdAndRelatedExecutionIdAndTypeAndCreatedAtAfter(
            Long recipientUserId,
            Long relatedExecutionId,
            NotificationType type,
            LocalDateTime after
    );
}