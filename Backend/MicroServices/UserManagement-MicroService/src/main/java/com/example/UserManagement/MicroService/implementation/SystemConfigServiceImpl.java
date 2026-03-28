package com.example.UserManagement.MicroService.implementation;

import com.example.UserManagement.MicroService.dto.request.SystemConfigRequest;
import com.example.UserManagement.MicroService.model.SystemConfig;
import com.example.UserManagement.MicroService.repository.SystemConfigRepository;
import com.example.UserManagement.MicroService.service.SystemConfigService;
import org.springframework.stereotype.Service;

@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    public SystemConfigServiceImpl(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @Override
    public SystemConfig getConfig() {
        return systemConfigRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    SystemConfig defaultConfig = new SystemConfig();
                    return systemConfigRepository.save(defaultConfig);
                });
    }

    @Override
    public SystemConfig updateConfig(SystemConfigRequest request) {
        SystemConfig config = getConfig();
        config.setUpdateIntervalValue(request.getUpdateIntervalValue());
        config.setUpdateIntervalUnit(request.getUpdateIntervalUnit());
        config.setWeightFinancialHealth(request.getWeightFinancialHealth());
        config.setWeightTeamStrength(request.getWeightTeamStrength());
        config.setWeightMarketPotential(request.getWeightMarketPotential());
        config.setWeightBusinessViability(request.getWeightBusinessViability());
        config.setMinimumPassingScore(request.getMinimumPassingScore());
        if (request.getHeroVideoUrl() != null) {
            config.setHeroVideoUrl(request.getHeroVideoUrl());
        }
        return systemConfigRepository.save(config);
    }

    @Override
    public SystemConfig updateHeroVideo(String videoUrl) {
        SystemConfig config = getConfig();
        config.setHeroVideoUrl(videoUrl);
        return systemConfigRepository.save(config);
    }
}