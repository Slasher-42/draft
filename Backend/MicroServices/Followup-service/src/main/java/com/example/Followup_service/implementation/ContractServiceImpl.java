package com.example.Followup_service.implementation;

import com.example.Followup_service.dto.request.CreateContractRequest;
import com.example.Followup_service.dto.request.SignContractRequest;
import com.example.Followup_service.dto.request.ValidateContractRequest;
import com.example.Followup_service.dto.response.ContractResponse;
import com.example.Followup_service.enums.ContractStatus;
import com.example.Followup_service.enums.MeetupStatus;
import com.example.Followup_service.exception.BadRequestException;
import com.example.Followup_service.exception.ResourceNotFoundException;
import com.example.Followup_service.model.Contract;
import com.example.Followup_service.model.Meetup;
import com.example.Followup_service.repository.ContractRepository;
import com.example.Followup_service.repository.MeetupRepository;
import com.example.Followup_service.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final MeetupRepository meetupRepository;

    @Override
    public ContractResponse createContract(Long adminId, CreateContractRequest request) {
        Meetup meetup = meetupRepository.findById(request.getMeetupId())
                .orElseThrow(() -> new ResourceNotFoundException("Meetup not found: " + request.getMeetupId()));

        if (meetup.getStatus() != MeetupStatus.COMPLETED) {
            throw new BadRequestException("Contract can only be created after meetup is COMPLETED");
        }

        Contract contract = new Contract();
        contract.setMeetupId(meetup.getId());
        contract.setMatchId(meetup.getMatchId());
        contract.setInvestorUserId(meetup.getInvestorUserId());
        contract.setStartupUserId(meetup.getStartupUserId());
        contract.setContractDetails(request.getContractDetails());
        return toResponse(contractRepository.save(contract));
    }

    @Override
    public ContractResponse sign(Long contractId, Long userId, SignContractRequest request) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));

        if (contract.getStatus() == ContractStatus.VALIDATED) {
            throw new BadRequestException("Contract is already validated");
        }

        boolean isInvestor = contract.getInvestorUserId().equals(userId);
        boolean isStartup  = contract.getStartupUserId().equals(userId);

        if (!isInvestor && !isStartup) {
            throw new BadRequestException("You are not a party to this contract");
        }

        if (isInvestor) {
            contract.setInvestorSignature(request.getSignature());
            contract.setInvestorSignedAt(LocalDateTime.now());
        } else {
            contract.setStartupSignature(request.getSignature());
            contract.setStartupSignedAt(LocalDateTime.now());
        }

        // Advance status
        boolean investorSigned = contract.getInvestorSignature() != null;
        boolean startupSigned  = contract.getStartupSignature() != null;

        if (investorSigned && startupSigned) {
            contract.setStatus(ContractStatus.BOTH_SIGNED);
        } else if (investorSigned) {
            contract.setStatus(ContractStatus.INVESTOR_SIGNED);
        } else {
            contract.setStatus(ContractStatus.STARTUP_SIGNED);
        }

        return toResponse(contractRepository.save(contract));
    }

    @Override
    public ContractResponse validate(Long contractId, Long adminId, ValidateContractRequest request) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));

        if (contract.getStatus() != ContractStatus.BOTH_SIGNED) {
            throw new BadRequestException("Both parties must sign before admin validation");
        }

        contract.setAdminValidationSignature(request.getAdminValidationSignature());
        contract.setValidatedByAdminId(adminId);
        contract.setStatus(ContractStatus.VALIDATED);
        contract.setValidatedAt(LocalDateTime.now());
        return toResponse(contractRepository.save(contract));
    }

    @Override
    public ContractResponse getById(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + contractId));
        return toResponse(contract);
    }

    @Override
    public List<ContractResponse> getAll() {
        return contractRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<ContractResponse> getMyContracts(Long userId) {
        return Stream.concat(
                contractRepository.findByInvestorUserId(userId).stream(),
                contractRepository.findByStartupUserId(userId).stream()
        ).distinct().map(this::toResponse).toList();
    }

    private ContractResponse toResponse(Contract c) {
        ContractResponse r = new ContractResponse();
        r.setId(c.getId());
        r.setMeetupId(c.getMeetupId());
        r.setMatchId(c.getMatchId());
        r.setInvestorUserId(c.getInvestorUserId());
        r.setStartupUserId(c.getStartupUserId());
        r.setContractDetails(c.getContractDetails());
        r.setInvestorSignature(c.getInvestorSignature());
        r.setStartupSignature(c.getStartupSignature());
        r.setAdminValidationSignature(c.getAdminValidationSignature());
        r.setValidatedByAdminId(c.getValidatedByAdminId());
        r.setStatus(c.getStatus());
        r.setInvestorSignedAt(c.getInvestorSignedAt());
        r.setStartupSignedAt(c.getStartupSignedAt());
        r.setValidatedAt(c.getValidatedAt());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
