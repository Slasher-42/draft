package com.example.UserManagement.MicroService.repository;

import com.example.UserManagement.MicroService.enums.RoleType;
import com.example.UserManagement.MicroService.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}