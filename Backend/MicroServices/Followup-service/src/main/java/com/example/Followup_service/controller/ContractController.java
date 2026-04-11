package com.example.Followup_service.controller;

import com.example.Followup_service.dto.request.CreateContractRequest;
import com.example.Followup_service.dto.request.SignContractRequest;
import com.example.Followup_service.dto.request.ValidateContractRequest;
import com.example.Followup_service.dto.response.ApiResponse;
import com.example.Followup_service.dto.response.ContractResponse;
import com.example.Followup_service.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/followup/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> createContract(
            Authentication auth,
            @Valid @RequestBody CreateContractRequest request) {
        Long adminId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Contract created",
                contractService.createContract(adminId, request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Contracts fetched", contractService.getAll()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_INVESTOR', 'ROLE_STARTUP', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getMyContracts(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "My contracts fetched",
                contractService.getMyContracts(userId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ContractResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Contract fetched", contractService.getById(id)));
    }

    @PostMapping("/{id}/sign")
    @PreAuthorize("hasAnyAuthority('ROLE_INVESTOR', 'ROLE_STARTUP')")
    public ResponseEntity<ApiResponse<ContractResponse>> sign(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody SignContractRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Contract signed",
                contractService.sign(id, userId, request)));
    }

    @PatchMapping("/{id}/validate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> validate(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody ValidateContractRequest request) {
        Long adminId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Contract validated",
                contractService.validate(id, adminId, request)));
    }
}
