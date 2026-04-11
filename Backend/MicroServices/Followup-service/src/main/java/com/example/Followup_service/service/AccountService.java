package com.example.Followup_service.service;

import com.example.Followup_service.dto.request.DepositRequest;
import com.example.Followup_service.dto.request.InvestRequest;
import com.example.Followup_service.dto.response.AccountResponse;
import com.example.Followup_service.dto.response.TransactionResponse;

import java.util.List;

public interface AccountService {
    AccountResponse getOrCreateAccount(Long userId, String role);
    AccountResponse deposit(Long userId, String role, DepositRequest request);
    TransactionResponse invest(Long investorUserId, InvestRequest request);
    List<TransactionResponse> getMyTransactions(Long userId);
}
