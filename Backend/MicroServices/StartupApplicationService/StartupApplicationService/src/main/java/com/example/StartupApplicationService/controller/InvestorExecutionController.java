package com.example.StartupApplicationService.controller;

import com.example.StartupApplicationService.dto.request.InvestorExecutionRequest;
import com.example.StartupApplicationService.dto.response.ApiResponse;
import com.example.StartupApplicationService.dto.response.InvestorExecutionResponse;
import com.example.StartupApplicationService.service.InvestorExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/executions/investor")
@RequiredArgsConstructor
public class InvestorExecutionController {

    private final InvestorExecutionService investorExecutionService;

    @PostMapping
    public ResponseEntity<ApiResponse<InvestorExecutionResponse>> submit(
            Authentication authentication,
            @Valid @RequestBody InvestorExecutionRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        InvestorExecutionResponse response = investorExecutionService.submit(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Execution submitted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvestorExecutionResponse>>> getAll(
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<InvestorExecutionResponse> executions = investorExecutionService.getAllByUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Executions fetched successfully", executions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvestorExecutionResponse>> getById(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        InvestorExecutionResponse response = investorExecutionService.getById(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvestorExecutionResponse>> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody InvestorExecutionRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        InvestorExecutionResponse response = investorExecutionService.update(id, userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution updated successfully", response));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<InvestorExecutionResponse>>> getAllForAdmin() {
        List<InvestorExecutionResponse> executions = investorExecutionService.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All investor executions fetched", executions));
    }

    @GetMapping("/internal/all")
    public ResponseEntity<ApiResponse<List<InvestorExecutionResponse>>> getAllInternal() {
        List<InvestorExecutionResponse> executions = investorExecutionService.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All investor executions fetched", executions));
    }

    @GetMapping("/internal/{id}")
    public ResponseEntity<ApiResponse<InvestorExecutionResponse>> getByIdInternal(@PathVariable Long id) {
        InvestorExecutionResponse response = investorExecutionService.getByIdInternal(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        investorExecutionService.withdraw(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution withdrawn successfully", null));
    }

    @PatchMapping("/{id}/ai-session")
    public ResponseEntity<ApiResponse<Void>> attachAiSession(
            @PathVariable Long id,
            @RequestParam String aiSessionId) {
        investorExecutionService.attachAiSession(id, aiSessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "AI session attached successfully", null));
    }

    @PatchMapping("/{id}/considerations")
    public ResponseEntity<ApiResponse<Void>> saveConsiderations(
            @PathVariable Long id,
            @RequestParam String additionalConsiderations) {
        investorExecutionService.saveAdditionalConsiderations(id, additionalConsiderations);
        return ResponseEntity.ok(new ApiResponse<>(true, "Considerations saved successfully", null));
    }

    @PatchMapping("/internal/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatusInternal(
            @PathVariable Long id,
            @RequestParam String status) {
        investorExecutionService.updateStatusInternal(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated successfully", null));
    }

    @PatchMapping("/{id}/fund")
    public ResponseEntity<ApiResponse<InvestorExecutionResponse>> markAsFunded(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        InvestorExecutionResponse response = investorExecutionService.markAsFunded(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution marked as funded", response));
    }

    @PatchMapping("/{id}/withhold")
    public ResponseEntity<ApiResponse<InvestorExecutionResponse>> withhold(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        InvestorExecutionResponse response = investorExecutionService.withhold(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution withheld successfully", response));
    }
}