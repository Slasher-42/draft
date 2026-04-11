package com.example.Followup_service.controller;

import com.example.Followup_service.dto.request.DepositRequest;
import com.example.Followup_service.dto.request.InvestRequest;
import com.example.Followup_service.dto.response.AccountResponse;
import com.example.Followup_service.dto.response.ApiResponse;
import com.example.Followup_service.dto.response.TransactionResponse;
import com.example.Followup_service.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/followup/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AccountResponse>> getMyAccount(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "");
        return ResponseEntity.ok(new ApiResponse<>(true, "Account fetched",
                accountService.getOrCreateAccount(userId, role)));
    }

    @PostMapping("/deposit")
    @PreAuthorize("hasAuthority('ROLE_INVESTOR')")
    public ResponseEntity<ApiResponse<AccountResponse>> deposit(
            Authentication auth,
            @Valid @RequestBody DepositRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Deposit successful",
                accountService.deposit(userId, "INVESTOR", request)));
    }

    @PostMapping("/invest")
    @PreAuthorize("hasAuthority('ROLE_INVESTOR')")
    public ResponseEntity<ApiResponse<TransactionResponse>> invest(
            Authentication auth,
            @Valid @RequestBody InvestRequest request) {
        Long investorUserId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Investment transferred successfully",
                accountService.invest(investorUserId, request)));
    }

    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getMyTransactions(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Transactions fetched",
                accountService.getMyTransactions(userId)));
    }
}
