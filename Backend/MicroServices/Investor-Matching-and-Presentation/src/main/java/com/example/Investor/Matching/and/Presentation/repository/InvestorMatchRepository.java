package com.example.Investor.Matching.and.Presentation.repository;

import com.example.Investor.Matching.and.Presentation.model.InvestorMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface InvestorMatchRepository extends JpaRepository<InvestorMatch, Long> {

    List<InvestorMatch> findByInvestorUserId(Long investorUserId);

    List<InvestorMatch> findByStartupUserId(Long startupUserId);

    List<InvestorMatch> findByStartupExecutionId(Long startupExecutionId);

    boolean existsByStartupExecutionIdAndInvestorExecutionId(Long startupExecutionId, Long investorExecutionId);

    @Query("SELECT m.investorExecutionId FROM InvestorMatch m WHERE m.startupExecutionId = :startupExecutionId")
    Set<Long> findMatchedInvestorExecutionIds(@Param("startupExecutionId") Long startupExecutionId);

    @Query("SELECT m.startupExecutionId FROM InvestorMatch m WHERE m.investorExecutionId = :investorExecutionId")
    Set<Long> findMatchedStartupExecutionIds(@Param("investorExecutionId") Long investorExecutionId);
}