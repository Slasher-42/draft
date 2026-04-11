package com.example.StartupApplicationService.service;

import com.example.StartupApplicationService.dto.request.InvestorExecutionRequest;
import com.example.StartupApplicationService.dto.response.InvestorExecutionResponse;

import java.util.List;

public interface InvestorExecutionService {

    InvestorExecutionResponse submit(Long userId, InvestorExecutionRequest request);

    List<InvestorExecutionResponse> getAllByUser(Long userId);

    InvestorExecutionResponse getById(Long id, Long userId);

    InvestorExecutionResponse update(Long id, Long userId, InvestorExecutionRequest request);

    void attachAiSession(Long executionId, String aiSessionId);

    void saveAdditionalConsiderations(Long executionId, String additionalConsiderations);

    List<InvestorExecutionResponse> getAll();

    void withdraw(Long id, Long userId);

    InvestorExecutionResponse getByIdInternal(Long id);

    void updateStatusInternal(Long id, String status);
}