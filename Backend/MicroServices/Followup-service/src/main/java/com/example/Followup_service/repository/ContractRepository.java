package com.example.Followup_service.repository;

import com.example.Followup_service.enums.ContractStatus;
import com.example.Followup_service.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByInvestorUserId(Long investorUserId);
    List<Contract> findByStartupUserId(Long startupUserId);
    List<Contract> findByMeetupId(Long meetupId);
    List<Contract> findByStatus(ContractStatus status);
}
