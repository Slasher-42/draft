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

    @Query(
        value = """
                SELECT id, action_type, affected_resource, created_at, details,
                       outcome, service_name, user_email, user_id, user_role
                FROM audit_logs
                WHERE (:userId    IS NULL OR user_id      = :userId)
                  AND (:actionType IS NULL OR action_type  = CAST(:actionType AS TEXT))
                  AND (:serviceName IS NULL OR service_name = CAST(:serviceName AS TEXT))
                  AND (:outcome    IS NULL OR outcome      = CAST(:outcome AS TEXT))
                  AND (CAST(:search AS TEXT) IS NULL
                       OR LOWER(user_email)       LIKE LOWER('%' || CAST(:search AS TEXT) || '%')
                       OR LOWER(action_type)      LIKE LOWER('%' || CAST(:search AS TEXT) || '%')
                       OR LOWER(affected_resource) LIKE LOWER('%' || CAST(:search AS TEXT) || '%'))
                  AND (CAST(:startDate AS TIMESTAMP) IS NULL OR created_at >= CAST(:startDate AS TIMESTAMP))
                  AND (CAST(:endDate   AS TIMESTAMP) IS NULL OR created_at <= CAST(:endDate   AS TIMESTAMP))
                ORDER BY created_at DESC
                """,
        countQuery = """
                SELECT COUNT(*)
                FROM audit_logs
                WHERE (:userId    IS NULL OR user_id      = :userId)
                  AND (:actionType IS NULL OR action_type  = CAST(:actionType AS TEXT))
                  AND (:serviceName IS NULL OR service_name = CAST(:serviceName AS TEXT))
                  AND (:outcome    IS NULL OR outcome      = CAST(:outcome AS TEXT))
                  AND (CAST(:search AS TEXT) IS NULL
                       OR LOWER(user_email)       LIKE LOWER('%' || CAST(:search AS TEXT) || '%')
                       OR LOWER(action_type)      LIKE LOWER('%' || CAST(:search AS TEXT) || '%')
                       OR LOWER(affected_resource) LIKE LOWER('%' || CAST(:search AS TEXT) || '%'))
                  AND (CAST(:startDate AS TIMESTAMP) IS NULL OR created_at >= CAST(:startDate AS TIMESTAMP))
                  AND (CAST(:endDate   AS TIMESTAMP) IS NULL OR created_at <= CAST(:endDate   AS TIMESTAMP))
                """,
        nativeQuery = true
    )
    Page<AuditLog> findWithFilters(
            @Param("userId")      Long userId,
            @Param("actionType")  String actionType,
            @Param("serviceName") String serviceName,
            @Param("outcome")     String outcome,
            @Param("search")      String search,
            @Param("startDate")   LocalDateTime startDate,
            @Param("endDate")     LocalDateTime endDate,
            Pageable pageable
    );
}
