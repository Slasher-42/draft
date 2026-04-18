package com.example.Followup_service.implementation;

import com.example.Followup_service.dto.request.DepositRequest;
import com.example.Followup_service.dto.request.InvestRequest;
import com.example.Followup_service.dto.request.SettleRequest;
import com.example.Followup_service.dto.response.AccountResponse;
import com.example.Followup_service.dto.response.TransactionResponse;
import com.example.Followup_service.enums.TransactionStatus;
import com.example.Followup_service.exception.BadRequestException;
import com.example.Followup_service.exception.ResourceNotFoundException;
import com.example.Followup_service.model.Account;
import com.example.Followup_service.model.Meetup;
import com.example.Followup_service.model.Transaction;
import com.example.Followup_service.repository.AccountRepository;
import com.example.Followup_service.repository.MeetupRepository;
import com.example.Followup_service.repository.TransactionRepository;
import com.example.Followup_service.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final MeetupRepository meetupRepository;

    @Override
    public AccountResponse getOrCreateAccount(Long userId, String role) {
        Account account = accountRepository.findByUserId(userId).orElseGet(() -> {
            Account newAccount = new Account();
            newAccount.setUserId(userId);
            newAccount.setUserRole(role);
            newAccount.setBalance(BigDecimal.ZERO);
            return accountRepository.save(newAccount);
        });
        return toResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse deposit(Long userId, String role, DepositRequest request) {
        Account account = accountRepository.findByUserId(userId).orElseGet(() -> {
            Account newAccount = new Account();
            newAccount.setUserId(userId);
            newAccount.setUserRole(role);
            newAccount.setBalance(BigDecimal.ZERO);
            return accountRepository.save(newAccount);
        });

        account.setBalance(account.getBalance().add(request.getAmount()));
        account.setPaymentMethod(request.getPaymentMethod());
        return toResponse(accountRepository.save(account));
    }

    @Override
    @Transactional
    public TransactionResponse invest(Long investorUserId, InvestRequest request) {
        List<Meetup> meetups = meetupRepository.findByMatchId(request.getMatchId());
        Meetup meetup = meetups.stream()
                .filter(m -> m.getInvestorUserId().equals(investorUserId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No meetup found for matchId " + request.getMatchId() + " and this investor"));

        Long startupUserId = meetup.getStartupUserId();

        Account investorAccount = accountRepository.findByUserId(investorUserId)
                .orElseThrow(() -> new BadRequestException("Investor account not found. Please deposit funds first."));

        if (investorAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance. Available: " + investorAccount.getBalance());
        }

        Account startupAccount = accountRepository.findByUserId(startupUserId).orElseGet(() -> {
            Account a = new Account();
            a.setUserId(startupUserId);
            a.setUserRole("STARTUP");
            a.setBalance(BigDecimal.ZERO);
            return accountRepository.save(a);
        });

        investorAccount.setBalance(investorAccount.getBalance().subtract(request.getAmount()));
        startupAccount.setBalance(startupAccount.getBalance().add(request.getAmount()));

        accountRepository.save(investorAccount);
        accountRepository.save(startupAccount);

        Transaction tx = new Transaction();
        tx.setFromUserId(investorUserId);
        tx.setToUserId(startupUserId);
        tx.setMatchId(request.getMatchId());
        tx.setAmount(request.getAmount());
        tx.setDescription(request.getDescription() != null ? request.getDescription()
                : "Investment transfer for match " + request.getMatchId());
        tx.setStatus(TransactionStatus.COMPLETED);

        return toTxResponse(transactionRepository.save(tx));
    }

    @Override
    @Transactional
    public TransactionResponse settle(Long investorUserId, SettleRequest request) {
        Account account = accountRepository.findByUserId(investorUserId)
                .orElseThrow(() -> new BadRequestException("Account not found"));

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance. Available: " + account.getBalance());
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        Transaction tx = new Transaction();
        tx.setFromUserId(investorUserId);
        tx.setToUserId(0L);
        tx.setMatchId(0L);
        tx.setAmount(request.getAmount());
        tx.setDescription("Settlement to account " + request.getAccountNumber());
        tx.setStatus(TransactionStatus.COMPLETED);

        return toTxResponse(transactionRepository.save(tx));
    }

    @Override
    public List<TransactionResponse> getMyTransactions(Long userId) {
        return Stream.concat(
                transactionRepository.findByFromUserId(userId).stream(),
                transactionRepository.findByToUserId(userId).stream()
        ).distinct().map(this::toTxResponse).toList();
    }

    private AccountResponse toResponse(Account a) {
        AccountResponse r = new AccountResponse();
        r.setId(a.getId());
        r.setUserId(a.getUserId());
        r.setUserRole(a.getUserRole());
        r.setBalance(a.getBalance());
        r.setPaymentMethod(a.getPaymentMethod());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }

    private TransactionResponse toTxResponse(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setFromUserId(t.getFromUserId());
        r.setToUserId(t.getToUserId());
        r.setMatchId(t.getMatchId());
        r.setContractId(t.getContractId());
        r.setAmount(t.getAmount());
        r.setDescription(t.getDescription());
        r.setStatus(t.getStatus());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }
}
