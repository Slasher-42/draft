package com.example.UserManagement.MicroService.repository;

import com.example.UserManagement.MicroService.enums.RoleType;
import com.example.UserManagement.MicroService.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    List<User> findByRoleName(RoleType roleName);
}