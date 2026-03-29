package com.example.Investor.Matching.and.Presentation.repository;

import com.example.Investor.Matching.and.Presentation.model.InvestorMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestorMatchRepository extends JpaRepository<InvestorMatch, Long> {

    List<InvestorMatch> findByInvestorUserId(Long investorUserId);

    List<InvestorMatch> findByStartupUserId(Long startupUserId);

    List<InvestorMatch> findByStartupExecutionId(Long startupExecutionId);

    boolean existsByStartupExecutionIdAndInvestorExecutionId(Long startupExecutionId, Long investorExecutionId);
}