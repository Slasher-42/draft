package com.example.Followup_service.service;

import com.example.Followup_service.dto.request.CreateContractRequest;
import com.example.Followup_service.dto.request.SignContractRequest;
import com.example.Followup_service.dto.request.ValidateContractRequest;
import com.example.Followup_service.dto.response.ContractResponse;

import java.util.List;

public interface ContractService {
    ContractResponse createContract(Long adminId, CreateContractRequest request);
    ContractResponse sign(Long contractId, Long userId, SignContractRequest request);
    ContractResponse validate(Long contractId, Long adminId, ValidateContractRequest request);
    ContractResponse getById(Long contractId);
    List<ContractResponse> getAll();
    List<ContractResponse> getMyContracts(Long userId);
}
