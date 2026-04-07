package com.example.Investor.Matching.and.Presentation.service;

import com.example.Investor.Matching.and.Presentation.dto.MatchResponse;

import java.util.List;

public interface MatchingService {

    void runMatching(Long startupExecutionId, Long startupUserId);

    void runMatchingForNewInvestor(Long investorExecutionId, Long investorUserId);

    void runMatchingForAll();

    List<MatchResponse> getMatchesForInvestor(Long investorUserId);

    List<MatchResponse> getMatchesForStartup(Long startupUserId);

    List<MatchResponse> getAllMatches();
}