package com.example.Investor.Matching.and.Presentation.service;

import com.example.Investor.Matching.and.Presentation.dto.MatchResponse;

import java.util.List;

public interface MatchingService {

    void runMatching(Long startupExecutionId, Long startupUserId);

    List<MatchResponse> getMatchesForInvestor(Long investorUserId);

    List<MatchResponse> getMatchesForStartup(Long startupUserId);
}