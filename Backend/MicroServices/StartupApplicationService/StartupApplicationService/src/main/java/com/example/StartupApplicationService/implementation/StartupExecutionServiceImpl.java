package com.example.StartupApplicationService.implementation;

import com.example.StartupApplicationService.dto.request.StartupExecutionRequest;
import com.example.StartupApplicationService.dto.response.StartupExecutionResponse;
import com.example.StartupApplicationService.enums.CompanySize;
import com.example.StartupApplicationService.enums.ExecutionStatus;
import com.example.StartupApplicationService.exception.ResourceNotFoundException;
import com.example.StartupApplicationService.kafka.ExecutionEventPublisher;
import com.example.StartupApplicationService.model.StartupExecution;
import com.example.StartupApplicationService.repository.StartupExecutionRepository;
import com.example.StartupApplicationService.service.S3Service;
import com.example.StartupApplicationService.service.StartupExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StartupExecutionServiceImpl implements StartupExecutionService {

    private final StartupExecutionRepository startupExecutionRepository;
    private final ExecutionEventPublisher eventPublisher;
    private final S3Service s3Service;

    @Override
    public StartupExecutionResponse submit(Long userId, StartupExecutionRequest request) {
        StartupExecution execution = new StartupExecution();
        execution.setUserId(userId);
        execution.setTargetCompanySize(request.getTargetCompanySize());
        execution.setSuggestedFundingRange(resolveFundingRange(request.getTargetCompanySize()));
        execution.setIndustry(request.getIndustry());
        execution.setProblemStatement(request.getProblemStatement());
        execution.setBusinessModel(request.getBusinessModel());
        execution.setTargetMarket(request.getTargetMarket());
        execution.setTeamDetails(request.getTeamDetails());
        execution.setAnnualRevenue(request.getAnnualRevenue());
        execution.setMonthlyBurnRate(request.getMonthlyBurnRate());
        execution.setFundingNeeded(request.getFundingNeeded());
        execution.setLocation(request.getLocation());
        execution.setStatus(ExecutionStatus.PENDING);

       StartupExecution saved = startupExecutionRepository.save(execution);
CompletableFuture.runAsync(() -> eventPublisher.publishStartupExecutionSubmitted(saved.getId(), userId));
return toResponse(saved);
    }

    @Override
    public List<StartupExecutionResponse> getAll() {
        return startupExecutionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<StartupExecutionResponse> getAllByUser(Long userId) {
        return startupExecutionRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StartupExecutionResponse getById(Long id, Long userId) {
        StartupExecution execution = startupExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        if (!execution.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Execution not found with id: " + id);
        }
        return toResponse(execution);
    }

    @Override
    public StartupExecutionResponse update(Long id, Long userId, StartupExecutionRequest request) {
        StartupExecution execution = startupExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        if (!execution.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Execution not found with id: " + id);
        }
        execution.setTargetCompanySize(request.getTargetCompanySize());
        execution.setSuggestedFundingRange(resolveFundingRange(request.getTargetCompanySize()));
        execution.setIndustry(request.getIndustry());
        execution.setProblemStatement(request.getProblemStatement());
        execution.setBusinessModel(request.getBusinessModel());
        execution.setTargetMarket(request.getTargetMarket());
        execution.setTeamDetails(request.getTeamDetails());
        execution.setAnnualRevenue(request.getAnnualRevenue());
        execution.setMonthlyBurnRate(request.getMonthlyBurnRate());
        execution.setFundingNeeded(request.getFundingNeeded());
        execution.setLocation(request.getLocation());

        return toResponse(startupExecutionRepository.save(execution));
    }

    @Override
    public void attachAiSession(Long executionId, String aiSessionId) {
        StartupExecution execution = startupExecutionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + executionId));
        execution.setAiSessionId(aiSessionId);
        startupExecutionRepository.save(execution);
    }

    @Override
    public void saveAdditionalConsiderations(Long executionId, String additionalConsiderations, String authToken) {
        StartupExecution execution = startupExecutionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + executionId));
        execution.setAdditionalConsiderations(additionalConsiderations);
        execution.setStatusUpdatedAt(LocalDateTime.now());
        startupExecutionRepository.save(execution);
        // Scoring is triggered by the frontend after this call returns.
    }

    @Override
    public StartupExecutionResponse getByIdInternal(Long id) {
        StartupExecution execution = startupExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        return toResponse(execution);
    }

    @Override
    public void updateStatusInternal(Long id, String status) {
        StartupExecution execution = startupExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        execution.setStatus(ExecutionStatus.valueOf(status));
        execution.setStatusUpdatedAt(LocalDateTime.now());
        startupExecutionRepository.save(execution);
    }

    @Override
    public void withdraw(Long id, Long userId) {
        StartupExecution execution = startupExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        if (!execution.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Execution not found with id: " + id);
        }
        startupExecutionRepository.delete(execution);
    }

    private String resolveFundingRange(CompanySize size) {
        return switch (size) {
            case MICRO      -> "$10,000 – $100,000";
            case SMALL      -> "$100,000 – $500,000";
            case MEDIUM     -> "$500,000 – $2,000,000";
            case LARGE      -> "$2,000,000 – $10,000,000";
            case ENTERPRISE -> "$10,000,000+";
        };
    }

    private StartupExecutionResponse toResponse(StartupExecution e) {
        StartupExecutionResponse response = new StartupExecutionResponse();
        response.setId(e.getId());
        response.setUserId(e.getUserId());
        response.setTargetCompanySize(e.getTargetCompanySize());
        response.setSuggestedFundingRange(e.getSuggestedFundingRange());
        response.setIndustry(e.getIndustry());
        response.setProblemStatement(e.getProblemStatement());
        response.setBusinessModel(e.getBusinessModel());
        response.setTargetMarket(e.getTargetMarket());
        response.setTeamDetails(e.getTeamDetails());
        response.setAnnualRevenue(e.getAnnualRevenue());
        response.setMonthlyBurnRate(e.getMonthlyBurnRate());
        response.setFundingNeeded(e.getFundingNeeded());
        response.setAiSessionId(e.getAiSessionId());
        response.setAdditionalConsiderations(e.getAdditionalConsiderations());
        response.setLocation(e.getLocation());
        response.setImageUrl(e.getImageUrl());
        response.setStatus(e.getStatus());
        response.setStatusReason(e.getStatusReason());
        response.setStatusUpdatedAt(e.getStatusUpdatedAt());
        response.setCreatedAt(e.getCreatedAt());
        response.setUpdatedAt(e.getUpdatedAt());
        return response;
    }

    @Override
    public StartupExecutionResponse uploadImage(Long id, Long userId, MultipartFile file) throws IOException {
        StartupExecution execution = startupExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        if (!execution.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Execution not found with id: " + id);
        }
        if (execution.getImageUrl() != null) {
            try { s3Service.deleteByUrl(execution.getImageUrl()); } catch (Exception ignored) {}
        }
        String url = s3Service.uploadExecutionImage(id, file);
        execution.setImageUrl(url);
        return toResponse(startupExecutionRepository.save(execution));
    }
}