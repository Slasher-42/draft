package com.example.StartupApplicationService.repository;

import com.example.StartupApplicationService.enums.ExecutionStatus;
import com.example.StartupApplicationService.model.InvestorExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestorExecutionRepository extends JpaRepository<InvestorExecution, Long> {

    List<InvestorExecution> findByUserId(Long userId);

    List<InvestorExecution> findByStatus(ExecutionStatus status);

    List<InvestorExecution> findByUserIdAndStatus(Long userId, ExecutionStatus status);
}