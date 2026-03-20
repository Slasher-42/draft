package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.SystemConfigRequest;
import com.example.UserManagement.MicroService.dto.response.ApiResponse;
import com.example.UserManagement.MicroService.model.SystemConfig;
import com.example.UserManagement.MicroService.service.SystemConfigService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SystemConfig>> getConfig() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Config fetched", systemConfigService.getConfig()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemConfig>> updateConfig(@Valid @RequestBody SystemConfigRequest request) {
        double total = request.getWeightFinancialHealth()
                + request.getWeightTeamStrength()
                + request.getWeightMarketPotential()
                + request.getWeightBusinessViability();

        if (Math.abs(total - 100.0) > 0.01) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "The four scoring weights must add up to 100", null));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Config updated", systemConfigService.updateConfig(request)));
    }
}