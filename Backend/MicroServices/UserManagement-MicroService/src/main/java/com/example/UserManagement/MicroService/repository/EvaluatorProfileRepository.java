package com.example.UserManagement.MicroService.repository;

import com.example.UserManagement.MicroService.model.EvaluatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluatorProfileRepository extends JpaRepository<EvaluatorProfile, Long> {
    Optional<EvaluatorProfile> findByUserId(Long userId);
}