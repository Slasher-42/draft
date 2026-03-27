package com.example.StartupApplicationService.implementation;

import com.example.StartupApplicationService.dto.request.InvestorExecutionRequest;
import com.example.StartupApplicationService.dto.response.InvestorExecutionResponse;
import com.example.StartupApplicationService.enums.ExecutionStatus;
import com.example.StartupApplicationService.exception.ResourceNotFoundException;
import com.example.StartupApplicationService.kafka.ExecutionEventPublisher;
import com.example.StartupApplicationService.model.InvestorExecution;
import com.example.StartupApplicationService.repository.InvestorExecutionRepository;
import com.example.StartupApplicationService.service.InvestorExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestorExecutionServiceImpl implements InvestorExecutionService {

    private final InvestorExecutionRepository investorExecutionRepository;
    private final ExecutionEventPublisher eventPublisher;

    @Override
    public InvestorExecutionResponse submit(Long userId, InvestorExecutionRequest request) {
        InvestorExecution execution = new InvestorExecution();
        execution.setUserId(userId);
        execution.setPreferredIndustry(request.getPreferredIndustry());
        execution.setInvestmentReason(request.getInvestmentReason());
        execution.setInvestmentBudget(request.getInvestmentBudget());
        execution.setExpectedReturnTimeline(request.getExpectedReturnTimeline());
        execution.setSuccessCriteria(request.getSuccessCriteria());
        execution.setStatus(ExecutionStatus.PENDING);

        InvestorExecution saved = investorExecutionRepository.save(execution);
        eventPublisher.publishInvestorExecutionSubmitted(saved.getId(), userId);
        return toResponse(saved);
    }

    @Override
    public List<InvestorExecutionResponse> getAll() {
        return investorExecutionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<InvestorExecutionResponse> getAllByUser(Long userId) {
        return investorExecutionRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public InvestorExecutionResponse getById(Long id, Long userId) {
        InvestorExecution execution = investorExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        if (!execution.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Execution not found with id: " + id);
        }
        return toResponse(execution);
    }

    @Override
    public InvestorExecutionResponse update(Long id, Long userId, InvestorExecutionRequest request) {
        InvestorExecution execution = investorExecutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        if (!execution.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Execution not found with id: " + id);
        }
        execution.setPreferredIndustry(request.getPreferredIndustry());
        execution.setInvestmentReason(request.getInvestmentReason());
        execution.setInvestmentBudget(request.getInvestmentBudget());
        execution.setExpectedReturnTimeline(request.getExpectedReturnTimeline());
        execution.setSuccessCriteria(request.getSuccessCriteria());

        return toResponse(investorExecutionRepository.save(execution));
    }

    @Override
    public void attachAiSession(Long executionId, String aiSessionId) {
        InvestorExecution execution = investorExecutionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + executionId));
        execution.setAiSessionId(aiSessionId);
        investorExecutionRepository.save(execution);
    }

    @Override
    public void saveAdditionalConsiderations(Long executionId, String additionalConsiderations) {
        InvestorExecution execution = investorExecutionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + executionId));
        execution.setAdditionalConsiderations(additionalConsiderations);
        execution.setStatusUpdatedAt(LocalDateTime.now());
        investorExecutionRepository.save(execution);
    }

    private InvestorExecutionResponse toResponse(InvestorExecution e) {
        InvestorExecutionResponse response = new InvestorExecutionResponse();
        response.setId(e.getId());
        response.setUserId(e.getUserId());
        response.setPreferredIndustry(e.getPreferredIndustry());
        response.setInvestmentReason(e.getInvestmentReason());
        response.setInvestmentBudget(e.getInvestmentBudget());
        response.setExpectedReturnTimeline(e.getExpectedReturnTimeline());
        response.setSuccessCriteria(e.getSuccessCriteria());
        response.setAiSessionId(e.getAiSessionId());
        response.setAdditionalConsiderations(e.getAdditionalConsiderations());
        response.setStatus(e.getStatus());
        response.setStatusReason(e.getStatusReason());
        response.setStatusUpdatedAt(e.getStatusUpdatedAt());
        response.setCreatedAt(e.getCreatedAt());
        response.setUpdatedAt(e.getUpdatedAt());
        return response;
    }
}