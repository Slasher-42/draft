package com.example.StartupApplicationService.service;

import com.example.StartupApplicationService.dto.request.StartupExecutionRequest;
import com.example.StartupApplicationService.dto.response.StartupExecutionResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface StartupExecutionService {

    StartupExecutionResponse submit(Long userId, StartupExecutionRequest request);

    List<StartupExecutionResponse> getAllByUser(Long userId);

    StartupExecutionResponse getById(Long id, Long userId);

    StartupExecutionResponse update(Long id, Long userId, StartupExecutionRequest request);

    void attachAiSession(Long executionId, String aiSessionId);

    void saveAdditionalConsiderations(Long executionId, String additionalConsiderations, String authToken);

    List<StartupExecutionResponse> getAll();

    void withdraw(Long id, Long userId);

    StartupExecutionResponse getByIdInternal(Long id);

    void updateStatusInternal(Long id, String status);

    StartupExecutionResponse uploadImage(Long id, Long userId, MultipartFile file) throws IOException;
}