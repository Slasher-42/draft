package com.example.UserManagement.MicroService.controller;

import com.example.UserManagement.MicroService.dto.request.SystemConfigRequest;
import com.example.UserManagement.MicroService.dto.response.ApiResponse;
import com.example.UserManagement.MicroService.model.SystemConfig;
import com.example.UserManagement.MicroService.service.S3Service;
import com.example.UserManagement.MicroService.service.SystemConfigService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/config")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;
    private final S3Service s3Service;

    public SystemConfigController(SystemConfigService systemConfigService, S3Service s3Service) {
        this.systemConfigService = systemConfigService;
        this.s3Service = s3Service;
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

    @PostMapping("/hero-video")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemConfig>> uploadHeroVideo(
            @RequestParam("file") MultipartFile file) throws IOException {

        SystemConfig current = systemConfigService.getConfig();
        if (current.getHeroVideoUrl() != null && !current.getHeroVideoUrl().isBlank()) {
            try { s3Service.deleteByUrl(current.getHeroVideoUrl()); } catch (Exception ignored) {}
        }
        String videoUrl = s3Service.uploadHeroVideo(file);
        SystemConfig updated = systemConfigService.updateHeroVideo(videoUrl);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hero video uploaded successfully", updated));
    }

    @DeleteMapping("/hero-video")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemConfig>> removeHeroVideo() {
        SystemConfig current = systemConfigService.getConfig();
        if (current.getHeroVideoUrl() != null && !current.getHeroVideoUrl().isBlank()) {
            try { s3Service.deleteByUrl(current.getHeroVideoUrl()); } catch (Exception ignored) {}
        }
        SystemConfig updated = systemConfigService.updateHeroVideo(null);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hero video removed", updated));
    }
}