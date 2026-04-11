package com.example.Followup_service.repository;

import com.example.Followup_service.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByFromUserId(Long fromUserId);
    List<Transaction> findByToUserId(Long toUserId);
    List<Transaction> findByMatchId(Long matchId);
}
