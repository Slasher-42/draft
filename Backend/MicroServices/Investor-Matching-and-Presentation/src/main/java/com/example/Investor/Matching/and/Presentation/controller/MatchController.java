package com.example.Investor.Matching.and.Presentation.controller;

import com.example.Investor.Matching.and.Presentation.dto.ApiResponse;
import com.example.Investor.Matching.and.Presentation.dto.MatchResponse;
import com.example.Investor.Matching.and.Presentation.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;

    @GetMapping("/investor/{investorUserId}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesForInvestor(
            @PathVariable Long investorUserId) {
        List<MatchResponse> matches = matchingService.getMatchesForInvestor(investorUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Matches fetched successfully", matches));
    }

    @GetMapping("/startup/{startupUserId}")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getMatchesForStartup(
            @PathVariable Long startupUserId) {
        List<MatchResponse> matches = matchingService.getMatchesForStartup(startupUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Matches fetched successfully", matches));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getAllMatches() {
        List<MatchResponse> matches = matchingService.getAllMatches();
        return ResponseEntity.ok(new ApiResponse<>(true, "All matches fetched successfully", matches));
    }
    @PostMapping("/admin/run-matching")
    public ResponseEntity<ApiResponse<String>> runMatchingForAll() {
        matchingService.runMatchingForAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Matching run triggered successfully", null));
    }

    @PostMapping("/internal/investor-submitted")
    public ResponseEntity<ApiResponse<String>> runMatchingForNewInvestor(
            @RequestParam Long executionId,
            @RequestParam Long investorUserId) {
        matchingService.runMatchingForNewInvestor(executionId, investorUserId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Matching run triggered for investor execution", null));
    }
}