package com.example.Audit.and.Compliance.Service.repository;

import com.example.Audit.and.Compliance.Service.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:userId IS NULL OR a.userId = :userId)
            AND (:actionType IS NULL OR a.actionType = :actionType)
            AND (:serviceName IS NULL OR a.serviceName = :serviceName)
            AND (:outcome IS NULL OR a.outcome = :outcome)
            AND (:search IS NULL OR LOWER(a.userEmail) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
                 OR LOWER(a.actionType) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
                 OR LOWER(a.affectedResource) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            AND (:startDate IS NULL OR a.createdAt >= :startDate)
            AND (:endDate IS NULL OR a.createdAt <= :endDate)
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> findWithFilters(
            @Param("userId") Long userId,
            @Param("actionType") String actionType,
            @Param("serviceName") String serviceName,
            @Param("outcome") String outcome,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}