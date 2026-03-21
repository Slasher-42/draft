package com.example.StartupApplicationService.repository;

import com.example.StartupApplicationService.enums.ExecutionStatus;
import com.example.StartupApplicationService.model.StartupExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StartupExecutionRepository extends JpaRepository<StartupExecution, Long> {

    List<StartupExecution> findByUserId(Long userId);

    List<StartupExecution> findByStatus(ExecutionStatus status);

    List<StartupExecution> findByUserIdAndStatus(Long userId, ExecutionStatus status);
}