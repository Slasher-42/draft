package com.example.StartupApplicationService.controller;

import com.example.StartupApplicationService.dto.request.StartupExecutionRequest;
import com.example.StartupApplicationService.dto.response.ApiResponse;
import com.example.StartupApplicationService.dto.response.StartupExecutionResponse;
import com.example.StartupApplicationService.service.StartupExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/executions/startup")
@RequiredArgsConstructor
public class StartupExecutionController {

    private final StartupExecutionService startupExecutionService;

    @PostMapping
    public ResponseEntity<ApiResponse<StartupExecutionResponse>> submit(
            Authentication authentication,
            @Valid @RequestBody StartupExecutionRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        StartupExecutionResponse response = startupExecutionService.submit(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Execution submitted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StartupExecutionResponse>>> getAll(
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<StartupExecutionResponse> executions = startupExecutionService.getAllByUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Executions fetched successfully", executions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StartupExecutionResponse>> getById(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        StartupExecutionResponse response = startupExecutionService.getById(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StartupExecutionResponse>> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody StartupExecutionRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        StartupExecutionResponse response = startupExecutionService.update(id, userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution updated successfully", response));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StartupExecutionResponse>>> getAllForAdmin() {
        List<StartupExecutionResponse> executions = startupExecutionService.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All startup executions fetched", executions));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        startupExecutionService.withdraw(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Execution withdrawn successfully", null));
    }

    @PatchMapping("/{id}/ai-session")
    public ResponseEntity<ApiResponse<Void>> attachAiSession(
            @PathVariable Long id,
            @RequestParam String aiSessionId) {
        startupExecutionService.attachAiSession(id, aiSessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "AI session attached successfully", null));
    }

    @PatchMapping("/{id}/considerations")
    public ResponseEntity<ApiResponse<Void>> saveConsiderations(
            @PathVariable Long id,
            @RequestParam String additionalConsiderations) {
        startupExecutionService.saveAdditionalConsiderations(id, additionalConsiderations);
        return ResponseEntity.ok(new ApiResponse<>(true, "Considerations saved successfully", null));
    }
}