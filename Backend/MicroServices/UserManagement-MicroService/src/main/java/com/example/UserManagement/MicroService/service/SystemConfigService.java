package com.example.UserManagement.MicroService.service;

import com.example.UserManagement.MicroService.dto.request.SystemConfigRequest;
import com.example.UserManagement.MicroService.model.SystemConfig;

public interface SystemConfigService {
    SystemConfig getConfig();
    SystemConfig updateConfig(SystemConfigRequest request);
}