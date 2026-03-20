package com.example.UserManagement.MicroService.repository;

import com.example.UserManagement.MicroService.model.StartupProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StartupProfileRepository extends JpaRepository<StartupProfile, Long> {
    Optional<StartupProfile> findByUserId(Long userId);
}